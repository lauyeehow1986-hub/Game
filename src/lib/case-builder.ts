/**
 * Case authoring studio — pure assembler.
 *
 * Turns the flat form state of the CaseBuilderModal into a CaseDefinition and
 * runs it through the existing validateCase() so the studio and the JSON
 * importer share one source of truth. Keeps the UI dumb: it only collects
 * strings/numbers; all shaping + validation lives here.
 */

import { validateCase, type ValidationResult } from './case-schema';

export interface BuilderOption {
  label: string;
  score: number;
  rationale: string;
}

export interface BuilderNode {
  id: string;
  department: string;
  facility: string;
  framingStaff: string;
  framingPatient: string;
  framingCaregiver: string;
  prompt: string;
  weight: number;
  refLabel: string;
  refBody: string;
  options: BuilderOption[];
}

export interface BuilderDraft {
  id: string;
  titleEn: string;
  blurbEn: string;
  category: 'acute' | 'elective' | 'outpatient';
  primaryFacility: string;
  profileKey: string;
  nodes: BuilderNode[];
}

export function emptyOption(): BuilderOption {
  return { label: '', score: 0, rationale: '' };
}

export function emptyNode(index: number): BuilderNode {
  return {
    id: `node-${index + 1}`,
    department: 'consult-room',
    facility: '',
    framingStaff: '',
    framingPatient: '',
    framingCaregiver: '',
    prompt: '',
    weight: 1,
    refLabel: '',
    refBody: '',
    options: [
      { label: '', score: 10, rationale: '' },
      { label: '', score: 0, rationale: '' },
    ],
  };
}

export function emptyDraft(): BuilderDraft {
  return {
    id: '',
    titleEn: '',
    blurbEn: '',
    category: 'acute',
    primaryFacility: '',
    profileKey: 'taxiDriver',
    nodes: [emptyNode(0)],
  };
}

/** Slugify a free-text title into a safe case id. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

const emptyOutcome = { patient: '', caregiver: '', staff: '' };

/**
 * Assemble + validate a draft. Returns the same ValidationResult shape as the
 * JSON importer so the modal can render the same error list.
 */
export function buildCaseFromDraft(draft: BuilderDraft): ValidationResult {
  const id = draft.id.trim() || slugify(draft.titleEn);

  const obj = {
    id,
    title: draft.titleEn.trim(),
    blurb: draft.blurbEn.trim(),
    category: draft.category,
    primaryFacility: draft.primaryFacility.trim(),
    involvedFacilities: dedupe(
      [draft.primaryFacility, ...draft.nodes.map((n) => n.facility)]
        .map((f) => f.trim())
        .filter(Boolean),
    ),
    profileKey: draft.profileKey.trim() || 'taxiDriver',
    allowsWardChoice: false,
    guidelines: dedupeGuidelines(
      draft.nodes
        .filter((n) => n.refLabel.trim() && n.refBody.trim())
        .map((n) => ({ label: n.refLabel.trim(), body: n.refBody.trim() })),
    ),
    pathway: draft.nodes.map((n) => ({
      id: n.id.trim(),
      department: n.department.trim() || 'consult-room',
      facility: n.facility.trim() || undefined,
      durationMin: 20,
      framing: {
        patient: n.framingPatient.trim() || n.framingStaff.trim(),
        caregiver: n.framingCaregiver.trim() || n.framingStaff.trim(),
        staff: n.framingStaff.trim(),
      },
      decision: {
        id: `${n.id.trim()}-d`,
        prompt: n.prompt.trim(),
        weight: Number.isFinite(n.weight) && n.weight > 0 ? n.weight : 1,
        reference: {
          label: n.refLabel.trim() || 'Reference',
          body: n.refBody.trim() || '—',
        },
        options: n.options
          .filter((o) => o.label.trim())
          .map((o, i) => ({
            id: `${n.id.trim()}-o${i + 1}`,
            label: o.label.trim(),
            score: Number.isFinite(o.score) ? o.score : 0,
            rationale: o.rationale.trim() || '—',
            outcome: { ...emptyOutcome },
          })),
      },
    })),
  };

  return validateCase(obj);
}

/**
 * Lightweight pre-flight checks surfaced as warnings before the user tries to
 * save — catches the common "decision needs ≥2 options" / "no correct answer"
 * mistakes the schema validator also enforces, but with friendlier wording.
 */
export function draftWarnings(draft: BuilderDraft): string[] {
  const w: string[] = [];
  if (!draft.titleEn.trim()) w.push('Title is required.');
  if (!draft.blurbEn.trim()) w.push('Blurb (the scenario intro) is required.');
  if (!draft.primaryFacility.trim()) w.push('Primary facility id is required (e.g. "ttsh").');
  draft.nodes.forEach((n, i) => {
    const label = `Node ${i + 1}`;
    if (!n.prompt.trim()) w.push(`${label}: decision prompt is required.`);
    if (!n.framingStaff.trim()) w.push(`${label}: staff framing is required.`);
    const filled = n.options.filter((o) => o.label.trim());
    if (filled.length < 2) w.push(`${label}: needs at least 2 options.`);
    if (filled.length > 0 && !filled.some((o) => o.score > 0)) {
      w.push(`${label}: at least one option should have a positive score (the "best" answer).`);
    }
  });
  return w;
}

function dedupe(xs: string[]): string[] {
  return Array.from(new Set(xs));
}

function dedupeGuidelines(gs: Array<{ label: string; body: string }>): Array<{ label: string; body: string }> {
  const seen = new Set<string>();
  const out: Array<{ label: string; body: string }> = [];
  for (const g of gs) {
    if (seen.has(g.label)) continue;
    seen.add(g.label);
    out.push(g);
  }
  return out;
}
