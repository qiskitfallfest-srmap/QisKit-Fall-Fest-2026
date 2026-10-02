import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { mintCertificate } from '@/lib/certificate';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature with Razorpay secret
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn('[Razorpay Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const userEmail = paymentEntity?.notes?.userEmail;
      const userName = paymentEntity?.notes?.userName;

      if (!orderId) {
        return NextResponse.json({ received: true, ignored: 'No order_id in event' });
      }

      // Check if order exists in database
      const { data: order } = await supabaseAdmin
        .from('certificate_orders')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (!order) {
        return NextResponse.json({ received: true, ignored: 'Unknown order_id' });
      }

      // Idempotency check: if order is already marked 'paid', skip minting
      if (order.status === 'paid') {
        return NextResponse.json({ received: true, status: 'already_paid' });
      }

      // Mark order paid
      await supabaseAdmin
        .from('certificate_orders')
        .update({
          status: 'paid',
          razorpay_payment_id: paymentId || order.razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Check if certificate was already minted
      const recipientEmail = (userEmail || order.user_email).toLowerCase().trim();
      const { data: existingCert } = await supabaseAdmin
        .from('issued_certificates')
        .select('id')
        .ilike('user_email', recipientEmail)
        .maybeSingle();

      if (!existingCert) {
        const averageScore = (order.metadata as any)?.averageQuizScore || 85.0;
        const recipientName =
          userName ||
          (order.metadata as any)?.candidateName ||
          recipientEmail.split('@')[0];

        await mintCertificate({
          userEmail: recipientEmail,
          recipientName,
          orderId: order.id,
          averageScore,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
