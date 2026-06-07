// =========================================================================
// Studio SVB — Création d'un paiement Mollie via l'API (essai + Pass Starter)
//
// Endpoint: POST /api/create-essai-payment  (cf. _redirects)
//

import crypto from "node:crypto";
import {
  hasTrialLimitDatabase,
  hasUsedTrial,
  isTrialDiscipline,
  releaseTrialReservation,
  reserveTrial,
} from "./lib/trial-limits.js";

// Flow :
//   1) Visiteur remplit le mini-form sur /essai (prénom/nom/email/tel + discipline)
//   2) JS POST vers cette fonction
//   3) Fonction appelle l'API Mollie pour créer un paiement avec :
//        - billingEmail = email du client
//        - description = "Séance d'essai X — Prénom Nom" (visible app/dashboard)
//        - metadata = {firstname, lastname, email, phone, discipline, fbclid, utm_*, ga_*}
//   4) Retourne checkout URL → le JS redirige le client dessus
//   5) Mollie envoie une push native dans l'app SVB avec tous les détails
//      → l'admin sait QUI a payé QUOI sans aucune correlation manuelle
//
// Variable d'env requise :
//   MOLLIE_API_KEY = live_... (scopes: functions, runtime, builds)
// =========================================================================

const OFFERS = {
  reformer: {
    label: "Séance d'essai Pilates Reformer",
    amount: "30.00",
  },
  crossformer: {
    label: "Séance d'essai Crossformer",
    amount: "30.00",
  },
  cross_yoga_pilates: {
    label: "Séance d'essai Cross / Yoga / Boxe / Pilates sol",
    amount: "30.00",
  },
  pass_starter: {
    label: "Pass Starter — 5 séances découverte",
    amount: "99.90",
  },
};

function jsonRes(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

// ---- Meta CAPI Lead event (CRM / system_generated) -------------------
// Cf. doc Meta "Prospects convertis" : Lead event en action_source
// system_generated, dataset_id = pixel_id, custom_data.event_source = "crm"
function sha256Hex(input) {
  return crypto
    .createHash("sha256")
    .update(String(input).trim().toLowerCase())
    .digest("hex");
}

function normalizePhoneFR(phone) {
  if (!phone) return null;
  let d = String(phone).replace(/\D/g, "");
  if (d.startsWith("0033")) d = d.slice(2);
  else if (d.startsWith("33")) {
    // OK
  } else if (d.startsWith("0")) d = "33" + d.slice(1);
  return d;
}

async function sendMetaLead(opts) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    return { sent: false, reason: "capi_not_configured" };
  }

  const user_data = {};
  if (opts.email) user_data.em = [sha256Hex(opts.email)];
  const ph = normalizePhoneFR(opts.phone);
  if (ph) user_data.ph = [sha256Hex(ph)];
  if (opts.firstname) user_data.fn = [sha256Hex(opts.firstname)];
  if (opts.lastname) user_data.ln = [sha256Hex(opts.lastname)];
  if (opts.fbp) user_data.fbp = opts.fbp;
  if (opts.fbc) {
    user_data.fbc = opts.fbc;
  } else if (opts.fbclid) {
    user_data.fbc = `fb.1.${Date.now()}.${opts.fbclid}`;
  }
  user_data.country = [sha256Hex("fr")];

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.leadId,
    action_source: "system_generated",
    user_data,
    custom_data: {
      event_source: "crm",
      lead_event_source: "Studio SVB Site",
      content_category: "essai",
      content_name: opts.disciplineLabel || opts.discipline || "essai",
      value: opts.value,
      currency: "EUR",
    },
  };

  const url = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${encodeURIComponent(
    accessToken
  )}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const body = await resp.text();
    if (!resp.ok) {
      console.error("[meta-lead] error:", resp.status, body);
      return { sent: false, status: resp.status, body };
    }
    console.log("[meta-lead] Lead sent for", opts.leadId);
    return { sent: true };
  } catch (e) {
    console.error("[meta-lead] fetch threw:", e);
    return { sent: false, error: String(e) };
  }
}

