// ================================================================
// Studio SVB · Analytics first-party (Edge Function)
//
// Endpoint : POST /api/track
// Body: { event: string, props?: object, ts?: number }
//
// Pas de PII : on n'enregistre QUE
//  - event name (ex: "cta_click", "form_submit", "scroll_50")
//  - variant A/B (cookie svb-ab)
//  - referer (host only)
//  - user-agent simplifié (mobile/desktop/tablet)
//  - country (via context.geo)
//  - session id (cookie svb-sid, hash rotatif 24h)
//
// Les données sont loguées dans Netlify logs (consultables via CLI/UI).
// Pour production : forward vers Plausible/Umami/Supabase selon besoin.
// ================================================================

const SESSION_COOKIE = "svb-sid";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 heures

// Hash FNV-1a (léger, non-crypto) pour anonymiser IP
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function deviceType(ua) {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export default async (request, context) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const event = String(payload.event || "").slice(0, 60);
  if (!event) {
    return new Response(JSON.stringify({ ok: false, error: "missing_event" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Session cookie
  const cookieHeader = request.headers.get("cookie") || "";
  let sid = (cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`)) || [])[1];
  let setCookie = false;
  if (!sid) {
    const ip = context.ip || request.headers.get("x-forwarded-for") || "0";
    sid = fnv1a(ip + "|" + Date.now());
    setCookie = true;
  }

  // Variant cookie
  const variant = (cookieHeader.match(/svb-ab=([AB])/) || [])[1] || "A";

  // Enrich
  const record = {
    t: Date.now(),
    event,
    props: typeof payload.props === "object" ? payload.props : null,
    sid: sid.slice(0, 16),
    variant,
    device: deviceType(request.headers.get("user-agent") || ""),
    country: (context.geo && context.geo.country && context.geo.country.code) || null,
    ref: (() => {
      try {
        return new URL(request.headers.get("referer") || "").host || null;
      } catch { return null; }
    })(),
  };

  // Log to Netlify (visible via `netlify logs:function track` ou UI)
  console.log("svb-track", JSON.stringify(record));

  const headers = new Headers({
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  if (setCookie) {
    headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${sid}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 202, headers });
};

export const config = { path: "/api/track" };
