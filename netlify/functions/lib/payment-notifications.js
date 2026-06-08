import { getDatabase } from "@netlify/database";

let sqlClient = null;
let tableReady = false;

function getSqlClient() {
  if (!sqlClient) sqlClient = getDatabase().sql;
  return sqlClient;
}

async function ensureTable() {
  const sql = getSqlClient();
  if (tableReady) return sql;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_notifications (
      payment_id TEXT NOT NULL,
      notification_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'claimed',
      claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      result TEXT,
      PRIMARY KEY (payment_id, notification_type)
    )
  `;

  tableReady = true;
  return sql;
}

export async function claimPaymentNotification(paymentId, notificationType) {
  if (!paymentId || !notificationType) {
    return { claimed: false, reason: "missing_fields" };
  }

  const sql = await ensureTable();
  const rows = await sql`
    INSERT INTO payment_notifications (
      payment_id,
      notification_type,
      status,
      claimed_at
    )
    VALUES (
      ${paymentId},
      ${notificationType},
      'claimed',
      NOW()
    )
    ON CONFLICT (payment_id, notification_type) DO NOTHING
    RETURNING payment_id
  `;

  if (rows.length === 0) {
    return { claimed: false, reason: "already_claimed" };
  }
  return { claimed: true };
}

export async function markPaymentNotificationSent(
  paymentId,
  notificationType,
  result
) {
  const sql = await ensureTable();
  await sql`
    UPDATE payment_notifications
    SET
      status = ${result?.sent ? "sent" : "failed"},
      sent_at = ${result?.sent ? new Date().toISOString() : null},
      result = ${JSON.stringify(result || {}).slice(0, 4000)}
    WHERE payment_id = ${paymentId}
      AND notification_type = ${notificationType}
  `;
  return { marked: true };
}
