/**
 * Shared constants and validation for the two ₹99 Easebuzz purchases:
 * the General Offline Pass and the masterclass certificate. They use the same
 * gateway form but are separate payments, each with its own transaction ID.
 */

export const EASEBUZZ_GATEWAY_URL =
  'https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026';

export const PASS_FEE_INR = 99;
export const CERTIFICATE_FEE_INR = 99;

export const MAX_RECEIPT_SIZE_MB = 15;

export type CertificateDeliveryMode = 'ceremony' | 'email';

export const CERTIFICATE_DELIVERY_LABEL: Record<CertificateDeliveryMode, string> = {
  ceremony: 'Collect in person at the valedictory ceremony',
  email: 'Receive by email',
};

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
