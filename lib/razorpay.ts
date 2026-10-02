import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId =
  process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Singleton Razorpay instance
export const razorpayInstance =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

export const CERTIFICATE_PRICE_INR = parseInt(
  process.env.CERTIFICATE_PRICE_INR || '499',
  10
);
export const CERTIFICATE_PRICE_PAISE = CERTIFICATE_PRICE_INR * 100;

/**
 * Creates a Razorpay Order
 */
export async function createOrder({
  amountPaise,
  receipt,
  notes = {},
}: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (!razorpayInstance) {
    throw new Error(
      'Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  const order = await razorpayInstance.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
  });

  return order;
}

/**
 * Verifies Razorpay Payment Signature (HMAC SHA-256)
 * expected = HMAC-SHA256(orderId + "|" + paymentId, secret)
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!keySecret) {
    console.error('[Razorpay] Cannot verify signature: RAZORPAY_KEY_SECRET is missing.');
    return false;
  }

  try {
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (err) {
    console.error('[Razorpay] Signature verification error:', err);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook Signature (HMAC SHA-256)
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const secret = webhookSecret || keySecret;
  if (!secret) {
    console.error('[Razorpay Webhook] Missing webhook secret.');
    return false;
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (err) {
    console.error('[Razorpay Webhook] Verification error:', err);
    return false;
  }
}
