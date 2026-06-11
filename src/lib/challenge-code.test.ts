import { describe, it, expect } from 'vitest';
import {
  encodeChallenge,
  decodeChallenge,
  gradeChallenge,
  newChallengeSeed,
  type Challenge,
} from './challenge-code';

const sample = (over: Partial<Challenge> = {}): Challenge => ({
  seed: 0x12345678,
  count: 10,
  challengerEarned: 84,
  challengerMax: 100,
  challengerName: 'Dr Tan',
  ...over,
});

describe('encode/decode round trip', () => {
  it('recovers every field exactly', () => {
    const c = sample();
    const decoded = decodeChallenge(encodeChallenge(c));
    expect(decoded).toEqual(c);
  });

  it('carries the SGP1- prefix and decodes with or without it', () => {
    const code = encodeChallenge(sample());
    expect(code.startsWith('SGP1-')).toBe(true);
    const raw = code.slice('SGP1-'.length);
    expect(decodeChallenge(raw)).toEqual(decodeChallenge(code));
  });

  it('tolerates surrounding whitespace and a lower-case prefix', () => {
    const code = encodeChallenge(sample());
    expect(decodeChallenge(`  ${code}  `)).toEqual(decodeChallenge(code));
    // Only the prefix is case-insensitive; the base64url payload keeps its case.
    const lowerPrefix = 'sgp1-' + code.slice('SGP1-'.length);
    expect(decodeChallenge(lowerPrefix)).toEqual(decodeChallenge(code));
  });

  it('round-trips a Unicode name within the byte budget', () => {
    const c = sample({ challengerName: '陈医生' });
    expect(decodeChallenge(encodeChallenge(c))?.challengerName).toBe('陈医生');
  });

  it('truncates an over-long name to the byte budget without corrupting the code', () => {
    const c = sample({ challengerName: 'X'.repeat(100) });
    const decoded = decodeChallenge(encodeChallenge(c));
    expect(decoded).not.toBeNull();
    expect(decoded!.challengerName.length).toBeLessThanOrEqual(24);
  });

  it('handles an empty name', () => {
    const c = sample({ challengerName: '' });
    expect(decodeChallenge(encodeChallenge(c))?.challengerName).toBe('');
  });

  it('preserves a full 32-bit seed (high bit set)', () => {
    const c = sample({ seed: 0xfffffffe });
    expect(decodeChallenge(encodeChallenge(c))?.seed).toBe(0xfffffffe);
  });
});

describe('decode rejects malformed input', () => {
  it('returns null for empty / junk strings', () => {
    expect(decodeChallenge('')).toBeNull();
    expect(decodeChallenge('   ')).toBeNull();
    expect(decodeChallenge('not a code')).toBeNull();
    expect(decodeChallenge('SGP1-!!!!')).toBeNull();
  });

  it('returns null when the checksum is corrupted', () => {
    const code = encodeChallenge(sample());
    // Flip a character in the payload to break the checksum.
    const body = code.slice(0, -1) + (code.endsWith('A') ? 'B' : 'A');
    expect(decodeChallenge(body)).toBeNull();
  });

  it('returns null for a truncated payload', () => {
    const code = encodeChallenge(sample());
    expect(decodeChallenge(code.slice(0, 8))).toBeNull();
  });

  it('returns null for a wrong version byte', () => {
    // Version 2 record: just a different first byte breaks the v1 decoder.
    expect(decodeChallenge('SGP1-AgAAAAA')).toBeNull();
  });
});

describe('gradeChallenge', () => {
  it('declares the friend the winner when they score higher', () => {
    const c = sample({ challengerEarned: 70, challengerMax: 100 });
    const o = gradeChallenge(c, 85, 100);
    expect(o.winner).toBe('friend');
    expect(o.friendPct).toBe(85);
    expect(o.challengerPct).toBe(70);
    expect(o.marginPct).toBe(15);
  });

  it('declares the challenger the winner when the friend scores lower', () => {
    const c = sample({ challengerEarned: 90, challengerMax: 100 });
    const o = gradeChallenge(c, 60, 100);
    expect(o.winner).toBe('challenger');
    expect(o.marginPct).toBe(-30);
  });

  it('declares a draw on equal rounded percentages', () => {
    const c = sample({ challengerEarned: 50, challengerMax: 100 });
    expect(gradeChallenge(c, 50, 100).winner).toBe('draw');
  });

  it('clamps negative earned and divides safely by a zero max', () => {
    const c = sample({ challengerEarned: 0, challengerMax: 100 });
    const o = gradeChallenge(c, -5, 0);
    expect(o.friendPct).toBe(0);
    expect(Number.isFinite(o.friendPct)).toBe(true);
  });
});

describe('newChallengeSeed', () => {
  it('produces a 32-bit unsigned integer', () => {
    for (let i = 0; i < 50; i += 1) {
      const s = newChallengeSeed();
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(0xffffffff);
    }
  });
});
