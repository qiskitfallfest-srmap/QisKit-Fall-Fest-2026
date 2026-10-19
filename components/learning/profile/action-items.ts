import { FLAGSHIP_PASS_FEE_INR } from '@/lib/payments';
import { PHASE1_RESULTS_ANNOUNCE_ISO } from '@/lib/constants';
import type { PassStatusResponse } from '@/hooks/use-pass-status';
import type { ProfileOverview } from '@/hooks/use-profile-overview';

export type ProfileTab =
  | 'overview'
  | 'notices'
  | 'results'
  | 'hackathon'
  | 'payments'
  | 'requests'
  | 'activity'
  | 'account';

export interface ActionItem {
  id: string;
  /** 'action': the user must do something. 'waiting': someone else must, shown so the user knows. */
  kind: 'action' | 'waiting';
  title: string;
  detail?: string;
  dueIso?: string | null;
  cta?: { label: string; tab?: ProfileTab; href?: string; event?: string };
}

const PASS_HREF = '/learning#campus-pass';

/**
 * Derives the user's open tasks from their current state, most time-critical first.
 * Only lists things with a clear next step; completed or informational states live in the tabs.
 */
export function deriveActionItems(overview: ProfileOverview | undefined, status: PassStatusResponse | undefined): ActionItem[] {
  const items: ActionItem[] = [];
  const email = overview?.profile.email || status?.user?.email || '';
  const hackathon = status?.hackathon;
  const phase2 = hackathon?.phase2;
  const resultsOut = Date.now() >= Date.parse(PHASE1_RESULTS_ANNOUNCE_ISO);

  if (hackathon && phase2 && resultsOut) {
    if (phase2.stage === 'invited') {
      items.push(
        hackathon.isLead
          ? {
              id: 'phase2-respond',
              kind: 'action',
              title: 'Accept or decline the Phase 2 invitation',
              detail: `Your team ${hackathon.teamName} is selected. Only you, as team lead, can respond.`,
              dueIso: phase2.respondBy,
              cta: { label: 'Respond now', tab: 'hackathon' },
            }
          : {
              id: 'phase2-lead-respond',
              kind: 'waiting',
              title: 'Your team lead needs to accept the Phase 2 invitation',
              detail: 'Remind your lead to respond before the deadline, or the desk goes to the next team.',
              dueIso: phase2.respondBy,
              cta: { label: 'View status', tab: 'hackathon' },
            }
      );
    }

    if (phase2.stage === 'accepted' && phase2.payment) {
      const payment = phase2.payment;
      const me = payment.members.find((m) => m.email === email);
      const unpaid = payment.members.filter((m) => !m.isLead && !m.paid);

      if (!phase2.paymentLinkPublished) {
        items.push({
          id: 'flagship-link-pending',
          kind: 'waiting',
          title: 'Flagship Pass payment opens soon',
          detail: `The payment link is expected on ${phase2.paymentLinkExpectedLabel}. Each member pays ₹${FLAGSHIP_PASS_FEE_INR}.`,
          cta: { label: 'Team payments', tab: 'payments' },
        });
      } else if (hackathon.isLead) {
        if (unpaid.length > 0) {
          items.push({
            id: 'flagship-team-unpaid',
            kind: 'action',
            title: `${unpaid.length} teammate${unpaid.length === 1 ? '' : 's'} still need${unpaid.length === 1 ? 's' : ''} to pay`,
            detail: `Waiting on ${unpaid.map((m) => m.name).join(', ')}. You pay last, after everyone else.`,
            dueIso: phase2.payBy,
            cta: { label: 'Track team payments', tab: 'payments' },
          });
        } else if (!payment.leadPaid) {
          items.push({
            id: 'flagship-lead-pay',
            kind: 'action',
            title: `Pay your ₹${FLAGSHIP_PASS_FEE_INR} Flagship Pass to confirm the desk`,
            detail: 'Every teammate has paid. Select Diamond Pass on Easebuzz (tick "I confirm the above" first).',
            dueIso: phase2.payBy,
            cta: { label: 'Pay now', href: PASS_HREF },
          });
        }
      } else if (me && !me.paid) {
        items.push({
          id: 'flagship-member-pay',
          kind: 'action',
          title: `Pay your ₹${FLAGSHIP_PASS_FEE_INR} Flagship Pass`,
          detail: 'Select Diamond Pass on Easebuzz (tick "I confirm the above" first). Check the payment guide before paying.',
          dueIso: phase2.payBy,
          cta: { label: 'Pay now', href: PASS_HREF },
        });
      }
    }
  }

  if (overview?.pendingInvitations.length) {
    const n = overview.pendingInvitations.length;
    items.push({
      id: 'team-invites',
      kind: 'action',
      title: n === 1 ? `Team invitation from ${overview.pendingInvitations[0].teamName}` : `${n} team invitations waiting`,
      detail: 'Accept or decline in the Hackathon Workspace.',
      cta: { label: 'Open workspace', href: '/learning/hackathon' },
    });
  }

  if (status?.pass?.status === 'rejected') {
    items.push({
      id: 'pass-rejected',
      kind: 'action',
      title: 'Your pass payment was not accepted',
      detail: status.pass.admin_notes || 'Check the reason and submit the receipt again.',
      cta: { label: 'Fix pass payment', href: PASS_HREF },
    });
  }

  const certPayment = overview?.certificate.payment;
  if (certPayment?.status === 'rejected') {
    items.push({
      id: 'certificate-rejected',
      kind: 'action',
      title: 'Your certificate payment was not accepted',
      detail: certPayment.admin_notes || 'Check the reason and submit the receipt again.',
      cta: { label: 'Open certificate', event: 'open-certificate-modal' },
    });
  }

  return items;
}
