const CACHE_NAME = 'chifeng-yayue-assets-v8-title';

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(
            names
                .filter(name => name.startsWith('chifeng-yayue-assets-') && name !== CACHE_NAME)
                .map(name => caches.delete(name))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith((async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;

        const response = await fetch(event.request);
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone()).catch(() => {});
        }
        return response;
    })());
});
