/**
 * Who a festival-pass claim belongs to. One definition, used by the admin payments page and by the QFF app's sync feed.
 *
 * An SRM-AP student is someone with an @srmap.edu.in address, or someone who registered with a personal address but typed
 * SRM-AP as their college (SRM Chennai / IST and the other campuses do not count). Everyone else is outside.
 * The two ways in are kept apart in `srmBasis`: the address is verified by the mailbox, the college is only self-reported.
 */
export type Group = 'srm' | 'outside';
export type SrmBasis = 'srm_email' | 'personal_says_srm' | 'outside';

export const SRM_DOMAIN = '@srmap.edu.in';
const OTHER_SRM_CAMPUS = /\b(ist|chennai|ktr|kattankulathur|ramapuram|trichy|vadapalani|delhi|ncr|sonepat|sikkim)\b/i;

export const isSrmAddress = (email: string) => email.trim().toLowerCase().endsWith(SRM_DOMAIN);
export const claimsSrmCollege = (institution: unknown) => { const t = String(institution || ''); return /srm/i.test(t) && !OTHER_SRM_CAMPUS.test(t); };
/** The college mentions SRM but also names another campus: the borderline cases to check by hand. */
export const mentionsOtherSrmCampus = (institution: unknown) => { const t = String(institution || ''); return /srm/i.test(t) && OTHER_SRM_CAMPUS.test(t); };
export const isSrmStudent = (email: string, institution: unknown) => isSrmAddress(email) || claimsSrmCollege(institution);

export function groupOf(email: string, institution: unknown): Group {
  return isSrmStudent(email, institution) ? 'srm' : 'outside';
}
export function srmBasisOf(email: string, institution: unknown): SrmBasis {
  if (isSrmAddress(email)) return 'srm_email';
  return claimsSrmCollege(institution) ? 'personal_says_srm' : 'outside';
}
