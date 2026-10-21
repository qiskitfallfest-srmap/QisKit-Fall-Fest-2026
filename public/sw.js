/*
 * QFF SRMAP 2026 service worker.
 *
 * Makes the site installable and receives Web Push messages. It does not cache
 * pages or assets: every request goes to the network so a Vercel deploy is live
 * on the next load. The only fallback is a plain offline page for navigations.
 *
 * Push payload (JSON, sent by tools/send_push.py):
 *   { "title": "...", "body": "...", "url": "/learning", "tag": "optional-dedupe-key" }
 */

const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline | QFF SRMAP 2026</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
main{max-width:360px;text-align:center}h1{font-size:18px;margin:0 0 8px}p{font-size:14px;color:#475569;margin:0 0 16px}
button{font:inherit;font-size:14px;font-weight:600;border:0;border-radius:8px;padding:10px 16px;background:#6C151E;color:#fff;cursor:pointer}</style>
</head><body><main><h1>You are offline</h1><p>Connect to the internet to open the Qiskit Fall Fest portal.</p>
<button onclick="location.reload()">Try again</button></main></body></html>`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    )
  );
});

function sameOriginUrl(value) {
  try {
    const url = new URL(value || '/learning', self.location.origin);
    return url.origin === self.location.origin ? url.href : new URL('/learning', self.location.origin).href;
  } catch {
    return new URL('/learning', self.location.origin).href;
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Qiskit Fall Fest SRMAP 2026';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    data: { url: sameOriginUrl(data.url) },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || sameOriginUrl('/learning');

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      const existing = windows.find((client) => 'navigate' in client);
      if (existing) {
        await existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })()
  );
});

// The browser can rotate a subscription; re-save the new one for the same signed-in user.
self.addEventListener('pushsubscriptionchange', (event) => {
  const options = event.oldSubscription?.options;
  if (!options) return;
  event.waitUntil(
    self.registration.pushManager.subscribe(options).then((subscription) =>
      fetch('/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON(), replaces: event.oldSubscription?.endpoint }),
      })
    )
  );
});
