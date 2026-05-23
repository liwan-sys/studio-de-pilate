/* ============================================================
 * Studio SVB — Module de checkout Mollie (modal partage)
 *
 * Usage sur n'importe quelle page du site :
 *   1) Charger ce script (deja injecte via <head>) :
 *        <script src="/assets/js/svb-checkout.js" defer></script>
 *   2) Ajouter la classe .js-buy a n'importe quel <a> ou <button>
 *      avec les attributs data-discipline, data-label, data-amount :
 *        <a class="js-buy" href="/essai"
 *           data-discipline="reformer"
 *           data-label="Pilates Reformer"
 *           data-amount="30 €">Essayer le Reformer</a>
 *   3) Le clic intercepte la navigation, ouvre la modal, capture
 *      prenom/email/tel, cree un paiement Mollie via l'API et
 *      redirige vers le checkout Mollie.
 *
 * Valeurs valides pour data-discipline :
 *   reformer, crossformer, cross_yoga_pilates, pass_starter
 * ============================================================ */
(function () {
  if (window.__svbCheckoutLoaded) return;
  window.__svbCheckoutLoaded = true;

  var MODAL_HTML =
    '<div class="mol-modal" id="molModal" role="dialog" aria-modal="true" aria-labelledby="molTitle">' +
    '<div class="mol-card">' +
    '<button type="button" class="mol-close" id="molClose" aria-label="Fermer">' +
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>' +
    "</button>" +
    '<p class="mol-eye">Plus qu\'une &eacute;tape</p>' +
    '<h3 class="mol-title" id="molTitle">On t\'envoie tout par SMS</h3>' +
    '<p class="mol-sub">Pour te rappeler et caler ton cr&eacute;neau juste apr&egrave;s le paiement.</p>' +
    '<div class="mol-offer"><span>&#127919;</span><span><b id="molOfferLabel">&mdash;</b> &middot; <span id="molOfferAmount">&mdash;</span></span></div>' +
    '<div class="mol-error" id="molError"></div>' +
    '<form id="molForm" novalidate>' +
    '<div class="mol-field"><label for="molFirstname">Pr&eacute;nom</label><input type="text" id="molFirstname" name="firstname" autocomplete="given-name" required></div>' +
    '<div class="mol-field"><label for="molLastname">Nom</label><input type="text" id="molLastname" name="lastname" autocomplete="family-name" required></div>' +
    '<div class="mol-field"><label for="molEmail">Email</label><input type="email" id="molEmail" name="email" autocomplete="email" required></div>' +
    '<div class="mol-field"><label for="molPhone">T&eacute;l&eacute;phone</label><input type="tel" id="molPhone" name="phone" autocomplete="tel" inputmode="tel" required></div>' +
    '<input type="text" class="mol-hp" name="website-url" tabindex="-1" autocomplete="off">' +
    '<button type="submit" class="mol-submit" id="molSubmit">' +
    '<span class="arrow">Continuer vers le paiement</span>' +
    '<svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>' +
    '<span class="spin" aria-hidden="true"></span>' +
    "</button>" +
    '<p class="mol-trust">Paiement s&eacute;curis&eacute; via Mollie &middot; Tu seras redirig&eacute; pour payer</p>' +
    "</form></div></div>";

  var STYLES =
    ".mol-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(26,40,38,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:18px;animation:molFade .25s ease-out}" +
    ".mol-modal.is-open{display:flex}" +
    "@keyframes molFade{from{opacity:0}to{opacity:1}}" +
    ".mol-card{background:#FBF6EC;color:#2F4F4F;border-radius:24px;max-width:440px;width:100%;padding:32px 26px 26px;box-shadow:0 30px 80px rgba(0,0,0,.4);position:relative;animation:molSlide .35s cubic-bezier(.22,.61,.36,1);max-height:92vh;overflow-y:auto}" +
    "@keyframes molSlide{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}" +
    ".mol-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;background:rgba(47,79,79,.08);color:#2F4F4F;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}" +
    ".mol-close:hover{background:rgba(47,79,79,.18);transform:rotate(90deg)}" +
    ".mol-close svg{width:16px;height:16px}" +
    ".mol-eye{font-size:.66rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#4A8D84;margin:0 0 6px}" +
    ".mol-title{font-family:'Dancing Script',cursive;font-size:1.85rem;color:#2F4F4F;margin:0 0 4px;line-height:1.1}" +
    ".mol-sub{font-size:.86rem;opacity:.78;margin:0 0 6px}" +
    ".mol-offer{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:50px;background:linear-gradient(135deg,#F5C76D,#E8B496);color:#2F4F4F;font-weight:800;font-size:.82rem;margin:10px 0 18px}" +
    ".mol-offer b{font-weight:900}" +
    ".mol-field{margin:0 0 12px}" +
    ".mol-field label{display:block;font-size:.74rem;font-weight:700;color:#2F4F4F;opacity:.75;margin:0 0 5px;letter-spacing:.02em}" +
    ".mol-field input{width:100%;padding:13px 15px;font-size:.98rem;font-family:inherit;color:#2F4F4F;background:#fff;border:1.5px solid rgba(74,141,132,.25);border-radius:12px;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none}" +
    ".mol-field input:focus{outline:none;border-color:#4A8D84;box-shadow:0 0 0 3px rgba(74,141,132,.15)}" +
    ".mol-field input.err{border-color:#d97a5a;box-shadow:0 0 0 3px rgba(217,122,90,.15)}" +
    ".mol-hp{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}" +
    ".mol-submit{width:100%;padding:15px 20px;background:linear-gradient(135deg,#4A8D84,#2F4F4F);color:#fff;font-weight:800;font-size:.95rem;border:none;border-radius:50px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:.2s;letter-spacing:.02em;margin-top:6px}" +
    ".mol-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 28px rgba(74,141,132,.4)}" +
    ".mol-submit:disabled{opacity:.6;cursor:wait}" +
    ".mol-submit svg{width:16px;height:16px}" +
    ".mol-submit .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:molSpin .7s linear infinite;display:none}" +
    ".mol-submit.loading .arrow{display:none}" +
    ".mol-submit.loading .spin{display:inline-block}" +
    "@keyframes molSpin{to{transform:rotate(360deg)}}" +
    ".mol-trust{text-align:center;font-size:.74rem;opacity:.65;margin:14px 0 0}" +
    ".mol-error{display:none;background:rgba(217,122,90,.12);border:1px solid rgba(217,122,90,.35);color:#a8533a;padding:10px 14px;border-radius:10px;font-size:.84rem;margin:0 0 12px}" +
    ".mol-error.show{display:block}" +
    "@media (prefers-reduced-motion: reduce){.mol-modal,.mol-card{animation:none}}";

  function init() {
    if (document.getElementById("molModal")) return;
    var style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);
    var wrap = document.createElement("div");
    wrap.innerHTML = MODAL_HTML;
    document.body.appendChild(wrap.firstChild);

    var modal = document.getElementById("molModal");
    var closeBtn = document.getElementById("molClose");
    var form = document.getElementById("molForm");
    var submit = document.getElementById("molSubmit");
    var errBox = document.getElementById("molError");
    var labelEl = document.getElementById("molOfferLabel");
    var amountEl = document.getElementById("molOfferAmount");
    var fName = document.getElementById("molFirstname");
    var fLastname = document.getElementById("molLastname");
    var fEmail = document.getElementById("molEmail");
    var fPhone = document.getElementById("molPhone");

    var current = { discipline: null };
    var ATTRIBUTION_STORAGE_KEY = "svb_attribution_v1";

    function getUTMs() {
      try {
        var p = new URLSearchParams(window.location.search);
        var currentParams = {
          fbclid: p.get("fbclid"),
          utm_source: p.get("utm_source"),
          utm_medium: p.get("utm_medium"),
          utm_campaign: p.get("utm_campaign"),
          utm_content: p.get("utm_content"),
          utm_term: p.get("utm_term"),
          gclid: p.get("gclid"),
          gbraid: p.get("gbraid"),
          wbraid: p.get("wbraid"),
        };
        var stored = {};
        try {
          stored = JSON.parse(localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "{}");
        } catch (e) {}
        var hasFreshParams = Object.keys(currentParams).some(function (key) {
          return currentParams[key];
        });
        var merged = Object.assign({}, stored, currentParams);
        Object.keys(merged).forEach(function (key) {
          if (merged[key] == null || merged[key] === "") delete merged[key];
        });
        if (hasFreshParams) {
          try {
            localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
        }
        return merged;
      } catch (e) {
        return {};
      }
    }

    function getCookie(name) {
      try {
        var m = document.cookie.match(
          new RegExp(
            "(?:^|; )" +
              name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
              "=([^;]*)"
          )
        );
        return m ? decodeURIComponent(m[1]) : null;
      } catch (e) {
        return null;
      }
    }

    function getGAClientId() {
      try {
        var m = document.cookie.match(/(?:^|;)\s*_ga=([^;]+)/);
        if (!m) return null;
        var parts = decodeURIComponent(m[1]).split(".");
        if (parts.length >= 4) return parts.slice(-2).join(".");
        return null;
      } catch (e) {
        return null;
      }
    }

    function getGASessionId() {
      try {
        var m = document.cookie.match(/(?:^|;)\s*_ga_DHS707Y6XJ=([^;]+)/);
        if (!m) return String(Date.now());
        var value = decodeURIComponent(m[1]);
        var gs2Session = value.split("$").find(function (part) {
          return /^s\d+$/.test(part);
        });
        if (gs2Session) return gs2Session.slice(1);
        var parts = value.split(".");
        if (parts.length >= 3 && /^\d+$/.test(parts[2])) return parts[2];
        return String(Date.now());
      } catch (e) {
        return String(Date.now());
      }
    }

    function getOfferValue(opts) {
      return opts && opts.amount && opts.amount.indexOf("99") > -1 ? 99.9 : 30.0;
    }

    function buildItem(opts) {
      var value = getOfferValue(opts);
      return {
        item_id: opts.discipline || "essai",
        item_name: opts.label || "Seance d'essai SVB",
        item_category: "essai",
        item_category2: opts.discipline || "essai",
        price: value,
        quantity: 1,
      };
    }

    var FUNNEL_STEPS = {
      view_item: {
        custom: "svb_offer_view",
        step: 2,
        step_name: "Affichage offre",
      },
      select_item: {
        custom: "svb_offer_click",
        step: 3,
        step_name: "Clic offre",
      },
      add_to_cart: {
        custom: "svb_checkout_open",
        step: 4,
        step_name: "Formulaire ouvert",
      },
      begin_checkout: {
        custom: "svb_payment_form_submit",
        step: 5,
        step_name: "Formulaire envoye",
      },
      add_payment_info: {
        custom: "svb_payment_start",
        step: 6,
        step_name: "Redirection Mollie",
      },
    };

    function cleanEventParams(params) {
      Object.keys(params).forEach(function (key) {
        if (params[key] == null || params[key] === "") delete params[key];
      });
      return params;
    }

    function pushGA4Direct(eventName, params) {
      try {
        if (typeof window.gtag !== "function") return;
        window.gtag("event", eventName, cleanEventParams(Object.assign({}, params)));
      } catch (e) {}
    }

    function buildOfferParams(eventName, opts, source) {
      var value = getOfferValue(opts);
      var attr = getUTMs();
      var funnel = FUNNEL_STEPS[eventName] || {};
      return cleanEventParams({
        currency: "EUR",
        value: value,
        items: [buildItem(opts)],
        discipline: opts.discipline,
        offer_label: opts.label,
        payment_provider: "mollie",
        payment_source: source,
        funnel_name: "SVB essai",
        funnel_step: funnel.step,
        step_name: funnel.step_name,
        source_page: window.location.pathname,
        utm_source: attr.utm_source,
        utm_medium: attr.utm_medium,
        utm_campaign: attr.utm_campaign,
        utm_content: attr.utm_content,
        utm_term: attr.utm_term,
        gclid: attr.gclid,
        gbraid: attr.gbraid,
        wbraid: attr.wbraid,
        page_location: window.location.href,
        page_referrer: document.referrer || null,
      });
    }

    function pushOfferEvent(eventName, opts, source) {
      try {
        var params = buildOfferParams(eventName, opts, source);
        var funnel = FUNNEL_STEPS[eventName] || {};
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push(
          cleanEventParams({
            event: eventName,
            discipline: params.discipline,
            offer_label: params.offer_label,
            payment_provider: params.payment_provider,
            payment_source: params.payment_source,
            funnel_name: params.funnel_name,
            funnel_step: params.funnel_step,
            step_name: params.step_name,
            source_page: params.source_page,
            utm_source: params.utm_source,
            utm_medium: params.utm_medium,
            utm_campaign: params.utm_campaign,
            utm_content: params.utm_content,
            utm_term: params.utm_term,
            gclid: params.gclid,
            gbraid: params.gbraid,
            wbraid: params.wbraid,
            page_location: params.page_location,
            page_referrer: params.page_referrer,
            ecommerce: {
              currency: "EUR",
              value: params.value,
              items: params.items,
            },
          })
        );
        // Ces events standards ne sont pas toujours tagues dans GTM.
        // On les envoie donc aussi via Google Tag pour remplir le tunnel GA4.
        if (eventName === "view_item" || eventName === "select_item" || eventName === "add_to_cart" || eventName === "add_payment_info") {
          pushGA4Direct(eventName, params);
        }
        if (funnel.custom) {
          pushGA4Direct(funnel.custom, Object.assign({ original_event: eventName }, params));
        }
      } catch (e) {}
    }

    function pushVisibleOfferView(buttons) {
      try {
        var seen = {};
        var items = [];
        buttons.forEach(function (a) {
          if (!a.dataset.discipline || seen[a.dataset.discipline]) return;
          seen[a.dataset.discipline] = true;
          items.push(
            buildItem({
              discipline: a.dataset.discipline,
              label: a.dataset.label || a.textContent.trim(),
              amount: a.dataset.amount || "30 €",
            })
          );
        });
        if (!items.length) return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
          event: "view_item",
          payment_provider: "mollie",
          payment_source: "site_page",
          funnel_name: "SVB essai",
          funnel_step: 2,
          step_name: "Affichage offre",
          source_page: window.location.pathname,
          page_location: window.location.href,
          page_referrer: document.referrer || null,
          ecommerce: {
            currency: "EUR",
            value: items.reduce(function (sum, item) {
              return sum + Number(item.price || 0);
            }, 0),
            items: items,
          },
        });
        var viewParams = cleanEventParams({
          currency: "EUR",
          value: items.reduce(function (sum, item) {
            return sum + Number(item.price || 0);
          }, 0),
          items: items,
          payment_provider: "mollie",
          payment_source: "site_page",
          funnel_name: "SVB essai",
          funnel_step: 2,
          step_name: "Affichage offre",
          source_page: window.location.pathname,
          page_location: window.location.href,
          page_referrer: document.referrer || null,
        });
        pushGA4Direct("view_item", viewParams);
        pushGA4Direct("svb_offer_view", Object.assign({ original_event: "view_item" }, viewParams));
      } catch (e) {}
    }

    function showError(msg) {
      errBox.textContent = msg;
      errBox.classList.add("show");
    }
    function clearError() {
      errBox.classList.remove("show");
      errBox.textContent = "";
      [fName, fLastname, fEmail, fPhone].forEach(function (i) {
        i.classList.remove("err");
      });
    }
    function open(opts) {
      current.discipline = opts.discipline;
      current.label = opts.label;
      current.amount = opts.amount;
      labelEl.textContent = opts.label;
      amountEl.textContent = opts.amount;
      clearError();
      form.reset();
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () {
        fName.focus();
      }, 100);
      var checkoutValue =
        opts.amount && opts.amount.indexOf("99") > -1 ? 99.9 : 30.0;
      try {
        if (window.fbq) {
          window.fbq("track", "InitiateCheckout", {
            content_category: "essai",
            content_name: opts.label,
            content_ids: [opts.discipline],
            content_type: "product",
            value: checkoutValue,
            currency: "EUR",
          });
        }
      } catch (e) {}
      pushOfferEvent("add_to_cart", opts, "modal_open");
      try {
        if (window.svbTrack)
          window.svbTrack("essai_modal_open", {
            discipline: opts.discipline,
            source_page: window.location.pathname,
          });
      } catch (e) {}
    }
    function close() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      submit.classList.remove("loading");
      submit.disabled = false;
    }

    // Intercept clic sur tous les .js-buy de la page
    var buyButtons = document.querySelectorAll(".js-buy");
    pushVisibleOfferView(buyButtons);
    buyButtons.forEach(function (a) {
      a.addEventListener("click", function (ev) {
        if (!a.dataset.discipline) return; // pas de discipline -> on laisse passer
        ev.preventDefault();
        var opts = {
          discipline: a.dataset.discipline,
          label: a.dataset.label || a.textContent.trim(),
          amount: a.dataset.amount || "30 €",
        };
        pushOfferEvent("select_item", opts, "site_cta");
        open(opts);
      });
    });

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });

    form.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      clearError();

      var firstname = fName.value.trim();
      var lastname = fLastname.value.trim();
      var email = fEmail.value.trim();
      var phone = fPhone.value.trim();

      var bad = false;
      if (!firstname) {
        fName.classList.add("err");
        bad = true;
      }
      if (!lastname) {
        fLastname.classList.add("err");
        bad = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        fEmail.classList.add("err");
        bad = true;
      }
      if (!phone || phone.replace(/\D/g, "").length < 8) {
        fPhone.classList.add("err");
        bad = true;
      }
      if (bad) {
        showError(
          "Tous les champs sont obligatoires (email valide, téléphone à 8+ chiffres)."
        );
        return;
      }

      submit.classList.add("loading");
      submit.disabled = true;

      var utms = getUTMs();
      pushOfferEvent(
        "begin_checkout",
        {
          discipline: current.discipline,
          label: current.label,
          amount: current.amount,
        },
        "form_submit"
      );
      var payload = {
        discipline: current.discipline,
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        fbclid: utms.fbclid,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        utm_term: utms.utm_term,
        gclid: utms.gclid,
        gbraid: utms.gbraid,
        wbraid: utms.wbraid,
        ga_client_id: getGAClientId(),
        ga_session_id: getGASessionId(),
        page_location: window.location.href,
        page_referrer: document.referrer || null,
        "website-url": form.querySelector('[name="website-url"]').value,
      };

      try {
        if (window.svbTrack)
          window.svbTrack("essai_form_submit", {
            discipline: current.discipline,
          });
      } catch (e) {}

      try {
        var res = await fetch("/api/create-essai-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        var data = null;
        try {
          data = await res.json();
        } catch (e) {}

        if (res.ok && data && data.ok && data.checkoutUrl) {
          try {
            var checkoutValue =
              current.discipline === "pass_starter" ? 99.9 : 30.0;
            pushOfferEvent(
              "add_payment_info",
              {
                discipline: current.discipline,
                label: current.label,
                amount: current.amount,
              },
              "mollie_redirect_created"
            );
            sessionStorage.setItem(
              "svb_last_essai",
              JSON.stringify({
                amount: checkoutValue,
                discipline: current.discipline,
                label: current.label,
                paymentId: data.paymentId,
                utm_source: utms.utm_source,
                utm_medium: utms.utm_medium,
                utm_campaign: utms.utm_campaign,
                utm_content: utms.utm_content,
                utm_term: utms.utm_term,
                gclid: utms.gclid,
                gbraid: utms.gbraid,
                wbraid: utms.wbraid,
              })
            );
          } catch (e) {}
          window.location.href = data.checkoutUrl;
          return;
        }

        submit.classList.remove("loading");
        submit.disabled = false;
        // Cas particulier : offre decouverte deja utilisee -> message dedie
        if (res.status === 409 && data && data.error === "trial_already_used") {
          showError(
            data.message ||
              "Tu as déjà bénéficié d'une offre découverte chez SVB. Découvre nos abonnements ou appelle 07 44 91 91 55."
          );
          return;
        }
        var msg = "Erreur (HTTP " + res.status + ")";
        if (data && data.error) msg += " — " + data.error;
        showError(msg + ". Réessaie ou appelle 07 44 91 91 55.");
      } catch (err) {
        submit.classList.remove("loading");
        submit.disabled = false;
        showError(
          "Erreur réseau : " +
            err.message +
            ". Réessaie ou appelle 07 44 91 91 55."
        );
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
