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
      'logo': 'Logo SVB SantezVousBien - Studio Pilates Saint-Ouen',
      'reformer': 'Seance de Pilates Reformer au studio SVB',
      'crossformer': 'Cours de Crossformer - concept signature SVB',
      'studio': 'Interieur du studio SVB SantezVousBien a Saint-Ouen',
      'team': 'Equipe de coachs certifies SVB',
      'coach': 'Coach certifie SVB SantezVousBien',
      'yoga': 'Cours de yoga au studio SVB Saint-Ouen',
      'cross': 'Seance de Cross Training chez SVB',
      'hero': 'Studio SVB SantezVousBien - Pilates et coaching a Saint-Ouen'
    };
    var altText = 'Studio SVB SantezVousBien Saint-Ouen';
    for (var key in altMap) {
      if (filename.toLowerCase().indexOf(key) !== -1) { altText = altMap[key]; break; }
    }
    img.setAttribute('alt', altText);
  });
  document.querySelectorAll('img[alt="image"], img[alt="photo"], img[alt="img"]').forEach(function(img) {
    img.setAttribute('alt', 'Studio SVB SantezVousBien - Pilates et coaching a Saint-Ouen');
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

  console.log('[SVB Optimisations] Toutes les optimisations ont ete appliquees.');
})();
