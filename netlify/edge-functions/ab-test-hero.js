// ================================================================
// Studio SVB · A/B Test Hero CTA (Edge Function)
// Runtime: Deno sur le CDN Netlify (zéro latence ajoutée ≈5ms)
//
// Split 50/50 via cookie persistant "svb-ab".
// Variante A : "Réserver l'essai 30€" (baseline)
// Variante B : "Je réserve ma place" (test)
//
// On injecte un attribut data-ab-variant="A|B" dans <body> pour :
//   - CSS/JS de la page puisse adapter le label
//   - l'événement conversion soit taggé côté analytics
// ================================================================

const COOKIE_NAME = "svb-ab";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours
const ROLLOUT_B = 0.5; // 50% des visiteurs voient la variante B

export default async (request, context) => {
  // Ne s'exécute que sur la home
  const url = new URL(request.url);
  if (url.pathname !== "/" && url.pathname !== "/index.html") {
    return context.next();
  }

  // Skip bots (Google, Bing, etc.) — on leur sert toujours A pour la stabilité SEO
  const ua = request.headers.get("user-agent") || "";
  if (/bot|spider|crawler|slurp|archive|facebook|twitter|linkedin/i.test(ua)) {
    return context.next();
  }

  // Lire cookie existant ou assigner
  const cookieHeader = request.headers.get("cookie") || "";
  let variant = (cookieHeader.match(new RegExp(`${COOKIE_NAME}=([AB])`)) || [])[1];
  let setCookie = false;

  if (!variant) {
    variant = Math.random() < ROLLOUT_B ? "B" : "A";
    setCookie = true;
  }

  // Récupérer la réponse originale et la transformer
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();

  // Injecter data-ab-variant dans <body>
  let patched = html.replace(
    /<body([^>]*)>/i,
    `<body$1 data-ab-variant="${variant}">`
  );

  // Si variante B, remplacer le texte du CTA hero primaire
  if (variant === "B") {
    patched = patched.replace(
      /Réserver\s+l['']essai\s+30€/gi,
      "Je réserve ma place"
    );
  }

  const headers = new Headers(response.headers);
  if (setCookie) {
    headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${variant}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`
    );
  }
  headers.set("x-svb-variant", variant);
  headers.set("cache-control", "private, no-store");

  return new Response(patched, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = { path: "/" };
