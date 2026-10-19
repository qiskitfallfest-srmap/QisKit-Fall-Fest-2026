import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkCertificateEligibility, mintCertificate } from '@/lib/certificate';
import { resolveCertificateName } from '@/lib/certificate-name';
import { COMBINED_FLAGSHIP_CERTIFICATE_INR, isCombinedFlagshipTxn } from '@/lib/payments';

export const dynamic = 'force-dynamic';

/**
 * Admin review queue for the Easebuzz purchases.
 *   type=pass         -> festival_pass_claims; tier=general_offline (₹99) or flagship_offline (₹499)
 *   type=certificate  -> certificate_payment_submissions (masterclass certificate)
 * Both are normalized to one PaymentItem shape so the console renders a single queue.
 */

type PaymentType = 'pass' | 'certificate';
type ReviewStatus = 'pending' | 'verified' | 'rejected';
type PassTier = 'general_offline' | 'flagship_offline';
const PASS_TIERS: PassTier[] = ['general_offline', 'flagship_offline'];

const PASS_STATUS: Record<ReviewStatus, string> = {
  pending: 'claimed_provisional',
  verified: 'verified',
  rejected: 'rejected',
};
const CERT_STATUS: Record<ReviewStatus, string> = {
  pending: 'pending_verification',
  verified: 'verified',
  rejected: 'rejected',
};

function toReviewStatus(raw: string): ReviewStatus {
  if (raw === 'verified') return 'verified';
  if (raw === 'rejected') return 'rejected';
  return 'pending';
}

function sanitizeSearch(value: string | null): string {
  // Strip characters that carry meaning inside a PostgREST .or() filter string
  return (value || '').replace(/[^a-zA-Z0-9@._+ -]/g, '').trim().slice(0, 100);
}

async function requireAdmin() {
  const session = await getServerSession();
  return session && session.isAdmin ? session : null;
}

type Filters = Record<string, string | boolean>;

async function countBy(table: string, filters: Filters) {
  let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
  const { count } = await query;
  return count || 0;
}

// Sum of amount_inr over verified rows: a Flagship Pass is ₹499, so "collected" cannot be count x ₹99
async function sumVerified(table: string, filters: Filters) {
  let query = supabaseAdmin.from(table).select('amount_inr').eq('status', 'verified');
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
  const { data } = await query.limit(10000);
  return (data || []).reduce((sum: number, r: any) => sum + (Number(r.amount_inr) || 0), 0);
}

async function passMetrics(tier: PassTier) {
  const t = { pass_tier: tier };
  const [pending, verified, rejected, checkedIn, collected] = await Promise.all([
    countBy('festival_pass_claims', { ...t, status: PASS_STATUS.pending }),
    countBy('festival_pass_claims', { ...t, status: PASS_STATUS.verified }),
    countBy('festival_pass_claims', { ...t, status: PASS_STATUS.rejected }),
    countBy('festival_pass_claims', { ...t, checked_in: true }),
    sumVerified('festival_pass_claims', t),
  ]);
  return { pending, verified, rejected, checkedIn, collected };
}

