import {glyph} from './map-glyph.js';
import {labelBounds,layoutLabel} from './label-layout.js';
import {layoutReference} from './reference-layout.js';
let sceneSerial=0;
export function svgNode(tag,attrs={},text){
 const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
 for(const [key,value]of Object.entries(attrs))n.setAttribute(key,String(value));
 if(text!==undefined)n.textContent=text;return n;
}
function textAt(parent,x,y,text,size=24,cls=''){
 const n=svgNode('text',{x,y,'text-anchor':'middle','dominant-baseline':'central','font-size':size,class:cls},text);parent.append(n);return n;
}
function iconAt(parent,kind,x,y,size){const icon=glyph(kind);for(const [k,v]of Object.entries({x:x-size/2,y:y-size/2,width:size,height:size,class:'map-icon'}))icon.setAttribute(k,String(v));parent.append(icon);}
function drawLabel(parent,title,box,options){
 const layout=layoutLabel(title,box,options);
 if(layout)for(const line of layout.lines)textAt(parent,line.x,line.y,line.text,layout.fontSize,'mall-block-label');
}
export function drawScene(root,{areas,plan,world,published=false,onSelect}){
 root.replaceChildren();
 const serial=++sceneSerial,defs=svgNode('defs');root.append(defs);
 const main=plan==='main',reference=published?null:world.referenceLayout||layoutReference({plan}).world.referenceLayout;
 const floor=published?{x:0,y:0,width:world.width,height:world.height}:reference.floor;
 root.append(svgNode('rect',{...floor,y:floor.y+4,rx:18,class:'map-plinth'}));
 root.append(svgNode('rect',{...floor,rx:18,class:'mall-floor'}));
 if(!published){
  if(main){
   // These paths follow the open gaps in the reference plan. They distinguish
   // circulation space; they are not suggested routes or a guessed start point.
   const aisle=reference.mainAisle;
   root.append(svgNode('path',{d:`M${aisle.left} ${aisle.y}H${aisle.right}`,class:'map-main-aisle',style:`stroke-width:${aisle.width}`,'pointer-events':'none'}));
   root.append(svgNode('path',{d:reference.secondaryAisles.map(a=>`M${a.x} ${a.top}V${a.bottom}`).join(''),class:'map-secondary-aisle','pointer-events':'none'}));
   textAt(root,aisle.caption.x,aisle.caption.y,'主 通 道',15,'map-aisle-caption');
   for(const {x,doorY,arrowY}of reference.entrances){
    root.append(svgNode('path',{d:`M${x-17} ${doorY}h34`,class:'map-entry-door'}));
    root.append(svgNode('path',{d:`M${x} ${arrowY+8}v-16m-5 5 5-5 5 5`,class:'mall-entry-arrow'}));
   }
   textAt(root,reference.entranceCaption.x,reference.entranceCaption.y,'市 场 入 口',19,'mall-entry-text');
   for(const {x,y}of reference.sideEntrances)root.append(svgNode('path',{d:`M${x} ${y}h21m-6-6 6 6-6 6`,class:'mall-entry-arrow'}));
  }else{
   for(const b of reference.services){
    root.append(svgNode('rect',{x:b.x,y:b.y,width:b.width,height:b.height,rx:6,class:'map-service'}));
    drawLabel(root,b.title,b,{maxFontSize:20,padding:9});
   }
  }
 }
 const ordered=[...areas].sort((a,b)=>(a.type==='region'?0:1)-(b.type==='region'?0:1));
 const facilities=published?[]:areas.filter(a=>a.id==='stairs').flatMap(a=>a.boxes).filter(b=>b.plan===plan);
 let blockIndex=0;
 for(const area of ordered){
  const boxes=published?[area]:area.boxes.filter(b=>b.plan===plan);
  boxes.forEach((b,index)=>{
   const region=area.type==='region';
   const group=svgNode('g',{class:`mall-zone${region?' map-region':''}`,role:'button',tabindex:0,'data-area':area.id,'data-zone-id':area.id,'data-part':index,'aria-label':area.title+(boxes.length>1?` · 区域${index+1}`:'')});
   group.style.setProperty('--zone-ink',area.color||'#79998d');
   const radius=Math.min(6,b.width/8,b.height/6);
   if(!region)group.append(svgNode('rect',{x:b.x,y:b.y+3,width:b.width,height:b.height,rx:radius,class:'mall-block-depth'}));
   group.append(svgNode('rect',{x:b.x,y:b.y,width:b.width,height:b.height,rx:radius,class:'mall-block'}));
   // Text and symbols are fitted first; a clip is a final guard for unusual fonts
   // or externally published labels rather than a way to hide overflowing names.
   const clipId=`map-label-${serial}-${++blockIndex}`,clip=svgNode('clipPath',{id:clipId});
   clip.append(svgNode('rect',{x:b.x+1,y:b.y+1,width:Math.max(0,b.width-2),height:Math.max(0,b.height-2),rx:radius}));defs.append(clip);
   const content=svgNode('g',{'clip-path':`url(#${clipId})`,'pointer-events':'none'});group.append(content);
   const title=area.short||area.title,available=labelBounds(b,area.id==='stairs'?[]:facilities);
   const facility=['stairs','access','cold'].includes(area.id),cx=available.x+available.width/2,cy=available.y+available.height/2;
   if(region){
    drawLabel(content,title,{x:b.x+5,y:b.y+5,width:b.width-10,height:Math.min(38,b.height-10)},{maxFontSize:19,padding:4});
   }else if(facility){
    const withTitle=available.width>=42&&available.height>=67;
    const size=Math.min(33,available.width*.6,available.height*(withTitle?.42:.65));
    iconAt(content,area.id,cx,withTitle?cy-12:cy,size);
    if(withTitle)drawLabel(content,title,{x:available.x,y:cy+9,width:available.width,height:Math.max(0,available.y+available.height-cy-12)},{maxFontSize:17,padding:4});
   }else{
    const withIcon=!published&&available.width>=88&&available.height>=86;
    if(withIcon){
     iconAt(content,area.id,cx,available.y+available.height*.28,27);
     drawLabel(content,title,{x:available.x,y:available.y+available.height*.49,width:available.width,height:available.height*.47},{maxFontSize:27,padding:5});
    }else drawLabel(content,title,available,{maxFontSize:27,padding:b.width<45?4:5});
   }
   group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(area,index);}};
   root.append(group);
  });
 }
 if(published)for(const road of world.shapes||[]){if(road.type!=='polyline')continue;root.append(svgNode('polyline',{points:road.points.reduce((pairs,n,i)=>{if(i%2===0)pairs.push(n+','+road.points[i+1]);return pairs;},[]).join(' '),fill:'none',stroke:road.color||'#9ca99d','stroke-width':3,'stroke-dasharray':road.dash===false?'none':'8 6','stroke-linecap':'round','pointer-events':'none'}));}
}
