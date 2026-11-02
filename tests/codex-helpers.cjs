// Open a fresh library through its visible controls; nested details first return
// to their parent, then the root library is closed before opening a new one.
async function openCodex(page){for(let i=0;i<4&&await page.locator('#modal').evaluate(e=>e.open);i++)await page.locator('#close-modal').click();await page.locator('#jump-codex').click();}
async function selectCodexFilter(page,selector,...values){if(!await page.locator('#codex-more').evaluate(e=>e.open))await page.locator('#codex-more>summary').click();return page.locator(selector).selectOption(...values);}
module.exports={openCodex,selectCodexFilter};
