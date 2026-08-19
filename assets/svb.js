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

  // 3a) Trust bar : bandeau discret sous la nav sur toutes les pages fonctionnelles.
  //     Auto-injecte pour eviter d'editer les 30+ pages individuellement.
  (function initTrustBar(){
    try {
      var path = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
      if (/\/(merci|mentions-legales|cgv|admin|questionnaire-abonnement-svb|404|design-system|forms)(\.html)?$/.test(path)) return;
      if (document.body.classList.contains('svb-no-trust')) return;
      if (document.querySelector('.svb-trust-bar')) return;

      var bar = document.createElement('div');
      bar.className = 'svb-trust-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', "Reperes de confiance Studio SVB");
      bar.innerHTML = ''
        + '<div class="svb-trust-bar__inner">'
        + '  <span class="svb-trust-bar__item svb-trust-bar__rating" aria-label="5 sur 5 sur 146 avis Google">'
        + '    <svg viewBox="0 0 20 20" aria-hidden="true" class="svb-trust-bar__star"><path fill="currentColor" d="M10 1.5l2.6 5.4 5.9.9-4.3 4.2 1 5.9L10 15.1l-5.3 2.8 1-5.9L1.5 7.8l5.9-.9L10 1.5z"/></svg>'
        + '    <strong>5,0/5</strong><span class="svb-trust-bar__meta">·&nbsp;146+ avis Google</span>'
        + '  </span>'
        + '  <span class="svb-trust-bar__sep" aria-hidden="true">·</span>'
        + '  <span class="svb-trust-bar__item">2 studios &agrave; Saint-Ouen</span>'
        + '  <span class="svb-trust-bar__sep" aria-hidden="true">·</span>'
        + '  <span class="svb-trust-bar__item">Ouvert 7j&thinsp;/&thinsp;7</span>'
        + '  <span class="svb-trust-bar__sep" aria-hidden="true">·</span>'
        + '  <a class="svb-trust-bar__cta js-buy" href="/essai" data-discipline="reformer" data-label="S&eacute;ance d\'essai" data-amount="30 &euro;" data-track="trust_bar_cta">'
        + '    S&eacute;ance d\'essai <strong>30&nbsp;&euro;</strong> &rarr;'
        + '  </a>'
        + '</div>';

      // Insere apres la nav principale (premiere nav de la page)
      var nav = document.querySelector('nav[role="navigation"]') || document.querySelector('header nav') || document.querySelector('nav');
      if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(bar, nav.nextSibling);
      } else {
        document.body.insertBefore(bar, document.body.firstChild);
      }
    } catch(e) {/* silent */}
  })();

  // 3b) Auto-mount du bloc newsletter juste avant le footer (utilise le widget existant plus bas)
  (function autoMountNewsletter(){
    try {
      var path = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
      if (/\/(merci|mentions-legales|cgv|admin|questionnaire-abonnement-svb|404|design-system|forms)(\.html)?$/.test(path)) return;
      if (document.body.classList.contains('svb-no-newsletter')) return;
      if (document.querySelector('[data-svb-newsletter]')) return;

      var footer = document.querySelector('.svb-footer') || document.querySelector('footer');
      if (!footer) return;

      var section = document.createElement('section');
      section.className = 'svb-newsletter-wrap';
      section.setAttribute('aria-label', 'Newsletter Studio SVB');
      section.innerHTML = ''
        + '<div class="svb-newsletter-inner">'
        + '  <div class="svb-newsletter-copy">'
        + '    <p class="svb-newsletter-eyebrow">Reste dans la boucle</p>'
        + '    <h2 class="svb-newsletter-title">Le studio SVB dans ta boite mail.</h2>'
        + '    <p class="svb-newsletter-sub">Conseils coachs, nouveaut&eacute;s planning, offres members-only. <strong>1 mail / semaine max</strong>, z&eacute;ro spam.</p>'
        + '  </div>'
        + '  <div data-svb-newsletter data-source="footer_' + (path.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'home') + '"></div>'
        + '</div>';
      footer.parentNode.insertBefore(section, footer);
    } catch(e) {/* silent */}
  })();

  // 3c) Bloc social proof (rating + 3 verbatims) avant le footer
  (function initSocialProofBlock(){
    try {
      var path = (location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
      if (/\/(merci|mentions-legales|cgv|admin|questionnaire-abonnement-svb|404|design-system|forms|temoignages)(\.html)?$/.test(path)) return;
      if (document.body.classList.contains('svb-no-social')) return;
      if (document.querySelector('.svb-social-proof')) return;

      var target = document.querySelector('.svb-newsletter-wrap') || document.querySelector('.svb-footer') || document.querySelector('footer');
      if (!target) return;

      var block = document.createElement('section');
      block.className = 'svb-social-proof';
      block.setAttribute('aria-label', 'Ce que disent nos membres');
      block.innerHTML = ''
        + '<div class="svb-social-proof__inner">'
        + '  <div class="svb-social-proof__head">'
        + '    <div class="svb-social-proof__stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
        + '    <p class="svb-social-proof__title"><strong>5,0 sur 5</strong> &middot; 146+ avis Google</p>'
        + '    <p class="svb-social-proof__meta">Le studio le mieux not&eacute; de Saint-Ouen</p>'
        + '  </div>'
        + '  <ul class="svb-social-proof__list">'
        + '    <li class="svb-social-proof__card">'
        + '      <p class="svb-social-proof__quote">&laquo;&nbsp;Coachs au top, salle magnifique, ambiance familiale. Le Reformer a change ma posture en 3 mois.&nbsp;&raquo;</p>'
        + '      <p class="svb-social-proof__author">Marie L. &middot; membre depuis 2024</p>'
        + '    </li>'
        + '    <li class="svb-social-proof__card">'
        + '      <p class="svb-social-proof__quote">&laquo;&nbsp;Enfin un studio a taille humaine. On te conna&icirc;t, on te corrige, on te fait progresser. Rien &agrave; voir avec les grosses salles.&nbsp;&raquo;</p>'
        + '      <p class="svb-social-proof__author">Thomas K. &middot; Crossformer 3&times;/sem</p>'
        + '    </li>'
        + '    <li class="svb-social-proof__card">'
        + '      <p class="svb-social-proof__quote">&laquo;&nbsp;Je viens de Paris 18 &agrave; pied. Studio propre, cours varies, coachs bienveillants. Adopt&eacute; !&nbsp;&raquo;</p>'
        + '      <p class="svb-social-proof__author">Sophie B. &middot; Pilates &amp; Yoga</p>'
        + '    </li>'
        + '  </ul>'
        + '  <a href="/temoignages" class="svb-social-proof__more">Voir les 146 avis &rarr;</a>'
        + '</div>';
      target.parentNode.insertBefore(block, target);
    } catch(e) {/* silent */}
  })();

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

  // 3ter) CTA mobile sur les pages sans sticky dedie.
  (function initMobileStickyCta(){
    try {
      if (!window.matchMedia || !window.matchMedia('(max-width: 767px)').matches) return;
      if (document.querySelector('.svb-mobile-sticky-cta')) return;
      if (document.getElementById('cta-sticky')) return; // accueil : sticky dedie deja present

      var path = location.pathname.replace(/\/+$/, '') || '/';
      if (/\/(merci|Merci|mentions-legales|cgv|admin|questionnaire-abonnement-svb|404)(\.html)?$/i.test(path)) return;

      var isEssai = path === '/essai' || path === '/essai.html';
      var cta = document.createElement('a');
      // Sur /essai : ancre vers les offres (choix discipline)
      // Ailleurs : .js-buy declenche la modale booking iframe (Sportigo/Jayne)
      //           -> ouverture immediate, 0 friction, tunnel raccourci
      cta.className = 'svb-mobile-sticky-cta' + (isEssai ? '' : ' js-buy');
      cta.href = isEssai ? '#essai-offres' : '/essai';
      if (!isEssai) {
        cta.dataset.discipline = 'reformer';
        cta.dataset.label = "Séance d'essai Pilates Reformer";
        cta.dataset.amount = '30 €';
      }
      cta.setAttribute('data-track', 'mobile_sticky_cta');
      cta.setAttribute('aria-label', isEssai ? "Choisir une séance d'essai" : "Réserver une séance d'essai à 30 euros");
      cta.innerHTML = '\
        <span class="svb-mobile-sticky-cta__text">\
          <span class="svb-mobile-sticky-cta__label">' + (isEssai ? "Choisir mon essai" : "Réserver mon essai") + '</span>\
          <span class="svb-mobile-sticky-cta__sub">' + (isEssai ? "Paiement sécurisé · confirmation immédiate" : "Réservation immédiate · sans engagement") + '</span>\
        </span>\
        <span class="svb-mobile-sticky-cta__pill">30 €</span>';
      document.body.appendChild(cta);

      // Ancre interne : scroll smooth. Sinon on laisse .js-buy prendre la main.
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

  // 5) Lazy-load des vidéos hero (gagne ~1 MB sur le LCP mobile)
  //    Active preload=metadata + attache la <source> réelle quand la vidéo entre dans le viewport
  function initLazyVideos(){
    var videos = document.querySelectorAll('video[data-svb-lazy-video]');
    if (!videos.length) return;
    var loadVideo = function(v){
      if (v.dataset.src) {
        v.src = v.dataset.src;
        v.removeAttribute('data-src');
      }
      v.querySelectorAll('source[data-src]').forEach(function(src){
        src.src = src.dataset.src;
        src.removeAttribute('data-src');
      });
      v.setAttribute('preload','auto');
      v.load();
      try { v.play(); } catch(e) {/* autoplay bloqué, pas grave */}
      v.removeAttribute('data-svb-lazy-video');
    };
    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) {
            loadVideo(e.target);
            vio.unobserve(e.target);
          }
        });
      }, { rootMargin: '200px' });
      videos.forEach(function(v){ vio.observe(v); });
    } else {
      videos.forEach(loadVideo);
    }
  }
  // Attendre le load pour ne pas bloquer FCP/LCP
  if (document.readyState === 'complete') initLazyVideos();
  else window.addEventListener('load', initLazyVideos);

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
