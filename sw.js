// Mangu CRM — service worker
// Fase 1 (25-ago-2026): solo habilita instalabilidad (ícono en pantalla de inicio).
// Sin cache/offline todavía — pass-through puro para no interferir con Supabase
// (Realtime/WebSockets, auth) ni servir datos desactualizados del CRM.
// v1.1 (26-ago-2026): el fetch pass-through ahora atrapa errores de red (sin
// wifi/datos) y responde con un aviso simple en vez de dejar que Safari
// muestre el error técnico "FetchEvent.respondWith received an error".
// v1.2 (26-ago-2026): Fase 2 — listeners 'push' y 'notificationclick' para
// notificaciones push reales (Web Push / VAPID).

const SW_VERSION = 'mangu-crm-sw-v1.2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through: requerido por Chrome/Android para considerar el sitio instalable,
// pero no cachea ni intercepta nada — cada request va directo a la red.
// Si la red falla (sin conexión), respondemos con un aviso claro en vez de
// dejar que la promesa rechazada llegue sin manejar a respondWith().
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        'Sin conexión a internet. Revisa tu wifi o datos móviles e intenta de nuevo.',
        {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        }
      );
    })
  );
});

// ── Push real (Fase 2, 26-ago-2026) ─────────────────────────────────────
// El payload lo manda la Edge Function send-push (o whatsapp-webhook /
// visitas-recordatorios) como JSON: { title, body, url, tag }.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Mangu CRM', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Mangu CRM';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'mangu-crm',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Al dar clic en la notificación: si ya hay una ventana/pestaña del CRM
// abierta, la enfoca; si no, abre una nueva en la URL indicada.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
