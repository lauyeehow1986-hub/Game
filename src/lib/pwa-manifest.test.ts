import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The PWA manifest is a static JSON file served from /public. We don't
 * import it through Vite (it's not a code module); we read it directly
 * to verify shape so a syntax error doesn't slip past CI.
 */
describe('manifest.webmanifest', () => {
  const raw = readFileSync(resolve(__dirname, '../../public/manifest.webmanifest'), 'utf8');

  it('parses as JSON', () => {
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('declares the required PWA fields', () => {
    const m = JSON.parse(raw) as Record<string, unknown>;
    for (const key of ['name', 'short_name', 'start_url', 'display', 'icons', 'theme_color']) {
      expect(m[key], key).toBeDefined();
    }
  });

  it('start_url and scope match the Vite base path (/Game/)', () => {
    const m = JSON.parse(raw) as Record<string, string>;
    expect(m.start_url).toBe('/Game/');
    expect(m.scope).toBe('/Game/');
  });

  it('ships at least one large icon (>= 192) with valid src + sizes', () => {
    const m = JSON.parse(raw) as { icons: Array<{ src: string; sizes: string; type: string }> };
    expect(Array.isArray(m.icons)).toBe(true);
    const big = m.icons.find((i) => parseInt(i.sizes, 10) >= 192);
    expect(big).toBeDefined();
    expect(big?.src.startsWith('/Game/')).toBe(true);
  });
});
