const assert = require('node:assert/strict');
const {chromium} = require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
(async()=>{
 const {Game,getWord}=await import('../dist/engine.mjs');
 const initial=new Game(0,42),attack=initial.availableWords().find(w=>w.tier===2&&w.damage);
 const tileIds=initial.tilesFor(attack.word);
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox'],...(process.env.BASE_URL?.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 for(const [width,height] of [[320,568],[320,740],[390,844],[430,932],[768,1024],[844,390],[667,375],[900,900],[1024,768],[1440,1000]]){
  const mobile=width<=900;
  const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile});
  const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(data=>{if(!sessionStorage.getItem('test-initialized')){localStorage.setItem('wordward-save-v1',JSON.stringify(data));sessionStorage.setItem('test-initialized','1');}},initial.export());
  await page.goto(baseURL,{waitUntil:'domcontentloaded'});await page.waitForSelector('.char',{state:'attached'});
  const press=selector=>mobile?page.locator(selector).tap():page.locator(selector).click();
  async function fits(panel){
   const result=await page.evaluate(selector=>{const el=document.querySelector(selector);return {horizontal:document.documentElement.scrollWidth<=innerWidth,vertical:document.documentElement.scrollHeight<=innerHeight+1,panel:el.scrollHeight<=el.clientHeight+2};},panel);
   assert.ok(result.horizontal,`horizontal overflow ${width}x${height}`);
   if(mobile){assert.ok(result.vertical,`page scroll ${width}x${height}`);assert.ok(result.panel,`${panel} clipped ${width}x${height}`);}
  }
  async function onScreen(selector){const r=await page.locator(selector).boundingBox();assert.ok(r&&r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1,`${selector} offscreen at ${width}x${height}: ${JSON.stringify(r)}`);}
  if(mobile){if(await page.locator('#enter-game').isVisible())await press('#enter-game');await fits('#battle-panel');await press('#jump-forge');}
  await fits('#forge-panel');assert.equal(await page.locator('.char').count(),16);
  if(mobile){await onScreen('#refresh-letters');await onScreen('#forge');for(const el of await page.locator('.char').all()){const r=await el.boundingBox();assert.ok(r.width>=43.9&&r.height>=43.9,'small touch tile');}}
  for(const id of tileIds)await press(`[data-tile="${id}"]`);
  await press('#forge');
  if(mobile)await press('#jump-forge');
  await press('#forge'); // Explicit cancellation does not use ink or letters.
  assert.equal(await page.locator('#ink').innerText(),'200');assert.equal(await page.locator('.char.used').count(),0);
  await press('#forge');await press('.map-target:nth-child(3)');
  assert.equal(await page.locator('#ink').innerText(),String(200-attack.cost));
  assert.equal(await page.locator('.char.used').count(),2);
  for(const id of tileIds)assert.ok(await page.locator(`[data-tile="${id}"]`).isDisabled());
  await press('.map-target:nth-child(3)');await page.waitForSelector('#upgrade');await fits('#forge-panel');
  if(mobile)await onScreen('#upgrade');await press('#upgrade');
  const remaining=200-attack.cost-Math.round(attack.cost*.75);
  assert.equal(await page.locator('#ink').innerText(),String(remaining));
  await press('#back-forge');await press('#refresh-letters');
  assert.equal(await page.locator('#ink').innerText(),String(remaining-15));assert.equal(await page.locator('.char.used').count(),0);assert.match(await page.locator('#refresh-letters').innerText(),/20/);
  const tray=await page.locator('.char').evaluateAll(xs=>xs.map(x=>[x.dataset.tile,x.dataset.char]));
  await page.reload();await page.waitForSelector('.char',{state:'attached'});assert.equal(await page.locator('#ink').innerText(),String(remaining-15));assert.deepEqual(await page.locator('.char').evaluateAll(xs=>xs.map(x=>[x.dataset.tile,x.dataset.char])),tray);
  if(mobile)await press('#jump-battle');await press('#start');await page.waitForFunction(()=>document.querySelector('#phase-label').textContent.includes('进行中'));await press('#start');assert.ok(await page.locator('#pause-overlay').isVisible());
  await page.reload();await page.waitForSelector('#pause-overlay',{state:'visible'});
  if(mobile){await page.setViewportSize({width:height,height:width});await fits('#battle-panel');await page.setViewportSize({width,height});await fits('#battle-panel');await press('#jump-codex');}else await press('[data-nav="codex"]');
  assert.equal(await page.locator('.codex-card').count(),99);await press('[data-length="4"]');assert.equal(await page.locator('.codex-card').count(),27);await page.locator('#codex-search').fill('雷');assert.ok(await page.locator('.codex-card').count()>0);await press('#close-modal');
  await press('#settings');await onScreen('#close-modal');await press('#close-modal');
  if(width===390||width===1440){if(mobile)await press('#jump-forge');await page.screenshot({path:`/workspace/shared/zi-zhen-v2-${width}-forge.png`,fullPage:!mobile});if(mobile)await press('#jump-battle');await page.screenshot({path:`/workspace/shared/zi-zhen-v2-${width}-battle.png`,fullPage:!mobile});}
  assert.deepEqual(errors,[]);console.log(`PASS ${width}×${height}: single-screen, tiles, cancel/build/upgrade, paid refresh, restore, rotation, codex, zero errors`);await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
