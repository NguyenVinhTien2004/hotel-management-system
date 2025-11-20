// Service Worker for PWA - Khách sạn Cây Dừa
const CACHE_NAME = 'cay-dua-hotel-v3';
const urlsToCache = [
  '/mobile-styles.css',
  '/animations.css',
  '/animations.js',
  '/js/config.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SW: Install complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for HTML and API, cache for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Always fetch fresh for HTML pages and API calls
  if (event.request.destination === 'document' || 
      url.pathname.includes('/api/') || 
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }
  
  // Cache-first for static assets (CSS, JS, images)
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'image' ||
      url.pathname.includes('/images/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
        })
    );
    return;
  }
  
  // Network-first for everything else
  event.respondWith(fetch(event.request));
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Thông báo từ Khách sạn Cây Dừa',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('Khách sạn Cây Dừa', options)
  );
});