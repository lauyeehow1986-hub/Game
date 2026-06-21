import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
  await page.waitForTimeout(600);
  await clickByText(page, 'pathway walkthrough', 'stemi');
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role="button"]')]
      .find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d'));
    if (el) el.click();
  });
  await page.waitForTimeout(3000);

  const c = await clickByText(page, 'ambulance on scene');
  console.log('chapter:', c);
  await page.waitForTimeout(5000);

  // Try to drag-orbit the canvas to reveal the patient on the stretcher from another angle.
  const box = await (await page.$('canvas')).boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // orbit left
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 250, cy, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1500);
    await (await page.$('canvas')).screenshot({ path: join(__dirname, 'ambulance_orbitL.png') });
    console.log('saved ambulance_orbitL.png');

    // orbit right + slightly up
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 450, cy - 120, { steps: 25 });
    await page.mouse.up();
    await page.waitForTimeout(1500);
    await (await page.$('canvas')).screenshot({ path: join(__dirname, 'ambulance_orbitR.png') });
    console.log('saved ambulance_orbitR.png');
  } else {
    console.log('no canvas box');
  }

  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
