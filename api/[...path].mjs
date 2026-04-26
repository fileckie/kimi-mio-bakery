import { initDb } from "../server/db.mjs";
import { handleApi } from "../server/api-handler.mjs";

let ready = false;

export default async function handler(req, res) {
  if (!ready) {
    initDb();
    ready = true;
  }

  try {
    const url = new URL(req.url ?? "/", `https://${req.headers.host || "mio-bakery.vercel.app"}`);
    if (!url.pathname.startsWith("/api/")) {
      url.pathname = `/api${url.pathname}`;
    }
    await handleApi(req, res, url);
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message || "Internal error" }));
  }
}
