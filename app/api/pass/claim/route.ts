import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  PASS_FEE_INR,
  TXN_PATTERN,
  normalizeBankRef,
  normalizeTxn,
  receiptUrlPrefix,
} from '@/lib/payments';
import { getHackathonPassContext, RESULTS_EXPECTED_LABEL } from '@/lib/hackathon-pass';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const RECEIPT_URL_PREFIX = receiptUrlPrefix('pass-receipts');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Please sign in with Google to claim your on-campus pass.' },
        { status: 401 }
      );
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // 1. Guardrail: hackathon teams wait for Phase 1 results. Shortlisted teams take the
    // ₹499 Flagship Pass; teams not shortlisted may buy the General Pass once results are out.
    const hackathon = await getHackathonPassContext(normalizedEmail);

    if (hackathon && hackathon.outcome === 'pending') {
      return NextResponse.json(
        {
          error: `Your team is in Hackathon Phase 1. Results are announced by ${RESULTS_EXPECTED_LABEL}; your pass options will appear here then.`,
        },
        { status: 403 }
      );
    }

    if (hackathon && hackathon.outcome === 'shortlisted') {
      return NextResponse.json(
        {
          error:
            'Your team is shortlisted for Phase 2. Please do not buy the ₹99 General Pass; you will receive instructions for the ₹499 Flagship Pass.',
        },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { transactionReference, receiptUrl, bankReference } = body;

    const normalizedTxn = normalizeTxn(transactionReference);
    const trimmedReceipt = String(receiptUrl || '').trim();
    const trimmedBankRef = normalizeBankRef(bankReference);

    if (!TXN_PATTERN.test(normalizedTxn)) {
      return NextResponse.json(
        { error: 'Please enter a valid Easebuzz Transaction ID (letters and digits, e.g. E26101518BKHN3).' },
        { status: 400 }
      );
    }

    if (!trimmedReceipt.startsWith(RECEIPT_URL_PREFIX)) {
      return NextResponse.json(
        { error: 'Please upload your receipt using the upload button (PDF or screenshot).' },
        { status: 400 }
      );
    }

    // 3. Transaction ID must not belong to another attendee, or to a certificate purchase
    const [{ data: txnOwners }, { data: certTxnRows }] = await Promise.all([
      supabaseAdmin
        .from('festival_pass_claims')
        .select('id, user_email')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
      supabaseAdmin
        .from('certificate_payment_submissions')
        .select('id')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
    ]);

    if (certTxnRows?.length) {
      return NextResponse.json(
        {
          error:
            'This Easebuzz Transaction ID was already submitted for a certificate. The pass and the certificate are separate ₹99 payments; please pay again for the pass.',
        },
        { status: 409 }
      );
    }

    const txnOwner = txnOwners?.[0];
    if (txnOwner && txnOwner.user_email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        {
          error:
            'This Easebuzz Transaction ID has already been registered by another attendee. If this is an error, please contact the organizing committee.',
        },
        { status: 409 }
      );
    }

    // 4. One claim per attendee: resubmission updates the existing row
    const { data: existingClaims } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id, status, qr_code_token')
      .eq('user_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    const existingClaim = existingClaims?.[0];

    if (existingClaim?.status === 'verified') {
      return NextResponse.json(
        { error: 'Your pass is already verified. No further action is needed.' },
        { status: 409 }
      );
    }

    // 5. Institution & phone from registration, if available
    const { data: regRows } = await supabaseAdmin
      .from('registrations')
      .select('institution, phone')
      .ilike('email', normalizedEmail)
      .limit(1);
    const reg = regRows?.[0];

    const claimFields = {
      user_email: normalizedEmail,
      user_name: session.fullName || normalizedEmail.split('@')[0],
      pass_tier: 'general_offline',
      transaction_reference: normalizedTxn,
      bank_reference: trimmedBankRef,
      receipt_url: trimmedReceipt,
      amount_inr: PASS_FEE_INR,
      status: 'claimed_provisional',
      institution: reg?.institution || 'SRM University-AP',
      contact_phone: reg?.phone || null,
      updated_at: new Date().toISOString(),
    };

    const { data: savedPass, error: saveError } = existingClaim
      ? await supabaseAdmin
          .from('festival_pass_claims')
          .update(claimFields)
          .eq('id', existingClaim.id)
          .select('*')
          .single()
      : await supabaseAdmin
          .from('festival_pass_claims')
          .insert({
            ...claimFields,
            qr_code_token: `qff26_${crypto.randomBytes(16).toString('hex')}`,
          })
          .select('*')
          .single();

    if (saveError) {
      console.error('[Pass Claim Database Error]:', saveError);
      // 23505 = unique violation (concurrent claim on the same transaction ID)
      if (saveError.code === '23505') {
        return NextResponse.json(
          { error: 'This Easebuzz Transaction ID has already been registered.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to record pass claim. Please check your details and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt submitted. Your pass is pending verification by the organizing team.',
      pass: savedPass,
    });
  } catch (err: any) {
    console.error('[Pass Claim Server Exception]:', err);
    return NextResponse.json({ error: 'Internal server error claiming pass.' }, { status: 500 });
  }
}
