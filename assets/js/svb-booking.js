/* ============================================================
 * Studio SVB — Module de reservation via iframe (web-customer)
 *
 * Remplace l'ancien module Mollie (svb-checkout.js).
 * Ouvre l'application de reservation externe dans une modale iframe
 * plein ecran (mobile) ou centree (desktop).
 *
 * Usage : ajouter la classe .js-buy sur n'importe quel <a> ou <button>
 * (aucun data-* n'est necessaire pour ce module, l'iframe gere le
 * choix de la formule cote application).
 *
 * Contrat postMessage (origin = https://web-customer.studiosvb.com) :
 *   { type: "jayne:close" }                -> ferme la modale
 *   { type: "jayne:resize", height: N }    -> fixe la hauteur en px
 *   { type: "jayne:navigate", path: "/x" } -> memorise le path
 * ============================================================ */
(function () {
  if (window.__svbBookingLoaded) return;
  window.__svbBookingLoaded = true;

  var BOOKING_URL = "https://web-customer.studiosvb.com";
  var ORIGIN = "https://web-customer.studiosvb.com";
  var STORAGE_KEY = "jayne:lastPath";
  var HASH = "#booking";

  var MODAL_HTML =
    '<div class="svb-book-overlay" id="svbBookOverlay" role="dialog" aria-modal="true" aria-label="Reservation Studio SVB">' +
      '<button type="button" class="svb-book-close" id="svbBookClose" aria-label="Fermer">' +
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
          '<line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>' +
        '</svg>' +
      '</button>' +
      '<div class="svb-book-panel" id="svbBookPanel">' +
        '<div class="svb-book-loader" id="svbBookLoader">' +
          '<div class="svb-book-spin" aria-hidden="true"></div>' +
          '<p>Chargement de la reservation...</p>' +
        '</div>' +
        '<iframe' +
          ' id="svbBookIframe"' +
          ' title="Reservation Studio SVB"' +
          ' tabindex="0"' +
          ' sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"' +
          ' referrerpolicy="strict-origin-when-cross-origin"' +
          ' allow="storage-access; payment; clipboard-write; geolocation"' +
        '></iframe>' +
      '</div>' +
    '</div>';

  var STYLES =
    // Overlay fullscreen fixe
    ".svb-book-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(15,25,25,.75);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:0}" +
    ".svb-book-overlay.is-open{display:flex}" +

    // Bouton X (desktop uniquement, cache mobile car l'app a son propre retour)
    ".svb-book-close{position:absolute;top:20px;right:24px;width:42px;height:42px;border:none;background:rgba(255,255,255,.95);color:#2F4F4F;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .2s,background .2s;z-index:2}" +
    ".svb-book-close:hover{background:#fff;transform:rotate(90deg)}" +
    ".svb-book-close svg{width:18px;height:18px}" +

    // Panel : mobile fullscreen par defaut
    ".svb-book-panel{position:relative;display:flex;flex-direction:column;width:100%;height:100svh;background:#FBF6EC;overflow:hidden;margin:0;border-radius:0;box-shadow:0 30px 80px rgba(0,0,0,.35)}" +

    // Loader
    ".svb-book-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#FBF6EC;color:#2F4F4F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:.9rem;font-weight:600;z-index:1}" +
    ".svb-book-loader.is-hidden{display:none}" +
    ".svb-book-spin{width:36px;height:36px;border:3px solid rgba(74,141,132,.2);border-top-color:#4A8D84;border-radius:50%;animation:svbBookSpin .8s linear infinite}" +
    "@keyframes svbBookSpin{to{transform:rotate(360deg)}}" +

    // Iframe : occupe tout le panel, focus visible discret
    "#svbBookIframe{flex:1;width:100%;border:0;background:transparent;display:block}" +
    "#svbBookIframe:focus{outline:none}" +

    // Desktop : modale centree, avec le X visible
    "@media (min-width: 768px){" +
      ".svb-book-panel{width:95vw;max-width:1200px;height:95svh;max-height:900px;border-radius:16px}" +
    "}" +

    // Mobile : cacher le X (retour depuis l'app iframe)
    "@media (max-width: 767px){" +
      ".svb-book-close{display:none}" +
    "}" +

    "@media (prefers-reduced-motion: reduce){.svb-book-spin{animation:none}}";

  var state = {
    isOpen: false,
    loaded: false,
    iframePath: null,
    previousBodyOverflow: "",
    hasPushedState: false,
  };

  var overlay = null;
  var panel = null;
  var iframe = null;
  var loader = null;
  var closeBtn = null;

  function inject() {
    if (document.getElementById("svbBookOverlay")) return;

    var style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    var wrap = document.createElement("div");
    wrap.innerHTML = MODAL_HTML;
    document.body.appendChild(wrap.firstChild);

    overlay = document.getElementById("svbBookOverlay");
    panel = document.getElementById("svbBookPanel");
    iframe = document.getElementById("svbBookIframe");
    loader = document.getElementById("svbBookLoader");
    closeBtn = document.getElementById("svbBookClose");

    // Load handler : cache le loader, reset la hauteur (evite qu'une page
    // precedente contraigne une nouvelle page a une hauteur trop faible)
    iframe.addEventListener("load", function () {
      state.loaded = true;
      loader.classList.add("is-hidden");
      iframe.style.height = "";
      try { iframe.focus(); } catch (e) {}
    });

    // Close via bouton X (desktop)
    closeBtn.addEventListener("click", closeModal);

    // Close en cliquant sur le fond (overlay lui-meme, pas le panel)
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    // Close via Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.isOpen) closeModal();
    });

    // postMessage : jayne:close, jayne:resize, jayne:navigate
    window.addEventListener("message", onIframeMessage);

    // Retour navigateur (mobile Android back gesture / desktop Back)
    window.addEventListener("popstate", function () {
      if (state.isOpen) closeModal({ skipHistory: true });
    });

    // BeforeUnload pendant que la modale est ouverte (au cas ou l'user
    // rafraichit / ferme l'onglet en pleine reservation)
    window.addEventListener("beforeunload", function (e) {
      if (state.isOpen) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    // iOS bfcache : au retour arriere, la page peut etre restauree telle
    // quelle. On ferme la modale si presente pour eviter etat incoherent.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted && state.isOpen) closeModal({ skipHistory: true });
    });

    // Rouvre la modale si l'URL contient deja #booking (deep link / reload)
    if (window.location.hash === HASH) {
      openModal({ fromHash: true });
    }
  }

  function onIframeMessage(event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "jayne:close") {
      closeModal();
      return;
    }

    if (data.type === "jayne:resize" && typeof data.height === "number") {
      // Applique la hauteur pixel demandee par l'iframe (utile desktop)
      iframe.style.height = data.height + "px";
      return;
    }

    if (data.type === "jayne:navigate" && typeof data.path === "string") {
      state.iframePath = data.path;
      try { sessionStorage.setItem(STORAGE_KEY, data.path); } catch (e) {}
      return;
    }
  }

  function openModal(opts) {
    if (state.isOpen) return;
    opts = opts || {};

    // Choix du path : restaurer si dispo, sinon "/"
    var startPath;
    try { startPath = sessionStorage.getItem(STORAGE_KEY) || "/"; } catch (e) { startPath = "/"; }
    state.iframePath = startPath;

    // Assigne src (ou reload si deja bon) -> declenche load event -> loader off
    state.loaded = false;
    loader.classList.remove("is-hidden");
    iframe.style.height = "";
    iframe.src = BOOKING_URL + startPath;

    overlay.classList.add("is-open");
    state.isOpen = true;

    state.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // History : pousse #booking pour que le back mobile ferme la modale
    if (!opts.fromHash && !state.hasPushedState) {
      try {
        window.history.pushState({ svbBooking: true }, "", HASH);
        state.hasPushedState = true;
      } catch (e) {}
    }

    // Tracking analytics leger (non bloquant)
    try {
      if (window.dataLayer) {
        window.dataLayer.push({ event: "booking_modal_open", booking_source: window.location.pathname });
      }
      if (window.svbTrack) window.svbTrack("booking_modal_open", { source_page: window.location.pathname });
    } catch (e) {}
  }

  function closeModal(opts) {
    if (!state.isOpen) return;
    opts = opts || {};

    overlay.classList.remove("is-open");
    state.isOpen = false;
    document.body.style.overflow = state.previousBodyOverflow || "";

    // Cleanup hash (sans re-declencher popstate)
    if (!opts.skipHistory && state.hasPushedState) {
      try {
        window.history.replaceState({}, "", window.location.pathname + window.location.search);
      } catch (e) {}
    }
    state.hasPushedState = false;

    // On ne clear pas sessionStorage : au prochain open, on reprend le path
    // memorise via jayne:navigate. L'app peut nettoyer si elle envoie
    // navigate("/") sur son ecran d'accueil.

    try {
      if (window.dataLayer) {
        window.dataLayer.push({ event: "booking_modal_close" });
      }
      if (window.svbTrack) window.svbTrack("booking_modal_close", {});
    } catch (e) {}
  }

  function bindCtas() {
    // Intercepte tous les .js-buy de la page. Se re-execute sur mutations
    // pour capter les CTAs injectes en JS (au cas ou).
    document.querySelectorAll(".js-buy").forEach(function (el) {
      if (el.dataset.svbBookingBound === "1") return;
      el.dataset.svbBookingBound = "1";
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        openModal();
      });
    });
  }

  function init() {
    inject();
    bindCtas();

    // Re-bind au cas ou d'autres scripts ajoutent des CTAs plus tard
    if (typeof MutationObserver === "function") {
      var mo = new MutationObserver(function () { bindCtas(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