async function releasePendingTrialReservation({ email, discipline }) {
  if (!isTrialDiscipline(discipline)) return;
  try {
    await releaseTrialReservation({
      id: null,
      billingEmail: email,
      metadata: { email, discipline },
    });
  } catch (e) {
    console.error("[create-essai-payment] trial reservation release failed:", e);
  }
}

function clean(s, max = 200) {
  if (s == null) return null;
  return String(s).trim().slice(0, max) || null;
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  // Health-check GET (pour verifier que la function est joignable)
  if (req.method === "GET") {
    return jsonRes({
      ok: true,
      service: "create-essai-payment",
      version: 6,
      has_api_key: !!process.env.MOLLIE_API_KEY,
      api_key_prefix: process.env.MOLLIE_API_KEY
        ? process.env.MOLLIE_API_KEY.slice(0, 5)
        : null,
      has_meta_pixel_id: !!process.env.META_PIXEL_ID,
      meta_pixel_id: process.env.META_PIXEL_ID || null,
      has_meta_capi_access_token: !!process.env.META_CAPI_ACCESS_TOKEN,
      has_trial_limit_database: hasTrialLimitDatabase(),
    });
  }
  if (req.method !== "POST") {
    return jsonRes({ ok: false, error: "method_not_allowed" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return jsonRes({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot anti-bot
  if (body["website-url"] || body.website_url) {
    return jsonRes({ ok: true, checkoutUrl: "/" }, 200);
  }

  const discipline = clean(body.discipline, 50);
  const firstname = clean(body.firstname, 80);
  const lastname = clean(body.lastname, 80);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);

  if (!discipline || !OFFERS[discipline]) {
    return jsonRes({ ok: false, error: "invalid_discipline" }, 400);
  }
  if (!firstname || !lastname || !email) {
    return jsonRes({ ok: false, error: "missing_fields" }, 400);
  }
  if (!isValidEmail(email)) {
    return jsonRes({ ok: false, error: "invalid_email" }, 400);
  }

  // Une seule offre decouverte par personne (essai + Pass Starter).
  // Check sur email + telephone normalises.
  if (isTrialDiscipline(discipline)) {
    try {
      const trial = await hasUsedTrial({ email, phone });
      if (trial.used) {
        return jsonRes(
          {
            ok: false,
            error: "trial_already_used",
            message:
              "Tu as déjà bénéficié d'une offre découverte chez SVB (séance d'essai ou Pass Starter). Pour la suite, découvre nos abonnements ou appelle-nous au 07 44 91 91 55.",
          },
          409
        );
      }
    } catch (e) {
      console.error("[create-essai-payment] trial-limit check failed:", e);
      // En cas d'erreur DB on laisse passer (fail-open) pour ne pas
      // bloquer un client legitime
    }
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    console.error("[mollie] MOLLIE_API_KEY env var not set");
    return jsonRes({ ok: false, error: "mollie_not_configured" }, 500);
  }

  const offer = OFFERS[discipline];
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const description = `${offer.label} — ${firstname} ${lastname}`;

  let trialReserved = false;
  if (isTrialDiscipline(discipline)) {
    const reservation = await reserveTrial({
      email,
      phone,
      firstname,
      lastname,
      discipline,
      paymentId: null,
    });

    if (!reservation.reserved) {
      if (reservation.used) {
        console.warn(
          "[create-essai-payment] trial reservation blocked:",
          JSON.stringify(reservation)
        );
        return jsonRes(
          {
            ok: false,
            error: "trial_already_used",
            message:
              "Tu as déjà bénéficié d'une offre découverte chez SVB (séance d'essai ou Pass Starter). Pour la suite, découvre nos abonnements ou appelle-nous au 07 44 91 91 55.",
          },
          409
        );
      }
      console.error(
        "[create-essai-payment] trial reservation failed:",
        JSON.stringify(reservation)
      );
      return jsonRes(
        {
          ok: false,
          error: "trial_lock_unavailable",
          message:
            "La réservation de ton offre découverte est momentanément indisponible. Réessaie dans quelques minutes ou appelle-nous au 07 44 91 91 55.",
        },
        503
      );
    }
    trialReserved = true;
  }

  const payload = {
    amount: { value: offer.amount, currency: "EUR" },
    description,
    redirectUrl: `${siteUrl}/merci-essai`,
    webhookUrl: `${siteUrl}/api/mollie-webhook`,
    locale: "fr_FR",
    billingEmail: email.toLowerCase(),
    metadata: {
      firstname,
      lastname,
      email: email.toLowerCase(),
      phone,
      discipline,
      offer_label: offer.label,
      fbclid: clean(body.fbclid, 200),
      fbp: clean(body.fbp, 200),
      fbc: clean(body.fbc, 200),
      utm_source: clean(body.utm_source, 80),
      utm_medium: clean(body.utm_medium, 80),
      utm_campaign: clean(body.utm_campaign, 120),
      utm_content: clean(body.utm_content, 120),
      utm_term: clean(body.utm_term, 120),
      gclid: clean(body.gclid, 200),
      gbraid: clean(body.gbraid, 200),
      wbraid: clean(body.wbraid, 200),
      // GA4 client_id (extrait du cookie _ga cote browser) : permet au
      // webhook Mollie d'envoyer un purchase server-side via GA4
      // Measurement Protocol, attribue au meme user GA4 que la session
      // qui a clique sur "Reserver" (cross-session/cross-device safe).
      ga_client_id: clean(body.ga_client_id, 100),
      ga_session_id: clean(body.ga_session_id, 50),
      page_location: clean(body.page_location, 500),
      page_referrer: clean(body.page_referrer, 500),
      submitted_at: new Date().toISOString(),
    },
  };

  try {
    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!mollieRes.ok) {
      const errText = await mollieRes.text();
      console.error("[mollie] API error:", mollieRes.status, errText);
      if (trialReserved) {
        await releasePendingTrialReservation({ email, discipline });
      }
      return jsonRes(
        {
          ok: false,
          error: "mollie_api_error",
          status: mollieRes.status,
          details: errText.slice(0, 500),
        },
        502
      );
    }

    const payment = await mollieRes.json();
    const checkoutUrl = payment?._links?.checkout?.href;

    if (!checkoutUrl) {
      console.error("[mollie] No checkout URL:", JSON.stringify(payment));
      if (trialReserved) {
        await releasePendingTrialReservation({ email, discipline });
      }
      return jsonRes({ ok: false, error: "no_checkout_url" }, 502);
    }

    // Fire Meta CAPI Lead event (CRM/system_generated)
    // event_id = payment.id pour dedup avec d'eventuels autres canaux.
    // Async non-bloquant : on attend pas la reponse Meta pour rendre la
    // redirection Mollie au client (perf), mais on log si erreur.
    sendMetaLead({
      email: email.toLowerCase(),
      phone,
      firstname,
      lastname,
      discipline,
      disciplineLabel: offer.label,
      fbclid: clean(body.fbclid, 200),
      fbp: clean(body.fbp, 200),
      fbc: clean(body.fbc, 200),
      leadId: payment.id,
      value: parseFloat(offer.amount),
    }).catch((e) => console.error("[meta-lead] uncaught:", e));

    return jsonRes({
      ok: true,
      checkoutUrl,
      paymentId: payment.id,
    });
  } catch (e) {
    console.error("[mollie] Fetch error:", e);
    if (trialReserved) {
      await releasePendingTrialReservation({ email, discipline });
    }
    return jsonRes({ ok: false, error: "fetch_error" }, 500);
  }
};

export const config = {
  path: "/api/create-essai-payment",
};
