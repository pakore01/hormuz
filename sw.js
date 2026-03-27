/* ═══════════════════════════════════════════════
   sw.js — Service Worker
   Hormuz Intelligence Platform v8
═══════════════════════════════════════════════ */

var CACHE_NAME = 'hormuz-v8-cache';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/responsive.css',
  './js/config.js',
  './js/utils.js',
  './js/theme.js',
  './js/auth.js',
  './js/update.js',
  './js/workers.js',
  './js/notifications.js',
  './js/map.js',
  './js/tension.js',
  './js/news.js',
  './js/fuel.js',
  './js/flows.js',
  './js/tankers.js',
  './js/charts.js',
  './js/chat.js',
  './js/calc.js',
  './js/prediccion.js',
  './js/admin.js',
  './js/pwa.js',
  './js/electricidad.js',
  './js/intel.js',
  './js/app.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE).catch(function(e){ console.log('SW cache error:', e); });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n!==CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  /* Don't cache API calls */
  if(event.request.url.indexOf('workers.dev')!==-1 || event.request.url.indexOf('api.anthropic')!==-1 || event.request.url.indexOf('newsapi.org')!==-1) return;
  event.respondWith(
    caches.match(event.request).then(function(response){
      return response || fetch(event.request).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
