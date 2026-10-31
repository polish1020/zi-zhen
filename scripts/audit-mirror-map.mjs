import {getMap} from '../dist/engine.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';

export function segmentDistance(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
// Exact line/circle intersection length; this measures geometry, not damage.
export function coverage(route,p,radius){
 return route.slice(1).reduce((sum,b,i)=>{
  const a=route[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
  const projection=(p.x-a.x)*ux+(p.y-a.y)*uy,perpendicular2=Math.max(0,(p.x-a.x)**2+(p.y-a.y)**2-projection**2);
  if(perpendicular2>=radius**2)return sum;
  const half=Math.sqrt(radius**2-perpendicular2);
  return sum+Math.max(0,Math.min(length,projection+half)-Math.max(0,projection-half));
 },0);
}
export function mapGeometry(layout){
 const map=getMap(7,layout),[left,right]=map.routes;
 let common=0;
 for(let i=left.length-1,j=right.length-1;i>0&&j>0;i--,j--){
  if(JSON.stringify(left[i])!==JSON.stringify(right[j])||JSON.stringify(left[i-1])!==JSON.stringify(right[j-1]))break;
  common+=Math.hypot(left[i].x-left[i-1].x,left[i].y-left[i-1].y);
 }
 const lengths=map.ground.map(r=>r.length),mean=lengths.reduce((a,b)=>a+b)/lengths.length;
 const at263=map.pads.map(p=>map.routes.reduce((s,r)=>s+coverage(r,p,263),0)/map.routes.length);
 return {layout,groundLengths:lengths,airLengths:map.air.map(r=>r.length),sharedTailLength:common,sharedTailFraction:common/mean,
  minimumPadRoadDistance:Math.min(...map.pads.flatMap(p=>map.routes.flatMap(r=>r.slice(1).map((b,i)=>segmentDistance(p,r[i],b))))),
  range263:{meanCoverageByPad:at263,maximumMeanCoverage:Math.max(...at263),maximumMeanFraction:Math.max(...at263)/mean}};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const engineHash=createHash('sha256').update(readFileSync(new URL('../dist/engine.mjs',import.meta.url))).digest('hex');
 const report={date:'2026-10-31',engineHash,method:'Exact segment/circle intersections averaged across both ground routes at range 263. Shared tail is identical suffix geometry. These are geometric coverage proxies, not actual DPS or win rates.',before:mapGeometry(1),after:mapGeometry(2)};
 if(process.argv.includes('--write'))writeFileSync(new URL('../docs/reports/mirror-geometry.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}
