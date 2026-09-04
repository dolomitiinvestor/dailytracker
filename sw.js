/* Daily Card service worker — offline shell only. Your data never passes through here. */
const V = 'daily-card-v7';
const CORE = ['./', './index.html', './manifest.webmanifest',
              './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

/* Never touch auth or Drive traffic. */
const BYPASS = ['accounts.google.com', 'www.googleapis.com', 'oauth2.googleapis.com', 'apis.google.com'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==V).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || BYPASS.includes(url.hostname)) return;

  /* Always check the network first for the app shell itself, so a new
     deploy shows up the next time the app is opened. Cache is only the
     offline fallback, not the primary source. */
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(V).then(c=>c.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match(e.request).then(hit=> hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit) return hit;
      return fetch(e.request).then(res=>{
        if(res && (res.ok || res.type === 'opaque')){
          const copy = res.clone();
          caches.open(V).then(c=>c.put(e.request, copy)).catch(()=>{});
        }
        return res;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});
