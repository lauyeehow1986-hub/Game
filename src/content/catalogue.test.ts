import { describe, it, expect } from 'vitest';
import { cases, listCases } from './index';

describe('case catalogue smoke', () => {
  it('exposes at least 28 built-in cases', () => {
    expect(listCases().length).toBeGreaterThanOrEqual(28);
  });

  it('every case id is unique', () => {
    const ids = listCases().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every case has a title, blurb, category, primaryFacility, profileKey, and pathway', () => {
    for (const c of listCases()) {
      expect(c.id, `case missing id`).toBeTruthy();
      expect(c.title, `${c.id} missing title`).toBeTruthy();
      expect(c.blurb, `${c.id} missing blurb`).toBeTruthy();
      expect(c.category, `${c.id} missing category`).toBeTruthy();
      expect(c.primaryFacility, `${c.id} missing primaryFacility`).toBeTruthy();
      expect(c.profileKey, `${c.id} missing profileKey`).toBeTruthy();
      expect(Array.isArray(c.pathway), `${c.id} pathway is not array`).toBe(true);
      expect(c.pathway.length, `${c.id} has empty pathway`).toBeGreaterThan(0);
    }
  });

  it('every decision option has a label, score, and rationale', () => {
    for (const c of listCases()) {
      for (const node of c.pathway) {
        const d = node.decision;
        if (!d) continue;
        for (const opt of d.options) {
          expect(opt.id, `${c.id}/${node.id} option missing id`).toBeTruthy();
          expect(opt.label, `${c.id}/${node.id}/${opt.id} missing label`).toBeTruthy();
          expect(typeof opt.score, `${c.id}/${node.id}/${opt.id} score not number`).toBe('number');
          expect(opt.rationale, `${c.id}/${node.id}/${opt.id} missing rationale`).toBeTruthy();
        }
      }
    }
  });

  it('every guideline reference has a label + body', () => {
    for (const c of listCases()) {
      for (const g of c.guidelines ?? []) {
        expect(g.label, `${c.id} guideline missing label`).toBeTruthy();
        expect(g.body, `${c.id} guideline missing body`).toBeTruthy();
      }
    }
  });

  it('cases map keys match each case id', () => {
    for (const [k, v] of Object.entries(cases)) {
      expect(k).toBe(v.id);
    }
  });
});
