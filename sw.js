// Mangu CRM — service worker
// Fase 1 (25-ago-2026): solo habilita instalabilidad (ícono en pantalla de inicio).
// Sin cache/offline todavía — pass-through puro para no interferir con Supabase
// (Realtime/WebSockets, auth) ni servir datos desactualizados del CRM.
// La fase 2 (push real) agregará aquí el listener 'push' + 'notificationclick'.

const SW_VERSION = 'mangu-crm-sw-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through: requerido por Chrome/Android para considerar el sitio instalable,
// pero no cachea ni intercepta nada — cada request va directo a la red.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
