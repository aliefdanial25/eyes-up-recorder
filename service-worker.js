'use strict';
// Increment RELEASE whenever a shell file changes. Scope isolates GitHub Pages repos.
const RELEASE='1.0.2-20261002';
const CACHE_PREFIX='eyes-up-shell:'+self.registration.scope+':';
const CACHE_NAME=CACHE_PREFIX+RELEASE;
const SHELL=['./','index.html','style.css','ui/studio.css','ui/classroom.css','ui/learning.css','ui/device.css','storage.js','ui.js','app.js','ui/classroom.js','pwa.js','manifest.webmanifest','assets/classroom.webp','assets/mascot.webp','assets/icon-192.png','assets/icon-512.png','assets/icon-maskable-512.png','assets/apple-touch-icon.png'];
const shellURLs=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
 // No skipWaiting: never replace running lesson assets in the middle of a session.
 event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);try{await cache.addAll(SHELL.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));}catch(error){await caches.delete(CACHE_NAME);throw error;}})());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);url.search='';url.hash='';
 // Only the explicit static shell. No audio, recording, API, or arbitrary requests.
 if(!shellURLs.has(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);const cached=await cache.match(url.href);return cached||fetch(request);})());
});
self.addEventListener('message',event=>{if(event.data?.type==='SHELL_STATUS')event.ports[0]?.postMessage({release:RELEASE,ready:true});});
