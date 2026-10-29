const assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const baseURL=process.env.BASE_URL||'http://127.0.0.1:4173';
(async()=>{
 const {Game,getWord}=await import('../dist/engine.mjs');
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox'],...(process.env.BASE_URL?.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 const errors=[];
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL,{waitUntil:'domcontentloaded'});await page.waitForSelector('.char');
 assert.ok(await page.locator('#forge').isDisabled());await page.locator('#start').click();assert.match(await page.locator('#toast').innerText(),/攻击词塔/);
 const initial=Game.restore(await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1'))));const recipe=initial.availableWords().find(w=>w.tier===2&&w.damage);
 for(const id of initial.tilesFor(recipe.word))await page.locator(`[data-tile="${id}"]`).click();
 await page.locator('#forge').click();await page.locator('.map-target:nth-child(3)').click();assert.equal(await page.locator('#ink').innerText(),String(200-recipe.cost));assert.equal(await page.locator('.char.used').count(),2);
 await page.locator('.map-target:nth-child(3)').click();await page.locator('#upgrade').click();const afterUpgrade=200-recipe.cost-Math.round(recipe.cost*.75);assert.equal(await page.locator('#ink').innerText(),String(afterUpgrade));
 await page.locator('#sell').click();assert.equal(await page.locator('#ink').innerText(),String(afterUpgrade+Math.floor((recipe.cost+Math.round(recipe.cost*.75))*.7)));assert.equal(await page.locator('.char.used').count(),2);
 await page.locator('[data-nav="codex"]').click();assert.equal(await page.locator('.codex-card').count(),99);await page.locator('#codex-search').fill('毒');assert.ok(await page.locator('.codex-card').count()>=5);await page.locator('#close-modal').click();
 await page.locator('#guide-link').click();assert.equal(await page.locator('.guide-step').count(),4);assert.match(await page.locator('#modal-content').innerText(),/16/);await page.locator('#guide-done').click();
 await page.locator('#chapters').click();await page.locator('[data-chapter="1"]').click();assert.equal(await page.locator('#chapter-name').innerText(),'竹海听风');assert.equal(await page.locator('#ink').innerText(),'230');
 await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-label'),'关闭音效');
 console.log('PASS desktop: random recipe, one-use tiles, upgrade/sell accounting, codex search, rules, chapter, audio');
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(baseURL,{waitUntil:'domcontentloaded'});await phone.waitForSelector('.char');await phone.locator('#enter-game').tap();assert.ok(await phone.locator('body').evaluate(x=>x.classList.contains('playing')));await phone.locator('#jump-forge').tap();
 const phoneGame=Game.restore(await phone.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1'))));const longword=phoneGame.availableWords().find(w=>w.tier===4).word;for(const id of phoneGame.tilesFor(longword))await phone.locator(`[data-tile="${id}"]`).tap();await phone.locator('#forge').tap();await phone.locator('.map-target:nth-child(3)').tap();assert.match(await phone.locator('.map-target:nth-child(3)').getAttribute('aria-label'),/4级/);assert.equal(await phone.locator('.char.used').count(),4);await phone.locator('#jump-forge').tap();await phone.locator('#settings').tap();await phone.locator('#restart-setting').tap();await phone.locator('#do-reset').tap();assert.equal(await phone.locator('.char.used').count(),0);assert.equal(await phone.locator('#ink').innerText(),'200');
 await phone.locator('#exit-game').tap();assert.equal(await phone.locator('body').evaluate(x=>x.classList.contains('playing')),false);console.log('PASS real mobile entry/fullscreen tabs, four-character level 4 tower, reset and exit');await mobile.close();
 for(const outcome of ['won','lost']){
  const g=new Game(0,42);g.phase='battle';g.wave=outcome==='won'?6:2;
  if(outcome==='lost'){g.hp=1;g.spawn('boss');g.enemies[0].d=9999;}
  const ending=await browser.newPage({viewport:{width:1440,height:1000}});ending.on('pageerror',e=>errors.push(e.message));await ending.addInitScript(d=>localStorage.setItem('wordward-save-v1',JSON.stringify(d)),g.export());await ending.goto(baseURL,{waitUntil:'domcontentloaded'});await ending.locator('#resume').click();await ending.waitForSelector('.result');assert.match(await ending.locator('.modal-title').innerText(),outcome==='won'?/山河无恙/:/来日再战/);
  if(outcome==='won'){assert.equal(await ending.locator('.result-stars').innerText(),'★★★');await ending.locator('#next').click();assert.equal(await ending.locator('#chapter-name').innerText(),'竹海听风');}else{await ending.locator('#retry').click();assert.equal(await ending.locator('#ink').innerText(),'200');}await ending.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS victory, star save, next chapter, loss/retry; zero runtime errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
