/* ================================================================
   SVB · Click-to-Unmute global
   Auto-discovery : <video data-unmute> ou <video> dans .svb-video-card
   - Démarrage muted (autoplay browser-friendly)
   - Bouton 🔊 en bas-droit, click toggle muted/unmuted
   - Hint "Son : cliquez" qui fade après 5s sur le 1er hover/intersection
   - GA4 tracking video_unmute (id basé sur data-id ou nom de fichier)
   ================================================================ */
(function () {
  'use strict';

  var ICON_MUTED = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3zm16.59-3l-1.41 1.41L20 9l-2 2 1.41 1.41L21 11l1.59 1.41L24 11l-2-2 2-2-1.41-1.41L21 7l-1.41-1.41z"/>';
  var ICON_UNMUTED = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';

  var BTN_STYLE = 'position:absolute;bottom:14px;right:14px;width:46px;height:46px;border-radius:50%;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s;padding:0;z-index:5;';
  var BTN_HOVER_CSS = '@keyframes svbUnmuteHintFade{0%{opacity:.95;transform:translateX(0)}80%{opacity:.95}100%{opacity:0;transform:translateX(8px);visibility:hidden}}.svb-unmute-btn:hover{background:rgba(0,0,0,0.78)!important;transform:scale(1.06)}';
  var HINT_STYLE = 'position:absolute;bottom:22px;right:70px;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:white;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:7px 12px;border-radius:20px;pointer-events:none;opacity:.95;animation:svbUnmuteHintFade 5s ease-in-out 1.5s forwards;z-index:5;';

  function ensureStyles() {
    if (document.getElementById('svb-unmute-styles')) return;
    var s = document.createElement('style');
    s.id = 'svb-unmute-styles';
    s.textContent = BTN_HOVER_CSS;
    document.head.appendChild(s);
  }

  function getVideoId(v) {
    if (v.dataset.id) return v.dataset.id;
    var src = (v.currentSrc || (v.querySelector('source') && v.querySelector('source').src) || '').split('?')[0];
    var name = src.split('/').pop().replace('.mp4', '');
    return name || 'unknown-video';
  }

  function attachUnmute(v) {
    if (v.dataset.unmuteAttached === '1') return;
    v.dataset.unmuteAttached = '1';

    // Le parent doit être position:relative pour le bouton absolute
    var parent = v.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Bouton speaker
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'svb-unmute-btn';
    btn.setAttribute('aria-label', 'Activer le son');
    btn.style.cssText = BTN_STYLE;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' + ICON_MUTED + '</svg>';
    parent.appendChild(btn);

    // Hint éphémère
    var hint = document.createElement('span');
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Son : cliquez';
    hint.style.cssText = HINT_STYLE;
    parent.appendChild(hint);

    var videoId = getVideoId(v);

    function toggle() {
      v.muted = !v.muted;
      btn.querySelector('svg').innerHTML = v.muted ? ICON_MUTED : ICON_UNMUTED;
      btn.setAttribute('aria-label', v.muted ? 'Activer le son' : 'Couper le son');
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
      if (window.gtag) {
        try { window.gtag('event', v.muted ? 'video_mute' : 'video_unmute', { video_id: videoId }); } catch (e) {}
      }
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    v.addEventListener('click', toggle);
    v.style.cursor = 'pointer';

    // S'assurer que la vidéo démarre bien muted
    v.muted = true;
  }

  function discoverAndAttach() {
    // 1) tous les <video data-unmute>
    var explicit = document.querySelectorAll('video[data-unmute]');
    explicit.forEach(attachUnmute);

    // 2) auto-detection : <video> qui a une <source> dans /videos/ et n'est PAS dans un halo Ambilight
    //    et n'est pas marqué data-no-unmute
    var auto = document.querySelectorAll('video:not([data-unmute]):not([data-no-unmute])');
    auto.forEach(function (v) {
      // Skip Ambilight halos (decorative duplicates)
      if (v.closest('.ete-promo-ambilight-tile')) return;
      // Skip videos sans source
      var src = v.currentSrc || (v.querySelector('source') && v.querySelector('source').src) || '';
      if (!src) return;
      // Skip hero background (LCP critique, décoratif)
      if (v.classList.contains('hero-bg-video')) return;
      attachUnmute(v);
    });
  }

  function init() {
    ensureStyles();
    discoverAndAttach();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
