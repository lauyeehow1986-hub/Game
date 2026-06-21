// Clean CFR top-down: open collapse, scrub straight to t=23 (no prior scrub to a
// frame where the CFR doesn't exist), poll until the figure STOPS moving (two
// equal readings = settled at its authored mark), then shoot a top-down.
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

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { const t = m.text(); if (t.includes('DBG_CFR')) console.log('PAGE>', t); });
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

  console.log('scrub ->', await scrubTo(page, 23));
  let prev = null, settledX = null;
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(600);
    const x = await page.evaluate(() => {
      const v = window.__stage3d?.figures?.get('cfr');
      return v ? Math.round(v.figure.root.position.x * 100) / 100 : null;
    });
    console.log(`  cfr.x=${x}`);
    if (x !== null && prev !== null && Math.abs(x - prev) < 0.03) { settledX = x; break; }
    prev = x;
  }
  console.log('settled cfr.x =', settledX);

  const all = await page.evaluate(() => {
    const st = window.__stage3d; const out = [];
    for (const [id, v] of st.figures) {
      const p = v.figure.root.position;
      out.push(`${id}: x=${Math.round(p.x*100)/100} y=${Math.round(p.y*100)/100} z=${Math.round(p.z*100)/100}`);
    }
    return out;
  });
  console.log('ALL FIGURES @ frame:'); all.forEach((s) => console.log('  ' + s));
  const t = await page.evaluate(() => {
    const m = document.body.innerText.match(/(\d{1,2}:\d{2})\s*\/\s*(\d{1,2}:\d{2})/);
    return m ? m[0] : '(no time)';
  });
  console.log('on-screen time:', t);

  await page.evaluate(() => {
    const st = window.__stage3d;
    st.renderer.setAnimationLoop(null);
    const cam = st.camera;
    cam.position.set(-1.7, 7.5, -0.2);
    cam.lookAt(-1.7, 0, -1.7);
    cam.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016);
    else st.renderer.render(st.scene, cam);
  });
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: new URL('./topdown_cfr.png', import.meta.url).pathname.replace(/^\//, '') });
  console.log('saved topdown_cfr.png');
  await browser.close();
}
main().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
