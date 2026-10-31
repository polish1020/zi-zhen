const assert=require('node:assert/strict');
const{chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const{Game,getWord}=await import('../dist/engine.mjs');const words=['冰雷斩','火麒麟','冰火剑','雷冰剑阵'],pads=[2,4,6,8];
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const g=new Game(0,42);g.ink=1200;g.phase='battle';g.wave=1;g.pendingWaves=[1];g.hand=[...(words.join('')+'火毒箭')].map(ch=>({id:++g.handSerial,ch,used:false}));assert.equal(g.hand.length,16);
  for(const d of [330,350,600,850,1000,1200,1400]){const e=g.spawn('normal',d);e.hp=e.maxHp=100000;e.speed=.01;}
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  await page.addInitScript(data=>{if(!sessionStorage.getItem('elemental-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(data));sessionStorage.setItem('elemental-fixture','1');}localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{get:()=>true});},g.export());
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  const tapPad=async index=>{const box=await page.locator('.map-target').nth(index).boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);};
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();assert.equal(await page.locator('.char.selected').count(),0);let ink=1200;
  for(let i=0;i<words.length;i++){
   const word=words[i];for(const ch of word)await page.locator(`.char[data-char="${ch}"]:not(:disabled):not(.selected)`).first().click();
   assert.equal(await page.locator('#recipe-details').innerText(),word+' ⓘ');assert.equal(await page.locator('.recipe-kind-chip').innerText(),'技能词');
   const labels=await page.locator('.recipe-meaning-chip').allTextContents();assert.ok(labels.includes(i===0?'凝霜':i===1?'灵伴':i===2?'灼热':'凝霜'));
   if(width===393&&i===0)await page.screenshot({path:`/workspace/shared/wordward-elemental-preview-${engine}.png`});
   await page.locator('#forge').click();await tapPad(pads[i]);ink-=getWord(word).cost;let state=await saved();assert.equal(state.ink,ink);assert.equal(state.towers[i].word,word);assert.equal(state.towers[i].pad,pads[i]);
   await tapPad(pads[i]);assert.match(await page.locator('.tower-detail h3').innerText(),new RegExp(word));assert.match(await page.locator('.tower-detail').innerText(),/技能词/);await page.locator('#back-forge').click();
  }
  const built=await saved();assert.equal(built.hand.filter(t=>t.used).length,13);assert.equal(built.time,0);
  await page.locator('#jump-codex').click();await page.locator('#codex-kind').selectOption('skill');for(const word of words){await page.locator('#codex-search').fill(word);assert.equal(await page.locator(`[data-word-effect="${word}"]`).count(),1);}await page.locator('#close-modal').click();
  await page.locator('#speed').click();await page.locator('#speed').click();await page.locator('#resume').click();await page.waitForTimeout(1800);await page.locator('#start').click();let state=await saved();assert.ok(state.towers.every(t=>t.shots>0));assert.ok(state.towers[1].shots>=3);assert.ok(state.enemies.some(e=>e.burnDps>0));assert.ok(state.enemies.some(e=>e.slowUntil>state.time));
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();const restored=await saved();for(const key of ['towers','enemies','hand','ink','time','rngState'])assert.deepEqual(restored[key],state[key],key);
  await page.locator('#refresh-letters').click();state=await saved();assert.equal(state.ink,ink-50);const available=Game.restore(state).availableWords();for(const[n,min]of[[2,3],[3,2],[4,1]])assert.ok(available.filter(w=>w.tier===n).length>=min);assert.equal(await page.locator('.char.selected').count(),0);
  await page.locator('#hint-letters').click();state=await saved();assert.equal(state.ink,ink-150);assert.equal(state.hintWord.length,4);await page.locator('#hint-letters').click();assert.equal((await saved()).ink,state.ink);
  if(width<=900)assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await context.close();
  console.log(`PASS ${engine} ${width}x${height}: screenshot word and elemental beasts/swords, meaning labels, exact single-use cards/costs, skill codex, real chill/burn/spirit attacks, paused reload, paid refresh/longest hint and no overflow/errors`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
