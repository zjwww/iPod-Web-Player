/* SPDX-License-Identifier: MIT. Cache only this app's files and catalog music. */
importScripts('./range.js','./catalog.js');
const BASE=new URL('./',self.location.href),PREFIX='ipod-web-player:'+encodeURIComponent(BASE.pathname)+':',CACHE=PREFIX+'v0.3.1';
const ASSETS=['./','./index.html','./theme.js','./styles.css','./screen.css','./fonts/NotoSansSC-Regular.woff2','./fonts/OFL-NotoSansSC.txt','./library.js','./player-core.js','./wheel-player.js','./catalog.js','./range.js','./app.js','./service-state.js','./tracks.json','./manifest.webmanifest','./icons/ipod.svg','./icons/icon-192.png','./icons/icon-512.png'];
ASSETS.push('./credits.html','./appearance/LICENSE-ChicagoKare-MIT.txt','./appearance/player-materials.css','./appearance/adapter.css','./appearance/player-artwork.js','./appearance/ChicagoKare.woff2','./appearance/grain.svg');
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);await cache.addAll(ASSETS);
  const response=await cache.match(new URL('./tracks.json',BASE).href),tracks=HostedCatalog.parseCatalog(await response.json(),BASE.href);
  await cache.addAll(tracks.map(track=>track.url));await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
async function cachedResponse(request){
  const cache=await caches.open(CACHE),response=await cache.match(request,{ignoreSearch:true});
  if(!response){try{return await fetch(request);}catch(error){if(request.mode==='navigate')return cache.match(new URL('./index.html',BASE).href);throw error;}}
  const range=request.headers.get('Range');if(!range)return response;
  const bytes=await response.arrayBuffer(),part=PlayerRange.parseRange(range,bytes.byteLength);
  if(!part)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});
  const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${part.start}-${part.end}/${bytes.byteLength}`);headers.set('Content-Length',String(part.end-part.start+1));headers.set('Accept-Ranges','bytes');
  return new Response(bytes.slice(part.start,part.end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname)||url.pathname==='/__ipod/status')return;
  event.respondWith(cachedResponse(event.request));
});
