import type { CaseDefinition } from '../../lib/types';

const WAO_ANAPHYLAXIS = {
  label: { en: 'WAO / Resus Council — Anaphylaxis 2024', zh: '世界过敏组织(WAO)/ 复苏委员会 — 过敏反应2024' },
  body: {
    en: 'IM adrenaline 0.5 mg (0.01 mg/kg, 1:1000) into the anterolateral thigh is the FIRST and most important action. Repeat every 5-10 min PRN. Antihistamines + steroids are adjuncts, NEVER substitutes. Observe biphasic risk.',
    zh: 'IM肌注肾上腺素0.5 mg(0.01 mg/kg,1:1000)注入大腿前外侧是最先且最重要的处理。每5-10分钟可重复。抗组胺与糖皮质激素是辅助,绝不能替代。注意双相反应风险。',
  },
};

const TWO_EPIPENS = {
  label: { en: 'Adrenaline auto-injector + safety-net', zh: '肾上腺素自注射器与安全网' },
  body: {
    en: 'Discharge with TWO auto-injectors (one fails ~20% of the time, needs replacing), a written allergy action plan, allergist referral, and explicit re-presentation criteria for biphasic reactions.',
    zh: '出院应配两支自注射器(单支约20%可能失败需替换)、书面过敏行动计划、过敏专科转介、明确双相反应再就诊标准。',
  },
};

const HSA_REPORT = {
  label: { en: 'HSA adverse drug reaction reporting', zh: 'HSA药物不良反应呈报' },
  body: {
    en: 'Health Sciences Authority Vigilance Branch — suspected drug-induced anaphylaxis should be reported (online or via hospital pharmacist) so the signal feeds the national label updates.',
    zh: '卫生科学局(HSA)药物警戒部 — 疑似药物诱导过敏反应应呈报(线上或通过医院药剂师),让信号纳入国家说明书更新。',
  },
};

