import { getStore } from "@netlify/blobs";

export default async (req) => {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const store = getStore({ name: "ncsbe", consistency: "strong" });

  try {
    if (req.method === "POST") {
      const csv = await req.text();
      if (!csv || csv.length < 10) return new Response(JSON.stringify({ error: "Empty file" }), { status: 400, headers: cors });
      await store.set("csv", csv);
      await store.set("meta", JSON.stringify({ uploadedAt: new Date().toISOString() }));
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (req.method === "GET") {
      const csv = await store.get("csv");
      const metaRaw = await store.get("meta");
      const meta = metaRaw ? JSON.parse(metaRaw) : null;
      if (!csv) return new Response(JSON.stringify({ ok: false, empty: true }), { headers: cors });
      return new Response(JSON.stringify({ ok: true, csv, uploadedAt: meta?.uploadedAt || null }), { headers: cors });
    }
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });
  } catch (err) {
    console.error("upload error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
};

export const config = { path: "/api/data" };
