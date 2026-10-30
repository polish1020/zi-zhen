const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,towerDefense}=await import('../dist/engine.mjs');
 function fixture(){const g=new Game(0,42);g.ink=3000;for(const [pad,word]of ['文','守护'].map((w,i)=>[i*2,w])){const chars=[...word];while(chars.length<16)chars.push('火');g.hand=chars.map(ch=>({id:++g.handSerial,ch,used:false}));g.build(word,pad);}
  g.towers[0].hp-=80;g.towers[1].hp=0;for(const t of g.towers)t.cooldown=1e6;
  g.phase='battle';g.wave=12;g.pendingWaves=[12];const e=g.spawn('normal',110);e.hp=e.maxHp=10000;e.speed=.01;e.towerAttackAt=0;g.updateTowerAttacks();return g;}
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,
  ...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),
  ...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const g=fixture(),initial=g.ink,repair=g.repairCost(g.towers[0]),rebuild=g.repairCost(g.towers[1]),hand=JSON.stringify(g.hand);
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{if(!sessionStorage.getItem('siege-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('siege-fixture','1');}localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{value:true});},g.export());
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  const fits=async()=>{if(width<=900){assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>document.documentElement.clientHeight+1),false);for(const id of ['upgrade','repair','sell']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.y+b.height<=height+1,`${id} outside viewport`);}}};
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  await page.locator('.map-target').nth(0).click();assert.match(await page.locator('#tower-hp').innerText(),/耐久/);assert.match(await page.locator('.defense-effect').innerText(),/文脉/);await fits();
  await page.locator('#repair').click();assert.equal((await state()).ink,initial-repair);assert.equal((await state()).towers[0].hp,towerDefense(g.towers[0]).maxHp);assert.ok(await page.locator('#repair').isDisabled());
  await page.locator('#back-forge').click();await page.locator('.map-target').nth(2).click();assert.match(await page.locator('#tower-hp').innerText(),/废墟/);assert.ok(await page.locator('#upgrade').isDisabled());assert.match(await page.locator('#repair').innerText(),/重建/);await fits();
  await page.locator('#repair').click();let s=await state();assert.equal(s.ink,initial-repair-rebuild);assert.equal(s.towers[1].word,'守护');assert.equal(s.towers[1].level,2);assert.equal(JSON.stringify(s.hand),hand);assert.ok(s.towers[1].hp>0);
  await page.locator('#back-forge').click();await page.locator('#enemy-preview').click();assert.equal(await page.locator('.enemy-siege-description').count(),94);assert.match(await page.locator('[data-enemy-kind="ironboss"]').innerText(),/攻塔.*破阵重击/s);await page.locator('#close-modal').click();
  await page.locator('#resume').click();await page.waitForFunction(max=>{const s=JSON.parse(localStorage.getItem('wordward-save-v1'));return s.towers[0].hp<max;},towerDefense(g.towers[0]).maxHp);
  await page.locator('#start').click();await page.locator('#pause-overlay').waitFor({state:'visible'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));s=await state();
  const hp=s.towers[0].hp,time=s.time,enemyTimer=s.enemies[0].towerAttackAt;
  await page.reload();await page.locator('#enter-game').click();const restored=await state();assert.equal(restored.time,time);assert.equal(restored.towers[0].hp,hp);assert.equal(restored.enemies[0].towerAttackAt,enemyTimer);
  // Prove a live strike really creates a persistent, repairable ruin.
  const doomed=fixture();doomed.towers[0].hp=1;await page.addInitScript(save=>localStorage.setItem('wordward-save-v1',JSON.stringify(save)),doomed.export());await page.reload();await page.locator('#enter-game').click();await page.locator('#resume').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('wordward-save-v1')).towers[0].hp===0);await page.locator('#start').click();await page.locator('#pause-overlay').waitFor({state:'visible'});
  await page.locator('.map-target').nth(0).click();assert.match(await page.locator('#tower-hp').innerText(),/废墟/);assert.ok(await page.locator('#upgrade').isDisabled());assert.ok(await page.locator('#repair').isEnabled());await fits();
  if(width===393){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:`/workspace/shared/wordward-siege-${engine}.png`});}
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${engine} ${width}x${height}: HP, repair/rebuild with exact debit, retained words/tiles, actual siege/ruin, 94 profiles, pause/reload and controls fit`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
