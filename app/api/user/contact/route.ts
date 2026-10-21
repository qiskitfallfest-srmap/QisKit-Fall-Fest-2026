import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizePhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

/**
 * POST { phone, emergencyName, emergencyPhone }
 * The participant confirms their mobile number (no OTP) and names an emergency contact.
 * Saves the normalized number to every registrations row for the email and to the
 * festival pass so the check-in desk shows the same number.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const phone = normalizePhone(body?.phone);
    if (!phone) {
      return NextResponse.json({ error: 'Enter a valid mobile number (10 digits, or + and country code).' }, { status: 400 });
    }
    const emergencyName = String(body?.emergencyName || '').trim().replace(/\s+/g, ' ').slice(0, 70);
    if (emergencyName.length < 2) {
      return NextResponse.json({ error: 'Enter the name of your emergency contact.' }, { status: 400 });
    }
    const emergencyPhone = normalizePhone(body?.emergencyPhone);
    if (!emergencyPhone) {
      return NextResponse.json({ error: 'Enter a valid mobile number for your emergency contact.' }, { status: 400 });
    }
    if (emergencyPhone === phone) {
      return NextResponse.json({ error: 'The emergency contact must have a different number from yours.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const contact = {
      phone,
      phone_confirmed_at: nowIso,
      phone_confirmed_value: phone,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
    };

    const { data: existing } = await supabaseAdmin.from('registrations').select('id').ilike('email', email).limit(1);
    const { error } = existing?.length
      ? await supabaseAdmin.from('registrations').update(contact).ilike('email', email)
      : await supabaseAdmin.from('registrations').insert({
          email,
          name: session.fullName || email.split('@')[0],
          role: 'Undergraduate Student',
          created_at: nowIso,
          ...contact,
        });
    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204') {
        return NextResponse.json({ error: 'Contact confirmation is not open yet. Try again later.' }, { status: 503 });
      }
      throw error;
    }

    await supabaseAdmin
      .from('festival_pass_claims')
      .update({ contact_phone: phone, updated_at: nowIso })
      .ilike('user_email', email);

    return NextResponse.json({
      success: true,
      contact: { phone, confirmedAt: nowIso, emergencyName, emergencyPhone },
    });
  } catch (err: any) {
    console.error('[User Contact POST Error]:', err);
    return NextResponse.json({ error: 'Could not save your contact details.' }, { status: 500 });
  }
}
