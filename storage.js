'use strict';
// Only small, anonymous counters and display preferences; no audio or identity.
const STORAGE_PREFIX='eyes-up:v1:'+new URL('./',location.href).pathname+':';
let storageAvailable=true,lastProgressJSON='';
function storageNotice(ok){
 storageAvailable=ok;
 const el=document.getElementById('storage-status');
 if(el)el.textContent=ok?'Kemajuan dan tetapan disimpan pada pelayar ini sahaja.':'Simpanan peranti tidak tersedia. Kamu masih boleh berlatih; perubahan hanya untuk sesi ini.';
}
function readLocal(key){try{const raw=localStorage.getItem(STORAGE_PREFIX+key);return raw?JSON.parse(raw):null;}catch{storageNotice(false);return null;}}
function writeLocal(key,value){try{localStorage.setItem(STORAGE_PREFIX+key,JSON.stringify(value));storageNotice(true);return true;}catch{storageNotice(false);return false;}}
function validCount(value){return Number.isSafeInteger(value)&&value>=0&&value<=100000000?value:0;}
function loadProgress(){
 const data=readLocal('progress');if(!data||data.version!==1)return;
 const byNote={};let attempts=0,correct=0;
 for(const note of NOTE_NAMES){const entry=data.byNote?.[note];if(!entry||typeof entry!=='object')continue;const c=validCount(entry.correct),errors=validCount(entry.errors);if(c+errors){byNote[note]={correct:c,errors};correct+=c;attempts+=c+errors;}}
 state.performance={byNote,attempts,correct,bestStreak:Math.min(validCount(data.bestStreak),correct)};
 state.xp=Math.min(validCount(data.xp),correct*10);
}
function saveProgress(){
 const value={version:1,xp:state.xp,bestStreak:state.performance.bestStreak,byNote:state.performance.byNote};
 const json=JSON.stringify(value);if(json===lastProgressJSON)return;
 if(writeLocal('progress',value))lastProgressJSON=json;
}
const DISPLAY_SETTINGS=[['setting-motion','reduce-motion'],['setting-calm','calm-classroom'],['setting-text','large-text']];
function loadPreferences(){
 const prefs=readLocal('preferences');
 for(const [id,cls] of DISPLAY_SETTINGS){const checked=prefs?.[id]===true;document.getElementById(id).checked=checked;document.body.classList.toggle(cls,checked);}
 storageNotice(storageAvailable);
}
function savePreferences(){writeLocal('preferences',Object.fromEntries(DISPLAY_SETTINGS.map(([id])=>[id,document.getElementById(id).checked])));}
function resetSavedProgress(){
 leavePage();resetExercise();state.xp=0;state.performance={attempts:0,correct:0,bestStreak:0,byNote:{}};
 lastProgressJSON='';renderStats();
 document.getElementById('reset-confirmation').hidden=true;
 document.getElementById('reset-progress').focus();
 document.getElementById('reset-status').textContent=storageAvailable?'Kemajuan telah dikosongkan. Tetapan paparan dikekalkan.':'Kemajuan sesi dikosongkan. Simpanan pelayar tidak dapat dikemas kini.';
}
