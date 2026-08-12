/* Stanza condivisa per "I soliti stronzi".
 * Tiene presenze, snapshot per giocatore, mosse in arrivo e storico permanente.
 * Nessuna partita viene ricostruita qui: il server fa solo da postino.
 */
import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    },
  });

const clean = (v, n) => String(v || "").replace(/[^a-z0-9_-]/gi, "").slice(0, n);

export default async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  const url = new URL(req.url);
  const a = url.searchParams.get("a") || "";
  const room = clean(url.searchParams.get("room"), 40) || "tavolo-unico";
  const pid = clean(url.searchParams.get("pid"), 16);
  const store = getStore({ name: "sdronzi", consistency: "strong" });
  const P = (k) => room + "/" + k;
  const body = async () => { try { return await req.json(); } catch (e) { return {}; } };

  try {
    /* presenza: i dati stanno nel nome della chiave, così basta una lista */
    if (a === "beat") {
      const b = await body();
      if (b.prev) await store.delete(P("peer/" + clean(b.prev, 80))).catch(() => {});
      const key = pid + "__" + (clean(b.avatar, 20) || "-") + "__" + Number(b.at || 0) + "__" + Date.now();
      await store.set(P("peer/" + key), "1");
      return json({ key });
    }

    if (a === "bye") {
      const b = await body();
      if (b.prev) await store.delete(P("peer/" + clean(b.prev, 80))).catch(() => {});
      await store.delete(P("state/" + pid)).catch(() => {});
      return json({ ok: true });
    }

    if (a === "peers") {
      const prefix = P("peer/");
      const { blobs } = await store.list({ prefix });
      const now = Date.now();
      const peers = [];
      for (const b of blobs) {
        const [p, avatar, at, ts] = b.key.slice(prefix.length).split("__");
        if (!ts) continue;
        if (now - Number(ts) > 9000) { store.delete(b.key).catch(() => {}); continue; }
        peers.push({ pid: p, avatar: avatar === "-" ? null : avatar, at: Number(at) });
      }
      return json({ peers });
    }

    /* il mazziere scrive una copia del tavolo per ogni giocatore */
    if (a === "state") {
      const b = await body();
      const to = clean(b.to, 16);
      if (!to || !b.snap) return json({ error: "manca il destinatario" }, 400);
      await store.setJSON(P("state/" + to), { at: Date.now(), snap: b.snap });
      return json({ ok: true });
    }

    if (a === "mystate") {
      const v = await store.get(P("state/" + pid), { type: "json" });
      return json({ state: v || null });
    }

    /* le mosse degli altri arrivano al mazziere e vengono consumate */
    if (a === "intent") {
      const b = await body();
      const key = P("int/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
      await store.setJSON(key, b);
      return json({ ok: true });
    }

    if (a === "intents") {
      const prefix = P("int/");
      const { blobs } = await store.list({ prefix });
      const intents = [];
      for (const b of blobs.sort((x, y) => (x.key < y.key ? -1 : 1))) {
        const v = await store.get(b.key, { type: "json" });
        await store.delete(b.key).catch(() => {});
        if (v) intents.push(v);
      }
      return json({ intents });
    }

    /* storico permanente della stanza */
    if (a === "stats") {
      if (req.method === "POST") {
        await store.setJSON(P("stats"), await body());
        return json({ ok: true });
      }
      const v = await store.get(P("stats"), { type: "json" });
      return json({ stats: v || null });
    }

    return json({ error: "azione sconosciuta" }, 400);
  } catch (e) {
    return json({ error: String(e && e.message ? e.message : e) }, 500);
  }
};

export const config = { path: "/api/room" };
