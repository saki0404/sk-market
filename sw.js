const ROOT=new URL('./',self.location.href),NAME='market-entrance-shell-v2:'+ROOT.pathname;
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(NAME),response=await fetch(ROOT,{cache:'no-store'});
  if(!response.ok)throw new Error('Entrance shell unavailable');
  const html=await response.clone().text();
  const paths=[...html.matchAll(/(?:src|href)="([^\"]+)"/g)].map(m=>new URL(m[1],ROOT)).filter(u=>u.origin===ROOT.origin&&(u.pathname.startsWith(ROOT.pathname+'assets/')||u.pathname===ROOT.pathname+'config.js')).map(u=>u.href);
  await cache.addAll([...new Set(paths)]);await cache.put(ROOT.href,response);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/files/'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(NAME);
    try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}
    catch(error){const cached=await cache.match(request)|| (request.mode==='navigate'?await cache.match(ROOT.href) : undefined);if(cached)return cached;throw error;}
  })());
});
