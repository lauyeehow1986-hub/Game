// Determine the collapsed patient's orientation: supine (face up) or prone
// (face down). Render the head from above + a low side view, and read the Head
// bone's local axes in world space to compute which way the face points.
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
    const c = st.camera; c.position.set(pos[0], pos[1], pos[2]); c.lookAt(look[0], look[1], look[2]);
    c.updateProjectionMatrix();
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
  await scrubTo(page, 11); await page.waitForTimeout(2000);

  // Head bone world axes → face/torso-up direction (game world: Y up).
  const ori = await page.evaluate(() => {
    const v = window.__stage3d.figures.get('patient'); const root = v.figure.root; root.updateWorldMatrix(true, true);
    let head = null, torso = null, neck = null;
    root.traverse((o) => { if (o.isBone) { if (o.name === 'Head') head = o; if (o.name === 'Torso') torso = o; if (o.name === 'Neck') neck = o; } });
    function axes(b) { const m = b.matrixWorld.elements; const r = (a) => Math.round(a * 100) / 100;
      return { x: [r(m[0]), r(m[1]), r(m[2])], y: [r(m[4]), r(m[5]), r(m[6])], z: [r(m[8]), r(m[9]), r(m[10])] }; }
    return { head: axes(head), torso: axes(torso) };
  });
  console.log('Head bone world axes (cols x/y/z):', JSON.stringify(ori.head));
  console.log('Torso bone world axes:', JSON.stringify(ori.torso));

  // Patient head ~world (-1.63, 0.24, 0.42); look straight down at it, and from the side.
  await shot(page, 'patient_top.png', [-1.6, 3.5, 0.0], [-1.6, 0, -0.3]);
  await shot(page, 'patient_side.png', [-5.0, 0.8, 0.0], [-1.6, 0.2, -0.3]);
  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
