import assert from 'node:assert/strict';
import {Game,getWord,towerStats,PADS} from '../dist/engine.mjs';
const spots=[2,4,6,8,1,9,0,7,10,3,5,11];
function invest(g){let spent=0;for(let loop=0;loop<24;loop++){
 const pad=spots.find(i=>!g.towers.some(t=>t.pad===i));
 const candidates=g.availableWords().filter(w=>w.damage&&w.cost<=g.ink).sort((a,b)=>(b.damage/b.rate)*(b.type==='slow'?1.9:b.type==='splash'?1.7:b.type==='chain'?1.5:1)/b.cost-(a.damage/a.rate)*(a.type==='slow'?1.9:a.type==='splash'?1.7:a.type==='chain'?1.5:1)/a.cost);
 if(pad!==undefined&&candidates.length){g.build(candidates[0].word,pad);continue;}
 const up=g.towers.filter(t=>t.level<getWord(t.word).maxLevel&&g.upgradeCost(t)<=g.ink).sort((a,b)=>towerStats(b).damage/towerStats(b).rate-towerStats(a).damage/towerStats(a).rate)[0];
 if(up){g.upgrade(up.id);continue;}
 if(pad!==undefined&&g.ink>g.refreshCost()+55&&spent<3){g.refreshHand();spent++;continue;}break;
}}
for(let chapter=0;chapter<3;chapter++){let wins=0,minHP=100;for(let seed=1;seed<=40;seed++){const g=new Game(chapter,seed);while(g.phase==='prepare'){invest(g);g.startWave();let tick=0;while(g.phase==='battle'&&tick++<5000)g.step(.1);if(tick>=5000)throw Error('hung');}if(g.phase==='won')wins++;minHP=Math.min(minHP,g.hp);}assert.equal(wins,40,`Chapter ${chapter+1} legal-play simulation`);console.log({chapter,wins,total:40,minHP});}
