import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ActorSprite,
  HAIR_COLOURS,
  SKIN_TONES,
  accessoryFor,
  deriveFeatures,
} from './sprite-generator';
import type { WalkthroughActor } from './walkthrough';
import { stemiWalkthrough } from './walkthrough-stemi';

function actor(over: Partial<WalkthroughActor>): WalkthroughActor {
  return {
    id: 'a',
    role: 'Test role',
    team: 'patient',
    bio: '',
    swatch: '#475569',
    ...over,
  };
}

describe('sprite-generator — feature derivation', () => {
  it('deriveFeatures is deterministic for a given id', () => {
    const a = actor({ id: 'paramedic' });
    const f1 = deriveFeatures(a);
    const f2 = deriveFeatures(a);
    expect(f1).toEqual(f2);
  });

  it('different ids produce different features (skin OR hair OR style)', () => {
    const a = deriveFeatures(actor({ id: 'one' }));
    const b = deriveFeatures(actor({ id: 'two' }));
    // At least one of the hash-derived fields should differ; uniform comes
    // from swatch which is shared, so we ignore it.
    expect(
      a.skin !== b.skin || a.hair !== b.hair || a.hairStyle !== b.hairStyle,
      'expected at least one hash-derived feature to differ',
    ).toBe(true);
  });

  it('uniform colour comes from the actor swatch', () => {
    const f = deriveFeatures(actor({ id: 'x', swatch: '#abcdef' }));
    expect(f.uniform).toBe('#abcdef');
  });

  it('uniform falls back to a neutral when no swatch is given', () => {
    const f = deriveFeatures(actor({ id: 'x', swatch: undefined }));
    expect(f.uniform).toBe('#475569');
  });

  it('skin tone is always from the published palette', () => {
    for (let i = 0; i < 50; i += 1) {
      const f = deriveFeatures(actor({ id: `actor-${i}` }));
      expect(SKIN_TONES).toContain(f.skin);
      expect(HAIR_COLOURS).toContain(f.hair);
    }
  });
});

describe('sprite-generator — accessory mapping', () => {
  const cases: Array<{ role: string; team: WalkthroughActor['team']; expect: string }> = [
    { role: 'SCDF paramedic', team: 'ambulance', expect: 'high-vis' },
    { role: 'SCDF EA driver', team: 'ambulance', expect: 'cap' },
    { role: 'ED registrar', team: 'ed', expect: 'stethoscope' },
    { role: 'ED nurse', team: 'ed', expect: 'scrubs' },
    { role: 'ED HCA', team: 'ed', expect: 'scrubs' },
    { role: 'Interventional cardiologist', team: 'cath', expect: 'sterile-gown' },
    { role: 'Cardiothoracic surgeon', team: 'cath', expect: 'sterile-gown' },
    { role: 'Cath lab radiographer', team: 'cath', expect: 'lead-apron' },
    { role: 'Consultant cardiologist', team: 'cath', expect: 'whitecoat' },
    { role: 'Cardiologist (clinic)', team: 'outpatient', expect: 'whitecoat' },
    { role: 'Cardiac physiotherapist (AHP)', team: 'ward', expect: 'ahp-polo' },
    { role: 'Occupational therapist (AHP)', team: 'ward', expect: 'ahp-polo' },
    { role: 'Dietitian (AHP)', team: 'ward', expect: 'ahp-polo' },
    { role: 'Clinical pharmacist (AHP)', team: 'ward', expect: 'ahp-polo' },
    { role: 'Cardiac rehab physiotherapist', team: 'rehab', expect: 'ahp-polo' },
    { role: 'Hospital cook', team: 'support', expect: 'chef-hat' },
    { role: 'Ward cleaner', team: 'support', expect: 'mop' },
    { role: 'Cath lab cleaner', team: 'support', expect: 'mop' },
    { role: 'Laundry coordinator', team: 'support', expect: 'linen-cart' },
    { role: 'Billing clerk', team: 'support', expect: 'clipboard' },
    { role: 'Case manager', team: 'ward', expect: 'clipboard' },
    { role: 'ED registration clerk', team: 'support', expect: 'clipboard' },
    { role: 'myResponder CFR', team: 'first-responder', expect: 'high-vis' },
    // patient id check happens before role-text matching; pass id explicitly.
    { role: 'Bystander', team: 'bystander', expect: 'casual' },
    { role: 'Coffee shop attendant', team: 'support', expect: 'casual' },
  ];
  for (const c of cases) {
    it(`maps ${c.role} (${c.team}) → ${c.expect}`, () => {
      expect(accessoryFor({ id: c.role, role: c.role, team: c.team })).toBe(c.expect);
    });
  }

  it('the patient id always maps to gown regardless of role text', () => {
    expect(accessoryFor({ id: 'patient', role: 'Mr Tan, 58', team: 'patient' })).toBe('gown');
  });
});

describe('sprite-generator — every STEMI walkthrough actor renders', () => {
  it('produces an SVG <g> for every actor in the STEMI catalogue', () => {
    for (const actor of Object.values(stemiWalkthrough.actors)) {
      const svg = renderToStaticMarkup(<ActorSprite actor={actor} />);
      expect(svg, `actor ${actor.id} did not render a <g>`).toMatch(/^<g/);
      // Sanity: contains a head circle.
      expect(svg).toMatch(/<circle[^>]+r="9"/);
    }
  });

  it('renders deterministically — same actor twice produces identical markup', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const s1 = renderToStaticMarkup(<ActorSprite actor={a} />);
    const s2 = renderToStaticMarkup(<ActorSprite actor={a} />);
    expect(s1).toBe(s2);
  });
});
