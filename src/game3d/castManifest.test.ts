import { describe, it, expect } from 'vitest';
import { CAST_LIB_FILES, resolveLibFile, type CastLibFile } from './castManifest';
import { stemiWalkthrough } from '../lib/walkthrough-stemi';
import { strokeWalkthrough } from '../lib/walkthrough-stroke';
import { sepsisWalkthrough } from '../lib/walkthrough-sepsis';
import type { WalkthroughActor } from '../lib/walkthrough';

const actor = (over: Partial<WalkthroughActor>): WalkthroughActor => ({
  id: 'x',
  role: '',
  team: 'ed',
  bio: '',
  swatch: '#fff',
  ...over,
});

describe('resolveLibFile', () => {
  it('maps senior clinicians to an older doctor figure', () => {
    expect(resolveLibFile(actor({ id: 'consultant-cardio', role: 'Consultant cardiologist' })))
      .toMatch(/doctor-(male|female)-old/);
    expect(resolveLibFile(actor({ id: 'stroke-neurologist', role: 'Consultant neurologist' })))
      .toMatch(/doctor-(male|female)-old/);
  });

  it('maps front-line clinical staff to a young doctor figure', () => {
    expect(resolveLibFile(actor({ id: 'ed-nurse', role: 'ED nurse' })))
      .toMatch(/doctor-(male|female)-young/);
  });

  it('maps pre-hospital responders to a clinical figure, not a construction worker', () => {
    expect(resolveLibFile(actor({ id: 'paramedic', role: 'SCDF paramedic', team: 'ambulance' })))
      .toMatch(/doctor-(male|female)-young/);
    expect(resolveLibFile(actor({ id: 'cfr-responder', role: 'CFR responder', team: 'ambulance' })))
      .toMatch(/doctor-(male|female)-young/);
  });

  it('maps the patient to an older-adult casual figure', () => {
    expect(resolveLibFile(actor({ id: 'patient', role: 'Mr Tan, 58', team: 'patient' })))
      .toMatch(/oldclassy-(male|female)/);
  });

  it('honours explicit gender cues in the role text', () => {
    expect(resolveLibFile(actor({ id: 'family-wife', role: 'Mrs Tan, 56', team: 'patient' })))
      .toBe('casual-female');
  });

  it('only ever returns files we actually ship in the library', () => {
    const allow = new Set<CastLibFile>(CAST_LIB_FILES);
    const allActors = [
      ...Object.values(stemiWalkthrough.actors),
      ...Object.values(strokeWalkthrough.actors),
      ...Object.values(sepsisWalkthrough.actors),
    ];
    for (const a of allActors) {
      const f = resolveLibFile(a);
      if (f !== null) expect(allow.has(f), `${a.id} → ${f}`).toBe(true);
    }
  });

  it('gives every shipped walkthrough actor a non-null mapping', () => {
    const allActors = [
      ...Object.values(stemiWalkthrough.actors),
      ...Object.values(strokeWalkthrough.actors),
      ...Object.values(sepsisWalkthrough.actors),
    ];
    for (const a of allActors) {
      expect(resolveLibFile(a), `${a.id} (${a.role})`).not.toBeNull();
    }
  });

  it('is deterministic for a given actor', () => {
    const a = actor({ id: 'ward-pharm', role: 'Ward pharmacist', team: 'ward' });
    expect(resolveLibFile(a)).toBe(resolveLibFile(a));
  });
});
