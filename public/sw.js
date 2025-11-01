self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const appName = 'Fusepoint';
    const incomingTitle = data.title || '';
    const title = incomingTitle ? `${appName} — ${incomingTitle}` : appName;
    const body = data.body || '';
    const url = data.url || '/';

    const options = {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url },
      vibrate: [100, 50, 100],
      actions: url ? [{ action: 'open', title: 'Ouvrir' }] : []
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // Fallback si le payload n'est pas JSON
    const appName = 'Fusepoint';
    const options = {
      body: event.data && event.data.text ? event.data.text() : '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png'
    };
    event.waitUntil(self.registration.showNotification(appName, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
  // Sécuriser l'URL cible: n'autoriser que les chemins de même origine
  const safeUrl = (() => {
    try {
      const u = new URL(targetUrl, self.location.origin);
      // Interdire l'ouverture vers des origines externes
      if (u.origin !== self.location.origin) {
        return '/';
      }
      return u.pathname + u.search + u.hash;
    } catch (_) {
      return '/';
    }
  })();
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname === safeUrl) {
        client.focus();
        return;
      }
    }
    await self.clients.openWindow(safeUrl);
  })());
});