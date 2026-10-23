import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSnapshot,contentFingerprint} from '../assets/js/market-data.js';
import {zoneMerchants} from '../assets/js/map-model.js';
const snapshot=()=>({schemaVersion:'1.0',market:{id:'mkt_001',name:'测试市场'},revision:1,categories:[{id:'seafood',name:'水产',nameEn:''}],stalls:[{id:'s1',name:'测试店',code:'TEST',nameEn:'',intro:'测试',introEn:'',message:'',messageEn:'',categoryId:'seafood',floorId:'',zoneId:'',goods:[],photos:[]}],floors:[],encyclopedia:[]});
test('valid published and empty snapshots accepted',()=>{assert.equal(validateSnapshot(snapshot(),'mkt_001').revision,1);const s=snapshot();s.revision=0;s.stalls=[];s.categories=[];assert.equal(validateSnapshot(s,'mkt_001').stalls.length,0);});
test('current backend listings without zoneId stay intact and unlocated',()=>{
 const s=snapshot();delete s.stalls[0].zoneId;
 s.stalls[0].floorId='f1';s.stalls[0].name='水产区';s.stalls[0].photos=[{id:'m',url:'/files/public-photo.png',sha256:'a'.repeat(64),mimeType:'image/png'}];
 const original=structuredClone(s);assert.equal(validateSnapshot(s,'mkt_001'),s);assert.deepEqual(s,original);
 assert.deepEqual(zoneMerchants(s.stalls,'f1','seafood'),[],'name, category and floor alone cannot locate a merchant');
 assert.equal(Object.hasOwn(s.stalls[0],'zoneId'),false,'validation must not invent or normalize published data');
});
test('explicit zoneId preserves exact matching and rejects invalid types',()=>{
 const s=snapshot();s.stalls[0].floorId='f1';s.stalls[0].zoneId='z1';validateSnapshot(s,'mkt_001');
 assert.deepEqual(zoneMerchants(s.stalls,'f1','z1').map(row=>row.id),['s1']);assert.deepEqual(zoneMerchants(s.stalls,'f2','z1'),[]);
 for(const zoneId of [null,0,false,{},[],undefined]){const invalid=snapshot();invalid.stalls[0].zoneId=zoneId;assert.throws(()=>validateSnapshot(invalid,'mkt_001'));}
});
test('reject wrong market, malformed lists and unsupported schema',()=>{for(const change of [s=>s.market.id='private-market',s=>s.schemaVersion='2',s=>s.stalls=null,s=>s.stalls[0].goods='invalid',s=>s.categories.push({...s.categories[0]}),s=>s.stalls[0].categoryId='missing']){const s=snapshot();change(s);assert.throws(()=>validateSnapshot(s,'mkt_001'));}});
test('reject unverifiable or non-image media',()=>{for(const a of [{id:'x',url:'/api/photo',sha256:'bad',mimeType:'image/png'},{id:'x',url:'/api/photo',sha256:'a'.repeat(64),mimeType:'application/pdf'}]){const s=snapshot();s.stalls[0].photos=[a];assert.throws(()=>validateSnapshot(s,'mkt_001'));}});
test('reject map geometry outside the published floor',()=>{const s=snapshot();s.floors=[{id:'f',name:'1F',nameEn:'',width:100,height:100,zones:[{id:'z',categoryId:'seafood',title:'区',titleEn:'',description:'',descriptionEn:'',x:90,y:0,width:20,height:30}]}];assert.throws(()=>validateSnapshot(s,'mkt_001'));});
test('signed URL renewal does not replace rendered content; content edit does',()=>{const a=snapshot();a.stalls[0].photos=[{id:'m',url:'/api/photo?signature=old',sha256:'a'.repeat(64),mimeType:'image/png'}];const b=structuredClone(a);b.stalls[0].photos[0].url='/api/photo?signature=new';b.serverTime='later';assert.equal(contentFingerprint(a),contentFingerprint(b));b.stalls[0].intro='新发布介绍';assert.notEqual(contentFingerprint(a),contentFingerprint(b));});
