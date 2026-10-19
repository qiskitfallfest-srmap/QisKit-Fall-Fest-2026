import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isCertificateDeliveryMode } from '@/lib/payments';

export const dynamic = 'force-dynamic';

/**
 * PATCH { deliveryMode: 'ceremony' | 'email' | 'both' }
 * Changes how the participant receives their certificate. Applies to their latest
 * certificate payment while it is not rejected and not yet marked delivered.
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const deliveryMode = body?.deliveryMode;
    if (!isCertificateDeliveryMode(deliveryMode)) {
      return NextResponse.json({ error: 'Choose a printed copy, a copy by email, or both.' }, { status: 400 });
    }

    const { data: rows, error: readError } = await supabaseAdmin
      .from('certificate_payment_submissions')
      .select('id, status, delivered_at')
      .ilike('user_email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    if (readError) throw readError;

    const sub = rows?.[0];
    if (!sub) {
      return NextResponse.json({ error: 'Submit your certificate payment first.' }, { status: 404 });
    }
    if (sub.status === 'rejected') {
      return NextResponse.json({ error: 'Resubmit your certificate payment, then choose the delivery.' }, { status: 409 });
    }
    if (sub.delivered_at) {
      return NextResponse.json(
        { error: 'Your certificate is already marked delivered. Write to qiskitfallfest@srmap.edu.in to change it.' },
        { status: 409 }
      );
    }

    const { data: updated, error } = await supabaseAdmin
      .from('certificate_payment_submissions')
      .update({ delivery_mode: deliveryMode, updated_at: new Date().toISOString() })
      .eq('id', sub.id)
      .is('delivered_at', null)
      .select('id, delivery_mode')
      .maybeSingle();
    // 23514: CHECK violation, i.e. the 'both' migration has not been applied yet
    if (error?.code === '23514') {
      return NextResponse.json({ error: 'This delivery option is not available yet.' }, { status: 503 });
    }
    if (error) throw error;
    if (!updated) {
      return NextResponse.json({ error: 'Your certificate was just marked delivered. Refresh the page.' }, { status: 409 });
    }

    return NextResponse.json({ success: true, deliveryMode: updated.delivery_mode });
  } catch (err: any) {
    console.error('[Certificate Delivery PATCH Error]:', err);
    return NextResponse.json({ error: 'Could not update your delivery choice.' }, { status: 500 });
  }
}
