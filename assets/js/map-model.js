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
