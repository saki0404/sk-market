// Find a real piece of free space inside a stall block. A staircase touching a
// corner must not collapse the entire label into the thin strip above it.
export function labelBounds(box, obstacles = []) {
 const right = box.x + box.width, bottom = box.y + box.height;
 const overlaps = obstacles.filter(o => o.x < right && o.x + o.width > box.x && o.y < bottom && o.y + o.height > box.y);
 if (!overlaps.length) return {...box};
 const xs = [...new Set([box.x,right,...overlaps.flatMap(o => [Math.max(box.x,o.x),Math.min(right,o.x+o.width)])])].sort((a,b)=>a-b);
 const ys = [...new Set([box.y,bottom,...overlaps.flatMap(o => [Math.max(box.y,o.y),Math.min(bottom,o.y+o.height)])])].sort((a,b)=>a-b);
 let best = null, bestArea = -1;
 for(let l=0;l<xs.length-1;l++)for(let r=l+1;r<xs.length;r++)for(let t=0;t<ys.length-1;t++)for(let b=t+1;b<ys.length;b++){
  const rect={x:xs[l],y:ys[t],width:xs[r]-xs[l],height:ys[b]-ys[t]};
  if(overlaps.some(o=>rect.x<o.x+o.width&&rect.x+rect.width>o.x&&rect.y<o.y+o.height&&rect.y+rect.height>o.y))continue;
  const area=rect.width*rect.height;
  if(area>bestArea){best=rect;bestArea=area;}
 }
 return best || {...box,width:0,height:0};
}

const widthOf = text => Array.from(text).reduce((n,c)=>n+(/[\u0000-\u007f]/u.test(c)?.6:1),0);

// Try balanced line counts rather than fixing every narrow stall to two lines.
// Both dimensions constrain the font, including the whole multi-line height.
export function layoutLabel(text, box, {maxFontSize=26,padding=5,lineHeight=1.18}={}) {
 const chars=Array.from(text),width=Math.max(0,box.width-padding*2),height=Math.max(0,box.height-padding*2);
 if(!chars.length||!width||!height)return null;
 let best=null;
 for(let count=1;count<=Math.min(chars.length,6);count++){
  const lines=Array.from({length:count},(_,i)=>chars.slice(Math.floor(i*chars.length/count),Math.floor((i+1)*chars.length/count)).join(''));
  const fontSize=Math.min(maxFontSize,width/Math.max(...lines.map(widthOf)),height/(count*lineHeight));
  const score=fontSize-(count-1)*.75;
  if(!best||score>best.score)best={lines,fontSize,lineHeight,score};
 }
 const cx=box.x+box.width/2,cy=box.y+box.height/2;
 return {...best,cx,cy,lines:best.lines.map((text,i)=>({text,x:cx,y:cy+(i-(best.lines.length-1)/2)*best.fontSize*lineHeight}))};
}
