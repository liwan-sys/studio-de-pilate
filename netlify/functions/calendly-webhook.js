// ================================================================
// Studio SVB — Calendly webhook receiver
// Endpoint: POST /.netlify/functions/calendly-webhook
// (mapped to /api/calendly via _redirects)
//
// Calendly envoie :
//  { event: "invitee.created" | "invitee.canceled",
//    payload: { event: {…}, invitee: { name, email, ... }, ... } }
//
// Actions :
//  1) Vérifie la signature HMAC (secret `CALENDLY_WEBHOOK_SECRET` côté env)
//  2) Notifie l'équipe par email (Netlify Forms submission vers "internal-leads")
//  3) Log l'événement pour analytics
// ================================================================

import crypto from "node:crypto";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  const signatureHeader = event.headers["calendly-webhook-signature"];
  const rawBody = event.body || "";

  // 1) Verify HMAC signature (if secret is configured)
  if (secret && signatureHeader) {
    // Header format: "t=timestamp,v1=signature"
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((kv) => kv.split("="))
    );
    const timestamp = parts.t;
    const expected = parts.v1;
    const payload = `${timestamp}.${rawBody}`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    let ok = false;
    try {
      ok =
        expected &&
        computed.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(computed));
    } catch {
      ok = false;
    }

    if (!ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "invalid_signature" }),
      };
    }
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: "invalid json" };
  }

  const kind = data.event || "unknown";
  const p = (data.payload || {});
  const invitee = p.invitee || {};
  const cEvent = p.event || {};

  const record = {
    at: new Date().toISOString(),
    kind,
    name: invitee.name || invitee.first_name || "",
    email: invitee.email || "",
    scheduled_for: cEvent.start_time || "",
    event_name: cEvent.name || "",
    cancel_url: invitee.cancel_url || "",
    reschedule_url: invitee.reschedule_url || "",
    questions:
      Array.isArray(invitee.questions_and_answers)
        ? invitee.questions_and_answers.map((q) => `${q.question}: ${q.answer}`).join(" | ")
        : "",
  };

  console.log("svb-calendly", JSON.stringify(record));

  // 2) Forward to Netlify Forms (internal-leads) so the team is notified by email.
  //    The hidden form "calendly-leads" is declared in calendly-form.html.
  try {
    const SITE_URL = process.env.URL || "https://studiosvb.com";
    const body = new URLSearchParams({
      "form-name": "calendly-leads",
      ...record,
    }).toString();

    await fetch(`${SITE_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    console.error("svb-calendly: forward failed", err?.message || err);
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true, kind, received_at: record.at }),
  };
};
