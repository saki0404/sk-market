import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSnapshot,contentFingerprint} from '../assets/js/market-data.js';
import {publishedAreas,areaMerchants,stallLocation} from '../assets/js/map-model.js';
const floor=()=>({id:'f',name:'TEST ONLY',nameEn:'TEST ONLY',width:100,height:100,schematic:true,shapes:[{id:'region',type:'region',x:0,y:0,width:80,height:80,name:'TEST ONLY',color:'#228833'},{id:'shop',type:'rect',x:10,y:20,width:20,height:20,stallId:'s1'},{id:'road',type:'polyline',points:[0,90,100,90],dash:true}]});
const snapshot=()=>({schemaVersion:'1.0',market:{id:'mkt_001',name:'测试市场'},revision:1,categories:[{id:'seafood',name:'水产',nameEn:''}],stalls:[{id:'s1',name:'测试店',code:'TEST',nameEn:'',intro:'测试',introEn:'',message:'',messageEn:'',categoryId:'seafood',floorId:'',zoneId:'',goods:[],photos:[]}],floors:[],encyclopedia:[]});
test('valid published and empty snapshots accepted',()=>{assert.equal(validateSnapshot(snapshot(),'mkt_001').revision,1);const s=snapshot();s.revision=0;s.stalls=[];s.categories=[];assert.equal(validateSnapshot(s,'mkt_001').stalls.length,0);});
test('current contract accepts shops without zoneId and all three shape types',()=>{
 const s=snapshot();delete s.stalls[0].zoneId;s.floors=[floor()];
 assert.equal(validateSnapshot(s,'mkt_001'),s);
 const areas=publishedAreas(s.floors[0],s.stalls);
 assert.equal(areas.length,2);assert.equal(areas[1].color,'#228833');
 assert.deepEqual(areaMerchants(s.stalls,s.floors[0],areas[1]),s.stalls);
 assert.equal(stallLocation(s.floors,s.stalls[0]).area.id,'shop');
 assert.equal(stallLocation(s.floors,{id:'unmapped',floorId:'f'}),null);
 // A planned but unpublished stall must not be replaced by a guessed public shop.
 s.floors[0].shapes[1].stallId='unpublished';validateSnapshot(s,'mkt_001');
 assert.deepEqual(areaMerchants(s.stalls,s.floors[0],publishedAreas(s.floors[0],s.stalls)[1]),[]);
});
test('reject malformed current shapes and do not fall back to legacy zones',()=>{
 for(const change of [f=>f.shapes[1].x=99,f=>delete f.shapes[1].stallId,f=>f.shapes[2].points=[0,0,10],f=>f.shapes[2].points=[0,0,101,90],f=>f.shapes[0].color='red',f=>f.shapes.push({...f.shapes[0]}),f=>f.shapes=null]){
  const s=snapshot();s.floors=[floor()];change(s.floors[0]);assert.throws(()=>validateSnapshot(s,'mkt_001'));
 }
});
test('reject wrong market, malformed lists and unsupported schema',()=>{for(const change of [s=>s.market.id='private-market',s=>s.schemaVersion='2',s=>s.stalls=null,s=>s.stalls[0].goods='invalid',s=>s.categories.push({...s.categories[0]}),s=>s.stalls[0].categoryId='missing']){const s=snapshot();change(s);assert.throws(()=>validateSnapshot(s,'mkt_001'));}});
test('reject unverifiable or non-image media',()=>{for(const a of [{id:'x',url:'/api/photo',sha256:'bad',mimeType:'image/png'},{id:'x',url:'/api/photo',sha256:'a'.repeat(64),mimeType:'application/pdf'}]){const s=snapshot();s.stalls[0].photos=[a];assert.throws(()=>validateSnapshot(s,'mkt_001'));}});
test('reject map geometry outside the published floor',()=>{const s=snapshot();s.floors=[{id:'f',name:'1F',nameEn:'',width:100,height:100,zones:[{id:'z',categoryId:'seafood',title:'区',titleEn:'',description:'',descriptionEn:'',x:90,y:0,width:20,height:30}]}];assert.throws(()=>validateSnapshot(s,'mkt_001'));});
test('signed URL renewal does not replace rendered content; content edit does',()=>{const a=snapshot();a.stalls[0].photos=[{id:'m',url:'/api/photo?signature=old',sha256:'a'.repeat(64),mimeType:'image/png'}];const b=structuredClone(a);b.stalls[0].photos[0].url='/api/photo?signature=new';b.serverTime='later';assert.equal(contentFingerprint(a),contentFingerprint(b));b.stalls[0].intro='新发布介绍';assert.notEqual(contentFingerprint(a),contentFingerprint(b));});
