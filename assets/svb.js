/* ================================================================
   SVB SantezVousBien · JS commun (v2.1)
   Remplace optimisations.js (lazy-loading runtime risqué)
   Scroll reveal + smooth scroll + menu burger (léger).
   ================================================================ */
(function(){
  'use strict';

  // -0.5) Referral code capture (programme parrainage)
  //       Lit ?ref=XXX sur n'importe quelle page, persiste 60j, propage aux CTA de réservation.
  (function initRefTracking(){
    try {
      var params = new URLSearchParams(location.search);
      var ref = (params.get('ref') || '').toUpperCase().trim();
      if (ref) {
        var exp = new Date(Date.now() + 60 * 86400000).toUTCString();
        document.cookie = 'svb_ref=' + encodeURIComponent(ref) + '; expires=' + exp + '; path=/; SameSite=Lax';
        try {
          localStorage.setItem('svb-ref', ref);
          localStorage.setItem('svb-ref-ts', Date.now().toString());
        } catch(e){}
      }
      var stored = (function(){
        var m = document.cookie.match(/(?:^|;\s*)svb_ref=([^;]+)/);
        if (m) return decodeURIComponent(m[1]);
        try { return localStorage.getItem('svb-ref') || ''; } catch(e){ return ''; }
      })();
      if (stored) {
        // Propage automatiquement aux liens Sportigo, /reserver et formulaires
        document.querySelectorAll('a[href*="sportigo.fr"], a[href^="/reserver"], form').forEach(function(el){
          if (el.tagName === 'A') {
            try {
              var u = new URL(el.href, location.origin);
              if (!u.searchParams.has('ref')) {
                u.searchParams.set('ref', stored);
                el.href = u.toString();
              }
            } catch(e){}
          } else if (el.tagName === 'FORM') {
            if (!el.querySelector('input[name="ref"]')) {
              var i = document.createElement('input');
              i.type = 'hidden'; i.name = 'ref'; i.value = stored;
              el.appendChild(i);
            }
          }
        });
      }
    } catch(e){}
  })();

  // 0) WebP → JPG fallback (pour les navigateurs qui ne supportent pas WebP)
  //    On ajoute un handler une seule fois par image.
  document.querySelectorAll('img[src*="/images/"][src$=".webp"]').forEach(function(img){
    img.addEventListener('error', function onErr(){
      if (!img.dataset.svbFallback) {
        img.dataset.svbFallback = '1';
        img.src = img.src.replace(/\.webp(\?|$)/, '.jpg$1');
      }
    }, { once: true });
  });

  // 1) Scroll reveal via IntersectionObserver — opt-in par classe .svb-reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('svb-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.svb-reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.svb-reveal').forEach(function(el){ el.classList.add('svb-in'); });
  }

  // 2) Smooth scroll pour ancres internes — respecte reduced-motion
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    var href = link.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    link.addEventListener('click', function(e){
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start'
      });
      // Focus management a11y
      target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
    });
  });

  // 3) Burger menu toggle (attend data-svb-burger / data-svb-menu)
  var burger = document.querySelector('[data-svb-burger]');
  var menu   = document.querySelector('[data-svb-menu]');
  if (burger && menu) {
    burger.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      });
    });
    // Escape key closes menu
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  // 3bis) Newsletter widget (injecté si <div data-svb-newsletter></div> présent)
  (function initNewsletter(){
    var mounts = document.querySelectorAll('[data-svb-newsletter]');
    if (!mounts.length) return;
    mounts.forEach(function(mount){
      if (mount.dataset.svbInit) return;
      mount.dataset.svbInit = '1';
      var source = mount.dataset.source || 'widget';
      mount.innerHTML = '\
<div class="svb-newsletter">\
  <p><strong>Reste connecté·e.</strong> Les conseils coachs, nos offres et les nouveautés du studio — 1 mail / semaine max, zéro spam.</p>\
  <form novalidate>\
    <span class="hp"><label>Ne pas remplir: <input name="website-url" tabindex="-1" autocomplete="off" /></label></span>\
    <input type="email" name="email" required placeholder="ton@email.fr" autocomplete="email" aria-label="Email" />\
    <button type="submit" data-track="newsletter_submit">S\'inscrire</button>\
  </form>\
  <p class="svb-newsletter-msg" role="status" aria-live="polite"></p>\
</div>';
      var form = mount.querySelector('form');
      var msg  = mount.querySelector('.svb-newsletter-msg');
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button');
        if (form.querySelector('[name="website-url"]').value) { return; /* bot */ }
        var email = form.querySelector('[name="email"]').value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          msg.textContent = 'Email invalide.'; msg.className = 'svb-newsletter-msg err'; return;
        }
        btn.disabled = true; btn.textContent = 'Envoi…';
        msg.textContent = ''; msg.className = 'svb-newsletter-msg';
        fetch('/api/newsletter', {
          method: 'POST',
          headers: {'content-type':'application/json'},
          body: JSON.stringify({ email: email, source: source })
        })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data.ok) {
            msg.textContent = '✓ Vérifie ta boîte mail pour confirmer.';
            msg.className = 'svb-newsletter-msg ok';
            form.reset();
            btn.textContent = 'C\'est parti !';
            if (window.svbTrack) window.svbTrack('newsletter_pending', { source: source });
          } else {
            msg.textContent = 'Oups, réessaie dans un instant.';
            msg.className = 'svb-newsletter-msg err';
            btn.disabled = false; btn.textContent = 'S\'inscrire';
          }
        })
        .catch(function(){
          msg.textContent = 'Erreur réseau. Réessaie.';
          msg.className = 'svb-newsletter-msg err';
          btn.disabled = false; btn.textContent = 'S\'inscrire';
        });
      });
    });
  })();

  // 3ter) Active le sticky dedie de l'accueil dans toutes les langues.
  (function initDedicatedStickyCta(){
    var sticky = document.getElementById('cta-sticky');
    if (!sticky) return;

    function syncSticky(){
      sticky.classList.toggle('visible', window.scrollY > 260);
    }

    window.addEventListener('scroll', syncSticky, { passive: true });
    syncSticky();
  })();

  // 3quater) CTA mobile sur les pages sans sticky dedie.
  (function initMobileStickyCta(){
    try {
      if (!window.matchMedia || !window.matchMedia('(max-width: 767px)').matches) return;
      if (document.querySelector('.svb-mobile-sticky-cta')) return;
      if (document.getElementById('cta-sticky')) return; // accueil : sticky dedie deja present

      var path = location.pathname.replace(/\/+$/, '') || '/';
      if (/\/(merci|Merci|mentions-legales|cgv|admin|questionnaire-abonnement-svb|tarifs|404)(\.html)?$/i.test(path)) return;

      var isEssai = path === '/essai' || path === '/essai.html';
      var cta = document.createElement('a');
      // .js-buy -> ouverture directe de la modale iframe (page Packs).
      // Sur /essai on garde le scroll interne vers les offres du produit.
      cta.className = 'svb-mobile-sticky-cta' + (isEssai ? '' : ' js-buy');
      cta.href = isEssai ? '#essai-offres' : '/essai';
      if (!isEssai) {
        cta.dataset.discipline = 'reformer';
        cta.dataset.label = "Pass Try · 2 séances";
        cta.dataset.amount = '30 €';
      }
      cta.setAttribute('data-track', 'mobile_sticky_cta');
      cta.setAttribute('aria-label', isEssai ? "Choisir le Pass Try" : "Réserver le Pass Try, deux séances à 30 euros");
      cta.innerHTML = '\
        <span class="svb-mobile-sticky-cta__text">\
          <span class="svb-mobile-sticky-cta__label">' + (isEssai ? "Choisir mon Pass Try" : "Réserver mes 2 séances") + '</span>\
          <span class="svb-mobile-sticky-cta__sub">' + (isEssai ? "Paiement sécurisé · confirmation immédiate" : "2 disciplines · sans engagement") + '</span>\
        </span>\
        <span class="svb-mobile-sticky-cta__pill">30 €</span>';
      document.body.appendChild(cta);

      // Ancre interne : scroll smooth. Sinon svb-booking.js prend la main via .js-buy.
      cta.addEventListener('click', function(e){
        if (cta.getAttribute('href').charAt(0) !== '#') return;
        var target = document.querySelector(cta.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      });

      var updateVisibility = function(){
        cta.classList.toggle('is-visible', window.scrollY > 320);
      };
      window.addEventListener('scroll', updateVisibility, { passive: true });
      updateVisibility();
    } catch(e) {/* silent */}
  })();

  // 4) Service Worker registration (PWA, offline-first, uniquement en HTTPS/localhost)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/service-worker.js').catch(function(){/* silencieux */});
    });
  }

  // 5) Chargement + autoplay AGRESSIF de toutes les videos au load de la page.
  //    Fini le lazy IntersectionObserver : l'utilisateur veut voir toutes
  //    les videos tourner immediatement, pas de bouton play sur le poster.
  function initAllVideos(){
    var videos = document.querySelectorAll('video[data-svb-lazy-video], video[data-src], video source[data-src]');
    // On selectionne les <video> parentes (au cas ou selecteur matche des <source>)
    var vidSet = new Set();
    document.querySelectorAll('video[data-svb-lazy-video]').forEach(function(v){ vidSet.add(v); });
    document.querySelectorAll('video source[data-src]').forEach(function(s){
      if (s.parentElement && s.parentElement.tagName === 'VIDEO') vidSet.add(s.parentElement);
    });
    if (!vidSet.size) return;

    var loadAndPlay = function(v){
      // Charger la vraie src si en data-src
      if (v.dataset.src) {
        v.src = v.dataset.src;
        v.removeAttribute('data-src');
      }
      v.querySelectorAll('source[data-src]').forEach(function(src){
        src.src = src.dataset.src;
        src.removeAttribute('data-src');
      });
      // Preload auto (au lieu de "none") pour telecharger tout de suite
      v.setAttribute('preload','auto');
      v.muted = true;      // muted requis pour autoplay policy
      v.playsInline = true;
      v.load();
      var tryPlay = function(){
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function(){ /* retente sur interaction */ });
      };
      tryPlay();
      // Re-tenter des que la video est jouable
      v.addEventListener('canplay', tryPlay, { once: true });
      v.addEventListener('loadeddata', tryPlay, { once: true });
      v.removeAttribute('data-svb-lazy-video');
    };

    vidSet.forEach(loadAndPlay);
  }
  // Tenter le plus tot possible (DOMContentLoaded) puis re-tenter au load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllVideos);
  } else {
    initAllVideos();
  }
  window.addEventListener('load', initAllVideos);

  // 5bis) Autoplay safety-net — certains navigateurs (mobile, Low Power Mode,
  //       autoplay policy stricte) bloquent play() au chargement initial.
  //       On force le play après le premier geste utilisateur (scroll/tap/click).
  function forceHeroAutoplay(){
    var videos = document.querySelectorAll('video[autoplay][muted]');
    videos.forEach(function(v){
      if (v.paused) {
        v.muted = true; // requis pour autoplay
        v.playsInline = true;
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function(){ /* silent, retry on interact */ });
      }
    });
  }
  // Tenter une fois à l'init
  if (document.readyState === 'complete') forceHeroAutoplay();
  else window.addEventListener('DOMContentLoaded', forceHeroAutoplay);
  // Puis au premier geste utilisateur (scroll, tap, clic)
  var onFirstInteract = function(){
    forceHeroAutoplay();
    ['touchstart','click','scroll','keydown'].forEach(function(ev){
      window.removeEventListener(ev, onFirstInteract, { passive: true });
    });
  };
  ['touchstart','click','scroll','keydown'].forEach(function(ev){
    window.addEventListener(ev, onFirstInteract, { passive: true, once: true });
  });

  // 6bis) Analytics first-party (opt-in, respecte le consent RGPD)
  //       Endpoint Edge Function /api/track
  //       Les events HIGH-VALUE (conversions) pinguent aussi /api/notify
  //       qui forward vers Telegram pour notif push immédiate à l'admin.
  var NOTIFY_EVENTS = {
    form_submit_essai: 'form_submit',
    form_submit_contact: 'contact_submit',
    cta_sportigo: 'sportigo_click',
    cta_whatsapp: 'whatsapp_click',
    cta_calendly: 'cta_click',
    newsletter_pending: 'newsletter_submit'
  };
  var svbNotify = function(event, props){
    try {
      var mappedEvent = NOTIFY_EVENTS[event];
      if (!mappedEvent) return; // seulement les events high-value
      var body = JSON.stringify({
        event: mappedEvent,
        label: (props && (props.label || props.discipline || props.source)) || event,
        page: location.pathname,
        referer: document.referrer || null,
        userData: (props && props.userData) || null
      });
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        keepalive: true
      }).catch(function(){});
    } catch(e) {/* silent */}
  };
  var svbTrack = function(event, props){
    try {
      if (!event) return;

      // Push to dataLayer ALWAYS — GTM/GA4 voient tous nos events custom
      // (independamment du consent, qui ne gere que les autres canaux).
      try {
        window.dataLayer = window.dataLayer || [];
        var dlEvent = { event: String(event).slice(0, 60) };
        if (props && typeof props === 'object') {
          for (var k in props) {
            if (Object.prototype.hasOwnProperty.call(props, k)) dlEvent[k] = props[k];
          }
        }
        window.dataLayer.push(dlEvent);
      } catch(e) {}

      var consented = false;
      try { consented = localStorage.getItem('svb-consent-v1') === 'granted'; } catch(e) {}
      if (!consented) return; // respect RGPD pour les autres canaux
      var payload = JSON.stringify({
        event: String(event).slice(0,60),
        props: props || null,
        ts: Date.now()
      });
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', {
          method:'POST',
          headers:{'content-type':'application/json'},
          body: payload,
          keepalive: true
        }).catch(function(){});
      }
      // Forward high-value events vers /api/notify (Telegram push)
      svbNotify(event, props);
       // Forward to GA4 for conversion tracking
       if (typeof window.gtag === 'function') {
          window.gtag('event', String(event).slice(0, 40), props || {});
       }
    } catch(e) {/* silent */}
  };
  window.svbTrack = svbTrack;
  window.svbNotify = svbNotify;

  // Auto-track CTA clicks (liens Sportigo + boutons avec data-track)
  document.addEventListener('click', function(e){
    var a = e.target.closest('a,button');
    if (!a) return;
    // 1. Explicit opt-in via data-track="event_name"
    if (a.dataset.track) {
      svbTrack(a.dataset.track, { href: a.href || null, label: a.textContent.trim().slice(0,50) });
      return;
    }
    // 2. Auto: liens vers Sportigo / Calendly / WhatsApp = conversion
    var href = a.href || '';
    if (/sportigo\.fr/.test(href))  svbTrack('cta_sportigo', { href: href, variant: document.body.dataset.abVariant || 'A' });
    else if (/calendly\.com/.test(href)) svbTrack('cta_calendly', { href: href });
    else if (/wa\.me\/|whatsapp/.test(href)) svbTrack('cta_whatsapp', { href: href });
  }, { capture: true, passive: true });

  // Track scroll depth (25/50/75/100)
  var scrollMarks = { 25:false, 50:false, 75:false, 100:false };
  var onScroll = function(){
    var pct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
    Object.keys(scrollMarks).forEach(function(k){
      var mark = parseInt(k,10);
      if (!scrollMarks[k] && pct >= mark) {
        scrollMarks[k] = true;
        svbTrack('scroll_depth', { pct: mark, path: location.pathname });
      }
    });
  };
  window.addEventListener('scroll', (function(){
    var t; return function(){ clearTimeout(t); t = setTimeout(onScroll, 250); };
  })(), { passive: true });

  // Track pageview au chargement (après consent)
  window.addEventListener('load', function(){
    setTimeout(function(){ svbTrack('pageview', { path: location.pathname, title: document.title.slice(0,80) }); }, 1200);
  });

  // 6) Consent banner RGPD (CNIL-friendly)
  //    - GTM est désactivé tant que consent n'est pas donné
  //    - Persiste dans localStorage
  (function initConsent(){
    var KEY = 'svb-consent-v1';
    var updateGoogleConsent = function(choice){
      try {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
        var granted = choice === 'granted';
        window.gtag('consent', 'update', {
          ad_storage: granted ? 'granted' : 'denied',
          analytics_storage: granted ? 'granted' : 'denied',
          ad_user_data: granted ? 'granted' : 'denied',
          ad_personalization: granted ? 'granted' : 'denied'
        });
      } catch(e) {}
    };
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch(e) {}
    if (saved === 'granted') {
      updateGoogleConsent('granted');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'consent_granted_stored' });
      return; // déjà accepté, pas de banner
    }
    if (saved === 'denied') {
      updateGoogleConsent('denied');
      return; // a refusé, on respecte
    }
    // Affiche le banner après FCP (non-bloquant)
    var show = function(){
      var b = document.createElement('div');
      b.className = 'svb-consent';
      b.setAttribute('role','dialog');
      b.setAttribute('aria-live','polite');
      b.setAttribute('aria-label','Bannière de consentement cookies');
      b.innerHTML = '\
        <div class="svb-consent-inner">\
          <p><strong>Cookies.</strong> Nous utilisons des cookies pour mesurer la fréquentation du site et améliorer nos publicités. Vous pouvez accepter ou refuser.</p>\
          <div class="svb-consent-btns">\
            <button type="button" class="svb-consent-deny">Refuser</button>\
            <button type="button" class="svb-consent-allow">Accepter</button>\
          </div>\
        </div>';
      document.body.appendChild(b);
      var close = function(choice){
        try { localStorage.setItem(KEY, choice); } catch(e) {}
        updateGoogleConsent(choice);
        b.classList.add('svb-consent-hide');
        setTimeout(function(){ b.remove(); }, 400);
        if (choice === 'granted') {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'consent_granted' });
          // Recharger pour que GTM s'initialise proprement (une seule fois)
          location.reload();
        }
      };
      b.querySelector('.svb-consent-allow').addEventListener('click', function(){ close('granted'); });
      b.querySelector('.svb-consent-deny').addEventListener('click', function(){ close('denied'); });
    };
    if (document.readyState === 'complete') setTimeout(show, 800);
    else window.addEventListener('load', function(){ setTimeout(show, 800); });
  })();
})();
