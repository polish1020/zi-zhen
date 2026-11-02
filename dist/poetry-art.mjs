import {VERSE_INDEX} from './poetry-rules.mjs';
const ring=(ctx,x,y,r,color,width=1)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
const line=(ctx,x,y,xx,yy,color,width=1)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
// Art families are shared by related images in a poem. They are visual only;
// the ordinary hit still uses the existing poetry damage and target rules.
export const POETRY_PROJECTILES={
 ripple:{name:'水纹',color:'#32798e',light:'#a2d6df',sound:'pulse'},
 torrent:{name:'流瀑',color:'#346b9a',light:'#a4d9ec',sound:'pulse'},
 frost:{name:'寒晶',color:'#506da7',light:'#c4e8f5',sound:'slow'},
 petal:{name:'飞花',color:'#a64e78',light:'#f0c6d7',sound:'aura'},
 leaf:{name:'青叶',color:'#3d764e',light:'#c4dfad',sound:'fast'},
 bird:{name:'飞羽',color:'#506d88',light:'#d0e3ed',sound:'sniper'},
 star:{name:'流星',color:'#9e7330',light:'#fae9a3',sound:'pierce'},
 moon:{name:'月弧',color:'#79609c',light:'#e0d7f6',sound:'aura'},
 sun:{name:'日芒',color:'#b9782d',light:'#ffe5a5',sound:'income'},
 sound:{name:'音波',color:'#845a98',light:'#e8d2f0',sound:'echo'},
 stone:{name:'山石',color:'#76604c',light:'#e6d6ad',sound:'heavy'},
 thread:{name:'锦丝',color:'#9b5f80',light:'#efd1e1',sound:'weave'},
 ward:{name:'守印',color:'#3c7e73',light:'#c8e5d5',sound:'mark'},
 ink:{name:'墨锋',color:'#36594f',light:'#d3dfb9',sound:'basic'},
 wind:{name:'清风',color:'#398680',light:'#bfe5d9',sound:'fast'},
 ember:{name:'火星',color:'#b24d31',light:'#ffd7a2',sound:'splash'},
 grain:{name:'金穗',color:'#998029',light:'#f1e3a7',sound:'income'},
 lantern:{name:'灯火',color:'#b47c3c',light:'#f8ddb1',sound:'aura'}
};
const imageGroups={
 ripple:'water wave fish fishing boat ripple river stream rain dew',torrent:'waterfall',frost:'frost snow ice',
 petal:'petal lotus plum maple chrysanthemum peach apricot rose',leaf:'leaf bamboo pine herb reed willow grass moss root sprout seed spring autumn',
 bird:'bird dragonfly crest feather kite swallow butterfly bee cicada',star:'star stars',moon:'moon jade mirror glow',sun:'dawn sunset sun seasons',
 sound:'voice silence cricket bell flute',stone:'mountain rock sand castle tower',thread:'scissors weave ribbon',
 ward:'heart shade hand seal festival unity resolve bridge temple village window gate',ink:'ink soul march path footstep hoof play scroll spear',
 wind:'cloud wind mist fragrance shadow storm broom',ember:'fire incense firecracker',grain:'plough grain harvest field fruit crop honey cup',lantern:'lantern candle firefly'
};
const sceneGroups={
 ripple:'deep_pool river undertow eddy bridge ferry',torrent:'waterfall',frost:'snowdrift frost_armor',
 petal:'lotus plum petals scent spring_back',leaf:'seed vine willow bamboo leaves grass sprout renewal',
 bird:'grounding updraft kite swallow geese',star:'stars meteor scatter rainbow',moon:'moon mirror afterglow pearl',sun:'sun horizon ascend clock seasons',
 sound:'echo bell song silence_watch lullaby call chorus drum',stone:'wall gate bastion horizon_gate sand',thread:'weave needle cocoon reunion fellowship',
 ward:'resolve return_home guest solitude companions rally umbrella purity medicine offering dew oath',ink:'memory farewell trail footprints turning book ink_wash shadow compass',
 wind:'mist shroud cloud',ember:'forge ember beacon',grain:'harvest harvest_field wine',lantern:'lantern lantern_chain'
};
const invert=groups=>Object.fromEntries(Object.entries(groups).flatMap(([family,words])=>words.split(' ').map(word=>[word,family])));
export const POETRY_IMAGE_FAMILIES=invert(imageGroups),POETRY_SCENE_FAMILIES=invert(sceneGroups);
export function poetryProjectileProfile(word,rule){const l=typeof word==='string'?VERSE_INDEX.get(word):word,family=POETRY_SCENE_FAMILIES[rule]||POETRY_IMAGE_FAMILIES[l?.art]||'ink';return{family,...POETRY_PROJECTILES[family]};}

