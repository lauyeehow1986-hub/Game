import { useState } from 'react';
import { listCases } from '../../content';
import type { GuidelineRef } from '../../lib/types';

const GLOSSARY: Array<{ term: string; def: string }> = [
  { term: 'NEHR', def: 'National Electronic Health Record — Singapore-wide shared record set; all restructured public providers contribute, private participation is voluntary.' },
  { term: 'HealthHub', def: "Patient-facing portal that shows NEHR-derived records to citizens." },
  { term: 'DORSCON', def: 'Disease Outbreak Response System Condition — colour-coded national alert system (Green / Yellow / Orange / Red).' },
  { term: 'CHAS', def: 'Community Health Assist Scheme — tiered subsidies (Blue / Orange / Green) at participating private GPs and dentists for citizens; PG (Pioneer Generation) and MG (Merdeka Generation) cards add further top-ups.' },
  { term: 'MediShield Life', def: 'National basic catastrophic insurance covering inpatient and selected outpatient (oncology, dialysis) bills up to a deductible and co-payment.' },
  { term: 'MediSave', def: 'Mandatory medical savings account; can be drawn down for selected outpatient and inpatient items within annual / lifetime caps.' },
  { term: 'MAF', def: 'Medication Assistance Fund — subsidies for selected high-cost drugs at restructured hospitals.' },
  { term: 'Healthier SG', def: "MOH (2023) primary-care continuity programme — citizens enrol with one GP / polyclinic doctor for chronic-disease management." },
  { term: 'AIC', def: "Agency for Integrated Care — coordinates community / step-down / home-care for patients moving between sectors." },
  { term: 'AH@Home', def: 'Alexandra Hospital virtual ward — hospital-level care delivered at home with home visits and remote monitoring.' },
  { term: 'EPIP', def: "IMH Early Psychosis Intervention Programme — first-episode psychosis with assertive community follow-up." },
  { term: 'PHPC', def: 'Public Health Preparedness Clinic — geographically distributed primary-care capacity activated during outbreaks.' },
  { term: 'PEWS', def: "Paediatric Early Warning Score — escalation tool used at KKH and other paediatric services." },
  { term: 'A/B1/B2/C', def: 'Public-hospital ward classes; A = no subsidy, single room → C = highest means-tested subsidy, open ward.' },
  { term: 'IP rider', def: "Integrated Shield Plan — private insurance riders that top up MediShield Life to as-charged levels (subject to co-payment rules)." },
];

export function CitationsPanel() {
  const [tab, setTab] = useState<'citations' | 'glossary'>('citations');
  const cases = listCases();

  // Deduplicate guidelines by label.
  const guidelines = new Map<string, GuidelineRef>();
  for (const c of cases) {
    for (const g of c.guidelines) guidelines.set(g.label, g);
  }
  const sortedGuidelines = Array.from(guidelines.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const historicalCitations = cases
    .filter((c) => c.historical && c.citations)
    .flatMap((c) => c.citations!.map((cit) => ({ caseTitle: c.title, cit })));

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

      {tab === 'citations' && (
        <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
              Guidelines & references
            </div>
            <ul className="space-y-1">
              {sortedGuidelines.map((g) => (
                <li key={g.label} className="text-[11px] leading-snug">
                  <div className="text-white font-medium">{g.label}</div>
                  <div className="text-clinical-subtle">{g.body}</div>
                </li>
              ))}
            </ul>
          </div>
          {historicalCitations.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
                Historical scenario citations
              </div>
              <ul className="space-y-1">
                {historicalCitations.map((c, i) => (
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
          {GLOSSARY.map((g) => (
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
