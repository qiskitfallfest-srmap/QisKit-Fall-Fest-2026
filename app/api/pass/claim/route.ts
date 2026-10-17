import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpciyrodeppqpkwqblpk.supabase.co';
const RECEIPT_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/media/pass-receipts/`;

// Easebuzz transaction IDs are alphanumeric (e.g. E26101518BKHN3)
const TXN_PATTERN = /^[A-Z0-9]{6,40}$/;

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

    // 1. Guardrail: Hackathon participants use the Flagship Pass track instead.
    // limit(1) rather than maybeSingle(): duplicate rows must not silently bypass the check.
    const [teamMemberRes, teamLeadRes] = await Promise.all([
      supabaseAdmin
        .from('team_members')
        .select('team_id')
        .ilike('email', normalizedEmail)
        .eq('status', 'accepted')
        .limit(1),
      supabaseAdmin
        .from('hackathon_teams')
        .select('id')
        .ilike('lead_email', normalizedEmail)
        .limit(1),
    ]);

    if (teamMemberRes.data?.length || teamLeadRes.data?.length) {
      return NextResponse.json(
        {
          error:
            'You are registered as an active Hackathon participant. Please do not submit the ₹99 General Pass. Selected Phase 2 finalist teams will receive instructions for the ₹499 Flagship Pass.',
        },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { transactionReference, receiptUrl, bankReference } = body;

    const normalizedTxn = String(transactionReference || '')
      .replace(/\s+/g, '')
      .toUpperCase();
    const trimmedReceipt = String(receiptUrl || '').trim();
    const trimmedBankRef = String(bankReference || '').replace(/\s+/g, '').slice(0, 40) || null;

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

    // 3. Transaction ID must not belong to another attendee
    const { data: txnOwners } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id, user_email')
      .ilike('transaction_reference', normalizedTxn)
      .limit(1);

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
      amount_inr: 99.0,
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
