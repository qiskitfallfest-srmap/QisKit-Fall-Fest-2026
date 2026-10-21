import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  FLAGSHIP_PASS_FEE_INR,
  PASS_FEE_INR,
  TXN_PATTERN,
  isCombinedFlagshipTxn,
  normalizeBankRef,
  normalizeTxn,
  receiptUrlPrefix,
} from '@/lib/payments';
import {
  getTeamFlagshipPaymentWindow,
  getHackathonPassContext,
  RESULTS_EXPECTED_LABEL,
} from '@/lib/hackathon-pass';
import { confirmOfferIfComplete } from '@/lib/phase2-waiting-room';
import { isSrmApParticipant } from '@/lib/participant-track';
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

    // 1. Guardrail: hackathon teams wait for Phase 1 results. Shortlisted members claim the
    // ₹499 Flagship Pass (window checked below); teams not shortlisted get the General Pass.
    const hackathon = await getHackathonPassContext(normalizedEmail);

    if (hackathon && hackathon.outcome === 'pending') {
      return NextResponse.json(
        {
          error:
            hackathon.phase2.stage === 'invited'
              ? 'Your team has a Phase 2 invitation. Your team lead must accept it before anyone pays.'
              : hackathon.phase2.stage === 'waitlisted'
                ? 'Your team is in the Phase 2 waiting room. Please do not pay yet; your pass options appear here once a decision is made.'
                : `Your team's Phase 1 result has not been released yet (expected from ${RESULTS_EXPECTED_LABEL}). Your pass options will appear here then.`,
        },
        { status: 403 }
      );
    }

    const isFlagship = hackathon?.outcome === 'shortlisted';

    // 2. Fetch existing claim and registration metadata
    const [{ data: existingClaims }, { data: regRows }] = await Promise.all([
      supabaseAdmin
        .from('festival_pass_claims')
        .select('id, status, qr_code_token')
        .eq('user_email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1),
      supabaseAdmin
        .from('registrations')
        .select('institution, phone')
        .ilike('email', normalizedEmail)
        .limit(1),
    ]);

    const existingClaim = existingClaims?.[0];
    const reg = regRows?.[0];
    const isSrmAp = isSrmApParticipant(normalizedEmail, reg?.institution);

    // 3. Parse request body
    const body = await request.json();
    const { transactionReference, receiptUrl, bankReference, isInstitutionalFreePass } = body;

    // 4. Handle SRM-AP Institutional Complimentary Pass (100% Free)
    if (isInstitutionalFreePass) {
      if (isFlagship) {
        return NextResponse.json(
          {
            error:
              'Institutional complimentary passes apply only to the General Offline Pass. Hackathon Phase 2 finalists require the Flagship Pass.',
          },
          { status: 403 }
        );
      }

      if (!isSrmAp) {
        return NextResponse.json(
          {
            error:
              'Institutional complimentary passes are reserved exclusively for SRM University-AP students. Please complete the General Pass payment on Easebuzz.',
          },
          { status: 403 }
        );
      }

      if (existingClaim?.status === 'verified') {
        return NextResponse.json(
          { error: 'Your pass is already verified. No further action is needed.' },
          { status: 409 }
        );
      }

      const freeTxn = `SRMAP-FREE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const claimFields = {
        user_email: normalizedEmail,
        user_name: session.fullName || normalizedEmail.split('@')[0],
        pass_tier: 'general_offline',
        transaction_reference: freeTxn,
        bank_reference: null,
        receipt_url: 'institutional://srmap.edu.in',
        amount_inr: 0,
        status: 'verified',
        institution: reg?.institution || 'SRM University AP',
        contact_phone: reg?.phone || null,
        admin_notes: 'SRM University-AP complimentary student pass',
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
        console.error('[Free Pass Database Error]:', saveError);
        return NextResponse.json(
          { error: 'Failed to issue complimentary pass. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Complimentary SRM-AP student pass issued. Show your QR badge at the registration desk.',
        pass: savedPass,
      });
    }

    // 5. Easebuzz Paid Pass Flow (General Pass for external attendees or Flagship Pass)
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

    // 6. Transaction ID must not belong to another attendee, or to a certificate purchase,
    // except a Flagship Pass the attendee bought together with their own certificate (₹598)
    const [{ data: txnOwners }, { data: certTxnRows }] = await Promise.all([
      supabaseAdmin
        .from('festival_pass_claims')
        .select('id, user_email')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
      supabaseAdmin
        .from('certificate_payment_submissions')
        .select('id, user_email')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
    ]);

    const certTxn = certTxnRows?.[0];
    if (
      certTxn &&
      !isCombinedFlagshipTxn(isFlagship ? 'flagship_offline' : 'general_offline', normalizedEmail, certTxn.user_email)
    ) {
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

    // New Flagship claims only inside the team's own payment window; correcting an existing claim stays allowed
    if (isFlagship && !existingClaim) {
      const paymentWindow = await getTeamFlagshipPaymentWindow(hackathon!.phase2);
      if (paymentWindow.status === 'not_open') {
        return NextResponse.json(
          {
            error:
              'The ₹499 Flagship Pass payment link is not published yet. It will appear on this card; your deadline is shown there.',
          },
          { status: 403 }
        );
      }
      if (paymentWindow.status === 'closed') {
        return NextResponse.json(
          {
            error: 'Your team’s Flagship Pass payment window has closed. Please contact the organizing committee.',
          },
          { status: 403 }
        );
      }
    }

    // The team lead pays last, after every accepted teammate has submitted a receipt
    if (isFlagship && hackathon!.isLead && hackathon!.phase2.payment && !hackathon!.phase2.payment.allOthersPaid) {
      const { othersPaid, othersTotal } = hackathon!.phase2.payment;
      return NextResponse.json(
        {
          error: `As team lead you pay last. ${othersPaid} of ${othersTotal} teammates have submitted their receipts so far.`,
        },
        { status: 403 }
      );
    }

    if (existingClaim?.status === 'verified') {
      return NextResponse.json(
        { error: 'Your pass is already verified. No further action is needed.' },
        { status: 409 }
      );
    }

    const claimFields = {
      user_email: normalizedEmail,
      user_name: session.fullName || normalizedEmail.split('@')[0],
      pass_tier: isFlagship ? 'flagship_offline' : 'general_offline',
      transaction_reference: normalizedTxn,
      bank_reference: trimmedBankRef,
      receipt_url: trimmedReceipt,
      amount_inr: isFlagship ? FLAGSHIP_PASS_FEE_INR : PASS_FEE_INR,
      status: 'claimed_provisional',
      institution: reg?.institution || 'SRM University AP',
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

    // Lead's receipt completes the team: mark the Phase 2 desk confirmed
    if (isFlagship && hackathon!.isLead) {
      await confirmOfferIfComplete(hackathon!.teamId, normalizedEmail).catch((err) =>
        console.error('[Pass Claim] Failed to confirm Phase 2 offer:', err)
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
