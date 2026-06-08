// =========================================================================
// Studio SVB — Limitation "une offre decouverte par personne"
//
// Stocke chaque email/téléphone ayant deja reserve/paye une offre decouverte :
//   - Séance d'essai (reformer / crossformer / cross_yoga_pilates)
//   - Pass Starter (5 séances découverte)
// Bloque toute nouvelle tentative depuis la meme personne sur l'une de ces
// offres (cumul interdit aussi : si essai paye -> Pass Starter bloque, et
// inversement).
//
// Utilise Netlify Database pour eviter de dependre d'un mot de passe Neon
// manuel dans les variables d'environnement.
// =========================================================================

import { getDatabase } from "@netlify/database";

const TRIAL_DISCIPLINES = new Set([
  "reformer",
  "crossformer",
  "cross_yoga_pilates",
  "pass_starter",
]);

let sqlClient = null;
let tableReady = false;
let legacyMigrationDone = false;
const PENDING_LOCK_MINUTES = 120;

export function hasTrialLimitDatabase() {
  return true;
}

export async function getTrialLimitHealth() {
  if (!hasTrialLimitDatabase()) {
    return {
      configured: false,
      ready: false,
      reason: "database_not_configured",
    };
  }

  try {
    const sql = await ensureTable();
    if (!sql) {
      return {
        configured: false,
        ready: false,
        reason: "database_not_configured",
      };
    }
    await sql`SELECT 1`;
    return { configured: true, ready: true };
  } catch (e) {
    console.error("[trial-limits] health check failed:", e);
    return {
      configured: true,
      ready: false,
      reason: "database_error",
      step: e?.svbStep || null,
      code: e?.code || null,
      message: e?.message ? String(e.message).slice(0, 220) : null,
    };
  }
}

export function isTrialDiscipline(discipline) {
  return TRIAL_DISCIPLINES.has(discipline);
}

function getSqlClient() {
  if (!sqlClient) sqlClient = getDatabase().sql;
  return sqlClient;
}

