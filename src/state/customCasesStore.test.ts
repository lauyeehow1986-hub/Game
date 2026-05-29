import { describe, it, expect, beforeEach } from 'vitest';
import { useCustomCases, listCustomCases } from './customCasesStore';
import type { CaseDefinition } from '../lib/types';

const mk = (id: string): CaseDefinition => ({
  id,
  title: id,
  blurb: '',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [],
});

describe('customCasesStore', () => {
  beforeEach(() => {
    useCustomCases.setState({ cases: {} });
  });

  it('starts empty', () => {
    expect(Object.keys(useCustomCases.getState().cases)).toHaveLength(0);
    expect(listCustomCases()).toHaveLength(0);
  });

  it('add inserts a case by id', () => {
    useCustomCases.getState().add(mk('a'));
    expect(useCustomCases.getState().cases.a.id).toBe('a');
    expect(listCustomCases()).toHaveLength(1);
  });

  it('add overwrites a case with the same id', () => {
    useCustomCases.getState().add(mk('a'));
    const replacement = { ...mk('a'), title: 'replaced' };
    useCustomCases.getState().add(replacement);
    expect(useCustomCases.getState().cases.a.title).toBe('replaced');
    expect(listCustomCases()).toHaveLength(1);
  });

  it('remove deletes a case by id', () => {
    useCustomCases.getState().add(mk('a'));
    useCustomCases.getState().add(mk('b'));
    useCustomCases.getState().remove('a');
    expect(useCustomCases.getState().cases.a).toBeUndefined();
    expect(useCustomCases.getState().cases.b).toBeDefined();
  });

  it('clear empties the store', () => {
    useCustomCases.getState().add(mk('a'));
    useCustomCases.getState().add(mk('b'));
    useCustomCases.getState().clear();
    expect(listCustomCases()).toHaveLength(0);
  });
});
