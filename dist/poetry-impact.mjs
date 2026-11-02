const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Shared by ordinary poem attacks, the opening cast and persistent scenes.
export function poetryImpact(g,t,e,raw,api,origin=g.pads[t.pad],scene=false){
 if(!e||e.hp<=0||raw<=0)return 0;
 const {position,enemy,iceShell,shellLimit}=api,now=g.time,point=position(e),revealed=e.lightUntil>now||e.markUntil>now||e.breakUntil>now;
 let armor=e.kind==='armor'?.3:e.kind==='ironboss'?(e.enraged?0:.4):(enemy[e.kind].armor||0);if(e.breakUntil>now)armor=0;
 let resist=1;const behavior=enemy[e.kind].behavior||e.kind;
 if(behavior==='bamboostalker'&&!revealed&&distance(origin,point)>(enemy[e.kind].stealthDistance||130))resist*=.7;
 if(behavior==='clockwork'&&!revealed&&!(enemy[e.kind].boss&&e.enraged)){const ahead=position({...e,d:e.d+4});if((origin.x-point.x)*(ahead.x-point.x)+(origin.y-point.y)*(ahead.y-point.y)>0)resist*=.55;}
 if(behavior==='astral'&&!revealed&&api.astralPhase(e,now)===1)resist*=.65;
 if(iceShell(e)){resist*=enemy[e.kind].boss?.8:.85;e.shellHits=Math.min(shellLimit(e),(e.shellHits||0)+1);}
 const ward=!revealed&&g.enemies.some(a=>a!==e&&a.kind==='ward'&&a.hp>0&&distance(position(a),point)<110);
 const guard=Math.max(g.bossSupport(e).guard,ward?.12:0,!revealed&&e.guardUntil>now?e.guardPower||0:0);
 let amount=raw*(1-armor)*(1-guard)*resist*(e.markUntil>now?1+(e.markPower||0):1);
 const absorbed=Math.min(e.shield||0,amount);e.shield=Math.max(0,(e.shield||0)-absorbed);amount-=absorbed;e.hp-=Math.max(0,amount);
 const reflect=Math.max(g.bossSupport(e).reflect,enemy[e.kind].boss&&api.bossPower(e.kind).reflect&&(e.bossStrikeAt>now||e.reflectUntil>now)?.12:0);
 if(e.hp>0&&amount>0&&reflect&&!(t.reflectReadyAt>now)){t.reflectReadyAt=now+.8;g.damageTower(t,Math.min(amount*reflect,api.towerDefense(t).maxHp*.03),e,false);g.effects.push({kind:'reflected',from:point,to:g.pads[t.pad],color:api.getWord(t.word).color,life:.6,max:.6});}
 if(scene)g.effects.push({kind:'poem-scene-hit',rule:typeof scene==='string'?scene:'',word:t.word,from:{...origin},to:{...point},color:api.getWord(t.word).color,damage:Math.max(0,amount),life:.55,max:.55});
 return Math.max(0,amount);
}
