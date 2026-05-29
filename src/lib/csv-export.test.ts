import { describe, it, expect } from 'vitest';
import { exportRunHistoryCsv } from './csv-export';
import type { CaseDefinition, RunHistoryEntry } from './types';

const tr = (v: unknown) => (typeof v === 'string' ? v : '');

const caseDef: CaseDefinition = {
  id: 'demo',
  title: 'Demo case',
  blurb: '',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    {
      id: 'n1',
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
      decision: {
        id: 'd1',
        prompt: 'Best loading?',
        weight: 1,
        reference: { label: '', body: '' },
        options: [
          { id: 'a', label: 'A', rationale: '', score: 10, outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'b', label: 'B', rationale: '', score: 0, outcome: { patient: '', caregiver: '', staff: '' } },
        ],
      },
    },
  ],
};

describe('exportRunHistoryCsv', () => {
  it('emits a header row + one row per decision in each run', () => {
    const history: Record<string, RunHistoryEntry[]> = {
      demo: [
        {
          score: 10,
          max: 10,
          at: 1700000000000,
          log: [{ nodeId: 'n1', decisionId: 'd1', optionId: 'a', scoreEarned: 10, maxScore: 10 }],
        },
      ],
    };
    const csv = exportRunHistoryCsv(history, [caseDef], tr);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('caseId');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('demo');
    expect(lines[1]).toContain('Best loading?');
    expect(lines[1]).toContain('A');
  });

  it('emits a summary row when an entry has no log (legacy)', () => {
    const history: Record<string, RunHistoryEntry[]> = {
      demo: [{ score: 5, max: 10, at: 1700000000000 }],
    };
    const csv = exportRunHistoryCsv(history, [caseDef], tr);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    // Decision columns empty:
    expect(lines[1].endsWith(',,,,,,')).toBe(true);
  });

  it('escapes values containing a comma or quote', () => {
    const c: CaseDefinition = {
      ...caseDef,
      title: 'Title, with comma',
      pathway: [
        {
          ...caseDef.pathway[0],
          decision: {
            ...caseDef.pathway[0].decision!,
            prompt: 'A "quoted" prompt',
          },
        },
      ],
    };
    const history: Record<string, RunHistoryEntry[]> = {
      demo: [
        {
          score: 10,
          max: 10,
          at: 1700000000000,
          log: [{ nodeId: 'n1', decisionId: 'd1', optionId: 'a', scoreEarned: 10, maxScore: 10 }],
        },
      ],
    };
    const csv = exportRunHistoryCsv(history, [c], tr);
    expect(csv).toContain('"Title, with comma"');
    expect(csv).toContain('"A ""quoted"" prompt"');
  });
});
