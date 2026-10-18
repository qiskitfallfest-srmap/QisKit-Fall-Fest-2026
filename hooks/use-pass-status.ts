'use client';

import useSWR from 'swr';
import { PHASE1_RESULTS_ANNOUNCE_ISO } from '@/lib/constants';

export const PASS_STATUS_KEY = '/api/pass/status';

export type Phase2Stage =
  | 'under_review'
  | 'no_submission'
  | 'waitlisted'
  | 'invited'
  | 'accepted'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | 'revoked'
  | 'not_selected';

export interface Phase2TeamStatus {
  stage: Phase2Stage;
  track: 'internal' | 'external';
  invitedAt: string | null;
  respondBy: string | null;
  payBy: string | null;
  paymentWindowHours: number;
  autoPromoted: boolean;
  closeReason: string | null;
  declineReason: string | null;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  waitlistPosition: number | null;
  waitlistSize: number | null;
  waitingRoomClosed: boolean;
  paymentLinkPublished: boolean;
  paymentLinkExpectedLabel: string;
  payment: {
    members: { name: string; email: string; isLead: boolean; paid: boolean; verified: boolean }[];
    othersTotal: number;
    othersPaid: number;
    allOthersPaid: boolean;
    leadPaid: boolean;
  } | null;
}

// Stages where the team is waiting on someone else; poll so the page updates on its own
const LIVE_STAGES: Phase2Stage[] = ['under_review', 'waitlisted', 'invited', 'accepted'];

export interface PassStatusHackathon {
  teamId: string;
  teamName: string;
  isLead: boolean;
  submittedAt: string | null;
  resultsPublished: boolean;
  outcome: 'pending' | 'shortlisted' | 'not_shortlisted';
  isWaitlisted?: boolean;
  phase2?: Phase2TeamStatus;
  phase1DeadlineIso: string;
  phase1DeadlinePassed: boolean;
  resultsExpectedLabel: string;
}

export interface FlagshipPaymentWindow {
  status: 'not_open' | 'open' | 'closed';
  openedAt: string | null;
  deadlineIso: string | null;
  gatewayUrl: string | null;
  expectedLabel: string;
  windowHours: number;
}

export interface PassClaim {
  id: string;
  user_email: string;
  user_name: string;
  pass_tier: string;
  transaction_reference: string;
  bank_reference?: string | null;
  receipt_url: string;
  amount_inr: number;
  status: 'claimed_provisional' | 'verified' | 'rejected' | string;
  institution?: string;
  contact_phone?: string | null;
  checked_in: boolean;
  qr_code_token: string;
  admin_notes?: string | null;
  created_at: string;
}

export interface PassStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user?: {
    email: string;
    fullName: string;
    institution?: string;
    phone?: string;
  } | null;
  isHackathonParticipant: boolean;
  hackathon?: PassStatusHackathon | null;
  flagshipPayment?: FlagshipPaymentWindow | null;
  pass?: PassClaim | null;
}

const fetcher = async (url: string): Promise<PassStatusResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to load pass status');
  }
  return json;
};

const announceMs = new Date(PHASE1_RESULTS_ANNOUNCE_ISO).getTime();

/**
 * Single source for /api/pass/status. Every component on a page shares one request
 * and one cache entry, so the pass card and the results notice never disagree.
 * Polls once a minute only for team members still waiting on published results.
 */
export function usePassStatus(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<PassStatusResponse>(
    enabled ? PASS_STATUS_KEY : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
      refreshInterval: (latest) =>
        latest?.hackathon?.phase2 &&
        LIVE_STAGES.includes(latest.hackathon.phase2.stage) &&
        Date.now() >= announceMs
          ? 60_000
          : 0,
    }
  );

  return {
    data,
    isLoading: isLoading && !data,
    isError: Boolean(error) && !data,
    mutate,
  };
}
