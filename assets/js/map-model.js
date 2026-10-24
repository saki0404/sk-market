export function zoneMerchants(stalls,floorId,zoneId){
 return zoneId?stalls.filter(s=>s.floorId===floorId&&s.zoneId===zoneId):[];
}
export function matchesMapQuery(item,query,merchants=[]){
 const q=query.trim().toLocaleLowerCase();
 return !q||[item.title,item.titleEn,item.description,...merchants.flatMap(s=>[s.name,s.nameEn,s.code,...s.goods])].some(v=>String(v||'').toLocaleLowerCase().includes(q));
}
export function fitBounds(bounds,aspect,padding=0){
 const w=bounds.width+2*padding,h=bounds.height+2*padding;
 const width=Math.max(w,h*aspect),height=width/aspect;
 return {x:bounds.x+bounds.width/2-width/2,y:bounds.y+bounds.height/2-height/2,width,height};
}
// Allow whitespace around the drawing when fitting a differently shaped screen,
// but never let dragging lose the drawing completely.
export function clampView(view,world){
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 return {...view,x:clamp(view.x,-view.width*.8,world.width-view.width*.2),y:clamp(view.y,-view.height*.8,world.height-view.height*.2)};
}
export function zoomView(view,factor,anchor,world,minWidth,maxWidth){
 const width=Math.min(maxWidth,Math.max(minWidth,view.width/factor)),ratio=width/view.width;
 return clampView({x:view.x+anchor.x*view.width*(1-ratio),y:view.y+anchor.y*view.height*(1-ratio),width,height:view.height*ratio},world);
}

// Current main repository contract: region / rect / polyline, rect.stallId is authoritative.
const contains=(outer,inner)=>inner.x>=outer.x&&inner.y>=outer.y&&inner.x+inner.width<=outer.x+outer.width&&inner.y+inner.height<=outer.y+outer.height;
export function publishedAreas(floor,stalls){
 if(!floor)return [];
 if(!Array.isArray(floor.shapes))return (floor.zones||[]).map(z=>({...z,type:'legacy-zone',color:z.color||'#7d8ca6'}));
 return (floor.shapes||[]).filter(s=>s.type==='region'||s.type==='rect').map(s=>{
  const shop=s.type==='rect'?stalls.find(row=>row.id===s.stallId):null;
  const region=floor.shapes.find(r=>r.type==='region'&&contains(r,s));
  return {...s,title:s.type==='region'?s.name:shop?.name||s.label||'暂无已发布资料',titleEn:s.type==='region'?s.nameEn||'':shop?.nameEn||'',color:s.type==='rect'?(region?.color||s.color):s.color};
 });
}
export function areaMerchants(stalls,floor,area){
 if(area.type==='legacy-zone')return zoneMerchants(stalls,floor.id,area.id);
 const ids=new Set(area.type==='rect'?[area.stallId]:(floor.shapes||[]).filter(s=>s.type==='rect'&&contains(area,s)).map(s=>s.stallId));
 return stalls.filter(s=>ids.has(s.id));
}
export function stallLocation(floors,stall){
 for(const floor of floors){if(!Array.isArray(floor.shapes)){const area=publishedAreas(floor,[stall]).find(a=>floor.id===stall.floorId&&a.id===stall.zoneId);if(area)return {floor,area};continue;}const area=publishedAreas(floor,[stall]).find(s=>s.type==='rect'&&s.stallId===stall.id);if(area)return {floor,area};}
 return null;
}
