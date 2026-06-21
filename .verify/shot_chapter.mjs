// Render the default game-camera view of one chapter at a given time.
//   CHAP="Ambulance" TIME=11 node .verify/shot_chapter.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5173/Game/';
const CHAP = process.env.CHAP || 'Ambulance';
const T = Number(process.env.TIME || 11);
const OUT = process.env.OUT || 'chapter.png';

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
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 760 } })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour'); await page.waitForTimeout(700);
  let o = await clickByText(page, 'pathway walkthrough', 'stemi'); if (!o) await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d')); if (el) el.click(); });
  await page.waitForTimeout(3500);
  await clickByText(page, CHAP); await page.waitForTimeout(2500);
  await page.evaluate((t) => {
    const i = [...document.querySelectorAll('input[type="range"]')].find((x) => Number(x.max) > 5);
    const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(i), 'value').set;
    set.call(i, String(t)); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
  }, T);
  await page.waitForTimeout(3000);
  await (await page.$('canvas')).screenshot({ path: new URL('./' + OUT, import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved', OUT, 'chap', CHAP, 't', T);
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
