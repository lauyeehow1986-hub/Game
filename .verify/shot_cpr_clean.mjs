// Clean CPR-over-supine-patient view: scrub to t=11, settle the bystander until
// it truly stops, then a top-down over the chest and an along-body side view.
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
    set.call(i, String(t)); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
    return Number(i.value);
  }, sec);
}
async function shot(page, file, pos, look) {
  await page.evaluate(({ pos, look }) => {
    const st = window.__stage3d; st.renderer.setAnimationLoop(null);
    const c = st.camera; c.position.set(pos[0], pos[1], pos[2]); c.lookAt(look[0], look[1], look[2]); c.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016); else st.renderer.render(st.scene, c);
  }, { pos, look });
  await (await page.$('canvas')).screenshot({ path: new URL('./' + file, import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved', file);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 1000 } })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour'); await page.waitForTimeout(700);
  let o = await clickByText(page, 'pathway walkthrough', 'stemi'); if (!o) await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d')); if (el) el.click(); });
  await page.waitForTimeout(3500);
  await clickByText(page, 'collapse'); await page.waitForTimeout(2500);
  await scrubTo(page, 11);
  let prev = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const x = await page.evaluate(() => { const v = window.__stage3d.figures.get('bystander'); return v ? Math.round(v.figure.root.position.x * 100) / 100 : null; });
    if (x !== null && prev !== null && Math.abs(x - prev) < 0.01) break;
    prev = x;
  }
  const pos = await page.evaluate(() => { const o = {}; for (const [id, v] of window.__stage3d.figures) { const p = v.figure.root.position; o[id] = [Math.round(p.x * 100) / 100, Math.round(p.z * 100) / 100]; } return o; });
  console.log('settled', JSON.stringify(pos));
  // top-down over the chest; along-body side from the feet (-Z) looking toward the head.
  await shot(page, 'clean_top.png', [-1.5, 3.6, -0.3], [-1.5, 0, -0.3]);
  await shot(page, 'clean_side.png', [-1.5, 0.7, -3.4], [-1.5, 0.2, -0.4]);
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
