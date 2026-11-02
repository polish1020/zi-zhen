import{SCENE_RULES,SCENE_LIFE,SCENE_LIMIT,SCENE_TICK,poetryMastery}from'./poetry-scene-rules.mjs';
import{poetryImpact}from'./poetry-impact.mjs';
function signalScene(g,s){s.activity=(s.activity||0)+1;if(s.activity===1)g.emit('poem-scene-action',{word:s.word,rule:s.rule});}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hitRules=new Set('bamboo resolve fellowship return_home mirror umbrella forge frost_armor needle pearl cocoon rally dew ascend shroud'.split(' '));
const deathRules=new Set('seed memory harvest scatter oath'.split(' '));
const pointToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,k=d?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1):0;return dist(p,{x:a.x+dx*k,y:a.y+dy*k});};
export function createPoetryScenes(g,t,line,target,api){
 g.poetryScenes??=[];g.poetryScenes=g.poetryScenes.filter(s=>s.tower!==t.id);
 const origin=g.pads[t.pad],point=api.position(target),power=api.towerStats(t).damage,route=target.route??0,d=target.d/api.length(target)*api.length({...target,kind:'normal'});
 for(const rule of line.signature.program){
  if(g.poetryScenes.length>=SCENE_LIMIT)break;
  const s={id:g.nextId++,tower:t.id,word:t.word,rule,born:g.time,until:g.time+SCENE_LIFE,next:g.time,beat:0,power,budget:power*poetryMastery(t.word).budget/line.signature.program.length,aid:power*poetryMastery(t.word).aid,x:point.x,y:point.y,ox:origin.x,oy:origin.y,route,d,target:target.id,targets:[],seen:[],records:[],points:[],events:[],activity:0,a:0,b:0,c:0,mode:(t.verseCasts||0)%4};
  g.poetryScenes.push(s);g.effects.push({kind:'poem-scene-born',word:t.word,rule,name:line.signature.name,to:{...point},from:{...origin},color:api.getWord(t.word).color,life:1.4,max:1.4});
 }
}
// Reactive events are bounded and stored with their field, so they survive reload.
export function recordPoetryDeath(g,e,earned,position){
 if(!g.poetryScenes?.length)return;const p=position(e);
 for(const s of g.poetryScenes)if(deathRules.has(s.rule)&&s.until>g.time&&g.towers.some(t=>t.id===s.tower&&t.hp>0&&!(t.disruptedUntil>g.time))&&dist({x:s.ox,y:s.oy},p)<360){if(s.rule==='harvest'){if(earned>0&&s.a<3&&!s.seen.includes(e.id)&&(g.poetryBonusEarned||0)<10){s.seen.push(e.id);signalScene(g,s);g.ink++;g.totalEarned++;g.poetryBonusEarned=(g.poetryBonusEarned||0)+1;s.a++;g.effects.push({kind:'coin',to:{...p},amount:1,life:.8,max:.8});}continue;}s.events.push({type:'death',target:e.id,tower:0,amount:Math.max(0,earned),shield:0,x:p.x,y:p.y,d:e.d,route:e.route??0,kind:e.kind,at:g.time});if(s.events.length>16)s.events.shift();}
}
export function recordPoetryHit(g,t,e,damage,shield=0){
 if(!g.poetryScenes?.length||!Number.isInteger(e.id)||e.id<1||damage<=0&&shield<=0)return;
 const p=g.pads[t.pad];for(const s of g.poetryScenes)if(hitRules.has(s.rule)&&s.until>g.time&&dist({x:s.ox,y:s.oy},p)<270){s.events.push({type:'hit',target:e.id,tower:t.id,amount:Math.max(0,damage),shield:Math.max(0,shield),x:p.x,y:p.y,d:e.d,route:e.route??0,kind:e.kind,at:g.time});if(s.events.length>16)s.events.shift();}
}
export function shelterPoetryHit(g,t,e,damage){
 if(!g.poetryScenes?.length||!Number.isInteger(e.id)||e.id<1)return damage;const p=g.pads[t.pad];
 const cover=g.poetryScenes.find(s=>s.rule==='umbrella'&&s.until>g.time&&s.a<3&&dist({x:s.ox,y:s.oy},p)<250&&g.towers.some(a=>a.id===s.tower&&(a.hp??1)>0&&!(a.disruptedUntil>g.time)));
 if(cover){cover.a++;cover.events.push({type:'cover',target:e.id,tower:t.id,amount:damage*.35,shield:0,x:p.x,y:p.y,d:e.d,route:e.route??0,kind:e.kind,at:g.time});if(cover.events.length>16)cover.events.shift();return damage*.65;}return damage;
}
export function poetryThreat(t,time){return t.verseDecoyUntil>time?-1:t.verseVeilUntil>time?1:0;}
export function clearPoetryScenes(g){g.poetryScenes=[];for(const t of g.towers){if(t.verseElevation!==undefined)t.verseElevation=0;if(t.verseHorizonTarget!==undefined){t.verseHorizonTarget=0;t.verseHorizonUntil=0;}if(t.verseVeilUntil!==undefined)t.verseVeilUntil=0;if(t.verseDecoyUntil!==undefined)t.verseDecoyUntil=0;}}
export function updatePoetryScenes(g,dt,api){
 for(const e of g.enemies){if(e.verseGrounded&&!(e.verseGroundUntil>g.time))e.verseGrounded=false;if(e.verseLifted&&!(e.verseLiftUntil>g.time))e.verseLifted=false;if(e.verseMove!==undefined)e.verseMove=1;}
 for(const t of g.towers){if(t.verseElevation!==undefined)t.verseElevation=0;if(t.verseHorizonUntil!==undefined&&!(t.verseHorizonUntil>g.time))t.verseHorizonTarget=0;}
 if(!g.poetryScenes?.length)return;
 g.poetryScenes=g.poetryScenes.filter(s=>s.until>g.time&&g.towers.some(t=>t.id===s.tower&&(t.hp??1)>0));
 const live=()=>g.enemies.filter(e=>e.hp>0&&e.d<api.length(e)),pos=api.position,now=g.time;
 for(const s of g.poetryScenes){
  const owner=g.towers.find(t=>t.id===s.tower);if(!owner||owner.disruptedUntil>now)continue;
  const activate=()=>signalScene(g,s);
  const origin={x:s.ox,y:s.oy},center={x:s.x,y:s.y},age=now-s.born;
  const nearby=(r=125)=>live().filter(e=>dist(pos(e),center)<=r),local=(r=275)=>live().filter(e=>dist(pos(e),origin)<=r);
  const front=xs=>xs.slice().sort((a,b)=>b.d/api.length(b)-a.d/api.length(a)||a.id-b.id);
  const allies=(r=275)=>g.activeTowers.filter(t=>dist(g.pads[t.pad],origin)<=r);
  const weak=()=>allies().sort((a,b)=>(a.hp/api.towerDefense(a).maxHp)-(b.hp/api.towerDefense(b).maxHp)||a.id-b.id);
  const target=()=>g.enemies.find(e=>e.id===s.target&&e.hp>0&&e.d<api.length(e));
  const record=e=>{let r=s.records.find(r=>r.id===e.id);if(!r&&s.records.length<32){const p=pos(e);r={id:e.id,hp:Math.max(0,e.hp),d:e.d,x:p.x,y:p.y,at:now,used:false,kind:e.kind};s.records.push(r);}return r;};
  const once=e=>{if(s.seen.includes(e.id)||s.seen.length>=96)return false;s.seen.push(e.id);return true;};
  const hit=(e,m=.3)=>{if(!e||e.hp<=0||s.budget<=0)return 0;const raw=Math.min(s.budget,s.power*Math.max(0,m)*poetryMastery(s.word).scene);s.budget-=raw;const before=e.hp+(e.shield||0),value=poetryImpact(g,owner,e,raw,api,center,s.rule);if(e.hp+(e.shield||0)<before)activate();return value;};
  const mark=(e,p=.12,secs=2)=>{if(!e||e.hp<=0)return;activate();e.markPower=Math.max(e.markUntil>now?e.markPower||0:0,p);e.markUntil=Math.max(e.markUntil||0,now+secs);};
  const reveal=(e,secs=2)=>{activate();e.lightUntil=Math.max(e.lightUntil||0,now+secs);};
  const slow=(e,f=.65,secs=.65)=>{if(api.iceShell(e))return;activate();e.slowFactor=Math.min(e.slowUntil>now?e.slowFactor??1:1,api.enemy[e.kind].boss?Math.max(.75,f):f);e.slowUntil=Math.max(e.slowUntil||0,now+secs);};
  const freeze=(e,secs=.6)=>{if(api.iceShell(e)||e.freezeReady>now)return false;activate();e.freezeUntil=Math.max(e.freezeUntil||0,now+secs*(api.enemy[e.kind].boss?.25:1));e.freezeReady=now+6;return true;};
  const silence=(e,secs=.8)=>{if(e.silenceReady>now)return;activate();e.silencedUntil=Math.max(e.silencedUntil||0,now+secs*(api.enemy[e.kind].boss?.25:1));e.silenceReady=now+4;};
  const push=(e,d=28)=>{if(e.recoilReady>now||api.iceShell(e))return;if(e.d>0)activate();e.d=Math.max(0,e.d-d*(api.enemy[e.kind].boss?.2:1));e.recoilReady=now+3;};
  const cancel=e=>{activate();delete e.towerTarget;delete e.towerStrikeAt;delete e.bossTargets;delete e.bossStrikeAt;e.towerAttackAt=Math.max(e.towerAttackAt||0,now+.6);if(api.enemy[e.kind].boss)e.bossReadyAt=Math.max(e.bossReadyAt||0,now+1.2);};
  const protect=(t,f=.05,secs=2)=>{if(!t||!(t.hp>0)||s.aid<=0)return;const value=Math.min(s.aid,api.towerDefense(t).maxHp*Math.min(.2,f)),old=t.verseShieldUntil>now?t.verseShield||0:0,until=Math.max(t.verseShieldUntil||0,now+secs);if(Math.max(old,value)===old&&until===t.verseShieldUntil)return false;s.aid-=value;t.verseShield=Math.max(old,value);t.verseShieldUntil=until;activate();return true;};
  const heal=(t,f=.02,over=false)=>{if(!t||!(t.hp>0)||s.aid<=0)return;const max=api.towerDefense(t).maxHp,amount=Math.min(s.aid,max*f),used=Math.min(amount,max-t.hp);t.hp+=used;s.aid-=used;if(used>0)activate();if(over&&used<amount)protect(t,Math.min(.08,(amount-used)/max),3);};
  const haste=(t,p=.1)=>{if(!t||!(t.hp>0))return;activate();t.verseHastePower=Math.max(t.verseHasteUntil>now?t.verseHastePower||0:0,p);t.verseHasteUntil=Math.max(t.verseHasteUntil||0,now+.8);};
  const routePoint=d=>pos({map:g.chapter,...(g.chapter===7?{mirrorLayout:g.mirrorLayout}:{}),kind:'normal',route:s.route,d:Math.max(0,d)});
  const eventEnemy=ev=>g.enemies.find(e=>e.id===ev.target&&e.hp>0);
  const hits=s.events.filter(e=>e.type==='hit'),deaths=s.events.filter(e=>e.type==='death');
  // Fields that react continuously rather than on the half-second pulse.
  if(s.rule==='deep_pool'||s.rule==='snowdrift'){
   const current=nearby(s.rule==='deep_pool'?100:130).filter(e=>!api.isAir(e));
   s.records=s.records.filter(r=>current.some(e=>e.id===r.id));
   for(const e of current){const r=record(e);if(!r||api.iceShell(e))continue;const depth=s.rule==='deep_pool'?Math.min(3,Math.floor((now-r.at)/.7)+1):Math.min(3,Math.floor(age/1.5)+1);activate();e.verseMove=Math.min(e.verseMove??1,api.enemy[e.kind].boss?1-depth*.05:1-depth*.15);}
  }
  if(s.rule==='ascend'){for(const ev of hits)if(ev.tower===owner.id)s.b=Math.max(s.b,ev.at);owner.verseElevation=Math.min(3,Math.max(0,Math.floor((now-Math.max(s.b,s.born))/1.2)));if(owner.verseElevation>0)activate();}
  if(s.rule==='mist')for(const t of allies(190)){t.verseVeilUntil=now+.2;activate();}
  if(s.rule==='shroud'){const t=weak()[0];if(t){s.targets=[t.id];t.verseVeilUntil=now+.2;activate();}}
  if(s.rule==='bastion'&&owner.hp/api.towerDefense(owner).maxHp<.35){activate();owner.verseGuardPower=.2;owner.verseGuardUntil=now+.3;owner.verseDecoyUntil=now+.3;}
  if(s.rule==='horizon'){
   if(!s.beat){const far=live().sort((a,b)=>dist(pos(b),origin)-dist(pos(a),origin))[0];if(far){activate();s.target=far.id;owner.verseHorizonTarget=far.id;owner.verseHorizonUntil=s.until;}}
   if(!target())owner.verseHorizonTarget=0;
  }
  if(now+1e-8<s.next)continue;s.next=now+SCENE_TICK;s.beat++;
  switch(s.rule){
   case'deep_pool':for(const e of nearby(100).filter(e=>!api.isAir(e)))if(record(e)&&age>1.4)hit(e,.1);break;
   case'snowdrift':for(const e of nearby(130).filter(e=>!api.isAir(e)))if(once(e)){hit(e,.22);slow(e,.65,1);}break;
   case'waterfall':{const d=s.d-60+age*38;s.x=routePoint(d).x;s.y=routePoint(d).y;for(const e of live().filter(e=>e.route===s.route&&Math.abs(e.d-d)<85).slice(0,6)){hit(e,.22);push(e,24);}}break;
   case'river':case'undertow':{const reverse=s.rule==='undertow',d=s.d+(reverse?115-age*45:-90+age*50),p=routePoint(d);s.x=p.x;s.y=p.y;for(const e of live().filter(e=>e.route===s.route&&Math.abs(e.d-d)<60))if(once(e)){hit(e,.5);if(reverse)push(e,40);}}break;
   case'eddy':for(const e of nearby(110)){const r=record(e);if(r&&!r.used&&e.d-r.d>55&&!(e.recoilReady>now)){push(e,55);hit(e,.45);r.used=true;}}break;
   case'mist':for(const e of nearby(140))if(e.towerStrikeAt>now&&once(e))slow(e,.8,1);break;
   case'bridge':for(const e of live().filter(e=>e.route===s.route)){const r=record(e);if(r&&r.d<s.d&&e.d>=s.d&&once(e)){const friend=allies().filter(t=>t!==owner).sort((a,b)=>dist(g.pads[a.pad],pos(e))-dist(g.pads[b.pad],pos(e)))[0];if(friend)hit(e,Math.min(.7,api.towerStats(friend).damage/s.power*.4));}if(r)r.d=e.d;}break;
   case'ferry':if(s.beat%2===1){const friend=weak().find(t=>t!==owner),far=front(live())[0];if(friend&&far){hit(far,Math.min(.6,api.towerStats(friend).damage/s.power*.35));s.points=[{...g.pads[friend.pad],used:false}];}}break;
   case'seed':for(const ev of deaths)if(s.points.length<8)s.points.push({x:ev.x,y:ev.y,used:false});for(const p of s.points.filter(p=>!p.used)){const e=live().find(e=>dist(pos(e),p)<55);if(e){hit(e,.55);slow(e,.6,1);p.used=true;}}break;
   case'lotus':{const friend=weak().find(t=>!s.seen.includes(t.id));if(friend&&(!s.targets.length||s.targets.length&&(g.towers.find(t=>t.id===s.targets[0])?.verseShield<=0||g.towers.find(t=>t.id===s.targets[0])?.verseShieldUntil<=now))){if(protect(friend,.08,3)){s.targets=[friend.id];if(s.seen.length<96)s.seen.push(friend.id);s.points=[{...g.pads[friend.pad],used:false}];}}}break;
   case'vine':{if(!s.targets.length){const xs=front(local());if(xs.length){const second=xs.slice().reverse().find(e=>e.id!==xs[0].id&&e.route===xs[0].route);if(second)s.targets=[xs[0].id,second.id];}}const pair=s.targets.map(id=>g.enemies.find(e=>e.id===id&&e.hp>0));if(pair.length===2&&pair.every(Boolean)){const[a,b]=pair;if(Math.abs(a.d-b.d)>80){const leader=a.d>b.d?a:b;push(leader,30);hit(leader,.25);}s.points=pair.map(e=>({...pos(e),used:false}));}}break;
   case'willow':{const a=s.beat*Math.PI/3,end={x:s.ox+Math.cos(a)*240,y:s.oy+Math.sin(a)*240};s.points=[{...end,used:false}];for(const e of local(240))if(pointToSegment(pos(e),origin,end)<35){hit(e,.28);slow(e,.7,1);}}break;
   case'bamboo':for(const ev of hits){s.a++;if(s.a>=3){s.a=0;hit(eventEnemy(ev),.75);}}break;
   case'plum':for(const e of nearby(150))if((e.slowUntil>now||e.freezeUntil>now||e.verseMove<1)&&once(e)){hit(e,.65);for(const other of nearby(150).filter(x=>x!==e&&dist(pos(x),pos(e))<70).slice(0,2))hit(other,.2);}break;
   case'leaves':for(const e of nearby(170))if((e.towerStrikeAt>now||e.bossStrikeAt>now)&&once(e)){e.shield=Math.max(0,(e.shield||0)-Math.min(s.power*.6,(e.shield||0)*.3));cancel(e);hit(e,.35);}break;
   case'petals':{const r=20+(s.beat%4)*35;s.a=r;for(const e of nearby(175))if(Math.abs(dist(pos(e),center)-r)<30)hit(e,.16);}break;
   case'grass':for(const t of weak().filter(t=>t.hp/api.towerDefense(t).maxHp<.5).slice(0,3))heal(t,.015);break;
   case'sprout':if(age>=2&&s.a===0){const e=nearby(120).find(e=>!api.isAir(e));if(e){s.a=1;hit(e,1);freeze(e,.55);}}break;
   case'grounding':for(const e of local().filter(e=>api.nativeAir(e)))if(!api.iceShell(e)&&!(e.verseGroundReady>now)&&once(e)){activate();e.verseGrounded=true;e.verseGroundUntil=now+(api.enemy[e.kind].boss?.75:3);e.verseGroundReady=now+8;hit(e,.3);}break;
   case'updraft':for(const e of nearby(120).filter(e=>!api.nativeAir(e)))if(!api.iceShell(e)&&once(e)&&freeze(e,.8)){e.verseLifted=true;e.verseLiftUntil=now+(api.enemy[e.kind].boss?.2:.8);const r=record(e);if(r)r.at=e.verseLiftUntil;}for(const r of s.records)if(!r.used&&r.at<=now){const e=g.enemies.find(e=>e.id===r.id);if(e&&e.hp>0){hit(e,.4);for(const a of nearby(160).filter(a=>a!==e&&dist(pos(a),pos(e))<75).slice(0,2))hit(a,.2);}r.used=true;}break;
   case'kite':{const a=age*2,p={x:s.ox+Math.cos(a)*150,y:s.oy+Math.sin(a)*100};s.points=[{...p,used:false}];const xs=local().sort((a,b)=>Number(api.isAir(b))-Number(api.isAir(a))||dist(pos(a),p)-dist(pos(b),p));if(xs[0]&&dist(pos(xs[0]),p)<180)hit(xs[0],.3);}break;
   case'swallow':{const phase=(s.beat%4)/3,p={x:s.ox+(s.x-s.ox)*phase,y:s.oy+(s.y-s.oy)*phase};s.points=[{...p,used:false}];for(const e of local())if(dist(pos(e),p)<70)hit(e,.22);}break;
   case'geese':{const axis=s.beat%3,xs=local().sort((a,b)=>axis===0?b.d/api.length(b)-a.d/api.length(a):axis===1?pos(a).x-pos(b).x:pos(b).x-pos(a).x);if(xs[0]){hit(xs[0],.35);s.points=[{...pos(xs[0]),used:false}];}}break;
   case'stars':if(!s.points.length)s.points=[[-75,20],[20,-60],[70,40]].map(([x,y])=>({x:s.x+x,y:s.y+y,used:false}));for(const p of s.points)if(!p.used){const e=live().find(e=>dist(pos(e),p)<80);if(e){p.used=true;hit(e,.65);}}break;
   case'meteor':if(s.beat%2){let e=target();if(!e){e=front(nearby(220))[0];if(e)s.target=e.id;}if(e){hit(e,.5);s.x=pos(e).x;s.y=pos(e).y;}}break;
   case'moon':{const angle=age*.9;for(const e of local()){const p=pos(e),a=Math.atan2(p.y-s.oy,p.x-s.ox),gap=Math.atan2(Math.sin(a-angle),Math.cos(a-angle));if(Math.abs(gap)<.65){reveal(e);mark(e,.1,1);if(once(e))hit(e,.3);}}s.a=angle;}break;
   case'sun':for(const e of nearby(170)){const r=record(e);if(!r)continue;if(e.shield>0){activate();e.shield=Math.max(0,e.shield-Math.min(s.power*.15,e.shield));r.used=true;}else if(r.used){hit(e,.6);r.used=false;}else hit(e,.12);}break;
   case'lantern':for(const e of local(190)){reveal(e);if((e.towerStrikeAt>now||e.bossStrikeAt>now)&&once(e)){cancel(e);hit(e,.35);}}break;
   case'echo':{const e=target();if(e){const r=record(e);if(r&&now-r.at>=2&&!r.used){hit(e,Math.min(1.5,Math.max(0,r.hp-e.hp)/s.power*.35));r.used=true;}}}break;
   case'bell':{const radius=age/SCENE_LIFE*340;s.a=radius;for(const e of local(340))if(Math.abs(dist(pos(e),origin)-radius)<45&&once(e)){if(e.towerStrikeAt>now||e.bossStrikeAt>now)cancel(e);hit(e,.4);}}break;
   case'song':{const kinds=[...new Set(allies().map(t=>api.getWord(t.word).type))];const index=s.beat-1;if(index<kinds.length&&index<4){const t=allies().find(t=>api.getWord(t.word).type===kinds[index]);haste(t,.08);hit(front(local())[0],.45);if(t)s.points.push({...g.pads[t.pad],used:false});}}break;
   case'silence_watch':for(const e of local())if((e.towerStrikeAt>now||e.bossStrikeAt>now)&&once(e)){silence(e,1);cancel(e);hit(e,.3);}break;
   case'lullaby':for(const e of nearby(150)){let r=s.records.find(r=>r.id===e.id);if(!r&&e.hp>=e.maxHp&&once(e)&&freeze(e,.8)){r=record(e);if(r)r.d=e.freezeUntil;}if(r&&!r.used&&e.hp<r.hp){if(e.freezeUntil<=r.d+1e-6)e.freezeUntil=now;hit(e,.45);r.used=true;}}break;
   case'call':if(s.beat===1){const friend=allies().filter(t=>t!==owner).sort((a,b)=>dist(g.pads[b.pad],origin)-dist(g.pads[a.pad],origin))[0];if(friend){heal(friend,.05);s.points=[{...g.pads[friend.pad],used:false}];hit(front(local())[0],Math.min(1,api.towerStats(friend).damage/s.power*.5));}}break;
   case'chorus':{const ts=allies().slice(0,3);s.points=ts.map(t=>({...g.pads[t.pad],used:false}));if(ts.length>=3){for(let i=0;i<3;i++)for(const e of local())if(pointToSegment(pos(e),g.pads[ts[i].pad],g.pads[ts[(i+1)%3].pad])<25&&once(e))hit(e,.45);if(s.beat===1)for(const t of ts)protect(t,.035,3);}}break;
   case'drum':for(const e of local()){const r=record(e);if(r&&e.d-r.d>=75){r.d=e.d;hit(e,.35);e.towerAttackAt=Math.max(e.towerAttackAt||0,now+.4);}}break;
   case'resolve':for(const ev of hits)if(ev.tower===owner.id&&owner.hp/api.towerDefense(owner).maxHp<.5)hit(eventEnemy(ev),Math.min(.8,ev.amount/s.power*.5));break;
   case'fellowship':{const ts=weak().slice(0,2);s.points=ts.map(t=>({...g.pads[t.pad],used:false}));for(const ev of hits){const hurt=ts.find(t=>t.id===ev.tower),other=ts.find(t=>t.id!==ev.tower);if(hurt&&other&&other.hp>1){const share=Math.min(ev.amount*.15,other.hp-1,s.aid);other.hp-=share;hurt.hp=Math.min(api.towerDefense(hurt).maxHp,hurt.hp+share);s.aid-=share;if(share>0)activate();hit(eventEnemy(ev),.2);}}}break;
   case'return_home':if(!s.targets.length){const t=weak()[0];if(t)s.targets=[t.id];}for(const ev of hits)if(s.targets.includes(ev.tower)){const t=g.towers.find(t=>t.id===ev.tower);protect(t,.05,2);hit(eventEnemy(ev),.35);}break;
   case'guest':{const friend=allies().filter(t=>t!==owner).sort((a,b)=>api.towerStats(b).damage-api.towerStats(a).damage)[0];if(friend){s.points=[{x:s.ox+35,y:s.oy+20,used:false}];if(s.beat%2)hit(front(local())[0],Math.min(.65,api.towerStats(friend).damage/s.power*.3));}}break;
   case'memory':for(const ev of deaths)if(!s.records.some(r=>r.kind===ev.kind)&&s.records.length<3)s.records.push({id:ev.target,hp:0,d:ev.d,x:ev.x,y:ev.y,at:now,used:true,kind:ev.kind});for(const e of local())if(s.records.some(r=>r.kind===e.kind)&&once(e)){reveal(e,4);mark(e,.15,3);e.breakUntil=now+2;hit(e,.25);}break;
   case'farewell':for(const e of live()){const r=record(e),inside=dist(pos(e),origin)<=275;if(r){if(!inside&&!r.used&&dist({x:r.x,y:r.y},origin)<=275){hit(e,.8);r.used=true;}r.x=pos(e).x;r.y=pos(e).y;}}break;
   case'reunion':{if(!s.targets.length){const xs=local();if(xs.length>=2)s.targets=[xs[0].id,xs.at(-1).id];}const es=s.targets.map(id=>g.enemies.find(e=>e.id===id&&e.hp>0));if(es.length===2&&es.every(Boolean)&&s.a===0&&dist(pos(es[0]),pos(es[1]))<90){s.a=1;hit(es[0],.7);hit(es[1],.7);}s.points=es.filter(Boolean).map(e=>({...pos(e),used:false}));}break;
   case'solitude':for(const e of local())if(!live().some(a=>a!==e&&dist(pos(a),pos(e))<100))hit(e,.35);break;
   case'companions':for(const e of nearby(180)){const types=new Set(live().filter(a=>dist(pos(a),pos(e))<90).map(a=>a.kind));if(types.size>=2&&once(e)){mark(e,.1,3);hit(e,.4);}}break;
   case'rally':for(const ev of hits){const t=g.towers.find(t=>t.id===ev.tower&&t.hp>0);if(t)haste(t,.12);}break;
   case'wall':for(const e of nearby(85).filter(e=>!api.isAir(e)))if(once(e)){freeze(e,.4);hit(e,.4);}break;
   case'gate':for(const e of front(local()).filter(e=>e.route===s.route)){const r=record(e);if(r){if(r.d<=s.d&&e.d>s.d&&once(e))hit(e,.8);r.d=e.d;}}break;
   case'mirror':if(s.beat===1)for(const t of weak().slice(0,2))protect(t,.04,3);for(const ev of hits)hit(eventEnemy(ev),Math.min(.65,(ev.amount+ev.shield)/s.power*.35));break;
   case'umbrella':for(const ev of s.events.filter(ev=>ev.type==='cover'))hit(eventEnemy(ev),Math.min(.65,ev.amount/s.power*.5));break;
   case'purity':for(const t of allies()){if(t.chillUntil>now||t.corrodedUntil>now||t.disruptedUntil>now)activate();t.chillUntil=0;t.corrodedUntil=0;t.disruptedUntil=0;}break;
   case'medicine':heal(weak()[0],.025,true);break;
   case'offering':if(s.beat===1){const friend=weak().find(t=>t!==owner);if(friend){const amount=Math.min(owner.hp-1,api.towerDefense(owner).maxHp*.06);if(amount>0){activate();owner.hp-=amount;friend.hp=Math.min(api.towerDefense(friend).maxHp,friend.hp+amount*1.25);}}}break;
   case'forge':for(const ev of hits){s.a+=ev.amount;if(s.a>s.power*.6&&s.b<3){const e=eventEnemy(ev)||front(local())[0];if(e){e.breakUntil=now+2;hit(e,.7);s.a=0;s.b++;}}}break;
   case'frost_armor':if(s.beat===1)for(const t of weak().slice(0,2))protect(t,.04,3);for(const ev of hits){const e=eventEnemy(ev);if(e){slow(e,.6,1.5);hit(e,.25);}}break;
   case'bastion':if(owner.hp/api.towerDefense(owner).maxHp<.35)for(const e of nearby(180))if(once(e))hit(e,.3);break;
   case'trail':for(const e of local()){const r=record(e);if(r&&e.d-r.d>=45&&s.points.length<12){const p=pos(e);s.points.push({...p,used:false});r.d=e.d;}}for(const p of s.points.filter(p=>!p.used)){const e=live().find(e=>dist(pos(e),p)<30&&!s.seen.includes(e.id));if(e){p.used=true;once(e);hit(e,.35);}}break;
   case'footprints':for(const e of local()){reveal(e,1);const r=record(e),ahead=pos({...e,d:e.d+8});if(r){const dir=Math.abs(ahead.x-pos(e).x)>Math.abs(ahead.y-pos(e).y)?0:1,previous=Math.abs(r.x-pos(e).x)>Math.abs(r.y-pos(e).y)?0:1;if(dir!==previous&&e.d-r.d>20)hit(e,.4);r.x=pos(e).x;r.y=pos(e).y;r.d=e.d;}}break;
   case'turning':for(const e of local()){const r=record(e),p=pos(e),a=pos({...e,d:e.d-12}),b=pos({...e,d:e.d+12});if(r&&Math.abs((p.x-a.x)*(b.y-p.y)-(p.y-a.y)*(b.x-p.x))>20&&e.d-r.d>35){hit(e,.55);r.d=e.d;}}break;
   case'horizon':if(s.beat===1&&target())reveal(target(),SCENE_LIFE);break;
   case'ascend':if(owner.verseElevation>=3&&s.a===0){s.a=1;hit(front(local(330))[0],.7);}break;
   case'sand':for(const e of local().filter(e=>!api.isAir(e))){const r=record(e);if(r&&e.d-r.d>55&&s.points.length<12){s.points.push({...pos(e),used:false});r.d=e.d;}}for(const p of s.points.filter(p=>!p.used)){const e=live().find(e=>!api.isAir(e)&&dist(pos(e),p)<35&&!s.seen.includes(e.id));if(e){once(e);p.used=true;slow(e,.55,1);hit(e,.2);}}break;
   case'harvest':for(const ev of deaths)if(ev.amount>0&&s.a<3&&(g.poetryBonusEarned||0)<10){g.ink++;g.totalEarned++;g.poetryBonusEarned=(g.poetryBonusEarned||0)+1;s.a++;g.effects.push({kind:'coin',to:{x:ev.x,y:ev.y},amount:1,life:.8,max:.8});}break;
   case'weave':{const ts=allies().filter(t=>t!==owner).slice(0,2);if(ts.length===2){s.points=ts.map(t=>({...g.pads[t.pad],used:false}));for(const e of local())if(pointToSegment(pos(e),s.points[0],s.points[1])<28&&once(e)){slow(e,.6,1.5);hit(e,.45);}}}break;
   case'needle':for(const ev of hits){const e=eventEnemy(ev);if(e){const r=record(e);if(r){if(r.used){e.breakUntil=now+2;hit(e,.6);r.used=false;}else r.used=true;}}}break;
   case'clock':if(Math.floor(age/1.5)%2===0)hit(front(local())[0],.2);else protect(weak()[0],.025,1.5);break;
   case'seasons':if(s.mode===0)heal(weak()[0],.015);else if(s.mode===1){const e=front(nearby(150))[0];if(e)hit(e,.22);}else if(s.mode===2){for(const e of nearby(130))if(once(e)){push(e,25);hit(e,.25);}}else for(const e of nearby(140)){slow(e,.7);if(once(e))hit(e,.2);}break;
   case'renewal':{const ruin=g.towers.find(t=>t.hp<=0&&dist(g.pads[t.pad],origin)<300);if(ruin){const p=g.pads[ruin.pad];s.points=[{...p,used:false}];if(s.beat%2)hit(front(live().filter(e=>dist(pos(e),p)<230))[0],.35);}}break;
   case'spring_back':if(age>2.5&&s.a===0&&nearby(120).length){s.a=1;for(const e of nearby(120)){hit(e,.6);slow(e,.65,1);}}break;
   case'book':{const kinds=[...new Set(local().map(e=>e.kind))];for(const kind of kinds)if(!s.records.some(r=>r.kind===kind)){const e=local().find(e=>e.kind===kind);record(e);}if(s.records.length>=3)for(const e of local())if(once(e)){reveal(e,3);mark(e,.14,3);hit(e,.2);}}break;
   case'rainbow':{const types=new Set(allies().map(t=>api.getWord(t.word).type)),enemies=front(local()).filter((e,i,xs)=>xs.findIndex(a=>a.kind===e.kind)===i);for(const e of enemies.slice(0,Math.min(4,types.size)))if(once(e)){reveal(e,3);hit(e,.5);}s.points=allies().slice(0,4).map(t=>({...g.pads[t.pad],used:false}));}break;
   case'dew':if(s.beat===1)for(const t of weak().slice(0,2))s.targets.push(t.id);for(const ev of hits)if(s.targets.includes(ev.tower)&&!s.seen.includes(ev.tower)){const t=g.towers.find(t=>t.id===ev.tower);if(t){s.seen.push(t.id);heal(t,.035);for(const e of live().filter(e=>dist(pos(e),g.pads[t.pad])<110).slice(0,3))hit(e,.25);}}break;
   case'cloud':{const p=routePoint(s.d+age*35);s.x=p.x;s.y=p.y;for(const e of nearby(110))if(once(e)){e.towerAttackAt=Math.max(e.towerAttackAt||0,now+1.2);hit(e,.2);}}break;
   case'scent':{const e=target();if(e){s.x=pos(e).x;s.y=pos(e).y;slow(e,.8);for(const a of local().filter(a=>a!==e&&a.route===e.route&&dist(pos(a),pos(e))<140)){if(a.d>e.d)push(a,18);slow(a,.65);if(once(a))hit(a,.25);}}}break;
   case'ember':for(const e of local()){const r=record(e);if(!r)continue;if(e.shield>0)r.used=true;else if(r.used){hit(e,.7);for(const a of local().filter(a=>a!==e&&dist(pos(a),pos(e))<90).slice(0,2))hit(a,.2);r.used=false;}}break;
   case'pearl':for(const ev of hits)if(ev.shield>0){s.a++;if(s.a>=3){s.a=0;hit(front(local())[0],.8);}}break;
   case'wine':{const t=weak().find(t=>t!==owner)||owner,r=s.records.find(r=>r.id===t.id);if(!r){s.records.push({id:t.id,hp:t.hp,d:t.shots||0,x:g.pads[t.pad].x,y:g.pads[t.pad].y,at:now,used:false,kind:'normal'});haste(t,.15);}else if(!r.used&&(t.shots||0)-r.d>=3){r.used=true;t.cooldown=Math.max(t.cooldown,.7);s.a=now+.7;}if(s.a&&now>=s.a&&s.b===0){s.b=1;hit(front(local())[0],1);}}break;
   case'oath':{const e=target();if(e){mark(e,.1,1);if(s.beat%2)hit(e,.35);}else if(deaths.some(ev=>ev.target===s.target)&&s.a===0){s.a=1;for(const t of weak().slice(0,3))protect(t,.07,3);}}break;
   case'beacon':{const routes=[...new Set(live().map(e=>e.route))];for(const route of routes){const e=front(live().filter(e=>e.route===route))[0];if(e&&e.d/api.length(e)>.55&&once(e)){reveal(e,3);hit(e,.6);push(e,20);}}}break;
   case'compass':{const dir=(s.beat-1)%4,e=front(local().filter(e=>{const p=pos(e);return dir===0?p.x>=s.ox:dir===1?p.y>=s.oy:dir===2?p.x<s.ox:p.y<s.oy;}))[0];s.a=dir;if(e){hit(e,.3);reveal(e,1);}}break;
   case'shroud':for(const ev of hits)if(!s.targets.includes(ev.tower))hit(eventEnemy(ev),.3);break;
   case'harvest_field':for(const e of nearby(110).filter(e=>!api.isAir(e)))if(once(e)){s.a++;if(s.a%3===0)for(const a of nearby(150))hit(a,.4);}break;
   case'afterglow':{const progress=(age/SCENE_LIFE),p={x:s.x+(s.ox-s.x)*progress,y:s.y+(s.oy-s.y)*progress};s.points=[{...p,used:false}];for(const e of live())if(dist(pos(e),p)<60&&once(e)){reveal(e,2);hit(e,.5);}}break;
   case'horizon_gate':{const routes=[...new Set(live().map(e=>e.route))];for(const route of routes){if(s.a&(1<<route))continue;const e=front(live().filter(e=>e.route===route&&e.d/api.length(e)>.45))[0];if(e){s.a|=1<<route;hit(e,.8);push(e,24);}}}break;
   case'ink_wash':{const e=target();if(e){mark(e,.1,1);for(const a of live().filter(a=>a!==e&&dist(pos(a),pos(e))<90))if(once(a)){mark(a,.1,2);hit(a,.25);}}}break;
   case'cocoon':if(s.beat===1){const t=weak()[0];if(t){s.targets=[t.id];protect(t,.09,4);s.points=[{...g.pads[t.pad],used:false}];}}for(const ev of hits)if(s.targets.includes(ev.tower))s.a+=ev.shield;if(age>4&&s.b===0){s.b=1;hit(front(local())[0],Math.min(1.5,s.a/s.power));}break;
   case'shadow':{const e=target();if(e){const r=record(e);if(r&&now-r.at>=.5){if(Math.abs(e.d-r.d)<1||e.towerStrikeAt>now||e.bossStrikeAt>now)hit(e,.4);r.d=e.d;r.at=now;s.x=pos(e).x;s.y=pos(e).y;}}}break;
   case'scatter':{const e=target();if(!s.points.length&&(!e||dist(pos(e),center)>160))s.points=[[-65,-20],[15,60],[70,-35]].map(([x,y])=>({x:s.x+x,y:s.y+y,used:false}));for(const p of s.points)if(!p.used){const a=live().find(a=>dist(pos(a),p)<75);if(a){p.used=true;hit(a,.6);}}}break;
   case'lantern_chain':{const ts=allies().sort((a,b)=>dist(g.pads[a.pad],origin)-dist(g.pads[b.pad],origin)),i=s.beat-1;if(i<ts.length){const p=g.pads[ts[i].pad],a=i?g.pads[ts[i-1].pad]:origin;protect(ts[i],.025,2);s.points.push({...p,used:false});const e=live().find(e=>pointToSegment(pos(e),a,p)<60&&!s.seen.includes(e.id));if(e){once(e);reveal(e,2);hit(e,.4);}}}break;
   default:throw Error('Unimplemented poetry scene '+s.rule);
  }
  s.events=[];
 }
}
export function clonePoetryScenes(scenes){return scenes.map(s=>({...s,targets:[...s.targets],seen:[...s.seen],records:s.records.map(r=>({...r})),points:s.points.map(p=>({...p})),events:s.events.map(e=>({...e}))}));}
export function validatePoetryScenes(data,api){
 const finite=n=>typeof n==='number'&&Number.isFinite(n),nonnegative=n=>finite(n)&&n>=0,int=n=>Number.isSafeInteger(n)&&n>=0,xy=n=>finite(n)&&Math.abs(n)<=5000;
 const scenes=data.poetryScenes??[];if(!Array.isArray(scenes)||scenes.length>SCENE_LIMIT||data.version<11&&scenes.length)throw Error('Invalid poetry scenes');
 const fields=new Set('id tower word rule born until next beat power budget aid x y ox oy route d target targets seen records points events activity a b c mode'.split(' '));
 const ids=new Set([...data.towers,...data.enemies].map(e=>e.id)),programs=new Set();
 for(const s of scenes){
  if(!s||typeof s!=='object'||Object.keys(s).some(k=>!fields.has(k))||!Object.hasOwn(SCENE_RULES,s.rule))throw Error('Invalid scene rule');
  const t=data.towers.find(t=>t.id===s.tower),l=api.line(s.word),key=s.tower+':'+s.rule;if(programs.has(key))throw Error('Duplicate scene rule');programs.add(key);
  if(!t||t.word!==s.word||!l?.signature.program.includes(s.rule)||!int(s.id)||s.id<1||s.id>=data.nextId||ids.has(s.id))throw Error('Invalid scene owner');ids.add(s.id);
  if(!['born','until','next','power','budget','aid','d','a','b','c'].every(k=>nonnegative(s[k]))||!['x','y','ox','oy'].every(k=>xy(s[k]))||!['beat','route','target','mode','activity'].every(k=>int(s[k]))||s.mode>3||s.route>=api.routes(data.chapter,data.mirrorLayout)||s.born>data.time+1e-6||Math.abs(s.until-s.born-SCENE_LIFE)>1e-6||s.next<s.born||s.next>s.until+1||s.power>api.towerStats(t).damage+1e-6||s.budget>s.power*poetryMastery(s.word).budget/l.signature.program.length+1e-6||s.aid>s.power*poetryMastery(s.word).aid+1e-6)throw Error('Invalid scene budget');
  for(const[key,limit]of[['targets',16],['seen',96]])if(!Array.isArray(s[key])||s[key].length>limit||new Set(s[key]).size!==s[key].length||s[key].some(id=>!int(id)||id<1||id>=data.nextId))throw Error('Invalid scene targets');
  if(!Array.isArray(s.records)||s.records.length>32||new Set(s.records.map(r=>r?.id)).size!==s.records.length||s.records.some(r=>!r||!int(r.id)||r.id<1||r.id>=data.nextId||!['hp','d','at'].every(k=>nonnegative(r[k]))||!xy(r.x)||!xy(r.y)||typeof r.used!=='boolean'||!api.enemy[r.kind]||Object.keys(r).some(k=>!['id','hp','d','x','y','at','used','kind'].includes(k))))throw Error('Invalid scene records');
  if(!Array.isArray(s.points)||s.points.length>16||s.points.some(p=>!p||!xy(p.x)||!xy(p.y)||typeof p.used!=='boolean'||Object.keys(p).some(k=>!['x','y','used'].includes(k))))throw Error('Invalid scene points');
  if(!Array.isArray(s.events)||s.events.length>16||s.events.some(e=>!e||!['hit','death','cover'].includes(e.type)||!['target','tower','route'].every(k=>int(e[k]))||e.target<1||e.target>=data.nextId||!['amount','shield','d','at'].every(k=>nonnegative(e[k]))||!xy(e.x)||!xy(e.y)||!api.enemy[e.kind]||Object.keys(e).some(k=>!['type','target','tower','amount','shield','x','y','d','route','kind','at'].includes(k))))throw Error('Invalid scene events');
 }
 if(data.poetryBonusEarned!==undefined&&(!int(data.poetryBonusEarned)||data.poetryBonusEarned>10))throw Error('Invalid poetry harvest');
 for(const e of data.enemies){if(['verseGroundUntil','verseGroundReady','verseLiftUntil'].some(k=>e[k]!==undefined&&!nonnegative(e[k]))||['verseGrounded','verseLifted'].some(k=>e[k]!==undefined&&typeof e[k]!=='boolean')||e.verseMove!==undefined&&(!finite(e.verseMove)||e.verseMove<.5||e.verseMove>1)||e.verseGrounded&&!finite(e.verseGroundUntil)||e.verseLifted&&!finite(e.verseLiftUntil))throw Error('Invalid poetry movement');}
 for(const t of data.towers){if(['verseHorizonUntil','verseVeilUntil','verseDecoyUntil'].some(k=>t[k]!==undefined&&!nonnegative(t[k]))||t.verseElevation!==undefined&&(!int(t.verseElevation)||t.verseElevation>3)||t.verseHorizonTarget!==undefined&&(!int(t.verseHorizonTarget)||t.verseHorizonTarget>=data.nextId))throw Error('Invalid poetry tower rule');}
}
