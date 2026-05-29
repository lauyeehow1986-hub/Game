import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isMuted, setMuted, chimeDecision, chimeCaseComplete, chimeArrive } from './audio';

// vitest runs in node without window/localStorage; the audio module
// guards on `typeof window === 'undefined'` so all tone-playing
// functions should silently no-op. These tests pin that contract so
// a future regression that calls AudioContext at module load throws
// immediately in CI.

describe('audio mute flag', () => {
  beforeEach(() => {
    // Re-export the module isn't needed — isMuted reads localStorage on
    // each call, which is undefined in node, so the module returns true.
  });

  it('reports true when window is undefined (node test env)', () => {
    expect(isMuted()).toBe(true);
  });

  it('setMuted is a no-op without crashing in node', () => {
    expect(() => setMuted(true)).not.toThrow();
    expect(() => setMuted(false)).not.toThrow();
  });
});

describe('chime functions', () => {
  it('chimeDecision is a no-op without a window', () => {
    expect(() => chimeDecision()).not.toThrow();
  });

  it('chimeCaseComplete is a no-op without a window', () => {
    expect(() => chimeCaseComplete()).not.toThrow();
  });

  it('chimeArrive is a no-op without a window', () => {
    expect(() => chimeArrive()).not.toThrow();
  });

  it('chimeCaseComplete schedules a second tone via setTimeout', () => {
    const spy = vi.spyOn(global, 'setTimeout');
    chimeCaseComplete();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