export function drawTowerRuin(ctx,t,w,{point,selected=false,labelFont=10}){
 ctx.save();ctx.translate(point.x,point.y);ctx.textAlign='center';ctx.lineJoin='round';ctx.lineCap='round';
 ctx.beginPath();ctx.ellipse(0,24,34,8,0,0,Math.PI*2);ctx.fillStyle='#706b5e35';ctx.fill();
 ctx.beginPath();for(const[i,[x,y]]of [[-30,22],[-22,6],[-12,11],[-5,-3],[5,6],[19,2],[31,23]].entries())i?ctx.lineTo(x,y):ctx.moveTo(x,y);ctx.closePath();ctx.fillStyle='#b5ab9277';ctx.fill();ctx.strokeStyle='#84755e';ctx.lineWidth=2;ctx.stroke();
 // A torn, toppled fragment; never an intact small tower or grey rectangle.
 ctx.save();ctx.translate(-5,3);ctx.rotate(-.28);ctx.beginPath();ctx.moveTo(-14,12);ctx.lineTo(-15,-17);ctx.lineTo(-5,-19);ctx.lineTo(-2,-10);ctx.lineTo(4,-16);ctx.lineTo(15,-10);ctx.lineTo(14,10);ctx.lineTo(3,8);ctx.lineTo(-2,15);ctx.closePath();ctx.fillStyle='#ece2c8';ctx.fill();ctx.strokeStyle='#9c8a6b';ctx.lineWidth=2;ctx.stroke();ctx.font='19px serif';ctx.fillStyle='#82775f';ctx.fillText(w.icon,0,6);ctx.restore();
 line(ctx,-29,19,-17,15,'#756c59',2.5);line(ctx,12,18,26,26,'#756c59',3);line(ctx,-5,20,2,13,'#6f6656',2);
 const badge=Math.max(12,labelFont*.9);ctx.font=`bold ${badge}px sans-serif`;ctx.fillStyle='#f3e8d8';ctx.beginPath();ctx.arc(25,-10,badge*.72,0,7);ctx.fill();ctx.strokeStyle='#a37555';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#965e40';ctx.fillText('毁',25,-10+badge*.35);
 ctx.font=labelFont+'px system-ui,"PingFang SC",sans-serif';const width=ctx.measureText(w.word).width;ctx.fillStyle='#f4eddfed';ctx.fillRect(-width/2-3,32,width+6,labelFont+5);ctx.fillStyle='#76644e';ctx.fillText(w.word,0,33+labelFont);
 if(selected){ctx.setLineDash([4,4]);ring(ctx,0,3,40,'#a58b63',1.5);ctx.setLineDash([]);}ctx.restore();
}

