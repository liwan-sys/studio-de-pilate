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

const DEFAULT_TO = "hello@studiosvb.fr";
const DEFAULT_FROM = "Studio SVB <onboarding@resend.dev>";

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

  const result = await sendEmail({ to, from, subject, html, text });
  console.log("[mollie-webhook] email result:", JSON.stringify(result));

  return new Response("OK", { status: 200 });
};

export const config = {
  path: "/api/mollie-webhook",
};
