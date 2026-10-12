document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  if(!document.querySelector('.svb-atmosphere')){
    const scene=document.createElement('div');
    scene.className='svb-atmosphere';
    scene.setAttribute('aria-hidden','true');
    const mobile=window.matchMedia('(max-width:700px)').matches;
    const source=mobile?'/videos/svb-salles-vertical.mp4':'/videos/svb-salles-horizontal-sans-gros-plan-logo.mp4?v=20261011';
    scene.innerHTML='<video autoplay muted loop playsinline preload="metadata" poster="/videos/svb-salle-violette-horizontal-poster.jpg" src="'+source+'"></video>';
    body.prepend(scene);
  }
  const button=document.getElementById('svb-menu-toggle');
  const panel=document.getElementById('svb-menu-panel');
  if(button&&panel){
    const set=open=>{panel.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',document.documentElement.lang==='en'?(open?'Close menu':'Open menu'):(open?'Fermer le menu':'Ouvrir le menu'))};
    button.addEventListener('click',()=>set(button.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){set(false);button.focus()}});
    document.addEventListener('click',event=>{if(!event.target.closest('.svb-unified-nav'))set(false)});
    const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
    panel.querySelectorAll('a').forEach(link=>{if(link.getAttribute('href').replace(/\.html$/,'')===path)link.setAttribute('aria-current','page')});
  }
});
