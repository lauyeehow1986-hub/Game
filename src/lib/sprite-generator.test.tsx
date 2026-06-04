import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ActorSprite,
  HAIR_COLOURS,
  INTERACTION_FRAMES,
  SKIN_TONES,
  WALK_FRAMES,
  accessoryFor,
  armRaiseFor,
  darken,
  deriveFeatures,
  poseTransform,
  strideFor,
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
      // Sanity: HD pixel-art head is a 16×16 rectangle.
      expect(svg).toMatch(/<rect[^>]+width="16"[^>]+height="16"/);
    }
  });

  it('renders deterministically — same actor twice produces identical markup', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const s1 = renderToStaticMarkup(<ActorSprite actor={a} />);
    const s2 = renderToStaticMarkup(<ActorSprite actor={a} />);
    expect(s1).toBe(s2);
  });

  it('back-facing (N) suppresses facial features', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const front = renderToStaticMarkup(<ActorSprite actor={a} direction="S" />);
    const back = renderToStaticMarkup(<ActorSprite actor={a} direction="N" />);
    // Eyes (fill="#1a1410" at the eye coords) only render front-side.
    // The simplest invariant: the back-facing markup is strictly shorter.
    expect(back.length).toBeLessThan(front.length);
  });

  it('W-facing applies a horizontal flip transform', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const out = renderToStaticMarkup(<ActorSprite actor={a} direction="W" />);
    expect(out).toMatch(/scale\(-1,1\)/);
  });

  it('different interaction frames produce different arm Y coords', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const f0 = renderToStaticMarkup(<ActorSprite actor={a} interactionFrame={0} />);
    const f2 = renderToStaticMarkup(<ActorSprite actor={a} interactionFrame={2} />);
    expect(f0).not.toBe(f2);
  });

  it('different walk frames produce different leg X coords', () => {
    const a = stemiWalkthrough.actors['paramedic'];
    const w0 = renderToStaticMarkup(<ActorSprite actor={a} walkFrame={0} />);
    const w1 = renderToStaticMarkup(<ActorSprite actor={a} walkFrame={1} />);
    expect(w0).not.toBe(w1);
  });
});

describe('sprite-generator — poses', () => {
  const a = () => stemiWalkthrough.actors['patient'];

  it('poseTransform returns empty for upright poses and a transform otherwise', () => {
    expect(poseTransform('stand')).toBe('');
    expect(poseTransform('walk')).toBe('');
    expect(poseTransform('point')).toBe('');
    expect(poseTransform('kneel')).not.toBe('');
    expect(poseTransform('sit')).not.toBe('');
    expect(poseTransform('cpr')).not.toBe('');
    expect(poseTransform('collapsed')).not.toBe('');
  });

  it('collapsed pose lays the figure down with a rotation', () => {
    expect(poseTransform('collapsed')).toMatch(/rotate\(-7\d/);
    const svg = renderToStaticMarkup(<ActorSprite actor={a()} pose="collapsed" />);
    expect(svg).toMatch(/rotate\(-7\d/);
  });

  it('each pose yields distinct rendered markup', () => {
    const seen = new Set<string>();
    for (const pose of ['stand', 'kneel', 'sit', 'cpr', 'collapsed', 'point'] as const) {
      seen.add(renderToStaticMarkup(<ActorSprite actor={a()} pose={pose} />));
    }
    expect(seen.size).toBe(6);
  });

  it('the CPR pose draws stacked hands below the arms', () => {
    const stand = renderToStaticMarkup(<ActorSprite actor={a()} pose="stand" />);
    const cpr = renderToStaticMarkup(<ActorSprite actor={a()} pose="cpr" />);
    expect(cpr).not.toBe(stand);
  });
});

describe('sprite-generator — expressions', () => {
  const a = () => stemiWalkthrough.actors['patient'];

  it('each expression yields distinct rendered markup', () => {
    const seen = new Set<string>();
    for (const expression of ['neutral', 'alarmed', 'distressed', 'pained', 'focused', 'relieved', 'unconscious'] as const) {
      seen.add(renderToStaticMarkup(<ActorSprite actor={a()} expression={expression} />));
    }
    expect(seen.size).toBe(7);
  });

  it('expressions are suppressed on a back-facing sprite', () => {
    const neutral = renderToStaticMarkup(<ActorSprite actor={a()} direction="N" expression="neutral" />);
    const alarmed = renderToStaticMarkup(<ActorSprite actor={a()} direction="N" expression="alarmed" />);
    expect(neutral).toBe(alarmed);
  });
});

describe('sprite-generator — colour helpers', () => {
  it('darken reduces each channel by the factor', () => {
    expect(darken('#ffffff', 0.5)).toBe('#808080'); // round(255*0.5)=128
    expect(darken('#000000', 0.5)).toBe('#000000');
    expect(darken('#10a060', 1)).toBe('#10a060');
  });

  it('darken returns the input unchanged for a malformed colour', () => {
    expect(darken('rgb(1,2,3)')).toBe('rgb(1,2,3)');
  });

  it('deriveFeatures exposes a darker uniform shade', () => {
    const f = deriveFeatures({ id: 'x', role: 'r', team: 'ward', bio: '', swatch: '#3aa6ff' });
    expect(f.uniformShade).not.toBe(f.uniform);
    expect(f.uniformShade).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('sprite-generator — animation frame math', () => {
  it('armRaiseFor cycles through 6 frames with a peak in the middle', () => {
    expect(armRaiseFor(0)).toBe(0);
    expect(armRaiseFor(1)).toBe(-2);
    expect(armRaiseFor(2)).toBe(-4); // peak
    expect(armRaiseFor(3)).toBe(-2);
    expect(armRaiseFor(4)).toBe(0);
    expect(armRaiseFor(5)).toBe(0);
  });

  it('armRaiseFor wraps modulo the interaction-loop length', () => {
    for (let i = -10; i < 10; i += 1) {
      expect(armRaiseFor(i)).toBe(armRaiseFor(i + INTERACTION_FRAMES));
    }
  });

  it('strideFor alternates left and right stride directions', () => {
    expect(strideFor(0)).toEqual({ leftDx: 0, rightDx: 0 });
    expect(strideFor(1).leftDx).toBeGreaterThan(0);
    expect(strideFor(1).rightDx).toBeLessThan(0);
    expect(strideFor(3).leftDx).toBeLessThan(0);
    expect(strideFor(3).rightDx).toBeGreaterThan(0);
  });

  it('strideFor wraps modulo the walk-cycle length', () => {
    for (let i = -10; i < 10; i += 1) {
      expect(strideFor(i)).toEqual(strideFor(i + WALK_FRAMES));
    }
  });
});
