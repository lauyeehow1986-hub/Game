import { describe, expect, it, beforeEach } from 'vitest';
import { useBookmarks, selectBookmark } from './bookmarksStore';

describe('bookmarksStore', () => {
  beforeEach(() => {
    useBookmarks.getState().clear();
  });

  it('adds a bookmark with optional note', () => {
    useBookmarks.getState().add('case-a', 'd1', '  revisit  ');
    const items = useBookmarks.getState().items;
    expect(Object.keys(items)).toHaveLength(1);
    expect(items['case-a|d1'].note).toBe('revisit');
  });

  it('toggle creates then removes', () => {
    const r1 = useBookmarks.getState().toggle('c', 'd');
    expect(r1).toBe(true);
    expect(useBookmarks.getState().items['c|d']).toBeDefined();
    const r2 = useBookmarks.getState().toggle('c', 'd');
    expect(r2).toBe(false);
    expect(useBookmarks.getState().items['c|d']).toBeUndefined();
  });

  it('setNote no-ops when bookmark is missing', () => {
    useBookmarks.getState().setNote('x', 'y', 'hello');
    expect(useBookmarks.getState().items['x|y']).toBeUndefined();
  });

  it('setNote trims empty to undefined', () => {
    useBookmarks.getState().add('a', 'b');
    useBookmarks.getState().setNote('a', 'b', '   ');
    expect(useBookmarks.getState().items['a|b'].note).toBeUndefined();
  });

  it('selectBookmark returns null for unknown keys', () => {
    expect(selectBookmark({}, 'x', 'y')).toBeNull();
    useBookmarks.getState().add('a', 'b');
    expect(selectBookmark(useBookmarks.getState().items, 'a', 'b')).not.toBeNull();
  });
});
