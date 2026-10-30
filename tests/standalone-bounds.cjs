const assert = require('node:assert/strict');
const { chromium, webkit } = require('/opt/codex/cua_node/lib/node_modules/playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const engine = process.env.BROWSER || 'chromium';
(async () => {
  const browser = await (engine === 'webkit' ? webkit : chromium).launch({
    headless: true,
    ...(engine === 'chromium' ? { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } : {}),
    ...(base.startsWith('https://') ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
  });
  try {
    for (const [width, height, top, bottom, underreport] of [[393,852,59,34,59],[390,844,47,34,83],[430,932,59,34,93],[375,667,20,0,59],[320,568,20,0,59]]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(({ top, bottom, underreport }) => {
        Object.defineProperty(navigator, 'standalone', { value: true });
        window.__fullscreenCalls = 0;
        Element.prototype.requestFullscreen = () => { window.__fullscreenCalls++; return Promise.resolve(); };
        window.__viewportUnderreport = underreport;
        Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => document.documentElement.clientHeight - window.__viewportUnderreport });
        const visual = new EventTarget();
        Object.defineProperty(visual, 'height', { get: () => innerHeight });
        Object.defineProperty(window, 'visualViewport', { value: visual });
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.setProperty('--safe-top', top + 'px');
          document.documentElement.style.setProperty('--safe-bottom', bottom + 'px');
        });
        localStorage.setItem('wordward-audio-v1', 'off');
      }, { top, bottom, underreport });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.locator('#enter-game').tap();
      async function fits(safeBottom) {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const expected = page.viewportSize().height;
        const actual = await page.evaluate(() => {
          const rect = s => document.querySelector(s).getBoundingClientRect().toJSON();
          return { body: rect('body'), forge: rect('#forge-panel'), button: rect('#forge'), hint: rect('#hint-letters'), reported: innerHeight,
            scroll: document.documentElement.scrollHeight, fullscreens: window.__fullscreenCalls,
            bottomPadding: parseFloat(getComputedStyle(document.querySelector('#forge-panel')).paddingBottom) };
        });
        assert.ok(actual.reported < expected, 'the test must reproduce a short JS viewport');
        assert.ok(Math.abs(actual.body.bottom - expected) < 1, `standalone window ends early: ${JSON.stringify(actual)}`);
        assert.ok(Math.abs(expected - actual.forge.bottom - 6) < 2, 'no browser toolbar-sized gap outside the forge');
        assert.ok(actual.bottomPadding >= Math.max(6, safeBottom), 'home gesture inset belongs inside the forge background');
        assert.ok(actual.button.bottom <= expected - safeBottom && actual.hint.bottom <= expected - safeBottom);
        assert.ok(actual.button.top > 0 && actual.scroll <= expected + 1);
        assert.equal(actual.fullscreens, 0);
      }
      await fits(bottom);
      // Foreground recovery must not reapply the shorter JS height.
      await page.evaluate(() => { window.__viewportUnderreport += 10; dispatchEvent(new Event('pageshow')); });
      await fits(bottom);
      await page.setViewportSize({ width: height, height: width });
      await page.evaluate(top => {
        for (const [side, value] of Object.entries({ top: 0, bottom: 21, left: top, right: top })) document.documentElement.style.setProperty('--safe-' + side, value + 'px');
      }, top);
      await fits(21);
      await page.setViewportSize({ width, height });
      await page.evaluate(({ top, bottom }) => {
        for (const [side, value] of Object.entries({ top, bottom, left: 0, right: 0 })) document.documentElement.style.setProperty('--safe-' + side, value + 'px');
      }, { top, bottom });
      await fits(bottom);
      await page.reload();
      await page.locator('#enter-game').tap();
      await fits(bottom);
      if (width === 393) await page.screenshot({ path: `/workspace/shared/wordward-standalone-full-bounds-${engine}.png` });
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS ${engine} ${width}x${height}: short innerHeight/visualViewport, full window bounds, no outer bottom gap, gesture-safe controls, resume/rotation/reload`);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
