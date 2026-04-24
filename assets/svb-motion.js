/* ================================================================
   SVB · Motion Layer (v1.0)
   Smooth scroll (Lenis) · Split text · Magnetic CTA · Stagger reveals
   ---------------------------------------------------------------
   Opt-in par classes :
     .svb-split          → H1/H2 Dancing Script : lettres animées
     .svb-magnetic       → bouton avec attraction curseur subtile
     .svb-reveal-stagger → conteneur : enfants révélés en cascade
     [data-lenis-prevent]→ zone où le smooth scroll est désactivé
   ---------------------------------------------------------------
   Respecte prefers-reduced-motion (tout no-op si l'user préfère).
   Desktop only pour Lenis (smoothTouch désactivé).
   ================================================================ */
(function(){
  'use strict';

  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // respect total : aucune animation JS

  // ─────────────────────────────────────────────────────────
  // 1) SMOOTH SCROLL (Lenis)
  // ─────────────────────────────────────────────────────────
  // Charge Lenis si dispo — sinon fallback gracieux (scroll natif OK).
  if (window.Lenis) {
    try {
      var lenis = new window.Lenis({
        lerp: 0.12,             // plus bas = plus lisse mais plus "mou" (Apple ~0.1)
        wheelMultiplier: 1.0,
        smoothWheel: true,
        smoothTouch: false,     // mobile = scroll natif (non négociable)
      });
      window.svbLenis = lenis;
      var raf = function(time){ lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      document.documentElement.classList.add('lenis');
    } catch(e){ /* silent */ }
  }

  // ─────────────────────────────────────────────────────────
  // 2) SPLIT TEXT — H1/H2 Dancing Script en cascade (lettre à lettre)
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('.svb-split').forEach(function(el){
    if (el.dataset.svbSplitDone) return;
    el.dataset.svbSplitDone = '1';

    // Découpage en mots → chaque mot en spans de chars, pour wrap correct
    var text = el.textContent;
    var frag = document.createDocumentFragment();
    var words = text.split(/(\s+)/); // garde les espaces
    var charIndex = 0;
    words.forEach(function(word){
      if (/^\s+$/.test(word)) {
        frag.appendChild(document.createTextNode(word));
        return;
      }
      var wordSpan = document.createElement('span');
      wordSpan.className = 'svb-split-word';
      for (var i=0; i<word.length; i++){
        var charSpan = document.createElement('span');
        charSpan.className = 'svb-split-char';
        charSpan.style.setProperty('--i', charIndex++);
        charSpan.textContent = word[i];
        wordSpan.appendChild(charSpan);
      }
      frag.appendChild(wordSpan);
    });
    el.textContent = '';
    el.appendChild(frag);
    el.classList.add('svb-split-ready');
  });

  // Anime quand le titre entre dans le viewport
  if ('IntersectionObserver' in window) {
    var splitIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('svb-split-in');
          splitIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.svb-split-ready').forEach(function(el){ splitIO.observe(el); });
  } else {
    document.querySelectorAll('.svb-split-ready').forEach(function(el){ el.classList.add('svb-split-in'); });
  }

  // ─────────────────────────────────────────────────────────
  // 3) MAGNETIC CTA — subtle cursor attraction
  // ─────────────────────────────────────────────────────────
  // Desktop only (hover-capable devices)
  if (matchMedia('(hover: hover)').matches) {
    var MAX_PULL = 8;   // px max de déplacement
    var RADIUS   = 70;  // px autour du bouton où l'effet commence
    document.querySelectorAll('.svb-magnetic').forEach(function(btn){
      var rafId = null;
      var targetX = 0, targetY = 0, currentX = 0, currentY = 0;

      var tick = function(){
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
        btn.style.transform = 'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';
        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
        }
      };

      btn.addEventListener('mousemove', function(e){
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width/2;
        var cy = rect.top + rect.height/2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        var pull = Math.min(1, Math.max(0, 1 - dist / (rect.width/2 + RADIUS)));
        targetX = dx * pull * (MAX_PULL / (rect.width/2));
        targetY = dy * pull * (MAX_PULL / (rect.height/2));
        if (!rafId) rafId = requestAnimationFrame(tick);
      });
      btn.addEventListener('mouseleave', function(){
        targetX = 0; targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(tick);
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // 4) STAGGER REVEAL — conteneur dont les enfants cascadent
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('.svb-reveal-stagger').forEach(function(container){
    var children = container.children;
    for (var i=0; i<children.length; i++){
      children[i].classList.add('svb-reveal-stagger-item');
      children[i].style.setProperty('--stagger-i', i);
    }
  });
  if ('IntersectionObserver' in window) {
    var staggerIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('svb-stagger-in');
          staggerIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.svb-reveal-stagger').forEach(function(el){ staggerIO.observe(el); });
  } else {
    document.querySelectorAll('.svb-reveal-stagger').forEach(function(el){ el.classList.add('svb-stagger-in'); });
  }

})();
