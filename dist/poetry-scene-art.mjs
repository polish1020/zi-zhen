import{SCENE_RULES,SCENE_LIFE}from'./poetry-scene-rules.mjs';
import{VERSE_INDEX}from'./poetry-rules.mjs';
import{drawPoetrySigil,poetryProjectileProfile}from'./poetry-art.mjs';
const ring=(c,x,y,r,color,w=1)=>{c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);c.strokeStyle=color;c.lineWidth=w;c.stroke();};
const stroke=(c,points,color,width=1)=>{if(!points.length)return;c.beginPath();c.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))c.lineTo(p.x,p.y);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
const ellipse=(c,x,y,rx,ry,color,fill=false)=>{c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);if(fill){c.fillStyle=color;c.fill();}else{c.strokeStyle=color;c.stroke();}};
const terrain=new Set('deep_pool waterfall river undertow eddy snowdrift harvest_field grass seed sprout sand trail footprints spring_back'.split(' '));
const links=new Set('vine fellowship reunion chorus weave call return_home lantern_chain bridge horizon_gate'.split(' '));
const birds=new Set('grounding updraft kite swallow geese guest renewal'.split(' '));
const flora=new Set('plum petals leaves willow bamboo lotus scent ink_wash'.split(' '));
const radiance=new Set('moon sun lantern stars meteor afterglow scatter horizon ascend clock seasons rainbow beacon'.split(' '));
const sounds=new Set('song echo bell drum silence_watch lullaby book memory farewell solitude companions oath'.split(' '));
export const SCENE_VISUAL_GROUPS={terrain,links,birds,flora,radiance,sounds};
export function drawPoetryScenes(ctx,g,api,{reduced=false,mobile=false}={}){
 const scenes=(g.poetryScenes||[]).filter(s=>s.until>g.time&&g.towers.some(t=>t.id===s.tower&&t.hp>0)),names=new Set();
 for(const s of scenes){
  const w=api.getWord(s.word),age=Math.max(0,g.time-s.born),left=Math.max(0,s.until-g.time),fade=Math.min(1,age*4,left*2),wave=reduced?0:Math.sin(age*3),color=w.color,points=s.points||[],origin={x:s.ox,y:s.oy};
  ctx.save();ctx.globalAlpha=fade*.8;ctx.lineWidth=1.6;
  if(terrain.has(s.rule)){
   if(['waterfall','river','undertow'].includes(s.rule)){
    const head=s.d+(s.rule==='waterfall'?-60+age*38:s.rule==='undertow'?115-age*45:-90+age*50),path=[];for(let d=head-120;d<=head+45;d+=15)path.push(api.position({map:g.chapter,mirrorLayout:g.mirrorLayout,route:s.route,kind:'normal',d:Math.max(0,d)}));stroke(ctx,path,color+'42',s.rule==='waterfall'?35:22);ctx.setLineDash([12,10]);ctx.lineDashOffset=reduced?0:age*(s.rule==='undertow'?22:-22);stroke(ctx,path,color+'bb',3);ctx.setLineDash([]);for(let i=0;i<(mobile?4:7);i++){const p=path[(Math.floor(age*4)+i*3)%path.length];ellipse(ctx,p.x,p.y,12,4,'#e9f1edbb');}
   }else if(s.rule==='deep_pool'||s.rule==='eddy'){
    ellipse(ctx,s.x,s.y,98,50,color+'30',true);for(let i=0;i<4;i++)ellipse(ctx,s.x,s.y,24+i*23+wave*2,12+i*12,color+(i%2?'77':'bb'));if(s.rule==='eddy'){ctx.beginPath();for(let i=0;i<70;i++){const a=i*.19+(reduced?0:age),r=i*.95;const x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r*.55;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=color;ctx.stroke();}
   }else if(s.rule==='snowdrift'){
    ellipse(ctx,s.x,s.y,125,64,'#dcecf14c',true);for(let i=0;i<(mobile?9:16);i++){const a=i*2.4,r=25+(i*23)%90,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r*.5;stroke(ctx,[{x:x-5,y},{x:x+5,y}],color);stroke(ctx,[{x,y:y-5},{x,y:y+5}],color);}
   }else if(['grass','harvest_field','sprout','spring_back','seed'].includes(s.rule)){
    ellipse(ctx,s.x,s.y,105,53,'#86aa7630',true);for(let i=0;i<(mobile?8:14);i++){const a=i*2.4,r=20+(i*19)%85,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r*.5,h=7+Math.min(18,age*4);stroke(ctx,[{x:x-6,y:y-7},{x,y},{x:x+3,y:y-h},{x:x+7,y:y-8}],color+'cc',1.8);if(s.rule==='harvest_field')ellipse(ctx,x+3,y-h,3,6,'#cdb97c',true);}
   }else{for(const p of points){ellipse(ctx,p.x,p.y,p.used?3:8,p.used?2:4,color+(p.used?'33':'99'),true);}if(!points.length)ellipse(ctx,s.x,s.y,80,38,color+'44');}
  }else if(links.has(s.rule)){
   const ps=points.length?points:[origin,{x:s.x,y:s.y}];ctx.setLineDash(s.rule==='weave'?[3,4]:[]);stroke(ctx,[origin,...ps],color+'bb',s.rule==='bridge'?4:2);ctx.setLineDash([]);for(const p of ps){ring(ctx,p.x,p.y,18+wave*2,color,1.8);if(s.rule==='lantern_chain'){ellipse(ctx,p.x,p.y-15,7,10,'#e7c47799',true);}}
   if(s.rule==='chorus'&&ps.length>=3)stroke(ctx,[...ps,ps[0]],color+'77',3);
   if(s.rule==='horizon_gate'||s.rule==='bridge'){for(const side of[-1,1])stroke(ctx,[{x:s.x+side*28,y:s.y+18},{x:s.x+side*28,y:s.y-25},{x:s.x+side*43,y:s.y-34}],color,3);}
  }else if(birds.has(s.rule)){
   if(s.rule==='grounding')for(const e of g.enemies.filter(e=>e.verseGrounded&&api.nativeAir(e))){const p=api.position(e);stroke(ctx,[{x:p.x-15,y:p.y-50},{x:p.x,y:p.y+6},{x:p.x+15,y:p.y-50}],color+'aa',2);ellipse(ctx,p.x,p.y+15,22,8,color);}
   else if(s.rule==='updraft'){for(let i=0;i<4;i++){const y=s.y+25-i*17-(reduced?0:age*9%17);ellipse(ctx,s.x,y,30-i*4,6,color+'88');}}
   else if(s.rule==='guest'||s.rule==='renewal'){for(const p of points){ctx.fillStyle=color+'33';ctx.fillRect(p.x-17,p.y-25,34,48);ctx.strokeStyle=color;ctx.strokeRect(p.x-17,p.y-25,34,48);ctx.font='22px serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(s.rule==='renewal'?'芽':'友',p.x,p.y+4);}}
   else{const ps=points.length?points:[{x:s.x,y:s.y}];for(const p of ps){const flap=reduced?0:Math.sin(age*7)*6;stroke(ctx,[{x:p.x-17,y:p.y+flap},{x:p.x-7,y:p.y-7},{x:p.x,y:p.y},{x:p.x+8,y:p.y-7},{x:p.x+18,y:p.y+flap}],color,2.5);if(s.rule==='kite')stroke(ctx,[{x:p.x,y:p.y},{x:p.x-8,y:p.y+27},{x:p.x+4,y:p.y+40}],color+'77');}if(s.rule==='geese')for(const side of[-1,1])stroke(ctx,[{x:s.x,y:s.y},{x:s.x+side*45,y:s.y+30},{x:s.x+side*75,y:s.y+55}],color+'66',2);}
  }else if(flora.has(s.rule)){
   const n=s.rule==='bamboo'?5:6;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+(reduced?0:age*.15),r=35+wave*4,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r*.6;
    if(s.rule==='bamboo'){stroke(ctx,[{x,y:y+20},{x:x+3,y:y-35}],color,3);for(let k=0;k<3;k++)stroke(ctx,[{x:x-7,y:y-k*12},{x:x+9,y:y-k*12}],color+'aa');}
    else if(s.rule==='willow'){ctx.beginPath();ctx.moveTo(s.ox,s.oy-20);ctx.quadraticCurveTo(x,y-50,x+wave*10,y+30);ctx.strokeStyle=color;ctx.stroke();}
    else{ctx.save();ctx.translate(x,y);ctx.rotate(a);ellipse(ctx,0,0,s.rule==='lotus'?17:7,s.rule==='lotus'?7:15,color+'77',true);ctx.restore();}}
   if(s.rule==='ink_wash')ellipse(ctx,s.x,s.y,45+wave*4,30,color+'30',true);
   if(s.rule==='scent'){ctx.setLineDash([2,7]);ring(ctx,s.x,s.y,100+wave*5,color+'66');ctx.setLineDash([]);}
  }else if(radiance.has(s.rule)){
   if(s.rule==='horizon'||s.rule==='ascend'){const target=g.enemies.find(e=>e.id===s.target);if(target){const p=api.position(target);ctx.setLineDash([5,7]);stroke(ctx,[origin,p],color+'99',1.5);ctx.setLineDash([]);ring(ctx,p.x,p.y,25,color,2);}for(let i=0;i<(s.rule==='ascend'?3:1);i++)ellipse(ctx,s.ox,s.oy-20-i*14,30-i*5,7,color+'99');}
   else if(s.rule==='moon'||s.rule==='sun'){const a=s.rule==='moon'?s.a:age*.4;const end={x:s.ox+Math.cos(a)*260,y:s.oy+Math.sin(a)*260};stroke(ctx,[origin,end],color+'44',20);stroke(ctx,[origin,end],color+'aa',2);ring(ctx,s.ox,s.oy,22,color);}
   else if(s.rule==='clock'||s.rule==='seasons'){const mode=s.rule==='clock'?Math.floor(age/1.5)%2:s.mode;ring(ctx,s.x,s.y,58,color+'77');ctx.font='25px serif';ctx.fillStyle=['#80a374','#c3a35d','#b68763','#88aebc'][mode];ctx.textAlign='center';ctx.fillText(s.rule==='clock'?(mode?'夜':'昼'):['春','夏','秋','冬'][mode],s.x,s.y+9);}
   else{const ps=points.length?points:[{x:s.x,y:s.y}];for(const p of ps){if(p.used)continue;ring(ctx,p.x,p.y,11+wave*3,color,2);stroke(ctx,[{x:p.x-17,y:p.y},{x:p.x+17,y:p.y}],color+'99');stroke(ctx,[{x:p.x,y:p.y-17},{x:p.x,y:p.y+17}],color+'99');}if(s.rule==='rainbow')for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(s.ox,s.oy,60+i*8,35+i*6,0,Math.PI,Math.PI*2);ctx.strokeStyle=['#c08e83','#c2ac69','#8aa37a','#8a9eb5'][i];ctx.lineWidth=3;ctx.stroke();}}
  }else if(sounds.has(s.rule)){
   const radius=s.rule==='bell'?Math.min(340,s.a):30+(age*22)%90;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(s.rule==='bell'?s.ox:s.x,s.rule==='bell'?s.oy:s.y,radius+i*13,-Math.PI*.85,Math.PI*.85);ctx.strokeStyle=color+(i?'55':'aa');ctx.lineWidth=2;ctx.stroke();}if(s.rule==='echo')ring(ctx,s.x,s.y,20+Math.min(1,age/2)*28,color+'bb',2);
   if(s.rule==='book'||s.rule==='memory'){ctx.font='15px serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(s.rule==='book'?'知':'忆',s.x,s.y+5);}
  }else{
   // Distinct reactive sigils remain readable without hiding the map.
   const ts=s.targets.length?s.targets.map(id=>g.towers.find(t=>t.id===id&&t.hp>0)).filter(Boolean):[g.towers.find(t=>t.id===s.tower)];
   for(const t of ts){if(!t)continue;const p=g.pads[t.pad];ring(ctx,p.x,p.y-5,34+wave*2,color+'99',2);if(['umbrella','cocoon'].includes(s.rule)){ctx.beginPath();ctx.arc(p.x,p.y-8,39,Math.PI,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}else if(s.rule==='mirror')ctx.strokeRect(p.x-30,p.y-38,60,65);ctx.font='12px serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(SCENE_RULES[s.rule][0],p.x,p.y-45);}
  }
  // One phrase per owner, not one floating label per primitive.
  if(!names.has(s.tower)&&age<1.6){names.add(s.tower);const title=VERSE_INDEX.get(s.word).signature.name;ctx.globalAlpha=fade;ctx.textAlign='center';ctx.font='bold 16px "Noto Serif SC",serif';ctx.strokeStyle='#f4efddcc';ctx.lineWidth=4;ctx.strokeText(title,s.ox,Math.max(28,s.oy-65));ctx.fillStyle=color;ctx.fillText(title,s.ox,Math.max(28,s.oy-65));}
  ctx.restore();
 }
}
export function drawSceneBurst(ctx,f,progress,{reduced=false,decorate=true,unit=1}={}){
 const s=Math.max(1,Math.min(3.2,unit)),profile=poetryProjectileProfile(f.word,f.rule),color=profile.color,r=(8+(reduced?.4:progress)*16)*s;ctx.save();ctx.globalAlpha*=1-progress;
 if(f.kind==='poem-scene-hit'){
  stroke(ctx,[f.from,f.to],'#fff4dfcc',5*s);stroke(ctx,[f.from,f.to],color+'aa',2*s);ring(ctx,f.to.x,f.to.y,r,color,2*s);
  drawPoetrySigil(ctx,profile,f.to.x,f.to.y,s*.8,reduced?0:progress*.3,progress);
  if(decorate&&f.damage>0){ctx.font=`bold ${Math.max(12,8*s)}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#fff4df';ctx.lineWidth=3*s;const text=Math.round(f.damage);ctx.strokeText(text,f.to.x,f.to.y-20*s-progress*10);ctx.fillStyle=color;ctx.fillText(text,f.to.x,f.to.y-20*s-progress*10);}
 }else{
  ring(ctx,f.to.x,f.to.y,r,color,2*s);
  if(decorate){ctx.font=`${Math.max(17,9*s)}px serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(SCENE_RULES[f.rule]?.[0]||'诗',f.to.x,f.to.y-15*s-progress*12);}
 }
 ctx.restore();
}
