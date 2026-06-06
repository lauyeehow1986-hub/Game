import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SHOWPIECES, ShowpieceArt, type ShowpieceId } from './showpieces';
import { stemiWalkthrough } from './walkthrough-stemi';

const ALL: ShowpieceId[] = ['stent-deployment', 'mri-bore-slide', 'aed-shock'];

describe('showpieces — art', () => {
  it('every showpiece id renders a 480×270 SVG with no NaN/undefined coords', () => {
    for (const id of ALL) {
      const svg = renderToStaticMarkup(<ShowpieceArt id={id} />);
      expect(svg, `showpiece ${id}`).toMatch(/^<svg/);
      expect(svg).toContain('viewBox="0 0 480 270"');
      expect(svg).not.toMatch(/NaN|undefined/);
      expect(svg.length).toBeGreaterThan(800);
    }
  });

  it('every showpiece carries at least one SMIL animation', () => {
    for (const id of ALL) {
      const svg = renderToStaticMarkup(<ShowpieceArt id={id} />);
      expect(svg, `showpiece ${id} has no <animate>`).toMatch(/<animate(Transform)?\s/);
    }
  });

  it('SHOWPIECES metadata covers every art id', () => {
    for (const id of ALL) {
      expect(SHOWPIECES[id]).toBeTruthy();
      expect(SHOWPIECES[id].title.length).toBeGreaterThan(0);
      expect(SHOWPIECES[id].caption.length).toBeGreaterThan(0);
    }
  });

  it('renders deterministically', () => {
    for (const id of ALL) {
      expect(renderToStaticMarkup(<ShowpieceArt id={id} />)).toBe(renderToStaticMarkup(<ShowpieceArt id={id} />));
    }
  });
});

describe('showpieces — wiring into the STEMI walkthrough', () => {
  it('AED shock beat declares the aed-shock showpiece', () => {
    const collapse = stemiWalkthrough.chapters['collapse']!;
    const shockBeats = collapse.beats.filter((b) => b.showpiece?.kind === 'svg' && b.showpiece.id === 'aed-shock');
    expect(shockBeats.length).toBeGreaterThan(0);
    expect(shockBeats[0].action.toLowerCase()).toMatch(/shock/);
  });

  it('PCI stent-deploy beat declares the stent-deployment showpiece', () => {
    const pci = stemiWalkthrough.chapters['pci-procedure']!;
    const stentBeats = pci.beats.filter((b) => b.showpiece?.kind === 'svg' && b.showpiece.id === 'stent-deployment');
    expect(stentBeats.length).toBe(1);
  });

  it('MRI sequences beat declares the mri-bore-slide showpiece', () => {
    const mri = stemiWalkthrough.chapters['mri-scan']!;
    const mriBeats = mri.beats.filter((b) => b.showpiece?.kind === 'svg' && b.showpiece.id === 'mri-bore-slide');
    expect(mriBeats.length).toBe(1);
  });

  it('every showpiece id used by a beat exists in the registry', () => {
    for (const c of Object.values(stemiWalkthrough.chapters)) {
      for (const b of c.beats) {
        if (b.showpiece?.kind === 'svg') {
          expect(SHOWPIECES[b.showpiece.id], `unknown showpiece id ${b.showpiece.id} in chapter ${c.id}`).toBeTruthy();
        }
      }
    }
  });
});
