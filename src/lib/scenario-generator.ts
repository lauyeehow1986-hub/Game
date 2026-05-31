/**
 * Scenario generator — composes a short, valid CaseDefinition by combining a
 * patient profile with a condition template. Pure + seedable, so "Generate a
 * case" gives endless (deterministic-per-seed) practice without authoring.
 *
 * Generated cases are realistic-generic teaching skeletons (triage → workup →
 * disposition), not a substitute for the hand-authored catalogue. They are
 * started directly (not added to the catalogue) so demo/compare don't apply.
 */

import type { CaseDefinition, LocalisedString } from './types';
import { DEFAULT_PROFILES } from './financing';
import { validateCase } from './case-schema';

interface OptionTemplate {
  label: LocalisedString;
  score: number;
  rationale: LocalisedString;
}
interface DecisionTemplate {
  prompt: LocalisedString;
  ref: { label: LocalisedString; body: LocalisedString };
  options: OptionTemplate[];
}
interface ConditionTemplate {
  key: string;
  title: LocalisedString;
  category: CaseDefinition['category'];
  facility: string;
  blurb: LocalisedString;
  triage: DecisionTemplate;
  disposition: DecisionTemplate;
}

const CONDITIONS: ConditionTemplate[] = [
  {
    key: 'breathless',
    title: { en: 'acute breathlessness', zh: '急性气促' },
    category: 'acute',
    facility: 'ttsh',
    blurb: { en: 'presents to the ED short of breath for two hours.', zh: '因气促两小时就诊急诊。' },
    triage: {
      prompt: { en: 'First priority on arrival?', zh: '到达时的首要任务?' },
      ref: { label: { en: 'ABCDE assessment', zh: 'ABCDE评估' }, body: { en: 'Airway/Breathing first; SpO2, ABG, CXR, ECG guide the cause.', zh: '先气道/呼吸;血氧、动脉血气、胸片、心电图指引病因。' } },
      options: [
        { label: { en: 'Oxygen to target sats + focused ABCDE + ECG and CXR.', zh: '给氧达标+重点ABCDE+心电图与胸片。' }, score: 10, rationale: { en: 'Stabilise oxygenation while working up the cause in parallel.', zh: '在并行查因的同时先稳定氧合。' } },
        { label: { en: 'Send straight for CT before any assessment.', zh: '不评估直接送CT。' }, score: 1, rationale: { en: 'Imaging before stabilising an unstable airway/breathing is unsafe.', zh: '在稳定不稳的气道/呼吸前先做影像不安全。' } },
        { label: { en: 'Reassure and reassess in an hour.', zh: '安抚,一小时后再评估。' }, score: -8, rationale: { en: 'Acute breathlessness can deteriorate fast; passive waiting is dangerous.', zh: '急性气促可迅速恶化,被动等待危险。' } },
      ],
    },
    disposition: {
      prompt: { en: 'Cause identified and treated. Disposition?', zh: '已查明并处理病因。处置?' },
      ref: { label: { en: 'Right-siting + safety-net', zh: '适当分流+安全网' }, body: { en: 'Admit the unstable; safety-net the stable with explicit return advice.', zh: '不稳定者收治;稳定者给明确复诊建议作安全网。' } },
      options: [
        { label: { en: 'Disposition matched to severity + follow-up + return advice.', zh: '按严重度处置+随访+复诊建议。' }, score: 10, rationale: { en: 'Severity-matched disposition with continuity is the safe default.', zh: '按严重度并具连续性的处置是安全默认。' } },
        { label: { en: 'Discharge all with no follow-up.', zh: '一律出院不随访。' }, score: -6, rationale: { en: 'No safety-net risks missed deterioration.', zh: '无安全网有漏诊恶化风险。' } },
      ],
    },
  },
  {
    key: 'abdo-pain',
    title: { en: 'acute abdominal pain', zh: '急性腹痛' },
    category: 'acute',
    facility: 'cgh',
    blurb: { en: 'presents with worsening abdominal pain since morning.', zh: '自晨起腹痛加重就诊。' },
    triage: {
      prompt: { en: 'Initial workup for undifferentiated abdominal pain?', zh: '未分化腹痛的初步检查?' },
      ref: { label: { en: 'Acute abdomen workup', zh: '急腹症检查' }, body: { en: 'Vitals, focused exam, bloods (incl. lipase), urine/βhCG where relevant, imaging by suspicion.', zh: '生命体征、重点查体、血检(含脂肪酶)、必要时尿检/βhCG、按怀疑做影像。' } },
      options: [
        { label: { en: 'Vitals + exam + bloods + βhCG if relevant + analgesia.', zh: '生命体征+查体+血检+必要βhCG+镇痛。' }, score: 10, rationale: { en: 'Structured workup; analgesia does not mask a surgical abdomen.', zh: '结构化检查;镇痛不会掩盖外科急腹症。' } },
        { label: { en: 'Withhold analgesia to "not mask" the exam.', zh: '不给镇痛以"免掩盖"查体。' }, score: -2, rationale: { en: 'Outdated — analgesia is safe and humane in acute abdomen.', zh: '观念过时 — 急腹症中镇痛安全且人道。' } },
        { label: { en: 'Discharge with antacids.', zh: '给抗酸药出院。' }, score: -6, rationale: { en: 'Premature closure misses surgical and gynae emergencies.', zh: '过早定论会漏诊外科与妇科急症。' } },
      ],
    },
    disposition: {
      prompt: { en: 'Workup done. Next step?', zh: '检查完成。下一步?' },
      ref: { label: { en: 'Surgical referral threshold', zh: '外科转介门槛' }, body: { en: 'Peritonism, obstruction, or rising inflammatory markers warrant surgical review.', zh: '腹膜刺激征、梗阻或炎症指标上升应请外科会诊。' } },
      options: [
        { label: { en: 'Refer surgery if red flags; otherwise observe + review.', zh: '有危险征象转外科;否则观察+复评。' }, score: 10, rationale: { en: 'Matches escalation to findings.', zh: '按发现决定升级。' } },
        { label: { en: 'Send home regardless of findings.', zh: '不论发现一律回家。' }, score: -6, rationale: { en: 'Ignoring red flags risks perforation/sepsis.', zh: '忽视危险征象有穿孔/脓毒症风险。' } },
      ],
    },
  },
  {
    key: 'fever',
    title: { en: 'fever and malaise', zh: '发热与不适' },
    category: 'outpatient',
    facility: 'nhgp-amk',
    blurb: { en: 'attends the polyclinic with three days of fever.', zh: '因发热三天到综合诊疗所就诊。' },
    triage: {
      prompt: { en: 'Approach to undifferentiated fever?', zh: '未分化发热的处理?' },
      ref: { label: { en: 'Fever triage + dengue awareness', zh: '发热分诊+登革热意识' }, body: { en: 'Screen for red flags + endemic infections (dengue); most are self-limiting but warning signs route to the ED.', zh: '筛查危险征象+地方性感染(登革热);多数自限,但出现警示征应转急诊。' } },
      options: [
        { label: { en: 'Red-flag screen + targeted tests + fluids + return advice.', zh: '危险征象筛查+针对性检验+补液+复诊建议。' }, score: 10, rationale: { en: 'Risk-stratifies and safety-nets without over-testing.', zh: '风险分层并设安全网,避免过度检验。' } },
        { label: { en: 'Broad-spectrum antibiotics for everyone.', zh: '一律给广谱抗生素。' }, score: -4, rationale: { en: 'Antibiotics for undifferentiated fever drive resistance and miss viral causes.', zh: '对未分化发热滥用抗生素助长耐药并漏掉病毒病因。' } },
        { label: { en: 'No tests, no advice — just paracetamol.', zh: '不检验不建议 — 只给扑热息痛。' }, score: -3, rationale: { en: 'Misses warning signs (e.g. dengue) needing escalation.', zh: '会漏掉需升级的警示征(如登革热)。' } },
      ],
    },
    disposition: {
      prompt: { en: 'Stable, no red flags. Plan?', zh: '稳定、无危险征象。计划?' },
      ref: { label: { en: 'Primary-care safety-net', zh: '基层安全网' }, body: { en: 'Clear return advice + a review timeframe is the safe outpatient default.', zh: '明确的复诊建议+复诊时限是安全的门诊默认。' } },
      options: [
        { label: { en: 'Symptomatic care + explicit warning signs + 48-72h review.', zh: '对症处理+明确警示征+48-72小时复诊。' }, score: 10, rationale: { en: 'Right-sited with a safety-net.', zh: '适当分流并设安全网。' } },
        { label: { en: 'Admit everyone for observation.', zh: '一律收治观察。' }, score: 0, rationale: { en: 'Over-admission wastes beds for self-limiting illness.', zh: '过度收治为自限性疾病浪费床位。' } },
      ],
    },
  },
];

