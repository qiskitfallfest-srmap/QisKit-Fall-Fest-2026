'use client';

import useSWR from 'swr';
import type { Notice } from '@/lib/notices';
import type { CertificateDeliveryMode } from '@/lib/payments';

export const PROFILE_OVERVIEW_KEY = '/api/user/overview';

export interface ProfileTeamMember {
  email: string;
  name: string;
  isLead: boolean;
  status: 'invited' | 'accepted';
  isYou: boolean;
}

export interface ProfileTeam {
  id: string;
  name: string;
  isLead: boolean;
  vertical: string | null;
  problemStatementId: string | null;
  problemStatementTitle: string | null;
  repoUrl: string | null;
  submittedAt: string | null;
  createdAt: string | null;
  members: ProfileTeamMember[];
}

export interface CertificatePayment {
  id: string;
  transaction_reference: string;
  amount_inr: number;
  status: 'pending_verification' | 'verified' | 'rejected' | string;
  admin_notes: string | null;
  delivery_mode: CertificateDeliveryMode | null;
  delivered_at: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface ProfileOverview {
  success: boolean;
  profile: {
    email: string;
    fullName: string;
    institution: string | null;
    phone: string | null;
    yearOfStudy: string | null;
    registeredAt: string | null;
    /** Set once the participant answers the institution banner (confirm or edit) */
    institutionConfirmedAt?: string | null;
    institutionConfirmedValue?: string | null;
    /** Confirmed mobile and emergency contact; bus travel and accommodation wait on it */
    contact?: {
      phone: string | null;
      confirmed: boolean;
      emergencyName: string | null;
      emergencyPhone: string | null;
      tracked: boolean;
    };
    isAdmin: boolean;
  };
  team: ProfileTeam | null;
  pendingInvitations: { id: string; invitedAt: string; teamName: string; leadName: string | null }[];
  activity: {
    sessions: {
      id: string;
      day: number;
      title: string;
      videoCompleted: boolean;
      quizPassed: boolean;
      quizScore: number | null;
      quizAttempts: number;
      completedAt: string | null;
    }[];
    competitions: { type: string; title: string; submitted: boolean; submittedAt: string | null; submissionUrl: string | null }[];
    coding: {
      attempts: number;
      problemsAttempted: number;
      problemsSolved: number;
      totalProblems: number;
      points: number;
      maxPoints: number;
    };
  };
  certificate: {
    eligible: boolean;
    alreadyIssued: boolean;
    issued: { serialNumber: string; certificateUrl: string; issuedAt: string } | null;
    sessionsCompleted: number;
    quizzesPassed: number;
    totalSessions: number;
    payment: CertificatePayment | null;
  };
  notices: Notice[];
}

const fetcher = async (url: string): Promise<ProfileOverview> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load your profile.');
  return json;
};

export function useProfileOverview(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<ProfileOverview>(enabled ? PROFILE_OVERVIEW_KEY : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 15_000,
  });
  return { data, error: error as Error | undefined, isLoading: isLoading && !data, mutate };
}
