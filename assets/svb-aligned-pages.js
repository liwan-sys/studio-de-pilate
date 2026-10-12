document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  if(!body.classList.contains('svb-aligned-page') || body.classList.contains('svb-readable-page'))return;
  if(!document.querySelector('.svb-atmosphere')){
    const scene=document.createElement('div');
    scene.className='svb-atmosphere';
    scene.setAttribute('aria-hidden','true');
    const mobile=window.matchMedia('(max-width:700px)').matches;
    const source=mobile?'/videos/svb-salles-vertical.mp4':'/videos/svb-salles-horizontal-sans-gros-plan-logo.mp4?v=20261011';
    scene.innerHTML='<video autoplay muted loop playsinline preload="metadata" poster="/videos/svb-salle-violette-horizontal-poster.jpg" src="'+source+'"></video>';
    body.prepend(scene);
  }
});
