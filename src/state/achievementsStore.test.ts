import { beforeEach, describe, expect, it } from 'vitest';
import { useAchievements } from './achievementsStore';
import { useProgress } from './progressStore';

describe('achievementsStore', () => {
  beforeEach(() => {
    useAchievements.setState({ unlocked: [], toastQueue: [] });
    useProgress.getState().reset();
  });

  it('fire(case-completed) unlocks first-case and queues a toast', () => {
    useAchievements.getState().fire({
      kind: 'case-completed',
      caseId: 'stemi-acute',
      scoreRatio: 0.6,
      runsForThisCase: 1,
    });
    const s = useAchievements.getState();
    expect(s.unlocked).toContain('first-case');
    expect(s.toastQueue).toContain('first-case');
  });

  it("doesn't re-unlock or re-queue an existing achievement", () => {
    const fire = useAchievements.getState().fire;
    fire({ kind: 'case-completed', caseId: 'a', scoreRatio: 0.5, runsForThisCase: 1 });
    useAchievements.getState().dismissToast('first-case');
    fire({ kind: 'case-completed', caseId: 'b', scoreRatio: 0.5, runsForThisCase: 1 });
    const s = useAchievements.getState();
    expect(s.unlocked.filter((x) => x === 'first-case')).toHaveLength(1);
    expect(s.toastQueue).not.toContain('first-case');
  });

  it('dismissToast removes only the given id', () => {
    const fire = useAchievements.getState().fire;
    fire({ kind: 'ops-shift-ended', netSGD: 100 });
    expect(useAchievements.getState().toastQueue).toEqual(['tycoon', 'tycoon-profit']);
    useAchievements.getState().dismissToast('tycoon');
    expect(useAchievements.getState().toastQueue).toEqual(['tycoon-profit']);
  });

  it('reset clears unlocked + toastQueue', () => {
    useAchievements.getState().fire({ kind: 'demo-opened' });
    expect(useAchievements.getState().unlocked).toContain('open-mind');
    useAchievements.getState().reset();
    expect(useAchievements.getState().unlocked).toEqual([]);
    expect(useAchievements.getState().toastQueue).toEqual([]);
  });
});
