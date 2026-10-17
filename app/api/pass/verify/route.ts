import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token')?.trim();
    const query = searchParams.get('q')?.trim();

    if (!token && !query) {
      return NextResponse.json(
        { error: 'Missing verification token or search parameter.' },
        { status: 400 }
      );
    }

    let passQuery = supabaseAdmin.from('festival_pass_claims').select('*');

    if (token) {
      passQuery = passQuery.eq('qr_code_token', token);
    } else if (query) {
      // Support searching by Transaction Reference or User Email
      passQuery = passQuery.or(
        `transaction_reference.eq.${query},user_email.ilike.%${query}%`
      );
    }

    const { data: pass, error } = await passQuery.limit(1).maybeSingle();

    if (error) {
      console.error('[Pass Verify Query Error]:', error);
      return NextResponse.json(
        { error: 'Database error searching for pass.' },
        { status: 500 }
      );
    }

    if (!pass) {
      return NextResponse.json(
        {
          valid: false,
          error: 'No valid festival pass found matching the scanned QR code or identifier.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      pass: {
        id: pass.id,
        userName: pass.user_name,
        userEmail: pass.user_email,
        passTier: pass.pass_tier,
        institution: pass.institution || 'SRM University-AP',
        transactionReference: pass.transaction_reference,
        status: pass.status,
        amountInr: pass.amount_inr,
        receiptUrl: pass.receipt_url,
        checkedIn: Boolean(pass.checked_in),
        checkedInAt: pass.checked_in_at,
        checkedInBy: pass.checked_in_by,
        createdAt: pass.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Pass Verify Server Exception]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error verifying pass.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, passId, volunteerName } = body;

    if (!token && !passId) {
      return NextResponse.json(
        { error: 'Missing token or pass ID for check-in.' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('festival_pass_claims').update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: String(volunteerName || 'Gate Volunteer Desk').slice(0, 100),
      updated_at: new Date().toISOString(),
    });

    if (passId) {
      query = query.eq('id', passId);
    } else {
      query = query.eq('qr_code_token', token);
    }

    const { data: updatedPass, error } = await query.select('*').single();

    if (error || !updatedPass) {
      return NextResponse.json(
        { error: error?.message || 'Failed to record check-in.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attendee successfully checked in.',
      pass: updatedPass,
    });
  } catch (err: any) {
    console.error('[Pass Check-In Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process check-in.' },
      { status: 500 }
    );
  }
}
