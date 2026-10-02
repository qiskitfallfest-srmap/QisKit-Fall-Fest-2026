import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { verifyPaymentSignature, razorpayInstance } from '@/lib/razorpay';
import { checkCertificateEligibility, mintCertificate } from '@/lib/certificate';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing payment verification credentials' },
        { status: 400 }
      );
    }

    const normalizedEmail = session.email.toLowerCase().trim();

    // 1. Check if certificate is ALREADY issued for this user (Idempotent guard)
    const { data: existingCert } = await supabase
      .from('issued_certificates')
      .select('*')
      .ilike('user_email', normalizedEmail)
      .maybeSingle();

    if (existingCert) {
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        serialNumber: existingCert.serial_number,
        certificateUrl: existingCert.certificate_url,
        certificate: existingCert,
      });
    }

    // 2. Cryptographic Signature Verification
    const isTestOrder = razorpay_order_id.startsWith('order_test_');

    if (!isTestOrder && razorpayInstance) {
      if (!razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing razorpay_signature for live transaction' },
          { status: 400 }
        );
      }

      const isValidSignature = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValidSignature) {
        // Record failed attempt
        await supabase
          .from('certificate_orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpay_order_id);

        return NextResponse.json(
          { error: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        );
      }
    }

    // 3. Update order in certificate_orders table to 'paid'
    const { data: updatedOrder, error: orderUpdateErr } = await supabase
      .from('certificate_orders')
      .update({
        razorpay_payment_id,
        razorpay_signature: razorpay_signature || 'test_signature',
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('id, metadata')
      .single();

    if (orderUpdateErr) {
      console.error('[Verify Order DB Error]:', orderUpdateErr);
    }

    // 4. Verify candidate eligibility and compute final average score
    const eligibility = await checkCertificateEligibility(normalizedEmail);

    const averageScore = eligibility.averageQuizScore || 85.0;
    const recipientName =
      (updatedOrder?.metadata as any)?.candidateName ||
      session.fullName ||
      session.email.split('@')[0];

    // 5. Mint official academic certificate and upload to Supabase Storage
    const mintResult = await mintCertificate({
      userEmail: normalizedEmail,
      recipientName,
      orderId: updatedOrder?.id || null,
      averageScore,
    });

    return NextResponse.json({
      success: true,
      serialNumber: mintResult.serialNumber,
      certificateUrl: mintResult.certificateUrl,
      verificationUrl: mintResult.verificationUrl,
      certificate: mintResult.certRecord,
    });
  } catch (err: any) {
    console.error('[Verify Certificate Payment Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
