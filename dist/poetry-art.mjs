import {VERSE_INDEX} from './poetry-rules.mjs';
const ring=(ctx,x,y,r,color,width=1)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
const line=(ctx,x,y,xx,yy,color,width=1)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
export function drawPoetryTower(ctx,t,w,time,{point,defense,active,selected,reduced=false,labelFont=10,fieldReady={}}){
 const l=VERSE_INDEX.get(w.word),phase=reduced?0:time,charge=t.verseCharge||0;
 ctx.save();ctx.translate(point.x,point.y);
 if(!active){ctx.fillStyle='#7c8b7a88';ctx.fillRect(-28,5,56,16);ctx.strokeStyle='#9b8c69';ctx.strokeRect(-25,-16,30,28);ctx.font='21px serif';ctx.fillStyle='#887d66';ctx.fillText('诗',-20,6);ctx.font=labelFont+'px system-ui';ctx.textAlign='center';ctx.fillText(w.word+' · 待重建',0,42);ctx.restore();return;}
 ctx.fillStyle='#7e8f6a2a';ctx.beginPath();ctx.ellipse(0,27,43,12,0,0,7);ctx.fill();
 ring(ctx,0,0,39,'#c5ad7666',1);ctx.save();ctx.rotate(phase*.12);ctx.setLineDash([7,8]);ring(ctx,0,0,43,w.color+'88');ctx.restore();
 for(const side of[-1,1]){ctx.save();ctx.translate(side*35,Math.sin(phase*1.5+side)*3-12);ctx.rotate(side*.14);ctx.fillStyle='#eee5cb';ctx.fillRect(-8,-16,16,29);ctx.strokeStyle='#ae9970';ctx.strokeRect(-8,-16,16,29);for(let i=0;i<3;i++)line(ctx,-4,-9+i*7,4,-9+i*7,w.color+'99');ctx.restore();}
 ctx.fillStyle='#eee9d6';ctx.fillRect(-26,-32,52,59);ctx.fillStyle='#d6c79b';ctx.fillRect(-30,-37,60,7);ctx.fillRect(-30,25,60,7);ctx.strokeStyle='#ad9363';ctx.strokeRect(-26,-32,52,59);
 ctx.fillStyle=w.color;ctx.font='30px "Noto Serif SC","Songti SC",serif';ctx.textAlign='center';ctx.fillText('诗',0,6);
 ctx.strokeStyle=w.color+'77';ctx.strokeRect(-22,-28,44,51);for(let i=0;i<4;i++){ctx.fillStyle=i<charge?'#d0ac65':'#a7ae9366';ctx.beginPath();ctx.arc((i-1.5)*11,-46,3.2,0,7);ctx.fill();}
 if(charge===4){ctx.save();ctx.globalAlpha=reduced?.6:.35+Math.sin(time*4)*.2;ring(ctx,0,-7,36,'#ceb777',2);ctx.restore();}
 for(let i=0;i<t.level;i++){ctx.fillStyle=i>=w.tier?'#bea06b':w.color;ctx.beginPath();ctx.arc((i-(t.level-1)/2)*5.5,36,1.8,0,7);ctx.fill();}
 if(t.hitUntil>time)ring(ctx,0,0,37,'#bc845e',2);
 if(t.verseShieldUntil>time&&t.verseShield>0)ring(ctx,0,-4,48,'#95bac4',2);
 ctx.font=labelFont+'px system-ui,"PingFang SC",sans-serif';const width=ctx.measureText(w.word).width;ctx.fillStyle='#f5f0e1ee';ctx.fillRect(-width/2-4,40,width+8,labelFont+4);ctx.fillStyle='#7e6c4c';ctx.fillText(w.word,0,40+labelFont);
 if(t.hp<defense.maxHp){ctx.fillStyle='#cfc6af';ctx.fillRect(-30,46+labelFont,60,4);ctx.fillStyle=t.hp/defense.maxHp>.4?'#72977a':'#b98362';ctx.fillRect(-30,46+labelFont,60*Math.max(0,t.hp/defense.maxHp),4);}
 if(selected){ctx.setLineDash([3,4]);ctx.strokeStyle='#b49d6d';ctx.strokeRect(-48,-55,96,101);ctx.setLineDash([]);}ctx.restore();
}
export function drawPoetryEffect(ctx,f,progress,{reduced=false,decorate=true}={}){
 const l=VERSE_INDEX.get(f.word);if(!l)return;
 const phase=reduced?.55:progress,color=f.color,from=f.from,to=f.to;
 if(f.kind==='poem-ink'){
  const x=from.x+(to.x-from.x)*phase,y=from.y+(to.y-from.y)*phase-Math.sin(phase*Math.PI)*20;
  ctx.save();ctx.translate(x,y);ctx.rotate((phase-.5)*.3);ctx.font='17px "Noto Serif SC",serif';ctx.textAlign='center';ctx.strokeStyle='#f4eedcbb';ctx.lineWidth=3;const glyph=[...f.word][f.shot%f.word.length];ctx.strokeText(glyph,0,0);ctx.fillStyle=color;ctx.fillText(glyph,0,0);ctx.restore();return;
 }
 const field=l.field,wide=f.field,center=wide?{x:450,y:255}:to,radius=wide?380:75+phase*45;
 if(wide){
  ctx.save();ctx.globalAlpha*=.35;ctx.strokeStyle=color;ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(center.x,center.y,420,225,0,0,7);ctx.stroke();ctx.setLineDash([10,13]);ctx.beginPath();ctx.ellipse(center.x,center.y,404,210,0,0,7);ctx.stroke();ctx.restore();
  if(field.includes('allShield')||field.includes('allMend')||field.includes('allHaste'))for(const p of f.allyPoints||[]){ring(ctx,p.x,p.y-5,28+phase*23,color,2);if(decorate)line(ctx,p.x-12,p.y-40,p.x+12,p.y-40,color,2);}
  if(field.some(k=>['allFreeze','allSlow'].includes(k)))for(let i=0;i<(decorate?28:10);i++){const x=(i*137+f.shot*53)%900,y=(i*97+phase*70)%500,s=3+i%4;line(ctx,x-s,y,x+s,y,color,1.3);line(ctx,x,y-s,x,y+s,color,1.3);if(decorate)ring(ctx,x,y,s*1.5,color+'88');}
  if(field.includes('allMend'))for(let i=0;i<22;i++){const x=(i*173+17)%900,y=(i*83+phase*95)%500;line(ctx,x,y,x-4,y+13,color,1.6);}
  if(field.includes('allReveal')){ring(ctx,450,150,45+phase*110,'#cdbd85',2);for(let i=0;i<(decorate?12:6);i++){const a=i*Math.PI/6;line(ctx,450+Math.cos(a)*70,150+Math.sin(a)*70,450+Math.cos(a)*(140+phase*60),150+Math.sin(a)*(140+phase*60),color+'66',1);}}
  if(field.includes('allSilence')||field.includes('allWeaken'))for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,70+i*85);ctx.bezierCurveTo(250,15+i*85+phase*20,600,140+i*65,900,60+i*85);ctx.strokeStyle=color+'66';ctx.lineWidth=4;ctx.stroke();}
 }
 const watery=/water|river|wave|ripple|spring|stream|rain|boat|waterfall/.test(l.art),snowy=/snow|frost|ice/.test(l.art),floral=/petal|lotus|plum|peach|leaf|grass|willow|chrysanthemum|rose|apricot|sprout/.test(l.art);
 const points=f.points?.length?f.points:[to];
 if(watery){for(const p of points.slice(0,8)){if(l.art==='waterfall'){ctx.beginPath();ctx.moveTo(p.x-28,p.y-105);ctx.bezierCurveTo(p.x-45,p.y-40,p.x+18,p.y-20,p.x-3,p.y+20);ctx.strokeStyle=color+'aa';ctx.lineWidth=18*(1-phase)+3;ctx.stroke();line(ctx,p.x+5,p.y-100,p.x+5,p.y+15,'#e6edf0',2);}else for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(p.x,p.y,15+phase*70+k*12,6+phase*18+k*3,0,0,7);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}}}
 else if(floral){for(const p of points.slice(0,8)){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+phase,s=13+phase*25;ctx.save();ctx.translate(p.x+Math.cos(a)*s,p.y+Math.sin(a)*s);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,6,14,0,0,7);ctx.fillStyle=color+'88';ctx.fill();ctx.restore();}ring(ctx,p.x,p.y,8+phase*12,color,2);}}
 else if(snowy){for(const p of points.slice(0,8)){for(let i=0;i<6;i++){const a=i*Math.PI/3;line(ctx,p.x,p.y,p.x+Math.cos(a)*(18+phase*30),p.y+Math.sin(a)*(18+phase*30),color,2);}ring(ctx,p.x,p.y,24+phase*16,color+'88');}}
 else if(/mountain|rock|sand|castle|tower/.test(l.art)){for(const p of points.slice(0,8)){ctx.beginPath();ctx.moveTo(p.x-42,p.y+20);ctx.lineTo(p.x-10,p.y-45-phase*24);ctx.lineTo(p.x+14,p.y-8);ctx.lineTo(p.x+30,p.y-30);ctx.lineTo(p.x+48,p.y+20);ctx.closePath();ctx.fillStyle=color+'44';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();for(let i=0;i<4;i++){const a=i*1.7;line(ctx,p.x+Math.cos(a)*18,p.y+Math.sin(a)*12,p.x+Math.cos(a)*(25+phase*36),p.y+Math.sin(a)*(25+phase*28),color,2);}}}
 else if(/fire|firecracker|incense|festival/.test(l.art)){for(const p of points.slice(0,8))for(let i=0;i<(decorate?10:5);i++){const a=i*2.4+phase,r=12+phase*55;line(ctx,p.x+Math.cos(a)*r*.5,p.y+Math.sin(a)*r*.5,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,color,2);ctx.beginPath();ctx.arc(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,2.5,0,7);ctx.fillStyle=color;ctx.fill();}}
 else if(/fish|fishing/.test(l.art)){for(let i=0;i<5;i++){const x=to.x+(i-2)*22+Math.sin(phase*5+i)*20,y=to.y+Math.cos(phase*4+i)*25;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(phase*4+i)*.4);ctx.beginPath();ctx.ellipse(0,0,12,5,0,0,7);ctx.moveTo(-10,0);ctx.lineTo(-18,-7);ctx.lineTo(-18,7);ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();}}
 else if(/voice|flute|bell|cricket|silence/.test(l.art)){for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(to.x,to.y,14+i*12+phase*38,-Math.PI*.8,Math.PI*.8);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}ctx.font='26px serif';ctx.fillStyle=color;ctx.fillText(l.art==='bell'?'◡':'♪',to.x-12,to.y+8);}
 else if(/wind|mist|cloud|fragrance|ribbon|soul|shadow/.test(l.art)){for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(to.x-65,to.y-30+i*15);ctx.bezierCurveTo(to.x-40+phase*25,to.y-70+i*17,to.x+50,to.y+45+i*10,to.x+75,to.y-30+i*15);ctx.strokeStyle=color+(i%2?'77':'cc');ctx.lineWidth=i%2?1:3;ctx.stroke();}}
 else if(/grain|crop|harvest|seed|plough|fruit|honey|cup/.test(l.art)){for(let i=0;i<(decorate?12:6);i++){const a=i*2.4,r=15+phase*45;ctx.save();ctx.translate(to.x+Math.cos(a)*r,to.y+Math.sin(a)*r);ctx.rotate(a+phase);ctx.beginPath();ctx.ellipse(0,0,3.5,8,0,0,7);ctx.fillStyle=color+'aa';ctx.fill();ctx.restore();}}
 else if(/gate|bridge|village|window|temple/.test(l.art)){for(const p of points.slice(0,8)){const h=25+phase*25;ctx.beginPath();ctx.moveTo(p.x-35,p.y+h*.5);ctx.lineTo(p.x-35,p.y-h*.5);ctx.lineTo(p.x,p.y-h);ctx.lineTo(p.x+35,p.y-h*.5);ctx.lineTo(p.x+35,p.y+h*.5);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();line(ctx,p.x-45,p.y-h*.5,p.x+45,p.y-h*.5,color,2);ring(ctx,p.x,p.y,14+phase*25,color+'66');}}
 else if(/pine|reed|bamboo|root|moss|herb/.test(l.art)){for(const p of points.slice(0,8))for(let i=0;i<5;i++){const x=p.x+(i-2)*16,h=22+((i*17)%35)+phase*22;line(ctx,x,p.y+18,x,p.y+18-h,color,2);for(let j=0;j<3;j++){line(ctx,x,p.y+8-j*13,x-8,p.y-j*13,color,1.5);line(ctx,x,p.y+8-j*13,x+9,p.y-5-j*13,color,1.5);}}}
 else if(/hoof|footstep|path|march|play/.test(l.art)){for(let i=0;i<7;i++){const ratio=(i/7+phase*.3)%1,x=from.x+(to.x-from.x)*ratio,y=from.y+(to.y-from.y)*ratio;ctx.save();ctx.translate(x,y+(i%2?8:-8));ctx.rotate(Math.atan2(to.y-from.y,to.x-from.x));ctx.beginPath();ctx.ellipse(0,0,7,4,0,0,7);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();}}
 else if(/bird|feather|swallow|kite|dragonfly|butterfly|bee|cicada/.test(l.art)){for(let i=0;i<Math.min(8,3+f.shot%5);i++){const x=from.x+(to.x-from.x)*phase+(i-3)*21,y=from.y+(to.y-from.y)*phase-35-Math.sin(i+phase*5)*14;ctx.beginPath();ctx.moveTo(x-13,y+5);ctx.quadraticCurveTo(x-6,y-10,x,y);ctx.quadraticCurveTo(x+6,y-10,x+13,y+5);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}}
 else if(/moon|star|glow|sun|jade|mirror|lantern|candle/.test(l.art)){for(const p of points.slice(0,8)){ring(ctx,p.x,p.y,18+phase*32,color,2);line(ctx,p.x-25,p.y,p.x+25,p.y,color+'88');line(ctx,p.x,p.y-25,p.x,p.y+25,color+'88');}}
 else {for(const p of points.slice(0,8)){ctx.save();ctx.translate(p.x,p.y);ctx.rotate((phase-.5)*.4);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(-22-phase*14,-22-phase*14,44+phase*28,44+phase*28);ctx.restore();}}
 ctx.save();ctx.globalAlpha*=.75;ctx.font='16px "Noto Serif SC",serif';ctx.textAlign='center';ctx.fillStyle=color;const x=clamp(from.x,110,790),y=clamp(from.y-65,35,435);ctx.strokeStyle='#f4efdfbb';ctx.lineWidth=4;ctx.strokeText(f.word,x,y);ctx.fillText(f.word,x,y);ctx.restore();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
