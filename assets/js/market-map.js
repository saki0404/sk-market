import planUrl from '../images/shekou-floor-1-reference.jpg';
import '../css/market-map.css';
import {referencePlan,referenceAreas} from './map-reference.js';
import {zoneMerchants,matchesMapQuery,fitBounds,clampView,zoomView} from './map-model.js';

const node=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
const svgNode=(tag,attrs={})=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,String(value));return n;};
function label(zh,en){const n=node('span','','guide-label');n.append(node('span',zh),node('small',en));return n;}
function button(zh,en,run,cls='guide-button'){const n=node('button','',cls);n.type='button';n.append(label(zh,en));n.onclick=run;return n;}

export function createMarketMap({data,state,onMerchant,referenceEnabled=true}){
 const root=node('div','','guide'),tabs=node('div','','guide-tabs'),toolbar=node('div','','guide-toolbar');
 const body=node('div','','guide-body'),stage=node('div','','guide-stage'),side=node('aside','','guide-side');
 const search=node('input'),results=node('div','','guide-results'),info=node('div','','guide-info'),caption=node('p','','guide-caption');
 const svg=svgNode('svg',{'aria-label':'市场地图：拖动平移，使用放大缩小按钮查看细节',tabindex:0});
 const art=svgNode('g'),overlay=svgNode('g');svg.append(art,overlay);stage.append(svg);
 search.type='search';search.placeholder='找品类、设施 / Find a zone';search.setAttribute('aria-label','搜索地图品类、设施或已发布商户');search.value=state.query||'';
 const searchBox=node('label','','guide-search');searchBox.append(label('想去哪里？','Where to?'),search);
 side.append(searchBox,info,results);body.append(stage,side);root.append(tabs,toolbar,body,caption);
 let currentFloor,world,view,baseWidth,selectedArea,part=0,disposed=false,resizeFrame;
 const points=new Map();let gesture=null,moved=false,pressedZone;
 if(!referenceEnabled&&state.source==='reference')state.source='';
 if(!state.source)state.source=referenceEnabled?'reference':data.floors[0]?.id;
 if(state.source!=='reference'&&!data.floors.some(f=>f.id===state.source))state.source=referenceEnabled?'reference':data.floors[0]?.id;
 const isReference=()=>state.source==='reference';
 const areas=()=>isReference()?referenceAreas:(currentFloor?.zones||[]);
 const merchants=area=>isReference()?[]:zoneMerchants(data.stalls,currentFloor.id,area.id);
 function drawView(){if(!view)return;svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.width} ${view.height}`);zoomOut.disabled=view.width>=baseWidth*1.99;zoomIn.disabled=view.width<=world.width/12*1.01;}
 function aspect(){return Math.max(.2,stage.clientWidth/Math.max(1,stage.clientHeight));}
 function fit(bounds){view=fitBounds(bounds,aspect(),24);view=clampView(view,world);drawView();}
 function reset(all=false){if(!world)return;fit(isReference()&&!all?referencePlan.focus:{x:0,y:0,...world});}
 function zoom(factor,anchor={x:.5,y:.5}){if(!view)return;view=zoomView(view,factor,anchor,world,world.width/12,baseWidth*2);drawView();}
 const zoomIn=button('＋','Zoom in',()=>zoom(1.5));zoomIn.setAttribute('aria-label','放大地图');
 const zoomOut=button('−','Zoom out',()=>zoom(1/1.5));zoomOut.setAttribute('aria-label','缩小地图');
 const expand=button('展开地图','Expand',()=>{state.expanded=!state.expanded;applyExpanded();});
 const west=button('西侧附区','West wing',()=>fit(referencePlan.west));
 toolbar.append(zoomOut,zoomIn,button('复位','Reset',()=>reset()),west,button('完整图纸','Full plan',()=>reset(true)),expand);
 function applyExpanded(){root.classList.toggle('is-expanded',!!state.expanded);expand.replaceChildren(label(state.expanded?'收起地图':'展开地图',state.expanded?'Collapse':'Expand'));expand.setAttribute('aria-expanded',String(!!state.expanded));}
 applyExpanded();
 function renderTabs(){tabs.replaceChildren();if(referenceEnabled)tabs.append(sourceTab('reference','一层参考图','Reference plan'));for(const f of data.floors)tabs.append(sourceTab(f.id,f.name,f.nameEn||'Published layout'));}
 function sourceTab(id,zh,en){const b=button(zh,en,()=>{state.source=id;state.selected='';state.query='';search.value='';loadSource();});b.setAttribute('aria-pressed',String(state.source===id));return b;}
 function activate(area,focus=true){state.selected=area.id;selectedArea=area;part=0;drawSelection();renderInfo();renderResults();if(focus)focusArea();}
 function focusArea(){const boxes=isReference()?selectedArea?.boxes:selectedArea?[selectedArea]:[];if(boxes?.length)fit(boxes[part%boxes.length]);else reset(true);}
 function drawSelection(){
  overlay.replaceChildren();
  if(!selectedArea)return;
  const boxes=isReference()?selectedArea.boxes:[selectedArea];
  boxes.forEach((b,i)=>{const r=svgNode('rect',{...b,fill:'none',stroke:'#173f28','stroke-width':4,'vector-effect':'non-scaling-stroke',rx:3});r.classList.add('guide-highlight');overlay.append(r);
   if(isReference()){const t=svgNode('text',{x:b.x+5,y:b.y-8,fill:'#173f28','font-size':20,'font-weight':800,stroke:'#fff','stroke-width':5,'paint-order':'stroke'});t.textContent=String(i+1);overlay.append(t);}
  });
 }
 function renderInfo(){
  info.replaceChildren();info.setAttribute('aria-live','polite');
  if(!selectedArea){info.append(label(isReference()?'一层 · 分区导览':'选择一个区域',isReference()?'First floor · Zone guide':'Choose a zone'),node('p',isReference()?'选择下方品类，放大查看参考位置。可拖动地图或双指缩放。':'点选地图或搜索店名、编号，查看已发布的区域与商户。'));return;}
  info.append(label(selectedArea.title,selectedArea.titleEn||''));
  if(isReference()){
   const count=selectedArea.boxes.length;
   info.append(node('p',count?`已标出 ${count} 处参考区域，具体摊位请放大原图查看。`:'此品类见原图图例，请放大图纸并以现场指引为准。'));
   if(count){const row=node('div','','guide-location-actions');row.append(button('定位此处','Locate',focusArea));if(count>1)row.append(button('下一处','Next area',()=>{part=(part+1)%count;focusArea();status.textContent=`参考位置 ${part+1} / ${count}`;}));const status=node('span',`参考位置 ${part+1} / ${count}`);row.append(status);info.append(row);}
  }else{
   if(selectedArea.description)info.append(node('p',selectedArea.description));
   const shops=merchants(selectedArea);info.append(node('p',shops.length?`${shops.length} 家已发布商户 / Published shops`:'本区域暂无已发布商户资料。'));
   for(const s of shops)info.append(button(s.name+(s.code?' · '+s.code:''),s.nameEn||'View shop',()=>onMerchant(s.id),'guide-shop'));
  }
 }
 function renderResults(){
  results.replaceChildren();const matches=areas().filter(a=>matchesMapQuery(a,state.query||'',merchants(a)));
  if(!matches.length)results.append(node('p','没有找到匹配项，试试其他品类或名称。'));
  for(const a of matches){const b=button(a.title,a.titleEn||'',()=>activate(a),'guide-result');b.setAttribute('aria-pressed',String(a.id===state.selected));const dot=node('span','','guide-swatch');dot.style.background=a.color||'#b8c8aa';b.prepend(dot);if(a.facility)b.classList.add('is-facility');results.append(b);}
 }
 function loadSource(){
  points.clear();gesture=null;art.replaceChildren();overlay.replaceChildren();currentFloor=data.floors.find(f=>f.id===state.source);world=isReference()?{width:referencePlan.width,height:referencePlan.height}:currentFloor?{width:currentFloor.width,height:currentFloor.height}:null;
  renderTabs();search.placeholder=isReference()?'找品类、设施 / Find a zone':'找区域、店名、编号 / Find a shop';
  if(!world){info.replaceChildren(node('p','管理处尚未发布市场布局。'));results.replaceChildren();toolbar.hidden=true;caption.textContent='暂无已发布地图 / No published layout';return;}
  toolbar.hidden=false;west.hidden=!isReference();
  baseWidth=fitBounds({x:0,y:0,...world},aspect(),24).width;
  if(isReference()){
   const image=svgNode('image',{href:planUrl,x:0,y:0,width:world.width,height:world.height});image.addEventListener('error',()=>{info.replaceChildren(node('p','参考图暂时无法载入，请刷新页面重试。'));});art.append(image);
   caption.textContent='用户提供的一层参考图 · 高亮为部分参考区域，非实时商户位置；以现场指引为准。 / Reference only';
  }else{
   art.append(svgNode('rect',{x:0,y:0,...world,fill:'#f5f2e9'}));
   for(const z of currentFloor.zones){const g=svgNode('g',{role:'button',tabindex:0,'data-zone-id':z.id,'aria-label':z.title});g.classList.add('guide-zone');g.append(svgNode('rect',{x:z.x,y:z.y,width:z.width,height:z.height,fill:'#d8e4ce',stroke:'#fff','stroke-width':3,rx:8}));const t=svgNode('text',{x:z.x+z.width/2,y:z.y+z.height/2,'text-anchor':'middle','dominant-baseline':'middle','font-size':Math.min(28,z.height/4,z.width/Math.max(3,z.title.length))});t.textContent=z.title;g.append(t);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();activate(z);}};art.append(g);}
   caption.textContent=(currentFloor.schematic?'已发布示意布局 · 以现场指引为准':'管理处已发布布局')+' · 仅展示明确绑定此楼层和区域的商户 / Published zones';
  }
  selectedArea=areas().find(a=>a.id===state.selected);renderInfo();renderResults();drawSelection();reset();if(selectedArea)focusArea();
 }
 search.oninput=()=>{state.query=search.value;renderResults();};
 const position=e=>{const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
 function startGesture(){const p=[...points.values()];gesture=p.length===1?{view:{...view},point:p[0]}:p.length===2?{view:{...view},center:{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},distance:Math.hypot(p[0].x-p[1].x,(p[0].y-p[1].y)/aspect())}:null;}
 svg.onpointerdown=e=>{if(!view||e.button>0)return;moved=false;pressedZone=e.target.closest('.guide-zone')?.getAttribute('data-zone-id');points.set(e.pointerId,position(e));svg.setPointerCapture(e.pointerId);startGesture();};
 svg.onpointermove=e=>{if(!points.has(e.pointerId)||!gesture)return;points.set(e.pointerId,position(e));const p=[...points.values()];if(p.length===1){const dx=p[0].x-gesture.point.x,dy=p[0].y-gesture.point.y;if(Math.abs(dx)+Math.abs(dy)>.008)moved=true;view=clampView({...gesture.view,x:gesture.view.x-dx*gesture.view.width,y:gesture.view.y-dy*gesture.view.height},world);}else if(p.length===2&&gesture.distance){moved=true;const center={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},distance=Math.hypot(p[0].x-p[1].x,(p[0].y-p[1].y)/aspect());view=zoomView(gesture.view,distance/gesture.distance,gesture.center,world,world.width/12,baseWidth*2);view=clampView({...view,x:view.x+(gesture.center.x-center.x)*view.width,y:view.y+(gesture.center.y-center.y)*view.height},world);}drawView();};
 const endPointer=e=>{if(e.type==='pointerup'&&!moved&&points.size===1&&pressedZone){const a=areas().find(a=>a.id===pressedZone);if(a)activate(a);}pressedZone=null;points.delete(e.pointerId);startGesture();};svg.onpointerup=endPointer;svg.onpointercancel=endPointer;
 svg.addEventListener('wheel',e=>{if(!view)return;e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15,position(e));},{passive:false});
 svg.onkeydown=e=>{if(!view)return;if(['+','=','-','Home','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='Home')reset();else if(e.key==='+'||e.key==='=')zoom(1.5);else if(e.key==='-')zoom(1/1.5);else{const dx=e.key==='ArrowLeft'?-.1:e.key==='ArrowRight'?.1:0,dy=e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0;view=clampView({...view,x:view.x+dx*view.width,y:view.y+dy*view.height},world);drawView();}}};
 const onEscape=e=>{if(e.key==='Escape'&&state.expanded){state.expanded=false;applyExpanded();expand.focus();}};document.addEventListener('keydown',onEscape);
 const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(disposed||!world)return;baseWidth=fitBounds({x:0,y:0,...world},aspect(),24).width;if(view){const old=view;view=fitBounds(old,aspect());drawView();}else reset();});});observer.observe(stage);
 // Mount first so the initial fit uses actual screen dimensions.
 const initialFrame=requestAnimationFrame(()=>{if(!disposed)loadSource();});
 return {element:root,destroy(){disposed=true;observer.disconnect();cancelAnimationFrame(initialFrame);cancelAnimationFrame(resizeFrame);document.removeEventListener('keydown',onEscape);}};
}
