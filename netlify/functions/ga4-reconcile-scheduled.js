import { reconcileRecentMolliePayments } from "./lib/ga4-purchase-sync.js";

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export default async (req) => {
  let nextRun = null;
  try {
    const body = await req.json();
    nextRun = body?.next_run || null;
  } catch {
    // Netlify sends JSON for scheduled runs; local/manual calls may not.
  }

  const result = await reconcileRecentMolliePayments({
    source: "scheduled",
    lookbackHours: numberFromEnv("GA4_RECONCILE_LOOKBACK_HOURS", 24),
    limit: numberFromEnv("GA4_RECONCILE_LIMIT", 50),
    maxPages: numberFromEnv("GA4_RECONCILE_MAX_PAGES", 3),
  });

  console.log(
    "[ga4-reconcile-scheduled]",
    JSON.stringify({
      next_run: nextRun,
      ok: result.ok,
      checked: result.checked,
      sent: result.sent,
      skipped: result.skipped,
      failed: result.failed,
      reason: result.reason || null,
    })
  );

  return new Response("OK", { status: result.ok ? 200 : 500 });
};

export const config = {
  schedule: "*/5 * * * *",
};
