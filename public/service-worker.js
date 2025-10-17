// Basic service worker for offline caching
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'poke-pwa-cache-v2';
// Archivos generados por el build (de asset-manifest.json)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pokeball.jpg',
  '/static/css/main.a06103c4.css',
  '/static/js/main.0ebd1c3b.js',
  '/static/js/453.fa71e030.chunk.js',
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(urlsToCache);
      console.log('[SW] Archivos estáticos cacheados:', urlsToCache);
      // Cachear la respuesta inicial de la API de Pokémon
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        await cache.put('https://pokeapi.co/api/v2/pokemon?limit=20', response.clone());
        console.log('[SW] Datos de la pokeapi cacheados: https://pokeapi.co/api/v2/pokemon?limit=20');
      } catch {
        // Si no hay internet, no pasa nada
        console.warn('[SW] No se pudo cachear datos de la pokeapi (sin internet)');
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

// Interceptar y guardar peticiones
self.addEventListener('fetch', event => {
  const { request } = event;
  // Si es pokeapi, cache dinámico
  if (request.url.includes('pokeapi.co')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          console.log('[SW] Cache dinámico actualizado:', request.url);
          return response;
        } catch {
          // Si no hay datos en caché, mostrar un fallback
          const cached = await cache.match(request);
          if (cached) return cached;
          // Fallback: respuesta vacía tipo API
          if (request.url.includes('pokemon?limit=20')) {
            return new Response(JSON.stringify({ results: [] }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // Para peticiones de navegación (SPA), devolver index.html desde caché si está offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Para recursos locales, cache estático
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      // Si no está en caché, intenta buscarlo en la red
      return fetch(request).catch(() => {
        // Fallback para imágenes
        if (request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
