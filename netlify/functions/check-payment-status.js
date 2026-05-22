// =========================================================================
// Studio SVB — Verification du statut d'un paiement Mollie
// Endpoint: GET /api/check-payment-status?id=tr_xxx
//
// Utilise par /merci-essai pour determiner si on affiche
// "Paiement confirme" ou "Paiement en attente / annule".
// =========================================================================

function jsonRes(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async (req) => {
  if (req.method !== "GET") {
    return jsonRes({ ok: false, error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const paymentId = url.searchParams.get("id");

  if (!paymentId || !paymentId.startsWith("tr_")) {
    return jsonRes({ ok: false, error: "invalid_payment_id" }, 400);
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return jsonRes({ ok: false, error: "mollie_not_configured" }, 500);
  }

  try {
    const r = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) {
      return jsonRes(
        { ok: false, error: "mollie_api_error", status: r.status },
        502
      );
    }
    const payment = await r.json();
    const meta = payment.metadata || {};
    return jsonRes({
      ok: true,
      payment_id: payment.id,
      status: payment.status,
      amount: payment.amount?.value || null,
      currency: payment.amount?.currency || "EUR",
      paid_at: payment.paidAt || null,
      method: payment.method || null,
      // Echo des metadata utiles pour le client (sans donnees sensibles)
      discipline: meta.discipline || null,
      offer_label: meta.offer_label || null,
    });
  } catch (e) {
    console.error("[check-payment-status] fetch error:", e);
    return jsonRes({ ok: false, error: "fetch_error" }, 500);
  }
};

export const config = {
  path: "/api/check-payment-status",
};
