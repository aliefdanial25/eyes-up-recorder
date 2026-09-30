'use strict';
// Installation is optional; lessons and local pitch detection work in a browser too.
let installPrompt=null,pwaInitialized=false,offlineReady=false,updateWaiting=false;
function renderOfflineStatus(){
 const status=document.getElementById('offline-status');
 status.textContent=updateWaiting?'Kemas kini tersedia. Tutup semua tetingkap EYES UP! dan buka semula selepas latihan.':offlineReady?(navigator.onLine?'Sedia digunakan luar talian pada peranti ini.':'Luar talian · bahan latihan tersedia pada peranti ini.'):'Menyediakan bahan untuk kegunaan luar talian…';
}
async function setupOffline(){
 const status=document.getElementById('offline-status');
 if(!window.isSecureContext||!('serviceWorker' in navigator)){status.textContent='Buka melalui HTTPS untuk menyediakan penggunaan luar talian.';return;}
 try{
  const registration=await navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'});
  updateWaiting=!!registration.waiting;
  const watchInstall=()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',()=>{
   if(worker.state==='installed'&&navigator.serviceWorker.controller){updateWaiting=!!registration.waiting;renderOfflineStatus();}
   if(worker.state==='redundant'&&!offlineReady)status.textContent='Bahan luar talian belum lengkap. Buka semula semasa ada internet.';
  });};
  watchInstall();registration.addEventListener('updatefound',watchInstall);
  const ready=await navigator.serviceWorker.ready;offlineReady=!!ready.active;renderOfflineStatus();
 }catch{status.textContent='Bahan luar talian belum dapat disimpan. Cuba buka semula semasa ada internet.';}
}
function initPWA(){
 if(pwaInitialized)return;pwaInitialized=true;
 const button=document.getElementById('install-app');
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;button.hidden=false;});
 button.addEventListener('click',async()=>{if(!installPrompt)return;const prompt=installPrompt;installPrompt=null;button.hidden=true;try{await prompt.prompt();await prompt.userChoice;}catch{document.getElementById('install-help').textContent='Gunakan menu pelayar untuk memasang aplikasi.';}});
 window.addEventListener('appinstalled',()=>{installPrompt=null;button.hidden=true;document.getElementById('install-help').textContent='EYES UP! telah dipasang pada peranti ini.';});
 window.addEventListener('online',renderOfflineStatus);window.addEventListener('offline',renderOfflineStatus);
 setupOffline();
}
initPWA();
