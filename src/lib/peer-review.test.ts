import { describe, it, expect } from 'vitest';
import {
  runRef,
  encodeThread,
  decodeThread,
  mergeThreads,
  parsePastedThreads,
  type ReviewThread,
} from './peer-review';

const snap = (caseId: string, optionIds: string[]) => ({
  caseId,
  log: optionIds.map((o) => ({ optionId: o })),
});

describe('runRef', () => {
  it('is stable for the same case + log', () => {
    expect(runRef(snap('stemi', ['a', 'b']))).toBe(runRef(snap('stemi', ['a', 'b'])));
  });
  it('differs when the log differs', () => {
    expect(runRef(snap('stemi', ['a', 'b']))).not.toBe(runRef(snap('stemi', ['a', 'c'])));
  });
});

const thread: ReviewThread = {
  runRef: 'ABC1234',
  comments: [
    { step: 0, author: 'Alex', body: 'Nice pick.', at: 1000 },
    { step: 1, author: 'Sam', body: 'Why not the other one?', at: 2000 },
  ],
};

describe('encode + decode thread', () => {
  it('round-trips a thread', () => {
    const tok = encodeThread(thread);
    expect(tok.startsWith('SGR1.')).toBe(true);
    expect(decodeThread(tok)).toEqual(thread);
  });

  it('rejects non-token strings + malformed payloads', () => {
    expect(decodeThread('hello')).toBeNull();
    expect(decodeThread('SGR1.@@@')).toBeNull();
  });

  it('drops malformed comment entries silently', () => {
    const bad = { runRef: 'X', comments: [{ step: 0, author: 'A' }] };
    const t = decodeThread(`SGR1.${btoa(JSON.stringify(bad))}`);
    // Encoded via raw btoa not toB64Url — should still parse the runRef and
    // return an empty comments array (the malformed entry is filtered out).
    expect(t?.runRef).toBe('X');
    expect(t?.comments).toEqual([]);
  });
});

describe('mergeThreads', () => {
  const a: ReviewThread = { runRef: 'R', comments: [{ step: 0, author: 'A', body: 'x', at: 1 }] };
  const b: ReviewThread = {
    runRef: 'R',
    comments: [
      { step: 0, author: 'A', body: 'x', at: 1 }, // duplicate
      { step: 1, author: 'B', body: 'y', at: 2 },
    ],
  };

  it('dedupes identical comments + sorts by time', () => {
    const m = mergeThreads(a, b);
    expect(m.comments).toHaveLength(2);
    expect(m.comments.map((c) => c.body)).toEqual(['x', 'y']);
  });

  it('refuses to merge across different runRefs', () => {
    const c: ReviewThread = { runRef: 'OTHER', comments: [{ step: 0, author: 'X', body: 'z', at: 9 }] };
    expect(mergeThreads(a, c)).toEqual(a);
  });
});

describe('parsePastedThreads', () => {
  it('extracts every SGR1.* token from messy text', () => {
    const t1 = encodeThread({ runRef: 'A', comments: [] });
    const t2 = encodeThread({ runRef: 'B', comments: [] });
    const blob = `look:\n${t1}\n--\n${t2}\nend`;
    const out = parsePastedThreads(blob);
    expect(out.map((x) => x.runRef).sort()).toEqual(['A', 'B']);
  });
});
