import { beforeEach, describe, expect, it } from 'vitest';
import { useGame } from './gameStore';
import { getCase } from '../content';

describe('gameStore.tickGameTime', () => {
  beforeEach(() => {
    useGame.getState().resetRun();
  });

  it('no-ops when no case is running', () => {
    const before = useGame.getState().run.elapsedGameMin;
    useGame.getState().tickGameTime(5);
    expect(useGame.getState().run.elapsedGameMin).toBe(before);
  });

  it('advances elapsedGameMin while awaiting a decision', () => {
    const stemi = getCase('stemi-acute')!;
    useGame.getState().startCase(stemi);
    expect(useGame.getState().run.status).toBe('awaiting-decision');
    const before = useGame.getState().run.elapsedGameMin;
    useGame.getState().tickGameTime(7);
    expect(useGame.getState().run.elapsedGameMin).toBe(before + 7);
  });

  it('sets the acuteTimer missedFlag once the goal is exceeded', () => {
    const stemi = getCase('stemi-acute')!;
    useGame.getState().startCase(stemi);
    const goal = stemi.acuteTimer!.goalMin;
    const flag = stemi.acuteTimer!.missedFlag;
    expect(useGame.getState().run.flags).not.toContain(flag);
    useGame.getState().tickGameTime(goal + 5);
    expect(useGame.getState().run.flags).toContain(flag);
  });
});
