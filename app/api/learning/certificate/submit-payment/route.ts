import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import { resolveCertificateName } from '@/lib/certificate-name';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import {
  CERTIFICATE_FEE_INR,
  TXN_FORMAT_HINT,
  TXN_PATTERN,
  isCertificateDeliveryMode,
  normalizeBankRef,
  normalizeTxn,
  receiptUrlPrefix,
} from '@/lib/payments';

export const dynamic = 'force-dynamic';

const RECEIPT_URL_PREFIX = receiptUrlPrefix('certificate-receipts');

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const normalizedTxn = normalizeTxn(body.transactionReference);
    const trimmedReceipt = String(body.receiptUrl || '').trim();
    const trimmedBankRef = normalizeBankRef(body.bankReference);
    const deliveryMode = String(body.deliveryMode || '');

    if (!isCertificateDeliveryMode(deliveryMode)) {
      return NextResponse.json(
        { error: 'Choose how you want to receive the certificate: printed at the valedictory ceremony, by email, or both.' },
        { status: 400 }
      );
    }

    if (!TXN_PATTERN.test(normalizedTxn)) {
      return NextResponse.json({ error: TXN_FORMAT_HINT }, { status: 400 });
    }

    if (!trimmedReceipt.startsWith(RECEIPT_URL_PREFIX)) {
      return NextResponse.json(
        { error: 'Please upload your receipt using the upload button (PDF or screenshot).' },
        { status: 400 }
      );
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // 1. Payment is only accepted once the course is complete
    const eligibility = await checkCertificateEligibility(normalizedEmail);
    if (eligibility.alreadyIssued) {
      return NextResponse.json(
        { error: 'Your certificate has already been issued. No payment is needed.' },
        { status: 409 }
      );
    }
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: 'Complete all video lectures and quizzes before submitting the certificate fee.' },
        { status: 403 }
      );
    }

    // 2. Transaction ID must be unused: not by another candidate, not by any offline pass
    const [{ data: certTxnRows }, { data: passTxnRows }] = await Promise.all([
      supabase
        .from('certificate_payment_submissions')
        .select('id, user_email')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
      supabase
        .from('festival_pass_claims')
        .select('id')
        .ilike('transaction_reference', normalizedTxn)
        .limit(1),
    ]);

    if (passTxnRows?.length) {
      return NextResponse.json(
        {
          error:
            'This Easebuzz Transaction ID was already used for an On-Campus Pass. The pass and the certificate are separate ₹99 payments; please make a new payment for the certificate.',
        },
        { status: 409 }
      );
    }

    const txnOwner = certTxnRows?.[0];
    if (txnOwner && txnOwner.user_email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: 'This Easebuzz Transaction ID has already been submitted by another candidate.' },
        { status: 409 }
      );
    }

    // 3. One submission per candidate: resubmission updates the existing row
    const { data: existingRows } = await supabase
      .from('certificate_payment_submissions')
      .select('id, status')
      .ilike('user_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1);
    const existing = existingRows?.[0];

    if (existing?.status === 'verified') {
      return NextResponse.json(
        { error: 'Your certificate payment is already verified.' },
        { status: 409 }
      );
    }

    const { data: regRows } = await supabase
      .from('registrations')
      .select('institution, phone')
      .ilike('email', normalizedEmail)
      .limit(1);
    const reg = regRows?.[0];

    const fields = {
      user_email: normalizedEmail,
      candidate_name: await resolveCertificateName(normalizedEmail, session.fullName || normalizedEmail.split('@')[0]),
      transaction_reference: normalizedTxn,
      bank_reference: trimmedBankRef,
      receipt_url: trimmedReceipt,
      payment_mode: 'easebuzz',
      amount_inr: CERTIFICATE_FEE_INR,
      delivery_mode: deliveryMode,
      status: 'pending_verification',
      admin_notes: null,
      institution: reg?.institution || null,
      contact_phone: reg?.phone || null,
      updated_at: new Date().toISOString(),
    };

    const { data: submission, error: saveError } = existing
      ? await supabase
          .from('certificate_payment_submissions')
          .update(fields)
          .eq('id', existing.id)
          .select('*')
          .single()
      : await supabase.from('certificate_payment_submissions').insert(fields).select('*').single();

    if (saveError) {
      console.error('[Certificate Payment Submission Error]:', saveError);
      if (saveError.code === '23505') {
        return NextResponse.json(
          { error: 'This Easebuzz Transaction ID has already been registered.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to record your payment. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt submitted. Your certificate will be issued once the payment is verified.',
      submission,
    });
  } catch (err: any) {
    console.error('[Certificate Payment Submission Exception]:', err);
    return NextResponse.json(
      { error: 'Internal server error processing payment submission.' },
      { status: 500 }
    );
  }
}
