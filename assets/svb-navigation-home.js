document.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('svb-menu-toggle');
  const panel=document.getElementById('svb-menu-panel');
  if(button&&panel){
    const set=open=>{panel.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')};
    button.addEventListener('click',()=>set(button.getAttribute('aria-expanded')!=='true'));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){set(false);button.focus()}});
    document.addEventListener('click',event=>{if(!event.target.closest('.svb-unified-nav'))set(false)});
  }
});
