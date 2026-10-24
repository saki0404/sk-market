import panzoom from 'panzoom';
import '../css/market-map.css';
import {referenceAreas,mapFamilies} from './map-reference.js';
import {layoutReference} from './reference-layout.js';
import {publishedAreas,areaMerchants} from './map-model.js';
import {glyph} from './map-glyph.js';
import {drawScene,svgNode} from './map-scene.js';
const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n;};
function label(zh,en){const n=el('span','','mall-label');n.append(el('span',zh));if(en)n.append(el('small',en));return n;}
function button(zh,en,run,cls='mall-button',icon){const b=el('button','',cls);b.type='button';if(icon)b.append(glyph(icon));b.append(label(zh,en));b.onclick=run;return b;}

export function createMarketMap({data,state,onMerchant,referenceEnabled=true}){
 const root=el('div','','mall-guide'),viewport=el('section','','mall-viewport');
 const heading=el('header','','mall-map-heading'),headingCopy=el('div','','mall-heading-copy'),level=el('span','1F','mall-level');
 headingCopy.append(el('h1','蛇口市场 · 主市场'));
 const note=el('p','','mall-note'),brand=el('img','','mall-brand');brand.src=new URL('../images/workbuddy-logo.png',import.meta.url).href;brand.alt='WorkBuddy';
 heading.append(level,headingCopy,note,brand);
 const svg=svgNode('svg',{'aria-label':'一层市场导览，轻触区域查看，拖动或双指缩放',tabindex:0}),scene=svgNode('g');svg.append(scene);viewport.append(heading,svg);
 const dock=el('div','','mall-dock'),filters=el('nav','','mall-filters'),toolbar=el('div','','mall-toolbar'),sources=el('nav','','mall-sources'),zoomBar=el('div','','mall-zoom');
 filters.setAttribute('aria-label','选择想逛的品类');sources.setAttribute('aria-label','选择市场地图');zoomBar.setAttribute('aria-label','地图操作');
 const panel=el('section','','mall-panel'),intro=el('div','','mall-intro'),results=el('div','','mall-results');intro.setAttribute('aria-live','polite');panel.append(intro,results);
 const controls=el('div','','mall-controls');toolbar.append(sources,zoomBar);controls.append(filters,toolbar);dock.append(panel,controls);root.append(viewport,dock);
 let floor,world,overviewBounds,areas=[],selectedArea,part=0,pz,fitScale=1,focused=!!state.selected,disposed=false,frame,resizeFrame;
 state.family=state.family||'all';state.plan=state.plan||'main';state.query='';
 if(!referenceEnabled&&state.source==='reference')state.source='';
 if(!state.source||state.source!=='reference'&&!data.floors.some(f=>f.id===state.source))state.source=referenceEnabled?'reference':data.floors[0]?.id;
 const isDiagram=()=>state.source==='reference';
 const boundsFor=a=>isDiagram()?a.boxes.filter(b=>b.plan===state.plan):[a];
 const associated=a=>isDiagram()?[]:areaMerchants(data.stalls,floor,a);
 const all=button('全图','',()=>{state.selected='';state.family='all';selectedArea=null;part=0;focused=false;updateFilters();updateHighlight();updateResults();fitWorld();},'mall-button','overview');
 const minus=button('缩小','',()=>zoom(1/1.35),'mall-button','zoom-out'),plus=button('放大','',()=>zoom(1.35),'mall-button','zoom-in');
 minus.setAttribute('aria-label','缩小地图');plus.setAttribute('aria-label','放大地图');
 zoomBar.append(minus,plus,all);
 function fit(bounds){
  if(!pz||!world)return;
  const pad=10,w=svg.clientWidth,h=svg.clientHeight;
  const scale=Math.min((w-pad*2)/Math.max(bounds.width,150),(h-pad*2)/Math.max(bounds.height,120),fitScale*3.4);
  const cx=bounds.x+bounds.width/2,cy=bounds.y+bounds.height/2,s=Math.max(.05,scale);
  // Apply translation and scale together so edge constraints cannot reject one half.
  pz.showRectangle({left:cx-w/(2*s),right:cx+w/(2*s),top:cy-h/(2*s),bottom:cy+h/(2*s)});
  const transform=pz.getTransform();pz.moveTo(transform.x,transform.y);
 }
 function fitWorld(){if(world)fit(isDiagram()?overviewBounds:{x:0,y:0,...world});}
 function focusArea(){const boxes=selectedArea?boundsFor(selectedArea):[];if(boxes.length){focused=true;fit(boxes[part%boxes.length]);}}
 function zoom(factor){if(pz)pz.zoomTo(svg.clientWidth/2,svg.clientHeight/2,factor);}
 function updateHighlight(){
  for(const g of scene.querySelectorAll('.mall-zone')){
   const a=areas.find(a=>a.id===g.dataset.area),hasSelection=selectedArea&&boundsFor(selectedArea).length,active=hasSelection?g.dataset.area===selectedArea.id:state.family!=='all'&&a?.family===state.family,dim=hasSelection?!active:state.family!=='all'&&!active;
   g.classList.toggle('is-selected',!!active);g.classList.toggle('is-muted',!!dim);g.setAttribute('aria-pressed',String(!!active));
  }
 }
 function selectArea(a,index=0){
  if(isDiagram()&&a.family){state.family=a.family;updateFilters();}
  if(isDiagram()&&!a.boxes.some(b=>b.plan===state.plan)&&a.boxes.length){state.plan=a.boxes[0].plan;state.selected=a.id;part=index;load();return;}
  selectedArea=a;state.selected=a.id;part=index;updateHighlight();updateResults();
 }
 function updateFilters(){
  filters.replaceChildren();const choices=isDiagram()?mapFamilies:[{id:'all',title:'全部区域',color:'#445d86'}];
  for(const f of choices){
   const shortTitle={all:'全部',seafood:'海鲜',produce:'蔬果',meat:'肉禽',pantry:'副食',cooked:'熟食',facilities:'设施'}[f.id]||f.title;
   const b=button(shortTitle,'',()=>{state.family=f.id;state.selected='';selectedArea=null;part=0;focused=false;updateFilters();updateHighlight();updateResults();fitWorld();},'mall-chip');
   b.setAttribute('aria-label',f.title);b.title=f.title;b.setAttribute('aria-pressed',String(state.family===f.id));b.style.setProperty('--category',f.color);const mark=el('i');mark.append(glyph(f.id));b.prepend(mark);filters.append(b);
  }
 }
 function updateResults(){
  results.replaceChildren();intro.replaceChildren();panel.classList.toggle('has-selection',!!selectedArea);panel.hidden=isDiagram()&&!selectedArea&&state.family==='all';
  if(panel.hidden)return;
  if(selectedArea){
   const mark=el('div','','map-selection-icon');mark.append(glyph(selectedArea.id));intro.append(mark,label(selectedArea.title));
   if(isDiagram()){
    const boxes=boundsFor(selectedArea),actions=el('div','','mall-detail-actions');
    intro.append(el('p',boxes.length?`${boxes.length>1?'共 '+boxes.length+' 处':'已高亮'}`:'位置待确认，请咨询现场工作人员'));
    if(boxes.length){actions.append(button('放大查看','',focusArea,'mall-button is-primary','pin'));if(boxes.length>1)actions.append(button(`下一处 ${part+1}/${boxes.length}`,'',()=>{part=(part+1)%boxes.length;focusArea();updateResults();},'mall-button','arrow'));results.append(actions);}
   }else{
    const shops=associated(selectedArea);intro.append(el('p',selectedArea.description||'管理处已发布的市场区域'));
    for(const s of shops)results.append(button(s.name+(s.code?' · '+s.code:''),'查看商户介绍',()=>onMerchant(s.id),'mall-result'));
    if(!shops.length)results.append(el('p','本区域暂无已发布的商户介绍','mall-help'));
   }
   return;
  }
  const catalog=areas,matches=catalog.filter(a=>(state.family==='all'||a.family===state.family));
  intro.append(label(mapFamilies.find(f=>f.id===state.family)?.title||'选择区域'));
  for(const a of matches){
   const b=button(a.title,'',()=>selectArea(a),'mall-result'),mark=el('i');mark.style.color=a.color||'#445d86';mark.append(glyph(a.id));b.prepend(mark);
   if(isDiagram()&&!a.boxes.length)b.append(el('small','待确认'));results.append(b);
  }
  if(!matches.length)results.append(el('p','管理处发布布局后将在这里展示','mall-help'));
 }
 function changeSource(value){
  if(value.startsWith('reference:')){state.source='reference';state.plan=value.slice(10);}else state.source=value.slice(10);
  state.selected='';state.family='all';part=0;focused=false;load();
 }
 function buildSources(){
  sources.replaceChildren();const current=isDiagram()?'reference:'+state.plan:'published:'+state.source;
  const option=(value,title)=>{const b=button(title,'',()=>changeSource(value),'mall-source');b.setAttribute('aria-pressed',String(current===value));sources.append(b);};
  if(referenceEnabled){option('reference:main','主市场');option('reference:annex','西侧附区');}
  data.floors.forEach(f=>option('published:'+f.id,f.name));
 }
 function prepareReference(){const layout=layoutReference({areas:referenceAreas,plan:state.plan,width:svg.clientWidth,height:svg.clientHeight});world=layout.world;areas=layout.areas;overviewBounds=layout.overviewBounds;}
 function load(){
  pz?.dispose();pz=null;floor=data.floors.find(f=>f.id===state.source);if(isDiagram())prepareReference();else{world=floor;areas=publishedAreas(floor,data.stalls);}
  buildSources();updateFilters();
  if(!world){panel.hidden=false;scene.replaceChildren();intro.replaceChildren(label('地图资料待发布'));results.replaceChildren();zoomBar.hidden=true;note.textContent='管理处发布布局后将在这里展示';return;}
  zoomBar.hidden=false;selectedArea=areas.find(a=>a.id===state.selected);drawScene(scene,{areas,plan:state.plan,world,published:!isDiagram(),onSelect:selectArea});
  level.textContent=isDiagram()?'1F':'图';headingCopy.querySelector('h1').textContent='蛇口市场 · '+(isDiagram()?(state.plan==='annex'?'西侧附区':'主市场'):floor.name);
  note.textContent=isDiagram()?'本地参考导览 · 非实时位置':'已发布导览';note.title=isDiagram()?'按参考图简化绘制，非等比例，以现场标识为准':'商户资料以管理处最新明确发布内容为准';
  fitScale=Math.min((svg.clientWidth-36)/world.width,(svg.clientHeight-36)/world.height);
  pz=panzoom(scene,{bounds:true,boundsPadding:.15,minZoom:Math.max(.05,fitScale*.65),maxZoom:Math.max(.2,fitScale*5),smoothScroll:false,zoomDoubleClickSpeed:1,zoomSpeed:.12,pinchSpeed:1});
  pz.on('transform',()=>{const scale=pz?.getTransform().scale||fitScale;svg.classList.toggle('is-zoomed',scale>fitScale*1.45);plus.disabled=scale>=fitScale*4.99;minus.disabled=scale<=fitScale*.66;});
  updateHighlight();updateResults();fitWorld();if(selectedArea&&focused)focusArea();
 }
 // Deliberate taps may be held; moving or adding another pointer cancels selection.
 const pointers=new Set();let tap=null;
 svg.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);const g=e.target.closest?.('[data-area]');tap=pointers.size===1&&e.button===0&&g?{id:g.dataset.area,part:Number(g.dataset.part)||0,x:e.clientX,y:e.clientY,pointer:e.pointerId}:null;});
 svg.addEventListener('pointermove',e=>{if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>6)tap=null;});
 svg.addEventListener('pointerup',e=>{const chosen=tap;pointers.delete(e.pointerId);tap=null;if(chosen&&chosen.pointer===e.pointerId){const a=areas.find(a=>a.id===chosen.id);if(a)selectArea(a,chosen.part);}});
 svg.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);tap=null;});
 svg.addEventListener('pointerleave',()=>{pointers.clear();tap=null;});
 svg.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();focused=false;fitWorld();}});
 const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(disposed||!world||!pz)return;if(isDiagram()){prepareReference();selectedArea=areas.find(a=>a.id===state.selected);drawScene(scene,{areas,plan:state.plan,world,published:false,onSelect:selectArea});updateHighlight();}fitScale=Math.min((svg.clientWidth-36)/world.width,(svg.clientHeight-36)/world.height);pz.setMinZoom(Math.max(.05,fitScale*.65));pz.setMaxZoom(Math.max(.2,fitScale*5));if(selectedArea&&focused)focusArea();else fitWorld();});});resize.observe(viewport);resize.observe(svg);
 frame=requestAnimationFrame(()=>{if(!disposed)load();});return {element:root,destroy(){disposed=true;pz?.dispose();resize.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);}};
}
