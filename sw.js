// FitnessApp service worker: netwerk eerst, cache als terugval.
// Alle apps staan op hetzelfde adres: deze worker ruimt alleen eigen caches op ('fitapp-'),
// nooit die van Cucina, Boodschappen, Energie of Klaverjas.
const PREFIX = 'fitapp-';
const CACHE = PREFIX + 'v59';
const ASSETS = ['/FitnessApp/','/FitnessApp/index.html','/FitnessApp/manifest.json','/FitnessApp/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;                                   // opslaan nooit via de cache
  if (new URL(e.request.url).hostname.endsWith('supabase.co')) return;      // je trainingsgegevens niet in de cache
  e.respondWith(
    fetch(e.request).then(response => {
      if (response && response.ok) { const clone = response.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
      return response;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
      if(clients.length>0) clients[0].focus();
      else self.clients.openWindow('/FitnessApp/');
    })
  );
});
