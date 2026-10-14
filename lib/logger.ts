/**
 * Structured server logging.
 *
 * Every entry is a single JSON line, so Vercel Runtime Logs can be filtered by
 * level (error / warning / info) and searched by event name, e.g. `whitelist.rejected`.
 *
 * Error-level entries are also pushed to ALERT_WEBHOOK_URL (Discord or Slack
 * incoming webhook) when configured, throttled per event to avoid flooding.
 */

type LogLevel = 'info' | 'warn' | 'error';
type LogData = Record<string, unknown>;

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;
const ALERT_THROTTLE_MS = 5 * 60 * 1000;
const ALERT_TIMEOUT_MS = 2000;

// Per-instance throttle: one alert per event name every 5 minutes.
const lastAlertAt = new Map<string, number>();

export function serializeError(err: unknown): LogData {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack?.split('\n').slice(0, 6).join('\n'),
      ...(typeof (err as any).code === 'string' ? { code: (err as any).code } : {}),
    };
  }
  if (err && typeof err === 'object') {
    // Supabase PostgrestError and similar plain objects
    const { message, code, details, hint } = err as Record<string, unknown>;
    return { message, code, details, hint };
  }
  return { message: String(err) };
}

function write(level: LogLevel, event: string, data?: LogData) {
  const entry = {
    level,
    event,
    ts: new Date().toISOString(),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV,
    ...data,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  return entry;
}

async function sendAlert(event: string, entry: LogData) {
  if (!ALERT_WEBHOOK_URL) return;

  const now = Date.now();
  const last = lastAlertAt.get(event);
  if (last && now - last < ALERT_THROTTLE_MS) return;
  lastAlertAt.set(event, now);

  const text = [
    `[QFF ${entry.env ?? 'unknown'}] ${event}`,
    '```',
    JSON.stringify(entry, null, 2).slice(0, 1500),
    '```',
  ].join('\n');

  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `content` is read by Discord, `text` by Slack; each ignores the other.
      body: JSON.stringify({ content: text, text }),
      signal: AbortSignal.timeout(ALERT_TIMEOUT_MS),
    });
  } catch (alertErr) {
    console.warn(JSON.stringify({ level: 'warn', event: 'alert.delivery_failed', ...serializeError(alertErr) }));
  }
}

export function logInfo(event: string, data?: LogData) {
  write('info', event, data);
}

export function logWarn(event: string, data?: LogData) {
  write('warn', event, data);
}

/**
 * Logs an error and sends a throttled webhook alert. Await it in route handlers
 * so the alert is delivered before the serverless function is frozen.
 */
export async function logError(event: string, err: unknown, data?: LogData) {
  const entry = write('error', event, { ...data, error: serializeError(err) });
  await sendAlert(event, entry);
}
