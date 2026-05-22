// =========================================================================
// Studio SVB — Création d'un paiement Mollie via l'API (essai + Pass Starter)
//
// Endpoint: POST /api/create-essai-payment  (cf. _redirects)
//
// Flow :
//   1) Visiteur remplit le mini-form sur /essai (prénom/email/tel + discipline)
//   2) JS POST vers cette fonction
//   3) Fonction appelle l'API Mollie pour créer un paiement avec :
//        - billingEmail = email du client
//        - description = "Séance d'essai X — Prénom" (visible app/dashboard)
//        - metadata = {firstname, email, phone, discipline, fbclid, utm_*}
//   4) Retourne checkout URL → le JS redirige le client dessus
//   5) Mollie envoie une push native dans l'app SVB avec tous les détails
//      → l'admin sait QUI a payé QUOI sans aucune correlation manuelle
//
// Variable d'env requise :
//   MOLLIE_API_KEY = live_... (scope Functions uniquement, marquée Secret)
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
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
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);

  if (!discipline || !OFFERS[discipline]) {
    return jsonRes({ ok: false, error: "invalid_discipline" }, 400);
  }
  if (!firstname || !email) {
    return jsonRes({ ok: false, error: "missing_fields" }, 400);
  }
  if (!isValidEmail(email)) {
    return jsonRes({ ok: false, error: "invalid_email" }, 400);
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    console.error("[mollie] MOLLIE_API_KEY env var not set");
    return jsonRes({ ok: false, error: "mollie_not_configured" }, 500);
  }

  const offer = OFFERS[discipline];
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const description = `${offer.label} — ${firstname}`;

  const payload = {
    amount: { value: offer.amount, currency: "EUR" },
    description,
    redirectUrl: `${siteUrl}/merci-essai`,
    locale: "fr_FR",
    billingEmail: email.toLowerCase(),
    metadata: {
      firstname,
      email: email.toLowerCase(),
      phone,
      discipline,
      offer_label: offer.label,
      fbclid: clean(body.fbclid, 200),
      utm_source: clean(body.utm_source, 80),
      utm_medium: clean(body.utm_medium, 80),
      utm_campaign: clean(body.utm_campaign, 120),
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
      return jsonRes({ ok: false, error: "no_checkout_url" }, 502);
    }

    return jsonRes({
      ok: true,
      checkoutUrl,
      paymentId: payment.id,
    });
  } catch (e) {
    console.error("[mollie] Fetch error:", e);
    return jsonRes({ ok: false, error: "fetch_error" }, 500);
  }
};

export const config = {
  path: "/api/create-essai-payment",
};
