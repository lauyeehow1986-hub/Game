import { describe, it, expect, beforeEach } from 'vitest';
import { useCustomCurricula } from './customCurriculaStore';
import type { CurriculumBundle } from '../lib/curriculum-schema';

const mk = (id: string): CurriculumBundle => ({
  id,
  title: id,
  blurb: '',
  objectives: ['o1'],
  caseIds: ['stemi-acute'],
});

describe('customCurriculaStore', () => {
  beforeEach(() => {
    useCustomCurricula.setState({ bundles: {} });
  });

  it('starts empty', () => {
    expect(Object.keys(useCustomCurricula.getState().bundles)).toHaveLength(0);
  });

  it('add inserts a bundle by id', () => {
    useCustomCurricula.getState().add(mk('cardio'));
    expect(useCustomCurricula.getState().bundles.cardio.id).toBe('cardio');
  });

  it('remove deletes by id without touching others', () => {
    useCustomCurricula.getState().add(mk('a'));
    useCustomCurricula.getState().add(mk('b'));
    useCustomCurricula.getState().remove('a');
    expect(useCustomCurricula.getState().bundles.a).toBeUndefined();
    expect(useCustomCurricula.getState().bundles.b).toBeDefined();
  });

  it('clear empties the store', () => {
    useCustomCurricula.getState().add(mk('a'));
    useCustomCurricula.getState().clear();
    expect(Object.keys(useCustomCurricula.getState().bundles)).toHaveLength(0);
  });
});
