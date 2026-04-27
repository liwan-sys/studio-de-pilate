/* ================================================================
   SVB · Analytics loader (GTM + GA4)
   - RGPD-gated (consent localStorage svb-consent-v1)
   - Loaded with `defer` from <head>
   - GTM/GA4 actually fire only on requestIdleCallback (TBT-friendly)
   ================================================================ */
(function () {
  // dataLayer must always exist for any code that pushes to it
  window.dataLayer = window.dataLayer || [];

  var granted = false;
  try { granted = localStorage.getItem('svb-consent-v1') === 'granted'; } catch (e) {}
  if (!granted) return;

  function loadGTM() {
    (function (w, d, s, l, i) {
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-5RW8LB7B');
  }

  function loadGA4() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-DHS707Y6XJ';
    document.head.appendChild(s);
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-DHS707Y6XJ', { anonymize_ip: true });
  }

  function bootAnalytics() {
    loadGTM();
    loadGA4();
  }

  // Defer to browser-idle so the main thread stays free during initial render.
  // Falls back to setTimeout for browsers without requestIdleCallback (Safari < 17).
  if ('requestIdleCallback' in window) {
    requestIdleCallback(bootAnalytics, { timeout: 2000 });
  } else {
    setTimeout(bootAnalytics, 1500);
  }
})();
