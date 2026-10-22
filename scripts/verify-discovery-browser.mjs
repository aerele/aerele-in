// Optional browser validation: npm install --no-save --package-lock=false playwright
// Start a local server on port 8801 before running this script.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { htmlFiles } from './site-files.mjs';
mkdirSync('.pr-screenshots', { recursive: true });
const browser = await chromium.launch();
const expectedContributors = JSON.parse(readFileSync('contributions.json','utf8')).contributors.filter(c=>c.repos.erpnext>0).length;
let checked = 0;
try {
  for (const javaScriptEnabled of [false, true]) {
    for (const width of [390,1280]) {
      const ctx = await browser.newContext({ javaScriptEnabled, viewport:{width,height:900} });
      // Prove layout and evidence do not depend on external scripts or fonts.
      await ctx.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:8801/') ? route.continue() : route.abort());
      for (const file of htmlFiles()) {
        if (['products/index.html','products/frappe-claw/index.html'].includes(file)) continue;
        const page = await ctx.newPage();
        const errors=[];
        page.on('pageerror', e=>errors.push(e.message));
        const route='/' + file.replace(/index.html$/,'');
        await page.goto(`http://127.0.0.1:8801${route}`);
        await page.locator('h1').waitFor({state:'visible'});
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
        assert(!overflow, `${route}: overflow at ${width}px`);
        const color=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
        assert.notEqual(color,'rgba(0, 0, 0, 0)',`${route}: missing CSS`);
        if (route==='/'||route==='/hire-erpnext-developer/') assert.equal(await page.locator('a[href*="github.com/frappe/erpnext/pulls?q="]').count(),expectedContributors);
        if(route==='/blog/') assert((await page.locator('a[href^="/blog/"]').count())>=6);
        if(width===390 && await page.locator('nav details').count()) {
          await page.locator('nav details summary').click();
          await page.locator('nav details a[href="/hire-erpnext-developer/"]').waitFor({state:'visible'});
          await page.locator('nav details summary').click();
        }
        assert.deepEqual(errors,[],`${route}: JavaScript errors`);
        if(javaScriptEnabled && ['/', '/hire-erpnext-developer/', '/products/jarvis/', '/blog/'].includes(route)) await page.screenshot({path:`.pr-screenshots/${route.replaceAll('/','_')}-${width}.png`,fullPage:true});
        checked++;
        await page.close();
      }
      await ctx.close();
    }
  }
  console.log(`Browser validation passed: ${checked} page/viewport/JavaScript combinations, external resources blocked.`);
} finally { await browser.close(); }
