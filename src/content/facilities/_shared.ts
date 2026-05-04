import type { Department } from '../../lib/types';

/**
 * Place departments on an 800x600 logical canvas in a roughly grid layout.
 * Used by smaller facilities (polyclinics, specialty clinics, AdMC) where
 * a hand-drawn layout isn't worth the maintenance.
 */
export function gridLayout(
  defs: Array<Omit<Department, 'position' | 'radius'> & { radius?: number }>,
  opts: { cols?: number; padX?: number; padY?: number; gapY?: number } = {},
): Department[] {
  const cols = opts.cols ?? 3;
  const padX = opts.padX ?? 90;
  const padY = opts.padY ?? 160;
  const gapY = opts.gapY ?? 110;
  const W = 800;
  const usableW = W - padX * 2;
  const colStep = cols > 1 ? usableW / (cols - 1) : 0;

  return defs.map((d, i) => {
    const r = i % cols;
    const row = Math.floor(i / cols);
    return {
      ...d,
      radius: d.radius ?? 32,
      position: {
        x: cols === 1 ? W / 2 : padX + colStep * r,
        y: padY + row * gapY,
      },
    };
  });
}
