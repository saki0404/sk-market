import test from 'node:test';
import assert from 'node:assert/strict';
import {labelBounds,layoutLabel} from '../assets/js/label-layout.js';
import {referenceAreas} from '../assets/js/map-reference.js';

test('corner staircase leaves the full-height clear side for fish-ball and tofu text',()=>{
 const box={x:640,y:427,width:39,height:75};
 const free=labelBounds(box,[{x:677,y:442,width:63,height:66}]);
 assert.deepEqual(free,{x:640,y:427,width:37,height:75});
 const label=layoutLabel('鱼丸豆品',free,{padding:4});
 assert.deepEqual(label.lines.map(l=>l.text),['鱼丸','豆品']);
 assert.ok(label.fontSize>=14);
});

test('reference labels keep every character inside the available width and height',()=>{
 const stairs=referenceAreas.find(a=>a.id==='stairs').boxes;
 for(const area of referenceAreas)for(const box of area.boxes){
  const free=labelBounds(box,area.id==='stairs'?[]:stairs.filter(o=>o.plan===box.plan));
  const label=layoutLabel(area.short||area.title,free,{padding:box.width<45?4:5});
  assert.ok(label,area.id);
  assert.equal(label.lines.map(l=>l.text).join(''),area.short||area.title);
  for(const line of label.lines){
   const width=Array.from(line.text).reduce((sum,c)=>sum+(c.codePointAt(0)<128?.6:1),0)*label.fontSize;
   assert.ok(line.x-width/2>=free.x+3,`${area.id}: left`);
   assert.ok(line.x+width/2<=free.x+free.width-3,`${area.id}: right`);
   assert.ok(line.y-label.fontSize/2>=free.y+3,`${area.id}: top`);
   assert.ok(line.y+label.fontSize/2<=free.y+free.height-3,`${area.id}: bottom`);
  }
 }
});

test('published long names can wrap beyond two lines without truncation',()=>{
 const text='已经发布的海鲜商户名称',box={x:0,y:0,width:65,height:130};
 const layout=layoutLabel(text,box);
 assert.ok(layout.lines.length>2);
 assert.equal(layout.lines.map(l=>l.text).join(''),text);
 assert.ok(layout.fontSize>=13);
});
