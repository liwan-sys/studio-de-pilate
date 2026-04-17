// ================================================================
// Studio SVB — Newsletter (double opt-in)
// Endpoint: POST /.netlify/functions/newsletter (via _redirects /api/newsletter)
//
// Flow :
//   1) POST { email, firstname?, source? }
//      → génère un token HMAC, envoie un email de confirmation via Netlify forwarding
//      → NE STOCKE PAS encore l'email (CNIL : pas de newsletter sans confirmation)
//   2) GET /api/newsletter/confirm?t=TOKEN&e=EMAIL
//      → valide le token, forward vers Netlify Forms "newsletter" (final storage)
//      → redirect vers /merci-newsletter
//
// Variables d'env Netlify requises :
//   NEWSLETTER_SECRET  = random 32+ bytes (HMAC key)
//   URL                = https://studiosvb.com (auto par Netlify)
//
// Note: pour envoyer l'email réellement, connecte SendGrid/Resend/SES via
// variables d'env SMTP_* (exemple ci-dessous, adapte selon ton provider).
// ================================================================

import crypto from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48h

function sign(email, ts) {
  const secret = process.env.NEWSLETTER_SECRET || "dev-secret-change-me";
  return crypto
    .createHmac("sha256", secret)
    .update(`${email.toLowerCase()}|${ts}`)
    .digest("base64url");
}

function buildConfirmUrl(email, ts) {
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const token = sign(email, ts);
  const u = new URL(`${siteUrl}/api/newsletter/confirm`);
  u.searchParams.set("e", email);
  u.searchParams.set("t", ts.toString());
  u.searchParams.set("s", token);
  return u.toString();
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

async function sendConfirmationEmail(email, firstname, confirmUrl) {
  // --- Option A: Resend API (recommandé, simple) ---
  if (process.env.RESEND_API_KEY) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Studio SVB <hello@studiosvb.fr>",
          to: email,
          subject: "Confirme ton inscription à la newsletter SVB",
          html: `
            <div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2F4F4F">
              <h1 style="font-family:'Great Vibes',cursive;font-weight:400;color:#4A8D84;font-size:3rem;margin:0 0 8px">Studio SVB</h1>
              <h2 style="font-weight:600;font-size:1.3rem;margin:0 0 16px">Bonjour ${firstname || "et bienvenue"} !</h2>
              <p style="line-height:1.6">Un dernier clic pour confirmer ton inscription à notre newsletter.
              On t'enverra nos meilleurs conseils forme, nos offres et les nouveautés du studio — jamais plus d'une fois par semaine, promis.</p>
              <p style="text-align:center;margin:32px 0">
                <a href="${confirmUrl}" style="display:inline-block;background:#2F4F4F;color:#FBF6EC;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.88rem">Confirmer mon inscription</a>
              </p>
              <p style="font-size:.85rem;color:#4A8D84">Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email. Aucune action requise.</p>
              <hr style="border:0;border-top:1px solid #E8B496;margin:24px 0" />
              <p style="font-size:.75rem;opacity:.7">Studio SVB · 6 Mail André Breton · 93400 Saint-Ouen-sur-Seine<br/>
              Ce lien de confirmation expire dans 48 heures.</p>
            </div>`,
        }),
      });
      return resp.ok;
    } catch (err) {
      console.error("resend failed", err?.message);
      return false;
    }
  }

  // --- Fallback: log seulement (dev / pas de provider configuré) ---
  console.log("svb-newsletter (no-mailer)", JSON.stringify({ email, firstname, confirmUrl }));
  return true;
}

async function forwardToNetlifyForms(payload) {
  // Forwarde vers le formulaire Netlify "newsletter" (déclaré dans forms.html)
  const siteUrl = process.env.URL || "https://studiosvb.com";
  const body = new URLSearchParams({
    "form-name": "newsletter",
    ...payload,
  }).toString();
  try {
    const r = await fetch(`${siteUrl}/`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    return r.ok;
  } catch (err) {
    console.error("svb-newsletter: forward failed", err?.message);
    return false;
  }
}

export const handler = async (event) => {
  const path = event.path || "";
  const method = event.httpMethod;

  // ---- ETAPE 2 : confirmation via lien email ----
  if (path.endsWith("/confirm") && method === "GET") {
    const qs = event.queryStringParameters || {};
    const email = (qs.e || "").trim().toLowerCase();
    const ts = parseInt(qs.t || "0", 10);
    const sig = qs.s || "";

    if (!email || !ts || !sig) {
      return {
        statusCode: 400,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: "<h1>Lien invalide.</h1>",
      };
    }
    if (Date.now() - ts > TOKEN_TTL_MS) {
      return {
        statusCode: 400,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: "<h1>Lien expiré.</h1><p>Demande un nouveau mail de confirmation depuis le site.</p>",
      };
    }
    const expected = sign(email, ts);
    let ok = false;
    try {
      ok =
        expected.length === sig.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    } catch {
      ok = false;
    }
    if (!ok) {
      return {
        statusCode: 401,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: "<h1>Signature invalide.</h1>",
      };
    }

    // Confirmation OK → on archive le lead
    await forwardToNetlifyForms({
      email,
      firstname: qs.f || "",
      confirmed_at: new Date().toISOString(),
      source: qs.src || "newsletter",
      ref: qs.r || "",
    });

    return {
      statusCode: 302,
      headers: {
        location: "/merci-newsletter",
        "cache-control": "no-store",
      },
      body: "",
    };
  }

  // ---- ETAPE 1 : inscription (envoie email de confirmation) ----
  if (method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot
  if (body["website-url"]) {
    return jsonResponse({ ok: true }); // bot: pretend success
  }

  const email = String(body.email || "").trim().toLowerCase();
  const firstname = String(body.firstname || "").trim().slice(0, 40);
  const source = String(body.source || "footer").slice(0, 30);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return jsonResponse({ ok: false, error: "invalid_email" }, 400);
  }

  const ts = Date.now();
  const confirmUrl = buildConfirmUrl(email, ts);
  const sent = await sendConfirmationEmail(email, firstname, confirmUrl);

  if (!sent) {
    return jsonResponse(
      { ok: false, error: "mailer_failed" },
      502
    );
  }

  return jsonResponse({
    ok: true,
    message: "confirm_email_sent",
    ttl_hours: 48,
  });
};