// The signature is drawn in local units, so every family remains readable on
// a 320px battlefield. Critical geometry survives the dense-effects budget.
export function drawPoetrySigil(ctx,profile,x,y,size=1,angle=0,phase=0){
 const{family,color,light}=profile;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size,size);ctx.lineJoin='round';ctx.lineCap='round';
 const paint=(build,fill=false)=>{ctx.beginPath();build();if(fill){ctx.fillStyle=light;ctx.fill();}ctx.strokeStyle='#fff5e6';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();};
 const poly=points=>{points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
 switch(family){
  case'ripple':paint(()=>{for(let y=-6;y<=6;y+=6){ctx.moveTo(-11,y);ctx.quadraticCurveTo(-3,y-7,3,y);ctx.quadraticCurveTo(7,y+5,12,y);}});break;
  case'torrent':paint(()=>{for(let y=-6;y<=6;y+=6){ctx.moveTo(-15,y-3);ctx.bezierCurveTo(-4,y-6,7,y+9,13,y);}});break;
  case'frost':paint(()=>poly([[-12,0],[-2,-8],[13,0],[-2,8]]),true);paint(()=>{ctx.moveTo(-5,-10);ctx.lineTo(4,10);ctx.moveTo(-5,10);ctx.lineTo(4,-10);});break;
  case'petal':for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3+phase*.4);paint(()=>ctx.ellipse(5,0,8,4,0,0,7),true);ctx.restore();}break;
  case'leaf':paint(()=>{ctx.moveTo(-12,4);ctx.quadraticCurveTo(-2,-15,14,-3);ctx.quadraticCurveTo(6,13,-12,4);ctx.closePath();},true);paint(()=>{ctx.moveTo(-12,4);ctx.lineTo(12,-3);});break;
  case'bird':paint(()=>{ctx.moveTo(-12,7);ctx.quadraticCurveTo(-11,-10,2,0);ctx.quadraticCurveTo(2,-14,14,-7);ctx.moveTo(2,0);ctx.lineTo(-6,10);});break;
  case'star':paint(()=>poly([[14,0],[3,3],[0,12],[-4,4],[-13,0],[-3,-3],[0,-12],[4,-4]]),true);break;
  case'moon':paint(()=>{ctx.arc(0,0,12,-1.3,1.3);ctx.quadraticCurveTo(-7,0,3,-11.5);ctx.closePath();},true);break;
  case'sun':paint(()=>ctx.arc(0,0,7,0,7),true);paint(()=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.moveTo(Math.cos(a)*10,Math.sin(a)*10);ctx.lineTo(Math.cos(a)*15,Math.sin(a)*15);}});break;
  case'sound':paint(()=>{for(let i=0;i<3;i++){ctx.moveTo(-10+i*8,-10-i*2);ctx.quadraticCurveTo(2+i*8,0,-10+i*8,10+i*2);}});break;
  case'stone':paint(()=>poly([[-11,7],[-13,-4],[-4,-11],[7,-8],[14,3],[5,11]]),true);paint(()=>{ctx.moveTo(-4,-10);ctx.lineTo(0,1);ctx.lineTo(12,3);});break;
  case'thread':paint(()=>{for(const sign of[-1,1]){ctx.moveTo(-16,sign*5);ctx.bezierCurveTo(-6,-sign*13,5,sign*13,16,-sign*5);}});break;
  case'ward':paint(()=>poly([[-10,-12],[10,-12],[10,5],[0,13],[-10,5]]),true);paint(()=>{ctx.moveTo(-5,-3);ctx.lineTo(5,-3);ctx.moveTo(0,-8);ctx.lineTo(0,5);});break;
  case'ink':paint(()=>poly([[-17,-3],[8,-8],[16,0],[4,5],[-12,5],[-3,0]]),true);break;
  case'wind':paint(()=>{ctx.moveTo(-16,-7);ctx.bezierCurveTo(-4,-7,4,-14,12,-7);ctx.bezierCurveTo(19,4,0,5,3,-3);ctx.moveTo(-16,3);ctx.quadraticCurveTo(-4,11,9,7);});break;
  case'ember':paint(()=>{ctx.moveTo(-15,5);ctx.quadraticCurveTo(-3,-1,-3,-14);ctx.quadraticCurveTo(5,-4,14,-1);ctx.quadraticCurveTo(8,14,-15,5);ctx.closePath();},true);break;
  case'grain':for(let i=0;i<3;i++)paint(()=>ctx.ellipse(-7+i*8,(i%2?1:-1)*4,5,3,-.6,0,7),true);break;
  case'lantern':paint(()=>{ctx.ellipse(0,0,10,12,0,0,7);ctx.moveTo(-7,-11);ctx.lineTo(7,-11);ctx.moveTo(-7,11);ctx.lineTo(7,11);ctx.moveTo(0,12);ctx.lineTo(0,18);},true);break;
 }
 ctx.restore();
}

