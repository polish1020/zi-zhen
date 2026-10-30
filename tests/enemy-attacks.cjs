const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,ENEMIES,ENEMY_ATTACK_ART,enemyWeapon,enemyPosition,enemyLength}=await import('../dist/engine.mjs');
 const representatives=Object.keys(ENEMY_ATTACK_ART).map(visual=>Object.keys(ENEMIES).find(kind=>enemyWeapon(kind).visual===visual));
 const scenarios=process.env.ATTACK_SMOKE?[[393,852,'frostboss',false],[667,375,'stormboss',true]]:[...representatives.map(kind=>[393,852,kind,false]),[320,568,'ironboss',false],[667,375,'stormboss',true],[1440,1000,'plaguequeen',false],[393,852,'boss',false,24]];
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height,kind,reduce,crowd=0]of scenarios){
  const g=new Game(0,42),w=enemyWeapon(kind);g.ink=2000;let near={distance:Infinity};
  for(let d=20;d<enemyLength({kind,map:0,route:0});d+=10){const p=enemyPosition({kind,map:0,route:0,d});for(let pad=0;pad<12;pad++){const distance=Math.hypot(g.pads[pad].x-p.x,g.pads[pad].y-p.y);if(distance<near.distance)near={distance,d,pad};}}
  g.hand=[...'文文文文文文文文文文文文文文文文'].map(ch=>({id:++g.handSerial,ch,used:false}));assert.ok(g.build('文',near.pad));g.towers[0].cooldown=1e6;
  g.phase='battle';g.wave=12;g.pendingWaves=[12];const e=g.spawn(kind,near.d,0,12);e.hp=e.maxHp=100000;e.speed=.01;e.towerAttackAt=0;e.abilityAt=e.pulseAt=1e6;for(let i=0;i<crowd;i++){const other=g.spawn('normal',near.d,0,12);other.hp=other.maxHp=100000;other.speed=.01;other.towerAttackAt=0;other.abilityAt=other.pulseAt=1e6;}g.updateTowerAttacks();assert.ok(e.towerTarget);if(crowd)assert.equal(g.enemies.filter(a=>a.towerTarget).length,crowd+1);
  const c=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900,reducedMotion:reduce?'reduce':'no-preference'}),p=await c.newPage(),errors=[];p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(data=>{const raf=requestAnimationFrame;let clock=1000;window.requestAnimationFrame=fn=>raf(()=>fn(clock));window.__tick=()=>new Promise(resolve=>{clock+=100;raf(()=>raf(resolve));});window.__damageDraws=[];window.__labels=[];const proto=CanvasRenderingContext2D.prototype,stroke=proto.strokeText,fill=proto.fillText;proto.strokeText=function(text,...args){if(/^−/.test(text))window.__damageDraws.push(text);return stroke.call(this,text,...args);};proto.fillText=function(text,...args){window.__labels.push(text);return fill.call(this,text,...args);};localStorage.setItem('wordward-save-v1',JSON.stringify(data));localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{value:true});},g.export());
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();
  if(ENEMIES[kind].boss)await p.waitForFunction(name=>window.__labels.includes(name),w.name);
  if(kind==='frostboss')await p.locator('#battlefield').screenshot({path:`/workspace/shared/wordward-siege-warning-${engine}.png`});
  await p.locator('#resume').click();for(let i=0;i<Math.ceil(w.windup*10)+2;i++)await p.evaluate(()=>window.__tick());await p.locator('#start').click();
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.ok(saved.towers[0].hp<g.towers[0].hp,kind);if(crowd){assert.equal(saved.enemies.filter(e=>e.towerLastTarget).length,crowd+1);assert.ok(saved.towers[0].hp>0);await p.locator('#battlefield').screenshot({path:`/workspace/shared/wordward-siege-crowd-${engine}.png`});}assert.ok((await p.evaluate(()=>window.__damageDraws)).length>0,'actual durability damage must be painted');
  const shots=await p.locator('#battlefield').screenshot();assert.ok(shots.length>1000);
  if(['frostboss','ironboss','stormboss','plaguequeen'].includes(kind))await p.locator('#battlefield').screenshot({path:`/workspace/shared/wordward-siege-hit-${engine}-${kind}.png`});
  await p.locator('.map-target').nth(near.pad).click();const hp=await p.locator('#tower-hp').innerText();assert.match(hp,/耐久/);await p.locator('#repair').click();const repaired=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.ok(repaired.towers[0].hp>saved.towers[0].hp);
  assert.equal(repaired.time,saved.time);assert.deepEqual(repaired.enemies,saved.enemies);assert.equal(await p.locator('.boss-status').count(),0);
  if(width<=900){assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight>document.documentElement.clientHeight+1),false);const b=await p.locator('#repair').boundingBox();assert.ok(b.y+b.height<=height+1);}
  assert.deepEqual(errors,[]);await c.close();console.log(`PASS ${engine} ${width}x${height} ${kind}/${w.visual}: telegraph, actual hit, painted durability damage, pause/repair, reduced=${reduce}`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
