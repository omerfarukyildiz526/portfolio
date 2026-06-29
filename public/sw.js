/* Admin giriş onayı için service worker (Web Push). */

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = '🔐 Admin girişi onayı';
  const body = `${data.ua || 'Bir cihaz'}\n${data.time || ''} · Girişi onaylıyor musun?`;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: 'admin-login-' + (data.id || ''),
      requireInteraction: true,
      data: { id: data.id, approveToken: data.approveToken },
      actions: [
        { action: 'approve', title: '✅ Onayla' },
        { action: 'deny', title: '❌ Reddet' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  const action = event.action;

  // Buton dışına (gövdeye) dokunma → onay/ret yapma, paneli aç.
  if (action !== 'approve' && action !== 'deny') {
    event.waitUntil(self.clients.openWindow('/admin'));
    return;
  }
  if (!d.id || !d.approveToken) return;

  event.waitUntil(
    fetch('/api/admin/push/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, approveToken: d.approveToken, action }),
    }).catch(() => {})
  );
});
