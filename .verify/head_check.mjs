// Render the bystander's head during CPR using REAL PLAYBACK (avoids the flaky
// scrub-settle): let the chapter play to ~t=11, then shoot the head from behind.
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
function timeNow(page) {
  return page.evaluate(() => { const m = document.body.innerText.match(/(\d{1,2}):(\d{2})\s*\/\s*\d/); return m ? Number(m[1]) * 60 + Number(m[2]) : -1; });
}
async function headShot(page, file) {
  const hp = await page.evaluate(() => {
    const v = window.__stage3d.figures.get('bystander'); const root = v.figure.root; root.updateWorldMatrix(true, true);
    let h = null; root.traverse((o) => { if (o.isBone && o.name === 'Head') h = o; });
    const m = h.matrixWorld.elements; return [Math.round(m[12] * 100) / 100, Math.round(m[13] * 100) / 100, Math.round(m[14] * 100) / 100];
  });
  await page.evaluate(({ hp }) => {
    const st = window.__stage3d; st.renderer.setAnimationLoop(null);
    const c = st.camera; c.position.set(hp[0] + 1.9, hp[1] + 1.4, hp[2] + 1.7); c.lookAt(hp[0], hp[1] - 0.15, hp[2]); c.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016); else st.renderer.render(st.scene, c);
  }, { hp });
  await (await page.$('canvas')).screenshot({ path: new URL('./' + file, import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved', file, 'head@', JSON.stringify(hp));
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 800, height: 800 } })).newPage();
  page.on('request', (r) => { const u = r.url(); if (/_lib\/.*\.glb/.test(u)) console.log('LIB>', u.split('/').slice(-1)[0]); });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour'); await page.waitForTimeout(700);
  let o = await clickByText(page, 'pathway walkthrough', 'stemi'); if (!o) await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d')); if (el) el.click(); });
  await page.waitForTimeout(3500);
  await clickByText(page, 'collapse'); await page.waitForTimeout(1500);
  let t0 = await timeNow(page); await page.waitForTimeout(1200); let t1 = await timeNow(page);
  if (t1 <= t0) { await clickByText(page, 'play'); console.log('clicked play'); }
  for (let i = 0; i < 40; i++) { const t = await timeNow(page); if (t >= 11) break; await page.waitForTimeout(400); }
  console.log('time at shot:', await timeNow(page));
  const mats = await page.evaluate(() => {
    const v = window.__stage3d.figures.get('bystander'); const out = [];
    v.figure.root.traverse((o) => {
      if (!o.isMesh) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) out.push(`${m.name}=#${(m.color ? m.color.getHexString() : '??')}`);
    });
    return out;
  });
  console.log('bystander materials:', JSON.stringify(mats));
  // default game camera (what the user sees)
  await page.evaluate(() => { const st = window.__stage3d; st.renderer.setAnimationLoop(null); if (st.postFx && st.postFxEnabled) st.postFx.render(0.016); else st.renderer.render(st.scene, st.camera); });
  await (await page.$('canvas')).screenshot({ path: new URL('./head_gamecam.png', import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved head_gamecam.png');
  await headShot(page, 'head_cpr.png');
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
