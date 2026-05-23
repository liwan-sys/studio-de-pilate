import { neon } from "@neondatabase/serverless";

const DEFAULT_MEASUREMENT_ID = "G-DHS707Y6XJ";

const DISCIPLINE_LABEL = {
  reformer: "Pilates Reformer",
  crossformer: "Crossformer",
  cross_yoga_pilates: "Cross / Yoga / Boxe / Pilates sol",
  pass_starter: "Pass Starter",
};

let sqlClient = null;
let syncTableReady = false;

function getDatabaseUrl() {
  return (
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    ""
  );
}

export function hasGA4SyncDatabase() {
  return Boolean(getDatabaseUrl());
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!sqlClient) sqlClient = neon(databaseUrl);
  return sqlClient;
}

async function ensureSyncTable() {
  const sql = getSqlClient();
  if (!sql) return null;
  if (syncTableReady) return sql;

  await sql`
    CREATE TABLE IF NOT EXISTS ga4_purchase_sync (
      payment_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      source TEXT,
      client_id TEXT,
      amount NUMERIC,
      currency TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      sent_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      result TEXT,
      last_error TEXT
    )
  `;

  syncTableReady = true;
  return sql;
}

function toNumber(value, fallback = 0) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanParam(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

function toTimestampMicros(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return null;
  return ms * 1000;
}

function getGAClientId(payment) {
  return payment.metadata?.ga_client_id || `svb.${payment.id}`;
}

function getPurchasePayload(payment) {
  const meta = payment.metadata || {};
  const amount = toNumber(payment.amount?.value);
  const currency = payment.amount?.currency || "EUR";
  const disciplineKey = meta.discipline || "essai";
  const disciplineLabel =
    meta.offer_label ||
    DISCIPLINE_LABEL[disciplineKey] ||
    "Seance d'essai SVB";

  const params = {
    transaction_id: payment.id,
    value: amount,
    currency,
    session_id: meta.ga_session_id || String(Date.now()),
    engagement_time_msec: 100,
    affiliation: "Mollie",
    payment_provider: "mollie",
    payment_source: "mollie_webhook",
    funnel_name: "SVB essai",
    funnel_step: 7,
    step_name: "Achat confirme",
    discipline: disciplineKey,
    offer_label: disciplineLabel,
    page_location:
      cleanParam(meta.page_location) || "https://studiosvb.com/merci-essai",
    page_referrer: cleanParam(meta.page_referrer),
    items: [
      {
        item_id: disciplineKey,
        item_name: disciplineLabel,
        item_category: "essai",
        item_category2: disciplineKey,
        price: amount,
        quantity: 1,
      },
    ],
  };

  if (meta.utm_source) {
    params.source = meta.utm_source;
    params.utm_source = meta.utm_source;
  }
  if (meta.utm_medium) {
    params.medium = meta.utm_medium;
    params.utm_medium = meta.utm_medium;
  }
  if (meta.utm_campaign) {
    params.campaign = meta.utm_campaign;
    params.utm_campaign = meta.utm_campaign;
  }
  if (meta.utm_content) {
    params.content = meta.utm_content;
    params.utm_content = meta.utm_content;
  }
  if (meta.utm_term) {
    params.term = meta.utm_term;
    params.utm_term = meta.utm_term;
  }
  if (meta.gclid) params.gclid = meta.gclid;
  if (meta.gbraid) params.gbraid = meta.gbraid;
  if (meta.wbraid) params.wbraid = meta.wbraid;

  Object.keys(params).forEach((key) => {
    if (params[key] == null || params[key] === "") delete params[key];
  });

  const payload = {
    client_id: getGAClientId(payment),
    non_personalized_ads: false,
    events: [
      { name: "purchase", params },
      {
        name: "svb_purchase_confirmed",
        params: { ...params, original_event: "purchase" },
      },
    ],
  };

  const timestampMicros = toTimestampMicros(payment.paidAt);
  if (timestampMicros) payload.timestamp_micros = timestampMicros;

  return { payload, amount, currency };
}

export async function sendGA4Purchase(payment) {
  const measurementId = process.env.GA4_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!apiSecret) {
    console.warn("[ga4-mp] GA4_API_SECRET not configured, skipping");
    return { sent: false, reason: "not_configured" };
  }

  const { payload, amount } = getPurchasePayload(payment);
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error("[ga4-mp] error:", resp.status, body);
      return { sent: false, status: resp.status, body };
    }

    console.log(
      "[ga4-mp] purchase sent",
      payment.id,
      "value=" + amount,
      "client_id=" + payload.client_id
    );
    return { sent: true, client_id: payload.client_id, value: amount };
  } catch (e) {
    console.error("[ga4-mp] fetch threw:", e);
    return { sent: false, error: String(e) };
  }
}

async function getSyncRow(paymentId) {
  const sql = await ensureSyncTable();
  if (!sql) return null;

  const rows = await sql`
    SELECT payment_id, status, attempts, sent_at
    FROM ga4_purchase_sync
    WHERE payment_id = ${paymentId}
    LIMIT 1
  `;

  return rows[0] || null;
}