/** Tiny seeded RNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const PROFILE_KEYS = Object.keys(DEFAULT_PROFILES);

/** Condition options for the Sandbox picker (id + bilingual label). */
export function conditionOptions(): Array<{ key: string; title: LocalisedString }> {
  return CONDITIONS.map((c) => ({ key: c.key, title: c.title }));
}

/** Profile options for the Sandbox picker (key + display name). */
export function profileOptions(): Array<{ key: string; name: string }> {
  return PROFILE_KEYS.map((key) => ({ key, name: DEFAULT_PROFILES[key].name }));
}

export interface GenerateOpts {
  conditionKey?: string;
  profileKey?: string;
  seed?: number;
}

/** Configurable generator used by Sandbox mode. Unknown keys fall back to random. */
export function generateScenarioFrom(opts: GenerateOpts = {}): CaseDefinition {
  const rng = opts.seed !== undefined ? mulberry32(opts.seed) : Math.random;
  const cond =
    CONDITIONS.find((c) => c.key === opts.conditionKey) ??
    CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
  const profileKey =
    opts.profileKey && DEFAULT_PROFILES[opts.profileKey]
      ? opts.profileKey
      : PROFILE_KEYS[Math.floor(rng() * PROFILE_KEYS.length)];
  return assemble(cond, profileKey, rng);
}

