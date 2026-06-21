// Bone-level probe: read ACTUAL posed world positions of skeleton bones (skinned
// meshes lie about bounding boxes, but bone.matrixWorld is the real posed pos).
// Tells us exactly where the patient's chest/hips/feet are and where the
// responder's hands land — so "hands on chest vs legs" stops being a guess.
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
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(slider), 'value').set;
    setter.call(slider, String(target));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    return Number(slider.value);
  }, sec);
}
async function settle(page, id) {
  let prev = null;
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(600);
    const c = await page.evaluate((i2) => {
      const v = window.__stage3d?.figures?.get(i2);
      return v ? Math.round(v.figure.root.position.x * 100) / 100 : null;
    }, id);
    if (c !== null && prev !== null && Math.abs(c - prev) < 0.02) return;
    prev = c;
  }
}
// Dump named bone world positions for a figure.
async function bones(page, id, patterns) {
  return await page.evaluate(({ id, patterns }) => {
    const v = window.__stage3d?.figures?.get(id);
    if (!v) return { ok: false, reason: 'no figure ' + id };
    const root = v.figure.root;
    root.updateWorldMatrix(true, true);
    const regs = patterns.map((p) => new RegExp(p, 'i'));
    const out = {};
    root.traverse((o) => {
      if (!o.isBone) return;
      if (!regs.some((r) => r.test(o.name))) return;
      const m = o.matrixWorld.elements;
      out[o.name] = [Math.round(m[12] * 100) / 100, Math.round(m[13] * 100) / 100, Math.round(m[14] * 100) / 100];
    });
    return { ok: true, root: [Math.round(root.position.x * 100) / 100, Math.round(root.position.y * 100) / 100, Math.round(root.position.z * 100) / 100], bones: out };
  }, { id, patterns });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
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
  await page.waitForTimeout(2500);

  await scrubTo(page, 11);
  await settle(page, 'bystander');

  const patientBones = ['hips', 'abdomen', 'torso', 'body', 'neck', 'head', 'foot'];
  const handBones = ['shoulder', 'upperarm', 'lowerarm', 'fist'];
  const pat = await bones(page, 'patient', patientBones);
  const bys = await bones(page, 'bystander', handBones);
  console.log('PATIENT bones:', JSON.stringify(pat));
  console.log('BYSTANDER hands:', JSON.stringify(bys));

  // CFR @ t=23 — settle the long walk-in, then probe its fists vs the chest.
  await page.evaluate(() => { const st = window.__stage3d; st.renderer.setAnimationLoop(() => st.tick()); });
  await scrubTo(page, 23);
  await settle(page, 'cfr');
  const pat2 = await bones(page, 'patient', ['torso', 'abdomen', 'hips']);
  const cfr = await bones(page, 'cfr', ['fist']);
  console.log('PATIENT chest @23:', JSON.stringify(pat2));
  console.log('CFR hands:', JSON.stringify(cfr));
  await browser.close();
}
main().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
