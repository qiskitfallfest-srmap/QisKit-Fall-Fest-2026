import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transactionReference, notes } = body;

    const trimmedRef = (transactionReference || '').trim();
    if (!trimmedRef || trimmedRef.length < 4) {
      return NextResponse.json(
        { error: 'Please enter a valid UTI (Unique Transaction ID) or UPI Reference Number.' },
        { status: 400 }
      );
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // Verify candidate is academically eligible
    const eligibility = await checkCertificateEligibility(normalizedEmail);
    if (!eligibility.eligible && !eligibility.alreadyIssued) {
      return NextResponse.json(
        { error: 'You have not yet completed all academic video lectures and quizzes.' },
        { status: 403 }
      );
    }

    // Fetch live price from certificate_config
    const { data: configRow } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'certificate_config')
      .maybeSingle();

    const certConfig = configRow?.value || {};
    const amountInr = certConfig.price_inr ?? null;

    // Check if reference already exists for another email
    const { data: existingRef } = await supabase
      .from('certificate_payment_submissions')
      .select('id, user_email')
      .eq('transaction_reference', trimmedRef)
      .maybeSingle();

    if (existingRef && existingRef.user_email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: 'This transaction reference number has already been submitted by another candidate.' },
        { status: 409 }
      );
    }

    // Insert or upsert candidate payment submission
    const { data: submission, error: insertError } = await supabase
      .from('certificate_payment_submissions')
      .upsert(
        {
          user_email: normalizedEmail,
          candidate_name: session.fullName || session.email,
          transaction_reference: trimmedRef,
          payment_mode: 'upi_qr',
          amount_inr: amountInr,
          status: 'pending_verification',
          admin_notes: notes ? String(notes).slice(0, 500) : null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'transaction_reference' }
      )
      .select('*')
      .single();

    if (insertError) {
      console.error('[UTI Submission Error]:', insertError);
      return NextResponse.json(
        { error: 'Failed to record transaction reference. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction reference submitted successfully for verification.',
      submission,
    });
  } catch (err: any) {
    console.error('[Submit UTI Exception]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing payment submission.' },
      { status: 500 }
    );
  }
}
