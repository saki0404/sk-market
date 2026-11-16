import {referenceAreas} from './map-reference.js';

// Fixed kiosk: the fourth south entrance, explicitly identified by the owner.
// Coordinates belong only to the customer reference diagram, never published floors.
export const kioskLocation=Object.freeze({plan:'main',x:735,y:620,title:'市场入口'});
export const routeClearance=8;
const floorBounds={left:28,right:1320,top:48,bottom:598};
const cache=new Map();
const inside=(p,b)=>p.x>b.x+1e-7&&p.x<b.x+b.width-1e-7&&p.y>b.y+1e-7&&p.y<b.y+b.height-1e-7;
export function segmentBlocked(a,b,boxes){
 return boxes.some(r=>a.x===b.x
  ?a.x>r.x+1e-7&&a.x<r.x+r.width-1e-7&&Math.max(a.y,b.y)>r.y+1e-7&&Math.min(a.y,b.y)<r.y+r.height-1e-7
  :a.y>r.y+1e-7&&a.y<r.y+r.height-1e-7&&Math.max(a.x,b.x)>r.x+1e-7&&Math.min(a.x,b.x)<r.x+r.width-1e-7);
}
class MinHeap{
 items=[];
 push(value){let i=this.items.length;this.items.push(value);while(i){const p=(i-1)>>1;if(this.items[p].f<=value.f)break;this.items[i]=this.items[p];i=p;}this.items[i]=value;}
 pop(){const first=this.items[0],last=this.items.pop();if(this.items.length){let i=0;while(i*2+1<this.items.length){let c=i*2+1;if(c+1<this.items.length&&this.items[c+1].f<this.items[c].f)c++;if(this.items[c].f>=last.f)break;this.items[i]=this.items[c];i=c;}this.items[i]=last;}return first;}
 get length(){return this.items.length;}
}
function simplify(points){
 const result=[];
 for(const p of points){const a=result.at(-2),b=result.at(-1);if(b&&b.x===p.x&&b.y===p.y)continue;if(a&&((a.x===b.x&&b.x===p.x)||(a.y===b.y&&b.y===p.y)))result.pop();result.push(p);}
 return result;
}

export function findReferenceRoute({areaId,part=0,plan='main',areas=referenceAreas}={}){
 if(plan!=='main')return null;
 const key=`${areaId}:${part}`;
 if(areas===referenceAreas&&cache.has(key))return cache.get(key);
 const target=areas.find(a=>a.id===areaId)?.boxes?.filter(b=>b.plan===plan)[part];
 if(!target)return null;
 const boxes=areas.flatMap(a=>a.boxes||[]).filter(b=>b.plan===plan).map(b=>({x:b.x-routeClearance,y:b.y-routeClearance,width:b.width+2*routeClearance,height:b.height+2*routeClearance}));
 const inFloor=p=>p.x>=floorBounds.left&&p.x<=floorBounds.right&&p.y>=floorBounds.top&&p.y<=floorBounds.bottom;
 const free=p=>inFloor(p)&&!boxes.some(b=>inside(p,b));
 const start={x:kioskLocation.x,y:floorBounds.bottom},goals=[];
 for(const t of [.12,.3,.5,.7,.88]){
  const x=target.x+target.width*t,y=target.y+target.height*t;
  for(const p of [{x,y:target.y-routeClearance},{x,y:target.y+target.height+routeClearance},{x:target.x-routeClearance,y},{x:target.x+target.width+routeClearance,y}])if(free(p))goals.push(p);
 }
 if(!goals.length||!free(start)||segmentBlocked(kioskLocation,start,boxes))return null;
 const sorted=values=>[...new Set(values)].sort((a,b)=>a-b);
 const xs=sorted([floorBounds.left,floorBounds.right,start.x,...boxes.flatMap(b=>[b.x,b.x+b.width]),...goals.map(p=>p.x)].filter(x=>x>=floorBounds.left&&x<=floorBounds.right));
 const ys=sorted([floorBounds.top,floorBounds.bottom,start.y,...boxes.flatMap(b=>[b.y,b.y+b.height]),...goals.map(p=>p.y)].filter(y=>y>=floorBounds.top&&y<=floorBounds.bottom));
 const cols=xs.length,count=cols*ys.length,points=Array.from({length:count},(_,i)=>({x:xs[i%cols],y:ys[Math.floor(i/cols)]}));
 const valid=points.map(free),goalIds=new Set(goals.map(p=>ys.indexOf(p.y)*cols+xs.indexOf(p.x)));
 const first=ys.indexOf(start.y)*cols+xs.indexOf(start.x),heap=new MinHeap(),cost=new Map(),previous=new Map();
 const heuristic=p=>Math.min(...goals.map(g=>Math.abs(p.x-g.x)+Math.abs(p.y-g.y)));
 const initial=first*3;cost.set(initial,0);heap.push({id:first,dir:0,key:initial,g:0,f:heuristic(start)});
 let finish;
 while(heap.length){
  const current=heap.pop();if(current.g!==cost.get(current.key))continue;
  if(goalIds.has(current.id)){finish=current;break;}
  const col=current.id%cols,row=Math.floor(current.id/cols),a=points[current.id];
  for(const [id,dir]of [[col?current.id-1:-1,1],[col+1<cols?current.id+1:-1,1],[row?current.id-cols:-1,2],[row+1<ys.length?current.id+cols:-1,2]]){
   if(id<0||!valid[id])continue;const b=points[id];if(segmentBlocked(a,b,boxes))continue;
   // Slightly prefer fewer turns without replacing a clear aisle with a shortcut.
   const g=current.g+Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+(current.dir&&current.dir!==dir?18:0),next=id*3+dir;
   if(g>=(cost.get(next)??Infinity))continue;cost.set(next,g);previous.set(next,current.key);heap.push({id,dir,key:next,g,f:g+heuristic(b)});
  }
 }
 let result=null;
 if(finish){
  const path=[];let key=finish.key;while(key!==undefined){path.push(points[Math.floor(key/3)]);key=previous.get(key);}path.reverse();
  const route=simplify([{x:kioskLocation.x,y:kioskLocation.y},...path]);
  result={points:route,target:{...target},areaId,part,turns:Math.max(0,route.length-2)};
 }
 if(areas===referenceAreas)cache.set(key,result);
 return result;
}

export const layoutRoutePoint=(p,scaleY=1)=>({x:p.x,y:40+(p.y-40)*scaleY});
export function routeBounds(points,padding=55){
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 return {x:Math.min(...xs)-padding,y:Math.min(...ys)-padding,width:Math.max(...xs)-Math.min(...xs)+padding*2,height:Math.max(...ys)-Math.min(...ys)+padding*2};
}
