import { after } from 'next/server';
import { logWarn } from '@/lib/logger';

/**
 * Tells the QFF 2026 app (https://app.qffsrmap2026.com) about people who registered or changed here, so they can sign in to the
 * app within seconds. Best effort by design: runs after the response is sent, never throws, never delays or fails a registration.
 * The app also pulls /api/integrations/qff-app/attendees every 10 minutes, which covers anything this call missed.
 *
 * Env: GCP_ACCESS = key shared with the app (unset = the call is skipped). QFF_APP_URL overrides the app address.
 * Phone numbers are never sent.
 */
export interface QffAppPerson {
  email: string;
  name?: string | null;
  institution?: string | null;
  isActive?: boolean;
  role?: string;
}

const APP_URL = (process.env.QFF_APP_URL || 'https://app.qffsrmap2026.com').replace(/\/+$/, '');
const BATCH = 200;

async function send(people: QffAppPerson[], key: string) {
  for (let i = 0; i < people.length; i += BATCH) {
    try {
      const res = await fetch(`${APP_URL}/integrations/website/attendees`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ people: people.slice(i, i + BATCH) }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) logWarn('qff_app_sync.rejected', { status: res.status, count: Math.min(BATCH, people.length - i) });
    } catch (err: any) {
      logWarn('qff_app_sync.failed', { error: err?.message || String(err) });
    }
  }
}

export function notifyQffApp(people: QffAppPerson[]) {
  const key = process.env.GCP_ACCESS;
  const list = people
    .map((p) => ({ ...p, email: String(p.email || '').trim().toLowerCase() }))
    .filter((p) => p.email.includes('@'));
  if (!key || list.length === 0) return;
  const run = () => send(list, key);
  try {
    after(run); // keeps the function alive until the call finishes, after the visitor already has their response
  } catch {
    void run(); // outside a request scope (scripts, tests)
  }
}
