/**
 * Challenge codes — PWA-safe asynchronous head-to-head.
 *
 * The Hospital Ops "Duel" is a same-device, same-sitting head-to-head. A
 * Challenge code generalises that to *different devices and different times*
 * without any server: the challenger plays a seeded exam paper, then hands a
 * friend a short code. The friend's app rebuilds the identical paper from the
 * seed (buildExam is deterministic for a given seed), they play it, and the
 * app compares their score to the challenger's — a "beat my run" duel that
 * never leaves the device.
 *
 * This is the offline-PWA way to honour the "play against a friend" wish that
 * server multiplayer (rejected in docs/REMAINING.md §4) would have served. All
 * state is in the code itself; nothing is persisted server-side.
 *
 * The code is a compact, copy-pasteable token: a versioned, checksummed binary
 * record base64url-encoded, prefixed `SGP1-` so it is recognisable in a chat
 * message. Pure module — no DOM, no storage.
 */

/** A challenge the friend can replay and be scored against. */
export interface Challenge {
  /** Seed for buildExam — both players get the identical paper. */
  seed: number;
  /** Number of decisions in the paper (1..50). */
  count: number;
  /** Challenger's clamped earned score (rounded, 0..65535). */
  challengerEarned: number;
  /** Challenger's max score (rounded, 1..65535). */
  challengerMax: number;
  /** Challenger's display name (≤ 24 UTF-8 bytes; trimmed on encode). */
  challengerName: string;
}

const PREFIX = 'SGP1-';
const VERSION = 1;
const MAX_NAME_BYTES = 24;
const MAX_COUNT = 50;

/* ── base64url (self-contained; mirrors case-share but kept independent) ─── */

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function clampU16(n: number): number {
  return Math.max(0, Math.min(65535, Math.round(n)));
}

/**
 * Encode a challenge to a short shareable code. Layout (bytes):
 *   0      version (1)
 *   1..4   seed       uint32 BE
 *   5      count
 *   6..7   earned     uint16 BE
 *   8..9   max        uint16 BE
 *   10     nameLen
 *   11..   name UTF-8 (nameLen bytes)
 *   last   checksum   sum(prev) & 0xFF
 */
export function encodeChallenge(c: Challenge): string {
  const nameBytes = new TextEncoder().encode(c.challengerName).slice(0, MAX_NAME_BYTES);
  const seed = c.seed >>> 0;
  const count = Math.max(1, Math.min(MAX_COUNT, Math.round(c.count)));
  const earned = clampU16(c.challengerEarned);
  const max = clampU16(c.challengerMax);

  const head = 11;
  const buf = new Uint8Array(head + nameBytes.length + 1);
  buf[0] = VERSION;
  buf[1] = (seed >>> 24) & 0xff;
  buf[2] = (seed >>> 16) & 0xff;
  buf[3] = (seed >>> 8) & 0xff;
  buf[4] = seed & 0xff;
  buf[5] = count;
  buf[6] = (earned >>> 8) & 0xff;
  buf[7] = earned & 0xff;
  buf[8] = (max >>> 8) & 0xff;
  buf[9] = max & 0xff;
  buf[10] = nameBytes.length;
  buf.set(nameBytes, head);
  let sum = 0;
  for (let i = 0; i < buf.length - 1; i += 1) sum = (sum + buf[i]) & 0xff;
  buf[buf.length - 1] = sum;

  return PREFIX + bytesToBase64Url(buf);
}

/**
 * Decode a challenge code. Tolerant of surrounding whitespace and a missing
 * prefix (so a friend can paste either `SGP1-xxxx` or just `xxxx`). Returns
 * null on any malformed, truncated, wrong-version or bad-checksum input — a
 * pasted code from a stranger must never produce a surprising shape.
 */
export function decodeChallenge(code: string): Challenge | null {
  try {
    let token = code.trim();
    if (token.length === 0) return null;
    // Strip a leading prefix if present (case-insensitive), else assume raw.
    const up = token.toUpperCase();
    if (up.startsWith(PREFIX)) token = token.slice(PREFIX.length);
    // Reject anything outside the base64url alphabet.
    if (!/^[A-Za-z0-9\-_]+$/.test(token)) return null;

    const buf = base64UrlToBytes(token);
    if (buf.length < 12) return null;
    if (buf[0] !== VERSION) return null;

    let sum = 0;
    for (let i = 0; i < buf.length - 1; i += 1) sum = (sum + buf[i]) & 0xff;
    if (sum !== buf[buf.length - 1]) return null;

    const seed = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
    const count = buf[5];
    if (count < 1 || count > MAX_COUNT) return null;
    const earned = (buf[6] << 8) | buf[7];
    const max = (buf[8] << 8) | buf[9];
    if (max < 1) return null;
    const nameLen = buf[10];
    if (11 + nameLen + 1 !== buf.length) return null;
    const name = new TextDecoder().decode(buf.slice(11, 11 + nameLen));

    return { seed, count, challengerEarned: earned, challengerMax: max, challengerName: name };
  } catch {
    return null;
  }
}

export interface ChallengeOutcome {
  challengerPct: number;
  friendPct: number;
  winner: 'challenger' | 'friend' | 'draw';
  /** Signed percentage-point margin from the friend's perspective. */
  marginPct: number;
}

/** Compare the friend's earned/max against the challenge's stored score. */
export function gradeChallenge(
  challenge: Challenge,
  friendEarned: number,
  friendMax: number,
): ChallengeOutcome {
  const pct = (e: number, m: number) => (m > 0 ? (Math.max(0, e) / m) * 100 : 0);
  const challengerPct = pct(challenge.challengerEarned, challenge.challengerMax);
  const friendPct = pct(friendEarned, friendMax);
  const cr = Math.round(challengerPct);
  const fr = Math.round(friendPct);
  let winner: ChallengeOutcome['winner'] = 'draw';
  if (fr > cr) winner = 'friend';
  else if (cr > fr) winner = 'challenger';
  return { challengerPct: cr, friendPct: fr, winner, marginPct: fr - cr };
}

/** A fresh 32-bit seed for a new challenge. Impure (uses Math.random/time). */
export function newChallengeSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ (Date.now() & 0xffffffff)) >>> 0;
}
