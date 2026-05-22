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
  const amountValue = parseFloat(payment.amount?.value || "0");
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

// ---- Resend email -------------------------------------------------------

async function sendEmail({ to, from, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[mollie-webhook] RESEND_API_KEY not set, skipping email");
    return { sent: false, reason: "no_api_key" };
  }
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
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

  // On notifie uniquement les paiements PAYES
  // (Mollie envoie aussi des webhooks pour failed/expired/canceled)
  if (payment.status !== "paid") {
    console.log(
      `[mollie-webhook] payment ${paymentId} status=${payment.status}, skipping email`
    );
    return new Response("OK", { status: 200 });
  }

  const to = process.env.NOTIFICATION_EMAIL_TO || DEFAULT_TO;
  const from = process.env.NOTIFICATION_EMAIL_FROM || DEFAULT_FROM;
  const { subject, html, text } = buildEmailContent(payment);

  const siteUrl = process.env.URL || "https://studiosvb.com";
  const eventSourceUrl = `${siteUrl}/merci-essai`;

  // Email + Meta CAPI Purchase event en parallele
  const [emailResult, capiResult] = await Promise.all([
    sendEmail({ to, from, subject, html, text }),
    sendMetaPurchase(payment, eventSourceUrl),
  ]);

  console.log("[mollie-webhook] email:", JSON.stringify(emailResult));
  console.log("[mollie-webhook] capi:", JSON.stringify(capiResult));

  return new Response("OK", { status: 200 });
};

export const config = {
  path: "/api/mollie-webhook",
};
