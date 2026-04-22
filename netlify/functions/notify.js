// =========================================================================
// Studio SVB — Push notifications vers Telegram (Option B — conversions only)
//
// Endpoint: POST /.netlify/functions/notify
// Reçoit un event JSON depuis le site (clic CTA, soumission form) et
// forward vers un chat Telegram. L'admin reçoit une notif instantanée
// sur son téléphone pour chaque conversion — pas pour chaque visite.
//
// Body attendu :
//   {
//     "event": "form_submit" | "cta_click" | "whatsapp_click" | "sportigo_click",
//     "label": "Pass Starter",                // libellé humain
//     "page": "/pilates-reformer-saint-ouen",  // page où l'event s'est produit
//     "userData": { "name": "...", "email": "...", "phone": "...", "discipline": "..." }
//   }
//
// Variables d'env Netlify requises (Site settings → Environment variables) :
//   TELEGRAM_BOT_TOKEN  = 123456:ABCDEF... (récupéré auprès de @BotFather)
//   TELEGRAM_CHAT_ID    = 123456789 (ton ID Telegram via @userinfobot)
//
// Si les deux env vars manquent, la fonction renvoie 200 sans erreur et
// log juste l'event en console (mode "no-op" pour ne pas bloquer le site
// pendant le setup).
// =========================================================================

const EVENT_EMOJI = {
  form_submit: "🔥",
  cta_click: "👆",
  whatsapp_click: "💬",
  sportigo_click: "💳",
  contact_submit: "✉️",
  newsletter_submit: "📧",
};

const EVENT_LABEL = {
  form_submit: "FORMULAIRE ESSAI — LEAD CHAUD",
  cta_click: "CTA CLIQUÉ",
  whatsapp_click: "CLIC WHATSAPP",
  sportigo_click: "CLIC ACHAT SPORTIGO",
  contact_submit: "FORMULAIRE CONTACT",
  newsletter_submit: "INSCRIPTION NEWSLETTER",
};

function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMessage(body) {
  const emoji = EVENT_EMOJI[body.event] || "🔔";
  const label = EVENT_LABEL[body.event] || body.event.toUpperCase();
  const time = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

  let msg = `${emoji} <b>${escapeHtml(label)}</b>\n`;
  msg += `<i>${time}</i>\n\n`;

  if (body.label) {
    msg += `📌 <b>${escapeHtml(body.label)}</b>\n`;
  }
  if (body.page) {
    msg += `📄 Page : <code>${escapeHtml(body.page)}</code>\n`;
  }

  const u = body.userData || {};
  const userLines = [];
  if (u.name || u.firstname || u.lastname) {
    const name = [u.firstname, u.lastname].filter(Boolean).join(" ") || u.name;
    userLines.push(`👤 ${escapeHtml(name)}`);
  }
  if (u.email) userLines.push(`📧 <code>${escapeHtml(u.email)}</code>`);
  if (u.phone) userLines.push(`📞 <code>${escapeHtml(u.phone)}</code>`);
  if (u.discipline) userLines.push(`🎯 ${escapeHtml(u.discipline)}`);
  if (u.availability) userLines.push(`🗓️ Dispos : ${escapeHtml(u.availability)}`);
  if (u.message) userLines.push(`💬 ${escapeHtml(u.message).slice(0, 300)}`);

  if (userLines.length) {
    msg += `\n${userLines.join("\n")}\n`;
  }

  if (body.referer) {
    msg += `\n🔗 Source : <i>${escapeHtml(body.referer)}</i>`;
  }

  return msg;
}

export default async (req, context) => {
  // CORS preflight
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
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.event) {
    return new Response(JSON.stringify({ error: "missing_event" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Mode no-op : si pas de config Telegram, on log juste et on renvoie OK.
  // Permet au site de tourner pendant le setup sans tout casser.
  if (!token || !chatId) {
    console.log("[notify] Telegram not configured, event logged:", JSON.stringify(body));
    return new Response(
      JSON.stringify({ ok: true, mode: "noop", reason: "telegram_not_configured" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const message = formatMessage(body);

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error("[notify] Telegram API error:", tgRes.status, errText);
      return new Response(
        JSON.stringify({ ok: false, error: "telegram_error", status: tgRes.status }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("[notify] Fetch error:", e);
    return new Response(JSON.stringify({ ok: false, error: "fetch_error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config = {
  path: "/api/notify",
};
