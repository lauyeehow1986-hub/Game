import type { CaseDefinition, LocalisedString } from './types';
import { computeDifficulty, type DifficultyBand } from './case-difficulty';

export type CaseCategory = CaseDefinition['category'];

export interface CaseFilter {
  query: string;
  categories: CaseCategory[];
  historicalOnly: boolean;
  unplayedOnly: boolean;
  difficulty: DifficultyBand | null;
}

export const EMPTY_FILTER: CaseFilter = {
  query: '',
  categories: [],
  historicalOnly: false,
  unplayedOnly: false,
  difficulty: null,
};

function joinLocalised(v: LocalisedString | undefined): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return Object.values(v).filter(Boolean).join(' ');
}

/**
 * Pure filter applied to the case catalogue. Search is case-insensitive
 * and matches against title + blurb across every locale variant authored,
 * so a player who types in English still finds a Chinese-titled case.
 */
export function filterCases(
  cases: CaseDefinition[],
  filter: CaseFilter,
  bestScores: Record<string, unknown>,
): CaseDefinition[] {
  const q = filter.query.trim().toLowerCase();
  return cases.filter((c) => {
    if (filter.categories.length > 0 && !filter.categories.includes(c.category)) return false;
    if (filter.historicalOnly && !c.historical) return false;
    if (filter.unplayedOnly && bestScores[c.id]) return false;
    if (filter.difficulty && computeDifficulty(c).band !== filter.difficulty) return false;
    if (!q) return true;
    const haystack = `${joinLocalised(c.title)} ${joinLocalised(c.blurb)} ${c.id} ${c.primaryFacility}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function filterIsEmpty(f: CaseFilter): boolean {
  return (
    !f.query.trim() &&
    f.categories.length === 0 &&
    !f.historicalOnly &&
    !f.unplayedOnly &&
    f.difficulty === null
  );
}
