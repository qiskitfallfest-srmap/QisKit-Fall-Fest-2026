import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CERTIFICATE_FEE_INR, EASEBUZZ_GATEWAY_URL } from '@/lib/payments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const normalizedEmail = session.email.trim().toLowerCase();
    const result = await checkCertificateEligibility(normalizedEmail);

    // Service client: RLS on this table keys off the Supabase JWT, which server routes do not carry
    const { data: submissionRows } = await supabaseAdmin
      .from('certificate_payment_submissions')
      .select(
        'id, transaction_reference, bank_reference, receipt_url, amount_inr, status, admin_notes, delivery_mode, delivered_at, created_at'
      )
      .ilike('user_email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        feeInr: CERTIFICATE_FEE_INR,
        gatewayUrl: EASEBUZZ_GATEWAY_URL,
        paymentSubmission: submissionRows?.[0] || null,
        userEmail: session.email,
        userName: session.fullName || session.email,
        ...result,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    console.error('[Certificate Eligibility Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to check certificate eligibility' },
      { status: 500 }
    );
  }
}
