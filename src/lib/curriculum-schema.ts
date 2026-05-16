import type { CaseDefinition, LocalisedString } from './types';
import { validateCase, type ValidationResult } from './case-schema';

/**
 * A portable curriculum bundle: the curriculum metadata + any custom cases
 * it depends on, packaged into one JSON object. Educators can ship a whole
 * syllabus as a single artifact (file or URL).
 */

export interface CurriculumBundle {
  id: string;
  title: LocalisedString;
  blurb: LocalisedString;
  objectives: LocalisedString[];
  /** Ordered case ids, in the sequence the curriculum walks. */
  caseIds: string[];
  /** Custom cases shipped inside the bundle. Built-in case ids may also
   *  appear in caseIds without needing to be embedded here. */
  cases?: CaseDefinition[];
  /** Optional author label shown in the imported-curricula list. */
  author?: string;
}

export type CurriculumValidation =
  | { ok: true; bundle: CurriculumBundle }
  | { ok: false; errors: string[] };

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
function isStr(x: unknown): x is string {
  return typeof x === 'string';
}
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}
function isLocalisedString(x: unknown): x is LocalisedString {
  if (isStr(x)) return true;
  if (!isObj(x)) return false;
  return ['en', 'zh', 'ms', 'ta'].every((k) =>
    !(k in x) || isStr((x as Record<string, unknown>)[k]),
  );
}

export function validateCurriculum(input: unknown): CurriculumValidation {
  const errors: string[] = [];
  if (!isObj(input)) return { ok: false, errors: ['Top-level: expected a JSON object'] };

  const id = isStr(input.id) ? input.id : null;
  if (!id) errors.push('id: required string');
  const title = isLocalisedString(input.title) ? input.title : null;
  if (!title) errors.push('title: required string or { en, zh, ms, ta } object');
  const blurb = isLocalisedString(input.blurb) ? input.blurb : null;
  if (!blurb) errors.push('blurb: required string or { en, zh, ms, ta } object');

  const objectivesInput = isArr(input.objectives) ? input.objectives : null;
  if (!objectivesInput || objectivesInput.length === 0) {
    errors.push('objectives: required non-empty array of strings or LocalisedString objects');
  }
  const objectives: LocalisedString[] = (objectivesInput ?? []).filter(isLocalisedString);

  const caseIds = isArr(input.caseIds) && input.caseIds.every(isStr) ? (input.caseIds as string[]) : null;
  if (!caseIds || caseIds.length < 2) {
    errors.push('caseIds: required array of at least 2 case-id strings');
  }

  let cases: CaseDefinition[] | undefined;
  if ('cases' in input) {
    if (!isArr(input.cases)) {
      errors.push('cases: must be an array of case JSON objects if present');
    } else {
      const validated: CaseDefinition[] = [];
      input.cases.forEach((raw, i) => {
        const r: ValidationResult = validateCase(raw);
        if (r.ok) validated.push(r.case);
        else errors.push(`cases[${i}]: ${r.errors.join('; ')}`);
      });
      cases = validated;
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    bundle: {
      id: id!,
      title: title!,
      blurb: blurb!,
      objectives,
      caseIds: caseIds!,
      cases,
      author: isStr(input.author) ? input.author : undefined,
    },
  };
}

export function serialiseCurriculum(b: CurriculumBundle): string {
  return JSON.stringify(b, null, 2);
}
