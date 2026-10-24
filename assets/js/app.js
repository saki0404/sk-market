import {createMarketMap} from './market-map.js';
import {stallLocation} from './map-model.js';
import {spotlightGroups,currentMerchant,nextMerchant} from './spotlight.js';
import {createMarketClient} from './market-data.js';
const iconFiles=import.meta.glob('../icons/*.svg',{eager:true,query:'?url',import:'default'});
const artFiles=import.meta.glob('../images/icon-*.png',{eager:true,query:'?url',import:'default'});
const artNames={storefront:'shop','map-trifold':'map',fish:'seafood',leaf:'vegetables',egg:'meat',grains:'grain','cooking-pot':'condiments',guide:'guide','arrow-left':'arrow-warm','arrow-right':'arrow-warm',house:'home-warm'};
const $=id=>document.getElementById(id);
const el=(tag,value='',className='')=>{const node=document.createElement(tag);node.textContent=value;node.className=className;return node;};
const bi=(zh,en,cls='')=>{const node=el('span','','bi'+(cls?' '+cls:''));node.append(el('span',zh));if(en)node.append(el('span',en,'en'));return node;};
const attach=(node,value)=>{if(typeof value==='string')node.textContent=value;else node.append(value);return node;};
function icon(name,extra=''){const img=el('img','','icon '+extra);const art=artFiles['../images/icon-'+artNames[name]+'.png'];if(art)img.classList.add('art-icon');img.src=art||iconFiles[`../icons/${name}.svg`]||iconFiles['../icons/storefront.svg'];img.alt='';img.setAttribute('aria-hidden','true');return img;}
function button(label,callback,cls='quiet-button',symbol){const b=el('button','',cls);b.type='button';if(symbol)b.append(icon(symbol));b.append(typeof label==='string'?el('span',label):label);b.addEventListener('click',callback);return b;}
function empty(title,description,symbol='storefront'){const box=el('div','','empty-state');box.append(icon(symbol),attach(el('h3'),title),attach(el('p'),description));return box;}
let data={categories:[],stalls:[],floors:[],encyclopedia:[]},view='home',fromView='home',category='',selected='',floor='',zone='',query='',lastAction=Date.now(),client,loadState='loading',detailReturn='shops';
const isPreview=import.meta.env.DEV && new URLSearchParams(location.search).get('preview')==='design';
const ROTATION_MS=3000;
/* 首页媒体背景轮播：图片每张 7s，视频播完自动切下一张；素材可由后台通过 ENTRANCE_CONFIG.homeMedia 下发（type: image|video, src: 地址） */
const HOME_MEDIA=Array.isArray(window.ENTRANCE_CONFIG?.homeMedia)&&window.ENTRANCE_CONFIG.homeMedia.length?window.ENTRANCE_CONFIG.homeMedia:[{type:'image',src:'./assets/images/home-bg-market.png'}];
let hmIndex=0,hmTimer=null;
function homeMediaAdvance(){
 const host=$('homeMedia');if(!host)return;
 const item=HOME_MEDIA[hmIndex%HOME_MEDIA.length];hmIndex++;
 let node;
 if(item.type==='video'){node=el('video','','home-media-item');node.src=item.src;node.muted=true;node.playsInline=true;node.autoplay=true;node.addEventListener('ended',homeMediaAdvance,{once:true});}
 else{node=el('img','','home-media-item');node.src=item.src;node.alt='';node.addEventListener('load',()=>{clearTimeout(hmTimer);hmTimer=setTimeout(homeMediaAdvance,7000);},{once:true});}
 node.addEventListener('error',()=>{clearTimeout(hmTimer);hmTimer=setTimeout(homeMediaAdvance,2000);},{once:true});
 host.append(node);
 requestAnimationFrame(()=>requestAnimationFrame(()=>node.classList.add('shown')));
 const old=[...host.children].find(n=>n!==node);
 if(old)setTimeout(()=>{if(old.isConnected){old.classList.remove('shown');setTimeout(()=>old.remove(),1100);}},1100);
}
function startHomeMedia(){const host=$('homeMedia');if(!host)return;clearTimeout(hmTimer);if(!host.children.length)homeMediaAdvance();}
function stopHomeMedia(){const host=$('homeMedia');clearTimeout(hmTimer);host?.replaceChildren();}
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
function navigate(next,options={}){if(next==='detail'&&view!=='detail')detailReturn=view==='home'?'home':view==='map'?'map':'shops';if(next!==view){if(view==='home'||next==='home')fromView='home';}view=next;if(options.category!==undefined){category=options.category;query='';}if(options.selected!==undefined)selected=options.selected;if(options.floor!==undefined){floor=options.floor;zone='';}if(options.zone!==undefined)zone=options.zone;lastAction=Date.now();render();$('main').focus({preventScroll:true});}
function renderBar(){const bar=$('categoryBar');bar.replaceChildren();if(!data.categories.length){bar.append(bi('商户分类将在资料发布后显示','Categories will appear once published','category-placeholder'));return;}for(const c of data.categories){const b=button(c.nameEn?bi(c.name,c.nameEn):c.name,()=>navigate('shops',{category:c.id}),'category-item'+(view==='shops'&&category===c.id?' selected':''),categoryIcon(c));b.setAttribute('aria-pressed',String(view==='shops'&&category===c.id));bar.append(b);}}
function card(stall,feature=false){const b=el('button','',feature?'shop-feature':'shop-card');b.type='button';b.setAttribute('aria-label',`查看${stall.name}详情`);b.append(photo(stall.photos[0],stall.name));const copy=el('div','',feature?'feature-copy':'card-copy');copy.append(el('h3',stall.name));if(!feature&&stall.code)copy.append(el('span',stall.code,'stall-code'));copy.append(el('p',stall.intro||'暂无店铺介绍 No shop intro yet'));if(feature)copy.append(icon('arrow-right'));b.append(copy);if(isPreview&&feature)b.append(el('span','示意','sample-tag'));b.onclick=()=>navigate('detail',{selected:stall.id});return b;}
function action(zhT,enT,symbol,callback,primary=false,artName=''){const b=el('button','','wayfinding'+(primary?' primary':''));b.type='button';const copy=el('span','','action-copy');const title=el('span','','action-title');title.append(bi(zhT,enT));copy.append(title);b.append(copy,icon('arrow-right','arrow'));if(artName){const img=el('img','','way-art');img.src=artFiles['../images/icon-'+artName+'.png'];img.alt='';b.append(img);}b.onclick=callback;return b;}
function home(){
 const stage=el('div','','home-stage');
 const dock=el('div','','home-dock');
 const h2=el('h2');h2.append(bi('逛市场，从这里开始','Start your market journey here','center'));
 const actions=el('div','','home-actions');
 actions.append(action('海鲜图鉴','Seafood Guide',null,()=>navigate('knowledge'),false,'home-knowledge'),action('看地图','Market map',null,()=>navigate('map'),false,'home-map'),action('找商户','Find shops',null,()=>navigate('shops'),false,'home-shops'),action('消费反馈','Feedback',null,()=>navigate('feedback'),false,'home-feedback'));
 dock.append(h2,actions);
 stage.append(dock);
 return stage;
}
function section(title,back=()=>navigate(fromView),en=''){const root=el('section','','section-view'),head=el('div','','section-heading'),h2=el('h2');h2.append(bi(title,en));head.append(h2);const backBtn=button(bi('返回','Back'),back,'back-button floating-back','arrow-left');root.append(head);return {root,head,backBtn};}
function homeFooter(backBtn){const homeBtn=button(bi('首页','Home'),()=>navigate('home'),'back-button floating-home','house');const footer=el('div','','section-footer');footer.append(homeBtn,backBtn);return footer;}
function filteredStalls(){const term=query.trim().toLocaleLowerCase();return data.stalls.filter(s=>(!category||s.categoryId===category)&&(!term||[s.name,s.nameEn,s.code,s.intro,...s.goods].some(v=>v.toLocaleLowerCase().includes(term))));}
function shopList(){const cat=data.categories.find(c=>c.id===category);/* 分类页返回→全部商户；全部商户页返回→上一级 */const {root,head,backBtn}=section(cat?.name||'全部商户',category?()=>navigate('shops',{category:''}):undefined,cat?.nameEn||'All shops');const grid=el('div','','shop-grid');const bar=el('nav','','category-bar local-cat-bar');if(!data.categories.length)bar.append(bi('商户分类将在资料发布后显示','Categories will appear once published','category-placeholder'));for(const c of data.categories){const b=button(c.nameEn?bi(c.name,c.nameEn):c.name,()=>navigate('shops',{category:c.id}),'category-item'+(category===c.id?' selected':''),categoryIcon(c));b.setAttribute('aria-pressed',String(category===c.id));bar.append(b);}function results(){grid.replaceChildren();const rows=filteredStalls();if(rows.length)grid.append(...rows.map(s=>card(s)));else grid.append(empty(bi('暂无已发布商户','No published shops yet'),bi('该分类有新的公开资料后，会显示在这里。','Listings will appear here once new public info is released.')));}results();const main=el('div','','section-main');main.append(head,grid);root.append(main,bar,homeFooter(backBtn));return root;}
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
 const location=stallLocation(data.floors,s),f=location?.floor,z=location?.area;
 if(f){const locationButton=button(bi(`查看位置 · ${f.name}${z?' / '+z.title:''}`,'View location'),()=>{floor=f.id;zone=z?.id||'';mapState.source=f.id;mapState.selected=zone;mapState.query='';navigate('map');},'quiet-button','map-trifold');locationButton.classList.add('detail-location');copy.append(locationButton);}
 content.append(photos,copy);root.append(content,homeFooter(backBtn));return root;
}
function marketMap(){
 const {root,head,backBtn}=section('市场导览',undefined,'Market map');
 const guide=createMarketMap({data,state:mapState,referenceEnabled:(window.ENTRANCE_CONFIG?.marketId||'mkt_001')==='mkt_001',onMerchant:id=>navigate('detail',{selected:id})});
 const main=el('div','','section-main');main.append(head,guide.element);root.append(main,homeFooter(backBtn));disposeMap=guide.destroy;return root;
}
function knowledge(){const {root,head,backBtn}=section('海鲜图鉴',undefined,'Seafood guide'),list=el('div','','knowledge-list');const labels=[['产地','Origin','origin'],['怎么吃','Cooking ideas','cooking'],['特点','Features','features']];const placeholder=()=>{const p=el('div','','photo-empty seafood-photo');p.append(icon('fish'),bi('暂无图片','No photo yet'));return p;};for(const k of data.encyclopedia){const item=el('article','','knowledge-item');const asset=k.photos?.[0];if(asset?.localUrl){const img=el('img','','seafood-photo');img.src=asset.localUrl;img.alt=k.name+'图片';img.addEventListener('error',()=>img.replaceWith(placeholder()),{once:true});item.append(img);}else item.append(placeholder());const copy=el('div','','seafood-copy');const h3=el('h3');h3.append(bi(k.name,k.nameEn||''));copy.append(h3);for(const [label,en,key]of labels){const h4=el('h4');h4.append(bi(label,en));copy.append(h4,el('p',k[key]||'暂无资料 No info yet'));}item.append(copy);list.append(item);}if(!list.children.length)list.append(empty(bi('海鲜图鉴待完善','Seafood guide coming soon'),bi('各类海鲜的介绍和图片将在管理处发布后显示在这里。','Seafood profiles and photos will appear here once published by the market office.'),'books'));const main=el('div','','section-main');main.append(head,list);root.append(main,homeFooter(backBtn));return root;}
function feedback(){
 const stage=el('div','','feedback-stage');
 const cloud=el('div','','feedback-cloud');
 const img=el('img','','feedback-cloud-img');img.src='./assets/images/shekou-wordcloud.png';img.alt='蛇口爱心词云：烟火气、慢节奏、松弛感、自在';
 cloud.append(img);
 const dock=el('div','','home-dock feedback-dock');
 const homeBtn=button(bi('首页','Home'),()=>navigate('home'),'back-button floating-home','house');
 const backBtn=button(bi('返回','Back'),()=>navigate(fromView),'back-button floating-back','arrow-left');
 const actions=el('div','','feedback-actions');
 actions.append(button(bi('满意度','Satisfaction'),()=>navigate('satisfaction'),'fb-btn'),button(bi('反馈意见','Your feedback'),()=>navigate('comment'),'fb-btn'),button(bi('蛇口印象','Shekou vibes'),()=>navigate('impression'),'fb-btn'));
 dock.append(homeBtn,actions,backBtn);
 stage.append(cloud,dock);
 return stage;
}
function heartRow(zh,en,store,key){
 const row=el('div','','fb-rating-row');
 const label=bi(zh,en);label.classList.add('fb-rating-label');
 const hearts=el('div','','fb-hearts');
 const filled=[false,false,false,false,false];
 const paint=()=>{[...hearts.children].forEach((h,i)=>h.classList.toggle('filled',filled[i]))};
 for(let i=0;i<5;i++){
  const h=el('button','','fb-heart');h.type='button';h.setAttribute('aria-label',`${zh} ${i+1}/5`);
  h.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"/></svg>';
  h.onclick=()=>{const target=i+1;let count=0;if(filled.filter(Boolean).length===target){filled.fill(false);}else{for(let k=0;k<5;k++)filled[k]=k<target;count=target;}if(store)store[key]=count;lastAction=Date.now();paint();};
  hearts.append(h);
 }
 paint();
 row.append(label,hearts);
 return row;
}
function fbSubPage(build){
 const stage=el('div','','fb-sub-stage');
 const cloud=el('div','','feedback-cloud');
 const img=el('img','','feedback-cloud-img');img.src='./assets/images/shekou-wordcloud.png';img.alt='蛇口爱心词云：烟火气、慢节奏、松弛感、自在';
 cloud.append(img);
 const body=el('div','','fb-sub-body');
 build(body);
 const dock=el('div','','home-dock feedback-dock');
 const homeBtn=button(bi('首页','Home'),()=>navigate('home'),'back-button floating-home','house');
 const backBtn=button(bi('返回','Back'),()=>navigate('feedback'),'back-button floating-back','arrow-left');
 dock.append(homeBtn,backBtn);
 stage.append(cloud,body,dock);
 return stage;
}
function satisfaction(){const ratings={env:0,merchant:0,staff:0};return fbSubPage(body=>{const title=el('div','','fb-sub-title');title.append(bi('满意度','Satisfaction','center'));body.append(title,heartRow('环境','Environment',ratings,'env'),heartRow('商户服务态度','Merchant service',ratings,'merchant'),heartRow('市场工作人员服务态度','Market staff service',ratings,'staff'));const tip=el('div','','fb-tip');tip.append(bi('请填写后再提交哦','Please tap hearts before submitting','center'));tip.hidden=true;let tipTimer;const submit=el('button','','fb-btn fb-submit');submit.type='button';submit.append(bi('提交','Submit'));submit.onclick=async()=>{lastAction=Date.now();if(!ratings.env&&!ratings.merchant&&!ratings.staff){tip.hidden=false;clearTimeout(tipTimer);tipTimer=setTimeout(()=>{tip.hidden=true;},3000);return;}try{await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'satisfaction',env:ratings.env,merchant:ratings.merchant,staff:ratings.staff})});}catch{/* 离线也不影响感谢流程 */}const thanks=el('div','','fb-thanks');thanks.append(bi('感谢您的反馈','Thanks for your feedback','center'));body.replaceChildren(thanks);setTimeout(()=>navigate('feedback'),2000);};body.append(submit,tip);});}
function comment(){return textFeedbackPage('comment','轻点此处，用屏幕键盘输入您的意见反馈 Tap here and type with the on-screen keyboard','意见反馈输入框');}
function impression(){return textFeedbackPage('impression','轻点此处，用屏幕键盘写下您的蛇口印象 Tap here and share your impression of Shekou','蛇口印象输入框');}
/* 文本反馈子页共享构建器：comment/impression 同款设计，apiType 区分后台数据通道 */
function textFeedbackPage(apiType,placeholder,ariaLabel){return fbSubPage(body=>{
 const box=el('textarea','','fb-comment-box');box.rows=4;box.placeholder=placeholder;box.setAttribute('aria-label',ariaLabel);
 /* 多平台系统键盘接入点：触摸设备(Win/Android/iPad)聚焦输入框会自动唤起系统键盘与输入法；Chromium 支持 VirtualKeyboard API 时主动请求弹出 */
 box.addEventListener('focus',()=>{lastAction=Date.now();try{navigator.virtualKeyboard?.show?.();}catch{/* 平台不支持时依赖系统自动弹出 */}});
 const tip=el('div','','fb-tip');tip.append(bi('请输入后再提交哦','Please type before submitting','center'));tip.hidden=true;let tipTimer;
 const submit=el('button','','fb-btn fb-submit');submit.type='button';submit.append(bi('提交','Submit'));
 submit.onclick=async()=>{lastAction=Date.now();const v=box.value.trim();if(!v){tip.hidden=false;clearTimeout(tipTimer);tipTimer=setTimeout(()=>{tip.hidden=true;},3000);return;}try{await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:apiType,text:v})});}catch{/* 离线不影响流程 */}const thanks=el('div','','fb-thanks');thanks.append(bi('感谢您的反馈','Thanks for your feedback','center'));body.replaceChildren(thanks);setTimeout(()=>navigate('feedback'),2000);};
 body.append(box,submit,tip);
});}
function render(){document.body.classList.toggle('map-view',view==='map');document.body.classList.toggle('knowledge-view',view==='knowledge');document.body.classList.toggle('home-view',view==='home');document.body.classList.toggle('feedback-view',view==='feedback');document.body.classList.toggle('shops-view',view==='shops');document.body.classList.toggle('satisfaction-view',view==='satisfaction');document.body.classList.toggle('comment-view',view==='comment');document.body.classList.toggle('impression-view',view==='impression');disposeMap?.();disposeMap=null;clearTimeout(rotationTimer);if(view==='home')startHomeMedia();else stopHomeMedia();$('marketName').textContent=data.market?.name||'蛇口市场';$('main').replaceChildren(({home,shops:shopList,detail:details,map:marketMap,knowledge,feedback,satisfaction,comment,impression}[view]||home)());renderBar();scheduleRotation();}
$('brandHome').onclick=()=>navigate('home');for(const event of ['pointerdown','keydown','wheel'])document.addEventListener(event,()=>{lastAction=Date.now();},{passive:true});
function clock(){const now=new Date();const zh=now.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'});const en=now.toLocaleDateString('en-US',{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short'});const dt=$('dateText');dt.dateTime=now.toISOString();dt.replaceChildren(el('span',zh),' · ',el('span',en,'en'));const hd=$('homeDate');if(hd){hd.dateTime=now.toISOString();hd.replaceChildren(el('span',zh),' · ',el('span',en,'en'));}if(view!=='home'&&Date.now()-lastAction>120000)navigate('home');}clock();setInterval(clock,1000);
render();
if(isPreview){$('previewNotice').hidden=false;const {previewData}=await import('./design-preview.js');data=previewData;loadState='ready';const v=new URLSearchParams(location.search).get('view');if(v&&['home','shops','map','knowledge','feedback','satisfaction','comment','impression'].includes(v))view=v;$('syncStatus').textContent='设计示意 Design preview · 非真实商户资料 Not real merchants';render();}
else {const config=window.ENTRANCE_CONFIG||{};client=createMarketClient({apiBase:config.apiBase||'',marketId:config.marketId||'mkt_001',onData(next){data=next;loadState='ready';render();},onStatus(message,state){loadState=state;$('syncStatus').textContent=message;if(view==='home'&&!data.stalls.length)render();}});void client.start();window.addEventListener('online',()=>client.refresh());window.addEventListener('pagehide',event=>{if(!event.persisted)client.stop();});if('serviceWorker'in navigator&&!import.meta.env.DEV)navigator.serviceWorker.register(new URL('sw.js',document.baseURI)).catch(()=>{$('syncStatus').textContent+=' · 离线页面缓存不可用';});}
