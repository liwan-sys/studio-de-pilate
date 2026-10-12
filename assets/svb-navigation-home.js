document.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('svb-menu-toggle');
  const panel=document.getElementById('svb-menu-panel');
  if(button&&panel){
    const set=open=>{panel.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')};
    button.addEventListener('click',()=>set(button.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){set(false);button.focus()}});
    document.addEventListener('click',event=>{if(!event.target.closest('.svb-unified-nav'))set(false)});
  }
  const videoButton=document.querySelector('.svb-home-video-toggle');
  const currentVideo=()=>window.matchMedia('(max-width:700px)').matches?document.querySelector('.mobile-film video'):document.querySelector('.home-films video');
  if(videoButton){
    videoButton.addEventListener('click',()=>{
      const video=currentVideo();
      if(!video)return;
      if(video.paused){video.play();videoButton.querySelector('span').textContent='Ⅱ';videoButton.setAttribute('aria-label','Mettre la vidéo en pause')}
      else{video.pause();videoButton.querySelector('span').textContent='▶';videoButton.setAttribute('aria-label','Lire la vidéo')}
    });
  }
});