export function generateScenario(seed?: number): CaseDefinition {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const cond = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
  const profileKey = PROFILE_KEYS[Math.floor(rng() * PROFILE_KEYS.length)];
  return assemble(cond, profileKey, rng);
}

function assemble(cond: ConditionTemplate, profileKey: string, rng: () => number): CaseDefinition {
  const profile = DEFAULT_PROFILES[profileKey];
  const uid = Math.floor(rng() * 1e6).toString(36);

  const mkOptions = (d: DecisionTemplate, nodeId: string) =>
    d.options.map((o, i) => ({
      id: `${nodeId}-o${i + 1}`,
      label: o.label,
      score: o.score,
      rationale: o.rationale,
      outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
    }));

  const framing = (en: string, zh: string) => ({
    patient: { en, zh }, caregiver: { en, zh }, staff: { en, zh },
  });

  const obj = {
    id: `gen-${cond.key}-${uid}`,
    title: {
      en: `Generated: ${enOf(cond.title)} (${profile.name})`,
      zh: `生成:${zhOf(cond.title)}(${profile.name})`,
    },
    blurb: {
      en: `${profile.name}, ${profile.notes ?? ''} ${enOf(cond.blurb)}`.trim(),
      zh: `${profile.name},${zhOf(cond.blurb)}`,
    },
    category: cond.category,
    primaryFacility: cond.facility,
    involvedFacilities: [cond.facility],
    profileKey,
    allowsWardChoice: false,
    guidelines: [cond.triage.ref, cond.disposition.ref],
    pathway: [
      {
        id: 'gen-triage',
        department: cond.category === 'outpatient' ? 'gp-room' : 'triage',
        facility: cond.facility,
        durationMin: 20,
        costSGD: cond.category === 'outpatient' ? 30 : 130,
        charge: cond.category === 'outpatient' ? 'polyclinic' : 'a&e',
        framing: framing('You are seen and assessed.', '你被接诊并评估。'),
        decision: {
          id: 'gen-triage-d',
          prompt: cond.triage.prompt,
          weight: 1.5,
          reference: cond.triage.ref,
          options: mkOptions(cond.triage, 'gen-triage'),
        },
      },
      {
        id: 'gen-disposition',
        department: cond.category === 'outpatient' ? 'gp-room' : 'ward',
        facility: cond.facility,
        durationMin: 30,
        costSGD: cond.category === 'outpatient' ? 20 : 200,
        charge: cond.category === 'outpatient' ? 'polyclinic' : 'inpatient-ward',
        framing: framing('The plan is explained to you.', '计划向你说明。'),
        decision: {
          id: 'gen-disposition-d',
          prompt: cond.disposition.prompt,
          weight: 1,
          reference: cond.disposition.ref,
          options: mkOptions(cond.disposition, 'gen-disposition'),
        },
      },
    ],
  };

  const res = validateCase(obj);
  if (!res.ok) {
    // Should never happen — templates are authored valid. Surface loudly in dev.
    throw new Error(`Generated scenario failed validation: ${res.errors.join('; ')}`);
  }
  return res.case;
}

function enOf(s: LocalisedString): string {
  return typeof s === 'string' ? s : s.en ?? '';
}
function zhOf(s: LocalisedString): string {
  return typeof s === 'string' ? s : s.zh ?? s.en ?? '';
}

export const SCENARIO_CONDITION_COUNT = CONDITIONS.length;
