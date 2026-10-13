import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { checkCertificateEligibility } from '@/lib/certificate';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await checkCertificateEligibility(session.email);

    // Fetch dynamic certificate configuration from platform_config
    const { data: configRow } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'certificate_config')
      .maybeSingle();

    const certConfig = configRow?.value || {};

    // Check if candidate already submitted a UTI payment record
    const { data: existingSubmission } = await supabase
      .from('certificate_payment_submissions')
      .select('*')
      .ilike('user_email', session.email.trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json(
      {
        success: true,
        priceInr: certConfig.price_inr ?? null,
        feeLabel:
          certConfig.fee_label ||
          (certConfig.price_inr ? `₹${certConfig.price_inr} INR` : 'Updating Soon / To be announced'),
        paymentStatus: certConfig.payment_status || 'updating_soon',
        upiId: certConfig.upi_id || '',
        bankName: certConfig.bank_name || '',
        accountNumber: certConfig.account_number || '',
        ifscCode: certConfig.ifsc_code || '',
        accountHolder: certConfig.account_holder || 'SRM University-AP',
        qrCodeUrl: certConfig.qr_code_url || '',
        noticeTitle:
          certConfig.notice_title || 'Payment Gateway & Official QR Code Updating Soon',
        noticeMessage:
          certConfig.notice_message ||
          'The official UPI payment QR code and bank account details for certificate issuance are currently being finalized by the organizing team. Once released, you will be able to scan the QR code to complete the fee transfer and submit your Unique Transaction ID (UTI) / UPI Reference Number below.',
        paymentSubmission: existingSubmission || null,
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
