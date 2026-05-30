import { describe, it, expect } from 'vitest';
import {
  assignmentRef,
  encodeAssignmentToUrl,
  tryDecodeAssignment,
  encodeCompletion,
  decodeCompletion,
  parseRoster,
  rosterToCsv,
  summariseRoster,
  type Assignment,
  type Completion,
} from './assignment';

const asg: Assignment = { kind: 'exam', target: 'standard', title: 'Week 3 exam', passPct: 65 };

describe('assignment round-trip', () => {
  it('encodes + decodes an assignment URL', () => {
    const url = encodeAssignmentToUrl(asg, 'http://x.test/');
    expect(url).toContain('?assign=');
    expect(tryDecodeAssignment(url)).toEqual(asg);
  });

  it('returns null for a missing/invalid assignment', () => {
    expect(tryDecodeAssignment('http://x.test/')).toBeNull();
    expect(tryDecodeAssignment('http://x.test/?assign=@@@')).toBeNull();
  });

  it('assignmentRef is stable + differs by content', () => {
    expect(assignmentRef(asg)).toBe(assignmentRef({ ...asg }));
    expect(assignmentRef(asg)).not.toBe(assignmentRef({ ...asg, passPct: 70 }));
  });
});

const comp: Completion = { ref: 'ABC1234', name: 'Sam', scorePct: 80, passed: true, at: 1_700_000_000_000 };

describe('completion token round-trip', () => {
  it('encodes + decodes a completion', () => {
    const tok = encodeCompletion(comp);
    expect(tok.startsWith('SGP1.')).toBe(true);
    expect(decodeCompletion(tok)).toEqual(comp);
  });

  it('rejects non-tokens + corrupt tokens', () => {
    expect(decodeCompletion('hello')).toBeNull();
    expect(decodeCompletion('SGP1.@@@')).toBeNull();
  });
});

describe('parseRoster', () => {
  it('extracts every valid token from messy pasted text', () => {
    const a = encodeCompletion({ ...comp, name: 'A' });
    const b = encodeCompletion({ ...comp, name: 'B' });
    const blob = `here are my students:\n${a}\nrandom junk\n${b}\nthanks`;
    const roster = parseRoster(blob);
    expect(roster.map((c) => c.name).sort()).toEqual(['A', 'B']);
  });

  it('returns empty for text with no tokens', () => {
    expect(parseRoster('no tokens here')).toEqual([]);
  });
});

describe('rosterToCsv + summariseRoster', () => {
  const roster: Completion[] = [
    { ref: 'R', name: 'Alice', scorePct: 90, passed: true, at: 2000 },
    { ref: 'R', name: 'Bob', scorePct: 50, passed: false, at: 1000 },
  ];

  it('csv has a header + one row per completion, newest first', () => {
    const csv = rosterToCsv(roster);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('name,ref,scorePct,passed,completedAt');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('Alice'); // newest (at 2000) first
  });

  it('escapes commas in names', () => {
    const csv = rosterToCsv([{ ref: 'R', name: 'Tan, Ah Kow', scorePct: 70, passed: true, at: 1 }]);
    expect(csv).toContain('"Tan, Ah Kow"');
  });

  it('summarises pass rate + mean score', () => {
    const s = summariseRoster(roster);
    expect(s.total).toBe(2);
    expect(s.passed).toBe(1);
    expect(s.passRate).toBeCloseTo(0.5);
    expect(s.meanScorePct).toBeCloseTo(70);
  });

  it('summary is all-zero for an empty roster', () => {
    expect(summariseRoster([])).toEqual({ total: 0, passed: 0, passRate: 0, meanScorePct: 0 });
  });
});
