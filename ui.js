'use strict';
// Presentation layer. Never owns frequency, fingering, or pitch acceptance rules.


// Physical openings map to logical fingering holes; no note data lives here.
const VISUAL_HOLE_MAP = Object.freeze({
 1:Object.freeze(['front-1']), 2:Object.freeze(['front-2']),
 3:Object.freeze(['front-3']), 4:Object.freeze(['front-4']),
 5:Object.freeze(['front-5']), 6:Object.freeze(['front-6L','front-6R']),
 7:Object.freeze(['front-7L','front-7R'])
});
function realisticRecorder(note,data,decorative){
 const id=decorative?'hero':'lesson';
 const opening=(hole,x,y,r,visualId)=>{const closed=data.closed.includes(hole),part=visualId.replace('front-','').replace('rear-thumb','T');return `<circle id="${decorative?'hero-':''}${visualId}" class="hole ${closed?'closed':'open'}" data-hole="${hole}" data-part="${part}" data-opening="${visualId}" data-closed="${closed}" cx="${x}" cy="${y}" r="${r}" stroke-width="2"><title>Lubang ${part}: ${closed?'tutup':'buka'}</title></circle>`;};
 const front=[1,2,3,4,5].map((h,i)=>{const y=274+i*43;return `<g class="front-hole" data-group="${h}">${opening(h,160+(h===3?2:0),y,h===5?6.5:8,VISUAL_HOLE_MAP[h][0])}<path d="M188 ${y}h19" stroke="#a7d9f1" opacity=".7"/><text x="217" y="${y+5}" class="hole-label">${h}</text></g>`;}).join('');
 // Only two openings in each lower group: never draw an extra single hole 6/7.
 const doubles=[6,7].map((h,i)=>{const y=490+i*60;return `<g class="front-hole double-hole" data-group="${h}">${VISUAL_HOLE_MAP[h].map((visualId,j)=>opening(h,j===0?152:169,y+(j===0?0:2),j===0?7:5.2,visualId)).join('')}<path d="M146 ${y+13}v4h30v-4M189 ${y}h18" fill="none" stroke="#a7d9f1" opacity=".7"/><text x="217" y="${y+4}" class="hole-label">${h}</text><text x="217" y="${y+23}" class="pair-label">${h}L + ${h}R</text></g>`;}).join('');
 return `<svg class="recorder-svg" viewBox="0 0 290 660" role="img" aria-label="Rekoder soprano, penjarian ${note}. Lima lubang tunggal dan dua pasangan lubang berganda. ${data.instruction}">
 <defs><linearGradient id="ivory-${id}"><stop stop-color="#937f54"/><stop offset=".12" stop-color="#d4c491"/><stop offset=".32" stop-color="#fff9d9"/><stop offset=".5" stop-color="#eee2b6"/><stop offset=".76" stop-color="#cfbb84"/><stop offset=".93" stop-color="#ac9866"/><stop offset="1" stop-color="#f3e6b8"/></linearGradient><linearGradient id="ring-${id}" x2="0" y2="1"><stop stop-color="#fff5cc"/><stop offset=".3" stop-color="#d8c799"/><stop offset=".65" stop-color="#8e7e55"/><stop offset="1" stop-color="#eddfb1"/></linearGradient><linearGradient id="window-${id}" x2="0" y2="1"><stop stop-color="#161b18"/><stop offset="1" stop-color="#8c7b51"/></linearGradient></defs>
 <ellipse cx="161" cy="642" rx="59" ry="9" fill="#020b22" opacity=".6"/>
 <g class="recorder-physical" fill="url(#ivory-${id})" stroke="#dfcc99" stroke-width="1">
 <path class="mouthpiece" d="M145 18 Q160 13 175 18 L175 34 Q186 53 184 80 L182 101 H138 L136 81 Q134 57 142 37Z"/>
 <path d="M143 18Q160 22 177 18L176 26Q160 29 144 25Z" fill="#bba877"/>
 <path class="head-joint" d="M137 99H183L180 176Q178 194 188 214Q190 229 179 234H141Q130 228 133 215Q142 194 140 175Z"/>
 <path class="windway" d="M147 111H174V138Q161 151 147 139Z" fill="url(#window-${id})" stroke="#aa9565"><title>Windway / window — bukan lubang penjarian</title></path>
 <path class="labium" d="M147 133L173 131L170 154Q159 163 150 153Z" fill="#e7d6a4"/><path d="M147 133L173 131" stroke="#fff4ca" stroke-width="2"/>
 <path class="body body-joint" d="M142 234H179L179 249L177 510H143L142 249Z"/>
 <path d="M150 245Q146 382 150 504" fill="none" stroke="#fffce2" stroke-width="3" opacity=".6"/>
 <path class="foot-joint" d="M140 511Q160 506 181 511L183 565Q183 579 174 585L173 606Q173 619 185 627V640Q161 650 134 640V627Q146 615 146 605L145 585Q136 579 138 564Z"/>
 ${[94,103,177,185,221,234,507,518,573,584,629,640].map((y,i)=>`<path d="M${y>600?134:y>500?138:135} ${y}Q160 ${y+5} ${y>600?185:y>500?184:187} ${y}" fill="none" stroke="url(#ring-${id})" stroke-width="${i%2?4:6}"/>`).join('')}
 </g>
 <g class="thumb-inset"><rect x="4" y="238" width="102" height="155" rx="17" fill="#101f41" stroke="#77c9f3"/><text x="55" y="261" text-anchor="middle" class="inset-title">BELAKANG</text><path d="M42 276Q55 270 68 276L69 343Q55 349 41 343Z" fill="url(#ivory-${id})" stroke="#d9c693"/>${opening('T',55,306,8,'rear-thumb')}<text x="55" y="373" text-anchor="middle" class="hole-label">T · Ibu jari</text><path d="M107 308L132 290" stroke="#7d9bba" stroke-dasharray="3 4"/></g>
 <g class="front-openings">${front}${doubles}</g>
 </svg>`;
}
function uiIcon(id){const paths={home:'M3 11L12 3l9 8M6 10v11h12V10M10 21v-7h4v7',know:'M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-2-6-2-10 1',finger:'M8 12V5a2 2 0 014 0v7-9a2 2 0 014 0v10-7a2 2 0 014 0v10c0 7-9 9-12 5l-5-7a2 2 0 013-2l2 2',eyes:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm14 0a4 4 0 11-8 0 4 4 0 018 0',live:'M9 5a3 3 0 016 0v7a3 3 0 01-6 0ZM5 10v2a7 7 0 0014 0v-2M12 19v3M8 22h8',assessment:'M7 3h10v7a5 5 0 01-10 0ZM7 5H3v3c0 4 4 4 4 4M17 5h4v3c0 4-4 4-4 4M12 15v5M7 22h10',performance:'M4 20V10h3v10M10 20V4h3v16M16 20v-7h3v7'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.home}"/></svg>`;}
function miniStaff(note){const y=RECORDER_NOTES[note].staffY/2-8;return `<svg viewBox="0 0 65 66" aria-hidden="true">${[12,22,32,42,52].map(v=>`<path d="M6 ${v}H59" stroke="currentColor" opacity=".25"/>`).join('')}<ellipse cx="32" cy="${y}" rx="6" ry="4" fill="currentColor" transform="rotate(-20 32 ${y})"/><path d="M37 ${y}v-22" stroke="currentColor" stroke-width="2"/></svg>`;}
function updateLessonUI(){$('guide-note').textContent=target();$('detector-target').textContent=target();$('challenge-stats').hidden=state.mode!=='assessment';updateUIStats();}
function recordUIAttempt(type){
 if(!['correct','wrong'].includes(type))return;
 const n=target(),entry=state.performance.byNote[n]||(state.performance.byNote[n]={correct:0,errors:0});state.performance.attempts++;
 if(type==='correct'){state.performance.correct++;entry.correct++;}else entry.errors++;
}
function updateUIStats(){state.bestStreak=Math.max(state.bestStreak,state.streak);state.performance.bestStreak=Math.max(state.performance.bestStreak,state.streak);$('challenge-accuracy').textContent=state.attempts?`${Math.round(state.correct/state.attempts*100)}% ketepatan`:'— ketepatan';$('challenge-streak').textContent=`${state.streak} streak`;}
function drawWaveform(samples){const points=[];for(let i=0;i<100;i++)points.push(`${i===0?'M':'L'}${i*4} ${(21+samples[i*4]*65).toFixed(1)}`);$('wave-path').setAttribute('d',points.join(' '));}
function showPerformance(){
 leavePage();state.mode='performance';document.body.dataset.mode='performance';
 ['home-panel','workspace','results'].forEach(id=>$(id).hidden=true);$('performance').hidden=false;
 document.querySelectorAll('button[data-mode]').forEach(b=>{const active=b.dataset.mode==='performance';b.classList.toggle('active',active);b.classList.toggle('selected',active);if(b.closest('nav'))b.setAttribute('aria-current',active?'page':'false');});
 $('page-title').textContent='Perjalanan muzik saya';$('page-description').textContent='Setiap cubaan membawa kamu selangkah lebih maju.';$('step-label').textContent='REKOD PADA PERANTI INI';
 const data=state.performance,played=NOTE_NAMES.filter(n=>data.byNote[n]),rate=n=>data.byNote[n].correct/(data.byNote[n].correct+data.byNote[n].errors),strongest=played.filter(n=>data.byNote[n].correct>0).sort((a,b)=>rate(b)-rate(a))[0]||'—',weakest=played.filter(n=>data.byNote[n].errors).sort((a,b)=>data.byNote[b].errors-data.byNote[a].errors)[0],max=Math.max(1,...played.map(n=>data.byNote[n].errors));
 $('performance').innerHTML=`<div class="performance-heading"><span class="result-medal">${uiIcon('performance')}</span><div><span class="eyebrow">PERJALANAN PEMUZIK</span><h2>${data.attempts?'Lihat kemajuan kamu.':'Mari cipta pencapaian pertama!'}</h2><p>${data.attempts?'Gabungan cubaan Eyes Up, Live Practice dan Assessment yang disimpan pada pelayar ini.':'Main dengan mikrofon untuk mula mengumpulkan prestasi.'}</p></div></div><div class="result-numbers"><div><strong>${data.attempts?Math.round(data.correct/data.attempts*100)+'%':'—'}</strong><span>Ketepatan keseluruhan</span></div><div><strong>${data.attempts}</strong><span>Jumlah cubaan</span></div><div><strong>${data.correct}</strong><span>Not betul</span></div><div><strong>${data.bestStreak}</strong><span>Streak terbaik</span></div></div><h3>Lima not, langkah demi langkah</h3><div class="session-note-cards">${NOTE_NAMES.map(n=>{const e=data.byNote[n],attempts=e?e.correct+e.errors:0,percent=attempts?Math.round(e.correct/attempts*100):0;return `<div class="session-note ${e?.errors?'needs-practice':''}"><strong>${n}</strong><span>${!attempts?'Belum dicuba':e.errors?'Terus berlatih':'Tepat setakat ini'}</span><progress value="${percent}" max="100" aria-label="Ketepatan ${n}"></progress><small>${attempts?percent+'% · '+attempts+' cubaan':'Mulakan latihan mikrofon'}</small></div>`;}).join('')}</div><p class="pill">✦ ${state.xp} XP terkumpul pada peranti ini</p><h3>Kesalahan mengikut not</h3>${NOTE_NAMES.map(n=>`<div class="error-row"><span>${n}</span><div class="error-bar"><i style="width:${(data.byNote[n]?.errors||0)/max*100}%"></i></div><span>${data.byNote[n]?.errors||0}</span></div>`).join('')}<div class="strength-grid"><div><span>NOT TERKUAT</span><strong>${strongest}</strong><p>${played.length?'Ketepatan tertinggi dalam not yang telah dicuba.':'Belum ada cubaan.'}</p></div><div><span>TERUSKAN BERLATIH</span><strong>${weakest||'—'}</strong><p>${weakest?'Not dengan kesalahan paling banyak.':'Tiada kesalahan direkodkan.'}</p></div></div><p class="small">Rekod disimpan pada pelayar ini. Reset Progress dalam Settings untuk mengosongkannya. Jika seri, not terawal G–D′ dipilih.</p><h3>Cadangan latihan</h3><p>${weakest?`Latih ${weakest} dan pertukaran kepada not bersebelahan.`:'Teruskan latihan lima not untuk membina keyakinan.'}</p><button class="primary" id="performance-practice">${weakest?`Latih ${weakest}`:'Jom berlatih'}</button>`;
 $('performance-practice').onclick=()=>setMode('live',weakest?adaptiveSequence(weakest):undefined);
}
function toggleNavigation(){const collapsed=document.querySelector('.sidebar').classList.toggle('collapsed');$('nav-toggle').setAttribute('aria-expanded',String(!collapsed));}


