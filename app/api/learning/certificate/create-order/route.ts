import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import {
  createOrder,
  CERTIFICATE_PRICE_PAISE,
  CERTIFICATE_PRICE_INR,
  razorpayInstance,
} from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Strict Server-Side Zero-Trust Eligibility Check
    const eligibility = await checkCertificateEligibility(session.email);

    if (eligibility.alreadyIssued && eligibility.issuedCertificate) {
      return NextResponse.json({
        alreadyIssued: true,
        certificate: eligibility.issuedCertificate,
      });
    }

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error:
            'You are not yet eligible to obtain an official certificate. Please complete all 6 sessions, quizzes, and 3 daily challenges.',
          missingTasks: eligibility.missingTasks,
        },
        { status: 403 }
      );
    }

    const receipt = `rcpt_${session.email.split('@')[0].slice(0, 10)}_${Date.now().toString().slice(-6)}`;
    const idempotencyKey = crypto.randomUUID();

    let razorpayOrderId: string;

    if (razorpayInstance) {
      // 2. Production / Test Mode via Razorpay SDK
      const order = await createOrder({
        amountPaise: CERTIFICATE_PRICE_PAISE,
        receipt,
        notes: {
          userEmail: session.email,
          userName: session.fullName,
          course: 'IBM Quantum Masterclass 2026',
        },
      });
      razorpayOrderId = order.id;
    } else {
      // 3. Fallback Test Mode when Razorpay credentials are not yet injected in local dev
      razorpayOrderId = `order_test_${crypto.randomBytes(8).toString('hex')}`;
    }

    // 4. Record order in certificate_orders table
    const { data: orderRecord, error: dbError } = await supabaseAdmin
      .from('certificate_orders')
      .insert({
        user_email: session.email.toLowerCase().trim(),
        razorpay_order_id: razorpayOrderId,
        amount_paise: CERTIFICATE_PRICE_PAISE,
        currency: 'INR',
        status: 'created',
        idempotency_key: idempotencyKey,
        metadata: {
          receipt,
          candidateName: session.fullName,
          averageQuizScore: eligibility.averageQuizScore,
        },
      })
      .select('id, razorpay_order_id, amount_paise, currency')
      .single();

    if (dbError) {
      console.error('[Create Order DB Error]:', dbError);
      return NextResponse.json(
        { error: 'Failed to record certificate order in database' },
        { status: 500 }
      );
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_placeholder';

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: CERTIFICATE_PRICE_PAISE,
      amountInr: CERTIFICATE_PRICE_INR,
      currency: 'INR',
      keyId,
      user: {
        name: session.fullName,
        email: session.email,
      },
    });
  } catch (err: any) {
    console.error('[Create Certificate Order Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initialize payment order' },
      { status: 500 }
    );
  }
}
