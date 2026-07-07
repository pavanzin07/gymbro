/* MEU GYM BRO — Service Worker
   Estratégia:
   - HTML/navegação: network-first (deploy novo chega na hora; offline cai no cache)
   - /assets/ (nomes com hash, imutáveis): cache-first
   - demais estáticos same-origin: stale-while-revalidate
   - cross-origin (ex: API do Supabase): nunca intercepta */
const CACHE_NAME = 'meu-gym-bro-v2';
const CORE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API externa: direto na rede

  // Navegação/HTML: rede primeiro, cache como fallback offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then(res => {
        const cloned = res.clone();
        caches.open(CACHE_NAME).then(c => c.put('./index.html', cloned));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Assets com hash no nome: imutáveis, cache-first
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200) {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, cloned));
        }
        return res;
      }))
    );
    return;
  }

  // Demais estáticos: responde do cache e atualiza em segundo plano
  event.respondWith(
    caches.match(req).then(hit => {
      const refresh = fetch(req).then(res => {
        if (res && res.status === 200) {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, cloned));
        }
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});
