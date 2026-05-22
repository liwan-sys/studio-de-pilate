// =========================================================================
// Studio SVB — Webhook Mollie (notification de paiement par email)
//
// Endpoint: POST /api/mollie-webhook
//
// Flow :
//   1) Mollie POST { id: "tr_xxx" } a cette URL des qu'un statut de
//      paiement change (paid, failed, expired, canceled).
//   2) On rappelle l'API Mollie pour recuperer le statut + metadata.
//   3) Si paid, on envoie un email a hello@studiosvb.fr via Resend
//      avec toutes les infos client (nom, email, tel, discipline, source).
//   4) On retourne 200 OK pour que Mollie ne retente pas.
//
// Variables d'env requises :
//   MOLLIE_API_KEY = live_...  (pour rappeler l'API Mollie)
//   RESEND_API_KEY = re_...    (pour envoyer l'email)
//
// Optionnelles :
//   NOTIFICATION_EMAIL_TO   = hello@studiosvb.fr (defaut)
//   NOTIFICATION_EMAIL_FROM = "Studio SVB <noreply@studiosvb.fr>"
//                             (defaut: onboarding@resend.dev — sender
//                             par defaut Resend, fonctionne sans
//                             verification de domaine)
// =========================================================================

import crypto from "node:crypto";

const DEFAULT_TO = "hello@studiosvb.fr";
const DEFAULT_FROM = "Studio SVB <onboarding@resend.dev>";
// v1.2 — Meta Conversions API (Purchase event server-side)

