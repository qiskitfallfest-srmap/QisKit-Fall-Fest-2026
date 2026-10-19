/**
 * Shared constants and validation for the two ₹99 Easebuzz purchases:
 * the General Offline Pass and the masterclass certificate. They use the same
 * gateway form but are separate payments, each with its own transaction ID.
 */

export const EASEBUZZ_GATEWAY_URL =
  'https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026';

export const PASS_FEE_INR = 99;
// Per person, for members of teams shortlisted for Hackathon Phase 2
export const FLAGSHIP_PASS_FEE_INR = 499;

export type PassTier = 'general_offline' | 'flagship_offline';

export const PASS_TIER_LABEL: Record<PassTier, string> = {
  general_offline: 'General Offline Pass',
  flagship_offline: 'Flagship Pass',
};

export function passTierLabel(tier: string | null | undefined): string {
  return PASS_TIER_LABEL[tier as PassTier] || PASS_TIER_LABEL.general_offline;
}
export const CERTIFICATE_FEE_INR = 99;

export const MAX_RECEIPT_SIZE_MB = 15;

// ceremony = printed copy in person, email = digital copy by email, both = printed and emailed.
// The SVG download on the portal is available in every case.
export type CertificateDeliveryMode = 'ceremony' | 'email' | 'both';

export const CERTIFICATE_DELIVERY_LABEL: Record<CertificateDeliveryMode, string> = {
  ceremony: 'Printed copy at the valedictory ceremony',
  email: 'Digital copy by email',
  both: 'Both: printed copy and digital copy by email',
};

export function isCertificateDeliveryMode(value: unknown): value is CertificateDeliveryMode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CERTIFICATE_DELIVERY_LABEL, value);
}

export const deliveryIncludesPrint = (mode: string | null | undefined) => mode === 'ceremony' || mode === 'both';
export const deliveryIncludesEmail = (mode: string | null | undefined) => mode === 'email' || mode === 'both';

/** Participant-facing sentence for where their certificate delivery stands. */
export function deliveryStatusText(mode: string | null | undefined, delivered: boolean, email: string): string {
  if (mode === 'ceremony') {
    return delivered ? 'Printed copy collected at the valedictory ceremony.' : 'Collect your printed certificate in person at the valedictory ceremony.';
  }
  if (mode === 'both') {
    return delivered
      ? `Printed copy collected and digital copy emailed to ${email}.`
      : `Collect your printed certificate at the valedictory ceremony. A digital copy will also be emailed to ${email}.`;
  }
  return delivered ? `Emailed to ${email}.` : `A copy will be emailed to ${email}.`;
}

// Printed copies are handed over on campus, so collecting one needs an on-campus pass.
// The pass does not cover the certificate fee: the two are separate payments.
export const CERTIFICATE_PRINT_NOTE = `Collecting the printed copy means attending on campus with a General Offline Pass (₹${PASS_FEE_INR}) or Flagship Pass (₹${FLAGSHIP_PASS_FEE_INR}). The pass does not cover the ₹${CERTIFICATE_FEE_INR} certificate fee.`;

export type ReceiptFolder = 'pass-receipts' | 'certificate-receipts';

// Easebuzz transaction IDs are alphanumeric (e.g. E26101518BKHN3)
export const TXN_PATTERN = /^[A-Z0-9]{6,40}$/;

export const TXN_FORMAT_HINT =
  'Enter the Easebuzz Transaction ID exactly as shown on your receipt (letters and digits, e.g. E26101518BKHN3).';

export function normalizeTxn(value: unknown): string {
  return String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

export function normalizeBankRef(value: unknown): string | null {
  return String(value || '').replace(/\s+/g, '').slice(0, 40) || null;
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpciyrodeppqpkwqblpk.supabase.co';

/** Public URL prefix a receipt must start with; rejects links to arbitrary hosts. */
export function receiptUrlPrefix(folder: ReceiptFolder): string {
  return `${SUPABASE_URL}/storage/v1/object/public/media/${folder}/`;
}

export function isAcceptedReceipt(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith('.pdf') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    file.type.startsWith('image/') ||
    file.type === 'application/pdf'
  );
}

/** Client-side: upload a receipt to media/{folder}/ and return its public URL. */
export async function uploadReceipt(
  file: File,
  folder: ReceiptFolder,
  email: string,
  txn: string
): Promise<string> {
  const { supabase } = await import('@/lib/supabase');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const emailSlug = (email || 'attendee').replace(/[^a-z0-9]/gi, '_').slice(0, 40);
  const storagePath = `${folder}/${emailSlug}_${txn}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('media').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/pdf',
  });

  if (uploadError) {
    throw new Error(`Receipt upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error('Could not resolve receipt URL.');
  }
  return data.publicUrl;
}
