import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:5173/Game/';

const consoleMsgs = [];
const pageErrors = [];
const failedRequests = [];

async function clickByText(page, ...pats) {
  return await page.evaluate((ps) => {
    const regs = ps.map((p) => new RegExp(p, 'i'));
    const els = [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')];
    const el = els.find((b) => regs.every((r) => r.test((b.textContent || '').trim())));
    if (el) { el.click(); return (el.textContent || '').trim().slice(0, 80); }
    return null;
  }, pats);
}

// Set the timeline scrubber (range input) to a target second. React's onChange
// pauses playback and re-renders the frame, so the pose settles deterministically.
async function scrubTo(page, sec) {
  return await page.evaluate((target) => {
    const inputs = [...document.querySelectorAll('input[type="range"]')];
    // The transport scrubber is the one whose max is the chapter duration (~30).
    const slider = inputs.find((i) => Number(i.max) > 5) || inputs[0];
    if (!slider) return { ok: false, reason: 'no range slider' };
    const proto = Object.getPrototypeOf(slider);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(slider, String(target));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, max: Number(slider.max), value: Number(slider.value) };
  }, sec);
}

// Read the on-screen playhead text and any visible CPR caption.
async function readState(page) {
  return await page.evaluate(() => {
    const text = document.body.innerText;
    const timeMatch = text.match(/(\d{1,2}:\d{2})\s*\/\s*(\d{1,2}:\d{2})/);
    const cprCaption = /CPR|chest compression|hands-only/i.test(text);
    // pull the lines mentioning CPR for the log
    const cprLines = text.split('\n').map((s) => s.trim())
      .filter((s) => /CPR|compression|hands-only/i.test(s)).slice(0, 6);
    return { time: timeMatch ? timeMatch[0] : '(no time)', cprCaption, cprLines };
  });
}

// Report which figures are currently in the 'cpr' pose, with their world position.
async function cprFigures(page) {
  return await page.evaluate(() => {
    const st = window.__stage3d;
    if (!st || !st.figures) return { ok: false, reason: 'no hook' };
    const out = [];
    for (const [id] of st.figures) out.push(id);
    return { ok: true, ids: out };
  });
}

async function frontShot(page, file) {
  const canvas = await page.$('canvas');
  if (!canvas) return false;
  await canvas.screenshot({ path: join(__dirname, file) });
  console.log('  saved', file);
  return true;
}

// Orbit the camera ~az degrees around a look-target near the CPR action so we
// can see whether the responder is bent OVER the patient (side profile).
async function orbitShot(page, file, { azimuthDeg = 40, elevDeg = 6, radius = 9, target } = {}) {
  const ok = await page.evaluate(({ azimuthDeg, elevDeg, radius, target }) => {
    const st = window.__stage3d;
    if (!st || !st.camera || !st.renderer || !st.scene) return false;
    st.renderer.setAnimationLoop(null);
    const cam = st.camera;
    const tg = target || { x: 0, y: 0.6, z: -2.5 };
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevDeg * Math.PI) / 180;
    cam.position.set(
      tg.x + radius * Math.cos(el) * Math.sin(az),
      tg.y + radius * Math.sin(el) + 0.6,
      tg.z + radius * Math.cos(el) * Math.cos(az),
    );
    cam.lookAt(tg.x, tg.y, tg.z);
    cam.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016);
    else st.renderer.render(st.scene, cam);
    return true;
  }, { azimuthDeg, elevDeg, radius, target });
  if (!ok) { console.log('  orbit FAILED (no hook) for', file); return false; }
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: join(__dirname, file) });
  console.log('  saved', file, '(orbit az=' + azimuthDeg + ')');
  return true;
}

