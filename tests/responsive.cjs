const assert=require('node:assert/strict');
const {chromium,webkit}=require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const baseURL=process.env.BASE_URL||'http://127.0.0.1:4173',engine=process.env.BROWSER||'chromium';
(async()=>{
 const {Game,getWord}=await import('../dist/engine.mjs');const initial=new Game(0,42);initial.hand[0].ch='火';initial.hand[1].ch='球';const attack=getWord('火球'),ids=initial.tilesFor(attack.word);
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}),...(baseURL.startsWith('https://')?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{for(const [width,height]of[[320,568],[320,740],[390,844],[430,932],[768,1024],[844,390],[667,375],[900,900],[1024,768],[1440,1000]]){
 const mobile=width<=900,ctx=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile}),p=await ctx.newPage(),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(d=>{if(!sessionStorage.getItem('fixture')){localStorage.setItem('wordward-save-v1',JSON.stringify(d));sessionStorage.setItem('fixture','1');}},initial.export());
 const press=s=>mobile?p.locator(s).tap():p.locator(s).click();
 async function enter(){assert.ok(await p.locator('#start-screen').isVisible());assert.equal(await p.locator('#battle-panel').isVisible(),false);await press('#enter-game');await p.waitForSelector('#battle-panel');}
 async function fits(){if(mobile)await p.waitForFunction(()=>Math.abs(document.body.getBoundingClientRect().height-innerHeight)<1);const x=await p.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();const bank=document.querySelector('#character-grid');return{overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1,battle:rect('#battle-panel'),forge:rect('#forge-panel'),columns:getComputedStyle(bank).gridTemplateColumns.split(' ').length};});if(mobile){assert.equal(x.overflow,false,`page overflow ${width}x${height}`);assert.ok(x.battle.height>40&&x.forge.height>80);assert.ok(x.forge.bottom<= (await p.evaluate(()=>innerHeight))+1);assert.equal(16%x.columns,0,'hand must form a filled rectangle');}}
 async function onScreen(s){const r=await p.locator(s).boundingBox(),v=p.viewportSize();assert.ok(r&&r.x>=0&&r.y>=0&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,`${s} clipped ${width}x${height}`);}
 await p.goto(baseURL,{waitUntil:'domcontentloaded'});await enter();await fits();assert.equal(await p.locator('.char').count(),16);
 if(mobile){await onScreen('#forge');await onScreen('#hint-letters');await onScreen('#refresh-letters');const r=await p.locator('#battle-panel').boundingBox(),f=await p.locator('#forge-panel').boundingBox();if(height>width)assert.ok(r.y+r.height<=f.y+1,'map must be above hand');}
 // Strict order: a reversed two-character word cannot be forged.
 for(const id of [...ids].reverse())await press(`[data-tile="${id}"]`);assert.ok(await p.locator('#forge').isDisabled());await press('[data-slot="1"]');await press('[data-slot="0"]');
 for(const id of ids)await press(`[data-tile="${id}"]`);
 await press('#recipe-details');assert.match(await p.locator('#modal-content .attribute-badge').innerText(),/火/);assert.ok(await p.locator('.word-grade-card').isVisible());assert.ok(await p.locator('.word-effect-stats').isVisible());assert.match(await p.locator('#modal-content').innerText(),new RegExp(attack.word));await press('#effect-done');
 await press('#forge');await press('#forge');assert.equal(await p.locator('#ink').innerText(),'200');assert.equal(await p.locator('.char.used').count(),0);
 await press('#forge');await press('.map-target:nth-child(3)');assert.equal(await p.locator('#ink').innerText(),String(200-attack.cost));assert.equal(await p.locator('.char.used').count(),2);
 await press('.map-target:nth-child(3)');assert.equal(await p.locator('.map-target:nth-child(3)').getAttribute('aria-pressed'),'true');await p.waitForSelector('#upgrade');assert.match(await p.locator('.tower-detail h3').innerText(),new RegExp(attack.word));await press('.map-target:nth-child(3)');assert.ok(await p.locator('#upgrade').isVisible(),'repeated tower click keeps details open');if(mobile){await onScreen('#upgrade');await onScreen('.tower-level .attribute-badge');await onScreen('.tower-level .grade-badge');}assert.deepEqual(await p.locator('.tower-effect-section h4').allTextContents(),['攻击效果','守备能力','附加词义','品质特性']);
 assert.equal(await p.getByRole('tab').count(),0,'all sections are expanded without tab switching');
 assert.equal(await p.locator('.tower-effect-section[hidden]').count(),0);
 assert.match(await p.locator('.tower-effects').innerText(),/基础属性.*攻击形态.*守备能力.*附加词义.*品质特性/s);
 if(mobile)assert.ok((await p.locator('.tower-effect-content').boundingBox()).height>=40,'effect descriptions need a scrollable reading area');
 const scrollEffects=async()=>p.locator('.tower-effect-content').evaluate(el=>el.scrollTop=el.scrollHeight);
 await scrollEffects();if(mobile){await onScreen('#upgrade');await onScreen('#repair');await onScreen('#sell');}
 await press('#upgrade');assert.equal(await p.locator('.tower-effect-section').count(),4);
 if(width===390){await p.locator('.tower-effect-content').evaluate(el=>el.scrollTop=0);await p.screenshot({path:'/workspace/shared/wordward-categorized-details.png'});}
 const left=200-attack.cost-Math.round(attack.cost*.75);assert.equal(await p.locator('#ink').innerText(),String(left));await press('#back-forge');await press('#refresh-letters');assert.equal(await p.locator('#ink').innerText(),String(left-50));
 const tray=await p.locator('.char').evaluateAll(xs=>xs.map(x=>[x.dataset.tile,x.dataset.char]));await p.reload();await enter();assert.deepEqual(await p.locator('.char').evaluateAll(xs=>xs.map(x=>[x.dataset.tile,x.dataset.char])),tray);
 await press('#start');await p.waitForFunction(()=>document.querySelector('#phase-label').textContent.includes('进行中'));await press('#start');assert.ok(await p.locator('#pause-overlay').isVisible());await p.reload();await enter();assert.ok(await p.locator('#pause-overlay').isVisible());
 if(mobile){await p.setViewportSize({width:height,height:width});await fits();await p.setViewportSize({width,height});await fits();}
 await press('#jump-codex');assert.equal(await p.locator('.codex-card').count(),40);await press('[data-length="4"]');assert.ok(await p.locator('.codex-card').count()>0&&await p.locator('.codex-card').count()<=40);await press('#close-modal');
 await press('#settings');await press('#close-modal');
 if(mobile){const scale=await p.locator('.map-target').evaluateAll(xs=>{const c=i=>{const r=xs[i].getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};};return{x:(c(5).x-c(0).x)/(365-100),y:(c(3).y-c(0).y)/(420-78)};});assert.ok(Math.abs(scale.x-scale.y)<.002,'map must use uniform scaling');}
 if(width===390||width===1440)await p.screenshot({path:`/workspace/shared/wordward-combined-${width}.png`,fullPage:!mobile});assert.deepEqual(errors,[]);console.log(`PASS ${engine} ${width}x${height}: start screen, combined panels, filled hand, uniform map, strict order, word effect, categorized effects, single-click details and upgrade, restore`);await ctx.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
