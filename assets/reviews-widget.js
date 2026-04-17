/* ================================================================
   Studio SVB — Reviews Widget
   Usage :
     <div data-svb-reviews
          data-limit="6"
          data-discipline="Pilates Reformer"
          data-layout="carousel|grid">
     </div>
   Charge /assets/reviews.json (rebuild par scripts/build-content.py).
   ================================================================ */
(function(){
  'use strict';

  var CACHE_KEY = 'svb-reviews-cache-v1';
  var CACHE_TTL = 1000 * 60 * 60 * 6; // 6 h

  function fetchReviews(){
    // Cache localStorage: évite hit réseau sur navigation interne
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && (Date.now() - cached.t) < CACHE_TTL && Array.isArray(cached.d)) {
        return Promise.resolve(cached.d);
      }
    } catch(e) {}
    return fetch('/assets/reviews.json', { cache: 'no-cache' })
      .then(function(r){ return r.ok ? r.json() : []; })
      .then(function(data){
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data })); } catch(e){}
        return data;
      })
      .catch(function(){ return []; });
  }

  function stars(n){
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function esc(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function formatDate(iso){
    try {
      var d = new Date(iso);
      var diffDays = Math.floor((Date.now() - d.getTime()) / (86400000));
      if (diffDays < 30) return 'il y a ' + diffDays + ' jour' + (diffDays > 1 ? 's' : '');
      if (diffDays < 60) return 'il y a 1 mois';
      if (diffDays < 365) return 'il y a ' + Math.floor(diffDays / 30) + ' mois';
      return 'il y a ' + Math.floor(diffDays / 365) + ' an' + (diffDays >= 730 ? 's' : '');
    } catch(e){ return ''; }
  }

  function renderCard(r){
    return '\
<article class="svb-review">\
  <div class="svb-review-head">\
    <div class="svb-review-stars" aria-label="' + r.rating + ' étoiles sur 5">' + stars(r.rating) + '</div>\
    <span class="svb-review-source" title="Avis Google vérifié">\
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-2px"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22 0 0z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>\
      Avis vérifié\
    </span>\
  </div>\
  <p class="svb-review-text">« ' + esc(r.text) + ' »</p>\
  <footer class="svb-review-foot">\
    <strong>' + esc(r.author) + '</strong>\
    <span>' + (r.discipline ? esc(r.discipline) + ' · ' : '') + formatDate(r.date) + '</span>\
  </footer>\
</article>';
  }

  function mountWidget(container, items, layout){
    // Inject required CSS once
    if (!document.getElementById('svb-reviews-css')) {
      var css = document.createElement('style');
      css.id = 'svb-reviews-css';
      css.textContent = '\
.svb-reviews-wrap{position:relative;max-width:1200px;margin:0 auto}\
.svb-reviews-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}\
.svb-reviews-agg{display:inline-flex;align-items:center;gap:.5rem;font-size:.9rem;color:#2F4F4F;font-weight:600}\
.svb-reviews-agg strong{font-size:1.3rem;color:#4A8D84}\
.svb-reviews.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.2rem}\
.svb-reviews.carousel{display:flex;gap:1.2rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.5rem .2rem 1.2rem;scrollbar-width:none}\
.svb-reviews.carousel::-webkit-scrollbar{display:none}\
.svb-reviews.carousel .svb-review{flex:0 0 min(360px,85vw);scroll-snap-align:start}\
.svb-review{background:rgba(255,255,255,.92);border-radius:22px;padding:1.4rem 1.4rem 1.2rem;border:1px solid rgba(47,79,79,.08);box-shadow:0 2px 14px rgba(47,79,79,.05);display:flex;flex-direction:column;gap:.8rem;transition:transform .3s,box-shadow .3s}\
.svb-review:hover{transform:translateY(-3px);box-shadow:0 18px 40px rgba(47,79,79,.12)}\
.svb-review-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem}\
.svb-review-stars{color:#E8B496;letter-spacing:.14em;font-size:1.05rem}\
.svb-review-source{font-size:.72rem;color:#4A8D84;font-weight:600;display:inline-flex;align-items:center;gap:4px}\
.svb-review-text{font-size:.95rem;line-height:1.6;color:#2F4F4F;margin:0;font-style:italic}\
.svb-review-foot{display:flex;flex-direction:column;gap:2px;margin:0;padding-top:.4rem;font-size:.78rem;color:#4A8D84;border-top:1px solid rgba(47,79,79,.08)}\
.svb-review-foot span{opacity:.7;font-weight:500;color:#2F4F4F}\
.svb-reviews-ctrl{display:flex;gap:.5rem;margin-top:.8rem;justify-content:center}\
.svb-reviews-ctrl button{width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid rgba(47,79,79,.15);cursor:pointer;font-size:1.05rem;color:#2F4F4F;transition:all .2s}\
.svb-reviews-ctrl button:hover{background:#2F4F4F;color:#FBF6EC;border-color:#2F4F4F}\
';
      document.head.appendChild(css);
    }

    // Aggregate rating
    var avg = items.length
      ? (items.reduce(function(s,r){ return s + (r.rating || 0); }, 0) / items.length).toFixed(1)
      : null;

    var wrap = document.createElement('div');
    wrap.className = 'svb-reviews-wrap';
    wrap.innerHTML = '\
<header class="svb-reviews-head">\
  <div class="svb-reviews-agg">\
    <span class="svb-review-stars">' + (avg ? stars(Math.round(avg)) : '★★★★★') + '</span>\
    <span><strong>' + (avg || '5.0') + '</strong> / 5 sur ' + items.length + ' avis vérifiés</span>\
  </div>\
  <a href="https://www.google.com/search?q=Studio+SVB+Santez+Vous+Bien+Saint-Ouen+avis" target="_blank" rel="noopener noreferrer" style="font-size:.82rem;color:#4A8D84;font-weight:600;text-decoration:none">Voir sur Google →</a>\
</header>\
<div class="svb-reviews ' + layout + '">' + items.map(renderCard).join('') + '</div>\
' + (layout === 'carousel' ? '<div class="svb-reviews-ctrl"><button class="svb-r-prev" aria-label="Avis précédent">←</button><button class="svb-r-next" aria-label="Avis suivant">→</button></div>' : '');

    container.innerHTML = '';
    container.appendChild(wrap);

    if (layout === 'carousel') {
      var scroller = wrap.querySelector('.svb-reviews');
      wrap.querySelector('.svb-r-prev').addEventListener('click', function(){
        scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: 'smooth' });
      });
      wrap.querySelector('.svb-r-next').addEventListener('click', function(){
        scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' });
      });
    }
  }

  function init(){
    var containers = document.querySelectorAll('[data-svb-reviews]');
    if (!containers.length) return;

    fetchReviews().then(function(all){
      containers.forEach(function(c){
        var limit = parseInt(c.dataset.limit || '0', 10);
        var discipline = c.dataset.discipline;
        var layout = c.dataset.layout || 'grid';
        var items = all.filter(function(r){
          if (discipline && r.discipline && r.discipline !== discipline) return false;
          return (r.rating || 0) >= 4; // n'affiche pas les avis <4★
        });
        if (limit > 0) items = items.slice(0, limit);
        if (!items.length) {
          c.innerHTML = '';
          return;
        }
        mountWidget(c, items, layout);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
