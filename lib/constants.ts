/**
 * Global Constants for Qiskit Fall Fest 2026
 */

export const REGISTRATION_URL =
  'https://www.qffsrmap2026.com/learning';

export const WHATSAPP_COMMUNITY_URL =
  'https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW';

export const HACKATHON_WORKSPACE_URL =
  'https://www.qffsrmap2026.com/learning/hackathon';

// Online competitions and Hackathon Phase 1 close together
export const ONLINE_SUBMISSIONS_CLOSE_ISO = '2026-10-17T23:59:59+05:30';
export const ONLINE_SUBMISSIONS_CLOSE_LABEL = '17 October 2026, 11:59 PM IST';

// Phase 1 jury results go public at this time; quotas come from the jury's allocation sheet
export const PHASE1_RESULTS_ANNOUNCE_ISO = '2026-10-18T16:00:00+05:30';
export const PHASE1_RESULTS_ANNOUNCE_LABEL = '18 October 2026, 4:00 PM IST';
export const PHASE1_SUBMISSION_COUNT = 129;
export const PHASE2_DESK_QUOTA = { total: 50, internal: 25, external: 25 };
export const PHASE2_WAITLIST_QUOTA = { total: 30, internal: 20, external: 10 };

export function isOnlineSubmissionsClosed(now: number = Date.now()): boolean {
  return now > Date.parse(ONLINE_SUBMISSIONS_CLOSE_ISO);
}

export const GOOGLE_FORM_REGISTRATION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfgl8b3sfDfXw38ay6Lwj1a6DUj0uD5oc3xQ24yaClRppvWrg/viewform';
