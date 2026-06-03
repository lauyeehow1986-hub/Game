import { describe, it, expect } from 'vitest';
import { buildHandoff, encodeHandoff, decodeHandoff, extractHandoffs } from './handoff';
import type { CaseRunSnapshot } from './types';

function runFixture(status: CaseRunSnapshot['status'] = 'awaiting-decision'): CaseRunSnapshot {
  return {
    caseId: 'stemi',
    status,
    currentNodeId: 'cathlab',
    currentFacilityId: 'ttsh',
    pendingDecision: null,
    log: [{ nodeId: 'ed', decisionId: 'first', optionId: 'asa-tica', scoreEarned: 9, maxScore: 10 }],
    startedAtGameMin: 0,
    elapsedGameMin: 35,
    totalCostSGD: 2500,
    flags: ['cath-activated'],
    journey: ['ed', 'cathlab'],
  };
}

describe('buildHandoff', () => {
  it('returns null when no case is running', () => {
    expect(buildHandoff({ ...runFixture(), caseId: null })).toBeNull();
    expect(buildHandoff(runFixture('idle'))).toBeNull();
    expect(buildHandoff(runFixture('completed'))).toBeNull();
  });

  it('captures the in-progress fields', () => {
    const h = buildHandoff(runFixture(), 1234)!;
    expect(h.caseId).toBe('stemi');
    expect(h.currentNodeId).toBe('cathlab');
    expect(h.flags).toEqual(['cath-activated']);
    expect(h.journey).toEqual(['ed', 'cathlab']);
    expect(h.log).toHaveLength(1);
    expect(h.at).toBe(1234);
  });
});

describe('encode/decode handoff', () => {
  it('round-trips', () => {
    const h = buildHandoff(runFixture(), 9999)!;
    const tok = encodeHandoff(h);
    expect(tok.startsWith('SGH1.')).toBe(true);
    expect(decodeHandoff(tok)).toEqual(h);
  });

  it('rejects non-tokens and corrupt payloads', () => {
    expect(decodeHandoff('hi')).toBeNull();
    expect(decodeHandoff('SGH1.@@@')).toBeNull();
  });

  it('rejects payloads with the wrong shape', () => {
    const bad = btoa(JSON.stringify({ caseId: 'x', log: 'no', flags: [], journey: [], elapsedGameMin: 0, totalCostSGD: 0, at: 0 }));
    expect(decodeHandoff(`SGH1.${bad}`)).toBeNull();
  });
});

describe('extractHandoffs', () => {
  it('finds every SGH1.* token in messy text', () => {
    const a = encodeHandoff(buildHandoff(runFixture(), 1)!);
    const b = encodeHandoff(buildHandoff(runFixture(), 2)!);
    const blob = `look at these:\n${a}\nrandom\n${b}\nthx`;
    const out = extractHandoffs(blob);
    expect(out).toHaveLength(2);
  });
});
