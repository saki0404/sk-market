import {svgNode} from './map-scene.js';
import {kioskLocation,layoutRoutePoint} from './map-routing.js';

function smoothPath(points){
 if(!points.length)return '';
 let d=`M${points[0].x} ${points[0].y}`;
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(7,ab/2,bc/2);
  d+=`L${b.x+(a.x-b.x)*r/ab} ${b.y+(a.y-b.y)*r/ab}Q${b.x} ${b.y} ${b.x+(c.x-b.x)*r/bc} ${b.y+(c.y-b.y)*r/bc}`;
 }
 return d+`L${points.at(-1).x} ${points.at(-1).y}`;
}
export function drawNavigation(scene,{route,scaleY=1,showOrigin=false}){
 scene.querySelector('.map-navigation')?.remove();
 if(!showOrigin)return;
 const layer=svgNode('g',{class:'map-navigation','pointer-events':'none','aria-hidden':'true'}),origin=layoutRoutePoint(kioskLocation,scaleY);
 if(route){
  const points=route.points.map(p=>layoutRoutePoint(p,scaleY)),d=smoothPath(points),target=route.target,box=layoutRoutePoint(target,scaleY);
  layer.append(svgNode('rect',{x:box.x-2,y:box.y-2,width:target.width+4,height:target.height*scaleY+4,rx:7,class:'map-destination-outline'}));
  layer.append(svgNode('path',{d,class:'map-route-halo'}),svgNode('path',{d,class:'map-route-line'}),svgNode('path',{d,class:'map-route-flow'}));
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
   for(let s=45;s<length-25;s+=90){const x=a.x+(b.x-a.x)*s/length,y=a.y+(b.y-a.y)*s/length;layer.append(svgNode('path',{d:'M-4-4 0 0-4 4',transform:`translate(${x} ${y}) rotate(${angle})`,class:'map-route-chevron'}));}
  }
  const end=points.at(-1);
  layer.append(svgNode('circle',{cx:end.x,cy:end.y,r:12,class:'map-arrival-halo'}),svgNode('circle',{cx:end.x,cy:end.y,r:7,class:'map-arrival'}));
  const endLabel=svgNode('text',{x:end.x,y:end.y-21,'text-anchor':'middle',class:'map-arrival-label'},'终点');layer.append(endLabel);
 }
 const pin=svgNode('g',{transform:`translate(${origin.x} ${origin.y})`,class:'map-you-are-here'});
 pin.append(svgNode('circle',{r:26,class:'map-location-aura'}),svgNode('circle',{r:17,class:'map-location-ring'}),svgNode('circle',{r:9,class:'map-location-dot'}));
 pin.append(svgNode('path',{d:'M0-13-5-6H5Z',class:'map-location-direction'}));
 pin.append(svgNode('path',{d:'M0 20 7 27H-7Z',class:'map-location-label-bg'}));
 pin.append(svgNode('rect',{x:-86,y:26,width:172,height:49,rx:15,class:'map-location-label-bg'}));
 pin.append(svgNode('text',{x:0,y:49,'text-anchor':'middle',class:'map-location-label'},'您在这里'));
 pin.append(svgNode('text',{x:0,y:65,'text-anchor':'middle',class:'map-location-subtitle'},'市场入口 · YOU ARE HERE'));
 layer.append(pin);scene.append(layer);
}
