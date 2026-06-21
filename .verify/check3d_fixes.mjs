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

async function listButtons(page) {
  return await page.evaluate(() =>
    [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')]
      .map((b) => (b.textContent || '').trim())
      .filter((t) => t.length > 0 && t.length < 80));
}

// Orbit the camera to a fixed side view using the dev __stage3d hook, render
// one frame, screenshot, then restore the cinematic loop.
async function orbitShot(page, file, { azimuthDeg = 70, elevDeg = 8, radius = 13.5 } = {}) {
  const ok = await page.evaluate(({ azimuthDeg, elevDeg, radius }) => {
    const st = window.__stage3d;
    if (!st || !st.camera || !st.renderer || !st.scene) return false;
    // Freeze the cinematic animation loop so our camera placement holds.
    st.renderer.setAnimationLoop(null);
    const cam = st.camera;
    // Orbit around the patient look-target (table/stretcher surface height).
    const target = { x: 0, y: 0.8, z: -3.0 };
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevDeg * Math.PI) / 180;
    cam.position.set(
      target.x + radius * Math.cos(el) * Math.sin(az),
      target.y + radius * Math.sin(el) + 0.6,
      target.z + radius * Math.cos(el) * Math.cos(az),
    );
    cam.lookAt(target.x, target.y, target.z);
    cam.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016);
    else st.renderer.render(st.scene, cam);
    return true;
  }, { azimuthDeg, elevDeg, radius });
  if (!ok) { console.log('  orbit FAILED (no __stage3d hook) for', file); return false; }
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: join(__dirname, file) });
  console.log('  saved', file, '(orbit az=' + azimuthDeg + ')');
  return true;
}

// Find the patient figure, frame a clean side profile of it. Returns geometry
// info (bbox extents) so we can numerically judge supine (wide & flat) vs
// upright (tall & narrow).
async function patientSideShot(page, file) {
  const info = await page.evaluate(() => {
    const st = window.__stage3d;
    if (!st || !st.figures) return { ok: false, reason: 'no figures map' };
    // figures is a Map keyed by actorId → { actor, figure }
    let entry = st.figures.get && st.figures.get('patient');
    if (!entry) {
      for (const [k, v] of st.figures) {
        if (/patient/i.test(k)) { entry = v; break; }
      }
    }
    if (!entry || !entry.figure || !entry.figure.root) return { ok: false, reason: 'no patient figure' };
    const root = entry.figure.root;
    // World-space bbox of the patient via sampled geometry positions
    // (avoids needing a THREE handle in the page).
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    const v = { x: 0, y: 0, z: 0 };
    root.updateWorldMatrix(true, true);
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const pos = o.geometry.attributes.position;
      if (!pos) return;
      const m = o.matrixWorld.elements;
      for (let i = 0; i < pos.count; i += Math.max(1, Math.floor(pos.count / 200))) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        const wx = m[0] * px + m[4] * py + m[8] * pz + m[12];
        const wy = m[1] * px + m[5] * py + m[9] * pz + m[13];
        const wz = m[2] * px + m[6] * py + m[10] * pz + m[14];
        if (wx < minX) minX = wx; if (wx > maxX) maxX = wx;
        if (wy < minY) minY = wy; if (wy > maxY) maxY = wy;
        if (wz < minZ) minZ = wz; if (wz > maxZ) maxZ = wz;
      }
    });
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const ext = { x: maxX - minX, y: maxY - minY, z: maxZ - minZ };
    // Frame a side profile: camera off to +X of the patient centre, looking along -X.
    st.renderer.setAnimationLoop(null);
    const cam = st.camera;
    // Approach from the LONGER horizontal axis's perpendicular so we see the
    // body length in profile. If z-extent dominates, stand off along +x; else +z.
    const horiz = Math.max(ext.x, ext.z);
    const dist = Math.max(4.0, horiz * 2.4 + 2.6);
    if (ext.z >= ext.x) {
      // body runs along z → view from +x side
      cam.position.set(cx + dist, cy + 1.1, cz + 0.2);
    } else {
      // body runs along x → view from +z side
      cam.position.set(cx + 0.2, cy + 1.1, cz + dist);
    }
    cam.lookAt(cx, cy, cz);
    cam.updateProjectionMatrix();
    if (st.postFx && st.postFxEnabled) st.postFx.render(0.016); else st.renderer.render(st.scene, cam);
    return { ok: true, center: { cx, cy, cz }, ext,
      // heuristic: flat/supine if horizontal span >> vertical span
      supineRatio: +(Math.max(ext.x, ext.z) / Math.max(0.001, ext.y)).toFixed(2),
      verticalH: +ext.y.toFixed(2) };
  });
  if (!info.ok) { console.log('  patientSide FAILED:', info.reason); return info; }
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: join(__dirname, file) });
  console.log('  saved', file, '| patient ext(x,y,z)=',
    info.ext.x.toFixed(2), info.ext.y.toFixed(2), info.ext.z.toFixed(2),
    '| horiz/vert ratio=', info.supineRatio, '(>~1.6 ⇒ lying flat)');
  return info;
}

