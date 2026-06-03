import { describe, expect, it, beforeEach } from 'vitest';
import { useCalibration } from './calibrationStore';

describe('calibrationStore', () => {
  beforeEach(() => {
    useCalibration.getState().clear();
  });

  it('appends sessions in order', () => {
    useCalibration.getState().recordSession([{ forecast: 0.6, correct: 1 }], 0.16);
    useCalibration.getState().recordSession([{ forecast: 0.8, correct: 1 }], 0.04);
    const sessions = useCalibration.getState().sessions;
    expect(sessions).toHaveLength(2);
    expect(sessions[1].brier).toBeCloseTo(0.04, 5);
  });

  it('ignores empty pick sets', () => {
    useCalibration.getState().recordSession([], 0);
    expect(useCalibration.getState().sessions).toHaveLength(0);
  });

  it('caps stored sessions at the rolling limit', () => {
    for (let i = 0; i < 25; i += 1) {
      useCalibration.getState().recordSession([{ forecast: 0.6, correct: 1 }], i / 100);
    }
    const sessions = useCalibration.getState().sessions;
    expect(sessions).toHaveLength(20);
    // Oldest entries dropped first.
    expect(sessions[0].brier).toBeCloseTo(0.05, 5);
  });
});
