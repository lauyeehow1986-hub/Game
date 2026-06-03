import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  caseId: string;
  decisionId: string;
  addedAt: number;
  /** Optional one-liner the user wrote. */
  note?: string;
}

interface BookmarksState {
  items: Record<string, Bookmark>;
  add: (caseId: string, decisionId: string, note?: string) => void;
  remove: (caseId: string, decisionId: string) => void;
  toggle: (caseId: string, decisionId: string) => boolean;
  setNote: (caseId: string, decisionId: string, note: string) => void;
  clear: () => void;
}

const key = (caseId: string, decisionId: string) => `${caseId}|${decisionId}`;

export const useBookmarks = create<BookmarksState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (caseId, decisionId, note) =>
        set((s) => ({
          items: {
            ...s.items,
            [key(caseId, decisionId)]: {
              caseId,
              decisionId,
              addedAt: Date.now(),
              ...(note && note.trim() ? { note: note.trim() } : {}),
            },
          },
        })),
      remove: (caseId, decisionId) =>
        set((s) => {
          const next = { ...s.items };
          delete next[key(caseId, decisionId)];
          return { items: next };
        }),
      toggle: (caseId, decisionId) => {
        const k = key(caseId, decisionId);
        const exists = !!get().items[k];
        if (exists) {
          set((s) => {
            const next = { ...s.items };
            delete next[k];
            return { items: next };
          });
          return false;
        }
        set((s) => ({
          items: { ...s.items, [k]: { caseId, decisionId, addedAt: Date.now() } },
        }));
        return true;
      },
      setNote: (caseId, decisionId, note) =>
        set((s) => {
          const k = key(caseId, decisionId);
          const existing = s.items[k];
          if (!existing) return s;
          const trimmed = note.trim();
          return {
            items: {
              ...s.items,
              [k]: { ...existing, note: trimmed ? trimmed : undefined },
            },
          };
        }),
      clear: () => set({ items: {} }),
    }),
    { name: 'sg-pathway-bookmarks-v1' },
  ),
);

/** Stable selector for "is this decision bookmarked". Returns the bookmark or null. */
export function selectBookmark(items: Record<string, Bookmark>, caseId: string, decisionId: string): Bookmark | null {
  return items[key(caseId, decisionId)] ?? null;
}
