import {createMarketMap} from './market-map.js';
import {spotlightGroups,currentMerchant,nextMerchant} from './spotlight.js';
import {createMarketClient} from './market-data.js';
const iconFiles=import.meta.glob('../icons/*.svg',{eager:true,query:'?url',import:'default'});
const artFiles=import.meta.glob('../images/icon-*.png',{eager:true,query:'?url',import:'default'});
const artNames={storefront:'shop','map-trifold':'map',fish:'seafood',leaf:'vegetables',egg:'meat',grains:'grain','cooking-pot':'condiments',guide:'guide'};
const $=id=>document.getElementById(id);
const el=(tag,value='',className='')=>{const node=document.createElement(tag);node.textContent=value;node.className=className;return node;};
const bi=(zh,en,cls='')=>{const node=el('span','','bi'+(cls?' '+cls:''));node.append(el('span',zh));if(en)node.append(el('span',en,'en'));return node;};
const attach=(node,value)=>{if(typeof value==='string')node.textContent=value;else node.append(value);return node;};
function icon(name,extra=''){const img=el('img','','icon '+extra);const art=artFiles['../images/icon-'+artNames[name]+'.png'];if(art)img.classList.add('art-icon');img.src=art||iconFiles[`../icons/${name}.svg`]||iconFiles['../icons/storefront.svg'];img.alt='';img.setAttribute('aria-hidden','true');return img;}
function button(label,callback,cls='quiet-button',symbol){const b=el('button','',cls);b.type='button';if(symbol)b.append(icon(symbol));b.append(typeof label==='string'?el('span',label):label);b.addEventListener('click',callback);return b;}
function empty(title,description,symbol='storefront'){const box=el('div','','empty-state');box.append(icon(symbol),attach(el('h3'),title),attach(el('p'),description));return box;}
let data={categories:[],stalls:[],floors:[],encyclopedia:[]},view='home',category='',selected='',floor='',zone='',query='',lastAction=Date.now(),client,loadState='loading',detailReturn='shops';
const isPreview=import.meta.env.DEV && new URLSearchParams(location.search).get('preview')==='design';
const ROTATION_MS=3000;
const mapState={source:'reference',selected:'',query:''};
let disposeMap;
const spotlightMerchants=new Map();
let rotationTimer, rotating=false;
function featureCard(group,stall){
 const node=card(stall,true);
 node.dataset.categoryId=group.category.id;
 const label=node.querySelector('.sample-tag')||el('span','','sample-tag');
 label.textContent=group.category.name+(group.category.nameEn?' · '+group.category.nameEn:'')+(isPreview?' · 示意 Sample':'');
 if(!label.isConnected)node.append(label);
 return node;
}
function scheduleRotation(){
 clearTimeout(rotationTimer);
 if(view==='home'&&spotlightGroups(data).some(group=>group.stalls.length>1)&&!document.hidden)
  rotationTimer=setTimeout(()=>rotateSpotlight(),ROTATION_MS);
}
async function rotateSpotlight(){
 const features=$('main').querySelector('.spotlight');
 if(!features||rotating)return;
 if(features.matches(':hover')||features.contains(document.activeElement)){scheduleRotation();return;}
 clearTimeout(rotationTimer);rotating=true;
 const snapshot=data;
 const changes=spotlightGroups(data).filter(group=>group.stalls.length>1).map(group=>{
  const old=[...features.children].find(node=>node.dataset.categoryId===group.category.id);
  const stall=nextMerchant(group,spotlightMerchants.get(group.category.id));
  return {group,old,stall,next:featureCard(group,stall)};
 }).filter(change=>change.old);
 const animate=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 try{
  // Decode the next photos before fading the currently readable merchant away.
  await Promise.all(changes.map(({next})=>next.querySelector('.shop-photo')?.decode().catch(()=>{})));
  if(!features.isConnected||view!=='home'||data!==snapshot)return;
  if(animate)await Promise.all(changes.map(({old})=>old.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-in',fill:'forwards'}).finished));
  if(!features.isConnected||view!=='home'||data!==snapshot)return;
  for(const {group,old,stall,next} of changes){
   spotlightMerchants.set(group.category.id,stall.id);
   old.replaceWith(next);
  }
  if(animate)await Promise.all(changes.map(({next})=>next.animate([{opacity:0},{opacity:1}],{duration:360,easing:'ease-out'}).finished));
 }finally{rotating=false;scheduleRotation();}
}
document.addEventListener('visibilitychange',scheduleRotation);
function categoryIcon(c){const name=c.name;if(/水产|海鲜/.test(name))return 'fish';if(/蔬|果/.test(name))return 'leaf';if(/肉|禽|蛋/.test(name))return 'egg';if(/粮|油|干货/.test(name))return 'grains';if(/副食|调料|熟食/.test(name))return 'cooking-pot';return 'storefront';}
function photo(asset,name){if(!asset?.localUrl){const p=el('div','','photo-empty');p.append(icon('storefront'),bi('暂无门店照片','No photo yet'));return p;}const img=el('img','','shop-photo');img.src=asset.localUrl;img.alt=(isPreview?'设计示意：':'')+name+'门店照片';img.addEventListener('error',()=>img.replaceWith(photo(null,name)),{once:true});return img;}
function navigate(next,options={}){if(next==='detail'&&view!=='detail')detailReturn=view==='home'?'home':view==='map'?'map':'shops';view=next;if(options.category!==undefined){category=options.category;query='';}if(options.selected!==undefined)selected=options.selected;if(options.floor!==undefined){floor=options.floor;zone='';}if(options.zone!==undefined)zone=options.zone;lastAction=Date.now();render();$('main').focus({preventScroll:true});}
function renderBar(){const bar=$('categoryBar');bar.replaceChildren();if(!data.categories.length){bar.append(bi('商户分类将在资料发布后显示','Categories will appear once published','category-placeholder'));return;}for(const c of data.categories){const b=button(c.nameEn?bi(c.name,c.nameEn):c.name,()=>navigate('shops',{category:c.id}),'category-item'+(view==='shops'&&category===c.id?' selected':''),categoryIcon(c));b.setAttribute('aria-pressed',String(view==='shops'&&category===c.id));bar.append(b);}}
function card(stall,feature=false){const b=el('button','',feature?'shop-feature':'shop-card');b.type='button';b.setAttribute('aria-label',`查看${stall.name}详情`);b.append(photo(stall.photos[0],stall.name));const copy=el('div','',feature?'feature-copy':'card-copy');copy.append(el('h3',stall.name));if(!feature&&stall.code)copy.append(el('span',stall.code,'stall-code'));copy.append(el('p',stall.intro||'暂无店铺介绍 No shop intro yet'));if(feature)copy.append(icon('arrow-right'));b.append(copy);if(isPreview&&feature)b.append(el('span','示意','sample-tag'));b.onclick=()=>navigate('detail',{selected:stall.id});return b;}
function action(zhT,enT,zhS,enS,symbol,callback,primary=false){const b=el('button','','wayfinding'+(primary?' primary':''));b.type='button';b.append(icon(symbol));const copy=el('span','','action-copy');const title=el('span','','action-title');title.append(bi(zhT,enT));const sub=el('span','','action-sub');sub.append(bi(zhS,enS));copy.append(title,sub);b.append(copy,icon('arrow-right','arrow'));b.onclick=callback;return b;}
function home(){const layout=el('div','','home-layout'),container=el('div','','spotlight-container'),features=el('div','','spotlight');
 const groups=spotlightGroups(data);
 if(groups.length){
  for(const group of groups){const stall=currentMerchant(group,spotlightMerchants.get(group.category.id));spotlightMerchants.set(group.category.id,stall.id);features.append(featureCard(group,stall));}
  container.append(features);

 }
 else{const T=loadState==='loading'?['正在准备市场资料','Preparing market info']:loadState==='offline'?['市场资料暂未连接','Market info unavailable']:['期待认识这里的每一家','Every stall awaits you here'];const H=loadState==='offline'?['暂时无法获取已发布资料，请稍后再试。','Published info is temporarily unreachable. Please try again later.']:['管理处发布商户资料后，门店介绍和照片会在这里与你见面。','Shop stories and photos will appear here once published by the market office.'];container.append(empty(bi(...T),bi(...H)));}
 const welcome=el('section','','welcome'),heading=el('div');const h2=el('h2');h2.append(bi('逛市场，从这里开始','Start your market journey here','center'));heading.append(h2);const actions=el('div','','welcome-actions');actions.append(action('海鲜图鉴','Seafood Guide','各类海鲜介绍与做法','Seafood profiles & cooking tips','guide',()=>navigate('knowledge'),true),action('看地图','Market map','查看市场区域导览','Explore zones on the map','map-trifold',()=>navigate('map')));welcome.append(heading,actions);layout.append(container,welcome);return layout;}
function section(title,back=()=>navigate('home'),en=''){const root=el('section','','section-view'),head=el('div','','section-heading'),h2=el('h2');h2.append(bi(title,en));head.append(h2);const backBtn=button(bi('返回','Back'),back,'back-button floating-back','arrow-left');root.append(head);return {root,head,backBtn};}
function filteredStalls(){const term=query.trim().toLocaleLowerCase();return data.stalls.filter(s=>(!category||s.categoryId===category)&&(!term||[s.name,s.nameEn,s.code,s.intro,...s.goods].some(v=>v.toLocaleLowerCase().includes(term))));}
function shopList(){const cat=data.categories.find(c=>c.id===category);const {root,head,backBtn}=section(cat?.name||'全部商户',undefined,cat?.nameEn||'All shops');if(category)head.append(button(bi('全部商户','All shops'),()=>navigate('shops',{category:''})));const search=el('label','','search');search.append(icon('magnifying-glass'));const input=el('input');input.type='search';input.placeholder='搜索店名、编号或品类 Search name / code / goods';input.setAttribute('aria-label','搜索店名、编号或品类');input.value=query;search.append(input);head.append(search);const grid=el('div','','shop-grid');function results(){grid.replaceChildren();const rows=filteredStalls();if(rows.length)grid.append(...rows.map(s=>card(s)));else grid.append(empty(bi(query?'没有找到相关商户':'暂无已发布商户',query?'No matching shops':'No published shops yet'),bi(query?'试试其他店名、摊位编号或经营品类。':'该分类有新的公开资料后，会显示在这里。',query?'Try another name, stall code or category.':'Listings will appear here once new public info is released.')));}input.oninput=()=>{query=input.value;lastAction=Date.now();results();};results();root.append(grid,backBtn);return root;}
function details(){
 const s=data.stalls.find(x=>x.id===selected);
 if(!s){view='shops';return shopList();}
 const {root,head,backBtn}=section(s.name,()=>navigate(detailReturn),s.nameEn||'');
 if(s.code)head.append(el('span',s.code,'stall-code'));
 const content=el('div','','detail-content'),photos=el('div','','detail-photos');
 const publishedPhotos=s.photos.slice(0,2);
 photos.dataset.count=String(Math.max(1,publishedPhotos.length));
 if(publishedPhotos.length)for(const asset of publishedPhotos)photos.append(photo(asset,s.name));
 else photos.append(photo(null,s.name));
 const copy=el('div','','detail-text');
 const intro=el('section','','detail-block detail-intro');
 const about=el('h3');about.append(bi('认识这家店','About this shop'));
 if(s.nameEn)intro.append(el('p',s.nameEn,'en'));
 intro.append(about,el('p',s.intro||'暂无已发布介绍 No published intro yet'));
 if(s.introEn)intro.append(el('p',s.introEn,'en'));
 const business=el('section','','detail-block');
 const bizTitle=el('h3');bizTitle.append(bi('经营品类','What they sell'));business.append(bizTitle);
 const goods=el('div','','goods');
 goods.append(...(s.goods.length?s.goods:['暂无已发布品类 No published goods yet']).map(g=>el('span',g)));
 business.append(goods);
 const message=el('section','','detail-block');
 const msgTitle=el('h3');msgTitle.append(bi('商户寄语','A note from the shop'));message.append(msgTitle,el('p',s.message||'暂无寄语 No note yet'));
 if(s.messageEn)message.append(el('p',s.messageEn,'en'));
 copy.append(intro,business,message);
 const f=data.floors.find(x=>x.id===s.floorId),z=f?.zones.find(x=>x.id===s.zoneId);
 if(f){const locationButton=button(bi(`查看位置 · ${f.name}${z?' / '+z.title:''}`,'View location'),()=>{floor=f.id;zone=z?.id||'';mapState.source=f.id;mapState.selected=zone;mapState.query='';navigate('map');},'quiet-button','map-trifold');locationButton.classList.add('detail-location');copy.append(locationButton);}
 content.append(photos,copy);root.append(content,backBtn);return root;
}
function marketMap(){
 const {root,backBtn}=section('市场导览',undefined,'Market map');
 const guide=createMarketMap({data,state:mapState,referenceEnabled:(window.ENTRANCE_CONFIG?.marketId||'mkt_001')==='mkt_001',onMerchant:id=>navigate('detail',{selected:id})});
 root.append(guide.element,backBtn);disposeMap=guide.destroy;return root;
}
function knowledge(){const {root,backBtn}=section('海鲜图鉴',undefined,'Seafood guide'),list=el('div','','knowledge-list');const labels=[['产地','Origin','origin'],['怎么吃','Cooking ideas','cooking'],['特点','Features','features']];const placeholder=()=>{const p=el('div','','photo-empty seafood-photo');p.append(icon('fish'),bi('暂无图片','No photo yet'));return p;};for(const k of data.encyclopedia){const item=el('article','','knowledge-item');const asset=k.photos?.[0];if(asset?.localUrl){const img=el('img','','seafood-photo');img.src=asset.localUrl;img.alt=k.name+'图片';img.addEventListener('error',()=>img.replaceWith(placeholder()),{once:true});item.append(img);}else item.append(placeholder());const copy=el('div','','seafood-copy');const h3=el('h3');h3.append(bi(k.name,k.nameEn||''));copy.append(h3);for(const [label,en,key]of labels){const h4=el('h4');h4.append(bi(label,en));copy.append(h4,el('p',k[key]||'暂无资料 No info yet'));}item.append(copy);list.append(item);}if(!list.children.length)list.append(empty(bi('海鲜图鉴待完善','Seafood guide coming soon'),bi('各类海鲜的介绍和图片将在管理处发布后显示在这里。','Seafood profiles and photos will appear here once published by the market office.'),'books'));root.append(list,backBtn);return root;}
function render(){document.body.classList.toggle('map-view',view==='map');document.body.classList.toggle('knowledge-view',view==='knowledge');disposeMap?.();disposeMap=null;clearTimeout(rotationTimer);const active=document.activeElement;const searchFocused=active?.tagName==='INPUT';const cursor=searchFocused?active.selectionStart:null;$('marketName').textContent=data.market?.name||'蛇口市场';$('main').replaceChildren(({home,shops:shopList,detail:details,map:marketMap,knowledge}[view]||home)());renderBar();if(searchFocused&&view==='shops'){const input=$('main').querySelector('input');input.focus();if(input.type==='text')input.setSelectionRange(cursor,cursor);}scheduleRotation();}
$('brandHome').onclick=()=>navigate('home');for(const event of ['pointerdown','keydown','wheel'])document.addEventListener(event,()=>{lastAction=Date.now();},{passive:true});
function clock(){const now=new Date();$('dateText').dateTime=now.toISOString();const zh=now.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'});const en=now.toLocaleDateString('en-US',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short'});$('dateText').replaceChildren(el('span',zh),' · ',el('span',en,'en'));if(view!=='home'&&Date.now()-lastAction>120000)navigate('home');}clock();setInterval(clock,1000);
render();
if(isPreview){$('previewNotice').hidden=false;const {previewData}=await import('./design-preview.js');data=previewData;loadState='ready';const v=new URLSearchParams(location.search).get('view');if(v&&['home','shops','map','knowledge'].includes(v))view=v;$('syncStatus').textContent='设计示意 Design preview · 非真实商户资料 Not real merchants';render();}
else {const config=window.ENTRANCE_CONFIG||{};client=createMarketClient({apiBase:config.apiBase||'',marketId:config.marketId||'mkt_001',onData(next){data=next;loadState='ready';render();},onStatus(message,state){loadState=state;$('syncStatus').textContent=message;if(view==='home'&&!data.stalls.length)render();}});void client.start();window.addEventListener('online',()=>client.refresh());window.addEventListener('pagehide',event=>{if(!event.persisted)client.stop();});if('serviceWorker'in navigator&&!import.meta.env.DEV)navigator.serviceWorker.register(new URL('sw.js',document.baseURI)).catch(()=>{$('syncStatus').textContent+=' · 离线页面缓存不可用';});}
