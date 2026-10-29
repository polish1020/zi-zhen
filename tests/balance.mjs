import assert from 'node:assert/strict';
import {Game,getWord,towerStats,CHAPTERS,enemyLength} from '../dist/engine.mjs';
const spots=[2,4,6,8,1,9,0,7,10,3,5,11,12,13,14,15];
function invest(g){let refresh=0;for(let loop=0;loop<30;loop++){
 let pad=spots.find(i=>!g.towers.some(t=>t.pad===i)&&g.padUnlocked(i));
 const needAir=g.towers.filter(t=>getWord(t.word).damage&&getWord(t.word).type!=='heavy').length<Math.max(3,Math.ceil(g.towers.length/2));
 const words=g.availableWords().filter(w=>w.damage&&w.cost<=g.ink&&(!needAir||w.type!=='heavy')).sort((a,b)=>score(b)-score(a));
 function score(w){const count=type=>g.towers.filter(t=>getWord(t.word).type===type).length;const diversity=w.type==='aura'?(count('aura')===0&&g.towers.length>=4?5:.2):w.type==='income'?(count('income')===0&&g.towers.length>=4?6:.1):w.type==='mark'?(count('mark')===0&&g.towers.length>=3?2:.6):w.type==='slow'&&count('slow')<2?2.8:w.type==='poison'&&count('poison')<1?1.5:w.type==='heavy'&&count('heavy')>=3?.65:1;return diversity* w.damage/w.rate*(w.type==='slow'?1.6:w.type==='splash'?1.6:w.type==='chain'?1.5:w.type==='poison'?1.4:w.type==='pulse'?2:w.type==='pierce'?1.5:w.type==='echo'?1.6:1)/w.cost;}
 if(pad!==undefined&&words.length){g.build(words[0].word,pad);continue;}
 const up=g.towers.filter(t=>t.level<getWord(t.word).maxLevel&&g.upgradeCost(t)<=g.ink).sort((a,b)=>towerStats(b).damage/towerStats(b).rate-towerStats(a).damage/towerStats(a).rate)[0];
 if(up){g.upgrade(up.id);continue;}
 if(pad===undefined){const locked=spots.find(i=>!g.padUnlocked(i));if(locked!==undefined&&g.ink>=g.unlockCost()+50){g.unlockPad(locked);continue;}}
 if(pad===undefined&&g.ink>300){const replacement=words.find(w=>w.tier>=3&&!['aura','income'].includes(w.type));const weak=g.towers.filter(t=>getWord(t.word).tier===1&&!['aura','income'].includes(getWord(t.word).type)).sort((a,b)=>towerStats(a).damage/towerStats(a).rate-towerStats(b).damage/towerStats(b).rate)[0];if(replacement&&weak){const at=weak.pad;g.sell(weak.id);g.build(replacement.word,at);continue;}}
 if((pad!==undefined||g.ink>300)&&g.ink>g.refreshCost()+55&&refresh<2){g.refreshHand();refresh++;continue;}break;
}}
const n=Number(process.argv[2]||40),skills=process.argv.includes('--skills');
for(let ch=0;ch<CHAPTERS.length;ch++){let wins=0,hps=[],rounds=[];for(let seed=1;seed<=n;seed++){const g=new Game(ch,seed);let lastWave=-1,steps=0;while(!['won','lost'].includes(g.phase)&&steps++<50000){if(g.phase==='prepare'){invest(g);g.startWave();}if(g.phase==='intermission'&&g.wave!==lastWave){lastWave=g.wave;invest(g);}if(skills&&g.phase==='battle'&&g.skillCost()<=90&&g.ink>=g.skillCost()+40&&g.enemies.filter(e=>e.d/enemyLength(e)>.72).length>=3)g.skill();g.step(.1);}if(g.phase==='won')wins++;else if(process.argv.includes('--details'))console.log({ch:ch+1,seed,wave:g.wave,ink:g.ink,towers:g.towers.map(t=>t.word),threats:g.enemies.filter(e=>e.d/enemyLength(e)>.7).map(e=>({kind:e.kind,hp:Math.round(e.hp)}))});hps.push(g.hp);rounds.push(Math.ceil(g.wave/3));}if(!process.argv.includes('--report-only'))assert.ok(wins>=Math.ceil(n*(ch===0?.95:ch===1?.90:.85)),`Chapter ${ch+1} exceeds the intended casual difficulty`);console.log({chapter:ch+1,skills,wins,total:n,minHP:Math.min(...hps),meanHP:Math.round(hps.reduce((a,b)=>a+b,0)/n*10)/10,minRound:Math.min(...rounds),failedRounds:rounds.filter((_,i)=>hps[i]===0)});}
