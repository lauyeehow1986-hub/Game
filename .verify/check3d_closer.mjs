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
  // 3D toggle
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role="button"]')]
      .find((b) => (b.textContent || '').trim().toLowerCase().startsWith('3d'));
    if (el) el.click();
  });
  await page.waitForTimeout(3000);

  // Turn OFF postFX to get a cleaner, less-vignetted read if a toggle exists
  const fx = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,[role="button"]')]
      .find((b) => /postfx/i.test((b.textContent || '').trim()));
    if (el) { el.click(); return (el.textContent || '').trim(); }
    return null;
  });
  console.log('postfx toggle:', fx);
  await page.waitForTimeout(800);

  async function chapterShot(pat, file) {
    const c = await clickByText(page, pat);
    console.log('chapter:', c);
    await page.waitForTimeout(6000); // long settle for clips
    // screenshot only the canvas element for a clean crop
    const canvas = await page.$('canvas');
    if (canvas) {
      await canvas.screenshot({ path: join(__dirname, file) });
      console.log('saved canvas', file);
    } else {
      await page.screenshot({ path: join(__dirname, file) });
      console.log('saved full (no canvas)', file);
    }
  }

  await chapterShot('cath lab activation', 'cathlab_canvas.png');
  await chapterShot('ambulance on scene', 'ambulance_canvas.png');

  await browser.close();
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
