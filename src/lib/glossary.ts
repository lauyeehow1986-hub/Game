/**
 * Glossary terms with definitions. Single source of truth so the CitationsPanel
 * and the contextual-glossary scanner stay in sync. Each entry is an exact
 * (English) phrase to match; the scanner walks longest-first so "MediShield
 * Life" beats "MediShield".
 */

export interface GlossaryEntry {
  term: string;
  def: string;
}

export const GLOSSARY_TERMS: GlossaryEntry[] = [
  { term: 'NEHR', def: 'National Electronic Health Record — Singapore-wide shared record set; all restructured public providers contribute, private participation is voluntary.' },
  { term: 'HealthHub', def: 'Patient-facing portal that shows NEHR-derived records to citizens.' },
  { term: 'DORSCON', def: 'Disease Outbreak Response System Condition — colour-coded national alert system (Green / Yellow / Orange / Red).' },
  { term: 'CHAS', def: 'Community Health Assist Scheme — tiered subsidies (Blue / Orange / Green) at participating private GPs and dentists for citizens; PG (Pioneer Generation) and MG (Merdeka Generation) cards add further top-ups.' },
  { term: 'MediShield Life', def: 'National basic catastrophic insurance covering inpatient and selected outpatient (oncology, dialysis) bills up to a deductible and co-payment.' },
  { term: 'MediSave', def: 'Mandatory medical savings account; can be drawn down for selected outpatient and inpatient items within annual / lifetime caps.' },
  { term: 'MAF', def: 'Medication Assistance Fund — subsidies for selected high-cost drugs at restructured hospitals.' },
  { term: 'Healthier SG', def: 'MOH (2023) primary-care continuity programme — citizens enrol with one GP / polyclinic doctor for chronic-disease management.' },
  { term: 'AIC', def: 'Agency for Integrated Care — coordinates community / step-down / home-care for patients moving between sectors.' },
  { term: 'AH@Home', def: 'Alexandra Hospital virtual ward — hospital-level care delivered at home with home visits and remote monitoring.' },
  { term: 'EPIP', def: 'IMH Early Psychosis Intervention Programme — first-episode psychosis with assertive community follow-up.' },
  { term: 'PHPC', def: 'Public Health Preparedness Clinic — geographically distributed primary-care capacity activated during outbreaks.' },
  { term: 'PEWS', def: 'Paediatric Early Warning Score — escalation tool used at KKH and other paediatric services.' },
  { term: 'IP rider', def: 'Integrated Shield Plan — private insurance riders that top up MediShield Life to as-charged levels (subject to co-payment rules).' },
  { term: 'CDMP', def: 'Chronic Disease Management Programme — outpatient subsidy + MediSave drawdown for chronic conditions.' },
  { term: 'NCID', def: 'National Centre for Infectious Diseases — Singapore\'s national isolation centre and outbreak-response hub.' },
  { term: 'SCDF', def: 'Singapore Civil Defence Force — pre-hospital EMS provider that handles the 995 ambulance service.' },
  { term: 'MSW', def: 'Medical Social Worker — hospital-based social workers who coordinate financial counselling, Medifund applications, and discharge planning.' },
  { term: 'Medifund', def: 'Endowment fund of last resort that covers medical bills for Singaporeans who cannot afford them after subsidies and insurance.' },
  { term: 'CURB-65', def: 'Severity score for community-acquired pneumonia (Confusion, Urea >7, RR ≥30, BP <90/60, Age ≥65) used to triage outpatient vs admission vs ICU.' },
  { term: 'WBGT', def: 'Wet-Bulb Globe Temperature — composite heat-stress index that drives the SAF activity-modification matrix.' },
  { term: 'FWMI', def: 'Foreign Worker Medical Insurance — employer-funded coverage for work-permit holders; replaces MediShield Life eligibility.' },
  { term: 'NAIS', def: 'National Adult Immunisation Schedule — subsidised flu / pneumococcal / hep B / HPV / shingles vaccines for adults.' },
  { term: 'NSF', def: 'Full-time National Serviceman — a person serving conscripted military / civil-defence / police duty.' },
  { term: 'RTU', def: 'Return-to-Unit — Singapore military disposition allowing the serviceman to resume duties; graded re-exposure required after exertional heat injury.' },
  { term: 'WICA', def: 'Work Injury Compensation Act — no-fault employer-funded scheme for workplace injuries.' },
  { term: 'MHCTA', def: 'Mental Health (Care and Treatment) Act — Singapore framework for involuntary psychiatric assessment and admission.' },
  { term: 'SOC', def: 'Specialist Outpatient Clinic — public-hospital outpatient specialist consultation with subsidised rates for citizens / PRs.' },
  { term: 'NS1', def: 'Dengue NS1 antigen — useful for diagnosis in the first 7 days of fever.' },
  { term: 'I-Quit', def: 'HPB national smoking-cessation hotline and programme (1800-438-2000).' },
];

/**
 * Sort terms longest-first so multi-word matches are tried before
 * sub-strings (e.g. "MediShield Life" before "MediShield").
 */
const ORDERED = [...GLOSSARY_TERMS].sort((a, b) => b.term.length - a.term.length);

export interface GlossaryToken {
  kind: 'text' | 'term';
  text: string;
  /** Definition, present when kind === 'term'. */
  def?: string;
}

/**
 * Scan a plain string and emit alternating text / term tokens. Used by the
 * UI to render a Term wrapper around each match. Case-insensitive matching;
 * the returned `text` preserves the original casing from the input.
 *
 * Skips matches inside a word — "MediSave" matches but "preMediSave" does
 * not. This keeps acronyms tight without flooding text with tooltips.
 */
export function scanGlossary(input: string): GlossaryToken[] {
  if (!input) return [];
  // Greedy left-to-right scan: at each cursor, try to match the longest
  // term that starts here.
  const tokens: GlossaryToken[] = [];
  let cursor = 0;
  let buffer = '';
  const isWordChar = (ch: string) => /[A-Za-z0-9]/.test(ch);

  while (cursor < input.length) {
    let matched: GlossaryEntry | null = null;
    let matchedLen = 0;
    // Word boundary check: previous char (if any) must NOT be a word char.
    const prev = cursor > 0 ? input[cursor - 1] : '';
    if (!isWordChar(prev)) {
      for (const entry of ORDERED) {
        const slice = input.slice(cursor, cursor + entry.term.length);
        if (slice.toLowerCase() === entry.term.toLowerCase()) {
          const next = input[cursor + entry.term.length] ?? '';
          if (!isWordChar(next)) {
            matched = entry;
            matchedLen = entry.term.length;
            break;
          }
        }
      }
    }
    if (matched) {
      if (buffer) {
        tokens.push({ kind: 'text', text: buffer });
        buffer = '';
      }
      tokens.push({
        kind: 'term',
        text: input.slice(cursor, cursor + matchedLen),
        def: matched.def,
      });
      cursor += matchedLen;
    } else {
      buffer += input[cursor];
      cursor += 1;
    }
  }
  if (buffer) tokens.push({ kind: 'text', text: buffer });
  return tokens;
}
