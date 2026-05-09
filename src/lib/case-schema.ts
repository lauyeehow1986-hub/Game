import type {
  CaseDefinition,
  Decision,
  DecisionEffects,
  DecisionOption,
  PathwayNode,
  Perspective,
} from './types';

/**
 * Hand-rolled validator for CaseDefinition JSON. Avoids pulling in Zod /
 * Yup; cases are simple data so a focused validator is small and gives
 * better error messages.
 *
 * Returns either { ok: true, case } or { ok: false, errors }.
 */

export type ValidationResult =
  | { ok: true; case: CaseDefinition }
  | { ok: false; errors: string[] };

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isStr(x: unknown): x is string {
  return typeof x === 'string';
}

function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function isBool(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

const PERSPECTIVES: Perspective[] = ['patient', 'caregiver', 'staff'];

function validateFraming(input: unknown, path: string, errors: string[]): Record<Perspective, string> | null {
  if (!isObj(input)) {
    errors.push(`${path}: framing must be an object with patient/caregiver/staff strings`);
    return null;
  }
  const out = {} as Record<Perspective, string>;
  for (const p of PERSPECTIVES) {
    const v = input[p];
    if (!isStr(v)) {
      errors.push(`${path}.${p}: must be a string (got ${typeof v})`);
      return null;
    }
    out[p] = v;
  }
  return out;
}

function validateEffects(input: unknown, path: string, errors: string[]): DecisionEffects | undefined {
  if (input === undefined) return undefined;
  if (!isObj(input)) {
    errors.push(`${path}: effects must be an object`);
    return undefined;
  }
  const out: DecisionEffects = {};
  if ('wardClass' in input) {
    const v = input.wardClass;
    if (!isStr(v) || !['A', 'B1', 'B2', 'C', 'na'].includes(v)) {
      errors.push(`${path}.wardClass: must be one of A | B1 | B2 | C | na`);
    } else {
      out.wardClass = v as DecisionEffects['wardClass'];
    }
  }
  if ('integratedShield' in input) {
    if (!isBool(input.integratedShield)) {
      errors.push(`${path}.integratedShield: must be a boolean`);
    } else {
      out.integratedShield = input.integratedShield;
    }
  }
  if ('setFlags' in input) {
    if (!isArr(input.setFlags) || !input.setFlags.every(isStr)) {
      errors.push(`${path}.setFlags: must be an array of strings`);
    } else {
      out.setFlags = input.setFlags as string[];
    }
  }
  if ('clearFlags' in input) {
    if (!isArr(input.clearFlags) || !input.clearFlags.every(isStr)) {
      errors.push(`${path}.clearFlags: must be an array of strings`);
    } else {
      out.clearFlags = input.clearFlags as string[];
    }
  }
  if ('caregiverBurden' in input) {
    if (!isObj(input.caregiverBurden)) {
      errors.push(`${path}.caregiverBurden: must be an object`);
    } else {
      out.caregiverBurden = {};
      for (const k of ['timeOffWorkHours', 'financialWorry', 'sleepDebt'] as const) {
        const v = input.caregiverBurden[k];
        if (v !== undefined && !isNum(v)) {
          errors.push(`${path}.caregiverBurden.${k}: must be a number`);
        } else if (v !== undefined) {
          out.caregiverBurden[k] = v;
        }
      }
    }
  }
  if ('pandemic' in input) {
    if (!isObj(input.pandemic)) {
      errors.push(`${path}.pandemic: must be an object`);
    } else {
      out.pandemic = {};
      const ds = input.pandemic.dorsconShift;
      if (ds !== undefined && ds !== 1 && ds !== -1) {
        errors.push(`${path}.pandemic.dorsconShift: must be 1 or -1`);
      } else if (ds !== undefined) {
        out.pandemic.dorsconShift = ds as 1 | -1;
      }
      for (const k of ['ppeStockpilePctDelta', 'surgeCapacityPctDelta'] as const) {
        const v = input.pandemic[k];
        if (v !== undefined && !isNum(v)) {
          errors.push(`${path}.pandemic.${k}: must be a number`);
        } else if (v !== undefined) {
          out.pandemic[k] = v;
        }
      }
    }
  }
  if ('branchTo' in input) {
    if (!isStr(input.branchTo)) {
      errors.push(`${path}.branchTo: must be a string (a node id)`);
    } else {
      out.branchTo = input.branchTo;
    }
  }
  return out;
}

function validateOption(input: unknown, path: string, errors: string[]): DecisionOption | null {
  if (!isObj(input)) {
    errors.push(`${path}: option must be an object`);
    return null;
  }
  const id = input.id;
  if (!isStr(id)) {
    errors.push(`${path}.id: missing or non-string`);
    return null;
  }
  const label = input.label;
  if (!isStr(label)) {
    errors.push(`${path}.label: missing or non-string`);
    return null;
  }
  const rationale = isStr(input.rationale) ? input.rationale : '';
  const score = input.score;
  if (!isNum(score)) {
    errors.push(`${path}.score: must be a number`);
    return null;
  }
  const outcome = validateFraming(input.outcome, `${path}.outcome`, errors);
  if (!outcome) return null;
  const effects = validateEffects(input.effects, `${path}.effects`, errors);
  return {
    id,
    label,
    rationale,
    score,
    outcome,
    nextNode: isStr(input.nextNode) ? input.nextNode : undefined,
    effects,
  };
}

function validateDecision(input: unknown, path: string, errors: string[]): Decision | null {
  if (!isObj(input)) {
    errors.push(`${path}: decision must be an object`);
    return null;
  }
  const id = isStr(input.id) ? input.id : null;
  const prompt = isStr(input.prompt) ? input.prompt : null;
  if (!id || !prompt) {
    errors.push(`${path}: decision needs string id + prompt`);
    return null;
  }
  const weight = isNum(input.weight) ? input.weight : 1;
  const ref = isObj(input.reference) ? input.reference : null;
  const reference = ref && isStr(ref.label) && isStr(ref.body)
    ? { label: ref.label, body: ref.body }
    : { label: 'Reference', body: '' };
  const options = isArr(input.options)
    ? (input.options
        .map((o, i) => validateOption(o, `${path}.options[${i}]`, errors))
        .filter((o): o is DecisionOption => o !== null))
    : [];
  if (options.length < 2) {
    errors.push(`${path}.options: needs at least 2 options`);
    return null;
  }
  return { id, prompt, weight, reference, options };
}

function validateNode(input: unknown, path: string, errors: string[]): PathwayNode | null {
  if (!isObj(input)) {
    errors.push(`${path}: pathway node must be an object`);
    return null;
  }
  const id = isStr(input.id) ? input.id : null;
  const department = isStr(input.department) ? input.department : null;
  if (!id || !department) {
    errors.push(`${path}: needs string id + department`);
    return null;
  }
  const durationMin = isNum(input.durationMin) ? input.durationMin : 0;
  const framing = validateFraming(input.framing, `${path}.framing`, errors);
  if (!framing) return null;
  const decision = input.decision !== undefined
    ? validateDecision(input.decision, `${path}.decision`, errors) ?? undefined
    : undefined;
  const node: PathwayNode = {
    id,
    department,
    facility: isStr(input.facility) ? input.facility : undefined,
    durationMin,
    framing,
    decision,
    costSGD: isNum(input.costSGD) ? input.costSGD : undefined,
    charge: isStr(input.charge) ? (input.charge as PathwayNode['charge']) : undefined,
    requiresAnyFlag: isArr(input.requiresAnyFlag) && input.requiresAnyFlag.every(isStr)
      ? (input.requiresAnyFlag as string[])
      : undefined,
    skipIfAnyFlag: isArr(input.skipIfAnyFlag) && input.skipIfAnyFlag.every(isStr)
      ? (input.skipIfAnyFlag as string[])
      : undefined,
  };
  if (isObj(input.caregiverBurden)) {
    node.caregiverBurden = {};
    for (const k of ['timeOffWorkHours', 'financialWorry', 'sleepDebt'] as const) {
      const v = input.caregiverBurden[k];
      if (v !== undefined && !isNum(v)) {
        errors.push(`${path}.caregiverBurden.${k}: must be a number`);
      } else if (v !== undefined) {
        node.caregiverBurden[k] = v;
      }
    }
  }
  return node;
}

export function validateCase(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObj(input)) {
    return { ok: false, errors: ['Top-level: expected a JSON object'] };
  }
  const id = isStr(input.id) ? input.id : null;
  const title = isStr(input.title) ? input.title : null;
  const blurb = isStr(input.blurb) ? input.blurb : null;
  if (!id || !title || !blurb) {
    errors.push('Required: id (string), title (string), blurb (string)');
  }
  const category = isStr(input.category) && ['elective', 'acute', 'outpatient'].includes(input.category)
    ? (input.category as CaseDefinition['category'])
    : null;
  if (!category) {
    errors.push('category: must be "elective" | "acute" | "outpatient"');
  }
  const primaryFacility = isStr(input.primaryFacility) ? input.primaryFacility : null;
  if (!primaryFacility) {
    errors.push('primaryFacility: required string (a facility id like "ttsh")');
  }
  const involvedFacilities = isArr(input.involvedFacilities) && input.involvedFacilities.every(isStr)
    ? (input.involvedFacilities as string[])
    : null;
  if (!involvedFacilities) {
    errors.push('involvedFacilities: array of facility-id strings');
  }
  const profileKey = isStr(input.profileKey) ? input.profileKey : 'taxiDriver';
  const allowsWardChoice = isBool(input.allowsWardChoice) ? input.allowsWardChoice : false;
  const guidelines: CaseDefinition['guidelines'] = isArr(input.guidelines)
    ? input.guidelines
        .filter(isObj)
        .filter((g) => isStr(g.label) && isStr(g.body))
        .map((g) => ({ label: g.label as string, body: g.body as string }))
    : [];
  const pathwayInput = isArr(input.pathway) ? input.pathway : null;
  if (!pathwayInput || pathwayInput.length === 0) {
    errors.push('pathway: required non-empty array of nodes');
  }
  const pathway: PathwayNode[] = (pathwayInput ?? [])
    .map((n, i) => validateNode(n, `pathway[${i}]`, errors))
    .filter((n): n is PathwayNode => n !== null);

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const def: CaseDefinition = {
    id: id!,
    title: title!,
    blurb: blurb!,
    category: category!,
    primaryFacility: primaryFacility!,
    involvedFacilities: involvedFacilities!,
    profileKey,
    allowsWardChoice,
    guidelines,
    pathway,
    historical: isBool(input.historical) ? input.historical : undefined,
    citations: isArr(input.citations) && input.citations.every(isStr)
      ? (input.citations as string[])
      : undefined,
    randomiseProfile: isBool(input.randomiseProfile) ? input.randomiseProfile : undefined,
    acuteTimer:
      isObj(input.acuteTimer) &&
      isNum(input.acuteTimer.goalMin) &&
      isStr(input.acuteTimer.goalLabel) &&
      isStr(input.acuteTimer.missedFlag)
        ? {
            goalMin: input.acuteTimer.goalMin,
            goalLabel: input.acuteTimer.goalLabel,
            missedFlag: input.acuteTimer.missedFlag,
          }
        : undefined,
  };
  return { ok: true, case: def };
}

/**
 * Serialise a CaseDefinition back to JSON-safe object (no functions).
 */
export function serialiseCase(c: CaseDefinition): string {
  return JSON.stringify(c, null, 2);
}
