// Mangu CRM — service worker
// Fase 1 (25-ago-2026): solo habilita instalabilidad (ícono en pantalla de inicio).
// Sin cache/offline todavía — pass-through puro para no interferir con Supabase
// (Realtime/WebSockets, auth) ni servir datos desactualizados del CRM.
// La fase 2 (push real) agregará aquí el listener 'push' + 'notificationclick'.
// v1.1 (26-ago-2026): el fetch pass-through ahora atrapa errores de red (sin
// wifi/datos) y responde con un aviso simple en vez de dejar que Safari
// muestre el error técnico "FetchEvent.respondWith received an error".

const SW_VERSION = 'mangu-crm-sw-v1.1';

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
