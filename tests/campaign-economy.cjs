const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,clearInk,roundInk}=await import('../dist/engine.mjs');
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,
  ...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),
  ...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height]of[[320,568],[393,852],[667,375],[1440,1000]])for(const endless of [false,true]){
  const g=new Game(0,42);g.ink=500;g.wave=g.campaignWaves+(endless?3:0);g.phase='battle';g.pendingWaves=[g.wave];g.endless=endless;
  const e=g.spawn('normal');e.reward=5;e.hp=0;
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{
   if(!sessionStorage.getItem('campaign-economy-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('campaign-economy-fixture','1');}
   localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{value:true});
  },g.export());
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  assert.equal(await page.locator('#ink').innerText(),'500','a restored wallet must never be cut retroactively');
  await page.locator('#game-guide').click();assert.match(await page.locator('#modal-content').innerText(),/前 3 轮.*第 4\/5\/6 轮.*95%\/90%\/90%.*财塔.*保持完整/s);
  await page.locator('#close-modal').click();await page.locator('#resume').click();
  const earned=endless?5:4,expected=500+earned+clearInk(g.wave/3,endless)+roundInk(g.wave/3,endless);
  await page.waitForFunction(({earned,expected})=>{
   const save=JSON.parse(localStorage.getItem('wordward-save-v1'));return save.totalEarned===earned&&save.ink===expected;
  },{earned,expected});
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  assert.equal(state.phase,endless?'prepare':'won');assert.equal(state.killInkRemainder,endless?0:50);
  await page.reload();const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  assert.equal(restored.ink,expected);assert.equal(restored.totalEarned,earned);
  assert.deepEqual(errors,[]);await context.close();
  console.log(`PASS ${engine} ${width}x${height} ${endless?'endless':'campaign'}: preserved wallet, actual drop and settlement, reload without double pay, guide`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
