document.addEventListener('DOMContentLoaded',()=>{
const details=document.getElementById('offers-details');
function reveal(hash,scroll){if(!hash)return;const target=document.getElementById(hash.slice(1));if(target&&(details.contains(target)||target===details)){details.open=true;if(scroll)target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}}
document.querySelectorAll('.offers-hero a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{details.open=true}));
window.addEventListener('hashchange',()=>reveal(location.hash,true));reveal(location.hash,true);
});
