/* ================================================================
   SVB · Consent Mode + OpenAI Ads Pixel helper
   - GTM is loaded from the page <head> snippets.
   - Google and OpenAI measurement stay aligned with the local RGPD choice.
   ================================================================ */
(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var granted = false;
  try { granted = localStorage.getItem('svb-consent-v1') === 'granted'; } catch (e) {}

  window.gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied'
  });

  if (!granted) return;

  (function (w, d, s, u) {
    if (w.oaiq) return;
    var q = function () { q.q.push(arguments); };
    q.q = [];
    w.oaiq = q;
    var j = d.createElement(s);
    j.async = true;
    j.src = u;
    var f = d.getElementsByTagName(s)[0];
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');

  window.oaiq('consent', true);
  window.oaiq('init', {
    pixelId: 'Ay4rEhG4kjfExwRLyAvnRL',
    debug: false
  });
})();
