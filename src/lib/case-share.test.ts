import { describe, it, expect } from 'vitest';
import {
  encodeCaseToUrl,
  encodeRunToUrl,
  tryDecodeCaseFromHref,
  tryDecodeRunFromHref,
  type RunSnapshot,
} from './case-share';
import type { CaseDefinition } from './types';

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
});
