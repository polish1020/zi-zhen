const assert=require('node:assert/strict');
const{chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4180',engine=process.env.BROWSER||'chromium';
(async()=>{
 const{Game,POEM_LINES,enemyPosition}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
  for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
   const g=new Game(0,42);g.ink=10000;
   for(const[word,pad]of[['千山鸟飞绝',2],['桃花潭水深千尺',4],['飞流直下三千尺',6],['火球',1]]){g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));assert.ok(g.build(word,pad));}
   g.phase='battle';g.wave=1;g.pendingWaves=[1];g.queue=[];g.time=10;
   for(const t of g.towers){if(t.word.length>4)t.verseCharge=4;t.cooldown=10;}
   for(let i=0;i<12;i++){const e=g.spawn(i===0?'flying':'normal',i<6?280+i*12:740+(i-6)*12);e.hp=e.maxHp=1e7;e.speed=2;e.towerAttackAt=1e6;}
   const c=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900}),p=await c.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(data=>{if(!sessionStorage.getItem('scene-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(data));sessionStorage.setItem('scene-fixture','1');}localStorage.setItem('wordward-audio-v1','off');Object.defineProperty(navigator,'standalone',{value:true});},g.export());
   await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();await p.locator('#resume').click();await p.waitForTimeout(1450);await p.locator('#start').click();
   const snapshot=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
   assert.equal(snapshot.version,11);assert.equal(snapshot.poetryScenes.length,6);assert.ok(snapshot.poetryScenes.filter(s=>['grounding','deep_pool','waterfall'].includes(s.rule)).every(s=>s.activity>0));assert.ok(snapshot.enemies.some(e=>e.verseGrounded));assert.ok(snapshot.enemies.some(e=>e.verseMove<1));assert.equal(snapshot.hp,g.hp);
   const before=snapshot.time;await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')).time),before,'paused scene clocks');
   await p.locator('.map-target').nth(4).click({force:true});assert.match(await p.locator('.tower-effects').innerText(),/千尺深潭/);assert.equal(await p.locator('.tower-effects .poetry-scene-list li').count(),2);assert.doesNotMatch(await p.locator('.tower-effects').innerText(),/行为原语|实现|共用底层/);
   if(width<900){assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1),false);const r=await p.locator('#upgrade').boundingBox();assert.ok(r.y+r.height<=height+1);}
   if(width===393)await p.screenshot({path:`/tmp/wordward-poetry-scenes-${engine}.png`});
   await p.reload({waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();const restored=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.deepEqual(restored.poetryScenes,snapshot.poetryScenes);assert.equal(restored.enemies.find(e=>e.verseGrounded)?.id,snapshot.enemies.find(e=>e.verseGrounded)?.id);
   if(width===393){
    const audit=await p.evaluate(async()=>{
     const{Game,POEM_LINES,getWord,enemyPosition,nativeAir}=await import('./engine.js');const{drawPoetryScenes,drawSceneBurst}=await import('./poetry-scene-art.js');
     const canvas=document.createElement('canvas');canvas.width=900;canvas.height=520;const ctx=canvas.getContext('2d'),rules=new Set();let drawings=0;
     for(const l of POEM_LINES){const g=new Game(0,42);g.ink=10000;g.hand=[...l.word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));if(!g.build(l.word,2))throw Error(l.word);g.time=10;const t=g.towers[0];for(const kind of['normal','flying','armor']){const e=g.spawn(kind,300);e.hp=e.maxHp=1e7;}t.cooldown=10;t.verseCharge=4;g.attack(t,.1);g.time+=.8;g.updatePoetryScenes(.8);for(const s of g.poetryScenes)rules.add(s.rule);
      for(const reduced of[false,true]){ctx.clearRect(0,0,900,520);drawPoetryScenes(ctx,g,{getWord,position:enemyPosition,nativeAir},{reduced,mobile:true});for(const f of g.effects.filter(f=>f.kind.startsWith('poem-scene-')))drawSceneBurst(ctx,f,.4,{reduced});if(!ctx.getImageData(0,0,900,520).data.some((n,i)=>i%4===3&&n))throw Error('Blank '+l.word);drawings++;}
     }return{drawings,rules:rules.size};
    });assert.deepEqual(audit,{drawings:966,rules:90});
   }
   assert.deepEqual(errors,[]);await c.close();console.log(`PASS ${engine} ${width}x${height}: real landing/pool/waterfall, paused clocks, 6 live fields, saved actors, actual descriptions and reachable buttons${width===393?', all 483 scene programs / 90 rules drawn in both motion modes':''}`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
