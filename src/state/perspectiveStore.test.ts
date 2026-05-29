import { describe, it, expect, beforeEach } from 'vitest';
import { usePerspective } from './perspectiveStore';

describe('perspectiveStore', () => {
  beforeEach(() => {
    usePerspective.setState({ current: 'staff' });
  });

  it('defaults to staff perspective', () => {
    expect(usePerspective.getState().current).toBe('staff');
  });

  it('set updates the current perspective', () => {
    usePerspective.getState().set('patient');
    expect(usePerspective.getState().current).toBe('patient');
    usePerspective.getState().set('caregiver');
    expect(usePerspective.getState().current).toBe('caregiver');
  });

  it('cycle steps patient → caregiver → staff → patient', () => {
    usePerspective.getState().set('patient');
    usePerspective.getState().cycle();
    expect(usePerspective.getState().current).toBe('caregiver');
    usePerspective.getState().cycle();
    expect(usePerspective.getState().current).toBe('staff');
    usePerspective.getState().cycle();
    expect(usePerspective.getState().current).toBe('patient');
  });
});
