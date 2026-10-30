const assert = require('node:assert/strict');
const { chromium, webkit } = require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const engine = process.env.BROWSER || 'chromium';
(async () => {
  const { Game, getWord } = await import('../dist/engine.mjs');
  const browser = await (engine === 'webkit' ? webkit : chromium).launch({ headless: true,
    ...(engine === 'chromium' ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {}),
    ...(base.startsWith('https://') ? { proxy: { server: process.env.HTTPS_PROXY } } : {}) });
  try {
    for (const [width,height] of [[320,568],[393,852],[667,375],[1440,1000]]) {
      const g = new Game(0,42); g.ink = 2000;
      for (const [i,word] of ['火','学习','冰火箭','寒冰毒箭'].entries()) {
        const chars = [...word]; while (chars.length < 16) chars.push('文');
        g.hand = chars.map(ch => ({ id: ++g.handSerial, ch, used: false }));
        assert.ok(g.build(word,i));
      }
      const mobile = width <= 900;
      const context = await browser.newContext({ viewport: { width,height }, isMobile: mobile, hasTouch: mobile });
      const page = await context.newPage(), errors = [];
      page.setDefaultTimeout(15000); page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(data=>{
        if (!sessionStorage.getItem('fixture')) {
          localStorage.setItem('wordward-save-v1',JSON.stringify(data)); sessionStorage.setItem('fixture','1');
        }
        localStorage.setItem('wordward-audio-v1','off');
        if (innerWidth <= 900) Object.defineProperty(navigator,'standalone',{value:true});
      },g.export());
      await page.goto(base,{waitUntil:'domcontentloaded'}); await page.locator('#enter-game').click();
      for (const [i,count] of [0,1,1,2].entries()) {
        await page.locator('.map-target').nth(i).click();
        assert.equal(await page.locator('.meaning-badge').count(),count);
        assert.ok((await page.locator('.rune-capacity').innerText()).includes(`${count}/${count}`));
        if (i===0) assert.match(await page.locator('.meaning-effect').innerText(),/凡字没有附加特性/);
        if (mobile) {
          const box=await page.locator('#upgrade').boundingBox(); assert.ok(box.y+box.height<=height+1);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+1),false);
        }
        if (i===1) {
          await page.locator('#upgrade').click(); await page.locator('#upgrade').click();
          assert.match(await page.locator('.grade-badge').innerText(),/灵词/);
          assert.equal(await page.locator('.meaning-badge').count(),1);
          assert.match(await page.locator('.rune-capacity').innerText(),/1\/1/);
        }
        await page.locator('#back-forge').click();
      }
      await page.locator('#jump-codex').click();
      await page.locator('[data-length="1"]').click(); await page.locator('#codex-rune').selectOption('toxin');
      assert.equal(await page.locator('.codex-card').count(),0,'single-character words must not be offered in perk filters');
      await page.locator('[data-length="2"]').click(); await page.locator('#codex-search').fill('学习');
      await page.locator('#codex-rune').selectOption('focus'); assert.equal(await page.locator('.codex-card').count(),0);
      await page.locator('#codex-rune').selectOption('study'); await page.locator('[data-word-effect="学习"]').click();
      assert.match(await page.locator('.meaning-effect-card').innerText(),/1\/1/);
      assert.match(await page.locator('.meaning-effect-card').innerText(),/研习/);
      assert.ok(!(await page.locator('.meaning-effect-card').innerText()).includes('专注'));
      await page.locator('#effect-done').click(); await page.locator('#jump-codex').click();
      await page.locator('#codex-search').fill('寒冰毒箭'); await page.locator('[data-word-effect="寒冰毒箭"]').click();
      assert.match(await page.locator('.meaning-effect-card').innerText(),/2\/2/);
      assert.match(await page.locator('.meaning-effect-card').innerText(),/凝霜.*淬毒/s);
      await page.locator('#effect-done').click(); await page.reload(); await page.locator('#enter-game').click();
      await page.locator('.map-target').nth(1).click();
      assert.equal(await page.locator('.meaning-badge').count(),1);
      assert.match(await page.locator('.rune-capacity').innerText(),/灵词.*1\/1/);
      const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('wordward-save-v1')));
      assert.equal(save.towers.find(t=>t.word==='学习').level,4);
      if(width===393)await page.screenshot({path:`/workspace/shared/wordward-quality-${engine}.png`});
      assert.deepEqual(errors,[]); await context.close();
      console.log(`PASS ${engine} ${width}x${height}: 0/1/1/2 perk limits, actual badges/details/filtering, fixed quality through upgrades and reload`);
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
