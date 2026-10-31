const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const engine=process.env.BROWSER||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:4173';
(async()=>{
 const {Game}=await import('../dist/engine.mjs');
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,
  ...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),
  ...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const g=new Game(0,42);g.wave=18;g.phase='battle';g.pendingWaves=[18];g.bossDraws=[{wave:18,kind:'boss'}];
  const boss=g.spawn('boss',250),ward=g.spawn('ward',370),armor=g.spawn('armor',420);
  for(const e of g.enemies)e.speed=.01;
  g.time=2.2;ward.jamUntil=6.2;armor.guardUntil=6.2;armor.guardPower=.12;
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900});
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{
   if(!sessionStorage.getItem('tactics-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('tactics-fixture','1');}
   localStorage.setItem('wordward-audio-v1','off');
   if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{value:true});
  },g.export());
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.ok(await page.locator('#battlefield').evaluate(el=>{const {data}=el.getContext('2d').getImageData(0,0,el.width,el.height),colors=new Set();for(let i=0;i<data.length;i+=256)colors.add(`${data[i]},${data[i+1]},${data[i+2]}`);return colors.size>20;}));
  assert.match(await page.locator('#battlefield').getAttribute('aria-label'),/Boss ×1.*凝盾蓄势/);
  assert.equal(await page.locator('.boss-status').count(),0);
  if(width===393)await page.screenshot({path:`/workspace/shared/wordward-enemy-tactics-${engine}.png`});
  await page.locator('#enemy-preview').click();
  await page.locator('[data-enemy-rules]').click();assert.match(await page.locator('#enemy-rules').innerText(),/第 4 轮.*冲刺.*第 6 轮.*列盾.*扰墨/);
  assert.equal(await page.locator('.enemy-card .boss-skill-description').count(),42);
  await page.locator('.boss-brief [data-enemy-reveal]').first().click();assert.match(await page.locator('.enemy-card.is-target').innerText(),/主动技能.*凝盾.*3 秒.*25%/s);
  assert.match(await page.locator('[data-enemy-kind="ward"]').innerText(),/第 6 轮.*扰墨.*20%/s);
  assert.match(await page.locator('[data-enemy-kind="healer"]').innerText(),/生命比例最低.*3 名.*5%.*最多 4 次/s);
  assert.match(await page.locator('[data-enemy-kind="cloudraptor"]').innerText(),/第 4 轮.*领飞.*飞行友军/s);
  await page.locator('#close-modal').click();await page.locator('#resume').click();
  await page.waitForFunction(()=>{
   const save=JSON.parse(localStorage.getItem('wordward-save-v1'));
   return save?.enemies.some(e=>e.kind==='boss'&&e.pulses===1&&e.shield>0);
  });
  await page.locator('#start').click();
  await page.locator('#pause-overlay').waitFor({state:'visible'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1'))),active=state.enemies.find(e=>e.kind==='boss');
  assert.equal(active.pulses,1);assert.ok(active.shield>=active.maxHp*.1-1e-7);
  const pulseAt=active.pulseAt,time=state.time;
  await page.reload();await page.locator('#enter-game').click();
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  assert.equal(restored.time,time);assert.equal(restored.enemies.find(e=>e.kind==='boss').pulseAt,pulseAt);
  assert.equal(restored.enemies.find(e=>e.kind==='boss').pulses,1);
  assert.equal(await page.locator('.boss-status').count(),0);
  if(width<=900)assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>document.documentElement.clientHeight+1),false);
  assert.deepEqual(errors,[]);await context.close();
  console.log(`PASS ${engine} ${width}x${height}: boss windup, 42 skill descriptions, staged minion tactics, actual shield cast, pause/reload, no overlay/overflow`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
