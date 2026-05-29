import { describe, it, expect, beforeEach } from 'vitest';
import { useMode } from './modeStore';

describe('modeStore', () => {
  beforeEach(() => {
    useMode.setState({ mode: 'case' });
  });

  it('defaults to case mode', () => {
    expect(useMode.getState().mode).toBe('case');
  });

  it('setMode flips between case and ops', () => {
    useMode.getState().setMode('ops');
    expect(useMode.getState().mode).toBe('ops');
    useMode.getState().setMode('case');
    expect(useMode.getState().mode).toBe('case');
  });
});
