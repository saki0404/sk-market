import {mainEntrances} from './map-reference.js';
export function svgNode(tag,attrs={},text){
 const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
 for(const [key,value]of Object.entries(attrs))n.setAttribute(key,String(value));
 if(text!==undefined)n.textContent=text;return n;
}
function textAt(parent,x,y,text,size=24,cls=''){
 const n=svgNode('text',{x,y,'text-anchor':'middle','dominant-baseline':'middle','font-size':size,class:cls},text);parent.append(n);return n;
}
export function drawScene(root,{areas,plan,world,published=false,onSelect}){
 root.replaceChildren();
 if(!published){
  root.append(svgNode('rect',plan==='annex'?{x:24,y:44,width:246,height:810,rx:36,class:'mall-floor'}:{x:24,y:44,width:1300,height:558,rx:40,class:'mall-floor'}));
  if(plan==='main'){
   // Open spaces between the blocks preserve the main aisles in the reference.

   for(const {x,y} of mainEntrances){root.append(svgNode('path',{d:`M${x} ${y+12}v-25m-8 9 8-9 8 9`,class:'mall-entry-arrow'}));textAt(root,x,y+35,'入口',21,'mall-entry-text');}
   for(const y of [110,204])root.append(svgNode('path',{d:`M6 ${y}h24m-8-8 8 8-8 8`,class:'mall-entry-arrow'}));


  }else{
   textAt(root,150,22,'西侧附区',26,'mall-floor-title');
   root.append(svgNode('rect',{x:60,y:58,width:120,height:82,rx:12,class:'mall-service-block'}));textAt(root,120,101,'垃圾房',22,'mall-aisle-label');
   root.append(svgNode('rect',{x:94,y:282,width:106,height:182,rx:12,class:'mall-service-block'}));textAt(root,147,365,'水产加工',22,'mall-aisle-label');
   textAt(root,307,460,'通',22,'mall-aisle-label');textAt(root,307,495,'道',22,'mall-aisle-label');
  }
 }else root.append(svgNode('rect',{x:0,y:0,width:world.width,height:world.height,rx:20,class:'mall-floor'}));
 for(const area of areas){
  const boxes=published?[area]:area.boxes.filter(b=>b.plan===plan);
  boxes.forEach((b,index)=>{
   const group=svgNode('g',{class:'mall-zone',role:'button',tabindex:0,'data-area':area.id,'data-part':index,'aria-label':area.title+(boxes.length>1?` · 区域${index+1}`:'')});
   group.style.setProperty('--zone-ink',area.color||'#668c6c');
   group.append(svgNode('rect',{x:b.x,y:b.y+4,width:b.width,height:b.height,rx:Math.min(12,b.height/4),class:'mall-block-depth'}));
   group.append(svgNode('rect',{x:b.x,y:b.y,width:b.width,height:b.height,rx:Math.min(12,b.height/4),class:'mall-block'}));
   const title=area.short||area.title;
   const size=published?Math.min(30,b.height/3,b.width/Math.max(3,title.length)):Math.min(30,b.height*.55,(b.width-12)/((title.length>3||b.width<70)?2:title.length));
   if(area.id==='stairs'){
    const cx=b.x+b.width/2,cy=b.y+b.height/2;
    group.append(svgNode('path',{d:`M${cx-17} ${cy+14}h11v-10h11v-10h11v-10`,class:'mall-stair-icon'}));
   }else if(area.id==='access')textAt(group,b.x+b.width/2,b.y+b.height/2,'♿',Math.min(30,b.height*.8),'mall-block-label');
   else{
    const chars=Math.max(2,Math.floor((b.width-10)/size));
    const lines=title.length>chars?[title.slice(0,chars),title.slice(chars)]:[title];
    const minor=!published&&(b.width<50||(area.id==='seafood'&&index>3));
    lines.slice(0,2).forEach((line,i)=>textAt(group,b.x+b.width/2,b.y+b.height/2+(i-(lines.length-1)/2)*size*1.1,line,size,`mall-block-label${minor?' mall-minor-label':''}`));
   }
   group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(area,index);}};
   root.append(group);
  });
 }
}
