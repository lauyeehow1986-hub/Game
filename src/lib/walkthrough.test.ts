import { describe, it, expect } from 'vitest';
import {
  beatsAt,
  canonicalChapterIds,
  canonicalDurationSec,
  chapterOf,
  locateInCanonical,
  nextChapterId,
  type Walkthrough,
} from './walkthrough';
import { stemiWalkthrough } from './walkthrough-stemi';
import { strokeWalkthrough } from './walkthrough-stroke';
import { sepsisWalkthrough } from './walkthrough-sepsis';

/* Small synthetic graph for unit-level tests, so the STEMI content can evolve
 * without breaking traversal coverage. */
function tinyWalkthrough(): Walkthrough {
  return {
    id: 't',
    title: 'tiny',
    startChapterId: 'a',
    actors: {
      x: { id: 'x', role: 'X', team: 'patient', bio: '' },
      y: { id: 'y', role: 'Y', team: 'ed', bio: '' },
    },
    chapters: {
      a: {
        id: 'a',
        title: 'A',
        durationSec: 10,
        defaultNextChapterId: 'b',
        beats: [
          { at: 0, actorId: 'x', action: 'x0' },
          { at: 4, actorId: 'x', action: 'x4' },
          { at: 2, actorId: 'y', action: 'y2' },
        ],
      },
      b: {
        id: 'b',
        title: 'B',
        durationSec: 5,
        branchPoint: {
          prompt: 'choose',
          options: [
            { label: 'go c', nextChapterId: 'c' },
            { label: 'go d', nextChapterId: 'd' },
            { label: 'broken', nextChapterId: 'missing' },
          ],
        },
        beats: [{ at: 0, actorId: 'x', action: 'b0' }],
      },
      c: { id: 'c', title: 'C', durationSec: 3, beats: [] },
      d: { id: 'd', title: 'D', durationSec: 4, beats: [] },
    },
  };
}

describe('walkthrough traversal', () => {
  it('chapterOf returns the chapter by id and null otherwise', () => {
    const w = tinyWalkthrough();
    expect(chapterOf(w, 'a')?.title).toBe('A');
    expect(chapterOf(w, 'nope')).toBeNull();
  });

  it('nextChapterId follows defaultNextChapterId when there is no branch', () => {
    const w = tinyWalkthrough();
    expect(nextChapterId(w, 'a')).toBe('b');
  });

  it('nextChapterId resolves a branch pick to the chosen chapter', () => {
    const w = tinyWalkthrough();
    expect(nextChapterId(w, 'b', 0)).toBe('c');
    expect(nextChapterId(w, 'b', 1)).toBe('d');
  });

  it('nextChapterId returns null for an unresolvable branch option', () => {
    const w = tinyWalkthrough();
    expect(nextChapterId(w, 'b', 2)).toBeNull();
  });

  it('nextChapterId returns null for an unknown chapter or out-of-range pick', () => {
    const w = tinyWalkthrough();
    expect(nextChapterId(w, 'nope')).toBeNull();
    expect(nextChapterId(w, 'b', 99)).toBeNull();
  });

  it('canonicalChapterIds follows defaults only and terminates at a branch', () => {
    const w = tinyWalkthrough();
    // 'b' has a branch (not a default), so the canonical path stops at 'b'.
    expect(canonicalChapterIds(w)).toEqual(['a', 'b']);
  });

  it('canonicalDurationSec sums canonical chapters', () => {
    const w = tinyWalkthrough();
    expect(canonicalDurationSec(w)).toBe(15);
  });

  it('locateInCanonical maps a global second-offset to (chapter, local)', () => {
    const w = tinyWalkthrough();
    expect(locateInCanonical(w, 0)).toEqual({ chapterId: 'a', localSec: 0 });
    expect(locateInCanonical(w, 7)).toEqual({ chapterId: 'a', localSec: 7 });
    expect(locateInCanonical(w, 10)).toEqual({ chapterId: 'a', localSec: 10 });
    expect(locateInCanonical(w, 12)).toEqual({ chapterId: 'b', localSec: 2 });
    // Past the canonical end — clamps to the last chapter's end.
    expect(locateInCanonical(w, 999)).toEqual({ chapterId: 'b', localSec: 5 });
  });
});

