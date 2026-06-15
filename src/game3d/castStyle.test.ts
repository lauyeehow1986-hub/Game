import { describe, it, expect } from 'vitest';
import { styleForActor, SKIN_TONES } from './castStyle';
import type { WalkthroughActor } from '../lib/walkthrough';

const actor = (id: string, role = '', team = ''): WalkthroughActor =>
  ({ id, name: id, role, team } as WalkthroughActor);

describe('castStyle.styleForActor', () => {
  it('is deterministic for the same id', () => {
    expect(styleForActor(actor('mr-tan'))).toEqual(styleForActor(actor('mr-tan')));
  });

  it('varies across different ids', () => {
    const a = styleForActor(actor('mr-tan'));
    const b = styleForActor(actor('mdm-lim'));
    expect(a.skin !== b.skin || a.hair !== b.hair || a.top !== b.top || a.scale !== b.scale).toBe(true);
  });

  it('draws skin from the SG palette', () => {
    expect(SKIN_TONES).toContain(styleForActor(actor('x')).skin);
  });

  it('keeps height scale within a believable band', () => {
    const s = styleForActor(actor('whoever'));
    expect(s.scale).toBeGreaterThanOrEqual(0.94);
    expect(s.scale).toBeLessThanOrEqual(1.06);
  });

  it('gives nurses a scrub top distinct from a doctor white coat', () => {
    const nurse = styleForActor(actor('icu-nurse', 'ICU nurse', 'icu'));
    const doc = styleForActor(actor('ed-doctor', 'ED doctor', 'ed'));
    expect(nurse.top).not.toBe(doc.top);
  });
});
