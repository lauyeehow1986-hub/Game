import { describe, it, expect } from 'vitest';
import { chapterActorOrder, stageFigures } from './walkthrough-staging';
import { beatsAt, type Walkthrough, type WalkthroughBeat } from './walkthrough';
import { stemiWalkthrough } from './walkthrough-stemi';

function activeMap(chapterId: string, t: number) {
  const c = stemiWalkthrough.chapters[chapterId]!;
  return new Map(beatsAt(c, t).map((b) => [b.actorId, b] as const));
}

describe('walkthrough-staging', () => {
  it('chapterActorOrder lists actors by first appearance, ties broken by id', () => {
    const w: Walkthrough = {
      id: 't',
      title: 't',
      startChapterId: 'a',
      actors: {},
      chapters: {
        a: {
          id: 'a',
          title: 'a',
          durationSec: 10,
          beats: [
            { at: 5, actorId: 'late', action: '' },
            { at: 0, actorId: 'zeta', action: '' },
            { at: 0, actorId: 'alpha', action: '' },
          ],
        },
      },
    };
    expect(chapterActorOrder(w.chapters.a)).toEqual(['alpha', 'zeta', 'late']);
  });

  it('only stages present (active or selected) actors', () => {
    const chapter = stemiWalkthrough.chapters['collapse']!;
    const active = activeMap('collapse', 6); // patient + bystander + attendant
    const { figures } = stageFigures(stemiWalkthrough, chapter, active, null);
    const ids = figures.map((f) => f.actor.id).sort();
    expect(ids).toContain('patient');
    expect(ids).toContain('bystander');
    // The CFR hasn't arrived at t=6.
    expect(ids).not.toContain('cfr');
  });

  it('keeps a selected actor on stage even with no active beat', () => {
    const chapter = stemiWalkthrough.chapters['collapse']!;
    const active = new Map<string, WalkthroughBeat>();
    const { figures } = stageFigures(stemiWalkthrough, chapter, active, 'cfr');
    expect(figures.map((f) => f.actor.id)).toEqual(['cfr']);
    expect(figures[0].isActive).toBe(false);
    expect(figures[0].isSelected).toBe(true);
  });

  it('marks the latest-fired active beat as the lead', () => {
    const chapter = stemiWalkthrough.chapters['collapse']!;
    const active = activeMap('collapse', 22); // CFR doing CPR is the latest
    const { leadId, figures } = stageFigures(stemiWalkthrough, chapter, active, null);
    expect(leadId).toBe('cfr');
    expect(figures.find((f) => f.actor.id === 'cfr')!.isLead).toBe(true);
  });

  it('uses an explicit beat position when present, else a fallback', () => {
    const chapter = stemiWalkthrough.chapters['collapse']!;
    const active = activeMap('collapse', 10);
    const { figures } = stageFigures(stemiWalkthrough, chapter, active, null);
    const patient = figures.find((f) => f.actor.id === 'patient')!;
    // Patient's collapse beat pins an explicit pos.
    expect(patient.x).toBe(202);
    expect(patient.y).toBe(238);
  });

  it('sorts figures back-to-front by y (painter order)', () => {
    const chapter = stemiWalkthrough.chapters['ward-stay']!;
    const active = activeMap('ward-stay', 36);
    const { figures } = stageFigures(stemiWalkthrough, chapter, active, null);
    for (let i = 1; i < figures.length; i += 1) {
      expect(figures[i].y).toBeGreaterThanOrEqual(figures[i - 1].y);
    }
  });

  it('every clinical chapter now stages the patient figure', () => {
    const clinical = [
      'arrive-sgh', 'cath-activation', 'cath-procedure', 'cardiac-cta', 'mri-scan',
      'pci-procedure', 'ccu-transfer', 'ward-stay', 'discharge', 'pharmacy',
      'cardiac-rehab', 'outpatient-review',
    ];
    for (const id of clinical) {
      const chapter = stemiWalkthrough.chapters[id]!;
      const active = activeMap(id, 1);
      const { figures } = stageFigures(stemiWalkthrough, chapter, active, null);
      expect(figures.some((f) => f.actor.id === 'patient'), `chapter ${id} missing patient`).toBe(true);
    }
  });
});
