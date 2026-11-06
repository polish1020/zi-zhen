const assert=require('node:assert/strict'),{mkdirSync}=require('node:fs');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4175',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,CHAPTERS,MAPS,ENEMIES,MAP_MINION_POOLS,MAP_BOSS_POOLS,enemyLength}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 const errors=[];mkdirSync('/tmp/zi-zhen-campaign/maps',{recursive:true});
 async function open(g,width=393,height=852){const c=await browser.newContext({viewport:{width,height},isMobile:width<=900,hasTouch:width<=900}),p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(data=>{localStorage.setItem('wordward-save-v1',JSON.stringify(data));localStorage.setItem('wordward-record-v1','[3,2,1,3,2,1,3,2,1,3]');localStorage.setItem('wordward-audio-v1','off');},g.export());await p.goto(base,{waitUntil:'domcontentloaded'});return{c,p};}
 try{
  const selected=process.env.CHECK_CHAPTERS?process.env.CHECK_CHAPTERS.split(',').map(x=>Number(x)-1):Array.from({length:20},(_,i)=>i+10);assert.ok(selected.length&&selected.every(ch=>Number.isInteger(ch)&&ch>=10&&ch<30)&&new Set(selected).size===selected.length);const hashes=new Set();for(const ch of selected){
   const g=new Game(ch,42);g.wave=24;g.phase='battle';g.pendingWaves=[24];
   for(const [i,kind]of [...MAP_MINION_POOLS[ch],...MAP_BOSS_POOLS[ch]].entries()){const e=g.spawn(kind,0,i%MAPS[ch].routes.length,24);e.d=enemyLength(e)*(.15+i*.1);}
   const {c,p}=await open(g);await p.locator('#enter-game').click();assert.equal(await p.locator('#chapter-name').innerText(),CHAPTERS[ch].name);assert.equal(await p.locator('#canvas-wrap').getAttribute('data-theme'),MAPS[ch].theme);assert.equal(await p.locator('.map-target').count(),16);assert.equal(await p.locator('#canvas-wrap').getAttribute('data-night'),String(MAPS[ch].night));assert.match(await p.locator('#battle-notice').innerText(),/暂停|布阵/);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));hashes.add(await p.locator('#battlefield').evaluate(e=>e.toDataURL()));
   if(engine==='chromium')await p.locator('#battlefield').screenshot({path:`/tmp/zi-zhen-campaign/maps/${ch+1}.png`});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1),false);
   if([10,16,25,29].includes(ch)){
    await p.locator('#enemy-preview').click();assert.equal(await p.locator('.enemy-portrait').count(),214);await p.locator('[data-enemy-filter="chapter"]').click();const keys=await p.locator('.enemy-card:visible').evaluateAll(es=>es.map(e=>e.dataset.enemyKind));assert.deepEqual(keys.sort(),[...MAP_MINION_POOLS[ch],...MAP_BOSS_POOLS[ch]].sort());await p.locator('#close-modal').click();
   }
   await c.close();console.log(`PASS ${engine} chapter ${ch+1}: themed battle + six enemies, route pads, paused save, one-screen phone layout`);
  }assert.equal(hashes.size,selected.length);
  for(const [width,height]of [[393,852],[667,375],[1440,1000]]){
   const {c,p}=await open(new Game(9,42),width,height);await p.locator('#home-chapters').click();assert.equal(await p.locator('.chapter-volume').count(),3);assert.equal(await p.locator('.chapter-card').count(),30);assert.equal(await p.locator('[data-chapter="0"] .chapter-stars').getAttribute('aria-label'),'3星');assert.equal(await p.locator('[data-chapter="9"] .chapter-stars').getAttribute('aria-label'),'3星');assert.equal(await p.locator('[data-chapter="29"] .chapter-stars').getAttribute('aria-label'),'0星');await p.locator('[data-chapter="29"]').click();await p.locator('#enter-game').click();assert.equal(await p.locator('#chapter-name').innerText(),CHAPTERS[29].name);await p.locator('#advance-chapter').click();assert.equal(await p.locator('.chapter-card').count(),30);await p.locator('#close-modal').click();await c.close();console.log(`PASS ${engine} ${width}x${height}: 3 volumes/30 choices, legacy 10-star migration, last chapter navigation`);
  }
  for(const chapter of [9,19,28]){
   const g=new Game(chapter,42);g.phase='won';g.wave=g.campaignWaves;
   const {c,p}=await open(g);await p.locator('#enter-game').click();await p.locator('#next').click();assert.equal(await p.locator('#chapter-name').innerText(),CHAPTERS[chapter+1].name);const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.equal(saved.chapter,chapter+1);assert.equal(saved.wave,0);assert.equal(saved.ink,CHAPTERS[chapter+1].ink);await c.close();
  }
  for(const ch of [19,25,29]){
   const g=new Game(ch,42),word=g.availableWords().find(w=>w.word.length>=5&&w.cost<=g.ink);assert.ok(word);
   const {c,p}=await open(g);await p.locator('#enter-game').click();
   for(const char of word.word)await p.locator(`.char[data-char="${char}"]:not(.selected):not(:disabled)`).first().click();
   await p.locator('#forge').click();await p.locator('.map-target').nth(2).click({force:true});
   const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));assert.equal(stored.towers[0].word,word.word);assert.equal(stored.ink,g.ink-word.cost);assert.equal(stored.hand.filter(t=>t.used).length,word.word.length);assert.equal(stored.debugMode,undefined);await p.locator('#start').click();await p.waitForFunction(()=>document.querySelector('#phase-label').textContent.includes('守关'));await c.close();
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${engine}: transitions 10→11,20→21,29→30 and three real paid builds/first waves, no script errors`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
