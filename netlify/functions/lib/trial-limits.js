// =========================================================================
// Studio SVB — Limitation "une offre decouverte par personne"
//
// Stocke chaque email/téléphone ayant deja paye une offre decouverte :
//   - Séance d'essai (reformer / crossformer / cross_yoga_pilates)
//   - Pass Starter (5 séances découverte)
// Bloque toute nouvelle tentative depuis la meme personne sur l'une de ces
// offres (cumul interdit aussi : si essai paye -> Pass Starter bloque, et
// inversement).
//
// Si NETLIFY_DATABASE_URL / DATABASE_URL ne sont pas configures, la
// verification est skip (allow-list par defaut) avec un warning console.
// =========================================================================

import { neon } from "@neondatabase/serverless";

const TRIAL_DISCIPLINES = new Set([
  "reformer",
  "crossformer",
  "cross_yoga_pilates",
  "pass_starter",
]);

let sqlClient = null;
let tableReady = false;

function getDatabaseUrl() {
  return (
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    ""
  );
}

export function hasTrialLimitDatabase() {
  return Boolean(getDatabaseUrl());
}

export function isTrialDiscipline(discipline) {
  return TRIAL_DISCIPLINES.has(discipline);
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  if (!sqlClient) sqlClient = neon(databaseUrl);
  return sqlClient;
}

async function ensureTable() {
  const sql = getSqlClient();
  if (!sql) return null;
  if (tableReady) return sql;
  await sql`
    CREATE TABLE IF NOT EXISTS trial_customers (
      email TEXT PRIMARY KEY,
      phone TEXT,
      firstname TEXT,
      lastname TEXT,
      discipline TEXT,
      payment_id TEXT,
      first_paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Index pour permettre le check par telephone (cas ou la personne
  // utilise un email different mais le meme numero)
  await sql`
    CREATE INDEX IF NOT EXISTS trial_customers_phone_idx
      ON trial_customers (phone)
  `;
  tableReady = true;
  return sql;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Normalise un numero FR vers digits-only E.164 ("33...")
export function normalizePhoneFR(phone) {
  if (!phone) return null;
  let d = String(phone).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0033")) d = d.slice(2);
  else if (d.startsWith("33")) {
    // OK
  } else if (d.startsWith("0")) d = "33" + d.slice(1);
  return d;
}

export async function hasUsedTrial({ email, phone }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhoneFR(phone);
  if (!normalizedEmail && !normalizedPhone) return { used: false };

  let sql;
  try {
    sql = await ensureTable();
  } catch (e) {
    console.error("[trial-limits] ensureTable failed:", e);
    return { used: false, reason: "database_error" };
  }
  if (!sql) {
    console.warn(
      "[trial-limits] database not configured, skipping trial-limit check"
    );
    return { used: false, reason: "database_not_configured" };
  }

  try {
    let rows;
    if (normalizedEmail && normalizedPhone) {
      rows = await sql`
        SELECT email, first_paid_at FROM trial_customers
        WHERE email = ${normalizedEmail} OR phone = ${normalizedPhone}
        LIMIT 1
      `;
    } else if (normalizedEmail) {
      rows = await sql`
        SELECT email, first_paid_at FROM trial_customers
        WHERE email = ${normalizedEmail}
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT email, first_paid_at FROM trial_customers
        WHERE phone = ${normalizedPhone}
        LIMIT 1
      `;
    }
    if (rows.length > 0) {
      return { used: true, first_paid_at: rows[0].first_paid_at };
    }
    return { used: false };
  } catch (e) {
    console.error("[trial-limits] hasUsedTrial query failed:", e);
    return { used: false, reason: "database_error" };
  }
}

export async function recordTrial(payment) {
  const meta = payment.metadata || {};
  if (!isTrialDiscipline(meta.discipline)) {
    return { recorded: false, reason: "not_trial_discipline" };
  }

  const email = normalizeEmail(meta.email || payment.billingEmail);
  const phone = normalizePhoneFR(meta.phone);
  if (!email) return { recorded: false, reason: "no_email" };

  let sql;
  try {
    sql = await ensureTable();
  } catch (e) {
    console.error("[trial-limits] ensureTable failed:", e);
    return { recorded: false, reason: "database_error" };
  }
  if (!sql) return { recorded: false, reason: "database_not_configured" };

  try {
    const paidAt = payment.paidAt
      ? new Date(payment.paidAt).toISOString()
      : new Date().toISOString();

    await sql`
      INSERT INTO trial_customers (
        email, phone, firstname, lastname, discipline, payment_id, first_paid_at
      ) VALUES (
        ${email},
        ${phone},
        ${meta.firstname || null},
        ${meta.lastname || null},
        ${meta.discipline || null},
        ${payment.id},
        ${paidAt}
      )
      ON CONFLICT (email) DO NOTHING
    `;
    return { recorded: true };
  } catch (e) {
    console.error("[trial-limits] recordTrial insert failed:", e);
    return { recorded: false, reason: "database_error", error: String(e) };
  }
}