async function loadMetrics() {
  const [general, flagship, certPending, certVerified, certRejected, certCollected, certToDeliverRes] =
    await Promise.all([
      passMetrics('general_offline'),
      passMetrics('flagship_offline'),
      countBy('certificate_payment_submissions', { status: CERT_STATUS.pending }),
      countBy('certificate_payment_submissions', { status: CERT_STATUS.verified }),
      countBy('certificate_payment_submissions', { status: CERT_STATUS.rejected }),
      sumVerified('certificate_payment_submissions', {}),
      supabaseAdmin
        .from('certificate_payment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', CERT_STATUS.verified)
        .is('delivered_at', null),
    ]);

  return {
    general,
    flagship,
    certificate: {
      pending: certPending,
      verified: certVerified,
      rejected: certRejected,
      collected: certCollected,
      toDeliver: certToDeliverRes.count || 0,
    },
  };
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type: PaymentType = searchParams.get('type') === 'certificate' ? 'certificate' : 'pass';
    const status = searchParams.get('status') || 'pending';
    const search = sanitizeSearch(searchParams.get('search'));
    const tierParam = searchParams.get('tier') as PassTier | null;
    const tier = type === 'pass' && tierParam && PASS_TIERS.includes(tierParam) ? tierParam : null;

    const table = type === 'pass' ? 'festival_pass_claims' : 'certificate_payment_submissions';
    const nameColumn = type === 'pass' ? 'user_name' : 'candidate_name';
    const statusMap = type === 'pass' ? PASS_STATUS : CERT_STATUS;

    let query = supabaseAdmin.from(table).select('*').order('created_at', { ascending: true });
    if (tier) query = query.eq('pass_tier', tier);

    if (status === 'checked_in' && type === 'pass') {
      query = query.eq('checked_in', true);
    } else if (status === 'to_deliver' && type === 'certificate') {
      query = query.eq('status', CERT_STATUS.verified).is('delivered_at', null);
    } else if (status in statusMap) {
      query = query.eq('status', statusMap[status as ReviewStatus]);
    }

    if (search) {
      query = query.or(
        `user_email.ilike.%${search}%,${nameColumn}.ilike.%${search}%,transaction_reference.ilike.%${search}%,institution.ilike.%${search}%`
      );
    }

    const { data: rows, error } = await query.limit(500);
    if (error) {
      console.error('[Admin Payments Query Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows || [];
    const emails = Array.from(new Set(list.map((r: any) => String(r.user_email).toLowerCase())));
    const txns = list.map((r: any) => String(r.transaction_reference).toUpperCase());

    // Cross-reference: the other purchase for the same people / same transaction IDs
    const otherTable = type === 'pass' ? 'certificate_payment_submissions' : 'festival_pass_claims';
    const [otherByEmailRes, otherByTxnRes, issuedRes] = await Promise.all([
      emails.length
        ? supabaseAdmin.from(otherTable).select('user_email, status').in('user_email', emails)
        : Promise.resolve({ data: [] as any[] }),
      txns.length
        ? supabaseAdmin
            .from(otherTable)
            .select(type === 'pass' ? 'transaction_reference, user_email' : 'transaction_reference, user_email, pass_tier')
            .in('transaction_reference', txns)
        : Promise.resolve({ data: [] as any[] }),
      type === 'certificate' && emails.length
        ? supabaseAdmin
            .from('issued_certificates')
            .select('user_email, serial_number')
            .in('user_email', emails)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const otherStatusByEmail = new Map<string, string>();
    for (const r of otherByEmailRes.data || []) {
      otherStatusByEmail.set(String(r.user_email).toLowerCase(), toReviewStatus(r.status));
    }
    const otherByTxn = new Map<string, { email: string; passTier: string | null }>();
    for (const r of (otherByTxnRes.data || []) as any[]) {
      otherByTxn.set(String(r.transaction_reference).toUpperCase(), {
        email: String(r.user_email || '').toLowerCase(),
        passTier: r.pass_tier ?? null,
      });
    }
    const serialByEmail = new Map<string, string>();
    for (const r of issuedRes.data || []) {
      serialByEmail.set(String(r.user_email).toLowerCase(), r.serial_number);
    }

    // Course completion only matters for certificate rows still awaiting a decision
    const completionByEmail = new Map<string, { complete: boolean; summary: string }>();
    if (type === 'certificate') {
      const pendingEmails = list
        .filter((r: any) => toReviewStatus(r.status) === 'pending')
        .map((r: any) => String(r.user_email).toLowerCase());
      for (let i = 0; i < pendingEmails.length; i += 10) {
        const chunk = pendingEmails.slice(i, i + 10);
        const results = await Promise.all(chunk.map((e) => checkCertificateEligibility(e)));
        results.forEach((res, idx) => {
          completionByEmail.set(chunk[idx], {
            complete: res.eligible,
            summary: `${res.sessionsCompleted}/${res.totalSessions} lectures, ${res.quizzesPassed}/${res.totalSessions} quizzes`,
          });
        });
      }
    }

    const items = list.map((r: any) => {
      const email = String(r.user_email).toLowerCase();
      const txn = String(r.transaction_reference).toUpperCase();
      const flags: string[] = [];

      const other = otherByTxn.get(txn);
      const combined =
        other &&
        (type === 'pass'
          ? isCombinedFlagshipTxn(r.pass_tier, email, other.email)
          : isCombinedFlagshipTxn(other.passTier, other.email, email));
      if (combined) {
        flags.push(
          `Combined payment: Flagship Pass + certificate on one receipt (should total ₹${COMBINED_FLAGSHIP_CERTIFICATE_INR})`
        );
      } else if (other) {
        flags.push(
          type === 'pass'
            ? 'Transaction ID also submitted for a certificate'
            : 'Transaction ID also submitted for an offline pass'
        );
      }
      if (!r.receipt_url) flags.push('No receipt uploaded (legacy UPI submission)');

      const completion = completionByEmail.get(email);
      if (completion && !completion.complete) flags.push('Course not complete');

      return {
        id: r.id,
        type,
        passTier: type === 'pass' ? r.pass_tier || 'general_offline' : null,
        name: (type === 'pass' ? r.user_name : r.candidate_name) || email,
        email,
        institution: r.institution || null,
        phone: r.contact_phone || null,
        transactionReference: r.transaction_reference,
        bankReference: r.bank_reference || null,
        receiptUrl: r.receipt_url || null,
        amountInr: r.amount_inr != null ? Number(r.amount_inr) : null,
        paymentMode: r.payment_mode || 'easebuzz',
        status: toReviewStatus(r.status),
        adminNotes: r.admin_notes || null,
        reviewedBy: r.reviewed_by || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at || r.verified_at || null,
        checkedIn: type === 'pass' ? Boolean(r.checked_in) : undefined,
        checkedInAt: type === 'pass' ? r.checked_in_at || null : undefined,
        certificateSerial: type === 'certificate' ? serialByEmail.get(email) || null : undefined,
        deliveryMode: type === 'certificate' ? r.delivery_mode || null : undefined,
        deliveredAt: type === 'certificate' ? r.delivered_at || null : undefined,
        deliveredBy: type === 'certificate' ? r.delivered_by || null : undefined,
        courseProgress: completion?.summary || null,
        otherPurchaseStatus: otherStatusByEmail.get(email) || null,
        flags,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      metrics: await loadMetrics(),
    });
  } catch (err: any) {
    console.error('[Admin Payments Server Exception]:', err);
    return NextResponse.json({ error: err?.message || 'Server error loading payments.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const type: PaymentType = body.type === 'certificate' ? 'certificate' : 'pass';
    const id = String(body.id || '');
    const action = String(body.action || '');
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '';

    if (!id || !['approve', 'reject', 'reopen', 'mark_delivered', 'unmark_delivered'].includes(action)) {
      return NextResponse.json({ error: 'id and a valid action are required.' }, { status: 400 });
    }
    if (action === 'reject' && !notes) {
      return NextResponse.json(
        { error: 'A rejection reason is required. It is shown to the participant.' },
        { status: 400 }
      );
    }

    const reviewer = session.email.toLowerCase();
    const now = new Date().toISOString();

    if (action === 'mark_delivered' || action === 'unmark_delivered') {
      if (type !== 'certificate') {
        return NextResponse.json({ error: 'Delivery applies to certificates only.' }, { status: 400 });
      }
      const delivered = action === 'mark_delivered';
      const { data: updated, error } = await supabaseAdmin
        .from('certificate_payment_submissions')
        .update({
          delivered_at: delivered ? now : null,
          delivered_by: delivered ? reviewer : null,
          updated_at: now,
        })
        .eq('id', id)
        .eq('status', CERT_STATUS.verified)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!updated) {
        return NextResponse.json(
          { error: 'Only verified certificate payments can be marked as delivered.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: true, status: 'verified' });
    }

    if (type === 'pass') {
      const { data: pass } = await supabaseAdmin
        .from('festival_pass_claims')
        .select('id, checked_in')
        .eq('id', id)
        .maybeSingle();
      if (!pass) return NextResponse.json({ error: 'Pass not found.' }, { status: 404 });

      if (pass.checked_in && action !== 'approve') {
        return NextResponse.json(
          { error: 'This pass has already been used at the gate and cannot be rejected or reopened.' },
          { status: 409 }
        );
      }

      const nextStatus =
        action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'claimed_provisional';

      const { error } = await supabaseAdmin
        .from('festival_pass_claims')
        .update({
          status: nextStatus,
          admin_notes: action === 'reject' ? notes : notes || null,
          reviewed_by: reviewer,
          updated_at: now,
        })
        .eq('id', id);
      if (error) throw error;

      return NextResponse.json({ success: true, status: toReviewStatus(nextStatus) });
    }

    // Certificate
    const { data: sub } = await supabaseAdmin
      .from('certificate_payment_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!sub) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });

    if (action === 'approve') {
      const eligibility = await checkCertificateEligibility(sub.user_email);
      let certificateId = sub.certificate_id;
      let serial: string | null = eligibility.issuedCertificate?.serialNumber || null;

      if (!certificateId) {
        if (eligibility.alreadyIssued && eligibility.issuedCertificate) {
          certificateId = eligibility.issuedCertificate.id;
        } else if (!eligibility.eligible) {
          return NextResponse.json(
            { error: 'Course is not complete for this candidate, so no certificate can be issued yet.' },
            { status: 409 }
          );
        } else {
          const minted = await mintCertificate({
            userEmail: sub.user_email,
            // The participant's confirmed certificate name wins over the name captured at payment
            recipientName: await resolveCertificateName(sub.user_email, sub.candidate_name || sub.user_email),
            orderId: null,
            averageScore: eligibility.averageQuizScore,
          });
          certificateId = minted.certRecord.id;
          serial = minted.serialNumber;
        }
      }

      const { error } = await supabaseAdmin
        .from('certificate_payment_submissions')
        .update({
          status: 'verified',
          verified_at: now,
          certificate_id: certificateId,
          admin_notes: notes || null,
          reviewed_by: reviewer,
          updated_at: now,
        })
        .eq('id', id);
      if (error) throw error;

      return NextResponse.json({ success: true, status: 'verified', certificateSerial: serial });
    }

    if (sub.certificate_id) {
      return NextResponse.json(
        { error: 'A certificate has already been issued for this payment and cannot be revoked here.' },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin
      .from('certificate_payment_submissions')
      .update({
        status: action === 'reject' ? 'rejected' : 'pending_verification',
        admin_notes: action === 'reject' ? notes : notes || null,
        reviewed_by: reviewer,
        updated_at: now,
      })
      .eq('id', id);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      status: action === 'reject' ? 'rejected' : 'pending',
    });
  } catch (err: any) {
    console.error('[Admin Payments Update Error]:', err);
    return NextResponse.json({ error: err?.message || 'Server error updating payment.' }, { status: 500 });
  }
}
