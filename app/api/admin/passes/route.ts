import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();

    let query = supabaseAdmin
      .from('festival_pass_claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      if (status === 'checked_in') {
        query = query.eq('checked_in', true);
      } else {
        query = query.eq('status', status);
      }
    }

    if (search) {
      query = query.or(
        `user_email.ilike.%${search}%,user_name.ilike.%${search}%,transaction_reference.ilike.%${search}%,institution.ilike.%${search}%`
      );
    }

    const { data: passes, error } = await query.limit(500);

    if (error) {
      console.error('[Admin Passes Query Error]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate summary metrics
    const [totalClaimsRes, verifiedClaimsRes, checkedInClaimsRes] = await Promise.all([
      supabaseAdmin.from('festival_pass_claims').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('festival_pass_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified'),
      supabaseAdmin
        .from('festival_pass_claims')
        .select('*', { count: 'exact', head: true })
        .eq('checked_in', true),
    ]);

    return NextResponse.json({
      success: true,
      passes: passes || [],
      metrics: {
        totalClaims: totalClaimsRes.count || 0,
        verifiedClaims: verifiedClaimsRes.count || 0,
        checkedInClaims: checkedInClaimsRes.count || 0,
      },
    });
  } catch (err: any) {
    console.error('[Admin Passes Server Exception]:', err);
    return NextResponse.json({ error: err?.message || 'Server error loading passes.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { passId, status, adminNotes } = body;

    if (!passId) {
      return NextResponse.json({ error: 'Missing passId' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data: updatedPass, error } = await supabaseAdmin
      .from('festival_pass_claims')
      .update(updates)
      .eq('id', passId)
      .select('*')
      .single();

    if (error || !updatedPass) {
      return NextResponse.json({ error: error?.message || 'Failed to update pass.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pass: updatedPass,
    });
  } catch (err: any) {
    console.error('[Admin Passes Update Error]:', err);
    return NextResponse.json({ error: err?.message || 'Server error updating pass.' }, { status: 500 });
  }
}
