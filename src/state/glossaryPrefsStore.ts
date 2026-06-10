import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Glossary preferences — currently just the Singlish-aware toggle.
 * Off by default: locals don't need "kopi" explained; international
 * learners flip it on in Settings and every GlossaryText picks it up.
 */
interface GlossaryPrefsState {
  singlish: boolean;
  setSinglish: (v: boolean) => void;
}

export const useGlossaryPrefs = create<GlossaryPrefsState>()(
  persist(
    (set) => ({
      singlish: false,
      setSinglish: (v) => set({ singlish: v }),
    }),
    { name: 'sg-pathway-glossary-prefs-v1' },
  ),
);
