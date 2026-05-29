import { describe, it, expect } from 'vitest';
import { CURRICULA, curriculumProgress, getCurriculum, nextCaseInCurriculum } from './curricula';
import { cases } from '../content';

const empty: Record<string, { score: number; max: number; at: number }> = {};

describe('CURRICULA', () => {
  it('every curriculum has at least 2 cases', () => {
    for (const c of CURRICULA) expect(c.caseIds.length).toBeGreaterThanOrEqual(2);
  });
  it('ids are unique', () => {
    const ids = CURRICULA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every case id referenced by a curriculum resolves in the catalogue', () => {
    for (const c of CURRICULA) {
      for (const caseId of c.caseIds) {
        expect(cases[caseId], `${c.id} → ${caseId} not in catalogue`).toBeDefined();
      }
    }
  });
});

describe('getCurriculum', () => {
  it('returns by id', () => {
    expect(getCurriculum('cardio')?.title).toContain('Cardio');
  });
  it('returns undefined for unknown id', () => {
    expect(getCurriculum('nope')).toBeUndefined();
  });
});

describe('nextCaseInCurriculum', () => {
  it('returns the first case when nothing is completed', () => {
    const cur = getCurriculum('cardio')!;
    expect(nextCaseInCurriculum(cur, empty)).toBe(cur.caseIds[0]);
  });

  it('returns the next unscored case', () => {
    const cur = getCurriculum('cardio')!;
    const scores = { [cur.caseIds[0]]: { score: 10, max: 10, at: 0 } };
    expect(nextCaseInCurriculum(cur, scores)).toBe(cur.caseIds[1]);
  });

  it('returns null when every case has a score', () => {
    const cur = getCurriculum('cardio')!;
    const scores: typeof empty = {};
    for (const id of cur.caseIds) scores[id] = { score: 5, max: 10, at: 0 };
    expect(nextCaseInCurriculum(cur, scores)).toBeNull();
  });
});

describe('curriculumProgress', () => {
  it('reports 0/total when nothing played', () => {
    const cur = getCurriculum('cross-sector')!;
    const p = curriculumProgress(cur, empty);
    expect(p.completed).toBe(0);
    expect(p.total).toBe(cur.caseIds.length);
    expect(p.ratio).toBe(0);
  });
  it('reports full ratio when all played', () => {
    const cur = getCurriculum('cross-sector')!;
    const scores: typeof empty = {};
    for (const id of cur.caseIds) scores[id] = { score: 5, max: 10, at: 0 };
    const p = curriculumProgress(cur, scores);
    expect(p.ratio).toBe(1);
    expect(p.completed).toBe(p.total);
  });
});
