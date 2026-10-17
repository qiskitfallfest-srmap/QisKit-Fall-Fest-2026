import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Please sign in with Google to claim your on-campus pass.' },
        { status: 401 }
      );
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // 1. Guardrail: Verify attendee is not in an active Hackathon team
    const [teamMemberRes, teamLeadRes] = await Promise.all([
      supabaseAdmin
        .from('team_members')
        .select('team_id')
        .ilike('email', normalizedEmail)
        .eq('status', 'accepted')
        .maybeSingle(),
      supabaseAdmin
        .from('hackathon_teams')
        .select('id')
        .ilike('lead_email', normalizedEmail)
        .maybeSingle(),
    ]);

    if (teamMemberRes.data || teamLeadRes.data) {
      return NextResponse.json(
        {
          error:
            'You are registered as an active Hackathon participant. Please do not submit the ₹99 General Pass. Selected Phase 2 finalist teams will receive instructions for the ₹499 Flagship Pass.',
        },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { transactionReference, receiptUrl, bankReference } = body;

    const trimmedTxn = String(transactionReference || '').trim();
    const trimmedReceipt = String(receiptUrl || '').trim();

    if (!trimmedTxn || trimmedTxn.length < 4) {
      return NextResponse.json(
        { error: 'Please enter a valid Easebuzz Transaction ID (shown on your receipt, e.g. E26101518BKHN3).' },
        { status: 400 }
      );
    }

    if (!trimmedReceipt || !trimmedReceipt.startsWith('http')) {
      return NextResponse.json(
        { error: 'Please upload a valid receipt file (PDF or screenshot).' },
        { status: 400 }
      );
    }

    // 3. Check if transaction reference is already claimed by someone else
    const { data: existingTxn } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id, user_email, user_name')
      .eq('transaction_reference', trimmedTxn)
      .maybeSingle();

    if (existingTxn && existingTxn.user_email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        {
          error:
            'This Easebuzz Transaction ID has already been registered by another attendee. If this is an error, please contact the organizing committee.',
        },
        { status: 409 }
      );
    }

    // 4. Retrieve institution & phone from registration if available
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('institution, phone')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    // 5. Generate secure QR token if not already assigned
    const qrToken = `qff26_${crypto.randomBytes(16).toString('hex')}`;

    // 6. Insert / upsert pass claim
    const { data: savedPass, error: saveError } = await supabaseAdmin
      .from('festival_pass_claims')
      .upsert(
        {
          user_email: normalizedEmail,
          user_name: session.fullName || normalizedEmail.split('@')[0],
          pass_tier: 'general_offline',
          transaction_reference: trimmedTxn,
          bank_reference: bankReference ? String(bankReference).trim() : null,
          receipt_url: trimmedReceipt,
          amount_inr: 99.00,
          status: 'claimed_provisional',
          institution: reg?.institution || 'SRM University-AP',
          contact_phone: reg?.phone || null,
          qr_code_token: existingTxn ? undefined : qrToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'transaction_reference' }
      )
      .select('*')
      .single();

    if (saveError) {
      console.error('[Pass Claim Database Error]:', saveError);
      return NextResponse.json(
        { error: 'Failed to record pass claim. Please check your details and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your On-Campus General Offline Pass has been recorded successfully.',
      pass: savedPass,
    });
  } catch (err: any) {
    console.error('[Pass Claim Server Exception]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error claiming pass.' },
      { status: 500 }
    );
  }
}
