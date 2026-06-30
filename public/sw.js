self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // Простой fetch для прохождения проверок PWA, без сложного кэширования пока
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
