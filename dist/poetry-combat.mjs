import{poetryMastery}from'./poetry-scene-rules.mjs';
import{poetryImpact}from'./poetry-impact.mjs';
import{createPoetryScenes}from'./poetry-scenes.mjs';
import {VERSE_INDEX,POETRY_TECHNIQUE_POWER} from './poetry-rules.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Independent poetry combat. It shares the battlefield's actual enemies,
// shields, armour, ward protection and reflection rules, never bypassing them.
export function attackPoetry(g,t,dt,api){
 const {word:w,stats,defense,position,length,isAir,enemy,iceShell,shellLimit}=api;
 const l=VERSE_INDEX.get(w.word),p=g.pads[t.pad],now=g.time,mastery=poetryMastery(w.word);
 const living=g.enemies.filter(e=>e.hp>0&&e.d<length(e));if(!living.length)return;
 const points=new Map(living.map(e=>[e.id,position(e)])),at=e=>points.get(e.id)||position(e);
 const local=living.filter(e=>(distance(p,at(e))<=stats.range||t.verseHorizonUntil>now&&t.verseHorizonTarget===e.id));
 const progress=e=>e.d/length(e);
 const rank=xs=>xs.slice().sort((a,b)=>{
  if(t.verseHorizonUntil>now&&t.verseHorizonTarget&&(a.id===t.verseHorizonTarget||b.id===t.verseHorizonTarget))return Number(b.id===t.verseHorizonTarget)-Number(a.id===t.verseHorizonTarget);
  if(l.aim==='boss')return Number(!!enemy[b.kind].boss)-Number(!!enemy[a.kind].boss)||b.maxHp-a.maxHp;
  if(l.aim==='shield')return(b.shield||0)-(a.shield||0)||progress(b)-progress(a);
  if(l.aim==='weak')return a.hp/a.maxHp-b.hp/b.maxHp;
  if(l.aim==='rear')return progress(a)-progress(b);
  if(l.aim==='nearest')return distance(p,at(a))-distance(p,at(b));
  if(l.aim==='air')return Number(isAir(b))-Number(isAir(a))||progress(b)-progress(a);
  if(l.aim==='ground')return Number(isAir(a))-Number(isAir(b))||progress(b)-progress(a);
  if(['east','west','north','south'].includes(l.aim))return(l.aim==='east'?at(b).x-at(a).x:l.aim==='west'?at(a).x-at(b).x:l.aim==='north'?at(a).y-at(b).y:at(b).y-at(a).y)||a.id-b.id;
  if(l.aim==='crowd'){const count=e=>living.filter(x=>distance(at(x),at(e))<=100).length;return count(b)-count(a)||progress(b)-progress(a);}
  return progress(b)-progress(a);
 });
 const lights=g.activeTowers.filter(a=>a.id!==t.id&&api.getWord(a.word).type==='aura'&&distance(g.pads[a.pad],p)<=api.towerStats(a).range);
 const buff=Math.max(0,...lights.map(a=>api.towerStats(a).aura));
 const damage=stats.damage*(1+buff),affected=new Set();let technique=false,attackPower=1;
 const hit=(e,ratio=1)=>{if(!e||e.hp<=0)return;affected.add(e);poetryImpact(g,t,e,damage*ratio*attackPower*(technique?POETRY_TECHNIQUE_POWER*mastery.opening:1),api,p);};
 const slow=(e,factor,seconds)=>{if(iceShell(e))return;e.slowFactor=Math.min(e.slowUntil>now?e.slowFactor??1:1,factor);e.slowUntil=Math.max(e.slowUntil||0,now+seconds);};
 const freeze=(e,seconds)=>{if(iceShell(e)||e.freezeReady>now)return;e.freezeUntil=Math.max(e.freezeUntil||0,now+seconds*(enemy[e.kind].boss?.25:1));e.freezeReady=now+6;};
 const silence=(e,seconds)=>{if(e.silenceReady>now)return;e.silencedUntil=Math.max(e.silencedUntil||0,now+seconds*(enemy[e.kind].boss?.25:1));e.silenceReady=now+4;};
 t.cooldown-=dt;
 if(t.cooldown<=0&&local.length){
  const target=rank(local)[0];attackPower=(1+Math.max(t.lessonPowerUntil>now?.3:0,t.idiomPowerUntil>now?t.idiomPower||0:0))*(t.lessonStored===true?1.25:1);hit(target);attackPower=1;if(t.lessonPowerUntil>now)t.lessonPowerUntil=0;if(t.idiomPowerUntil>now)t.idiomPowerUntil=0;if(t.lessonStored===true)t.lessonStored=false;t.shots=(t.shots||0)+1;t.verseCharge=Math.min(l.charge,(t.verseCharge||0)+1);
  g.effects.push({kind:'poem-ink',from:{...p},to:{...at(target)},word:w.word,color:w.color,art:l.art,shot:t.shots,life:.5,max:.5});
  const haste=Math.max(t.verseHasteUntil>now?t.verseHastePower||0:0,t.lessonHasteUntil>now?.15:0,...lights.map(a=>api.getWord(a.word).tier>=4?.12:api.getWord(a.word).tier>=3?.06:0));
  const frozen=g.enemies.some(e=>e.hp>0&&(enemy[e.kind].behavior||e.kind)==='frostboss'&&distance(at(e),p)<=130),jam=g.enemies.some(e=>e.hp>0&&e.jamUntil>now&&distance(at(e),p)<=(enemy[e.kind].pulse?.radius||95));
  const disrupted=Math.max(frozen?.25:0,jam?.2:0,t.chillUntil>now?.15:0);t.cooldown=stats.rate*(1+disrupted)/(1+haste);
 }
 if((t.verseCharge||0)<l.charge||t.verseReadyAt>now||!((t.hp??defense.maxHp)>0))return;
 if(!local.length&&!l.field.length)return;
 const fields=l.field;
 const target=rank(local.length?local:living)[0],q=at(target),within=living.filter(e=>distance(p,at(e))<=stats.range);
 affected.clear();technique=true;
 const ordered=rank(within.length?within:[target]);
 const allies=(count,injured=true)=>g.activeTowers.filter(a=>distance(g.pads[a.pad],p)<=stats.range).sort((a,b)=>injured?(a.hp/api.towerDefense(a).maxHp)-(b.hp/api.towerDefense(b).maxHp)||a.id-b.id:a.id-b.id).slice(0,count);
 const protect=(a,fraction,seconds)=>{const value=api.towerDefense(a).maxHp*Math.min(.2,fraction*mastery.support);a.verseShield=Math.max(a.verseShieldUntil>now?a.verseShield||0:0,value);a.verseShieldUntil=Math.max(a.verseShieldUntil||0,now+seconds);};
 const heal=(a,fraction)=>{a.hp=Math.min(api.towerDefense(a).maxHp,a.hp+api.towerDefense(a).maxHp*fraction*mastery.support);};
 const haste=(a,power,seconds)=>{a.verseHastePower=Math.max(a.verseHasteUntil>now?a.verseHastePower||0:0,Math.min(.25,power*mastery.support));a.verseHasteUntil=Math.max(a.verseHasteUntil||0,now+seconds);};
 for(const[k,a,b,c]of l.ops){
  if(k==='strike'){for(let i=0;i<a;i++)hit(target.hp>0?target:ordered.find(e=>e.hp>0),b);}
  else if(k==='burst'){for(const e of rank(living.filter(e=>distance(at(e),q)<=c)).slice(0,a))hit(e,b);}
  else if(k==='chain'){const used=new Set();let next=target;for(let i=0;i<a&&next;i++){hit(next,b);used.add(next.id);const last=at(next);next=rank(living.filter(e=>e.hp>0&&!used.has(e.id)&&distance(at(e),last)<=c))[0];}}
  else if(k==='fan'){const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;const cone=ordered.filter(e=>{const z=at(e),d=distance(p,z)||1;return((z.x-p.x)*dx+(z.y-p.y)*dy)/(d*len)>=Math.cos(c);});for(const e of cone.slice(0,a))hit(e,b);}
  else if(k==='line'){const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;for(const e of ordered.filter(e=>{const z=at(e),along=((z.x-p.x)*dx+(z.y-p.y)*dy)/len;return along>=0&&Math.abs((z.x-p.x)*dy-(z.y-p.y)*dx)/len<=c;}).slice(0,a))hit(e,b);}
  else if(k==='sky'||k==='ground'){const preferred=ordered.filter(e=>isAir(e)===(k==='sky')),rest=k==='sky'?ordered.filter(e=>!preferred.includes(e)):[];for(const e of[...preferred,...rest].slice(0,a))hit(e,b);}
  else if(k==='heal')for(const friend of allies(b))heal(friend,a);
  else if(k==='shield')for(const friend of allies(c))protect(friend,a,b);
  else if(k==='guard')for(const friend of allies(c)){friend.verseGuardPower=Math.max(friend.verseGuardUntil>now?friend.verseGuardPower||0:0,Math.min(.2,a*mastery.support));friend.verseGuardUntil=Math.max(friend.verseGuardUntil||0,now+b);}
  else if(k==='haste')for(const friend of allies(c,false))haste(friend,a,b);
  else if(k==='allShield')for(const friend of g.activeTowers)protect(friend,a,b);
  else if(k==='allMend')for(const friend of g.activeTowers){heal(friend,a);friend.chillUntil=0;friend.corrodedUntil=0;}
  else if(k==='allHaste')for(const friend of g.activeTowers)haste(friend,a,b);
  else if(k==='allFreeze')for(const e of living)if(e.hp>0)freeze(e,a);
  else if(k==='allSlow')for(const e of living)if(e.hp>0)slow(e,a,b);
  else if(k==='allSilence')for(const e of living)if(e.hp>0)silence(e,a);
  else if(k==='allReveal')for(const e of living)if(e.hp>0)e.lightUntil=Math.max(e.lightUntil||0,now+a);
  else if(k==='allWeaken')for(const e of living)if(e.hp>0)e.siegeWeakUntil=Math.max(e.siegeWeakUntil||0,now+a);
  else for(const e of affected){if(e.hp<=0)continue;
   if(k==='slow')slow(e,a,b);if(k==='freeze')freeze(e,a);if(k==='silence')silence(e,a);
   if(k==='mark'){e.markPower=Math.max(e.markUntil>now?e.markPower||0:0,a);e.markUntil=Math.max(e.markUntil||0,now+b);}
   if(k==='burn'){e.burnDps=Math.max(e.burnUntil>now?e.burnDps||0:0,damage*a*POETRY_TECHNIQUE_POWER*mastery.opening);e.burnUntil=Math.max(e.burnUntil||0,now+b);}
   if(k==='armor')e.breakUntil=Math.max(e.breakUntil||0,now+a);
   if(k==='shred')e.shield=Math.max(0,(e.shield||0)-Math.min((e.shield||0)*a,damage*3));
   if(k==='reveal')e.lightUntil=Math.max(e.lightUntil||0,now+a);
   if(k==='push'&&!(e.recoilReady>now)){e.d=Math.max(0,e.d-a*(enemy[e.kind].boss?.2:1));e.recoilReady=now+3;}
  }
 }
 createPoetryScenes(g,t,l,target,api);
 t.verseCharge=0;t.verseReadyAt=now+l.cooldown;t.verseCasts=(t.verseCasts||0)+1;
 const field=fields.length>0;g.effects.push({kind:'poem-cast',word:w.word,art:l.art,color:w.color,from:{...p},to:{...q},aim:l.aim,field,fieldKinds:fields,shot:t.verseCasts,allyPoints:field?g.activeTowers.map(a=>({...g.pads[a.pad]})):[],points:[...affected].slice(0,16).map(e=>({...at(e)})),life:field?2.1:1.35,max:field?2.1:1.35});g.emit('poem-cast',{word:w.word,poem:w.poem,art:l.art,field});
}
