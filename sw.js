
// sw.js

const CACHE_NAME = 'cravour-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap',
  './favicon.ico',
  './apple-touch-icon.png',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './site.webmanifest'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Add all URLs to cache, but don't fail if one of them fails
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                // Silently fail on individual cache misses
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response. We only cache 200 OK responses.
            if (!response || response.status !== 200) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't cache esm.sh modules as they are versioned and can be cached by the browser
                if (!event.request.url.includes('https://esm.sh')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(error => {
            // For failed navigation requests, return the main app shell.
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
