import type { QctfState } from '@/data/qctf/tracks';

/** Organizers (admins) and accounts with the 'tester' role in allowed_emails. */
export function isQctfStaff(session: { isAdmin: boolean; role: string } | null): boolean {
  if (!session) return false;
  return session.isAdmin || session.role === 'tester';
}

/** States in which eligible participants (not only staff) can enter the arena. */
export const QCTF_PUBLIC_STATES: QctfState[] = ['announced', 'live', 'frozen', 'closed'];

/** States in which flags are accepted. */
export const QCTF_SUBMIT_STATES: QctfState[] = ['rehearsal', 'announced', 'live', 'frozen'];
