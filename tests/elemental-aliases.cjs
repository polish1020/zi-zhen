const assert=require('node:assert/strict');
const{chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const{Game,getWord}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 async function open(g,width,height){const context=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  await page.addInitScript(save=>{if(!sessionStorage.getItem('alias-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('alias-fixture','1');}localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{get:()=>true});},g.export());await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1'))),choose=async word=>{while(await page.locator('.char.selected').count())await page.locator('.char.selected').first().click();for(const ch of word)await page.locator(`.char[data-char="${ch}"]:not(:disabled):not(.selected)`).first().click();assert.equal(await page.locator('#recipe-details').innerText(),word+' ⓘ');assert.equal(await page.locator('#forge').isEnabled(),true);};
  const tap=async pad=>{const box=await page.locator('.map-target').nth(pad).boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);};return {context,page,errors,saved,choose,tap};}
 function arena(letters){const g=new Game(0,42);g.ink=1000;g.phase='battle';g.wave=1;g.pendingWaves=[1];g.hand=[...letters.padEnd(16,'麒')].map(ch=>({id:++g.handSerial,ch,used:false}));const e=g.spawn('normal',330);e.hp=e.maxHp=100000;e.speed=.01;return g;}
 try{for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const g=arena('毒素冰锥暗之力');g.hintWord='暗冰之力';g.hintUses=1;const q=await open(g,width,height),p=q.page;
  await p.locator('#hint-letters').click();assert.equal((await q.saved()).ink,1000);assert.equal(await p.locator('#recipe-details').innerText(),'暗冰之力 ⓘ');
  for(const[word,label]of[['毒素之力','腐蚀'],['冰锥之力','凝霜'],['暗冰之力','凝霜']]){await q.choose(word);assert.ok((await p.locator('.recipe-meaning-chip').allTextContents()).includes(label));assert.equal((await q.saved()).ink,1000);}
  await q.choose('冰锥之力');if(width===393)await p.screenshot({path:`/workspace/shared/wordward-power-roots-${engine}.png`});await p.locator('#forge').click();await q.tap(2);let save=await q.saved();assert.equal(save.ink,1000-getWord('冰锥之力').cost);assert.equal(save.hand.filter(t=>t.used).length,4);assert.equal(save.hintWord,null);assert.equal(save.hintUses,1);
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();assert.deepEqual((await q.saved()).towers,save.towers);assert.equal((await q.saved()).ink,save.ink);assert.deepEqual(q.errors,[]);await q.context.close();
  const weapons=await open(arena('冰冻锤霜火箭'),width,height),w=weapons.page;let ink=1000;
  for(const[word,pad,shape]of[['冰冻锤',2,'重击'],['霜火箭',4,'远射']]){await weapons.choose(word);assert.equal(await w.locator('.recipe-attack-chip').innerText(),shape);await w.locator('#forge').click();await weapons.tap(pad);ink-=getWord(word).cost;assert.equal((await weapons.saved()).ink,ink);}
  await w.locator('#resume').click();await w.waitForTimeout(500);await w.locator('#start').click();save=await weapons.saved();assert.ok(save.towers.every(t=>t.shots>0));assert.ok(save.enemies[0].slowUntil>save.time);assert.ok(save.enemies[0].burnDps>0);assert.equal(save.hand.filter(t=>t.used).length,6);
  if(width<=900)assert.equal(await w.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(weapons.errors,[]);await weapons.context.close();
  console.log(`PASS ${engine} ${width}x${height}: poison/ice-cone/dark-ice powers all selectable around a preserved free hint, exact cost/single-use cards/reload, ice hammer/frost-fire arrow real attacks and no overflow/errors`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