export const anaphylaxisEdCase: CaseDefinition = {
  id: 'anaphylaxis-ed',
  title: {
    en: 'Anaphylaxis after IV antibiotic — minutes that matter',
    zh: '静脉抗生素后过敏反应 — 分秒必争',
  },
  blurb: {
    en: 'Ms Nurul, 28, given IV cefazolin in the day-surgery unit for a minor procedure. Within 4 minutes: urticaria, throat tightness, BP 78/40, SpO2 91%. Crash call to her side.',
    zh: 'Nurul女士,28岁,在日间手术单位因小手术静脉注射头孢唑啉。4分钟内出现荨麻疹、喉紧、血压78/40、SpO2 91%。立即广播呼救到她床旁。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'youngAdult',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 5,
    goalLabel: 'IM adrenaline within',
    missedFlag: 'adrenaline-delayed',
  },
  guidelines: [WAO_ANAPHYLAXIS, TWO_EPIPENS, HSA_REPORT],
  pathway: [
    {
      id: 'first-call',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 5,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: { en: 'Your throat is swelling. You feel everyone\'s urgency.', zh: '喉咙肿胀。你感觉到所有人的急切。' },
        caregiver: { en: 'You hear "anaphylaxis" and someone runs for a vial.', zh: '你听到"过敏性休克",有人冲去拿药。' },
        staff: { en: 'Anaphylaxis — multi-system involvement. The right first action is non-negotiable.', zh: '过敏性休克 — 多系统受累。第一步措施毫无商量余地。' },
      },
      decision: {
        id: 'first-action',
        prompt: { en: 'First action, right now?', zh: '此刻第一步?' },
        weight: 2,
        reference: WAO_ANAPHYLAXIS,
        options: [
          {
            id: 'im-adrenaline',
            label: { en: 'IM adrenaline 0.5 mg 1:1000 into the anterolateral thigh + position supine + O2 + IV access.', zh: 'IM肌注肾上腺素0.5 mg 1:1000至大腿前外侧+平卧+给氧+建立静脉。' },
            score: 10,
            rationale: { en: 'IM adrenaline is the single most important intervention; delay raises mortality. IV access while preparing fluids.', zh: 'IM肌注肾上腺素是最关键的单一干预;延迟增加死亡率。建立静脉同时准备补液。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'iv-adrenaline-bolus',
            label: { en: 'IV adrenaline 1 mg bolus.', zh: 'IV肾上腺素1 mg推注。' },
            score: -8,
            rationale: { en: 'IV bolus adrenaline at full code dose in a perfusing patient risks arrhythmia + hypertensive cerebrovascular events. IV adrenaline is reserved for refractory cases as a titrated infusion.', zh: '对仍有循环的病人按抢救剂量IV推注肾上腺素有心律失常与高血压脑血管事件风险。IV肾上腺素仅用于难治性病例,且为滴定输注。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'antihistamine-first',
            label: { en: 'IV hydrocortisone + chlorphenamine first; observe response.', zh: '先给IV氢化可的松+氯苯那敏;观察反应。' },
            score: -10,
            rationale: { en: 'Adjuncts BEFORE adrenaline is a classic, dangerous error. They do not reverse hypotension or airway oedema in time.', zh: '在肾上腺素前先用辅助药是经典且危险的错误,无法及时逆转低血压与气道水肿。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'stop-and-wait',
            label: { en: 'Stop the infusion and watch — she might settle.', zh: '停输液,观察 — 或许会自行缓解。' },
            score: -10,
            rationale: { en: 'Anaphylaxis can kill in minutes. "Watch and wait" is unsafe.', zh: '过敏性休克可在数分钟致死。"观察等待"不安全。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'stabilise',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 380,
      charge: 'a&e',
      framing: {
        patient: { en: 'Your face feels less tight. The BP cuff inflates again.', zh: '脸不那么紧了。血压袖带又开始充气。' },
        caregiver: { en: 'You ask how long she\'ll be watched.', zh: '你问要观察多久。' },
        staff: { en: 'Initial response good. Now adjuncts + biphasic-risk observation.', zh: '初步反应良好。现给辅助药+观察双相风险。' },
      },
      decision: {
        id: 'adjuncts',
        prompt: { en: 'Adjuncts + observation plan?', zh: '辅助药与观察计划?' },
        weight: 1,
        reference: WAO_ANAPHYLAXIS,
        options: [
          {
            id: 'fluids-steroids-obs',
            label: { en: 'IV crystalloid + IV hydrocortisone + non-sedating antihistamine + observe ≥ 6 h (12 h if biphasic risk).', zh: 'IV晶体液+IV氢化可的松+非镇静抗组胺+观察≥6小时(双相风险≥12小时)。' },
            score: 10,
            rationale: { en: 'Standard post-stabilisation bundle with appropriate observation window.', zh: '稳定后的标准组合,观察窗口合理。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-now',
            label: { en: 'Discharge in 30 min — she looks fine.', zh: '30分钟后出院 — 看起来没事。' },
            score: -6,
            rationale: { en: 'Biphasic reactions occur in up to 5%; minimum 4-6 h observation, longer if risk factors.', zh: '双相反应发生率可达5%;最短观察4-6小时,有危险因素时更长。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'discharge-plan',
      department: 'consult-room',
      facility: 'ttsh',
      durationMin: 20,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: { en: 'You hold the pens like grenades. The nurse drills the technique.', zh: '你像握手榴弹一样拿着自注射器。护士反复演示用法。' },
        caregiver: { en: 'You photograph the action-plan card.', zh: '你拍下行动计划卡。' },
        staff: { en: 'Discharge: drug allergy label, action plan, allergist follow-up, HSA report.', zh: '出院:药物过敏标签、行动计划、过敏专科随访、HSA呈报。' },
      },
      decision: {
        id: 'discharge-bundle',
        prompt: { en: 'Discharge bundle?', zh: '出院组合?' },
        weight: 1,
        reference: TWO_EPIPENS,
        options: [
          {
            id: 'two-pens-plan-hsa',
            label: { en: 'Two auto-injectors + written action plan + drug-allergy label in NEHR + allergist referral + HSA ADR report.', zh: '两支自注射器+书面行动计划+NEHR药物过敏标记+过敏专科转介+HSA不良反应呈报。' },
            score: 10,
            rationale: { en: 'Closes every loop: rescue therapy, communication, longitudinal workup, national signal.', zh: '闭合每一环:急救药物、沟通、纵向检查、国家层面信号。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'one-pen',
            label: { en: 'One auto-injector + verbal advice.', zh: '一支自注射器+口头交代。' },
            score: 2,
            rationale: { en: 'Single device has a real failure rate; written plan is needed for caregivers + future clinicians.', zh: '单支可能失效;书面计划对照护者与日后医师都必要。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
