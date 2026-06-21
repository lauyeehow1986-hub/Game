// Geometry probe (temporary): print world bounding boxes of every figure at the
// two CPR frames so we can see the patient's body axis + chest location vs where
// the responder's crouch lands. No screenshots — numbers only, fast.
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
  return await page.evaluate((target) => {
    const inputs = [...document.querySelectorAll('input[type="range"]')];
    const slider = inputs.find((i) => Number(i.max) > 5) || inputs[0];
    if (!slider) return { ok: false };
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(slider), 'value').set;
    setter.call(slider, String(target));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, value: Number(slider.value) };
  }, sec);
}

// Walk each figure's root, union the world-space bounding boxes of its meshes.
async function probe(page) {
  return await page.evaluate(() => {
    const st = window.__stage3d;
    if (!st || !st.figures) return { ok: false, reason: 'no hook' };
    const out = [];
    for (const [id, view] of st.figures) {
      const root = view.figure.root;
      const min = [Infinity, Infinity, Infinity];
      const max = [-Infinity, -Infinity, -Infinity];
      root.updateWorldMatrix(true, true);
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const g = o.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const bb = g.boundingBox;
        const corners = [
          [bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.min.y, bb.min.z],
          [bb.min.x, bb.max.y, bb.min.z], [bb.max.x, bb.max.y, bb.min.z],
          [bb.min.x, bb.min.y, bb.max.z], [bb.max.x, bb.min.y, bb.max.z],
          [bb.min.x, bb.max.y, bb.max.z], [bb.max.x, bb.max.y, bb.max.z],
        ];
        const m = o.matrixWorld.elements;
        for (const [x, y, z] of corners) {
          const wx = m[0] * x + m[4] * y + m[8] * z + m[12];
          const wy = m[1] * x + m[5] * y + m[9] * z + m[13];
          const wz = m[2] * x + m[6] * y + m[10] * z + m[14];
          min[0] = Math.min(min[0], wx); max[0] = Math.max(max[0], wx);
          min[1] = Math.min(min[1], wy); max[1] = Math.max(max[1], wy);
          min[2] = Math.min(min[2], wz); max[2] = Math.max(max[2], wz);
        }
      });
      const r = root.position;
      out.push({
        id,
        root: [round(r.x), round(r.y), round(r.z)],
        min: min.map(round),
        max: max.map(round),
        size: [round(max[0] - min[0]), round(max[1] - min[1]), round(max[2] - min[2])],
        center: [round((min[0] + max[0]) / 2), round((min[1] + max[1]) / 2), round((min[2] + max[2]) / 2)],
      });
    }
    function round(n) { return Math.round(n * 100) / 100; }
    return { ok: true, figures: out };
  });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
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
  await page.waitForTimeout(3000);

  for (const t of [11, 23]) {
    await scrubTo(page, t);
    await page.waitForTimeout(1800);
    const res = await probe(page);
    console.log(`\n===== t=${t} =====`);
    if (!res.ok) { console.log('probe failed:', res.reason); continue; }
    for (const f of res.figures) {
      console.log(`${f.id.padEnd(18)} root=${JSON.stringify(f.root)} center=${JSON.stringify(f.center)} size=${JSON.stringify(f.size)} x[${f.min[0]}..${f.max[0]}] z[${f.min[2]}..${f.max[2]}]`);
    }
  }

  // Top-down oblique over the patient — the most decisive view of whether each
  // responder's hands land on the chest. Shoot at both CPR moments.
  async function topDown(file) {
    await page.evaluate(() => {
      const st = window.__stage3d;
      st.renderer.setAnimationLoop(null);
      const cam = st.camera;
      cam.position.set(-1.5, 7.5, -0.2);
      cam.lookAt(-1.5, 0, -1.7);
      cam.updateProjectionMatrix();
      if (st.postFx && st.postFxEnabled) st.postFx.render(0.016);
      else st.renderer.render(st.scene, cam);
    });
    const canvas = await page.$('canvas');
    await canvas.screenshot({ path: new URL('./' + file, import.meta.url).pathname.replace(/^\//, '') });
    console.log('saved', file);
  }

  await scrubTo(page, 11);
  await page.waitForTimeout(1800);
  await topDown('topdown_bystander.png');

  // CFR: scrub then let it walk to its mark (loop must be running to move it).
  await page.evaluate(() => { const st = window.__stage3d; st.renderer.setAnimationLoop(() => st.tick()); });
  await scrubTo(page, 23);
  for (let i = 0; i < 14; i++) {
    await page.waitForTimeout(700);
    const x = await page.evaluate(() => {
      const v = window.__stage3d?.figures?.get('cfr');
      return v ? Math.round(v.figure.root.position.x * 100) / 100 : null;
    });
    console.log(`  cfr.x=${x}`);
    if (x !== null && x > -2.3 && x < -1.9) break;
  }
  await topDown('topdown_cfr.png');
  await browser.close();
}
main().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
