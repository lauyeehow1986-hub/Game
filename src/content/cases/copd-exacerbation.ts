import type { CaseDefinition } from '../../lib/types';

const GOLD_AECOPD = {
  label: { en: 'GOLD 2024 — AECOPD management', zh: 'GOLD 2024 — 慢阻肺急性加重处理' },
  body: {
    en: 'AECOPD: bronchodilators (SABA + SAMA), systemic steroids (40 mg pred × 5d), antibiotics if Anthonisen 2/3 cardinal symptoms (sputum purulence is the strongest single criterion), oxygen titrated to SpO2 88-92%, NIV for hypercapnic respiratory failure.',
    zh: 'AECOPD:支气管扩张剂(SABA+SAMA)、全身糖皮质激素(泼尼松40mg×5天)、Anthonisen 2/3项主征(痰脓化最强)时给抗生素、氧合滴定至SpO2 88-92%、高碳酸血症性呼吸衰竭用无创通气NIV。',
  },
};

const TARGET_SPO2 = {
  label: { en: 'Targeted oxygen in COPD', zh: '慢阻肺的目标氧疗' },
  body: {
    en: 'Aim SpO2 88-92% (not 94-98%) — over-oxygenation worsens hypercapnia. Venturi mask gives a known FiO2; non-rebreathers are usually wrong here.',
    zh: '目标SpO2 88-92%(而非94-98%) — 给氧过度会加重高碳酸血症。Venturi面罩可提供已知FiO2;非重吸面罩通常不合适。',
  },
};

const HEALTHIER_SG_COPD = {
  label: { en: 'COPD continuity at a Healthier-SG GP', zh: 'Healthier SG家庭医生的慢阻肺连续性照护' },
  body: {
    en: 'After AECOPD: confirm inhaler technique, review LAMA/LABA(/ICS) regimen, smoking cessation (HPB I-Quit), pulmonary rehab referral, annual flu + pneumococcal vaccines, action plan with relapse criteria.',
    zh: 'AECOPD后:检查吸入装置使用、复核LAMA/LABA(/ICS)方案、戒烟(保健促进局I-Quit)、肺康复转介、年度流感+肺炎球菌疫苗、含复发标准的行动计划。',
  },
};

