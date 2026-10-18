import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getHackathonPassContext } from '@/lib/hackathon-pass';
import { PHASE2_OFFERS_TABLE, closeOffer, getOfferForTeam, getPaymentLinkOpenedAt } from '@/lib/phase2-waiting-room';

export const dynamic = 'force-dynamic';

/**
 * Team lead response to a Phase 2 invitation.
 *   { action: 'accept' }                   invited -> accepted, starts the payment window
 *   { action: 'decline', reason?: string } invited/accepted -> declined, desk goes to the waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Please sign in to respond to the invitation.' }, { status: 401 });
    }

    const context = await getHackathonPassContext(session.email);
    if (!context) {
      return NextResponse.json({ error: 'You are not part of a hackathon team.' }, { status: 404 });
    }
    if (!context.isLead) {
      return NextResponse.json({ error: 'Only the team lead can respond to the invitation.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const offer = await getOfferForTeam(context.teamId);

    if (action === 'accept') {
      if (!offer || offer.status !== 'invited') {
        return NextResponse.json({ error: 'There is no open invitation to accept.' }, { status: 409 });
      }
      if (body?.committed !== true) {
        return NextResponse.json(
          { error: 'Please confirm that your team will pay on time before accepting.' },
          { status: 400 }
        );
      }
      const nowMs = Date.now();
      if (Date.parse(offer.respond_by) <= nowMs) {
        return NextResponse.json({ error: 'The time to accept this invitation has passed.' }, { status: 409 });
      }

      // The payment clock starts only once the Easebuzz link is live; until then pay_by stays NULL
      // and startPendingPaymentWindows() sets it when the link is published.
      const linkOpenedAt = await getPaymentLinkOpenedAt();
      const nowIso = new Date(nowMs).toISOString();
      const { data, error } = await supabaseAdmin
        .from(PHASE2_OFFERS_TABLE)
        .update({
          status: 'accepted',
          responded_at: nowIso,
          responded_by: session.email,
          pay_by: linkOpenedAt
            ? new Date(Math.max(nowMs, Date.parse(linkOpenedAt)) + offer.payment_window_hours * 3_600_000).toISOString()
            : null,
          updated_at: nowIso,
        })
        .eq('id', offer.id)
        .eq('status', 'invited')
        .select('*');

      if (error) throw error;
      if (!data?.length) {
        return NextResponse.json({ error: 'This invitation is no longer open.' }, { status: 409 });
      }
      return NextResponse.json({ success: true, offer: data[0] });
    }

    if (action === 'decline') {
      if (!offer || !['invited', 'accepted'].includes(offer.status)) {
        return NextResponse.json({ error: 'There is no open invitation to decline.' }, { status: 409 });
      }
      const reason = String(body?.reason || '').trim().slice(0, 500) || null;
      const { closed } = await closeOffer(offer.id, 'declined', {
        reason: offer.status === 'accepted' ? 'withdrawn_by_lead' : 'declined_by_lead',
        actor: session.email,
        declineReason: reason,
      });
      if (!closed) {
        return NextResponse.json({ error: 'This invitation is no longer open.' }, { status: 409 });
      }
      return NextResponse.json({ success: true, offer: closed });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Phase 2 Response Error]:', err);
    return NextResponse.json({ error: 'Could not record your response. Please try again.' }, { status: 500 });
  }
}
