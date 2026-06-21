import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:5173/Game/';

const consoleMsgs = [];
const pageErrors = [];
const failedRequests = [];

function log(...a) { console.log(...a); }

async function clickButtonByText(page, ...patterns) {
  // patterns are regex source strings; all must match (case-insensitive)
  return await page.evaluate((pats) => {
    const regs = pats.map((p) => new RegExp(p, 'i'));
    const btns = [...document.querySelectorAll('button, a, [role="button"]')];
    const el = btns.find((b) => {
      const t = (b.textContent || '').trim();
      return regs.every((r) => r.test(t));
    });
    if (el) {
      el.click();
      return (el.textContent || '').trim().slice(0, 80);
    }
    return null;
  }, patterns);
}

async function listButtons(page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll('button, a, [role="button"]')]
      .map((b) => (b.textContent || '').trim())
      .filter((t) => t.length > 0 && t.length < 80);
  });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err && err.stack ? err.stack : err));
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`FAILED ${req.method()} ${req.url()} :: ${req.failure() && req.failure().errorText}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`HTTP ${res.status()} ${res.url()}`);
    }
  });

  log('Loading', BASE);
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  // Step 2: dismiss intro tour
  const skipped = await clickButtonByText(page, 'skip tour');
  log('Skip tour clicked:', skipped);
  await page.waitForTimeout(800);

  // Step 3: open the STEMI pathway walkthrough
  let opened = await clickButtonByText(page, 'pathway walkthrough', 'stemi');
  if (!opened) {
    // fallback: try just walkthrough + stemi
    opened = await clickButtonByText(page, 'walkthrough', 'stemi');
  }
  log('Opened walkthrough button:', opened);
  if (!opened) {
    log('Could not find STEMI walkthrough button. Buttons present:');
    log(JSON.stringify(await listButtons(page), null, 2));
  }
  await page.waitForTimeout(2000);

  // Step 4: toggle to 3D renderer
  const toggled = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, [role="button"]')];
    const el = btns.find((b) => ((b.textContent || '').trim().toLowerCase().startsWith('3d')));
    if (el) { el.click(); return (el.textContent || '').trim().slice(0, 40); }
    return null;
  });
  log('3D toggle clicked:', toggled);
  if (!toggled) {
    log('No 3D toggle found. Buttons in modal:');
    log(JSON.stringify(await listButtons(page), null, 2));
  }
  await page.waitForTimeout(3000);

  async function gotoChapter(pattern, label) {
    const clicked = await page.evaluate((pat) => {
      const r = new RegExp(pat, 'i');
      const btns = [...document.querySelectorAll('button, [role="tab"], a')];
      const el = btns.find((b) => r.test((b.textContent || '').trim()));
      if (el) { el.click(); return (el.textContent || '').trim().slice(0, 80); }
      return null;
    }, pattern);
    log(`Chapter "${label}" tab clicked:`, clicked);
    if (!clicked) {
      log(`Could not find chapter matching ${pattern}. Buttons present:`);
      log(JSON.stringify(await listButtons(page), null, 2));
    }
    // wait for GLB + clips + animation start
    await page.waitForTimeout(4500);
    return clicked;
  }

  // canvas presence + non-blank check helper
  async function inspectCanvas() {
    return await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return { hasCanvas: false };
      const rect = c.getBoundingClientRect();
      return {
        hasCanvas: true,
        width: c.width,
        height: c.height,
        cssW: Math.round(rect.width),
        cssH: Math.round(rect.height),
      };
    });
  }

  // Cath lab activation
  const cl = await gotoChapter('cath lab activation', 'cath lab activation');
  const clCanvas = await inspectCanvas();
  log('Cath lab canvas:', JSON.stringify(clCanvas));
  await page.screenshot({ path: join(__dirname, 'cathlab.png') });
  log('Saved cathlab.png');

  // Ambulance on scene
  const amb = await gotoChapter('ambulance on scene', 'ambulance on scene');
  const ambCanvas = await inspectCanvas();
  log('Ambulance canvas:', JSON.stringify(ambCanvas));
  await page.screenshot({ path: join(__dirname, 'ambulance.png') });
  log('Saved ambulance.png');

  await browser.close();

  log('\n================ CONSOLE MESSAGES ================');
  const interesting = consoleMsgs.filter((m) => /error|warn|fail|gl|webgl|glb|three|texture|404|undefined|NaN/i.test(m));
  log(`Total console msgs: ${consoleMsgs.length}; interesting: ${interesting.length}`);
  interesting.slice(0, 80).forEach((m) => log(m));

  log('\n================ PAGE ERRORS ================');
  if (pageErrors.length === 0) log('(none)');
  pageErrors.slice(0, 40).forEach((m) => log(m));

  log('\n================ FAILED / 4xx REQUESTS ================');
  if (failedRequests.length === 0) log('(none)');
  failedRequests.slice(0, 80).forEach((m) => log(m));

  log('\n================ 3D-ASSET REQUESTS (/3d/) ================');
  // print from console any that referenced /3d/
  const threeD = failedRequests.filter((m) => /\/3d\//i.test(m));
  if (threeD.length === 0) log('(no failed /3d/ requests)');
  threeD.forEach((m) => log(m));
}

main().catch((e) => {
  console.error('SCRIPT ERROR:', e);
  process.exit(1);
});
