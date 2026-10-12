document.addEventListener('DOMContentLoaded',()=>{
const video=document.getElementById('planning-film');
const media=matchMedia('(max-width:700px)');
function source(){video.src=media.matches?'/videos/svb-salles-vertical.mp4':'/videos/svb-salles-horizontal-sans-gros-plan-logo.mp4';if(matchMedia('(prefers-reduced-motion:reduce)').matches)video.pause();else video.play().catch(()=>{});}
source();media.addEventListener('change',source);
const pause=document.querySelector('.planning-pause');pause.addEventListener('click',()=>{if(video.paused){video.play().catch(()=>{});pause.textContent='Ⅱ';pause.setAttribute('aria-label','Mettre la vidéo en pause')}else{video.pause();pause.textContent='▶';pause.setAttribute('aria-label','Lire la vidéo')}});
document.querySelectorAll('[data-schedule-studio]').forEach(section=>{const href=section.querySelector('.schedule-live-link').href;section.querySelectorAll('.class-slot').forEach(slot=>{const a=document.createElement('a');a.className='planning-slot-link';a.href=href;a.target='_blank';a.rel='noopener';a.textContent='+';a.setAttribute('aria-label','Voir les disponibilités pour '+slot.dataset.course+' à '+slot.dataset.time);slot.append(a)})});
});