describe('walkthrough beats', () => {
  it('beatsAt returns the latest beat per actor at or before t', () => {
    const w = tinyWalkthrough();
    const a = chapterOf(w, 'a')!;
    // At t=1, x has only its t=0 beat; y has none yet.
    const at1 = beatsAt(a, 1).map((b) => `${b.actorId}@${b.at}`);
    expect(at1.sort()).toEqual(['x@0']);
    // At t=3, x still at 0 (next is 4), y has appeared at 2.
    const at3 = beatsAt(a, 3).map((b) => `${b.actorId}@${b.at}`);
    expect(at3.sort()).toEqual(['x@0', 'y@2']);
    // At t=5, x has advanced to its t=4 beat.
    const at5 = beatsAt(a, 5).map((b) => `${b.actorId}@${b.at}`);
    expect(at5.sort()).toEqual(['x@4', 'y@2']);
  });

  it('beatsAt clamps to the chapter duration', () => {
    const w = tinyWalkthrough();
    const a = chapterOf(w, 'a')!;
    const atEnd = beatsAt(a, 10).map((b) => `${b.actorId}@${b.at}`);
    const atPast = beatsAt(a, 999).map((b) => `${b.actorId}@${b.at}`);
    expect(atEnd.sort()).toEqual(atPast.sort());
  });

  it('beatsAt handles a negative time as 0', () => {
    const w = tinyWalkthrough();
    const a = chapterOf(w, 'a')!;
    // No actor has a beat strictly before t=0 here, so we should get x@0 only.
    expect(beatsAt(a, -5).map((b) => b.actorId).sort()).toEqual(['x']);
  });
});

