import { describe, it, expect, beforeEach } from 'vitest';
import { usePacing } from './pacingStore';

describe('pacingStore', () => {
  beforeEach(() => {
    usePacing.setState({ realtime: false, secondsPerGameMin: 3 });
  });

  it('defaults to realtime=false with a 3s baseline', () => {
    expect(usePacing.getState().realtime).toBe(false);
    expect(usePacing.getState().secondsPerGameMin).toBe(3);
  });

  it('setRealtime flips the flag', () => {
    usePacing.getState().setRealtime(true);
    expect(usePacing.getState().realtime).toBe(true);
    usePacing.getState().setRealtime(false);
    expect(usePacing.getState().realtime).toBe(false);
  });

  it('setSpeed clamps to a minimum of 1s', () => {
    usePacing.getState().setSpeed(0);
    expect(usePacing.getState().secondsPerGameMin).toBe(1);
    usePacing.getState().setSpeed(-5);
    expect(usePacing.getState().secondsPerGameMin).toBe(1);
  });

  it('setSpeed accepts any positive integer', () => {
    usePacing.getState().setSpeed(7);
    expect(usePacing.getState().secondsPerGameMin).toBe(7);
  });
});
