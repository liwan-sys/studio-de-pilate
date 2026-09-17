// =========================================================================
// Studio SVB — Landing "Essai gratuit" (campagne JC Decaux)
//
// Endpoint : POST /.netlify/functions/essai-gratuit
// Body     : { firstname, lastname, email, phone, studio }
//
// Effets :
//   1. Envoie un email admin à hello@studiosvb.fr avec les infos du lead
//   2. Envoie un email de confirmation au prospect ("on te rappelle sous 1h")
//   3. Forwarde vers le Netlify Form "essai-gratuit" (déclaré dans forms.html)
//      pour capture / backup dans le dashboard Netlify
//
// Variables d'env Netlify :
//   RESEND_API_KEY = re_xxx (obtenu sur resend.com)
//   URL            = https://studiosvb.com (auto par Netlify)
// =========================================================================

const ADMIN_TO = "hello@studiosvb.fr";
const FROM = "Studio SVB <hello@studiosvb.fr>";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

async function sendMail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("essai-gratuit (no-mailer)", { to, subject });
    return true;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) console.error("resend fail", await r.text());
    return r.ok;
  } catch (err) {
    console.error("resend err", err?.message);
    return false;
  }
}

async function forwardToNetlifyForms(payload) {
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const body = new URLSearchParams({
    "form-name": "essai-gratuit",
    ...payload,
  }).toString();
  try {
    await fetch(`${siteUrl}/`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    console.error("netlify-forms fail", err?.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const firstname = String(body.firstname || "").trim();
  const lastname = String(body.lastname || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const studio = String(body.studio || "").trim();

  if (!firstname || !lastname || !isValidEmail(email) || !phone) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Champs manquants ou invalides." }),
    };
  }

  const studioLabel = {
    "lavandieres": "Cours des Lavandières (Pilates Reformer, Yoga)",
    "docks": "Parc des Docks (Cross Training, Boxe)",
    "peu-importe": "Peu importe (à définir au rappel)",
  }[studio] || "Non précisé";

  const receivedAt = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // 1. Mail admin
  const adminHtml = `
    <div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2F4F4F">
      <h2 style="color:#4A8D84;margin:0 0 4px">🎯 Nouveau lead JC Decaux</h2>
      <p style="margin:0 0 16px;font-size:.85rem;opacity:.7">Reçu le ${esc(receivedAt)}</p>
      <table style="border-collapse:collapse;width:100%;font-size:.95rem">
        <tr><td style="padding:8px 12px;background:#F3EBD4;font-weight:700">Prénom</td><td style="padding:8px 12px">${esc(firstname)}</td></tr>
        <tr><td style="padding:8px 12px;background:#F3EBD4;font-weight:700">Nom</td><td style="padding:8px 12px">${esc(lastname)}</td></tr>
        <tr><td style="padding:8px 12px;background:#F3EBD4;font-weight:700">Email</td><td style="padding:8px 12px"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:8px 12px;background:#F3EBD4;font-weight:700">Téléphone</td><td style="padding:8px 12px"><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
        <tr><td style="padding:8px 12px;background:#F3EBD4;font-weight:700">Studio souhaité</td><td style="padding:8px 12px">${esc(studioLabel)}</td></tr>
      </table>
      <p style="margin-top:20px;font-size:.85rem">Rappelle-le sous 1h pour caler le créneau. Envoyé automatiquement par la landing /essai-gratuit.</p>
    </div>`;

  // 2. Mail prospect
  const clientHtml = `
    <div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2F4F4F">
      <h1 style="font-family:'Great Vibes',cursive;font-weight:400;color:#4A8D84;font-size:3rem;margin:0 0 8px">Studio SVB</h1>
      <h2 style="font-weight:600;font-size:1.3rem;margin:0 0 16px">Merci ${esc(firstname)} !</h2>
      <p style="line-height:1.6">On a bien reçu ta demande de séance d'essai offerte.</p>
      <p style="line-height:1.6"><strong>On te rappelle sous 1h</strong> au ${esc(phone)} pour choisir ton créneau et te donner toutes les infos.</p>
      <div style="background:#F3EBD4;border-radius:12px;padding:16px 20px;margin:24px 0">
        <p style="margin:0;font-size:.9rem"><strong>Studio souhaité :</strong> ${esc(studioLabel)}</p>
      </div>
      <p style="line-height:1.6">En attendant, tu peux jeter un œil à nos <a href="https://studiosvb.com/sessions" style="color:#4A8D84">disciplines</a> et à notre <a href="https://studiosvb.com/equipe" style="color:#4A8D84">équipe de coachs</a>.</p>
      <p style="line-height:1.6">À très vite,<br/>L'équipe SVB</p>
      <hr style="border:0;border-top:1px solid #E8B496;margin:24px 0" />
      <p style="font-size:.75rem;opacity:.7">Studio SVB · 6 Mail André Breton &amp; 40 Cours des Lavandières · 93400 Saint-Ouen-sur-Seine<br/>
      07 44 91 91 55 · hello@studiosvb.fr</p>
    </div>`;

  await Promise.all([
    sendMail({ to: ADMIN_TO, subject: `🎯 Lead JC Decaux — ${firstname} ${lastname}`, html: adminHtml }),
    sendMail({ to: email, subject: "Ta séance d'essai SVB — on te rappelle sous 1h", html: clientHtml }),
    forwardToNetlifyForms({
      firstname, lastname, email, phone,
      studio: studioLabel,
      source: "jcdecaux",
      received_at: receivedAt,
    }),
  ]);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