export const copdAecCase: CaseDefinition = {
  id: 'copd-aecopd',
  title: {
    en: 'COPD exacerbation — ED to discharge with a plan',
    zh: '慢阻肺急性加重 — 急诊到带行动计划出院',
  },
  blurb: {
    en: 'Mr Rajan, 62, ex-lorry driver, smoker, GOLD-3 COPD. Three days of worsening dyspnoea + purulent sputum. RR 26, SpO2 84% on RA, talking in short sentences. KTPH ED at 9am.',
    zh: 'Rajan先生,62岁,前货车司机、吸烟,GOLD-3慢阻肺。三天来气促加重伴脓痰。呼吸26,空气SpO2 84%,短句说话。上午9点到KTPH急诊。',
  },
  category: 'acute',
  primaryFacility: 'ktph',
  involvedFacilities: ['ktph', 'nhgp-amk'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 45,
    goalLabel: 'Targeted O2 + steroids by',
    missedFlag: 'aecopd-delayed',
  },
  guidelines: [GOLD_AECOPD, TARGET_SPO2, HEALTHIER_SG_COPD],
  pathway: [
    {
      id: 'ed-resus',
      department: 'ed',
      facility: 'ktph',
      durationMin: 30,
      costSGD: 240,
      charge: 'a&e',
      framing: {
        patient: { en: 'You can\'t finish a sentence. The mask hisses cool air.', zh: '你说话说不完一句。面罩里凉气在响。' },
        caregiver: { en: 'You tell the doctor he uses the blue inhaler more than the brown one.', zh: '你告诉医生他用蓝吸入器比棕色的更多。' },
        staff: { en: 'Hypoxic + dyspnoeic, likely CO2 retainer. ABG pending. Bundle the obvious moves NOW.', zh: '缺氧+气促,很可能是二氧化碳潴留者。动脉血气待出。立即上手最关键的措施。' },
      },
      decision: {
        id: 'first-bundle',
        prompt: { en: 'First 30 minutes — initial bundle?', zh: '最初30分钟 — 初始组合?' },
        weight: 1.5,
        reference: GOLD_AECOPD,
        options: [
          {
            id: 'venturi-bronch-pred',
            label: { en: 'Venturi 28% to target SpO2 88-92% + neb salbutamol + ipratropium + oral prednisolone 40 mg.', zh: 'Venturi面罩28%达SpO2 88-92%+雾化沙丁胺醇+异丙托溴铵+口服泼尼松龙40mg。' },
            score: 10,
            rationale: { en: 'Targeted oxygen avoids worsening hypercapnia; SABA+SAMA + early steroids is the evidence bundle.', zh: '目标氧避免加重高碳酸血症;SABA+SAMA联合+早期糖皮质激素是证据组合。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'nrb-15l',
            label: { en: 'Non-rebreather at 15 L/min until SpO2 ≥ 98%.', zh: '非重吸面罩15 L/min,直到SpO2≥98%。' },
            score: -6,
            rationale: { en: 'Over-oxygenation drives CO2 retention and respiratory acidosis. Target 88-92%.', zh: '过度给氧导致CO2潴留与呼吸性酸中毒。目标88-92%。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'wait-abg',
            label: { en: 'Wait for the ABG before any treatment.', zh: '等动脉血气结果再开始任何治疗。' },
            score: -4,
            rationale: { en: 'Treatment is clinical; ABG refines but does not gate the bundle.', zh: '治疗按临床判断;动脉血气用于精细调整,而非延迟启动。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'antibiotics',
      department: 'ed',
      facility: 'ktph',
      durationMin: 30,
      costSGD: 80,
      charge: 'a&e',
      framing: {
        patient: { en: 'Your sputum is green and you cough hard.', zh: '你的痰是绿色,咳得厉害。' },
        caregiver: { en: 'You mention he was febrile last night.', zh: '你提到他昨晚发热。' },
        staff: { en: 'Anthonisen criteria: increased dyspnoea + sputum volume + purulence — 3/3 cardinal symptoms.', zh: 'Anthonisen标准:气促加重+痰量增加+脓化 — 三项主征齐全。' },
      },
      decision: {
        id: 'abx-decision',
        prompt: { en: 'Antibiotics for this exacerbation?', zh: '本次加重是否给抗生素?' },
        weight: 1,
        reference: GOLD_AECOPD,
        options: [
          {
            id: 'amox-clav',
            label: { en: 'Amoxicillin-clavulanate × 5-7 days.', zh: '阿莫西林-克拉维酸5-7天。' },
            score: 10,
            rationale: { en: 'Anthonisen 2/3 criteria met (purulence + dyspnoea + sputum). Indicated.', zh: '满足Anthonisen 2/3项主征(脓化+气促+痰量增加),有适应症。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-abx',
            label: { en: 'No antibiotics — most AECOPDs are viral.', zh: '不给抗生素 — 多数AECOPD是病毒性的。' },
            score: -2,
            rationale: { en: 'A reasonable default for milder AECOPD, but this patient has full Anthonisen criteria.', zh: '在较轻AECOPD是合理默认,但本例满足Anthonisen标准。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'pip-tazo',
            label: { en: 'IV piperacillin-tazobactam.', zh: '静脉哌拉西林-他唑巴坦。' },
            score: 1,
            rationale: { en: 'Over-broad for a community AECOPD without sepsis/pseudomonal risk.', zh: '对社区AECOPD而言过广,无脓毒症或铜绿假单胞菌风险时不必。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'discharge',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 30,
      costSGD: 25,
      charge: 'polyclinic',
      framing: {
        patient: { en: 'You feel better. The nurse asks to see how you use your inhaler.', zh: '你感觉好些。护士让你示范怎么用吸入器。' },
        caregiver: { en: 'You realise he\'s been firing the inhaler too late after inhaling.', zh: '你发现他吸气后才按吸入器,时机太迟。' },
        staff: { en: 'Convalescent visit — close the inhaler-technique gap, build an action plan, refer rehab.', zh: '康复随访 — 纠正吸入装置使用、建立行动计划、转介康复。' },
      },
      decision: {
        id: 'continuity-plan',
        prompt: { en: 'Continuity plan to prevent the next exacerbation?', zh: '预防下次加重的连续性计划?' },
        weight: 1,
        reference: HEALTHIER_SG_COPD,
        options: [
          {
            id: 'full-plan',
            label: { en: 'Inhaler technique recheck + LAMA/LABA + pulmonary rehab + flu/pneumococcal vaccines + I-Quit + written action plan.', zh: '复核吸入装置+LAMA/LABA+肺康复+流感/肺炎球菌疫苗+I-Quit戒烟+书面行动计划。' },
            score: 10,
            rationale: { en: 'Each item is independently evidenced; together they prevent admissions.', zh: '每项独立循证;合用可减少住院。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'med-only',
            label: { en: 'Send him home with the steroid pack only.', zh: '只给类固醇就出院。' },
            score: 1,
            rationale: { en: 'Misses the readmission-prevention quartet.', zh: '错失预防再住院的关键组合。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
