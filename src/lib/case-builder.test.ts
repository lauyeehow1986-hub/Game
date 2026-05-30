import { describe, it, expect } from 'vitest';
import {
  buildCaseFromDraft,
  draftWarnings,
  emptyDraft,
  emptyNode,
  slugify,
} from './case-builder';

function validDraft() {
  const d = emptyDraft();
  d.titleEn = 'My Test Case';
  d.blurbEn = 'A patient presents with something.';
  d.primaryFacility = 'ttsh';
  d.category = 'acute';
  d.nodes = [
    {
      ...emptyNode(0),
      id: 'n1',
      facility: 'ttsh',
      framingStaff: 'Staff sees the patient.',
      prompt: 'What do you do?',
      refLabel: 'Some guideline',
      refBody: 'Some guideline body.',
      options: [
        { label: 'Correct thing', score: 10, rationale: 'Because evidence.' },
        { label: 'Wrong thing', score: -3, rationale: 'Because harm.' },
      ],
    },
  ];
  return d;
}

describe('slugify', () => {
  it('produces a safe id', () => {
    expect(slugify('Acute STEMI! at TTSH')).toBe('acute-stemi-at-ttsh');
  });
  it('trims dashes and caps length', () => {
    expect(slugify('   Hello   ')).toBe('hello');
    expect(slugify('x'.repeat(100)).length).toBeLessThanOrEqual(48);
  });
});

describe('buildCaseFromDraft', () => {
  it('assembles + validates a complete draft', () => {
    const res = buildCaseFromDraft(validDraft());
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.case.id).toBe('my-test-case');
      expect(res.case.pathway).toHaveLength(1);
      expect(res.case.pathway[0].decision?.options).toHaveLength(2);
      // involvedFacilities deduped from primary + node facilities.
      expect(res.case.involvedFacilities).toEqual(['ttsh']);
      // Guideline lifted from the node reference.
      expect(res.case.guidelines).toHaveLength(1);
    }
  });

  it('falls back to a slugged id when id is blank', () => {
    const d = validDraft();
    d.id = '';
    const res = buildCaseFromDraft(d);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.case.id).toBe('my-test-case');
  });

  it('fails validation when required meta is missing', () => {
    const d = validDraft();
    d.titleEn = '';
    const res = buildCaseFromDraft(d);
    expect(res.ok).toBe(false);
  });

  it('drops empty option rows before validating', () => {
    const d = validDraft();
    d.nodes[0].options.push({ label: '', score: 0, rationale: '' });
    const res = buildCaseFromDraft(d);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.case.pathway[0].decision?.options).toHaveLength(2);
  });
});

describe('draftWarnings', () => {
  it('returns no warnings for a complete draft', () => {
    expect(draftWarnings(validDraft())).toEqual([]);
  });

  it('flags a missing title', () => {
    const d = validDraft();
    d.titleEn = '';
    expect(draftWarnings(d).some((w) => /Title/.test(w))).toBe(true);
  });

  it('flags a decision with fewer than 2 options', () => {
    const d = validDraft();
    d.nodes[0].options = [{ label: 'only one', score: 10, rationale: 'x' }];
    expect(draftWarnings(d).some((w) => /at least 2 options/.test(w))).toBe(true);
  });

  it('flags when no option has a positive score', () => {
    const d = validDraft();
    d.nodes[0].options = [
      { label: 'a', score: 0, rationale: 'x' },
      { label: 'b', score: -2, rationale: 'y' },
    ];
    expect(draftWarnings(d).some((w) => /positive score/.test(w))).toBe(true);
  });
});