async function restoreLoop(page) {
  await page.evaluate(() => {
    const st = window.__stage3d;
    if (st && st.renderer) st.renderer.setAnimationLoop(() => st.tick());
  });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();

  page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => pageErrors.push(String(e && e.stack ? e.stack : e)));
  page.on('requestfailed', (r) => failedRequests.push(`FAILED ${r.method()} ${r.url()} :: ${r.failure() && r.failure().errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.url()}`); });

  console.log('Loading', BASE);
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  console.log('skip tour:', await clickByText(page, 'skip tour'));
  await page.waitForTimeout(700);
  let opened = await clickByText(page, 'pathway walkthrough', 'stemi');
  if (!opened) opened = await clickByText(page, 'walkthrough', 'stemi');
  console.log('open STEMI:', opened);
  await page.waitForTimeout(2000);
  const toggled = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role="button"]')]
      .find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d'));
    if (el) { el.click(); return (el.textContent || '').trim().slice(0, 40); }
    return null;
  });
  console.log('3D toggle:', toggled);
  await page.waitForTimeout(3500);

  // Make sure we're on chapter 1 "Collapse".
  console.log('collapse tab:', await clickByText(page, 'collapse'));
  await page.waitForTimeout(3000);
  console.log('hook present:', JSON.stringify(await cprFigures(page)));

  // ---- BYSTANDER CPR: patient collapsed (t>=10), bystander in cpr pose (t>=6).
  // Scrub to t=11 so the patient is supine and the bystander pumps the chest.
  console.log('\n-- bystander CPR @ t=11 --');
  console.log('  scrub:', JSON.stringify(await scrubTo(page, 11)));
  // Let the pose blend + compression bob settle over a few animation frames.
  await page.waitForTimeout(1800);
  console.log('  state:', JSON.stringify(await readState(page)));
  console.log('  figures:', JSON.stringify(await cprFigures(page)));
  await frontShot(page, 'cpr_check_bystander.png');

  // Clean side view of the bystander CPR: target bystander/patient (~x=-1.3,
  // z=-1.75), orbit from the +X (right) side where the bystander kneels.
  await orbitShot(page, 'cpr_check_orbit.png', { azimuthDeg: 50, elevDeg: 6, radius: 4.6, target: { x: -1.3, y: 0.5, z: -1.75 } });
  await restoreLoop(page);
  await page.waitForTimeout(600);

  // ---- CFR CPR: t=22-26. cfr in cpr pose, patient still collapsed.
  // The CFR walks a long arrival path, so after scrubbing it needs several
  // seconds (render loop running) to reach its authored CPR mark before the
  // pose reads correctly. Poll its root.x until it settles near the goal.
  console.log('\n-- CFR CPR @ t=23 --');
  console.log('  scrub:', JSON.stringify(await scrubTo(page, 23)));
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(700);
    const x = await page.evaluate(() => {
      const v = window.__stage3d?.figures?.get('cfr');
      return v ? Math.round(v.figure.root.position.x * 100) / 100 : null;
    });
    console.log(`    settle[${i}] cfr.x=${x}`);
    if (x !== null && x > -2.6 && x < -1.6) break; // reached ~goal (-2.1)
  }
  console.log('  state:', JSON.stringify(await readState(page)));
  await frontShot(page, 'cpr_check_cfr.png');
  // Clean side view: target the CFR/patient (~x=-1.9, z=-1.7) and orbit from the
  // patient's -X (left) side so the standing bystander at +X doesn't occlude.
  await orbitShot(page, 'cpr_check_cfr_orbit.png', { azimuthDeg: -52, elevDeg: 6, radius: 4.6, target: { x: -1.9, y: 0.5, z: -1.7 } });
  await restoreLoop(page);
  await page.waitForTimeout(400);

  await browser.close();

  console.log('\n================ PAGE ERRORS ================');
  if (!pageErrors.length) console.log('(none)');
  pageErrors.slice(0, 40).forEach((m) => console.log(m));

  console.log('\n================ FAILED / 4xx REQUESTS ================');
  if (!failedRequests.length) console.log('(none)');
  failedRequests.slice(0, 80).forEach((m) => console.log(m));

  console.log('\n================ 3D-ASSET (/3d/) FAILURES ================');
  const threeD = failedRequests.filter((m) => /\/3d\//i.test(m));
  if (!threeD.length) console.log('(no failed /3d/ requests)');
  threeD.forEach((m) => console.log(m));

  console.log('\n================ INTERESTING CONSOLE ================');
  const interesting = consoleMsgs.filter((m) => /error|warn|fail|glb|three|texture|404|undefined|NaN|webgl/i.test(m));
  console.log(`total ${consoleMsgs.length}, interesting ${interesting.length}`);
  interesting.slice(0, 60).forEach((m) => console.log(m));
}

main().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
