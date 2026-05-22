import { reconcileRecentMolliePayments } from "./lib/ga4-purchase-sync.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function numberParam(url, name, fallback) {
  const value = Number(url.searchParams.get(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export default async (req) => {
  if (!["GET", "POST"].includes(req.method)) {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const configuredToken = process.env.GA4_RECONCILE_TOKEN || "";
  const providedToken =
    url.searchParams.get("token") || req.headers.get("x-reconcile-token") || "";

  if (!configuredToken) {
    return json(
      {
        ok: false,
        error: "reconcile_token_not_configured",
        hint: "Set GA4_RECONCILE_TOKEN in Netlify before enabling manual GA4 reconciliation.",
      },
      403
    );
  }

  if (providedToken !== configuredToken) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const result = await reconcileRecentMolliePayments({
    source: "manual",
    dryRun: url.searchParams.get("dry") === "1",
    lookbackHours: numberParam(url, "hours", 24),
    limit: numberParam(url, "limit", 50),
    maxPages: numberParam(url, "pages", 3),
  });

  return json(result, result.ok ? 200 : 500);
};

export const config = {
  path: "/api/ga4-reconcile",
};
