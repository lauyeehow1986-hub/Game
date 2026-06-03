import { describe, expect, it, beforeEach } from 'vitest';
import { useCaseJournal } from './caseJournalStore';

describe('caseJournalStore', () => {
  beforeEach(() => {
    useCaseJournal.getState().clear();
  });

  it('stores trimmed text and updates timestamp', () => {
    const before = Date.now();
    useCaseJournal.getState().set('case-a', '  remembering ABC  ');
    const entry = useCaseJournal.getState().entries['case-a'];
    expect(entry.text).toBe('remembering ABC');
    expect(entry.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('removes entry when text is whitespace only', () => {
    useCaseJournal.getState().set('case-a', 'first');
    useCaseJournal.getState().set('case-a', '   ');
    expect(useCaseJournal.getState().entries['case-a']).toBeUndefined();
  });

  it('latest write wins', () => {
    useCaseJournal.getState().set('c', 'first');
    useCaseJournal.getState().set('c', 'second');
    expect(useCaseJournal.getState().entries['c'].text).toBe('second');
  });

  it('remove deletes a specific entry without touching others', () => {
    useCaseJournal.getState().set('a', 'A');
    useCaseJournal.getState().set('b', 'B');
    useCaseJournal.getState().remove('a');
    expect(useCaseJournal.getState().entries['a']).toBeUndefined();
    expect(useCaseJournal.getState().entries['b'].text).toBe('B');
  });
});