const DISCIPLINE_LABEL = {
  reformer: "Pilates Reformer",
  crossformer: "Crossformer",
  cross_yoga_pilates: "Cross / Yoga / Boxe / Pilates sol",
  pass_starter: "Pass Starter",
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailContent(payment) {
  const meta = payment.metadata || {};
  const amount = payment.amount?.value
    ? `${payment.amount.value} ${payment.amount.currency}`
    : "—";
  const firstname = meta.firstname || "Client";
  const email = meta.email || payment.billingEmail || "—";
  const phone = meta.phone || "—";
  const disciplineKey = meta.discipline || "";
  const disciplineLabel =
    meta.offer_label ||
    DISCIPLINE_LABEL[disciplineKey] ||
    disciplineKey ||
    "—";
  const source = meta.fbclid
    ? "Meta Ads (fbclid détecté)"
    : meta.utm_source
    ? `${meta.utm_source}${meta.utm_campaign ? " / " + meta.utm_campaign : ""}`
    : "Direct";
  const paidAt = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
  const mollieDashUrl = `https://my.mollie.com/dashboard/sales/${payment.id}`;

  const subject = `💸 Nouveau paiement ${amount} — ${firstname} (${disciplineLabel})`;

  const text = [
    `Nouveau paiement reçu : ${amount}`,
    ``,
    `Cliente : ${firstname}`,
    `Email   : ${email}`,
    `Tél     : ${phone}`,
    `Offre   : ${disciplineLabel}`,
    `Source  : ${source}`,
    `Payé le : ${paidAt}`,
    ``,
    `📞 Rappelle dans l'heure pour caler son créneau.`,
    ``,
    `Lien Mollie : ${mollieDashUrl}`,
    `Payment ID : ${payment.id}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FBF6EC;color:#2F4F4F;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(47,79,79,.08);">

    <div style="background:linear-gradient(135deg,#4A8D84,#2F4F4F);padding:24px;color:#fff;">
      <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;font-weight:700;">Paiement reçu</div>
      <div style="font-size:32px;font-weight:900;margin-top:4px;">${escapeHtml(amount)}</div>
      <div style="font-size:15px;opacity:.92;margin-top:2px;">${escapeHtml(disciplineLabel)}</div>
    </div>

    <div style="padding:24px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:15px;">
        <tr><td style="padding:8px 0;color:#7a8c8a;width:90px;">👤 Prénom</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(firstname)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8c8a;">📧 Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#4A8D84;text-decoration:none;font-weight:700;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#7a8c8a;">📞 Tél</td><td style="padding:8px 0;"><a href="tel:${escapeHtml(phone)}" style="color:#4A8D84;text-decoration:none;font-weight:700;">${escapeHtml(phone)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#7a8c8a;">🎯 Offre</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(disciplineLabel)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8c8a;">📊 Source</td><td style="padding:8px 0;">${escapeHtml(source)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a8c8a;">🕓 Payé le</td><td style="padding:8px 0;">${escapeHtml(paidAt)}</td></tr>
      </table>

      <div style="margin:20px 0;padding:16px;background:#FBF6EC;border-left:4px solid #F5C76D;border-radius:8px;font-size:14px;">
        <strong>📞 Rappelle dans l'heure</strong> pour caler son créneau et lui donner l'adresse exacte.
      </div>

      <a href="${escapeHtml(mollieDashUrl)}" style="display:inline-block;padding:12px 22px;background:#4A8D84;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:14px;">
        Voir le paiement dans Mollie →
      </a>

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;">
        Payment ID : <code>${escapeHtml(payment.id)}</code>
      </div>
    </div>
  </div>
</body></html>`;

  return { subject, text, html };
}

// ---- Meta Conversions API ----------------------------------------------

function sha256Hex(input) {
  return crypto
    .createHash("sha256")
    .update(String(input).trim().toLowerCase())
    .digest("hex");
}

// Normalise un numero FR vers E.164 sans le "+", digits uniquement
// 0766506042 -> 33766506042
// +33766506042 -> 33766506042
// 06 66 50 60 42 -> 33766506042
function normalizePhoneFR(phone) {
  if (!phone) return null;
  let d = String(phone).replace(/\D/g, "");
  if (d.startsWith("0033")) d = d.slice(2);
  else if (d.startsWith("33")) {
    // OK
  } else if (d.startsWith("0")) d = "33" + d.slice(1);
  return d;
}

async function sendMetaPurchase(payment, eventSourceUrl) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn(
      "[mollie-webhook] Meta CAPI not configured (missing PIXEL_ID or ACCESS_TOKEN)"
    );
    return { sent: false, reason: "capi_not_configured" };
  }

  const meta = payment.metadata || {};
  const actualAmount = parseFloat(payment.amount?.value || "0");
  // ⭐ LTV optimization : on envoie la valeur predite a vie (200€ par defaut)
  // au lieu du montant reel de la transaction (30€). Meta optimise alors
  // pour trouver des high-LTV customers, pas juste des trial-payeurs.
  // Override possible via env var META_PURCHASE_LTV_VALUE.
  const ltvValue = parseFloat(process.env.META_PURCHASE_LTV_VALUE || "200");
  const amountValue = ltvValue > 0 ? ltvValue : actualAmount;
  const currency = payment.amount?.currency || "EUR";
  const eventTime = payment.paidAt
    ? Math.floor(new Date(payment.paidAt).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  // event_id = payment.id pour deduplication avec le client-side Pixel
  // (merci-essai.html peut firer fbq('track','Purchase',...,{eventID:...}))
  const eventId = payment.id;

  // user_data : email + phone hashes SHA-256, plus fbc/fbp si dispo
  const user_data = {};
  const email = meta.email || payment.billingEmail;
  if (email) user_data.em = [sha256Hex(email)];
  const phoneNorm = normalizePhoneFR(meta.phone);
  if (phoneNorm) user_data.ph = [sha256Hex(phoneNorm)];
  if (meta.firstname) user_data.fn = [sha256Hex(meta.firstname)];
  if (meta.fbclid) {
    // Format fbc : fb.1.{creation_time_ms}.{fbclid}
    // On ne connait pas exactement le moment du clic, on prend une approx
    // basee sur submitted_at, sinon paidAt
    const sub = meta.submitted_at
      ? new Date(meta.submitted_at).getTime()
      : Date.now();
    user_data.fbc = `fb.1.${sub}.${meta.fbclid}`;
  }
  user_data.country = [sha256Hex("fr")];

  const event = {
    event_name: "Purchase",
    event_time: eventTime,
    event_id: eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data,
    custom_data: {
      value: amountValue,
      currency,
      content_category: "essai",
      content_name: meta.offer_label || "Seance d'essai SVB",
      content_ids: meta.discipline ? [meta.discipline] : undefined,
      content_type: "product",
      num_items: 1,
    },
  };

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${encodeURIComponent(
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
      console.error("[meta-capi] error:", resp.status, body);
      return { sent: false, reason: "capi_error", status: resp.status, body };
    }
    console.log("[meta-capi] Purchase sent for", payment.id, body);
    return { sent: true, response: body };
  } catch (e) {
    console.error("[meta-capi] fetch threw:", e);
    return { sent: false, reason: "fetch_error", error: String(e) };
  }
}

// ---- GA4 Measurement Protocol (Purchase server-side) ------------------
// Permet de tracker le purchase dans GA4 meme si le client a ferme la
// page de retour /merci-essai (cas frequent : mobile -> desktop, onglet
// ferme, refus de cookies au retour Mollie, etc.). Source de verite =
// le webhook Mollie (statut paid), independante du browser.
//
// Variables d'env requises :
//   GA4_MEASUREMENT_ID = G-DHS707Y6XJ  (defaut hardcode si manquant)
//   GA4_API_SECRET     = xxx  (cree dans GA4 Admin > Flux > Measurement Protocol)
//
// Dedup : transaction_id = payment.id. GA4 dedup natif les purchases avec
// le meme transaction_id, donc OK meme si le client-side firePurchaseEvents()
// envoie aussi le meme event (cas rare ou les 2 fonctionnent).
async function sendGA4Purchase(payment) {
  const measurementId = process.env.GA4_MEASUREMENT_ID || "G-DHS707Y6XJ";
  const apiSecret = process.env.GA4_API_SECRET;
  if (!apiSecret) {
    console.warn("[ga4-mp] GA4_API_SECRET not configured, skipping");
    return { sent: false, reason: "not_configured" };
  }

  const meta = payment.metadata || {};
  const amount = parseFloat(payment.amount?.value || "0");
  const currency = payment.amount?.currency || "EUR";
  const disciplineKey = meta.discipline || "essai";
  const sessionId = meta.ga_session_id || String(Date.now());
  const disciplineLabel =
    meta.offer_label ||
    DISCIPLINE_LABEL[disciplineKey] ||
    "Seance d'essai SVB";

  // client_id : on prend celui capture au create-essai-payment (cookie _ga
  // cote browser), sinon on fabrique un id stable base sur le payment.id
  // pour ne pas creer un nouveau "user" si le webhook est rejoue.
  const clientId = meta.ga_client_id || `svb.${payment.id}`;

  const params = {
    transaction_id: payment.id,
    value: amount,
    currency,
    session_id: sessionId,
    engagement_time_msec: 100,
    items: [
      {
        item_id: disciplineKey,
        item_name: disciplineLabel,
        item_category: "essai",
        price: amount,
        quantity: 1,
      },
    ],
  };

  // Attribution : on forward les UTM dans les params (GA4 les utilise pour
  // l'attribution Source/Medium/Campaign meme en server-side)
  if (meta.utm_source) params.source = meta.utm_source;
  if (meta.utm_medium) params.medium = meta.utm_medium;
  if (meta.utm_campaign) params.campaign = meta.utm_campaign;

  const payload = {
    client_id: clientId,
    non_personalized_ads: false,
    events: [
      {
        name: "purchase",
        params,
      },
    ],
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // GA4 MP retourne 2xx no-body si OK. En cas d'erreur, body texte.
    if (!resp.ok) {
      const body = await resp.text();
      console.error("[ga4-mp] error:", resp.status, body);
      return { sent: false, status: resp.status, body };
    }
    console.log(
      "[ga4-mp] purchase sent",
      payment.id,
      "value=" + amount,
      "client_id=" + clientId
    );
    return { sent: true };
  } catch (e) {
    console.error("[ga4-mp] fetch threw:", e);
    return { sent: false, error: String(e) };
  }
}

// ---- Email client de bienvenue (post-paiement) -------------------------

function buildCustomerWelcomeEmail(payment) {
  const meta = payment.metadata || {};
  const firstname = meta.firstname || "toi";
  const disciplineKey = meta.discipline || "";
  const disciplineLabel =
    meta.offer_label || DISCIPLINE_LABEL[disciplineKey] || "Séance d'essai SVB";
  const subject = `Ta séance d'essai SVB est réservée ${firstname} ! 🎯`;

  const text = [
    `Hello ${firstname} !`,
    ``,
    `Ton paiement pour ta ${disciplineLabel} est bien reçu — bienvenue chez SVB !`,
    ``,
    `Ce qui se passe maintenant :`,
    `1. On t'appelle ou on t'envoie un WhatsApp dans l'heure pour caler ton créneau`,
    `2. Tu reçois un SMS de confirmation avec l'adresse et le nom de ton coach`,
    `3. Tu viens 10 min avant, en tenue de sport. On met tout en place pour toi (équipement, machines, etc.). Seules les chaussettes anti-dérapantes sont à apporter ou à acheter sur place (10,30 €).`,
    ``,
    `📞 Besoin de nous joindre avant ? 07 44 91 91 55`,
    `💬 WhatsApp : https://wa.me/33744919155`,
    ``,
    `Pendant que tu attends notre appel, jette un œil à notre Pass Starter :`,
    `5 séances pour 99,90€ — la meilleure façon de tester tous nos formats.`,
    `https://studiosvb.com/tarifs`,
    ``,
    `À très vite,`,
    `L'équipe Studio SVB`,
    `Saint-Ouen-sur-Seine`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FBF6EC;color:#2F4F4F;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(47,79,79,.08);">

    <div style="background:linear-gradient(135deg,#4A8D84,#2F4F4F);padding:36px 28px;color:#fff;text-align:center;">
      <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;font-weight:700;margin-bottom:8px;">Réservation confirmée</div>
      <div style="font-family:'Dancing Script','Brush Script MT',cursive;font-size:38px;line-height:1.1;font-weight:700;">Hello ${escapeHtml(firstname)} 👋</div>
    </div>

    <div style="padding:28px 28px 8px;">
      <p style="font-size:16px;line-height:1.55;margin:0 0 18px;">
        Ton paiement pour ta <strong>${escapeHtml(disciplineLabel)}</strong> est bien reçu — <strong>bienvenue chez SVB !</strong>
      </p>

      <div style="background:#FBF6EC;border-left:4px solid #F5C76D;border-radius:10px;padding:18px 18px 14px;margin:18px 0;">
        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#4A8D84;margin-bottom:10px;">Et ensuite ?</div>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:14.5px;line-height:1.5;">
          <tr><td style="vertical-align:top;width:30px;padding:6px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4A8D84;color:#fff;font-weight:700;text-align:center;line-height:24px;font-size:13px;">1</span></td><td style="padding:6px 0;">On t'appelle ou on t'envoie un <strong>WhatsApp dans l'heure</strong> pour caler ton créneau.</td></tr>
          <tr><td style="vertical-align:top;padding:6px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4A8D84;color:#fff;font-weight:700;text-align:center;line-height:24px;font-size:13px;">2</span></td><td style="padding:6px 0;">Tu reçois un <strong>SMS de confirmation</strong> avec l'adresse exacte et le nom de ton coach.</td></tr>
          <tr><td style="vertical-align:top;padding:6px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#4A8D84;color:#fff;font-weight:700;text-align:center;line-height:24px;font-size:13px;">3</span></td><td style="padding:6px 0;">Tu viens <strong>10 min avant</strong>, en tenue de sport. <strong>On met tout en place pour toi</strong> (équipement, machines, etc.). Seules les <strong>chaussettes anti-dérapantes</strong> sont à apporter — ou à acheter sur place (<strong>10,30 €</strong>).</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:24px 0 18px;">
        <a href="https://wa.me/33744919155" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 26px;border-radius:50px;font-weight:700;font-size:15px;margin:0 6px 8px;">💬 WhatsApp</a>
        <a href="tel:+33744919155" style="display:inline-block;background:#fff;color:#2F4F4F;border:2px solid #4A8D84;text-decoration:none;padding:12px 26px;border-radius:50px;font-weight:700;font-size:15px;margin:0 6px 8px;">📞 07 44 91 91 55</a>
      </div>

      <div style="background:linear-gradient(135deg,#F5C76D 0%,#E8B496 100%);border-radius:12px;padding:18px 20px;margin:22px 0 8px;text-align:center;">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;margin-bottom:6px;">En attendant ta séance</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:10px;line-height:1.4;">Découvre le <strong>Pass Starter</strong> — 5 séances pour 99,90€</div>
        <a href="https://studiosvb.com/tarifs" style="display:inline-block;background:#2F4F4F;color:#fff;text-decoration:none;padding:10px 22px;border-radius:50px;font-weight:700;font-size:13px;">Voir les tarifs →</a>
      </div>

      <p style="font-size:13px;color:#7a8c8a;text-align:center;margin:24px 0 4px;">
        À très vite chez SVB,<br><strong>L'équipe Santez Vous Bien</strong> · Saint-Ouen-sur-Seine
      </p>
    </div>

    <div style="background:#FBF6EC;padding:16px;text-align:center;font-size:11px;color:#7a8c8a;">
      Studio SVB · 18 rue des Bateliers, 93400 Saint-Ouen-sur-Seine<br>
      <a href="https://studiosvb.com" style="color:#4A8D84;text-decoration:none;">studiosvb.com</a>
    </div>
  </div>
</body></html>`;

  return { subject, text, html };
}

// ---- Email de retargeting (paiement abandonne/annule/expire) -----------

function buildRetargetingEmail(payment) {
  const meta = payment.metadata || {};
  const firstname = meta.firstname || "toi";
  const disciplineKey = meta.discipline || "";
  const disciplineLabel =
    meta.offer_label || DISCIPLINE_LABEL[disciplineKey] || "ta séance d'essai";
  const subject = `${firstname}, t'as oublié ta séance d'essai SVB ?`;

  // UTM tracking pour mesurer la conversion de la campagne retargeting email dans GA4
  // (Source/Medium/Campaign/Content visibles dans GA4 > Acquisition > Trafic d'acquisition)
  const utm = "utm_source=email&utm_medium=retargeting&utm_campaign=abandoned_essai" +
    (disciplineKey ? "&utm_content=" + encodeURIComponent(disciplineKey) : "");
  const retargetUrl = "https://studiosvb.com/essai?" + utm;

  const text = [
    `Hello ${firstname},`,
    ``,
    `J'ai vu que tu avais commencé à réserver ta ${disciplineLabel} chez SVB mais que le paiement n'est pas passé.`,
    ``,
    `Petit souci technique ? Hésitation ? Tu veux qu'on en parle ?`,
    ``,
    `📞 Appelle-nous : 07 44 91 91 55`,
    `💬 WhatsApp : https://wa.me/33744919155`,
    `🎯 Ou reprends ta réservation : ${retargetUrl}`,
    ``,
    `On a 146 avis 5★ et des coachs en or. Viens voir.`,
    ``,
    `À très vite,`,
    `L'équipe Studio SVB`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FBF6EC;color:#2F4F4F;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(47,79,79,.08);">
    <div style="background:linear-gradient(135deg,#E8B496,#F5C76D);padding:32px 28px;color:#2F4F4F;text-align:center;">
      <div style="font-family:'Dancing Script','Brush Script MT',cursive;font-size:36px;line-height:1.1;font-weight:700;">Hello ${escapeHtml(firstname)} 👋</div>
      <div style="font-size:14px;margin-top:8px;opacity:.85;">Tout va bien ?</div>
    </div>
    <div style="padding:28px;">
      <p style="font-size:16px;line-height:1.55;margin:0 0 18px;">
        J'ai vu que tu avais commencé à réserver ta <strong>${escapeHtml(disciplineLabel)}</strong> chez SVB mais que le paiement n'est pas passé.
      </p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px;color:#4A8D84;font-weight:600;">
        Petit souci technique ? Hésitation ? Tu veux qu'on en parle ?
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${retargetUrl}" style="display:inline-block;background:#4A8D84;color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:700;font-size:15px;margin:6px;">🎯 Reprendre ma réservation</a>
        <br>
        <a href="https://wa.me/33744919155" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:50px;font-weight:700;font-size:14px;margin:6px;">💬 WhatsApp</a>
        <a href="tel:+33744919155" style="display:inline-block;background:#fff;color:#2F4F4F;border:2px solid #4A8D84;text-decoration:none;padding:10px 22px;border-radius:50px;font-weight:700;font-size:14px;margin:6px;">📞 07 44 91 91 55</a>
      </div>
      <p style="font-size:13px;color:#7a8c8a;text-align:center;margin:22px 0 4px;">
        146 avis 5★ · Coachs certifiés · Annulation 1h avant<br>
        <strong>Studio SVB</strong> · Saint-Ouen-sur-Seine
      </p>
    </div>
  </div>
</body></html>`;

  return { subject, text, html };
}

// ---- Meta CAPI AbandonedCart (paiement non-finalise) -------------------

async function sendMetaAbandonedCart(payment, eventSourceUrl) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return { sent: false, reason: "capi_not_configured" };

  const meta = payment.metadata || {};
  const ltvValue = parseFloat(process.env.META_PURCHASE_LTV_VALUE || "200");

  const user_data = {};
  const email = meta.email || payment.billingEmail;
  if (email) user_data.em = [sha256Hex(email)];
  const phoneNorm = normalizePhoneFR(meta.phone);
  if (phoneNorm) user_data.ph = [sha256Hex(phoneNorm)];
  if (meta.firstname) user_data.fn = [sha256Hex(meta.firstname)];
  if (meta.fbclid) {
    const sub = meta.submitted_at ? new Date(meta.submitted_at).getTime() : Date.now();
    user_data.fbc = `fb.1.${sub}.${meta.fbclid}`;
  }
  user_data.country = [sha256Hex("fr")];

  const event = {
    event_name: "AddToCart",
    event_time: Math.floor(Date.now() / 1000),
    event_id: payment.id + "_abandoned",
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data,
    custom_data: {
      value: ltvValue,
      currency: "EUR",
      content_category: "essai",
      content_name: meta.offer_label || "Seance d'essai SVB",
      content_ids: meta.discipline ? [meta.discipline] : undefined,
      content_type: "product",
      num_items: 1,
    },
  };

  const url = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const body = await resp.text();
    if (!resp.ok) {
      console.error("[meta-abandoned] error:", resp.status, body);
      return { sent: false, status: resp.status, body };
    }
    console.log("[meta-abandoned] AddToCart sent for", payment.id);
    return { sent: true };
  } catch (e) {
    console.error("[meta-abandoned] fetch threw:", e);
    return { sent: false, error: String(e) };
  }
}

// ---- Resend email -------------------------------------------------------

async function sendEmail({ to, from, subject, html, text, scheduledAt, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[mollie-webhook] RESEND_API_KEY not set, skipping email");
    return { sent: false, reason: "no_api_key" };
  }
  const payload = { from, to: [to], subject, html, text };
  // Reply-To : permet d'envoyer DEPUIS le domaine verifie noreply@studiosvb.com
  // mais que les reponses partent vers hello@studiosvb.fr (boite reelle).
  if (replyTo) payload.reply_to = replyTo;
  // Resend Scheduled Send : supporte natural language ("in 2 minutes",
  // "in 1 hour") ou ISO 8601 timestamp. Resend retient l'email et
  // l'envoie a l'heure prevue, on n'a pas a gerer de file d'attente.
  if (scheduledAt) payload.scheduled_at = scheduledAt;
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("[mollie-webhook] Resend error:", resp.status, t);
    return { sent: false, reason: "resend_error", status: resp.status, body: t };
  }
  const j = await resp.json();
  return { sent: true, id: j.id };
}

export default async (req) => {
  // Health check + test manuel
  if (req.method === "GET") {
    const url = new URL(req.url);
    const isTest = url.searchParams.get("test") === "1";

    if (isTest) {
      // Envoie un email de test pour valider Resend de bout en bout
      const fakePayment = {
        id: "tr_TEST_" + Date.now(),
        status: "paid",
        amount: { value: "30.00", currency: "EUR" },
        billingEmail: "test@example.com",
        paidAt: new Date().toISOString(),
        metadata: {
          firstname: "Sophie",
          email: "sophie.test@example.com",
          phone: "0612345678",
          discipline: "reformer",
          offer_label: "Séance d'essai Pilates Reformer",
          fbclid: "TEST_fbclid_abc123",
        },
      };
      const to = process.env.NOTIFICATION_EMAIL_TO || DEFAULT_TO;
      const from = process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_FROM;
      const { subject, html, text } = buildEmailContent(fakePayment);
      const result = await sendEmail({ to, from, subject, html, text });
      return new Response(
        JSON.stringify({
          ok: result.sent,
          test: true,
          to,
          from,
          resend_result: result,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        service: "mollie-webhook",
        version: "1.1",
        has_mollie_key: !!process.env.MOLLIE_API_KEY,
        has_resend_key: !!process.env.RESEND_API_KEY,
        has_ga4_secret: !!process.env.GA4_API_SECRET,
        ga4_measurement_id: process.env.GA4_MEASUREMENT_ID || "G-DHS707Y6XJ",
        email_to: process.env.NOTIFICATION_EMAIL_TO || DEFAULT_TO,
        email_from: process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_FROM,
        hint: "Add ?test=1 to send a test email immediately",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Mollie envoie en POST avec body URL-encoded { id: "tr_xxx" } ou JSON.
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let paymentId = null;
  try {
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      const body = await req.json();
      paymentId = body.id;
    } else {
      // URL-encoded (format Mollie classique)
      const text = await req.text();
      const params = new URLSearchParams(text);
      paymentId = params.get("id");
    }
  } catch (e) {
    console.error("[mollie-webhook] parse error:", e);
    return new Response("Bad request", { status: 400 });
  }

  if (!paymentId || !paymentId.startsWith("tr_")) {
    console.warn("[mollie-webhook] invalid payment id:", paymentId);
    return new Response("OK", { status: 200 }); // pour pas que Mollie retente
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    console.error("[mollie-webhook] MOLLIE_API_KEY not configured");
    return new Response("Server not configured", { status: 500 });
  }

  // Récupère le paiement depuis l'API Mollie
  let payment;
  try {
    const r = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) {
      console.error("[mollie-webhook] Mollie GET error:", r.status, await r.text());
      // 200 pour pas que Mollie retente sur erreur permanente
      return new Response("OK", { status: 200 });
    }
    payment = await r.json();
  } catch (e) {
    console.error("[mollie-webhook] Mollie fetch error:", e);
    return new Response("Temporary error", { status: 503 }); // retry
  }

  const adminTo = process.env.NOTIFICATION_EMAIL_TO || DEFAULT_TO;
  const from = process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_FROM;
  // Reply-To pour les mails clients : repond a hello@studiosvb.fr
  const customerReplyTo = process.env.NOTIFICATION_EMAIL_REPLY_TO || "hello@studiosvb.fr";
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const eventSourceUrl = `${siteUrl}/merci-essai`;
  const meta = payment.metadata || {};
  const customerEmail = meta.email || payment.billingEmail;

  // === BRANCHE 1 : Paiement reussi ===
  if (payment.status === "paid") {
    const adminContent = buildEmailContent(payment);
    const customerContent = buildCustomerWelcomeEmail(payment);

    const [adminEmail, customerEmailSent, capi, ga4mp] = await Promise.all([
      sendEmail({ to: adminTo, from, ...adminContent }),
      customerEmail
        ? sendEmail({ to: customerEmail, from, replyTo: customerReplyTo, ...customerContent })
        : Promise.resolve({ sent: false, reason: "no_customer_email" }),
      sendMetaPurchase(payment, eventSourceUrl),
      sendGA4Purchase(payment),
    ]);

    console.log("[mollie-webhook] paid → admin:", JSON.stringify(adminEmail));
    console.log("[mollie-webhook] paid → customer:", JSON.stringify(customerEmailSent));
    console.log("[mollie-webhook] paid → capi:", JSON.stringify(capi));
    console.log("[mollie-webhook] paid → ga4mp:", JSON.stringify(ga4mp));

    return new Response("OK", { status: 200 });
  }

  // === BRANCHE 2 : Paiement abandonne / annule / expire / echec ===
  // → email de retargeting + event Meta CAPI AddToCart pour audience
  if (["canceled", "expired", "failed"].includes(payment.status)) {
    if (!customerEmail) {
      console.log(`[mollie-webhook] ${payment.status} ${paymentId}: pas d'email client, skip`);
      return new Response("OK", { status: 200 });
    }

    const retargetContent = buildRetargetingEmail(payment);
    // Delai configurable via env (defaut "in 2 minutes" pour test,
    // a passer "in 1 hour" en prod une fois valide)
    const delay = process.env.RETARGETING_EMAIL_DELAY || "in 2 minutes";

    const [retargetEmail, capi] = await Promise.all([
      sendEmail({
        to: customerEmail,
        from,
        replyTo: customerReplyTo,
        ...retargetContent,
        scheduledAt: delay,
      }),
      sendMetaAbandonedCart(payment, eventSourceUrl),
    ]);
    console.log(`[mollie-webhook] retarget scheduled for "${delay}"`);

    console.log(`[mollie-webhook] ${payment.status} → retarget email:`, JSON.stringify(retargetEmail));
    console.log(`[mollie-webhook] ${payment.status} → capi abandoned:`, JSON.stringify(capi));

    return new Response("OK", { status: 200 });
  }

  // === BRANCHE 3 : Statuts intermediaires (open, pending, authorized) ===
  console.log(`[mollie-webhook] payment ${paymentId} status=${payment.status}, no-op`);
  return new Response("OK", { status: 200 });
};

export const config = {
  path: "/api/mollie-webhook",
};
