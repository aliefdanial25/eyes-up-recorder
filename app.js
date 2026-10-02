'use strict';
// Single source of truth: T is the rear thumb hole, followed by front holes 1–7.
const RECORDER_NOTES = Object.freeze({
 G: Object.freeze({frequency:783.99,closed:Object.freeze(['T',1,2,3]),staffY:100,instruction:'Tutup lubang ibu jari belakang serta lubang 1, 2 dan 3.'}),
 A: Object.freeze({frequency:880.00,closed:Object.freeze(['T',1,2]),staffY:90,instruction:'Tutup lubang ibu jari belakang serta lubang 1 dan 2.'}),
 B: Object.freeze({frequency:987.77,closed:Object.freeze(['T',1]),staffY:80,instruction:'Tutup lubang ibu jari belakang dan lubang 1.'}),
 "C'": Object.freeze({frequency:1046.50,closed:Object.freeze(['T',2]),staffY:70,instruction:'Tutup lubang ibu jari belakang dan lubang 2 sahaja.'}),
 "D'": Object.freeze({frequency:1174.66,closed:Object.freeze([2]),staffY:60,instruction:'Buka lubang ibu jari belakang dan tutup lubang 2 sahaja.'})
});
const NOTE_NAMES=Object.keys(RECORDER_NOTES);
const PITCH_TOLERANCE_CENTS=45, REQUIRED_STABLE_FRAMES=7, DEFAULT_RMS_GATE=0.008;
const MIN_FREQUENCY=650, MAX_FREQUENCY=1350, FRAME_INTERVAL_MS=40;
const MODES=[['home','⌂','Home',''],['know','▤','Know It','Kenali not dan penjarian.'],['finger','♧','Finger It','Latih memori dan pertukaran jari.'],['eyes','◎','Eyes Up','Fokus skor tanpa bantuan penjarian.'],['live','◉','Live Practice','Main dan kesan pic masa nyata.'],['assessment','♜','Assessment','Nilai pencapaian dan kesalahan.']];
const COLORS=['#6edaf1','#be9dff','#8ce9b4','#ffc185','#ffda82'];
const EXERCISES={finger:[['G','A','G'],['A','B','A'],['B',"C'",'B'],["C'","D'","C'"]],eyes:[['G','A','B','A','G'],['G','A','G','B','A'],['B',"C'",'B','A','G'],['G','B','A',"C'",'B',"D'","C'",'A','G']]};
const $=id=>document.getElementById(id);
const freshErrors=()=>Object.fromEntries(NOTE_NAMES.map(n=>[n,0]));
let state={mode:'home',sequence:NOTE_NAMES,index:0,errors:freshErrors(),attempts:0,correct:0,firstTry:0,assisted:0,xp:0,streak:0,finished:false,help:false,exercise:0,bestStreak:0,currentWrong:false,completedIndex:-1,microphoneStatus:'IDLE',performance:{attempts:0,correct:0,bestStreak:0,byNote:{}}};
let helpTimer, countdownTimer, advanceTimer, micStream, audioContext, analyser, source, animationFrame;
let initialized=false,referenceRequest=0,referenceOscillator=null,referenceGain=null;
let micRequest=0, lastFrame=0, stableKey='',stableFrames=0,latchedKey='',silenceFrames=0,busy=false,referenceUntil=0;
const MIC_CALIBRATION_VERSION=1, MIC_AMBIENT_MS=2200, MIC_SIGNAL_MS=3000;
let micCalibration=null,forceRecalibration=false;
function target(){return state.sequence[state.index];}
function training(){return ['eyes','live','assessment'].includes(state.mode);}
function resetDetector(){stableKey='';stableFrames=0;latchedKey='';silenceFrames=0;}
// One cleanup path for all lesson timers. Completed notes remain committed.
function clearTimers(){
 clearTimeout(helpTimer);clearInterval(countdownTimer);clearTimeout(advanceTimer);
 helpTimer=countdownTimer=advanceTimer=null;busy=false;state.help=false;
 const countdown=$('countdown');if(countdown)countdown.hidden=true;
 stopReference();
}
function stopReference(){
 referenceRequest++;referenceUntil=0;
 if(referenceOscillator){referenceOscillator.onended=null;try{referenceOscillator.stop();}catch{}referenceOscillator.disconnect();}
 if(referenceGain)referenceGain.disconnect();referenceOscillator=referenceGain=null;
}
function leavePage(){clearTimers();stopMic();}
function resetExercise(){
 Object.assign(state,{index:0,errors:freshErrors(),attempts:0,correct:0,firstTry:0,currentWrong:false,assisted:0,help:false,streak:0,bestStreak:0,completedIndex:-1,finished:false});
}
function updateRecorder(){
 const container=$('recorder'),note=target(),data=RECORDER_NOTES[note];
 if(!container.querySelector('svg'))container.innerHTML=recorderSVG(note);
 const svg=container.querySelector('svg');svg.setAttribute('aria-label',`Rekoder soprano, penjarian ${note}. Lima lubang tunggal dan dua pasangan lubang berganda. ${data.instruction}`);
 container.querySelectorAll('.hole').forEach(hole=>{const logical=hole.dataset.hole==='T'?'T':Number(hole.dataset.hole),closed=data.closed.includes(logical);hole.classList.toggle('closed',closed);hole.classList.toggle('open',!closed);hole.dataset.closed=String(closed);hole.querySelector('title').textContent=`Lubang ${hole.dataset.part}: ${closed?'tutup':'buka'}`;});
}
// Physical geometry is rendered by the UI; fingering still comes only from RECORDER_NOTES.
function recorderSVG(note,decorative=false){return realisticRecorder(note,RECORDER_NOTES[note],decorative);}
function renderScore(){
 const seq=state.sequence,w=Math.max(480,seq.length*66+100),gap=(w-115)/seq.length;
 const lines=[40,60,80,100,120].map(y=>`<line x1="25" y1="${y}" x2="${w-20}" y2="${y}" stroke="#698097" stroke-width="1.3"/>`).join('');
 const notes=seq.map((n,i)=>{const x=100+i*gap,y=RECORDER_NOTES[n].staffY;return `<g>${i===state.index?`<rect class="current-box" x="${x-22}" y="23" width="44" height="135" rx="10"/>`:''}<ellipse cx="${x}" cy="${y}" rx="10" ry="7" transform="rotate(-20 ${x} ${y})" fill="${i===state.index?'#00769b':'#223e59'}"/><line x1="${x-9}" y1="${y}" x2="${x-9}" y2="${y+39}" stroke="#223e59" stroke-width="2.5"/>${$('show-names').checked?`<text x="${x}" y="150" text-anchor="middle" font-size="17" font-family="sans-serif" fill="#284b67">${n}</text>`:''}</g>`;}).join('');
 $('score').innerHTML=`<svg class="score-svg" style="min-width:${seq.length>5?w:training()?600:240}px" viewBox="0 0 ${w} 178" role="img" aria-label="Skor latihan; ${$('show-names').checked?seq.join(', '):'nama not disembunyikan'}"><rect width="${w}" height="178" fill="transparent"/>${lines}<text x="28" y="115" font-size="95" fill="#254b69" font-family="Segoe UI Symbol, Noto Music, serif">𝄞</text>${notes}<path class="reading-cursor" d="M ${100+state.index*gap-5} 12 l 5 7 l 5 -7" fill="#008cad"/></svg>`;
 keepCurrentNoteVisible();
}
function keepCurrentNoteVisible(){
 const container=$('score'),svg=container.querySelector('svg'),highlight=container.querySelector('.current-box');
 if(!svg||!highlight||$('workspace').hidden)return;
 // Use the painted position: fixed-height notation may be centred inside its SVG.
 const bounds=highlight.getBoundingClientRect(),viewport=container.getBoundingClientRect();
 const x=container.scrollLeft+bounds.left-viewport.left+bounds.width/2;
 container.scrollLeft=Math.max(0,x-container.clientWidth/2);
}
function renderGuide(){
 const visible=state.mode==='know'||state.help;
 $('recorder').hidden=!visible;$('guide-lock').hidden=visible;$('legend').hidden=!visible;
 updateRecorder();
 $('fingering-instruction').textContent=visible?RECORDER_NOTES[target()].instruction:'Ingat posisi jari. Kekalkan mata pada skor.';
 $('help-button').hidden=state.mode==='know'||state.mode==='assessment';
 $('help-button').textContent=state.mode==='finger'?'Lihat Semula':'Perlukan Bantuan?';
 $('guide-badge').textContent=visible?'LIHAT & INGAT':'FOKUS SKOR';
 $('guide-lock').querySelector('h3').textContent=state.mode==='finger'?'INGAT PENJARIAN':'EYES UP MODE';
 $('guide-lock').querySelector('p').innerHTML=state.mode==='finger'?'Bayangkan posisi jari.<br>Kamu boleh mengingatinya.':'Fokus mata pada skor.<br>Penjarian dikunci.';
 document.querySelector('.guide-panel').classList.toggle('is-locked',!visible);
}
function showHelp(duration=2500){
 if(!['finger','eyes','live'].includes(state.mode)||state.finished)return;
 clearTimeout(helpTimer);clearInterval(countdownTimer);state.help=true;state.assisted++;renderGuide();
 $('countdown').hidden=false;let remaining=Math.ceil(duration/1000);$('countdown').textContent=remaining;
 countdownTimer=setInterval(()=>{$('countdown').textContent=Math.max(1,--remaining);},1000);
 helpTimer=setTimeout(()=>{state.help=false;$('countdown').hidden=true;clearInterval(countdownTimer);helpTimer=countdownTimer=null;renderGuide();},duration);
}
function feedback(text,type=''){ recordUIAttempt(type);  $('feedback').textContent=text;$('feedback').className=`feedback ${type}`; }
function renderStats(){ updateUIStats();  $('xp').textContent=`${state.xp} XP`;$('progress-xp').textContent=`${state.xp} XP`;$('xp-progress').value=state.xp%100;$('streak').textContent=`${state.streak} streak`;$('stars').textContent=[30,60,100].map(v=>state.xp>=v?'★':'☆').join(' '); saveProgress(); }
function renderLesson(){
 $('target-note').textContent=target();$('sequence-progress').textContent=`${state.index+1} / ${state.sequence.length}`;
 renderScore();renderGuide();$('countdown').hidden=true;updateLessonUI();
 $('note-cards').hidden=state.mode!=='know';$('note-cards').innerHTML=NOTE_NAMES.map(n=>`<button data-note="${n}" class="${n===target()?'active':''}" aria-pressed="${n===target()}">${miniStaff(n)}<span>${n}</span></button>`).join('');
 $('previous').hidden=training();$('next').hidden=training();$('previous').disabled=state.index===0;
 $('next').textContent=state.index===state.sequence.length-1?(state.mode==='know'?'Teruskan Finger It':'Latihan selesai'):'Seterusnya';
 $('tone-button').hidden=state.mode==='assessment';$('scaffold').hidden=true;
 $('score-caption').textContent=training()?'TIUP NOT YANG DISERLAHKAN':'KENALI & INGAT';
 feedback(training()?'Tiup not sasaran. Tahan bunyi dengan stabil.':state.mode==='finger'?'Ingat penjarian sebelum panduan hilang.':'Pilih not dan kenali penjarian.');
 resetDetector();if(state.mode==='finger')showHelp(3000);
}
function setMode(mode,customSequence){
 $('settings').hidden=true;
 if(mode==='performance'){showPerformance();return;}
 if(!MODES.some(m=>m[0]===mode))mode='home';
 document.body.dataset.mode=mode;$('performance').hidden=true;leavePage();
 state={...state,mode,index:0,errors:freshErrors(),attempts:0,correct:0,firstTry:0,assisted:0,finished:false,help:false,exercise:0,streak:0,currentWrong:false,bestStreak:0,completedIndex:-1};
 state.sequence=customSequence|| (mode==='finger'?EXERCISES.finger[0]:mode==='eyes'||mode==='live'?EXERCISES.eyes[0]:mode==='assessment'?EXERCISES.eyes[3]:NOTE_NAMES);
 document.querySelectorAll('button[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.classList.toggle('selected',active);if(b.closest('nav'))b.setAttribute('aria-current',active?'page':'false');});
 $('home-panel').hidden=mode!=='home';$('workspace').hidden=mode==='home';$('results').hidden=true;
 const titles={home:['Mata ke atas. Muzik bermula.','Kenali lima not. Bina memori jari. Main dengan yakin.'],know:['Kenali not. Temui bunyinya.','Lihat skor, kenali penjarian dan dengar nada rujukan.'],finger:['Lihat. Ingat. Gerakkan jari.','Kamu ada 3 saat untuk mengingati setiap penjarian.'],eyes:['Eyes up. Percayakan jari kamu.','Fokus pada skor. Main not yang diserlahkan dengan rekoder.'],live:['Giliran kamu untuk bermain.','Aktifkan mikrofon, tiup lembut dan tahan setiap not.'],assessment:['Sedia untuk cabaran lima not?','Main kesemua 9 not tanpa bantuan penjarian.']};
 $('page-title').textContent=titles[mode][0];$('page-description').textContent=titles[mode][1];$('step-label').textContent=mode==='home'?'MISI HARI INI':`MOD 0${MODES.findIndex(m=>m[0]===mode)} / ${MODES.find(m=>m[0]===mode)[2].toUpperCase()}`;
 $('show-names').checked=!['eyes','assessment'].includes(mode);
 const exercises=mode==='finger'?EXERCISES.finger:EXERCISES.eyes;
 $('exercise-label').hidden=!['finger','eyes','live'].includes(mode)||!!customSequence;
 $('exercise-select').innerHTML=exercises.map((seq,i)=>`<option value="${i}">${i+1}. ${seq.join(' → ')}</option>`).join('');
 if(mode!=='home')renderLesson();renderStats();
}
function chooseIndex(i){if(i<0||i>=state.sequence.length)return;clearTimers();state.index=i;state.completedIndex=-1;state.currentWrong=false;renderLesson();}
function advance(){if(state.index<state.sequence.length-1)chooseIndex(state.index+1);else finish();}
function mostDifficult(){return NOTE_NAMES.reduce((best,n)=>state.errors[n]>state.errors[best]?n:best,'G');}
function adaptiveSequence(note){if(note==="C'")return ['B',"C'",'B',"C'","D'","C'",'A','B',"C'",'B','B',"C'","D'","C'"];const i=NOTE_NAMES.indexOf(note),prev=NOTE_NAMES[Math.max(0,i-1)],next=NOTE_NAMES[Math.min(4,i+1)];return [prev,note,prev,note,next,note,prev,note,next,note];}
function finish(){
 leavePage();state.finished=true;$('workspace').hidden=true;$('results').hidden=false;
 const measured=training(), difficult=mostDifficult(),wrong=Object.values(state.errors).reduce((a,b)=>a+b,0),accuracy=state.attempts?Math.round(state.correct/state.attempts*100):0;
 const completedNotes=state.sequence.slice(0,state.correct),strongest=NOTE_NAMES.filter(n=>completedNotes.includes(n)).sort((a,b)=>{const count=n=>completedNotes.filter(v=>v===n).length;return count(b)/(count(b)+state.errors[b])-count(a)/(count(a)+state.errors[a]);})[0]||'—';
 const recommendation=wrong?(difficult==="C'"?"Fokus latihan C' dan peralihan B → C' → D'.":`Fokus latihan ${difficult} dan pertukaran kepada not bersebelahan.`):'Hebat! Teruskan berlatih dengan nama not disembunyikan.';
 $('results').innerHTML=`<span class="eyebrow">${measured?'PRESTASI SESI INI':'LATIHAN MEMORI'}</span><div class="result-medal" aria-hidden="true">★</div><h2>Syabas!</h2><div class="result-subtitle">MISI SELESAI</div><img class="result-companion" src="assets/mascot.webp" width="90" height="105" alt="Maskot meraikan usaha kamu"><p>${measured?'Kamu berjaya memainkan semua not sasaran.':'Latihan jari selesai. Cuba Eyes Up untuk semakan bunyi melalui mikrofon.'}</p>${measured?`<div class="result-numbers"><div><strong>${accuracy}%</strong><span>Ketepatan cubaan</span></div><div><strong>${state.firstTry} / ${state.sequence.length}</strong><span>Not betul cubaan pertama</span></div><div><strong>${state.attempts}</strong><span>Jumlah cubaan</span></div><div><strong>${state.bestStreak}</strong><span>Streak terbaik</span></div></div><p>Not diselesaikan: ${state.correct} / ${state.sequence.length} · Bantuan digunakan: ${state.assisted}</p><h3>Kesalahan mengikut not</h3>${NOTE_NAMES.map(n=>`<div class="error-row"><span>${n}</span><div class="error-bar"><i style="width:${state.errors[n]/Math.max(1,...Object.values(state.errors))*100}%"></i></div><span>${state.errors[n]}</span></div>`).join('')}<div class="strength-grid"><div><span>NOT TERKUAT SESI INI</span><strong>${strongest}</strong><p>Ketepatan tertinggi bagi not yang dimainkan.</p></div><div><span>LATIH LAGI</span><strong>${wrong?difficult:'Tiada kesalahan'}</strong><p>${wrong?'Beri not ini sedikit lagi latihan.':'Cuba latihan seterusnya.'}</p></div></div><h3>Cadangan latihan</h3><p>${recommendation}</p>`:''}<div class="result-actions"><button class="${wrong||!measured?'secondary':'primary'}" id="retry">Latih semula</button>${wrong?'<button class="primary" id="adaptive">Latihan tambahan</button>':''}${!measured?'<button class="primary" data-mode="eyes">Teruskan Eyes Up</button>':''}<button class="secondary" data-mode="home">Kembali ke Home</button></div>`;
 $('retry').onclick=()=>setMode(state.mode,[...state.sequence]);if($('adaptive'))$('adaptive').onclick=()=>setMode('live',adaptiveSequence(difficult));renderStats();
}

// Device-adaptive microphone calibration. Audio never leaves the browser.
function rmsLevel(samples){
 let sum=0,mean=0;for(const x of samples)mean+=x;mean/=samples.length;
 for(const x of samples)sum+=(x-mean)**2;
 return Math.sqrt(sum/samples.length);
}
function percentile(values,p){
 if(!values.length)return 0;
 const sorted=[...values].sort((a,b)=>a-b),index=Math.min(sorted.length-1,Math.max(0,Math.round((sorted.length-1)*p)));
 return sorted[index];
}
function currentRmsGate(){
 return Number.isFinite(micCalibration?.detectionThreshold)&&micCalibration.detectionThreshold>0?micCalibration.detectionThreshold:DEFAULT_RMS_GATE;
}
function loadMicCalibration(){
 if(typeof readLocal!=='function')return null;
 const saved=readLocal('mic-calibration');
 if(saved?.version===MIC_CALIBRATION_VERSION&&Number.isFinite(saved.noiseFloor)&&Number.isFinite(saved.recorderSignalLevel)&&Number.isFinite(saved.detectionThreshold)&&saved.detectionThreshold>0){
  micCalibration=saved;
 }else micCalibration=null;
 return micCalibration;
}
function updateCalibrationUI(message=''){
 const el=$('calibration-status');if(!el)return;
 if(message){el.textContent=message;return;}
 if(forceRecalibration)el.textContent='Peranti mikrofon berubah atau kalibrasi semula dipilih.';
 else if(micCalibration)el.textContent='Kalibrasi peranti aktif ✓';
 else el.textContent='Belum dikalibrasi pada peranti ini.';
}
function saveMicCalibration(value){
 micCalibration=value;forceRecalibration=false;
 if(typeof writeLocal==='function')writeLocal('mic-calibration',value);
 updateCalibrationUI();
}
const waitMs=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function collectRmsWindow(analyserNode,durationMs,request){
 const samples=new Float32Array(analyserNode.fftSize),levels=[],start=performance.now();
 while(performance.now()-start<durationMs){
  if(request!==micRequest){const error=new Error('Calibration cancelled');error.name='AbortError';throw error;}
  analyserNode.getFloatTimeDomainData(samples);levels.push(rmsLevel(samples));await waitMs(50);
 }
 return levels;
}
async function calibrateMicrophone(request,stream,analyserNode){
 setMicStatus('CALIBRATING');
 updateCalibrationUI('Kalibrasi sedang dijalankan…');
 $('mic-message').textContent='Kalibrasi 1/2 · Kekal senyap selama 2 saat untuk mengukur bunyi persekitaran.';
 await waitMs(350);
 const ambient=await collectRmsWindow(analyserNode,MIC_AMBIENT_MS,request);
 const noiseFloor=Math.max(0.0003,percentile(ambient,.75));
 $('mic-message').textContent='Kalibrasi 2/2 · Tiup satu not rekoder dengan stabil selama kira-kira 3 saat.';
 await waitMs(650);
 const signalWindow=await collectRmsWindow(analyserNode,MIC_SIGNAL_MS,request);
 const candidates=signalWindow.filter(value=>value>noiseFloor*1.12);
 const recorderSignalLevel=percentile(candidates.length?candidates:signalWindow,.75);
 if(!Number.isFinite(recorderSignalLevel)||recorderSignalLevel<=noiseFloor*1.18){
  updateCalibrationUI('Kalibrasi belum berjaya. Cuba semula dalam keadaan lebih senyap.');
  return false;
 }
 const detectionThreshold=Math.max(0.0008,Math.min(0.06,noiseFloor+(recorderSignalLevel-noiseFloor)*0.30));
 const normalizationFactor=Math.max(0.5,Math.min(8,0.05/recorderSignalLevel));
 const deviceId=stream.getAudioTracks()[0]?.getSettings?.().deviceId||'';
 saveMicCalibration({version:MIC_CALIBRATION_VERSION,noiseFloor,recorderSignalLevel,detectionThreshold,normalizationFactor,deviceId,calibratedAt:new Date().toISOString()});
 $('mic-message').textContent='Kalibrasi siap ✓ Mikrofon disesuaikan untuk peranti ini.';
 await waitMs(450);
 return true;
}

// YIN: normalized difference and parabolic interpolation, not FFT bins.
// Search beyond the exercise range first so a low octave is rejected, not relabelled.
function detectPitch(samples,sampleRate){
 let energy=0,mean=0;for(const x of samples)mean+=x;mean/=samples.length;for(const x of samples)energy+=(x-mean)**2;
 if(Math.sqrt(energy/samples.length)<currentRmsGate())return null;
 const maxTau=Math.min(Math.floor(sampleRate/300),Math.floor(samples.length/2)),minTau=Math.floor(sampleRate/1800),size=samples.length-maxTau,diff=new Float64Array(maxTau+1);
 let sum=0;diff[0]=1;
 for(let tau=1;tau<=maxTau;tau++){let d=0;for(let i=0;i<size;i++){const delta=samples[i]-samples[i+tau];d+=delta*delta;}sum+=d;diff[tau]=sum?d*tau/sum:1;}
 let tau=-1;for(let t=minTau;t<maxTau;t++){if(diff[t]<0.15){while(t+1<maxTau&&diff[t+1]<diff[t])t++;tau=t;break;}}
 if(tau<0||diff[tau]>.2)return null;
 const a=diff[tau-1],b=diff[tau],c=diff[tau+1],den=a-2*b+c,refined=tau+(den?(a-c)/(2*den):0),frequency=sampleRate/refined;
 return frequency>=MIN_FREQUENCY&&frequency<=MAX_FREQUENCY?frequency:null;
}
function classifyPitch(frequency){let note=NOTE_NAMES[0],distance=Infinity;for(const n of NOTE_NAMES){const cents=1200*Math.log2(frequency/RECORDER_NOTES[n].frequency);if(Math.abs(cents)<distance){distance=Math.abs(cents);note=n;}}return {note,distance,cents:1200*Math.log2(frequency/RECORDER_NOTES[target()].frequency)};}
// One attempt per sustained note. Release (five quiet frames) or change pitch
// before another wrong attempt can be counted; a held wrong note is not 7 errors.
function processPitch(frequency){
 if(!frequency){silenceFrames++;stableFrames=0;stableKey='';if(silenceFrames>=5)latchedKey='';$('detected-note').textContent='—';$('frequency').innerHTML='— <small>Hz</small>';$('mic-message').textContent='Menunggu bunyi rekoder...';return;}
 silenceFrames=0;const p=classifyPitch(frequency),correct=Math.abs(p.cents)<=PITCH_TOLERANCE_CENTS,key=p.distance<=PITCH_TOLERANCE_CENTS?p.note:`${p.note}-tidak-tepat`;
 $('detected-note').textContent=p.distance<=PITCH_TOLERANCE_CENTS?p.note:'—';$('frequency').innerHTML=`${frequency.toFixed(1)} <small>Hz</small>`;$('meter-needle').style.left=`${50+Math.max(-50,Math.min(50,p.cents/3))}%`;$('cents-label').textContent=`${p.cents>=0?'+':''}${Math.round(p.cents)} cents daripada sasaran`;$('mic-message').textContent='Mendengar rekoder...';
 if(performance.now()<referenceUntil){resetDetector();return;}
 if(busy||state.finished||!training()||state.completedIndex===state.index)return;
 if(key===stableKey)stableFrames++;else{stableKey=key;stableFrames=1;}
 if(stableFrames<REQUIRED_STABLE_FRAMES||latchedKey===key)return;latchedKey=key;state.attempts++;
 if(correct){state.completedIndex=state.index;state.correct++;if(!state.currentWrong){state.firstTry++;state.xp+=10;}state.currentWrong=false;state.streak++;feedback(`✓ TEPAT! NOT ${target()} BETUL`,'correct');busy=true;renderStats();advanceTimer=setTimeout(()=>{busy=false;advance();},700);}
 else{state.currentWrong=true;state.errors[target()]++;state.streak=0;feedback(`✕ CUBA LAGI · Sasaran: ${target()} · ${p.distance<=PITCH_TOLERANCE_CENTS?'Dikesan: '+p.note:'Pic belum tepat. Laraskan tiupan.'}`,'wrong');renderStats();if(state.errors[target()]>=3&&state.mode!=='assessment'){$('scaffold').hidden=false;$('scaffold-text').textContent=`Perlukan bantuan penjarian ${target()}?`;}}
}
// Resource handles stay private to this module; lifecycle status belongs to state.
async function getAudio(){
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio)throw new Error('AudioContext unavailable');
 if(!audioContext||audioContext.state==='closed'){
  audioContext=new Audio();
  audioContext.onstatechange=()=>{if(state.microphoneStatus==='ACTIVE'&&audioContext.state!=='running'){stopMic();$('mic-message').textContent='Audio dijeda oleh peranti. Tekan Aktifkan mikrofon untuk menyambung.';}};
 }
 if(audioContext.state!=='running')await audioContext.resume();
 return audioContext;
}
async function playReference(){
 if(!['know','finger','eyes','live'].includes(state.mode)||state.finished)return;
 stopReference();resetDetector();const request=referenceRequest,note=target();
 // Block evaluation while resume() is pending as well as during playback/tail.
 referenceUntil=Infinity;
 try{
  const ctx=await getAudio();if(request!==referenceRequest)return;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain();referenceOscillator=oscillator;referenceGain=gain;
  oscillator.type='sine';oscillator.frequency.value=RECORDER_NOTES[note].frequency;
  gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.12,ctx.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.75);
  oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+.8);
  // Infinity until actual audio completion also covers interrupted AudioContext.
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(request!==referenceRequest)return;referenceOscillator=referenceGain=null;referenceUntil=performance.now()+800;resetDetector();};
 }catch(error){if(request!==referenceRequest)return;stopReference();resetDetector();diagnostic('reference',error);feedback('Nada rujukan tidak tersedia. Kamu masih boleh meneruskan latihan.');}
}
function setMicStatus(status){
 state.microphoneStatus=status;
 const locked=status==='REQUESTING'||status==='STOPPING'||status==='CALIBRATING';
 $('mic-button').disabled=locked;
 $('mic-button').textContent=status==='ACTIVE'?'Matikan mikrofon':status==='CALIBRATING'?'Sedang kalibrasi…':'Aktifkan mikrofon';
 $('mic-status').textContent=status==='ACTIVE'?'MIC ON ●':status==='CALIBRATING'?'CALIBRATING…':'MIC OFF';
 $('mic-status').classList.toggle('on',status==='ACTIVE');
 const recalibrate=$('recalibrate-button');if(recalibrate)recalibrate.disabled=locked;
}
async function startMic(){
 if(state.microphoneStatus==='REQUESTING'||state.microphoneStatus==='STOPPING')return;
 if(state.microphoneStatus==='ACTIVE'){stopMic();return;}
 if(!['know','finger','eyes','live','assessment'].includes(state.mode)||state.finished)return;
 // A stop during the 700 ms success delay must not award the same note twice.
 if(state.completedIndex===state.index){advance();if(state.finished)return;}
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){$('mic-message').textContent='Mikrofon memerlukan pelayar yang menyokong audio serta HTTPS atau localhost (Live Server).';return;}
 const request=++micRequest;setMicStatus('REQUESTING');$('mic-message').textContent='Benarkan akses mikrofon dalam pelayar...';
 let acquiredStream;
 try{
  const ctx=await getAudio();if(request!==micRequest)return;
  acquiredStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  if(request!==micRequest){acquiredStream.getTracks().forEach(t=>t.stop());return;}
  micStream=acquiredStream;source=ctx.createMediaStreamSource(micStream);analyser=ctx.createAnalyser();analyser.fftSize=2048;source.connect(analyser);
  const currentDeviceId=micStream.getAudioTracks()[0]?.getSettings?.().deviceId||'';
  const deviceChanged=Boolean(micCalibration?.deviceId&&currentDeviceId&&micCalibration.deviceId!==currentDeviceId);
  if(!micCalibration||forceRecalibration||deviceChanged){
   const calibrated=await calibrateMicrophone(request,micStream,analyser);
   if(request!==micRequest)return;
   if(!calibrated){stopMic();$('mic-message').textContent='Kalibrasi belum berjaya. Tekan Kalibrasi Semula dan tiup satu not dengan stabil.';return;}
  }
  resetDetector();setMicStatus('ACTIVE');updateCalibrationUI();$('mic-message').textContent='Menunggu bunyi rekoder...';
  const samples=new Float32Array(analyser.fftSize);lastFrame=0;
  const loop=time=>{
   animationFrame=null;if(request!==micRequest||state.microphoneStatus!=='ACTIVE')return;
   try{if(time-lastFrame>=FRAME_INTERVAL_MS){lastFrame=time;analyser.getFloatTimeDomainData(samples);drawWaveform(samples);processPitch(detectPitch(samples,ctx.sampleRate));}}
   catch(error){diagnostic('detector',error);stopMic();$('mic-message').textContent='Pengesan pic terhenti. Aktifkan semula mikrofon atau teruskan Know It dan Finger It.';return;}
   if(request===micRequest&&state.microphoneStatus==='ACTIVE')animationFrame=requestAnimationFrame(loop);
  };
  animationFrame=requestAnimationFrame(loop);
  micStream.getTracks().forEach(track=>track.onended=()=>{if(request!==micRequest)return;stopMic();$('mic-message').textContent='Mikrofon terputus. Aktifkan semula untuk meneruskan.';});
 }catch(error){
  if(request!==micRequest){if(acquiredStream)acquiredStream.getTracks().forEach(t=>t.stop());return;}
  diagnostic('microphone',error);stopMic();
  $('mic-message').textContent=error.name==='NotAllowedError'?'Benarkan akses mikrofon untuk menggunakan Pitch Detector.':error.name==='NotFoundError'?'Tiada mikrofon ditemui. Sambungkan mikrofon dan cuba lagi.':error.name==='NotReadableError'?'Mikrofon sedang digunakan atau tidak dapat dibaca. Tutup aplikasi lain yang menggunakan mikrofon dan cuba lagi.':'Mikrofon tidak dapat dimulakan. Semak sambungan atau tutup aplikasi lain yang menggunakan mikrofon.';
 }
 // No stale finally handler: only the current request may change the button.
}
function stopMic(){
 setMicStatus('STOPPING');micRequest++;cancelAnimationFrame(animationFrame);animationFrame=null;
 clearTimers();
 if(micStream)micStream.getTracks().forEach(track=>{track.onended=null;track.stop();});micStream=null;
 if(source)source.disconnect();if(analyser)analyser.disconnect();source=analyser=null;
 resetDetector();setMicStatus('IDLE');
 $('detected-note').textContent='—';$('frequency').innerHTML='— <small>Hz</small>';$('meter-needle').style.left='50%';$('wave-path').setAttribute('d','M0 21 H400');
 $('cents-label').textContent='Tiup satu not dengan stabil.';$('mic-message').textContent='Aktifkan mikrofon untuk mendengar rekoder kamu.';
 if(state.mode!=='home'&&['know','finger','eyes','live','assessment'].includes(state.mode)&&!state.finished)renderGuide();
}
function diagnostic(area,error){
 if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).has('debug'))console.warn('[EYES UP: '+area+']',error);
}
function reportUnexpectedError(error){
 diagnostic('unexpected',error);
 const message=$('app-message');if(message){message.hidden=false;message.textContent='Ada gangguan sementara. Cuba buka semula mod latihan atau muat semula halaman.';}
}
function init(){
 if(initialized)return;initialized=true;
 loadProgress();loadMicCalibration();updateCalibrationUI();
 if(navigator.mediaDevices?.addEventListener)navigator.mediaDevices.addEventListener('devicechange',()=>{
  forceRecalibration=true;updateCalibrationUI('Peranti mikrofon berubah. Kalibrasi semula disyorkan.');
  if(state.microphoneStatus==='ACTIVE')$('mic-message').textContent='Peranti mikrofon berubah. Kalibrasi semula disyorkan sebelum meneruskan.';
 });
 // Resizing is independent of the audio loop; no per-frame layout reads.
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(keepCurrentNoteVisible).observe($('score'));
 else window.addEventListener('resize',keepCurrentNoteVisible);
 window.addEventListener('error',event=>reportUnexpectedError(event.error));
 window.addEventListener('unhandledrejection',event=>reportUnexpectedError(event.reason));
 $('navigation').innerHTML=[...MODES,['performance','▥','Performance','']].map(([id,icon,name])=>`<button data-mode="${id}"><span aria-hidden="true">${uiIcon(id)}</span>${name}</button>`).join('');
 $('module-cards').innerHTML=MODES.slice(1).map(([id,icon,name,description],i)=>`<button class="module-card" data-mode="${id}" style="--accent:${COLORS[i]}"><span class="module-icon" aria-hidden="true">${uiIcon(id)}</span><div><strong>${name.toUpperCase()}</strong><p>${description}</p></div><span class="number">0${i+1}</span></button>`).join('');
 $('home-recorder').innerHTML=recorderSVG('G',true);
 document.addEventListener('click',e=>{const modeButton=e.target.closest('button[data-mode]');if(modeButton){setMode(modeButton.dataset.mode);return;}const noteButton=e.target.closest('[data-note]');if(noteButton)chooseIndex(NOTE_NAMES.indexOf(noteButton.dataset.note));});
 $('previous').onclick=()=>chooseIndex(Math.max(0,state.index-1));$('next').onclick=()=>{if(state.mode==='know'&&state.index===4)setMode('finger');else advance();};
 $('exercise-select').onchange=e=>{leavePage();state.exercise=Number(e.target.value);state.sequence=(state.mode==='finger'?EXERCISES.finger:EXERCISES.eyes)[state.exercise];resetExercise();renderLesson();renderStats();};
 $('show-names').onchange=renderScore;$('tone-button').onclick=playReference;$('mic-button').onclick=startMic;$('recalibrate-button').onclick=()=>{forceRecalibration=true;updateCalibrationUI();if(state.microphoneStatus==='ACTIVE')stopMic();startMic();};$('help-button').onclick=()=>showHelp();$('scaffold-button').onclick=()=>showHelp();
 window.addEventListener('pagehide',leavePage);document.addEventListener('visibilitychange',()=>{if(document.hidden)leavePage();});
 setMode('home');
}
if(typeof document!=='undefined')init();
// Exports are for local automated DSP tests; the website requires no build tools.
if(typeof module!=='undefined')module.exports={RECORDER_NOTES,detectPitch,adaptiveSequence,PITCH_TOLERANCE_CENTS,REQUIRED_STABLE_FRAMES};

