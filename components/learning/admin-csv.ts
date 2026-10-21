/** CSV and contact helpers shared by the admin accommodation and transport views. */

function csvCell(v: unknown) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(name: string, header: string[], lines: unknown[][]) {
  // BOM so Excel opens names with non-ASCII characters correctly
  const body = [header, ...lines].map((l) => l.map(csvCell).join(',')).join('\n');
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** wa.me link for a stored phone; bare 10-digit numbers are taken as Indian mobiles */
export function whatsappLink(phone: string | null) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `https://wa.me/91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `https://wa.me/91${digits.slice(1)}`;
  return digits.length >= 11 ? `https://wa.me/${digits}` : '';
}

export const OFFER_LABEL: Record<string, string> = { invited: 'Invited', accepted: 'Accepted', confirmed: 'Confirmed' };
