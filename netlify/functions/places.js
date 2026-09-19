// =========================================================================
// Studio SVB — Compteur de places restantes pour la séance d'essai offerte
//
// GET  /api/places          -> { "total": 100, "prises": 13, "restantes": 87 }
// POST /api/places { email } -> enregistre un lead (compté une seule fois par email)
//
// Stockage : Netlify Blobs (store "seance-offerte"), aucune configuration requise.
// Le total se règle avec la variable d'environnement PLACES_TOTAL (défaut 100).
// =========================================================================
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const TOTAL = Number(process.env.PLACES_TOTAL) || 100;
const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "https://studiosvb.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  const store = getStore("seance-offerte");
  const leads = (await store.get("leads", { type: "json" })) || {};

  if (req.method === "POST") {
    let body = {};
    try { body = await req.json(); } catch (e) { return json({ error: "invalid_json" }, 400); }
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid_email" }, 400);
    const key = crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);
    if (!leads[key]) {
      leads[key] = new Date().toISOString();
      await store.setJSON("leads", leads);
    }
  } else if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const prises = Object.keys(leads).length;
  return json({ total: TOTAL, prises, restantes: Math.max(0, TOTAL - prises) });
};

export const config = { path: "/api/places" };
