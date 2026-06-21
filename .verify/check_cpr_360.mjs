// 360° CPR positional verification. For each CPR moment (bystander @ t=11,
// CFR @ t=23) orbit the camera all the way around the action and shoot from
// top-down, lateral (front/right/back/left), slanting-down, and slanting-up so
// we can confirm the responder's hands sit on the patient's chest from every
// axis — not just the two angles that happened to look right.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const BASE = 'http://localhost:5173/Game/';
mkdirSync(new URL('./360/', import.meta.url), { recursive: true });

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
  return await page.evaluate((target) => {
    const inputs = [...document.querySelectorAll('input[type="range"]')];
    const slider = inputs.find((i) => Number(i.max) > 5) || inputs[0];
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(slider), 'value').set;
    setter.call(slider, String(target));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    return Number(slider.value);
  }, sec);
}
// Park the camera at (az, el) around `target` at `radius`, render one static
// frame, screenshot. el>0 looks downward, el<0 looks upward; camera y clamped
// just above the floor so upward shots don't sink under it.
async function shot(page, file, target, az, el, radius) {
  await page.evaluate(({ target, az, el, radius }) => {
    const st = window.__stage3d;
    st.renderer.setAnimationLoop(null);
    const cam = st.camera;
    const a = az * Math.PI / 180, e = el * Math.PI / 180;
    const y = Math.max(0.12, target.y + radius * Math.sin(e));
    cam.position.set(
      target.x + radius * Math.cos(e) * Math.sin(a),
      y,
      target.z + radius * Math.cos(e) * Math.cos(a),
    );
    cam.lookAt(target.x, target.y, target.z);
    cam.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016);
    else st.renderer.render(st.scene, cam);
  }, { target, az, el, radius });
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: new URL('./360/' + file, import.meta.url).pathname.replace(/^\//, '') });
  console.log('  saved 360/' + file);
}
// Full angle matrix around one action point.
async function matrix(page, prefix, target) {
  const R = 3.8;
  await shot(page, `${prefix}_topdown.png`, target, 0, 85, 5.0);
  // lateral ring (eye level), all four sides + diagonals
  for (const [name, az] of [['front', 0], ['frontR', 45], ['right', 90], ['backR', 135], ['back', 180], ['backL', 225], ['left', 270], ['frontL', 315]]) {
    await shot(page, `${prefix}_lat_${name}.png`, target, az, 7, R);
  }
  // slanting downward (bird's-eye-ish) from four diagonals
  for (const [name, az] of [['fr', 45], ['br', 135], ['bl', 225], ['fl', 315]]) {
    await shot(page, `${prefix}_down_${name}.png`, target, az, 40, R);
  }
  // slanting upward (low angle looking up at the hands) from front + two sides
  for (const [name, az] of [['front', 0], ['right', 90], ['left', 270]]) {
    await shot(page, `${prefix}_up_${name}.png`, target, az, -18, R - 0.4);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await clickByText(page, 'skip tour');
  await page.waitForTimeout(700);
  let opened = await clickByText(page, 'pathway walkthrough', 'stemi');
  if (!opened) opened = await clickByText(page, 'walkthrough', 'stemi');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role="button"]')]
      .find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d'));
    if (el) el.click();
  });
  await page.waitForTimeout(3500);
  await clickByText(page, 'collapse');
  await page.waitForTimeout(2500);

  // Read live positions so the orbit target is the true midpoint of the action.
  async function pos(id) {
    return await page.evaluate((i) => {
      const v = window.__stage3d?.figures?.get(i);
      if (!v) return null;
      const p = v.figure.root.position;
      return { x: Math.round(p.x * 100) / 100, z: Math.round(p.z * 100) / 100 };
    }, id);
  }

  // Poll a figure's x until it stops moving (settled at its mark).
  async function settle(id) {
    let prev = null;
    for (let i = 0; i < 18; i++) {
      await page.waitForTimeout(600);
      const c = await pos(id);
      if (c && prev && Math.abs(c.x - prev.x) < 0.02 && Math.abs(c.z - prev.z) < 0.02) return c;
      prev = c;
    }
    return prev;
  }

  // ---- Bystander @ t=11 (settle its walk-in before shooting; patient supine).
  console.log('\n== bystander @ t=11 ==');
  await scrubTo(page, 11);
  await settle('bystander');
  const pPat = await pos('patient'), pBys = await pos('bystander');
  console.log('  patient', JSON.stringify(pPat), 'bystander', JSON.stringify(pBys));
  // Target the patient's CHEST (torso bone ~world -1.6, z -0.16), not the root
  // (which sits at the feet) — earlier verification framed the wrong spot.
  await matrix(page, 'bys', { x: -1.5, y: 0.45, z: -0.2 });

  // ---- CFR @ t=23 (settle the long arrival walk first).
  console.log('\n== CFR @ t=23 ==');
  await page.evaluate(() => { const st = window.__stage3d; st.renderer.setAnimationLoop(() => st.tick()); });
  await scrubTo(page, 23);
  let prev = null;
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(600);
    const c = await pos('cfr');
    if (c && prev && Math.abs(c.x - prev.x) < 0.03) break;
    prev = c;
  }
  const pPat2 = await pos('patient'), pCfr = await pos('cfr');
  console.log('  patient', JSON.stringify(pPat2), 'cfr', JSON.stringify(pCfr));
  await matrix(page, 'cfr', { x: -1.7, y: 0.45, z: -0.2 });

  await browser.close();
  console.log('\nPAGE ERRORS:', errs.length ? errs : '(none)');
}
main().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
