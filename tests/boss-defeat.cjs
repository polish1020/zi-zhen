const assert=require('node:assert/strict'),crypto=require('node:crypto');
const{chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const{Game,ENEMIES,enemyLength}=await import('../dist/engine.mjs');
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 const allBosses=Object.keys(ENEMIES).filter(k=>ENEMIES[k].boss),sample=['mirrorqueen','frostboss','beaconlord','gearboss','scrollboss','astralboss'];
 function arena(kinds,final=false){const g=new Game(0,42);g.ink=500;g.phase='battle';g.wave=final?g.campaignWaves:9;g.pendingWaves=[g.wave];
  kinds.forEach((kind,i)=>{const e=g.spawn(kind,[100,360,650,900,1250,1550][i%6]);e.d=Math.min(e.d,enemyLength(e)*.7);e.hp=1;e.speed=.01;e.enraged=true;});
  if(!final){const e=g.spawn('normal');e.hp=e.maxHp=1e6;e.speed=.01;}return g;
 }
 async function open(g,width,height,reduce=false){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900,reducedMotion:reduce?'reduce':'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  await page.addInitScript(save=>{
   if(!sessionStorage.getItem('defeat-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(save));sessionStorage.setItem('defeat-fixture','1');}
   localStorage.setItem('wordward-audio-v1','off');if(innerWidth<=900)Object.defineProperty(navigator,'standalone',{get:()=>true});
   const raf=requestAnimationFrame;let clock=1000;window.__advance=ms=>clock+=ms;window.requestAnimationFrame=fn=>raf(()=>fn(clock));window.__defeatPaint=[];
   const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(text==='首领击败'){window.__defeatPaint.push({clock,args,alpha:this.globalAlpha});if(window.__defeatPaint.length>500)window.__defeatPaint.splice(0,250);}return original.call(this,text,...args);};
  },g.export());
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();
  const advance=async ms=>{await page.evaluate(ms=>{window.__defeatPaint=[];window.__advance(ms);},ms);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
  const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  const kill=async()=>{await page.locator('#resume').click();await page.locator('#skill').click();await page.waitForFunction(()=>window.__defeatPaint.length>0);};
  return {context,page,errors,advance,save,kill};
 }
 try{
  for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
   const reduce=width===667,g=arena(sample),q=await open(g,width,height,reduce),{page:p}=q;
   if(width===1440){await p.locator('#speed').click();await p.locator('#speed').click();assert.equal(await p.locator('#speed').innerText(),'3×');}
   await q.kill();await p.locator('#start').click();const frozen=await q.save();assert.equal(frozen.kills,6);assert.equal(frozen.enemies.length,1);assert.equal(frozen.phase,'battle');
   await q.advance(100);assert.ok(await p.evaluate(()=>window.__defeatPaint.length>=6));const early=await p.locator('#battlefield').screenshot();
   await q.advance(reduce?150:650);assert.ok(await p.evaluate(()=>window.__defeatPaint.length>=6));const middle=await p.locator('#battlefield').screenshot();
   assert.notEqual(crypto.createHash('sha256').update(early).digest('hex'),crypto.createHash('sha256').update(middle).digest('hex'));
   if(width===393)await p.screenshot({path:`/workspace/shared/wordward-boss-defeat-${engine}.png`});
   await q.advance(1700);assert.equal(await p.evaluate(()=>window.__defeatPaint.length),0);const after=await q.save();for(const key of ['time','ink','hp','kills','enemies','queue','rngState'])assert.deepEqual(after[key],frozen[key],key);
   await p.reload({waitUntil:'domcontentloaded'});await p.locator('#enter-game').click();await q.advance(100);assert.equal(await p.evaluate(()=>window.__defeatPaint.length),0);assert.equal((await q.save()).kills,6);
   if(width<=900)assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(q.errors,[]);await q.context.close();
   const final=await open(arena(['mirrorqueen'],true),width,height,reduce);await final.kill();const won=await final.save();assert.equal(won.phase,'won');assert.equal(won.kills,1);assert.ok(won.ink>470);assert.equal(await final.page.locator('#modal').evaluate(el=>el.open),false);
   await final.advance(reduce?600:1800);await final.page.locator('#endless').waitFor();assert.equal((await final.save()).ink,won.ink);assert.ok((await final.page.locator('.result-stars').innerText()).includes('★'));
   await final.page.reload();await final.page.locator('#enter-game').click();await final.page.locator('#endless').waitFor();assert.equal(await final.page.evaluate(()=>window.__defeatPaint.length),0);assert.equal((await final.save()).kills,1);assert.deepEqual(final.errors,[]);await final.context.close();
   console.log(`PASS ${engine} ${width}x${height}: six real simultaneous skill kills, visible fading/fragments, paused battle unchanged, ${reduce?'reduced-motion fade':'full animation'}, one-time reward/reload, final victory after animation, no overflow/errors`);
  }
  for(let at=0;at<allBosses.length;at+=6){const kinds=allBosses.slice(at,at+6),q=await open(arena(kinds),1440,1000);await q.kill();await q.page.locator('#start').click();await q.advance(500);assert.ok(await q.page.evaluate(()=>window.__defeatPaint.length>=6));assert.equal((await q.save()).kills,kinds.length);assert.deepEqual(q.errors,[]);await q.context.close();}
  console.log(`PASS ${engine}: all ${allBosses.length} boss portraits and themed defeat fragments render after actual kills`);
  const interrupted=await open(arena(['mirrorqueen'],true),393,852);await interrupted.kill();await interrupted.page.locator('#settings').click();await interrupted.page.locator('#restart-setting').click();await interrupted.page.locator('#do-reset').click();await interrupted.advance(2000);assert.equal((await interrupted.save()).phase,'prepare');assert.equal(await interrupted.page.locator('#modal').evaluate(el=>el.open),false);assert.equal(await interrupted.page.evaluate(()=>window.__defeatPaint.length),0);assert.deepEqual(interrupted.errors,[]);await interrupted.context.close();
  console.log(`PASS ${engine}: restarting during a final defeat cancels the stale animation and delayed result`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
