(function() {
  'use strict';

  // 1. LAZY LOADING
  document.querySelectorAll('img:not([loading])').forEach(function(img) {
    if (img.getBoundingClientRect().top > window.innerHeight) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    }
  });
  document.querySelectorAll('iframe:not([loading])').forEach(function(iframe) {
    iframe.setAttribute('loading', 'lazy');
  });

  // 2. SPLASH SCREEN
  var splashElements = document.querySelectorAll('.splash-screen, #splash, .loader, .preloader, [class*="splash"]');
  splashElements.forEach(function(el) {
    el.style.transition = 'opacity 0.3s ease-out';
    el.style.animationDuration = '0.5s';
  });

  // 3. ALT-TEXT
  document.querySelectorAll('img:not([alt]), img[alt=""]').forEach(function(img) {
    var src = img.src || '';
    var filename = src.split('/').pop().split('.')[0].split('?')[0];
    var altMap = {
      'logo': 'Logo SVB Santez Vous Bien - Studio Pilates Saint-Ouen',
      'reformer': 'Seance de Pilates Reformer au studio SVB',
      'crossformer': 'Cours de Crossformer - concept signature SVB',
      'studio': 'Interieur du studio SVB Santez Vous Bien a Saint-Ouen',
      'team': 'Equipe de coachs certifies SVB',
      'coach': 'Coach certifie SVB Santez Vous Bien',
      'yoga': 'Cours de yoga au studio SVB Saint-Ouen',
      'cross': 'Seance de Cross Training chez SVB',
      'hero': 'Studio SVB Santez Vous Bien - Pilates et coaching a Saint-Ouen'
    };
    var altText = 'Studio SVB Santez Vous Bien Saint-Ouen';
    for (var key in altMap) {
      if (filename.toLowerCase().indexOf(key) !== -1) { altText = altMap[key]; break; }
    }
    img.setAttribute('alt', altText);
  });
  document.querySelectorAll('img[alt="image"], img[alt="photo"], img[alt="img"]').forEach(function(img) {
    img.setAttribute('alt', 'Studio SVB Santez Vous Bien - Pilates et coaching a Saint-Ouen');
  });

  // 4. PRECONNECT
  ['https://fonts.googleapis.com','https://fonts.gstatic.com','https://calendly.com','https://www.googletagmanager.com'].forEach(function(url) {
    if (!document.querySelector('link[rel="preconnect"][href="' + url + '"]')) {
      var link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });

  // 5. FONT-DISPLAY SWAP
  var style = document.createElement('style');
  style.textContent = '@font-face { font-family: "Montserrat"; font-display: swap; }\n@font-face { font-family: "Great Vibes"; font-display: swap; }\n@font-face { font-family: "Dancing Script"; font-display: swap; }';
  document.head.appendChild(style);

  // 6. DEFER SCRIPTS
  document.querySelectorAll('script[src]:not([defer]):not([async])').forEach(function(script) {
    if (script.src && !script.src.includes('googletagmanager')) { script.setAttribute('defer', ''); }
  });

  // 7. SCROLL ANIMATIONS (IntersectionObserver)
  var animStyle = document.createElement('style');
  animStyle.textContent = [
    '.svb-fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }',
    '.svb-fade-in.svb-visible { opacity: 1; transform: translateY(0); }',
    '.svb-fade-in:nth-child(2) { transition-delay: 0.1s; }',
    '.svb-fade-in:nth-child(3) { transition-delay: 0.2s; }',
    '.svb-fade-in:nth-child(4) { transition-delay: 0.3s; }',
    '@media (prefers-reduced-motion: reduce) { .svb-fade-in { opacity: 1; transform: none; transition: none; } }'
  ].join('\n');
  document.head.appendChild(animStyle);

  // Apply fade-in to key sections
  var selectors = 'section > div, .grid > div, footer > div';
  document.querySelectorAll(selectors).forEach(function(el) {
    // Skip elements already visible in viewport on load
    if (el.getBoundingClientRect().top > window.innerHeight * 0.8) {
      el.classList.add('svb-fade-in');
    }
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('svb-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.svb-fade-in').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    document.querySelectorAll('.svb-fade-in').forEach(function(el) {
      el.classList.add('svb-visible');
    });
  }

  // 8. SMOOTH SCROLL for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  console.log('[SVB Optimisations] Toutes les optimisations ont ete appliquees.');
})();
