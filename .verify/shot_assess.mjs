// Render the new assessment moment (t=5): patient should be supine on the floor
// and the bystander kneeling beside, checking (not yet compressing).
import { chromium } from 'playwright';
const BASE = 'http://localhost:5173/Game/';

async function clickByText(page, ...pats) {
  return await page.evaluate((ps) => {
    const regs = ps.map((p) => new RegExp(p, 'i'));
    const els = [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')];
    const el = els.find((b) => regs.every((r) => r.test((b.textContent || '').trim())));
    if (el) { el.click(); return (el.textContent || '').trim().slice(0, 80); }
    return null;
  }, pats);
}
async function scrubTo(page, sec) {
  return await page.evaluate((t) => {
    const i = [...document.querySelectorAll('input[type="range"]')].find((x) => Number(x.max) > 5);
    const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(i), 'value').set;
    set.call(i, String(t));
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new Event('change', { bubbles: true }));
    return Number(i.value);
  }, sec);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour');
  await page.waitForTimeout(700);
  let o = await clickByText(page, 'pathway walkthrough', 'stemi');
  if (!o) await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d')); if (el) el.click(); });
  await page.waitForTimeout(3500);
  await clickByText(page, 'collapse');
  await page.waitForTimeout(2500);
  console.log('scrub ->', await scrubTo(page, 5));
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const st = window.__stage3d; const out = {};
    for (const [id, v] of st.figures) { const p = v.figure.root.position; out[id] = [Math.round(p.x * 100) / 100, Math.round(p.z * 100) / 100]; }
    const m = document.body.innerText.match(/(\d{1,2}:\d{2})\s*\/\s*(\d{1,2}:\d{2})/);
    return { figs: out, time: m ? m[0] : '?' };
  });
  console.log('time', info.time, 'figures', JSON.stringify(info.figs));
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: new URL('./assess_t5.png', import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved assess_t5.png');
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
