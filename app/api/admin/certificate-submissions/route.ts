import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { mintCertificate, checkCertificateEligibility } from '@/lib/certificate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { data: submissions, error } = await supabase
      .from('certificate_payment_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
    });
  } catch (err: any) {
    console.error('[Admin Submissions Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch certificate submissions.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { submissionId, action, adminNotes } = body;

    if (!submissionId || !action) {
      return NextResponse.json(
        { error: 'submissionId and action are required.' },
        { status: 400 }
      );
    }

    const { data: submission, error: fetchErr } = await supabase
      .from('certificate_payment_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchErr || !submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    if (action === 'verify') {
      const eligibility = await checkCertificateEligibility(submission.user_email);
      let certRecordId = submission.certificate_id;

      if (!certRecordId) {
        if (eligibility.alreadyIssued && eligibility.issuedCertificate) {
          certRecordId = eligibility.issuedCertificate.id;
        } else {
          // Mint the certificate
          const mintResult = await mintCertificate({
            userEmail: submission.user_email,
            recipientName: submission.candidate_name || submission.user_email,
            orderId: null,
            averageScore: eligibility.averageQuizScore || 85,
          });
          certRecordId = mintResult.certRecord.id;
        }
      }

      const { data: updatedSub, error: updateErr } = await supabase
        .from('certificate_payment_submissions')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          certificate_id: certRecordId,
          admin_notes: adminNotes || submission.admin_notes,
        })
        .eq('id', submissionId)
        .select('*')
        .single();

      if (updateErr) throw updateErr;

      return NextResponse.json({
        success: true,
        message: 'Payment verified and official certificate minted successfully.',
        submission: updatedSub,
      });
    }

    if (action === 'reject') {
      const { data: updatedSub, error: updateErr } = await supabase
        .from('certificate_payment_submissions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes || 'Payment verification rejected by administrator.',
        })
        .eq('id', submissionId)
        .select('*')
        .single();

      if (updateErr) throw updateErr;

      return NextResponse.json({
        success: true,
        message: 'Submission status updated to rejected.',
        submission: updatedSub,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Update Submission Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update certificate submission.' },
      { status: 500 }
    );
  }
}