describe('STEMI walkthrough content', () => {
  it('starts at the collapse chapter', () => {
    expect(stemiWalkthrough.startChapterId).toBe('collapse');
    expect(chapterOf(stemiWalkthrough, 'collapse')).toBeTruthy();
  });

  it('every beat references a known actor', () => {
    for (const c of Object.values(stemiWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(
          stemiWalkthrough.actors[b.actorId],
          `chapter ${c.id} beat at ${b.at} references unknown actor ${b.actorId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every branch option leads to a defined chapter', () => {
    for (const c of Object.values(stemiWalkthrough.chapters)) {
      if (!c.branchPoint) continue;
      for (const opt of c.branchPoint.options) {
        expect(
          stemiWalkthrough.chapters[opt.nextChapterId],
          `chapter ${c.id} branch option "${opt.label}" → missing chapter ${opt.nextChapterId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every defaultNextChapterId resolves', () => {
    for (const c of Object.values(stemiWalkthrough.chapters)) {
      if (!c.defaultNextChapterId) continue;
      expect(
        stemiWalkthrough.chapters[c.defaultNextChapterId],
        `chapter ${c.id} defaultNextChapterId ${c.defaultNextChapterId} missing`,
      ).toBeTruthy();
    }
  });

  it('beats within a chapter are strictly within its duration', () => {
    for (const c of Object.values(stemiWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(b.at).toBeGreaterThanOrEqual(0);
        expect(b.at).toBeLessThanOrEqual(c.durationSec);
      }
    }
  });
});

describe('Stroke walkthrough content', () => {
  it('starts at the collapse chapter', () => {
    expect(strokeWalkthrough.startChapterId).toBe('collapse');
    expect(chapterOf(strokeWalkthrough, 'collapse')).toBeTruthy();
  });

  it('every beat references a known actor', () => {
    for (const c of Object.values(strokeWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(
          strokeWalkthrough.actors[b.actorId],
          `chapter ${c.id} beat at ${b.at} references unknown actor ${b.actorId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every branch option leads to a defined chapter', () => {
    for (const c of Object.values(strokeWalkthrough.chapters)) {
      if (!c.branchPoint) continue;
      for (const opt of c.branchPoint.options) {
        expect(
          strokeWalkthrough.chapters[opt.nextChapterId],
          `chapter ${c.id} branch option "${opt.label}" → missing chapter ${opt.nextChapterId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every defaultNextChapterId resolves', () => {
    for (const c of Object.values(strokeWalkthrough.chapters)) {
      if (!c.defaultNextChapterId) continue;
      expect(
        strokeWalkthrough.chapters[c.defaultNextChapterId],
        `chapter ${c.id} defaultNextChapterId ${c.defaultNextChapterId} missing`,
      ).toBeTruthy();
    }
  });

  it('beats within a chapter are strictly within its duration', () => {
    for (const c of Object.values(strokeWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(b.at).toBeGreaterThanOrEqual(0);
        expect(b.at).toBeLessThanOrEqual(c.durationSec);
      }
    }
  });

  it('the thrombectomy chapter ships the thrombectomy-pass showpiece', () => {
    const c = strokeWalkthrough.chapters['thrombectomy']!;
    const t = c.beats.find((b) => b.showpiece?.kind === 'svg' && b.showpiece.id === 'thrombectomy-pass');
    expect(t, 'thrombectomy chapter missing thrombectomy-pass showpiece').toBeTruthy();
  });

  it('Mdm Lim has a distinct internal id from Mr Tan (so sprites differ)', () => {
    expect(strokeWalkthrough.actors['patient'].id).not.toBe(stemiWalkthrough.actors['patient'].id);
  });

  it('every clinical chapter stages the patient figure', () => {
    const clinical = ['arrive-nni', 'ct-scan', 'thrombolysis', 'thrombectomy', 'nicu-transfer', 'stroke-ward', 'community-rehab', 'outpatient-review'];
    for (const id of clinical) {
      const c = strokeWalkthrough.chapters[id]!;
      const patientBeat = c.beats.find((b) => b.actorId === 'patient');
      expect(patientBeat, `stroke chapter ${id} missing a patient beat`).toBeTruthy();
    }
  });
});

describe('Sepsis walkthrough content', () => {
  it('starts at the onset chapter', () => {
    expect(sepsisWalkthrough.startChapterId).toBe('onset');
    expect(chapterOf(sepsisWalkthrough, 'onset')).toBeTruthy();
  });

  it('every beat references a known actor', () => {
    for (const c of Object.values(sepsisWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(
          sepsisWalkthrough.actors[b.actorId],
          `chapter ${c.id} beat at ${b.at} references unknown actor ${b.actorId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every branch option leads to a defined chapter', () => {
    for (const c of Object.values(sepsisWalkthrough.chapters)) {
      if (!c.branchPoint) continue;
      for (const opt of c.branchPoint.options) {
        expect(
          sepsisWalkthrough.chapters[opt.nextChapterId],
          `chapter ${c.id} branch option "${opt.label}" → missing chapter ${opt.nextChapterId}`,
        ).toBeTruthy();
      }
    }
  });

  it('every defaultNextChapterId resolves', () => {
    for (const c of Object.values(sepsisWalkthrough.chapters)) {
      if (!c.defaultNextChapterId) continue;
      expect(
        sepsisWalkthrough.chapters[c.defaultNextChapterId],
        `chapter ${c.id} defaultNextChapterId ${c.defaultNextChapterId} missing`,
      ).toBeTruthy();
    }
  });

  it('beats within a chapter are strictly within its duration', () => {
    for (const c of Object.values(sepsisWalkthrough.chapters)) {
      for (const b of c.beats) {
        expect(b.at).toBeGreaterThanOrEqual(0);
        expect(b.at).toBeLessThanOrEqual(c.durationSec);
      }
    }
  });

  it('carries the three Bandersnatch decision points', () => {
    const branchy = Object.values(sepsisWalkthrough.chapters).filter((c) => c.branchPoint);
    expect(branchy.map((c) => c.id).sort()).toEqual(['ambulance', 'imaging', 'resus']);
    for (const c of branchy) {
      expect(c.branchPoint!.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('the off-canonical detours merge back onto the canonical path', () => {
    expect(sepsisWalkthrough.chapters['triage-delay']!.defaultNextChapterId).toBe('resus');
    expect(sepsisWalkthrough.chapters['antibiotic-delay']!.defaultNextChapterId).toBe('imaging');
    expect(sepsisWalkthrough.chapters['no-source-control']!.defaultNextChapterId).toBe('source-control');
  });

  it('the source-control chapter ships the stent-deployment showpiece', () => {
    const c = sepsisWalkthrough.chapters['source-control']!;
    const s = c.beats.find((b) => b.showpiece?.kind === 'svg' && b.showpiece.id === 'stent-deployment');
    expect(s, 'source-control chapter missing stent-deployment showpiece').toBeTruthy();
  });

  it('the canonical path runs onset → backhouse', () => {
    const ids = canonicalChapterIds(sepsisWalkthrough);
    expect(ids[0]).toBe('onset');
    expect(ids[ids.length - 1]).toBe('backhouse');
    expect(ids).toEqual(
      expect.arrayContaining(['onset', 'ambulance', 'resus', 'imaging', 'source-control', 'icu', 'ward', 'recovery', 'backhouse']),
    );
  });

  it('Mdm Devi has a distinct internal id from the other patients (so sprites differ)', () => {
    expect(sepsisWalkthrough.actors['patient'].id).not.toBe(stemiWalkthrough.actors['patient'].id);
    expect(sepsisWalkthrough.actors['patient'].id).not.toBe(strokeWalkthrough.actors['patient'].id);
  });

  it('every clinical chapter stages the patient figure', () => {
    const clinical = ['ambulance', 'resus', 'imaging', 'source-control', 'icu', 'ward', 'recovery'];
    for (const id of clinical) {
      const c = sepsisWalkthrough.chapters[id]!;
      const patientBeat = c.beats.find((b) => b.actorId === 'patient');
      expect(patientBeat, `sepsis chapter ${id} missing a patient beat`).toBeTruthy();
    }
  });
});