async function markSyncResult(payment, result, source) {
  const sql = await ensureSyncTable();
  if (!sql) return { marked: false, reason: "database_not_configured" };

  const { amount, currency } = getPurchasePayload(payment);
  const status = result.sent ? "sent" : "failed";
  const lastError = result.sent ? null : result.reason || result.error || result.body || "ga4_failed";

  await sql`
    INSERT INTO ga4_purchase_sync (
      payment_id,
      status,
      source,
      client_id,
      amount,
      currency,
      attempts,
      sent_at,
      updated_at,
      result,
      last_error
    )
    VALUES (
      ${payment.id},
      ${status},
      ${source},
      ${getGAClientId(payment)},
      ${amount},
      ${currency},
      1,
      ${result.sent ? new Date().toISOString() : null},
      NOW(),
      ${JSON.stringify(result).slice(0, 4000)},
      ${lastError ? String(lastError).slice(0, 1000) : null}
    )
    ON CONFLICT (payment_id) DO UPDATE SET
      status = EXCLUDED.status,
      source = EXCLUDED.source,
      client_id = EXCLUDED.client_id,
      amount = EXCLUDED.amount,
      currency = EXCLUDED.currency,
      attempts = ga4_purchase_sync.attempts + 1,
      sent_at = CASE
        WHEN EXCLUDED.status = 'sent' THEN EXCLUDED.sent_at
        ELSE ga4_purchase_sync.sent_at
      END,
      updated_at = NOW(),
      result = EXCLUDED.result,
      last_error = EXCLUDED.last_error
  `;

  return { marked: true, status };
}

export async function syncGA4Purchase(payment, opts = {}) {
  const source = opts.source || "unknown";
  const requireDatabase = Boolean(opts.requireDatabase);
  const dryRun = Boolean(opts.dryRun);

  if (!payment?.id || payment.status !== "paid") {
    return {
      sent: false,
      skipped: true,
      reason: "not_paid_payment",
      payment_id: payment?.id || null,
      status: payment?.status || null,
    };
  }

  try {
    const row = await getSyncRow(payment.id);
    if (row?.status === "sent") {
      return {
        sent: false,
        skipped: true,
        reason: "already_synced",
        payment_id: payment.id,
        attempts: row.attempts,
      };
    }
  } catch (e) {
    console.error("[ga4-sync] database read failed:", e);
    if (requireDatabase) {
      return { sent: false, reason: "database_read_failed", error: String(e) };
    }
  }

  if (dryRun) {
    const { amount, currency } = getPurchasePayload(payment);
    return {
      sent: false,
      dry_run: true,
      would_send: true,
      payment_id: payment.id,
      value: amount,
      currency,
    };
  }

  const result = await sendGA4Purchase(payment);

  try {
    const marker = await markSyncResult(payment, result, source);
    return { ...result, payment_id: payment.id, sync: marker };
  } catch (e) {
    console.error("[ga4-sync] database write failed:", e);
    if (requireDatabase) {
      return { sent: result.sent, reason: "database_write_failed", error: String(e) };
    }
    return {
      ...result,
      payment_id: payment.id,
      sync: { marked: false, reason: "database_write_failed", error: String(e) },
    };
  }
}

function paymentTimeMs(payment) {
  const raw = payment.paidAt || payment.createdAt;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function isLikelyStudioEssaiPayment(payment) {
  const meta = payment.metadata || {};
  if (meta.discipline || meta.offer_label || meta.ga_client_id || meta.utm_campaign) {
    return true;
  }

  const description = String(payment.description || "").toLowerCase();
  return (
    description.includes("svb") ||
    description.includes("essai") ||
    description.includes("reformer") ||
    description.includes("pilates") ||
    description.includes("pass starter")
  );
}

async function fetchMolliePayment(apiKey, paymentId) {
  const resp = await fetch(
    `https://api.mollie.com/v2/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status,
      body: (await resp.text()).slice(0, 500),
    };
  }

  return { ok: true, payment: await resp.json() };
}

async function listRecentMolliePayments(apiKey, opts = {}) {
  const limit = Math.min(Number(opts.limit || 50), 250);
  const maxPages = Math.max(1, Math.min(Number(opts.maxPages || 3), 10));
  const payments = [];
  let url = `https://api.mollie.com/v2/payments?limit=${limit}&sort=desc`;

  for (let page = 0; page < maxPages && url; page += 1) {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!resp.ok) {
      throw new Error(`Mollie list failed ${resp.status}: ${(await resp.text()).slice(0, 500)}`);
    }

    const data = await resp.json();
    const batch = data?._embedded?.payments || [];
    payments.push(...batch);
    url = data?._links?.next?.href || null;
  }

  return payments;
}

export async function reconcileRecentMolliePayments(opts = {}) {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "mollie_not_configured" };
  }

  if (!hasGA4SyncDatabase()) {
    return { ok: false, reason: "database_not_configured" };
  }

  const lookbackHours = Math.max(1, Math.min(Number(opts.lookbackHours || 24), 72));
  const sinceMs = Date.now() - lookbackHours * 60 * 60 * 1000;
  const source = opts.source || "reconcile";
  const dryRun = Boolean(opts.dryRun);
  const listed = await listRecentMolliePayments(apiKey, opts);
  const results = [];

  for (const paymentSummary of listed) {
    const timeMs = paymentTimeMs(paymentSummary);
    if (timeMs && timeMs < sinceMs) continue;
    if (paymentSummary.status !== "paid") continue;

    const full = await fetchMolliePayment(apiKey, paymentSummary.id);
    if (!full.ok) {
      results.push({
        payment_id: paymentSummary.id,
        sent: false,
        reason: "mollie_get_failed",
        status: full.status,
      });
      continue;
    }

    const payment = full.payment;
    if (!isLikelyStudioEssaiPayment(payment)) {
      results.push({
        payment_id: payment.id,
        skipped: true,
        reason: "not_studio_essai_payment",
      });
      continue;
    }

    results.push(
      await syncGA4Purchase(payment, {
        source,
        dryRun,
        requireDatabase: true,
      })
    );
  }

  const sent = results.filter((r) => r.sent).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.sent && !r.skipped && !r.dry_run).length;

  return {
    ok: true,
    source,
    dry_run: dryRun,
    lookback_hours: lookbackHours,
    listed: listed.length,
    checked: results.length,
    sent,
    skipped,
    failed,
    results,
  };
}
