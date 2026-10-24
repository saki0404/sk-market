import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedAreas,areaMerchants,stallLocation,matchesMapQuery} from '../assets/js/map-model.js';
import {referenceAreas,referencePlan,annexPlan} from '../assets/js/map-reference.js';
const floor={id:'f1',width:1000,height:700,shapes:[
 {id:'r',type:'region',name:'水产区',x:50,y:50,width:700,height:500,color:'#6699aa'},
 {id:'a',type:'rect',stallId:'s1',x:80,y:90,width:180,height:120},
 {id:'b',type:'rect',stallId:'s2',x:800,y:90,width:100,height:100},
 {id:'road',type:'polyline',points:[20,600,900,600]}
]};
const shops=[{id:'s1',name:'TEST ONLY',code:'T01',goods:['鱼虾']},{id:'s2',name:'TEST TWO',goods:[]},{id:'s3',name:'未定位商户',categoryId:'seafood',floorId:'f1',goods:[]}];
test('only explicit rect.stallId creates a merchant location',()=>{
 assert.equal(stallLocation([floor],shops[0]).area.id,'a');
 assert.equal(stallLocation([floor],shops[2]),null);
 assert.equal(stallLocation([floor],{...shops[0],id:'unknown',zoneId:'a'}),null);
});
test('region association follows geometry; roads do not become destinations',()=>{
 const areas=publishedAreas(floor,shops);
 assert.equal(areas.length,3);assert.equal(areas.find(a=>a.id==='a').color,'#6699aa');
 assert.deepEqual(areaMerchants(shops,floor,areas.find(a=>a.id==='r')).map(s=>s.id),['s1']);
 assert.deepEqual(areaMerchants(shops,floor,areas.find(a=>a.id==='b')).map(s=>s.id),['s2']);
});
test('published merchant and ordinary ingredient terms remain searchable',()=>{
 for(const q of ['test','t01','鱼虾'])assert.ok(matchesMapQuery({title:'水产区'},q,[shops[0]]));
 for(const [q,id] of [['青菜','vegetables'],['排骨','pork'],['轮椅','access'],['豆腐','tofu']])assert.ok(matchesMapQuery(referenceAreas.find(a=>a.id===id),q));
});
test('reference geometry remains independent of real merchants',()=>{
 for(const a of referenceAreas){assert.equal(a.stallId,undefined);for(const b of a.boxes){const world=b.plan==='main'?referencePlan:annexPlan;assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=world.width&&b.y+b.height<=world.height,a.id);}}
 for(const id of ['dry','sundries','other'])assert.equal(referenceAreas.find(a=>a.id===id).boxes.length,0);
});

// Existing publications must keep working while the component also supports shapes.
test('legacy zone publications retain explicit floor association without guessing',()=>{
 const legacy={id:'legacy',width:600,height:400,zones:[{id:'zone-a',title:'已发布区域',x:10,y:10,width:200,height:100}]};
 const stalls=[{id:'local',floorId:'legacy',zoneId:'zone-a'},{id:'other-floor',floorId:'other',zoneId:'zone-a'},{id:'unmapped',categoryId:'seafood'}];
 const area=publishedAreas(legacy,stalls)[0];
 assert.deepEqual(areaMerchants(stalls,legacy,area).map(s=>s.id),['local']);
 assert.equal(stallLocation([legacy],stalls[0]).area.id,'zone-a');
 assert.equal(stallLocation([legacy],stalls[1]),null);
 assert.equal(stallLocation([legacy],stalls[2]),null);
});
