import {getWord,towerStats,towerDefense,towerActive} from '../dist/engine.mjs';
export function maintain(g){const reserve=g.activeTowers.length<3?0:30;const targets=g.towers.filter(t=>!towerActive(t)||(t.hp??towerDefense(t).maxHp)<towerDefense(t).maxHp*.4).sort((a,b)=>Number(!towerActive(b))-Number(!towerActive(a))||b.spent-a.spent);for(const t of targets)if(g.ink>=g.repairCost(t)+reserve)g.repair(t.id);}
const spots=[2,4,6,8,1,9,0,7,10,3,5,11,12,13,14,15];
export function invest(g){maintain(g);let refresh=0;for(let loop=0;loop<30;loop++){
 let pad=spots.find(i=>!g.towers.some(t=>t.pad===i)&&g.padUnlocked(i));
 const needAir=g.activeTowers.filter(t=>getWord(t.word).damage&&getWord(t.word).type!=='heavy').length<Math.max(3,Math.ceil(g.activeTowers.length/2));
 const words=g.availableWords().filter(w=>w.damage&&w.cost<=g.ink&&(!needAir||w.type!=='heavy')).sort((a,b)=>score(b)-score(a));
 function score(w){const count=type=>g.activeTowers.filter(t=>getWord(t.word).type===type).length;const formBonus=w.trait==='combo'?1.4:w.trait==='dragon'?1.7:w.trait==='firewall'?1.3:w.trait==='spread'?(w.type==='poison'?1.6:1.2):1;const diversity=w.type==='aura'?(count('aura')===0&&g.towers.length>=4?5:.2):w.type==='income'?(count('income')===0&&g.towers.length>=4?6:.1):w.type==='mark'?(count('mark')===0&&g.towers.length>=3?2:.6):w.type==='slow'&&count('slow')<2?2.8:w.type==='poison'&&count('poison')<1?1.5:w.type==='heavy'&&count('heavy')>=3?.65:1;const support=w.type==='aura'?g.activeTowers.reduce((sum,t)=>sum+towerStats(t).damage/towerStats(t).rate,0)*w.aura/3:0;return diversity*(w.damage/w.rate+support)*formBonus*Math.min(1.25,w.range/160)*(w.type==='slow'?1.6:w.type==='splash'?1.6:w.type==='chain'?1.5:w.type==='poison'?1.4:w.type==='pulse'?2:w.type==='pierce'?1.5:w.type==='echo'?1.6:1)/w.cost;}
 if(pad!==undefined&&words.length){g.build(words[0].word,pad);continue;}
 const up=g.towers.filter(t=>towerActive(t)&&t.level<getWord(t.word).maxLevel&&g.upgradeCost(t)<=g.ink).sort((a,b)=>towerStats(b).damage/towerStats(b).rate-towerStats(a).damage/towerStats(a).rate)[0];
 if(up){g.upgrade(up.id);continue;}
 if(pad===undefined){const locked=spots.find(i=>!g.padUnlocked(i));if(locked!==undefined&&g.ink>=g.unlockCost()+50){g.unlockPad(locked);continue;}}
 if(pad===undefined&&g.ink>300){const replacement=words.find(w=>w.tier>=3&&!['aura','income'].includes(w.type));const weak=g.towers.filter(t=>getWord(t.word).tier===1&&!['aura','income'].includes(getWord(t.word).type)).sort((a,b)=>towerStats(a).damage/towerStats(a).rate-towerStats(b).damage/towerStats(b).rate)[0];if(replacement&&weak){const at=weak.pad;g.sell(weak.id);g.build(replacement.word,at);continue;}}
 if((pad!==undefined||g.ink>300)&&g.ink>g.refreshCost()+55&&refresh<2){g.refreshHand();refresh++;continue;}break;
}}

// Economy audit alternative: improve the actual formation, and stop buying
// random hands when no higher-quality replacement is possible.
export function investEfficient(g){
 maintain(g);
 if(g.towers.length<g.pads.length||g.towers.some(t=>t.level<getWord(t.word).maxLevel))return invest(g);
 const potential=g.towers.filter(t=>getWord(t.word).tier<4);
 if(!potential.length)return;
 const power=(word,level)=>{const w=getWord(word),s=towerStats({word,level});return s.damage/s.rate*(w.trait==='spread'?1.3:w.trait==='dragon'?1.5:1)*(w.type==='aura'?1.5:1);};
 for(let attempt=0;attempt<3;attempt++){
  const options=[];
  for(const t of potential)for(const w of g.availableWords()){
   const old=getWord(t.word);
   if(w.tier<=old.tier||w.type!==old.type||w.cost>g.ink+g.salvageValue(t)-40)continue;
   const gain=power(w.word,w.maxLevel)/power(t.word,t.level);
   if(gain>1.1)options.push({t,w,gain});
  }
  const choice=options.sort((a,b)=>b.gain-a.gain||b.w.tier-a.w.tier)[0];
  if(choice){const {t,w}=choice,pad=t.pad;g.sell(t.id);if(g.build(w.word,pad)){const built=g.towers.at(-1);while(g.ink>=g.upgradeCost(built)+40&&g.upgrade(built.id));}return;}
  if(attempt<2&&g.ink>g.refreshCost()+200)g.refreshHand();else break;
 }
}
