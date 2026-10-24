import {referencePlan,annexPlan,mainEntrances} from './map-reference.js';

const mainBounds={x:-4,y:40,width:1340,height:620};
const annexBounds={x:20,y:40,width:254,height:824};

// The customer reference is a schematic, so its rows may spread vertically to
// fit the screen. Only coordinate data changes: labels and icons remain normal
// SVG text/symbols. Published floor shapes must bypass this helper altogether.
export function layoutReference({areas=[],plan='main',width=0,height=0}){
 const validSize=Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0;
 const scaleY=plan==='main'&&validSize?Math.max(1,Math.min(2,height/width*mainBounds.width/mainBounds.height)):1;
 const mapY=y=>mainBounds.y+(y-mainBounds.y)*scaleY;
 const boxLayout=b=>b.plan==='main'?{...b,y:mapY(b.y),height:b.height*scaleY}:{...b};
 const laidOut=areas.map(a=>({...a,boxes:(a.boxes||[]).map(b=>plan==='main'?boxLayout(b):{...b})}));
 const overviewBounds=plan==='main'?{...mainBounds,height:mainBounds.height*scaleY}:{...annexBounds};
 const referenceLayout=plan==='main'?{
  kind:'reference',scaleY,
  floor:{x:24,y:mapY(44),width:1300,height:558*scaleY},
  mainAisle:{left:49,right:1298,y:mapY(207),width:32*scaleY,caption:{x:706,y:mapY(207)}},
  secondaryAisles:[{x:221,top:mapY(224),bottom:mapY(581)},{x:507,top:mapY(225),bottom:mapY(581)}],
  entrances:mainEntrances.map(({x,y})=>({x,doorY:mapY(y-14),arrowY:mapY(y)})),
  entranceCaption:{x:665,y:mapY(646)},
  sideEntrances:[110,204].map(y=>({x:1,y:mapY(y)})),
  services:[]
 }:{
  kind:'reference',scaleY:1,
  floor:{x:24,y:44,width:246,height:810},
  services:[{x:60,y:58,width:120,height:82,title:'垃圾房'},{x:94,y:282,width:106,height:182,title:'水产加工'}]
 };
 const base=plan==='main'?referencePlan:annexPlan;
 const world={...base,height:plan==='main'?mapY(base.height):base.height,focus:{...overviewBounds},referenceLayout};
 return {areas:laidOut,world,overviewBounds,scaleY};
}
