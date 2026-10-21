import panzoom from 'panzoom';
import '../css/market-map.css';
import {referencePlan,annexPlan,referenceAreas,mapFamilies} from './map-reference.js';
import {zoneMerchants,matchesMapQuery} from './map-model.js';
import {drawScene,svgNode} from './map-scene.js';
const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n;};
function label(zh,en){const n=el('span','','mall-label');n.append(el('span',zh));if(en)n.append(el('small',en));return n;}
function button(zh,en,run,cls='mall-button'){const b=el('button','',cls);b.type='button';b.append(label(zh,en));b.onclick=run;return b;}

export function createMarketMap({data,state,onMerchant,referenceEnabled=true}){
 const root=el('div','','mall-guide'),top=el('div','','mall-top'),filters=el('div','','mall-filters');
 const searchLabel=el('label','','mall-search'),search=el('input'),source=el('select'),clear=button('清除','Clear',()=>{search.value='';state.query='';updateResults();});
 search.type='search';search.value=state.query||'';search.placeholder='想买什么？搜鱼虾、蔬菜、店名或编号';search.setAttribute('aria-label','搜索品类、商户或摊位编号');
 searchLabel.append(el('span','⌕','mall-search-symbol'),search);top.append(searchLabel,clear,source);source.setAttribute('aria-label','选择市场地图');
 const viewport=el('div','','mall-viewport'),svg=svgNode('svg',{'aria-label':'一层市场导览，轻触区域查看，拖动或双指缩放',tabindex:0}),scene=svgNode('g');svg.append(scene);viewport.append(svg);
 const zoomBar=el('div','','mall-zoom'),level=el('span','1F','mall-level');viewport.append(level,zoomBar);
 const panel=el('section','','mall-panel'),intro=el('div','','mall-intro'),results=el('div','','mall-results');panel.append(intro,results);
 const note=el('p','','mall-note');root.append(top,filters,viewport,panel,note);
 let floor,world,areas=[],selectedArea,part=0,pz,fitScale=1,disposed=false,frame,resizeFrame;
 state.family=state.family||'all';state.plan=state.plan||'main';
 if(!referenceEnabled&&state.source==='reference')state.source='';
 if(!state.source||state.source!=='reference'&&!data.floors.some(f=>f.id===state.source))state.source=referenceEnabled?'reference':data.floors[0]?.id;
 const isDiagram=()=>state.source==='reference';
 const boundsFor=a=>isDiagram()?a.boxes.filter(b=>b.plan===state.plan):[a];
 const associated=a=>isDiagram()?[]:zoneMerchants(data.stalls,floor.id,a.id);
 const all=button('全图','Overview',()=>{state.selected='';state.family='all';state.query='';search.value='';selectedArea=null;part=0;updateFilters();updateHighlight();updateResults();fitWorld();});
 const minus=button('−','缩小',()=>zoom(1/1.35)),plus=button('＋','放大',()=>zoom(1.35));
 minus.setAttribute('aria-label','缩小地图');plus.setAttribute('aria-label','放大地图');
 const expand=button('展开','Expand',()=>{state.expanded=!state.expanded;applyExpanded();});zoomBar.append(plus,minus,all,expand);
 function applyExpanded(){root.classList.toggle('is-expanded',!!state.expanded);expand.replaceChildren(label(state.expanded?'收起':'展开',state.expanded?'Collapse':'Expand'));expand.setAttribute('aria-expanded',String(!!state.expanded));}
 applyExpanded();
 function fit(bounds){
  if(!pz||!world)return;
  const pad=16,w=viewport.clientWidth,h=viewport.clientHeight;
  const scale=Math.min((w-pad*2)/Math.max(bounds.width,150),(h-pad*2)/Math.max(bounds.height,120),fitScale*3.4);
  const cx=bounds.x+bounds.width/2,cy=bounds.y+bounds.height/2,s=Math.max(.05,scale);
  // Set the target rectangle atomically: bounds-constrained zoomAbs can reject a
  // scale change near an edge, leaving a following moveTo at the wrong scale.
  pz.showRectangle({left:cx-w/(2*s),right:cx+w/(2*s),top:cy-h/(2*s),bottom:cy+h/(2*s)});
  const transform=pz.getTransform();pz.moveTo(transform.x,transform.y);
 }
 function fitWorld(){if(world)fit(isDiagram()&&state.plan==='main'?{x:0,y:40,width:1360,height:620}:{x:0,y:0,...world});}
 function focusArea(){const boxes=selectedArea?boundsFor(selectedArea):[];if(boxes.length)fit(boxes[part%boxes.length]);}
 function zoom(factor){if(pz)pz.zoomTo(viewport.clientWidth/2,viewport.clientHeight/2,factor);}
 function updateHighlight(){
  for(const g of scene.querySelectorAll('.mall-zone')){
   const a=areas.find(a=>a.id===g.dataset.area),hasSelection=selectedArea&&boundsFor(selectedArea).length,active=hasSelection?g.dataset.area===selectedArea.id:state.family!=='all'&&a?.family===state.family,dim=hasSelection?!active:state.family!=='all'&&!active;
   g.classList.toggle('is-selected',!!active);g.classList.toggle('is-muted',!!dim);g.setAttribute('aria-pressed',String(!!active));
  }
 }
 function selectArea(a,index=0){
  state.query='';search.value='';
  if(isDiagram()&&!a.boxes.some(b=>b.plan===state.plan)&&a.boxes.length){state.plan=a.boxes[0].plan;state.selected=a.id;load();return;}
  selectedArea=a;state.selected=a.id;part=index;updateHighlight();updateResults();
 }
 function updateFilters(){
  filters.replaceChildren();const choices=isDiagram()?mapFamilies:[{id:'all',title:'全部区域',en:'All zones',color:'#718678'}];
  for(const f of choices){const b=button(f.title,f.en,()=>{state.family=f.id;state.selected='';selectedArea=null;search.value='';state.query='';updateFilters();updateHighlight();updateResults();fitWorld();},'mall-chip');b.setAttribute('aria-pressed',String(state.family===f.id));const dot=el('i');dot.style.background=f.color;b.prepend(dot);filters.append(b);}
 }
 function showMerchant(s){const f=data.floors.find(f=>f.id===s.floorId),z=f?.zones.find(z=>z.id===s.zoneId);if(f&&z){state.source=f.id;state.selected=z.id;state.family='all';state.query='';search.value='';load();}else onMerchant(s.id);}
 function merchantCard(s){const f=data.floors.find(f=>f.id===s.floorId),located=f?.zones.some(z=>z.id===s.zoneId);const b=button(s.name+(s.code?' · '+s.code:''),located?'查看位置 · View on map':'位置待标注 · 查看介绍',()=>showMerchant(s),'mall-result');b.classList.add('mall-merchant');return b;}
 function updateResults(){
  results.replaceChildren();intro.replaceChildren();clear.hidden=!search.value;const q=(state.query||'').trim();
  if(selectedArea&&!q){
   intro.append(label(selectedArea.title,selectedArea.titleEn||''));
   if(isDiagram()){
    const boxes=boundsFor(selectedArea),actions=el('div','','mall-detail-actions');intro.append(el('p',boxes.length?'已在地图中高亮。各摊位经营情况以现场为准。':'此品类尚未确认位置，请咨询现场工作人员。'));
    if(boxes.length){actions.append(button('放大查看','Locate',focusArea));if(boxes.length>1)actions.append(button(`下一处 · ${part+1}/${boxes.length}`,'Next location',()=>{part=(part+1)%boxes.length;focusArea();updateResults();}));results.append(actions);}
   }else{
    intro.append(el('p',selectedArea.description||'管理处已发布的市场区域。'));const shops=associated(selectedArea);
    for(const s of shops)results.append(button(s.name+(s.code?' · '+s.code:''),s.nameEn||'查看商户介绍',()=>onMerchant(s.id),'mall-result'));
    if(!shops.length)results.append(el('p','本区域暂无已发布的商户介绍。','mall-help'));
   }return;
  }
  const catalog=isDiagram()?referenceAreas:areas,matches=catalog.filter(a=>(state.family==='all'||a.family===state.family)&&matchesMapQuery(a,q,associated(a)));
  const shops=q?data.stalls.filter(s=>matchesMapQuery({title:s.name,titleEn:s.nameEn},q,[s])):[];
  intro.append(label(q?'搜索结果':state.family==='all'?'今天想买点什么？':mapFamilies.find(f=>f.id===state.family)?.title||'选择区域',q?'Search results':'Tap a zone to explore'));
  intro.append(el('p',q?`${matches.length} 个品类 / 区域，${shops.length} 家已发布商户`:'点选地图或上方分类，快速找到想逛的区域。'));
  for(const s of shops)results.append(merchantCard(s));
  for(const a of matches){
   if(!q&&state.family==='all'&&!['seafood','vegetables','pork','beef','snacks','stairs'].includes(a.id)&&isDiagram())continue;
   const b=button(a.title,a.titleEn,()=>{state.query='';search.value='';selectArea(a);},'mall-result'),dot=el('i');dot.style.background=a.color||'#718678';b.prepend(dot);if(isDiagram()&&!a.boxes.length)b.append(el('small','位置待确认'));results.append(b);
  }
  if(!matches.length&&!shops.length)results.append(el('p','没有找到匹配项，试试“鱼”“青菜”或摊位编号。','mall-help'));
 }
 function buildSources(){
  source.replaceChildren();const option=(value,title)=>{const o=el('option',title);o.value=value;source.append(o);};
  if(referenceEnabled){option('reference:main','1F · 主市场');option('reference:annex','1F · 西侧附区');}
  data.floors.forEach(f=>option('published:'+f.id,f.name+' · 已发布'));source.value=isDiagram()?'reference:'+state.plan:'published:'+state.source;
 }
 function load(){
  pz?.dispose();pz=null;floor=data.floors.find(f=>f.id===state.source);world=isDiagram()?(state.plan==='annex'?annexPlan:referencePlan):floor;areas=isDiagram()?referenceAreas:floor?.zones||[];
  buildSources();updateFilters();if(!world){scene.replaceChildren();intro.replaceChildren(label('地图资料待发布','Map coming soon'));results.replaceChildren();zoomBar.hidden=true;note.textContent='管理处发布布局后将在这里展示。';return;}
  zoomBar.hidden=false;selectedArea=areas.find(a=>a.id===state.selected);drawScene(scene,{areas,plan:state.plan,world,published:!isDiagram(),onSelect:selectArea});
  level.textContent=isDiagram()?'1F':floor.name;note.textContent=isDiagram()?'依据市场平面图简化绘制 · 非等比例 · 以现场标识为准':'管理处已发布的楼层与区域 · 商户资料以最新发布内容为准';
  fitScale=Math.min((viewport.clientWidth-52)/world.width,(viewport.clientHeight-52)/world.height);
  pz=panzoom(scene,{bounds:true,boundsPadding:.15,minZoom:Math.max(.05,fitScale*.65),maxZoom:Math.max(.2,fitScale*5),smoothScroll:false,zoomDoubleClickSpeed:1,zoomSpeed:.12,pinchSpeed:1});
  pz.on('transform',()=>{const scale=pz?.getTransform().scale||fitScale;svg.classList.toggle('is-zoomed',scale>fitScale*1.45);plus.disabled=scale>=fitScale*4.99;minus.disabled=scale<=fitScale*.66;});updateHighlight();updateResults();fitWorld();if(selectedArea)focusArea();
 }
 // Pointer taps are independent of panzoom's short-click timeout, so a deliberate
 // touch held for more than 200 ms still selects a zone. Drags/pinches never select.
 const pointers=new Set();let tap=null;
 svg.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);const g=e.target.closest?.('[data-area]');tap=pointers.size===1&&e.button===0&&g?{id:g.dataset.area,part:Number(g.dataset.part)||0,x:e.clientX,y:e.clientY,pointer:e.pointerId}:null;});
 svg.addEventListener('pointermove',e=>{if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>6)tap=null;});
 svg.addEventListener('pointerup',e=>{const chosen=tap;pointers.delete(e.pointerId);tap=null;if(chosen&&chosen.pointer===e.pointerId){const a=areas.find(a=>a.id===chosen.id);if(a)selectArea(a,chosen.part);}});
 svg.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);tap=null;});
 svg.addEventListener('pointerleave',()=>{pointers.clear();tap=null;});
 source.onchange=()=>{const v=source.value;if(v.startsWith('reference:')){state.source='reference';state.plan=v.slice(10);}else state.source=v.slice(10);state.selected='';state.family='all';state.query='';search.value='';load();};
 search.oninput=()=>{state.query=search.value;selectedArea=null;state.selected='';state.family='all';updateFilters();updateHighlight();updateResults();};
 const escape=e=>{if(e.key==='Escape'&&state.expanded){state.expanded=false;applyExpanded();expand.focus();}};document.addEventListener('keydown',escape);
 svg.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();fitWorld();}});
 const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(disposed||!world||!pz)return;fitScale=Math.min((viewport.clientWidth-52)/world.width,(viewport.clientHeight-52)/world.height);pz.setMinZoom(Math.max(.05,fitScale*.65));pz.setMaxZoom(Math.max(.2,fitScale*5));if(selectedArea)focusArea();else fitWorld();});});resize.observe(viewport);
 frame=requestAnimationFrame(()=>{if(!disposed)load();});return {element:root,destroy(){disposed=true;pz?.dispose();resize.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);document.removeEventListener('keydown',escape);}};
}
