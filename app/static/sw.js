// 殿御命 2026-06-04 cmd_477: Web Push Service Worker (詳細 log + requireInteraction 版)
const SW_VERSION = '2026-06-04-v2';

self.addEventListener('install', (e) => {
  console.log('[SW]', SW_VERSION, 'install');
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  console.log('[SW]', SW_VERSION, 'activate');
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] push event received · hasData=' + !!event.data);
  let data = { title: 'Score 通知', body: '', url: '/notification_center' };
  if (event.data) {
    try {
      const json = event.data.json();
      console.log('[SW] payload (json):', json);
      data = { ...data, ...json };
    } catch (e) {
      const txt = event.data.text();
      console.log('[SW] payload (text):', txt);
      data.body = txt;
    }
  }
  const options = {
    body: data.body || '(no body)',
    icon: '/static/splash.png',
    badge: '/static/splash.png',
    tag: data.tag || ('score-notif-' + Date.now()),
    data: { url: data.url || '/notification_center' },
    requireInteraction: true,  // 自動消失せず click まで残す
    vibrate: [100, 50, 100],
    silent: false,
  };
  console.log('[SW] showNotification:', data.title, options);
  event.waitUntil(
    self.registration.showNotification(data.title || 'Score 通知', options)
      .then(() => console.log('[SW] showNotification resolved OK'))
      .catch(e => console.error('[SW] showNotification ERROR:', e))
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] notificationclick:', event.notification.title);
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/notification_center';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
