import { createReadStream, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { createServer } from "node:http";
import { initDb } from "./db.mjs";
import { handleApi } from "./api-handler.mjs";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const distDir = join(process.cwd(), "dist");

initDb();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal error" });
  }
});

server.listen(port, host, () => {
  console.log(`Mio Bakery API running at http://${host}:${port}`);
});

function sendJson(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res, pathname) {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(distDir, normalized);
  const fallback = join(distDir, "index.html");
  const target = existsSync(filePath) && !filePath.endsWith("/") ? filePath : fallback;
  if (!existsSync(target)) {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("Mio Bakery API is running. Build frontend with npm run build for production static files.");
    return;
  }
  res.writeHead(200, { "content-type": contentType(target) });
  createReadStream(target).pipe(res);
}

function contentType(filePath) {
  const ext = extname(filePath);
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
    }[ext] || "application/octet-stream"
  );
}
