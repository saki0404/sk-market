import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutReference} from '../assets/js/reference-layout.js';
import {referenceAreas} from '../assets/js/map-reference.js';
import {labelBounds,layoutLabel} from '../assets/js/label-layout.js';
import {drawScene} from '../assets/js/map-scene.js';

test('reference layout adapts row spacing to the canvas and caps the spread at two',()=>{
 assert.equal(layoutReference({areas:referenceAreas,plan:'main',width:1920,height:650}).scaleY,1);
 const square=layoutReference({areas:referenceAreas,plan:'main',width:1000,height:820});
 assert.ok(square.scaleY>1.7&&square.scaleY<1.8);
 assert.equal(layoutReference({areas:referenceAreas,plan:'main',width:500,height:1200}).scaleY,2);
 for(const size of [{width:0,height:0},{width:100,height:NaN}])assert.equal(layoutReference({areas:referenceAreas,plan:'main',...size}).scaleY,1);
});

test('responsive reference preserves identities, horizontal placement and all row relationships',()=>{
 const before=JSON.stringify(referenceAreas),layout=layoutReference({areas:referenceAreas,plan:'main',width:1000,height:820});
 for(let i=0;i<referenceAreas.length;i++){
  const raw=referenceAreas[i],next=layout.areas[i];
  assert.equal(next.id,raw.id);assert.equal(next.family,raw.family);
  for(let j=0;j<raw.boxes.length;j++){
   const a=raw.boxes[j],b=next.boxes[j];
   assert.equal(b.x,a.x);assert.equal(b.width,a.width);
   if(a.plan==='main'){
    assert.equal(b.y,40+(a.y-40)*layout.scaleY);
    assert.equal(b.height,a.height*layout.scaleY);
   }else assert.deepEqual(b,a);
  }
 }
 assert.equal(JSON.stringify(referenceAreas),before);
 const raw=referenceAreas.flatMap(a=>a.boxes).filter(b=>b.plan==='main');
 const next=layout.areas.flatMap(a=>a.boxes).filter(b=>b.plan==='main');
 for(let i=0;i<raw.length;i++)for(let j=0;j<raw.length;j++)if(raw[i].y+raw[i].height<=raw[j].y){
  assert.ok(next[i].y+next[i].height<=next[j].y+1e-8);
 }
});

test('all stalls, main aisles and entrances stay within the overview after layout',()=>{
 for(const size of [{width:1920,height:650},{width:1000,height:820},{width:500,height:1200}]){
  const layout=layoutReference({areas:referenceAreas,plan:'main',...size}),bounds=layout.overviewBounds;
  for(const b of layout.areas.flatMap(a=>a.boxes).filter(b=>b.plan==='main')){
   assert.ok(b.x>=bounds.x&&b.x+b.width<=bounds.x+bounds.width);
   assert.ok(b.y>=bounds.y&&b.y+b.height+3<=bounds.y+bounds.height);
  }
  const map=layout.world.referenceLayout;
  for(const e of map.entrances){assert.ok(e.doorY<e.arrowY);assert.ok(e.arrowY+8<bounds.y+bounds.height);}
  assert.ok(map.mainAisle.y-map.mainAisle.width/2>bounds.y);
  assert.ok(map.entranceCaption.y+12<bounds.y+bounds.height);
 }
});

test('the annex keeps the original geometry even on a square canvas',()=>{
 const layout=layoutReference({areas:referenceAreas,plan:'annex',width:1000,height:820});
 assert.equal(layout.scaleY,1);assert.deepEqual(layout.areas,referenceAreas);
 assert.deepEqual(layout.overviewBounds,{x:20,y:40,width:254,height:824});
});

test('stretched fish-ball and tofu blocks still render every character without stretched type',()=>{
 const layout=layoutReference({areas:referenceAreas,plan:'main',width:1000,height:820});
 const stairs=layout.areas.find(a=>a.id==='stairs').boxes.filter(b=>b.plan==='main');
 for(const box of layout.areas.find(a=>a.id==='tofu').boxes){
  const free=labelBounds(box,stairs),label=layoutLabel('鱼丸豆品',free,{padding:4});
  assert.equal(label.lines.map(l=>l.text).join(''),'鱼丸豆品');
  assert.ok(label.fontSize<=26);
  for(const line of label.lines){
   assert.ok(line.y-label.fontSize/2>=free.y+3);
   assert.ok(line.y+label.fontSize/2<=free.y+free.height-3);
  }
 }
});

test('published scenes ignore responsive reference metadata and preserve authoritative geometry',()=>{
 class SvgElement{
  constructor(tag){this.tag=tag;this.attrs={};this.children=[];this.style={setProperty(){}};}
  setAttribute(key,value){this.attrs[key]=String(value);}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
 }
 const previous=globalThis.document;
 globalThis.document={createElementNS:(_ns,tag)=>new SvgElement(tag)};
 try{
  const root=new SvgElement('g'),referenceLayout=layoutReference({areas:referenceAreas,plan:'main',width:400,height:1000}).world.referenceLayout;
  const area={id:'published-stall',type:'rect',stallId:'s1',title:'已发布商户',x:80,y:90,width:180,height:120};
  drawScene(root,{areas:[area],plan:'main',world:{width:950,height:500,shapes:[],referenceLayout},published:true,onSelect(){}});
  const walk=node=>[node,...node.children.flatMap(walk)],nodes=walk(root);
  const block=nodes.find(n=>n.attrs.class==='mall-block'),floor=nodes.find(n=>n.attrs.class==='mall-floor');
  for(const key of ['x','y','width','height'])assert.equal(Number(block.attrs[key]),area[key]);
  assert.equal(Number(floor.attrs.width),950);assert.equal(Number(floor.attrs.height),500);
  assert.ok(!nodes.some(n=>n.attrs.class==='map-main-aisle'));
 }finally{
  if(previous===undefined)delete globalThis.document;else globalThis.document=previous;
 }
});
