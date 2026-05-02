const CACHE = 'fitapp-v42';
const ASSETS = ['/FitnessApp/','/FitnessApp/index.html','/FitnessApp/manifest.json','/FitnessApp/icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients=>{
      if(clients.length>0){
        clients[0].postMessage({type:'SET_KLAAR'});
        clients[0].focus();
      } else {
        self.clients.openWindow('/FitnessApp/');
      }
    })
  );
});
