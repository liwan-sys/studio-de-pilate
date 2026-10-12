document.addEventListener('DOMContentLoaded',()=>{
const button=document.getElementById('svb-menu-toggle'),panel=document.getElementById('svb-menu-panel');const en=document.documentElement.lang.startsWith('en');
if(button&&panel){const set=open=>{panel.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',en?(open?'Close menu':'Open menu'):(open?'Fermer le menu':'Ouvrir le menu'))};button.addEventListener('click',()=>set(button.getAttribute('aria-expanded')!=='true'));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){set(false);button.focus()}});document.addEventListener('click',e=>{if(!e.target.closest('#svb-site-header'))set(false)});}
const toggle=document.querySelector('.svb-home-video-toggle');if(toggle)toggle.addEventListener('click',()=>{const video=matchMedia('(max-width:700px)').matches?document.querySelector('.mobile-film video'):document.querySelector('.home-films video');if(!video)return;if(video.paused){video.play().catch(()=>{});toggle.querySelector('span').textContent='Ⅱ';toggle.setAttribute('aria-label','Mettre la vidéo en pause')}else{video.pause();toggle.querySelector('span').textContent='▶';toggle.setAttribute('aria-label','Lire la vidéo')}});
});

document.addEventListener('DOMContentLoaded',()=>{
 const source=document.querySelector('.studios-visual>img,.course-feature>img,.offers-background,.planning-media video,.coaching-hero__image');
 if(!source)return;
 const backdrop=document.createElement('div');backdrop.className='svb-fullpage-backdrop';backdrop.setAttribute('aria-hidden','true');
 const media=source.cloneNode(true);media.removeAttribute('id');media.removeAttribute('hidden');media.removeAttribute('controls');media.removeAttribute('fetchpriority');
 if(media.tagName==='VIDEO'){media.muted=true;media.autoplay=true;media.loop=true;media.playsInline=true;}
 backdrop.append(media);document.body.prepend(backdrop);document.body.classList.add('svb-fullpage-media');
 if(source.tagName==='IMG')new MutationObserver(()=>{media.src=source.src}).observe(source,{attributes:true,attributeFilter:['src']});
});
