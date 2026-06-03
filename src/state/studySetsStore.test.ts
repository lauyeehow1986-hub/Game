import { describe, it, expect, beforeEach } from 'vitest';
import { useStudySets } from './studySetsStore';

describe('studySetsStore', () => {
  beforeEach(() => useStudySets.setState({ sets: {} }));

  it('creates a set with a slugified id + dedupes caseIds', () => {
    const s = useStudySets.getState().create('My Block 1', ['a', 'b', 'a']);
    expect(s.id).toBe('my-block-1');
    expect(s.caseIds).toEqual(['a', 'b']);
  });

  it('disambiguates colliding slugs', () => {
    useStudySets.getState().create('Block', []);
    const second = useStudySets.getState().create('Block', []);
    expect(second.id).toBe('block-1');
  });

  it('rename / addCase / removeCase / remove all work', () => {
    const s = useStudySets.getState().create('Set', ['a']);
    useStudySets.getState().rename(s.id, 'Renamed');
    useStudySets.getState().addCase(s.id, 'b');
    useStudySets.getState().addCase(s.id, 'b'); // dedupe
    useStudySets.getState().removeCase(s.id, 'a');
    const updated = useStudySets.getState().sets[s.id];
    expect(updated.name).toBe('Renamed');
    expect(updated.caseIds).toEqual(['b']);
    useStudySets.getState().remove(s.id);
    expect(useStudySets.getState().sets[s.id]).toBeUndefined();
  });
});
