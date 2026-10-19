import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  CERTIFICATE_NAME_TABLE,
  getCertificateName,
  normalizeCertificateName,
  validateCertificateName,
} from '@/lib/certificate-name';

export const dynamic = 'force-dynamic';

/** Account names are often typed in one case; suggest Title Case so it prints properly. */
function suggestFromAccountName(raw: string) {
  const name = normalizeCertificateName(raw);
  if (name !== name.toLowerCase() && name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s.'-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

async function isIssued(email: string) {
  const { data } = await supabaseAdmin.from('issued_certificates').select('recipient_name').ilike('user_email', email).limit(1);
  return data?.[0] ? { recipientName: data[0].recipient_name as string } : null;
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const [chosen, issued] = await Promise.all([getCertificateName(email), isIssued(email)]);
    return NextResponse.json(
      {
        success: true,
        name: issued?.recipientName || chosen?.name || null,
        confirmedAt: chosen?.confirmedAt || null,
        locked: Boolean(issued),
        suggested: suggestFromAccountName(session.fullName || ''),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('[Certificate Name GET Error]:', err);
    return NextResponse.json({ error: 'Could not load your certificate name.' }, { status: 500 });
  }
}

/** PUT { name, confirmed: true } */
export async function PUT(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const problem = validateCertificateName(body?.name);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    if (body?.confirmed !== true) {
      return NextResponse.json({ error: 'Confirm the spelling before saving.' }, { status: 400 });
    }
    if (await isIssued(email)) {
      return NextResponse.json(
        { error: 'Your certificate is already issued with this name. Write to qiskitfallfest@srmap.edu.in for a correction.' },
        { status: 409 }
      );
    }

    const name = normalizeCertificateName(body.name);
    const nowIso = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from(CERTIFICATE_NAME_TABLE)
      .upsert({ email, certificate_name: name, confirmed_at: nowIso, updated_at: nowIso }, { onConflict: 'email' });
    if (error?.code === '42P01' || error?.code === 'PGRST205') {
      return NextResponse.json({ error: 'Saving the certificate name is not available yet.' }, { status: 503 });
    }
    if (error) throw error;

    // Keep a pending certificate submission in step so reviewers see the same name
    await supabaseAdmin
      .from('certificate_payment_submissions')
      .update({ candidate_name: name, updated_at: nowIso })
      .ilike('user_email', email)
      .neq('status', 'verified');

    return NextResponse.json({ success: true, name, confirmedAt: nowIso });
  } catch (err: any) {
    console.error('[Certificate Name PUT Error]:', err);
    return NextResponse.json({ error: 'Could not save your certificate name.' }, { status: 500 });
  }
}