async function ensureTable() {
  const sql = getSqlClient();
  if (!sql) return null;
  if (tableReady) return sql;
  await schemaStep("create_trial_customers_v2", sql`
    CREATE TABLE IF NOT EXISTS trial_customers_v2 (
      email TEXT PRIMARY KEY,
      phone TEXT,
      firstname TEXT,
      lastname TEXT,
      discipline TEXT,
      payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      first_paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Index pour permettre le check par telephone (cas ou la personne
  // utilise un email different mais le meme numero)
  await schemaStep("create_trial_customers_v2_phone_idx", sql`
    CREATE INDEX IF NOT EXISTS trial_customers_v2_phone_idx
      ON trial_customers_v2 (phone)
  `);
  await schemaStep("create_trial_customers_v2_phone_unique_idx", sql`
    CREATE UNIQUE INDEX IF NOT EXISTS trial_customers_v2_phone_unique_idx
      ON trial_customers_v2 (phone)
      WHERE phone IS NOT NULL
  `);
  await migrateLegacyRows(sql);
  tableReady = true;
  return sql;
}

async function schemaStep(step, promise) {
  try {
    return await promise;
  } catch (e) {
    e.svbStep = step;
    throw e;
  }
}

async function migrateLegacyRows(sql) {
  if (legacyMigrationDone) return;
  try {
    await sql`
      INSERT INTO trial_customers_v2 (
        email,
        phone,
        firstname,
        lastname,
        discipline,
        payment_id,
        status,
        created_at,
        updated_at,
        first_paid_at
      )
      SELECT
        email,
        NULLIF(phone, ''),
        firstname,
        lastname,
        discipline,
        payment_id,
        'paid',
        COALESCE(first_paid_at, NOW()),
        NOW(),
        COALESCE(first_paid_at, NOW())
      FROM (
        SELECT DISTINCT ON (COALESCE(NULLIF(phone, ''), email))
          LOWER(TRIM(email)) AS email,
          phone,
          firstname,
          lastname,
          discipline,
          payment_id,
          first_paid_at
        FROM trial_customers
        WHERE email IS NOT NULL AND TRIM(email) <> ''
        ORDER BY COALESCE(NULLIF(phone, ''), LOWER(TRIM(email))), first_paid_at ASC NULLS LAST
      ) legacy
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (e) {
    // L'ancienne table peut ne pas exister ou avoir un schema casse.
    // La nouvelle table reste la source fiable pour les prochains paiements.
    console.warn("[trial-limits] legacy migration skipped:", e);
  } finally {
    legacyMigrationDone = true;
  }
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
  const pendingCutoff = new Date(
    Date.now() - PENDING_LOCK_MINUTES * 60 * 1000
  ).toISOString();

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
        SELECT email, first_paid_at, status, created_at FROM trial_customers_v2
        WHERE (email = ${normalizedEmail} OR phone = ${normalizedPhone})
          AND (
            status = 'paid'
            OR created_at > ${pendingCutoff}::timestamptz
          )
        LIMIT 1
      `;
    } else if (normalizedEmail) {
      rows = await sql`
        SELECT email, first_paid_at, status, created_at FROM trial_customers_v2
        WHERE email = ${normalizedEmail}
          AND (
            status = 'paid'
            OR created_at > ${pendingCutoff}::timestamptz
          )
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT email, first_paid_at, status, created_at FROM trial_customers_v2
        WHERE phone = ${normalizedPhone}
          AND (
            status = 'paid'
            OR created_at > ${pendingCutoff}::timestamptz
          )
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

export async function reserveTrial({ email, phone, firstname, lastname, discipline, paymentId }) {
  if (!isTrialDiscipline(discipline)) {
    return { reserved: false, reason: "not_trial_discipline" };
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhoneFR(phone);
  if (!normalizedEmail) return { reserved: false, reason: "no_email" };

  const existing = await hasUsedTrial({ email: normalizedEmail, phone: normalizedPhone });
  if (existing.used) {
    return {
      reserved: false,
      used: true,
      reason: "already_used_or_pending",
      first_paid_at: existing.first_paid_at,
    };
  }

  let sql;
  try {
    sql = await ensureTable();
  } catch (e) {
    console.error("[trial-limits] ensureTable failed:", e);
    return { reserved: false, reason: "database_error" };
  }
  if (!sql) return { reserved: false, reason: "database_not_configured" };

  try {
    const rows = await sql`
      INSERT INTO trial_customers_v2 (
        email, phone, firstname, lastname, discipline, payment_id, status, created_at, updated_at, first_paid_at
      ) VALUES (
        ${normalizedEmail},
        ${normalizedPhone},
        ${firstname || null},
        ${lastname || null},
        ${discipline || null},
        ${paymentId || null},
        'pending',
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING email
    `;
    if (rows.length === 0) {
      return { reserved: false, used: true, reason: "email_conflict" };
    }
    return { reserved: true };
  } catch (e) {
    if (e?.code === "23505") {
      return { reserved: false, used: true, reason: "phone_conflict" };
    }
    console.error("[trial-limits] reserveTrial insert failed:", e);
    return { reserved: false, reason: "database_error", error: String(e) };
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
      INSERT INTO trial_customers_v2 (
        email, phone, firstname, lastname, discipline, payment_id, status, created_at, updated_at, first_paid_at
      ) VALUES (
        ${email},
        ${phone},
        ${meta.firstname || null},
        ${meta.lastname || null},
        ${meta.discipline || null},
        ${payment.id},
        'paid',
        NOW(),
        NOW(),
        ${paidAt}
      )
      ON CONFLICT (email) DO UPDATE SET
        phone = COALESCE(trial_customers_v2.phone, EXCLUDED.phone),
        firstname = COALESCE(EXCLUDED.firstname, trial_customers_v2.firstname),
        lastname = COALESCE(EXCLUDED.lastname, trial_customers_v2.lastname),
        discipline = COALESCE(EXCLUDED.discipline, trial_customers_v2.discipline),
        payment_id = EXCLUDED.payment_id,
        status = 'paid',
        updated_at = NOW(),
        first_paid_at = LEAST(trial_customers_v2.first_paid_at, EXCLUDED.first_paid_at)
    `;
    return { recorded: true };
  } catch (e) {
    console.error("[trial-limits] recordTrial insert failed:", e);
    return { recorded: false, reason: "database_error", error: String(e) };
  }
}

export async function releaseTrialReservation(payment) {
  const meta = payment.metadata || {};
  if (!isTrialDiscipline(meta.discipline)) {
    return { released: false, reason: "not_trial_discipline" };
  }

  const email = normalizeEmail(meta.email || payment.billingEmail);
  if (!email) return { released: false, reason: "no_email" };

  let sql;
  try {
    sql = await ensureTable();
  } catch (e) {
    console.error("[trial-limits] ensureTable failed:", e);
    return { released: false, reason: "database_error" };
  }
  if (!sql) return { released: false, reason: "database_not_configured" };

  try {
    await sql`
      DELETE FROM trial_customers_v2
      WHERE email = ${email}
        AND status = 'pending'
        AND (payment_id IS NULL OR payment_id = ${payment.id})
    `;
    return { released: true };
  } catch (e) {
    console.error("[trial-limits] releaseTrialReservation failed:", e);
    return { released: false, reason: "database_error", error: String(e) };
  }
}
