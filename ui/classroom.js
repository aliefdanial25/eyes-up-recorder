'use strict';
// Decorative classroom and accessibility settings; no audio or fingering rules.
function showSettings(){
 leavePage();state.mode='settings';document.body.dataset.mode='settings';
 ['home-panel','workspace','results','performance'].forEach(id=>$(id).hidden=true);$('settings').hidden=false;
 $('page-title').textContent='Settings';$('page-description').textContent='Jadikan studio muzik ini selesa untuk kamu.';$('step-label').textContent='STUDIO KAMU';
 document.querySelectorAll('button[data-mode]').forEach(b=>{b.classList.remove('active','selected');if(b.closest('nav'))b.setAttribute('aria-current','false');});
 document.querySelector('#navigation [data-ui-action="settings"]').classList.add('active');
 document.querySelector('#navigation [data-ui-action="settings"]').setAttribute('aria-current','page');
}
let classroomInitialized=false;
function initClassroom(){
 if(classroomInitialized)return;classroomInitialized=true;
 const desktop=matchMedia('(min-width: 1251px)');
 const revealDesktopNavigation=()=>{if(desktop.matches){document.querySelector('.sidebar').classList.remove('collapsed');$('nav-toggle').setAttribute('aria-expanded','true');}};
 desktop.addEventListener('change',revealDesktopNavigation);
 const settingsButton=document.createElement('button');settingsButton.type='button';settingsButton.dataset.uiAction='settings';settingsButton.innerHTML='<span aria-hidden="true">⚙</span>Settings';$('navigation').append(settingsButton);
 const performanceButton=document.querySelector('#navigation [data-mode="performance"]');performanceButton.lastChild.textContent='Prestasi Saya';
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();setMode('home');});
 document.addEventListener('click',e=>{if(e.target.closest('[data-ui-action="settings"]'))showSettings();else if(e.target.closest('button[data-mode]'))settingsButton.classList.remove('active');});
 loadPreferences();
 for(const [id,cls] of DISPLAY_SETTINGS)$(id).addEventListener('change',e=>{document.body.classList.toggle(cls,e.target.checked);savePreferences();});
 $('reset-progress').onclick=()=>{$('reset-confirmation').hidden=false;$('reset-progress').setAttribute('aria-expanded','true');$('cancel-reset').focus();};
 $('cancel-reset').onclick=()=>{$('reset-confirmation').hidden=true;$('reset-progress').setAttribute('aria-expanded','false');$('reset-progress').focus();};
 $('confirm-reset').onclick=()=>{resetSavedProgress();$('reset-progress').setAttribute('aria-expanded','false');};
 document.querySelectorAll('.module-card').forEach(card=>{const arrow=document.createElement('span');arrow.className='module-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';card.append(arrow);});
 // These are decorative symbols, never substitutes for the SVG lesson notation.
 const particles=document.createElement('div');particles.className='music-particles';particles.setAttribute('aria-hidden','true');particles.innerHTML='<span>♪</span><span>♫</span><span>♪</span>';document.querySelector('.home-panel').append(particles);
 const titleObserver=new MutationObserver(()=>{const steps=['know','finger','eyes','live','assessment'];document.querySelectorAll('.journey-footer>span').forEach((el,i)=>{el.classList.toggle('current-step',steps[i]===state.mode);if(steps[i]===state.mode)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});if(state.mode!=='settings'){settingsButton.classList.remove('active');settingsButton.setAttribute('aria-current','false');}});titleObserver.observe($('page-title'),{childList:true});
 const xpObserver=new MutationObserver(()=>{if(!document.body.classList.contains('reduce-motion')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)$('xp').getAnimations().forEach(animation=>animation.cancel());if(!document.body.classList.contains('reduce-motion')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)$('xp').animate([{transform:'scale(1)'},{transform:'scale(1.17)'},{transform:'scale(1)'}],{duration:420});});xpObserver.observe($('xp'),{childList:true});
}
initClassroom();
