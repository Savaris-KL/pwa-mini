var CACHE_NAME = "cache_5";
var CACHE_URL = ["/", "/image/icon.png", "/manifest.json", "/style.css"];

//注册
self.addEventListener("install", async (event) => {
  console.log("----install-----");
  console.log(event);
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CACHE_URL);
  await self.skipWaiting();
});
//激活
self.addEventListener("activate", async (event) => {
  console.log("----activate-----");
  console.log(event);
  //获取到左右资源的key
  const keys = await caches.keys();
  keys.forEach((key) => {
    if (key != CACHE_NAME) {
      //旧资源
      caches.delete(key);
    }
  });
  //service worker 激活后，立即获取控制权
  await self.clients.claim();
});
//拦截请求
self.addEventListener("fetch", (event) => {
  //可以抓取到所有网络请求
  console.log("----fetch-----");
  console.log(event);
  //请求对象
  const req = event.request;
  //只缓存同源内容
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    return;
  }
  //给浏览器相应,
  if (req.url.includes("/api")) {
    //资源走网络优先
    event.respondWith(networkFirst(req));
  } else {
    //资源走缓存优先
    event.respondWith(cacheFrist(req));
  }
});

//缓存优先
async function cacheFrist(req) {
  //打开缓存
  const cache = await caches.open(CACHE_NAME);
  //取出对应数据
  const cached = await cache.match(req);
  if (cached) {
    //如果从缓存中得到了，直接返回缓存
    return cached;
  } else {
    const fresh = await fetch(req);
    return fresh;
  }
}
