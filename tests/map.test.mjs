import test from 'node:test';
import assert from 'node:assert/strict';
import {zoneMerchants,matchesMapQuery,fitBounds,zoomView,clampView} from '../assets/js/map-model.js';
import {referenceAreas,referencePlan} from '../assets/js/map-reference.js';
test('merchant locations require both the published floor and zone',()=>{
 const stalls=[{id:'a',floorId:'f1',zoneId:'z1'},{id:'b',floorId:'f2',zoneId:'z1'},{id:'c',floorId:'',zoneId:'',categoryId:'seafood'}];
 assert.deepEqual(zoneMerchants(stalls,'f1','z1').map(s=>s.id),['a']);
 assert.deepEqual(zoneMerchants(stalls,'f1',''),[]);
});
test('zone search finds associated merchant names, codes and goods',()=>{
 const area={title:'水产区',titleEn:'Seafood'};
 const shops=[{name:'海湾鱼铺',code:'A08',goods:['生蚝']}];
 for(const q of ['seafood','a08','海湾','生蚝'])assert.equal(matchesMapQuery(area,q,shops),true);
 assert.equal(matchesMapQuery(area,'蔬菜',shops),false);
});
test('reference areas remain within the original drawing and carry no merchant bindings',()=>{
 assert.equal(new Set(referenceAreas.map(a=>a.id)).size,referenceAreas.length);
 assert.equal(referenceAreas.filter(a=>!a.facility).length,22);
 for(const a of referenceAreas){assert.equal(a.floorId,undefined);for(const b of a.boxes){assert.ok(b.x>=0&&b.y>=0&&b.width>0&&b.height>0);assert.ok(b.x+b.width<=referencePlan.width&&b.y+b.height<=referencePlan.height);}}
});
test('fitting preserves drawing bounds across square and wide screens',()=>{
 const bounds={x:130,y:120,width:1575,height:865};
 for(const aspect of [1,2.8,.6]){const v=fitBounds(bounds,aspect,24);assert.ok(v.x<=bounds.x&&v.y<=bounds.y);assert.ok(v.x+v.width>=bounds.x+bounds.width);assert.ok(v.y+v.height>=bounds.y+bounds.height);assert.ok(Math.abs(v.width/v.height-aspect)<1e-10);}
});
test('zoom preserves its anchor and caps zoom; panning cannot lose drawing',()=>{
 const world={width:1888,height:1334},view={x:300,y:200,width:800,height:400};
 const z=zoomView(view,2,{x:.25,y:.5},world,100,4000);
 assert.equal(z.x+z.width*.25,500);assert.equal(z.y+z.height*.5,400);
 assert.equal(zoomView(view,1000,{x:.5,y:.5},world,100,4000).width,100);
 const p=clampView({...view,x:1e9,y:-1e9},world);assert.ok(p.x<world.width&&p.y+p.height>0);
});
