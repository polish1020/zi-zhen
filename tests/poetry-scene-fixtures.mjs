import{poetryMastery}from'../dist/poetry-scene-rules.mjs';
import assert from 'node:assert/strict';
import {Game,POEM_LINES,towerStats,towerDefense,enemyPosition} from '../dist/engine.mjs';
import {recordPoetryDeath} from '../dist/poetry-scenes.mjs';
export function add(g,word,pad=2){g.ink=1e6;g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));assert.ok(g.build(word,pad),word);return g.towers.at(-1);}
export function arena(word,chapter=0){const g=new Game(chapter,42),t=add(g,word);g.time=10;g.phase='battle';g.wave=1;g.pendingWaves=[1];g.queue=[];return{g,t};}
export function enemy(g,kind='normal',d=300,route=0){const e=g.spawn(kind,d,route);e.hp=e.maxHp=1e7;e.shield=0;e.speed=.01;e.towerAttackAt=1e6;e.bossReadyAt=1e6;return e;}
export function cast(g,t){t.verseCharge=4;t.cooldown=100;g.attack(t,.01);assert.equal(t.verseCasts,1,t.word);return g.poetryScenes;}
export const pulse=(g,dt=.5)=>{g.time+=dt;g.updatePoetryScenes(dt);};
export function isolate(rule){const l=POEM_LINES.find(l=>l.signature.program.includes(rule)),{g,t}=arena(l.word);enemy(g);cast(g,t);g.poetryScenes=g.poetryScenes.filter(s=>s.rule===rule);return{g,t,s:g.poetryScenes[0]};}

export function exerciseRule(rule){
 const{g,t,s}=isolate(rule);g.enemies=[];
 for(const[word,pad]of[['火球',0],['冰霜',1],['弓箭',3],['石山',4],['雷击',6],['火球',9],['火球',8]])add(g,word,pad);
 const ruin=g.towers.at(-1);ruin.hp=0;for(const a of g.activeTowers)a.hp=towerDefense(a).maxHp*.3;
 const es=['normal','armor','swift','flying','normal','normal','normal','normal'].map((kind,i)=>enemy(g,kind,260+i*12));
 s.target=es[0].id;s.d=300;s.x=enemyPosition(es[0]).x;s.y=enemyPosition(es[0]).y;
 let maxActivity=0;
 for(let step=0;step<57;step++){
  g.time=10+step*.1;
  for(const[eidx,e]of es.entries()){
   e.d=step<10?260+eidx*12+step*5:step<30?310+eidx*12+(step-10)*12:step<38?850+eidx*30:300+eidx*12;
   e.towerTarget=t.id;e.towerStrikeAt=g.time+1;e.shield=step<10?100:0;
   if(step===12)e.hp-=200;
  }
  for(const a of g.activeTowers){a.chillUntil=g.time+2;a.corrodedUntil=g.time+2;if(a!==t){a.cooldown=0;g.attack(a,.1);}}
  if(step%5===2){for(const a of g.activeTowers){if(rule==='ascend'&&step>20&&a===t)continue;a.verseShield=40;a.verseShieldUntil=g.time+1;g.damageTower(a,50,es[0]);}}
  if(step===15||step===25){const dead=enemy(g,'normal',310);dead.hp=0;recordPoetryDeath(g,dead,1,enemyPosition);}
  if(step===0)es[0].hp=es[0].maxHp; // Fresh arrival for sleep, before first pulse.
  g.updatePoetryScenes(.1);maxActivity=Math.max(maxActivity,s.activity);
  assert.equal(ruin.hp,0,rule+' must not freely rebuild');assert.ok(g.activeTowers.every(a=>Number.isFinite(a.hp)&&a.hp<=towerDefense(a).maxHp));
  if(step%10===0)assert.deepEqual(Game.restore(g.export()).export(),g.export(),rule+' roundtrip');
  g.effects=[];g.events=[];
 }
 assert.ok(s.budget>=0&&s.budget<=s.power*poetryMastery(s.word).budget/POEM_LINES.find(l=>l.word===s.word).signature.program.length+1e-9);
 return{activity:maxActivity,g,t,s};
}
