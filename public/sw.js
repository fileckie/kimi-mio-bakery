const CACHE_NAME = "mio-slowfire-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// 安装：缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 抓取：缓存优先，网络回退
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 只处理 GET 请求
  if (request.method !== "GET") return;

  // API 请求走网络
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((res) => res || new Response(JSON.stringify({ offline: true }), { status: 503, headers: { "Content-Type": "application/json" } }))
      )
    );
    return;
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // 离线时，HTML 请求返回缓存的首页
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("", { status: 503 });
        });
    })
  );
});
