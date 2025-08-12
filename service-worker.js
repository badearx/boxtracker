// BoxTracker PWA service worker — caches CDN libs to avoid black screens
const CACHE = 'boxtracker-v4-cdns';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // CDN libraries needed at runtime
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for HTML, cache-first for everything else
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const accept = req.headers.get('accept') || '';
  const isHTML = req.destination === 'document' || accept.includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return r;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return resp;
    }))
  );
});