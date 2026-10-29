const assert = require('node:assert/strict');
const {chromium} = require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({headless: true, executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'], ...(process.env.BASE_URL ? {proxy: {server: process.env.HTTPS_PROXY}} : {})});
  try {
    for (const [width, height] of [[320, 740], [390, 844], [844, 390], [768, 1024], [900, 900], [1024, 768], [1440, 1000]]) {
      const touch = width <= 900;
      const context = await browser.newContext({viewport: {width, height}, hasTouch: touch, isMobile: touch});
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL, {waitUntil: 'domcontentloaded'});
      await page.waitForSelector('.char');
      const press = selector => touch ? page.locator(selector).tap() : page.locator(selector).click();
      const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}×${height}`);
      await noOverflow();
      if (touch) {
        for (const selector of ['.char', '#start', '#speed', '#settings', '#jump-forge']) {
          const rect = await page.locator(selector).first().boundingBox();
          assert.ok(rect.width >= 43.9 && rect.height >= 44, `${selector} too small at ${width}`);
        }
        await press('#jump-forge');
      }
      // Use actual touch input to select a recipe, return to the map, and build.
      await press('#clear-chars');
      await press('[data-char="冰"]');
      await press('[data-char="霜"]');
      await press('#forge');
      if (touch) {
        await page.waitForFunction(() => {
          const r = document.querySelector('#battle-panel').getBoundingClientRect();
          return r.top >= 0 && r.top < 25;
        });
      }
      await press('.map-target:nth-child(3)');
      assert.equal(await page.locator('#ink').innerText(), '150');
      await press('.map-target:nth-child(3)');
      await page.waitForSelector('#upgrade');
      await noOverflow();
      await press('#upgrade');
      assert.equal(await page.locator('#ink').innerText(), '112');
      await press('#back-forge');
      if (touch) {
        await press('#jump-forge');
        await press('#forge');
        await press('#jump-forge');
        await press('#forge'); // Cancel placement without a keyboard.
        await press('#jump-battle');
        await press('.map-target:nth-child(2)');
        assert.equal(await page.locator('#ink').innerText(), '112');
      }
      if (touch) await press('#jump-battle');
      await press('#start');
      await page.waitForFunction(() => document.querySelector('#phase-label').textContent.includes('进行中'));
      await press('#start');
      assert.ok(await page.locator('#pause-overlay').isVisible());
      await press('#settings');
      await noOverflow();
      assert.ok(await page.locator('#restart-setting').isVisible());
      await press('#close-modal');
      await press('[data-nav="codex"]');
      assert.equal(await page.locator('.codex-card').count(), 6);
      await noOverflow();
      await press('#close-modal');
      if (width === 390 || width === 1440) {
        if (width === 390) {
          await page.setViewportSize({width: 844, height: 390});
          await noOverflow();
          assert.equal(await page.locator('#ink').innerText(), '112');
          assert.ok(await page.locator('#pause-overlay').isVisible());
          await page.setViewportSize({width, height});
          await noOverflow();
        }
        await page.screenshot({path: `/workspace/shared/zi-zhen-responsive-${width}.png`, fullPage: true});
      }
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}×${height}: layout, ${touch ? 'touch' : 'mouse'} build/upgrade, battle, modal, cancel`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
