const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,getMap}=await import('../dist/engine.mjs');
 const fixture=JSON.parse(fs.readFileSync('tests/fixtures/mirror-layout-v9.json'));
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(base.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const[width,height]of[[320,568],[393,852],[667,375],[1440,1000]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  await page.addInitScript(data=>{
   if(!sessionStorage.getItem('mirror-fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(data));sessionStorage.setItem('mirror-fixture','1');}
   localStorage.setItem('wordward-audio-v1','off');Object.defineProperty(navigator,'standalone',{get:()=>true});
   window.__mapRoads=[];const proto=CanvasRenderingContext2D.prototype,paths=new WeakMap();
   for(const key of ['beginPath','moveTo','lineTo','stroke']){const original=proto[key];proto[key]=function(...args){
    if(key==='beginPath')paths.set(this,[]);else if(key==='moveTo'||key==='lineTo')paths.get(this)?.push({x:args[0],y:args[1]});
    else if(key==='stroke'&&this.lineWidth===48){const points=paths.get(this);if(points?.length>5){const value=JSON.stringify(points);if(!window.__mapRoads.includes(value))window.__mapRoads.push(value);}}
    return original.apply(this,args);
   };}
  },fixture.data);
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
  const tapPad=async index=>{const box=await page.locator('.map-target').nth(index).boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);};
  const roads=async layout=>{for(const route of getMap(7,layout).routes)await page.waitForFunction(value=>window.__mapRoads.includes(value),JSON.stringify(route));};
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();assert.ok(await page.locator('#pause-overlay').isVisible());await roads(1);
  let state=await saved();assert.equal(state.mirrorLayout,1);for(const key of ['towers','zones','hand','queue','ink','hp','time','rngState'])assert.deepEqual(state[key],fixture.data[key],key);
  await tapPad(6);assert.match(await page.locator('.tower-detail h3').innerText(),/毒云/);
  await page.locator('#settings').click();await page.locator('#restart-setting').click();await page.locator('#do-reset').click();await roads(2);
  state=await saved();assert.equal(state.mirrorLayout,2);assert.equal(state.wave,0);assert.equal(state.ink,390);assert.equal(state.towers.length,0);
  const word=Game.restore(state).availableWords().find(w=>w.tier===2&&w.damage&&w.cost<=state.ink);
  for(const ch of word.word)await page.locator(`.char[data-char="${ch}"]:not(:disabled):not(.selected)`).first().click();
  await page.locator('#forge').click();await tapPad(2);state=await saved();assert.equal(state.towers[0].pad,2);assert.equal(state.ink,390-word.cost);
  if(await page.locator('#back-forge').isVisible())await page.locator('#back-forge').click();
  await page.locator('#start').click();await page.waitForTimeout(700);await page.locator('#start').click();state=await saved();
  assert.equal(state.mirrorLayout,2);assert.equal(state.wave,1);assert.deepEqual(state.enemies.slice(0,2).map(e=>e.route),[0,1]);assert.ok(state.enemies.every(e=>e.mirrorLayout===2));
  const before=structuredClone(state);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#enter-game').click();await roads(2);
  state=await saved();for(const key of ['towers','enemies','queue','hand','ink','hp','time','rngState','mirrorLayout'])assert.deepEqual(state[key],before[key],key);
  if(width<=900)assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1),false);
  if(width===393)await page.screenshot({path:`/workspace/shared/wordward-mirror-${engine}.png`});
  assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${engine} ${width}x${height}: actual old/new canvas routes, old battle preserved, restart selects new geometry, build cost and hit target, two entrances, pause/reload and no overflow/errors`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
