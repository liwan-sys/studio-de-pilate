/* ============================================================
 * Studio SVB — Meta Pixel base
 * Pixel ID: 1392481118699006
 *
 * Loaded from <head> on every page via:
 *   <script src="/assets/js/meta-pixel.js"></script>
 *
 * Tracks: PageView (automatique)
 * Les events specifiques (ViewContent, InitiateCheckout, Purchase)
 * sont declenchees inline sur les pages concernees (essai, merci-essai).
 * ============================================================ */
(function () {
  if (window.fbq) return;
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  window.fbq("init", "1392481118699006");
  window.fbq("track", "PageView");
})();