export function drawPoetryProjectile(ctx,f,progress,{reduced=false,decorate=true,unit=1}={}){
 const profile=poetryProjectileProfile(f.word),s=Math.max(1,Math.min(3.2,unit)),p=clamp(progress,0,1),travel=clamp(p/.7,0,1),from={x:f.from.x,y:f.from.y-24},to=f.to;
 const bend=['stone','grain','moon','petal'].includes(profile.family)?32:['bird','wind','thread'].includes(profile.family)?-24:8;
 const point=q=>({x:from.x+(to.x-from.x)*q,y:from.y+(to.y-from.y)*q-Math.sin(q*Math.PI)*bend});
 const tip=reduced?to:point(travel),angle=Math.atan2(to.y-from.y,to.x-from.x),tail=[];
 if(reduced){tail.push(from,to);}else for(let i=5;i>=0;i--)tail.push(point(Math.max(0,travel-i*.035)));
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 const trail=(color,width)=>{ctx.beginPath();tail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width*s;ctx.stroke();};
 trail('#fff4dfdd',4.8);trail(profile.color+(reduced?'77':'cc'),2.8);
 if(p<.25){ring(ctx,from.x,from.y,8+p*30,profile.color,2*s);}
 if(!reduced||p<.75)drawPoetrySigil(ctx,profile,tip.x,tip.y,s*.65,angle,p);
 if(decorate&&!reduced&&p<.7){const l=VERSE_INDEX.get(f.word),glyph=[...f.word][(f.shot||0)%l.word.length];ctx.font=`bold ${10.5*s}px "Noto Serif SC",serif`;ctx.textAlign='center';ctx.strokeStyle='#fff4df';ctx.lineWidth=3*s;ctx.strokeText(glyph,tip.x,tip.y-14*s);ctx.fillStyle=profile.color;ctx.fillText(glyph,tip.x,tip.y-14*s);}
 if(reduced||p>=.7){const burst=reduced?.4:(p-.7)/.3;ring(ctx,to.x,to.y,(6+burst*9)*s,profile.color,2*s);line(ctx,to.x-6*s,to.y,to.x+6*s,to.y,profile.color,2*s);line(ctx,to.x,to.y-6*s,to.x,to.y+6*s,profile.color,2*s);}
 ctx.restore();
}
export function drawPoetryTower(ctx,t,w,time,{point,defense,active,selected,reduced=false,labelFont=10,fieldReady={}}){
 const l=VERSE_INDEX.get(w.word),phase=reduced?0:time,charge=t.verseCharge||0;
 if(!active){drawTowerRuin(ctx,t,w,{point,selected,labelFont});return;}
 ctx.save();ctx.translate(point.x,point.y);
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
export function drawPoetryEffect(ctx,f,progress,{reduced=false,decorate=true,unit=1}={}){
 const l=VERSE_INDEX.get(f.word);if(!l)return;
 const phase=reduced?.55:progress,color=f.color,from=f.from,to=f.to;
 if(f.kind==='poem-ink'){
  drawPoetryProjectile(ctx,f,progress,{reduced,decorate,unit});return;
 }
 const field=f.fieldKinds??l.field,wide=f.field,center=wide?{x:450,y:255}:to,radius=wide?380:75+phase*45;
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
