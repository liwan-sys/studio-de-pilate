/* ================================================================
   SVB · Consent Mode helper
   - GTM is loaded from the page <head> snippets.
   - This file only keeps Google consent state aligned with the local
     RGPD banner choice so GA4/Ads receive Consent Mode v2 signals.
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
})();
