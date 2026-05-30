import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaign } from './campaignStore';

describe('campaignStore', () => {
  beforeEach(() => {
    useCampaign.setState({ activeId: null, step: 0 });
  });

  it('starts inactive', () => {
    expect(useCampaign.getState().activeId).toBeNull();
    expect(useCampaign.getState().step).toBe(0);
  });

  it('setActive sets the id and resets step', () => {
    useCampaign.setState({ step: 5 });
    useCampaign.getState().setActive('ed-night-shift');
    expect(useCampaign.getState().activeId).toBe('ed-night-shift');
    expect(useCampaign.getState().step).toBe(0);
  });

  it('advance increments the step', () => {
    useCampaign.getState().setActive('x');
    useCampaign.getState().advance();
    useCampaign.getState().advance();
    expect(useCampaign.getState().step).toBe(2);
  });

  it('reset clears both fields', () => {
    useCampaign.getState().setActive('x');
    useCampaign.getState().advance();
    useCampaign.getState().reset();
    expect(useCampaign.getState().activeId).toBeNull();
    expect(useCampaign.getState().step).toBe(0);
  });
});
