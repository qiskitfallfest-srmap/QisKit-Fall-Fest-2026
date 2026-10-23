import { NextResponse } from 'next/server';
import { getQctfConfig } from '@/lib/qctf/server';

/** Public arena state, used by the sidebar to decide whether to show the QCTF link. */
export async function GET() {
  try {
    const { state } = await getQctfConfig();
    return NextResponse.json({ success: true, state });
  } catch {
    return NextResponse.json({ success: true, state: 'hidden' });
  }
}
