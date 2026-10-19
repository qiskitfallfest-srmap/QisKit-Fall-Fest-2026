import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardId, parseAwardId } from '@/lib/competition-results';
import { loadAwardEntrySource, mediaObjectPath, publicEntryPath } from '@/lib/competition-winners';

export const dynamic = 'force-dynamic';

/**
 * Opens the winning entry behind an award. Reel links redirect as they are.
 * Uploaded posters and essays are stored under the participant's email, so the
 * first request copies the file (inside storage, nothing passes through this
 * function) to a neutral path and every request redirects there.
 * Released awards only; admins can also open unreleased ones.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = parseAwardId(decodeURIComponent(id));
  if (!parsed) return NextResponse.json({ error: 'Award not found.' }, { status: 404 });

  const session = await getServerSession();
  const source = await loadAwardEntrySource(parsed.type, parsed.rank, { includeUnreleased: !!session?.isAdmin });
  if (!source || !/^https?:\/\//i.test(source)) return NextResponse.json({ error: 'Award not found.' }, { status: 404 });

  const sourcePath = mediaObjectPath(source);
  if (!sourcePath) return NextResponse.redirect(source, 302);

  const bucket = supabaseAdmin.storage.from('media');
  const target = publicEntryPath(awardId(parsed.type, parsed.rank), sourcePath);
  const { error } = await bucket.copy(sourcePath, target);
  // An existing copy from an earlier request is the normal case
  if (error && !/exists|duplicate/i.test(error.message)) {
    console.error('[Award Entry] Copy failed:', error.message);
    return NextResponse.json({ error: 'Could not open this entry.' }, { status: 502 });
  }
  return NextResponse.redirect(bucket.getPublicUrl(target).data.publicUrl, 302);
}
