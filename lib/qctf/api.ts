import { NextResponse } from 'next/server';
import { getServerSession, type AuthSession } from '@/lib/auth';
import { getQctfConfig, resolveQctfAccess, type QctfAccess, type QctfConfig } from './server';

type QctfContext = { session: AuthSession; config: QctfConfig; access: QctfAccess };

/**
 * Resolves the caller for a /api/qctf/* route: the session, arena config and access,
 * or the error response to send when the caller is signed out or not allowed in.
 */
export async function requireQctfEntry(): Promise<
  ({ denied: null } & QctfContext) | { denied: NextResponse }
> {
  const session = await getServerSession();
  if (!session) {
    return { denied: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) };
  }
  const config = await getQctfConfig();
  const access = await resolveQctfAccess(session, config);
  if (!access.canEnter) {
    return { denied: NextResponse.json({ success: false, error: 'QCTF is not open to you yet.' }, { status: 403 }) };
  }
  return { denied: null, session, config, access };
}
