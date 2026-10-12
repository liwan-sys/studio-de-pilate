document.addEventListener('DOMContentLoaded',()=>{
  const data=JSON.parse(document.getElementById('courses-data').textContent);
  const choices=[...document.querySelectorAll('.course-choice')];
  let current=0;
  function select(index){
    current=(index+data.length)%data.length;
    const [title,tag,description,image,url]=data[current];
    const picture=document.getElementById('course-image');
    picture.src=image;picture.alt=title+' chez SVB';
    document.getElementById('course-title').textContent=title;
    document.getElementById('course-description').textContent=description;
    document.getElementById('course-discover').href=url;
    const number=String(current+1).padStart(2,'0');
    document.getElementById('course-number').textContent=number+' —';
    document.getElementById('course-counter').textContent=number+' — '+String(data.length).padStart(2,'0');
    choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  }
  choices.forEach((button,index)=>button.addEventListener('click',()=>{
    select(index);
    if(matchMedia('(max-width:900px)').matches)document.getElementById('course-feature').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
  }));
  document.getElementById('course-previous').addEventListener('click',()=>select(current-1));
  document.getElementById('course-next').addEventListener('click',()=>select(current+1));
});
