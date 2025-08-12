const CACHE = 'boxtracker-v3-4';
const ASSETS = ['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate', e => { clients.claim(); e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); });
self.addEventListener('fetch', e => {
  const isHTML = e.request.destination === 'document' || e.request.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    e.respondWith(fetch(e.request).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return r; }).catch(()=>caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
