// Original layout: saki0404/sk-market @14a37ed. Runtime data comes only from published public snapshots.
const config = window.ENTRANCE_CONFIG || {}, base = (config.apiBase || '').replace(/\/$/, ''), market = config.marketId || 'mkt_001';
const marketScreenEndpoint = `${base}/api/public/markets/${encodeURIComponent(market)}/entrance`, marketScreenCacheKey = marketScreenEndpoint;
const $ = id => document.getElementById(id);
const colors = ['#0e9fc4','#22ac52','#e39200','#f0552f','#8348e0'];
let data = { categories: [], stalls: [], floors: [], encyclopedia: [] }, active = 'scr-home', category = '', selected = '', floor = '', highlight = '', marketScreenFingerprint = '', lastAction = Date.now(), marketScreenSyncing = false;
let cached, releases = [];
const text = (tag, value, cls = '') => { const el = document.createElement(tag); el.textContent = value || ''; if (cls) el.className = cls; return el; };
const empty = (parent, message) => { parent.replaceChildren(text('p',message,'entrance-empty')); };
function go(id) { active = id; document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id)); $('backDock').style.display = id === 'scr-home' ? 'none' : 'block'; lastAction = Date.now(); }
function goBack() { if(active === 'scr-detail') openMarketScreenCategory(category); else go(active === 'scr-list' ? 'scr-cat' : 'scr-home'); }
function img(asset) {
  const image = document.createElement('img'); image.alt = '已审核门店照片'; image.src = asset.localUrl; image.style.cssText = 'width:100%;height:100%;object-fit:contain';
  image.addEventListener('error', () => image.replaceWith(text('span','照片暂不可用'))); return image;
}
function openMarketScreenCategory(id) {
  category = id; const c = data.categories.find(c => c.id === id); $('listTitle').replaceChildren(text('span',c?.name || '商户'),text('small',c?.nameEn));
  const box = $('shopScroll'); box.replaceChildren();
  for (const s of data.stalls.filter(s => s.categoryId === id)) box.append(shopCard(s));
  if (!box.children.length) empty(box,'暂无已发布商户'); go('scr-list');
}
function shopCard(s) {
  const row = text('button','','shop-row'); row.type = 'button'; row.dataset.stallId = s.id;
  const thumb = text('div','','thumb'); if (s.photos[0]) thumb.append(img(s.photos[0])); else thumb.textContent = '暂无照片';
  const mid = text('div','','mid'), name = text('div',s.name,'nm'); name.append(text('small',s.nameEn));
  mid.append(name,text('div',s.intro,'intro'),text('div',s.introEn,'intro en')); row.append(thumb,mid,text('div',s.code,'loc'));
  row.addEventListener('click',() => openMarketScreenShop(s.id)); return row;
}
function openMarketScreenShop(id) {
  const s = data.stalls.find(s => s.id === id); if (!s) { openMarketScreenCategory(category); return; } selected = id; category = s.categoryId;
  const left = text('div','','detail-left'), header = text('div','','detail-head'), name = text('div',s.name,'nm'); name.append(text('small',s.nameEn));
  header.append(name,text('div',s.code,'loc')); left.append(header);
  const photos = text('div','','photo-strip');
  for (let i = 0; i < 2; i++) { const frame = text('div','','photo'); frame.append(s.photos[i] ? img(s.photos[i]) : text('span','暂无门店照片')); photos.append(frame); } left.append(photos);
  const right = text('div','','detail-right'), goods = text('div','','panel'), tags = text('div','','sell-tags');
  goods.append(text('div','经营品类 · Product showcase','ph')); for (const g of s.goods) tags.append(text('span',g));
  if (!s.goods.length) tags.append(text('span','暂无已发布资料')); goods.append(tags);
  const message = text('div','','panel'); message.append(text('div','商户寄语 · Shopkeeper’s words','ph'),text('div',s.message || '暂无寄语','intro-quote'),text('div',s.messageEn,'en'));
  right.append(goods,message); $('detailWrap').replaceChildren(left,right); go('scr-detail');
}
function setFloor(id) { floor = id; highlight = ''; closeZoneCard(); renderMap(); }
function closeZoneCard() { $('zoneCard').style.display = 'none'; }
function renderMap() {
  const f = data.floors.find(f => f.id === floor) || data.floors[0], svg = $('floorSvg'); svg.replaceChildren();
  document.querySelector('.floor-switch').replaceChildren(...data.floors.map(f => { const b = text('button',f.name,'floor-btn' + (f.id === floor ? ' active' : '')); b.onclick = () => setFloor(f.id); return b; }));
  $('mapSub').textContent = f ? `${f.name} · ${f.schematic ? '示意布局 · Schematic' : '已发布平面导览'}` : '暂无已发布地图';
  if (!f) return; floor = f.id; svg.setAttribute('viewBox',`0 0 ${f.width} ${f.height}`);
  for (const z of f.zones) {
    const group = document.createElementNS('http://www.w3.org/2000/svg','g'), rect = document.createElementNS(svg.namespaceURI,'rect'), label = document.createElementNS(svg.namespaceURI,'text');
    for (const k of ['x','y','width','height']) rect.setAttribute(k,String(z[k]));
    const index = data.categories.findIndex(c => c.id === z.categoryId); rect.setAttribute('fill',colors[(index + colors.length) % colors.length]); rect.setAttribute('rx','8');
    group.style.opacity = highlight && z.categoryId !== highlight ? '.2' : '1';
    label.setAttribute('x',String(z.x+8)); label.setAttribute('y',String(z.y+22)); label.textContent = z.title; label.style.fontSize = '16px';
    group.append(rect,label); group.onclick = () => { highlight = z.categoryId; $('zcNm').textContent = z.title; $('zcType').textContent = data.categories.find(c => c.id === z.categoryId)?.name || '公共区域'; $('zcSub').textContent = z.titleEn; $('zcDesc').textContent = z.description + (z.descriptionEn ? ' / ' + z.descriptionEn : ''); $('zoneCard').style.display = 'block'; renderMap(); }; svg.append(group);
  }
  $('lgChips').replaceChildren(...data.categories.map((c,i) => { const b = text('button',c.name,'lg-chip'); b.style.borderColor = colors[i % colors.length]; b.onclick = () => { highlight = highlight === c.id ? '' : c.id; renderMap(); }; return b; }));
}
function render() {
  const old = active; $('brand').querySelector('.zh').textContent = data.market?.name || '蛇口市场';
  const feed = $('feedTrack'); feed.replaceChildren(...data.stalls.map(shopCard));
  if (!data.stalls.length) empty(feed,data.revision ? '暂无已发布商户资料' : '管理处尚未发布门口展示资料');
  $('catGrid').replaceChildren(...data.categories.map((c,i) => { const b = text('button','','cat-card'); b.style.borderColor = colors[i % colors.length]; b.append(text('div',c.name,'nm'),text('div',c.nameEn,'en'),text('div',`${data.stalls.filter(s => s.categoryId === c.id).length} 家`,'cnt')); b.onclick = () => openMarketScreenCategory(c.id); return b; }));
  const ticker = $('tickerTrack'); ticker.replaceChildren(...data.encyclopedia.map(k => { const card = text('div','','sea-card'), info = text('div','','info'); info.append(text('div',k.name,'nm'),text('small',k.nameEn),text('div','产地说明：'+k.origin,'line'),text('div','特点：'+k.features,'line'),text('div','做法：'+k.cooking,'line')); card.append(info); return card; }));
  if (!data.encyclopedia.length) empty(ticker,'海鲜图鉴资料待完善 · Knowledge directory pending');
  renderMap(); if (old === 'scr-detail' && data.stalls.some(s => s.id === selected)) openMarketScreenShop(selected); else if (old === 'scr-detail') { openMarketScreenCategory(category); } else if (old === 'scr-list') openMarketScreenCategory(category); else go(old);
}
function database() { return new Promise((resolve,reject) => { const req = indexedDB.open('market-entrance-v1',1); req.onupgradeneeded = () => req.result.createObjectStore('snapshots'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
async function cacheRead() { const db = await database(); try { return await new Promise((resolve,reject) => { const req = db.transaction('snapshots').objectStore('snapshots').get(marketScreenCacheKey); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); } finally { db.close(); } }
async function cacheWrite(value) { const db = await database(); try { await new Promise((resolve,reject) => { const tx = db.transaction('snapshots','readwrite'); tx.objectStore('snapshots').put(value,marketScreenCacheKey); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); } finally { db.close(); } }
async function hash(blob) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(b => b.toString(16).padStart(2,'0')).join(''); }
async function prepare(snapshot) {
  if (snapshot.schemaVersion !== '1.0' || snapshot.market?.id !== market || !Array.isArray(snapshot.stalls) || !Array.isArray(snapshot.categories) || !Array.isArray(snapshot.floors) || !Array.isArray(snapshot.encyclopedia)) throw new Error('展示数据格式或市场不匹配');
  const blobs = {}, previous = cached?.blobs || {};
  for (const s of snapshot.stalls) for (const asset of s.photos) {
    if (previous[asset.sha256]) { blobs[asset.sha256] = previous[asset.sha256]; continue; }
    const address = new URL(asset.url,base || location.origin); if (!['http:','https:'].includes(address.protocol)) throw new Error('图片地址无效');
    const response = await fetch(address,{ signal: AbortSignal.timeout(15000), credentials: 'omit' }); if (!response.ok) throw new Error('图片下载失败');
    const blob = await response.blob(); if (!['image/png','image/jpeg','image/webp'].includes(blob.type) || await hash(blob) !== asset.sha256) throw new Error('图片校验失败');
    await createImageBitmap(blob).then(bitmap => bitmap.close()); blobs[asset.sha256] = blob;
  }
  return { snapshot,blobs };
}
function apply(value) {
  const next = JSON.stringify(value.snapshot,(key,v) => ['url','serverTime'].includes(key) ? undefined : v); cached = value;
  if (next !== marketScreenFingerprint) {
    const oldReleases = releases; releases = []; data = structuredClone(value.snapshot);
    for (const s of data.stalls) for (const a of s.photos) { a.localUrl = URL.createObjectURL(value.blobs[a.sha256]); releases.push(a.localUrl); }
    render(); oldReleases.forEach(url => URL.revokeObjectURL(url)); marketScreenFingerprint = next;
  }
}
function status(message) { $('syncStatus').textContent = message; }
async function sync() {
  if (marketScreenSyncing) return; marketScreenSyncing = true;
  try {
    const response = await fetch(marketScreenEndpoint,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)}); const envelope = await response.json();
    if (!response.ok || envelope.code !== 0) throw new Error(envelope.message || '读取失败');
    const next = await prepare(envelope.data); let persistent = true;
    try { await cacheWrite(next); } catch { persistent = false; }
    apply(next);
    status(`已发布版本 ${data.revision} · ${data.publishedAt ? new Date(data.publishedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}) : '尚无发布'}${persistent ? '' : ' · 本机缓存不可用，离线重启可能无法恢复'}`);
  } catch(e) { status(cached ? `离线/同步失败 · 保留版本 ${cached.snapshot.revision}` : '未能连接，暂无缓存资料'); console.warn('Entrance sync:',e.message); }
  finally { marketScreenSyncing = false; setTimeout(sync,60000); }
}
// Native scroll areas support touch/mouse wheel; auto-scroll pauses while interacting.
let pausedUntil = 0;
document.addEventListener('pointerdown',() => { pausedUntil = Infinity; lastAction = Date.now(); });
const resume = () => { pausedUntil = Date.now()+1500; lastAction = Date.now(); };
document.addEventListener('pointerup',resume); document.addEventListener('pointercancel',resume); document.addEventListener('wheel',resume,{passive:true});
window.addEventListener('blur',resume);
function mouseDrag(el, axis) {
  let start, position = 0, moved = false;
  const coordinate = e => axis === 'scrollTop' ? e.clientY : e.clientX;
  el.addEventListener('pointerdown',e => { if(e.pointerType === 'mouse' && e.button === 0) { start = coordinate(e); position = el[axis]; moved = false; } });
  el.addEventListener('pointermove',e => {
    if(start === undefined || !e.buttons) return;
    const delta = coordinate(e)-start;
    if(Math.abs(delta)>5 || moved) { moved = true; el.setPointerCapture(e.pointerId); el[axis] = position-delta; e.preventDefault(); }
  });
  for(const event of ['pointerup','pointercancel']) el.addEventListener(event,() => { start = undefined; setTimeout(() => { moved = false; },0); });
  el.addEventListener('click',e => { if(moved) { e.preventDefault(); e.stopImmediatePropagation(); } },true);
}
mouseDrag(document.querySelector('.feed-viewport'),'scrollTop');mouseDrag($('ticker'),'scrollLeft');mouseDrag($('shopScroll'),'scrollTop');
function updateDate() {
  const now = new Date(); $('dateText').textContent = now.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'}); $('weekZh').textContent = now.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',weekday:'long'}); $('weekEn').textContent = now.toLocaleDateString('en-US',{timeZone:'Asia/Shanghai',weekday:'long'});
  if (Date.now()-lastAction > 120000 && active !== 'scr-home') go('scr-home');
}
updateDate(); setInterval(updateDate,1000);
let lastFrame = 0;
function animate(time) {
  if (time-lastFrame > 30 && Date.now() > pausedUntil && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const [el,axis] of [[document.querySelector('.feed-viewport'),'scrollTop'],[$('ticker'),'scrollLeft']]) {
      const max = axis === 'scrollTop' ? el.scrollHeight-el.clientHeight : el.scrollWidth-el.clientWidth;
      if (max>0) el[axis] = el[axis] >= max-1 ? 0 : el[axis]+1;
    }
    lastFrame = time;
  }
  requestAnimationFrame(animate);
}
Object.assign(window,{go,goBack,setFloor,closeZoneCard});
go('scr-home'); render(); requestAnimationFrame(animate);
if ('serviceWorker' in navigator && !import.meta.env?.DEV) navigator.serviceWorker.register(new URL('./sw.js',document.baseURI)).catch(() => {});
void (async () => {
  try {
    const previous = await cacheRead();
    if (previous) {
      for (const s of previous.snapshot.stalls) for (const a of s.photos) {
        const blob = previous.blobs[a.sha256]; if (!blob || await hash(blob) !== a.sha256) throw new Error('缓存图片校验失败');
      }
      apply(previous); status(`缓存版本 ${previous.snapshot.revision} · 正在同步`);
    }
  } catch { status('缓存不可用，正在尝试联网'); }
  void sync();
})();
