import { describe, it, expect } from 'vitest';
import {
  encodeCaseToUrl,
  encodeCurriculumToUrl,
  encodeRunToUrl,
  tryDecodeCaseFromHref,
  tryDecodeCurriculumFromHref,
  tryDecodeRunFromHref,
  type RunSnapshot,
} from './case-share';
import type { CaseDefinition } from './types';
import type { CurriculumBundle } from './curriculum-schema';

const minimalCase: CaseDefinition = {
  id: 'demo',
  title: 'Demo',
  blurb: 'b',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    {
      id: 'n',
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
    },
  ],
};

const sampleRun: RunSnapshot = {
  caseId: 'demo',
  log: [
    { nodeId: 'n', decisionId: 'd', optionId: 'good', scoreEarned: 10, maxScore: 10 },
  ],
  elapsedGameMin: 60,
  totalCostSGD: 120,
};

describe('encodeCaseToUrl + tryDecodeCaseFromHref', () => {
  it('round-trips a minimal case via base64url', () => {
    const url = encodeCaseToUrl(minimalCase, 'http://example.test/');
    expect(url).toContain('?case=');
    const decoded = tryDecodeCaseFromHref(url);
    expect(decoded?.id).toBe('demo');
  });

  it('returns null on bogus payloads', () => {
    expect(tryDecodeCaseFromHref('http://example.test/?case=not-base64!!')).toBeNull();
    expect(tryDecodeCaseFromHref('http://example.test/')).toBeNull();
  });
});

describe('encodeRunToUrl + tryDecodeRunFromHref', () => {
  it('round-trips a run', () => {
    const url = encodeRunToUrl(sampleRun, 'http://example.test/');
    expect(url).toContain('?run=');
    const decoded = tryDecodeRunFromHref(url);
    expect(decoded?.caseId).toBe('demo');
    expect(decoded?.log).toHaveLength(1);
  });

  it('returns null when ?run is missing', () => {
    expect(tryDecodeRunFromHref('http://example.test/')).toBeNull();
  });

  it('returns null when payload is malformed JSON', () => {
    expect(tryDecodeRunFromHref('http://example.test/?run=AAAA')).toBeNull();
  });

  it('returns null when shape is wrong', () => {
    // Encode an object missing caseId.
    const bad = btoa(JSON.stringify({ log: [] }));
    expect(tryDecodeRunFromHref(`http://example.test/?run=${bad}`)).toBeNull();
  });

  it('rejects a journey that is not a string array', () => {
    const bad = btoa(JSON.stringify({ caseId: 'x', log: [], journey: [1, 2, 3] }));
    expect(tryDecodeRunFromHref(`http://example.test/?run=${bad}`)).toBeNull();
  });

  it('rejects a malformed burden object', () => {
    const bad = btoa(
      JSON.stringify({ caseId: 'x', log: [], burden: { timeOffWorkHours: 'x' } }),
    );
    expect(tryDecodeRunFromHref(`http://example.test/?run=${bad}`)).toBeNull();
  });

  it('rejects a malformed profile (boolean masquerading as string)', () => {
    const bad = btoa(
      JSON.stringify({
        caseId: 'x',
        log: [],
        profile: { name: 'x', wardClass: 'C', chasTier: 'none', hasIntegratedShield: 'no' },
      }),
    );
    expect(tryDecodeRunFromHref(`http://example.test/?run=${bad}`)).toBeNull();
  });
});

const sampleBundle: CurriculumBundle = {
  id: 'demo-curr',
  title: 'Demo curriculum',
  blurb: 'Two-case demo bundle.',
  objectives: ['Recognise X', 'Right-site Y'],
  caseIds: ['stemi-acute', 'hf-outpatient'],
};

describe('encodeCurriculumToUrl + tryDecodeCurriculumFromHref', () => {
  it('round-trips a curriculum bundle', () => {
    const url = encodeCurriculumToUrl(sampleBundle, 'http://example.test/');
    expect(url).toContain('?curr=');
    const decoded = tryDecodeCurriculumFromHref(url);
    expect(decoded?.id).toBe('demo-curr');
    expect(decoded?.caseIds).toEqual(['stemi-acute', 'hf-outpatient']);
  });

  it('returns null when ?curr is missing', () => {
    expect(tryDecodeCurriculumFromHref('http://example.test/')).toBeNull();
  });

  it('returns null when bundle is invalid', () => {
    const bad = btoa(JSON.stringify({ id: 'x' })); // missing required fields
    expect(tryDecodeCurriculumFromHref(`http://example.test/?curr=${bad}`)).toBeNull();
  });
});
