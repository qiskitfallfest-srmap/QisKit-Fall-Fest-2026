import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import { CERTIFICATE_PRICE_INR } from '@/lib/razorpay';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await checkCertificateEligibility(session.email);
    return NextResponse.json({
      success: true,
      priceInr: CERTIFICATE_PRICE_INR,
      ...result,
    });
  } catch (err: any) {
    console.error('[Certificate Eligibility Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to check certificate eligibility' },
      { status: 500 }
    );
  }
}
