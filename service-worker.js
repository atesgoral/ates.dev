self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ates.dev').then((cache) => {
      return cache.addAll([
        '/assets/fonts/varelaround-regular-webfont.woff2',
        '/assets/logos/bluesky.svg',
        '/assets/logos/github.svg',
      ]);
    }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
