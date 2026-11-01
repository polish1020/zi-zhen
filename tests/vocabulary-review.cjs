const assert=require('node:assert/strict');
const{chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const{Game,getWord,getTowerWord,towerDefense}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 function stock(g,word){g.hand=[...word.padEnd(16,'麒')].map(ch=>({id:++g.handSerial,ch,used:false}));}
 function fixture(letters){const g=new Game(0,42);g.ink=1000;stock(g,letters);return g;}
 async function open(g,width,height){
  const c=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
  await p.addInitScript(save=>{if(!sessionStorage.getItem('review-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('review-fixture','1');}localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{get:()=>true});},g.export());
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();
  const save=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1'))),choose=async word=>{while(await p.locator('.char.selected').count())await p.locator('.char.selected').first().click();for(const ch of word)await p.locator(`.char[data-char="${ch}"]:not(:disabled):not(.selected)`).first().click();};
  const tap=async pad=>{const b=await p.locator('.map-target').nth(pad).boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);};
  return{c,p,errors,save,choose,tap};
 }
 async function finish(q){assert.deepEqual(q.errors,[]);assert.equal(await q.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||(innerWidth<=900&&document.documentElement.scrollHeight>innerHeight+1)),false);await q.c.close();}
 try{for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const q=await open(fixture('血流成漂杵'),width,height),{p}=q;await q.choose('血流成杵');assert.equal(await p.locator('#forge').isEnabled(),false);assert.equal((await q.save()).ink,1000);await q.choose('血流漂杵');assert.equal(await p.locator('#forge').isEnabled(),true);await p.locator('#recipe-details').click();assert.match(await p.locator('#modal-content .word-learning-card').innerText(),/战况惨烈/);await p.locator('#close-modal').click();await p.locator('#forge').click();await q.tap(2);let saved=await q.save();assert.equal(saved.ink,1000-getWord('血流漂杵').cost);assert.equal(saved.hand.filter(t=>t.used).length,4);await q.tap(2);assert.match(await p.locator('#tower-section-learning').innerText(),/成语释义/);assert.match(await p.locator('.tower-effect-content').innerText(),/战况惨烈/);if(width===393)await p.screenshot({path:`/workspace/shared/wordward-vocabulary-corrected-${engine}.png`});await p.reload({waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();assert.deepEqual((await q.save()).towers,saved.towers);await finish(q);
  const legacy=fixture('血流成杵');const old=getTowerWord('血流成杵');legacy.hand.slice(0,4).forEach(t=>t.used=true);legacy.towers=[{word:'血流成杵',pad:2,id:legacy.nextId++,level:4,spent:old.cost,cooldown:0,hp:towerDefense({word:'血流成杵',level:4}).maxHp*.37,repairReadyAt:0}];const l=await open(legacy,width,height);await l.tap(2);assert.match(await l.p.locator('.tower-detail h3').innerText(),/旧版词条/);assert.match(await l.p.locator('.tower-effect-content').innerText(),/规范写法是「血流漂杵」/);assert.equal((await l.save()).towers[0].hp,legacy.towers[0].hp);if(width===393)await l.p.screenshot({path:`/workspace/shared/wordward-vocabulary-legacy-${engine}.png`});await finish(l);
  const f=await open(fixture('一声不吭火麒麟冰火剑'),width,height);await f.choose('一声不吭');assert.equal(await f.p.locator('#forge').isEnabled(),true);assert.ok((await f.p.locator('.recipe-kind-chip').innerText()).includes('四字词'));for(const word of ['火麒麟','冰火剑']){await f.choose(word);assert.equal(await f.p.locator('#forge').isEnabled(),true);assert.match(await f.p.locator('.recipe-kind-chip').innerText(),/技能词/);}await finish(f);
  console.log(`PASS ${engine} ${width}x${height}: typo rejected, correct spelling/details/payment/reload, saved-only legacy correction, ordinary phrase and elemental skills; no overflow/errors`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
