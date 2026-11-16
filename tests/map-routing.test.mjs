import test from 'node:test';
import assert from 'node:assert/strict';
import {referenceAreas} from '../assets/js/map-reference.js';
import {findReferenceRoute,kioskLocation,layoutRoutePoint} from '../assets/js/map-routing.js';

// Independent geometry check against actual stall footprints, not graph nodes.
function crossesInterior(a,b,r){
 const left=Math.max(Math.min(a.x,b.x),r.x),right=Math.min(Math.max(a.x,b.x),r.x+r.width);
 const top=Math.max(Math.min(a.y,b.y),r.y),bottom=Math.min(Math.max(a.y,b.y),r.y+r.height);
 return a.x===b.x?a.x>r.x&&a.x<r.x+r.width&&bottom>top:a.y>r.y&&a.y<r.y+r.height&&right>left;
}
test('every mapped main-market destination has a route from the owner-confirmed fourth entrance',()=>{
 assert.deepEqual({x:kioskLocation.x,y:kioskLocation.y},{x:735,y:620});
 const footprints=referenceAreas.flatMap(a=>a.boxes).filter(b=>b.plan==='main');
 let checked=0;
 for(const area of referenceAreas)for(const [part,box]of area.boxes.filter(b=>b.plan==='main').entries()){
  const route=findReferenceRoute({areaId:area.id,part});assert.ok(route,`${area.id}:${part} must be reachable`);checked++;
  assert.deepEqual(route.points[0],{x:735,y:620});
  assert.equal(route.points[1].x,735,'enter through the selected entrance before moving sideways');
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i];
   assert.ok(a.x===b.x||a.y===b.y,'routes follow orthogonal aisles');
   for(const obstacle of footprints)assert.equal(crossesInterior(a,b,obstacle),false,`${area.id}:${part} crosses a stall`);
   if(i>1)assert.ok(b.x>=24&&b.x<=1324&&b.y>=44&&b.y<=602,'stay inside the main market after entering');
  }
  const end=route.points.at(-1),dx=Math.max(box.x-end.x,0,end.x-box.x-box.width),dy=Math.max(box.y-end.y,0,end.y-box.y-box.height);
  assert.equal(Math.hypot(dx,dy),8,'finish on the destination aisle side, outside the stall');
 }
 assert.equal(checked,50);
});
test('entrance, route and footprints stay aligned when the schematic expands vertically',()=>{
 const route=findReferenceRoute({areaId:'vegetables',part:2});
 for(const scale of [1,1.75,2]){
  const points=route.points.map(p=>layoutRoutePoint(p,scale));
  const footprints=referenceAreas.flatMap(a=>a.boxes).filter(b=>b.plan==='main').map(b=>({...b,...layoutRoutePoint(b,scale),height:b.height*scale}));
  assert.deepEqual(points[0],{x:735,y:40+580*scale});
  for(let i=1;i<points.length;i++)for(const b of footprints)assert.equal(crossesInterior(points[i-1],points[i],b),false);
 }
});
test('unconfirmed destinations and cross-plan connections do not invent routes',()=>{
 for(const areaId of ['dry','sundries','other','does-not-exist'])assert.equal(findReferenceRoute({areaId}),null);
 assert.equal(findReferenceRoute({areaId:'cold',plan:'annex'}),null);
 assert.equal(findReferenceRoute({areaId:'beef',part:99}),null);
});
test('a blocked aisle returns no route instead of drawing a line through a barrier',()=>{
 const areas=[...referenceAreas,{id:'closed-aisle',boxes:[{plan:'main',x:0,y:560,width:1400,height:30}]}];
 assert.equal(findReferenceRoute({areaId:'vegetables',areas}),null);
});
