const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game}=await import('../dist/engine.mjs');
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,
  ...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),
  ...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const g=new Game(0,42);g.ink=5000;
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{
   if(!sessionStorage.getItem('price-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('price-fixture','1');}
   localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{value:true});
  },g.export());
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  assert.match(await page.locator('#hint-letters').innerText(),/100 墨点/);
  assert.match(await page.locator('#refresh-letters').innerText(),/50 墨点/);
  await page.locator('#hint-letters').click();assert.equal((await state()).ink,4900);assert.equal((await state()).hintUses,1);
  assert.match(await page.locator('#hint-letters').innerText(),/免费/);
  await page.locator('#hint-letters').click();assert.equal((await state()).ink,4900);assert.equal((await state()).hintUses,1);
  await page.locator('#refresh-letters').click();assert.equal((await state()).ink,4850);
  assert.match(await page.locator('#hint-letters').innerText(),/200 墨点/);
  await page.locator('#hint-letters').click();assert.equal((await state()).ink,4650);assert.equal((await state()).hintUses,2);
  await page.locator('#refresh-letters').click();assert.equal((await state()).ink,4600);
  await page.reload();await page.locator('#enter-game').click();assert.equal((await state()).hintUses,2);
  assert.match(await page.locator('#hint-letters').innerText(),/300 墨点/);
  assert.match(await page.locator('#refresh-letters').innerText(),/50 墨点/);
  if(width<=900){const b=await page.locator('#hint-letters').boundingBox();assert.ok(b.y+b.height<=height+1);assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1),false);}
  await page.locator('#game-guide').click();assert.match(await page.locator('#modal-content').innerText(),/每次固定 50.*每次成功购买后下次增加 100.*没有可组词不扣费、不涨价/s);
  assert.match(await page.locator('#modal-content').innerText(),/30 个游戏秒固定间隔/);
  assert.deepEqual(errors,[]);await context.close();
  console.log(`PASS ${engine} ${width}x${height}: 100/200/300 hints, free repeat, fixed 50 refresh, exact debits, saved prices, mobile fit and guide`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
