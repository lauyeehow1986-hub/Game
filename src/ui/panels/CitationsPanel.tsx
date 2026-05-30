import { useMemo, useState } from 'react';
import { listCases } from '../../content';
import { useTr } from '../../lib/i18n';
import { GLOSSARY_TERMS } from '../../lib/glossary';
import type { CaseDefinition, GuidelineRef } from '../../lib/types';

// Augment the shared glossary with terms that don't make sense to scan for
// inline (e.g. 'A/B1/B2/C' would create false positives mid-prose).
const EXTRA_GLOSSARY_ONLY: Array<{ term: string; def: string }> = [
  { term: 'A/B1/B2/C', def: 'Public-hospital ward classes; A = no subsidy, single room → C = highest means-tested subsidy, open ward.' },
];
const GLOSSARY = [...GLOSSARY_TERMS, ...EXTRA_GLOSSARY_ONLY].sort((a, b) =>
  a.term.localeCompare(b.term),
);

export function CitationsPanel() {
  const tr = useTr();
  const [tab, setTab] = useState<'citations' | 'glossary'>('citations');
  const [query, setQuery] = useState('');
  const cases = listCases();

  // Build the inverted index: guideline-label → {ref, cases that use it}.
  // Memoized so re-renders on `query` don't re-walk every case.
  const { sortedGuidelines, refsByLabel, historicalCitations } = useMemo(() => {
    const guidelines = new Map<string, GuidelineRef>();
    const refsByLabel = new Map<string, CaseDefinition[]>();
    for (const c of cases) {
      for (const g of c.guidelines) {
        const key = tr(g.label);
        guidelines.set(key, g);
        const list = refsByLabel.get(key) ?? [];
        if (!list.includes(c)) list.push(c);
        refsByLabel.set(key, list);
      }
    }
    const sorted = Array.from(guidelines.values()).sort((a, b) =>
      tr(a.label).localeCompare(tr(b.label)),
    );
    const historical = cases
      .filter((c) => c.historical && c.citations)
      .flatMap((c) => c.citations!.map((cit) => ({ caseTitle: c.title, cit })));
    return { sortedGuidelines: sorted, refsByLabel, historicalCitations: historical };
  }, [cases, tr]);

  const q = query.trim().toLowerCase();
  const filteredGuidelines = q
    ? sortedGuidelines.filter(
        (g) => tr(g.label).toLowerCase().includes(q) || tr(g.body).toLowerCase().includes(q),
      )
    : sortedGuidelines;
  const filteredCitations = q
    ? historicalCitations.filter((c) => c.cit.toLowerCase().includes(q))
    : historicalCitations;
  const filteredGlossary = q
    ? GLOSSARY.filter(
        (g) => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q),
      )
    : GLOSSARY;

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">References</h3>
        <div className="flex gap-1 bg-clinical-bg border border-clinical-border rounded-full p-0.5">
          <button
            onClick={() => setTab('citations')}
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              tab === 'citations'
                ? 'bg-clinical-accent text-white font-semibold'
                : 'text-clinical-subtle'
            }`}
          >
            Citations
          </button>
          <button
            onClick={() => setTab('glossary')}
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              tab === 'glossary'
                ? 'bg-clinical-accent text-white font-semibold'
                : 'text-clinical-subtle'
            }`}
          >
            Glossary
          </button>
        </div>
      </header>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search references…"
        className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white"
      />

      {tab === 'citations' && (
        <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
              Guidelines & references
            </div>
            <ul className="space-y-2">
              {filteredGuidelines.map((g) => {
                const key = tr(g.label);
                const refs = refsByLabel.get(key) ?? [];
                return (
                  <li key={key} className="text-[11px] leading-snug">
                    <div className="text-white font-medium">{key}</div>
                    <div className="text-clinical-subtle">{tr(g.body)}</div>
                    {refs.length > 0 && (
                      <div className="mt-0.5 text-[10px] text-clinical-subtle/80">
                        Cited in: {refs.map((r) => tr(r.title)).join(' · ')}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {filteredCitations.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
                Historical scenario citations
              </div>
              <ul className="space-y-1">
                {filteredCitations.map((c, i) => (
                  <li key={i} className="text-[11px] leading-snug">
                    <span className="text-white/70">[{i + 1}]</span>{' '}
                    <span className="text-clinical-subtle">{c.cit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'glossary' && (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {filteredGlossary.map((g) => (
            <li key={g.term} className="text-[11px] leading-snug">
              <span className="text-white font-semibold">{g.term}</span>
              <span className="text-clinical-subtle"> — {g.def}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