// Restore the cinematic loop so the next chapter animates normally.
async function restoreLoop(page) {
  await page.evaluate(() => {
    const st = window.__stage3d;
    if (st && st.renderer) st.renderer.setAnimationLoop(() => st.tick());
  });
}

async function inspectCanvas(page) {
  return await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return { hasCanvas: false };
    const r = c.getBoundingClientRect();
    // sample a grid of pixels to detect a blank (single-colour) canvas
    let nonBlank = 'n/a';
    try {
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      nonBlank = gl ? 'webgl-ctx' : 'no-gl-ctx';
    } catch { /* ignore */ }
    return { hasCanvas: true, w: c.width, h: c.height, cssW: Math.round(r.width), cssH: Math.round(r.height), nonBlank,
      hasStageHook: !!window.__stage3d };
  });
}

async function gotoChapter(page, pattern, label) {
  const clicked = await clickByText(page, pattern);
  console.log(`Chapter "${label}":`, clicked);
  if (!clicked) {
    console.log('  buttons present:', JSON.stringify(await listButtons(page)));
  }
  await page.waitForTimeout(4500);
  return clicked;
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

  const chapters = [
    { pat: 'ambulance on scene', label: 'ambulance', file: 'fix_ambulance', az: 78, patient: true },
    { pat: 'cath lab activation', label: 'cathlab', file: 'fix_cathlab', az: 78, patient: true },
    { pat: 'cardiac cta', label: 'imaging-cta', file: 'fix_imaging', az: 78, fallback: 'cardiac mri', patient: true },
    { pat: 'family conference', label: 'family', file: 'fix_family', az: 55, patient: false },
  ];

  for (const ch of chapters) {
    let clicked = await gotoChapter(page, ch.pat, ch.label);
    if (!clicked && ch.fallback) clicked = await gotoChapter(page, ch.fallback, ch.label + '(fallback)');
    const info = await inspectCanvas(page);
    console.log('  canvas:', JSON.stringify(info));
    // front view (cinematic loop running)
    const canvas = await page.$('canvas');
    if (canvas) {
      await canvas.screenshot({ path: join(__dirname, ch.file + '.png') });
      console.log('  saved', ch.file + '.png');
    }
    // orbited side view (family gets only front + a mild orbit)
    await orbitShot(page, ch.file + '_orbit.png', { azimuthDeg: ch.az, elevDeg: 7 });
    // clean patient side-profile for the table/stretcher scenes (fix 3 judgement)
    if (ch.patient) {
      await restoreLoop(page);
      await page.waitForTimeout(300);
      await patientSideShot(page, ch.file + '_patient.png');
    }
    await restoreLoop(page);
    await page.waitForTimeout(600);
  }

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
