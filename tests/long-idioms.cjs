const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const {openCodex}=require('./codex-helpers.cjs');
const base=process.env.BASE_URL||'http://127.0.0.1:4180',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const word='百闻不如一见',g=new Game(0,42);g.ink=1000;g.hand=[...word.padEnd(32,'月')].map(ch=>({ch,id:++g.handSerial,used:false}));
  const c=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(data=>{if(!localStorage.getItem('wordward-save-v1'))localStorage.setItem('wordward-save-v1',JSON.stringify(data));localStorage.setItem('wordward-audio-v1','off');},g.export());await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();
  for(const ch of word)await p.locator(`.char[data-char="${ch}"]:not(.selected)`).first().click();assert.match(await p.locator('#recipe-preview').innerText(),/百闻不如一见/);await p.locator('#recipe-details').click();const text=await p.locator('#modal-content').innerText();assert.match(text,/亲眼|观察/);assert.match(text,/洞见要害/);assert.equal(await p.locator('.poem-reading').count(),0);await p.locator('#effect-done').click();await p.locator('#forge').click();await p.locator('.map-target').nth(2).click({force:true});if(!await p.locator('#back-forge').isVisible())await p.locator('.map-target').nth(2).click({force:true});
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.equal(saved.towers[0].word,word);assert.equal(saved.towers[0].level,6);assert.equal(saved.ink,670);assert.equal(saved.hand.filter(t=>t.used).length,6);assert.deepEqual(Game.restore(saved).export(),saved);assert.match(await p.locator('.tower-effects').innerText(),/洞见要害/);await p.locator('#back-forge').click();
  await openCodex(p);await p.locator('#codex-search').fill(word);await p.locator(`[data-word-effect="${word}"]`).click();assert.match(await p.locator('#modal-content').innerText(),/亲眼|观察/);await p.locator('#effect-done').click();assert.ok(await p.locator('#codex-search').isVisible());assert.deepEqual(errors,[]);await c.close();console.log(`PASS ${engine} ${width}x${height}: six-character idiom preview, meaning, paid build, save, learned skill and codex return`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
