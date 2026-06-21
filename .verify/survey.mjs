// Survey: render the default game-camera 3D view of every STEMI chapter tab at
// ~60% through, so we can eyeball each scene for pose/placement/model issues.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5173/Game/';

async function clickByText(page, ...pats) {
  return await page.evaluate((ps) => {
    const regs = ps.map((p) => new RegExp(p, 'i'));
    const els = [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')];
    const el = els.find((b) => regs.every((r) => r.test((b.textContent || '').trim())));
    if (el) { el.click(); return (el.textContent || '').trim().slice(0, 80); }
    return null;
  }, pats);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 700 } })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour'); await page.waitForTimeout(700);
  let o = await clickByText(page, 'pathway walkthrough', 'stemi'); if (!o) await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d')); if (el) el.click(); });
  await page.waitForTimeout(3500);

  // collect chapter-tab labels (buttons whose text starts with "N.")
  const tabs = await page.evaluate(() => [...document.querySelectorAll('button,[role="tab"]')]
    .map((b) => (b.textContent || '').trim()).filter((t) => /^\d+\.\s/.test(t)));
  console.log('tabs:', JSON.stringify(tabs));

  for (const label of tabs) {
    const n = label.match(/^(\d+)\./)[1];
    // click the tab
    await page.evaluate((lab) => {
      const el = [...document.querySelectorAll('button,[role="tab"]')].find((b) => (b.textContent || '').trim() === lab);
      if (el) el.click();
    }, label);
    await page.waitForTimeout(2500);
    // scrub to 60%
    await page.evaluate(() => {
      const i = [...document.querySelectorAll('input[type="range"]')].find((x) => Number(x.max) > 5);
      if (!i) return; const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(i), 'value').set;
      set.call(i, String(Math.round(Number(i.max) * 0.6)));
      i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(3000);
    const file = `survey/ch${n.padStart(2, '0')}.png`;
    const canvas = await page.$('canvas');
    if (canvas) { await canvas.screenshot({ path: new URL('./' + file, import.meta.url).pathname.replace(/^\//, '') }); console.log('saved', file, '<', label.slice(0, 42)); }
  }
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
