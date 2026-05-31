import type { CaseDefinition } from '../../lib/types';

const HEART_SCORE = {
  label: { en: 'HEART score for chest pain', zh: '胸痛HEART评分' },
  body: {
    en: 'Risk-stratifies undifferentiated chest pain (History, ECG, Age, Risk factors, Troponin). 0-3 low (outpatient/early discharge), 4-6 moderate (observe + serial troponin), ≥7 high (admit, early invasive). Use it to route, not to override a STEMI on ECG.',
    zh: 'HEART评分对未分化胸痛进行风险分层(病史、心电图、年龄、危险因素、肌钙蛋白)。0-3低危(门诊/早期出院),4-6中危(观察+连续肌钙蛋白),≥7高危(收治、早期介入)。用于分流,但不能凌驾心电图上的STEMI。',
  },
};

const ESC_ACS = {
  label: { en: 'ESC 2023 ACS Guidelines', zh: '欧洲心脏病学会2023急性冠脉综合征指南' },
  body: {
    en: 'STEMI on ECG → immediate primary PCI activation. NSTE-ACS → risk-guided invasive timing. Non-ischaemic chest pain → safety-net + outpatient workup.',
    zh: '心电图STEMI → 立即启动直接PCI。非ST段抬高ACS → 按风险决定介入时机。非缺血性胸痛 → 安全网+门诊检查。',
  },
};

const SAFETY_NET = {
  label: { en: 'Discharge safety-netting', zh: '出院安全网' },
  body: {
    en: 'Even a reassuring workup needs explicit return advice, a documented diagnosis, and a follow-up plan. Missed ACS is a leading cause of medico-legal harm.',
    zh: '即使检查令人安心,也需明确的复诊建议、记录诊断和随访计划。漏诊ACS是医疗法律风险的主要来源。',
  },
};

export const chestPainTriageCase: CaseDefinition = {
  id: 'chest-pain-triage',
  title: {
    en: 'Undifferentiated chest pain — a branching triage',
    zh: '未分化胸痛 — 分叉式分流',
  },
  blurb: {
    en: 'Mr Tan, 58, taxi driver, walks into the ED with 40 minutes of central chest tightness, now easing. One ECG, one set of obs, one decision that forks the whole pathway. Where you route him depends on what you find.',
    zh: '陈先生,58岁,德士司机,走入急诊,主诉胸骨后压迫感40分钟,现已缓解。一份心电图、一组生命体征、一个让整条路径分叉的决定。把他分流到哪里,取决于你的发现。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [HEART_SCORE, ESC_ACS, SAFETY_NET],
  pathway: [
    {
      id: 'triage',
      department: 'triage',
      facility: 'ttsh',
      durationMin: 15,
      costSGD: 130,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'The pain is fading now. You wonder if you wasted everyone\'s time.',
          zh: '疼痛正在消退。你怀疑自己是不是浪费了大家的时间。',
        },
        caregiver: {
          en: 'Your husband downplays it. You insisted he come.',
          zh: '你丈夫轻描淡写。是你坚持让他来的。',
        },
        staff: {
          en: 'The ECG is in your hand; obs and a focused history will set the whole route. Read the ECG first.',
          zh: '心电图就在你手中;生命体征和重点病史将决定整条路径。先看心电图。',
        },
      },
      decision: {
        id: 'stratify',
        prompt: {
          en: 'The ECG shows 2 mm ST-elevation in II, III, aVF. How do you route him?',
          zh: '心电图显示II、III、aVF导联ST段抬高2 mm。如何分流?',
        },
        weight: 2,
        reference: ESC_ACS,
        options: [
          {
            id: 'route-stemi',
            label: { en: 'Inferior STEMI — activate the cathlab now.', zh: '下壁STEMI — 立即启动导管室。' },
            score: 10,
            nextNode: 'stemi-path',
            effects: { setFlags: ['route-stemi'] },
            rationale: {
              en: 'ST-elevation in two contiguous inferior leads is a STEMI until proven otherwise — primary PCI, not a HEART score. Reperfusion time is muscle.',
              zh: '两个相邻下壁导联ST段抬高即视为STEMI — 直接PCI,而非HEART评分。再灌注时间就是心肌。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'route-obs',
            label: { en: 'Treat as moderate-risk — observe with serial troponin.', zh: '按中危处理 — 观察并连续肌钙蛋白。' },
            score: 1,
            nextNode: 'obs-path',
            effects: { setFlags: ['route-obs', 'stemi-missed'] },
            rationale: {
              en: 'This misreads a clear STEMI as undifferentiated chest pain. Serial troponin wastes the reperfusion window — inferior STEMI needs the cathlab now.',
              zh: '这把明确的STEMI误判为未分化胸痛。连续肌钙蛋白浪费再灌注窗口 — 下壁STEMI需立即导管室。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'route-discharge',
            label: { en: 'Pain resolved — discharge with a GP letter.', zh: '疼痛已缓解 — 开转介信让其回家。' },
            score: -10,
            nextNode: 'discharge-path',
            effects: { setFlags: ['route-discharge', 'stemi-missed'] },
            rationale: {
              en: 'Discharging an active STEMI is catastrophic. Resolution of pain does not undo ECG ST-elevation.',
              zh: '让活动性STEMI出院是灾难性的。疼痛缓解不能抵消心电图ST段抬高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    // ── Branch A: STEMI ────────────────────────────────────────────────
    {
      id: 'stemi-path',
      department: 'cathlab',
      facility: 'ttsh',
      durationMin: 45,
      costSGD: 8000,
      charge: 'inpatient-procedure',
      requiresAnyFlag: ['route-stemi'],
      framing: {
        patient: { en: 'They move fast now. A lot of hands.', zh: '他们动作很快,很多双手。' },
        caregiver: { en: 'Someone explains the wires and the risk. You sign.', zh: '有人解释导丝与风险。你签了字。' },
        staff: { en: 'Cathlab activated. Door-to-balloon clock running.', zh: '导管室已启动。门到球囊时间开始计时。' },
      },
      decision: {
        id: 'stemi-access',
        prompt: { en: 'Access + antiplatelet for primary PCI?', zh: '直接PCI的入路与抗血小板?' },
        weight: 1.5,
        reference: ESC_ACS,
        options: [
          {
            id: 'radial-prasugrel',
            label: { en: 'Radial access + aspirin & prasugrel loading.', zh: '桡动脉入路 + 阿司匹林与普拉格雷负荷。' },
            score: 10,
            nextNode: 'disposition',
            rationale: {
              en: 'Radial lowers bleeding/mortality vs femoral; prasugrel preferred over ticagrelor for PCI (ESC 2023, ISAR-REACT 5).',
              zh: '桡动脉较股动脉降低出血与死亡;PCI首选普拉格雷优于替格瑞洛(ESC 2023,ISAR-REACT 5)。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'femoral-clopidogrel',
            label: { en: 'Femoral access + clopidogrel.', zh: '股动脉入路 + 氯吡格雷。' },
            score: 5,
            nextNode: 'disposition',
            rationale: {
              en: 'Works, but femoral carries higher bleeding risk and clopidogrel is a weaker P2Y12 inhibitor for primary PCI.',
              zh: '可行,但股动脉出血风险更高,氯吡格雷在直接PCI中抑制作用较弱。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    // ── Branch B: Observation ──────────────────────────────────────────
    {
      id: 'obs-path',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 360,
      costSGD: 900,
      charge: 'inpatient-ward',
      requiresAnyFlag: ['route-obs'],
      framing: {
        patient: { en: 'Hours pass on a trolley. More blood tests.', zh: '在推车上过了几个小时,又抽了血。' },
        caregiver: { en: 'You wait. The second troponin is the one that matters, they say.', zh: '你等着。他们说第二次肌钙蛋白才是关键。' },
        staff: { en: 'Serial troponin rising. The "moderate-risk" label is unravelling — this was an evolving infarct.', zh: '连续肌钙蛋白上升。"中危"标签正在瓦解 — 这是进展中的梗死。' },
      },
      decision: {
        id: 'obs-rescue',
        prompt: { en: 'Troponin is now positive and climbing. Next?', zh: '肌钙蛋白现已阳性且上升。下一步?' },
        weight: 1.5,
        reference: ESC_ACS,
        options: [
          {
            id: 'late-cath',
            label: { en: 'Escalate to the cathlab now (delayed, but right).', zh: '立即升级至导管室(虽延迟,但正确)。' },
            score: 8,
            nextNode: 'disposition',
            rationale: {
              en: 'Recover what you can — late reperfusion still beats none, but the delay cost myocardium. The lesson: a STEMI ECG should never have been routed to observation.',
              zh: '尽量挽回 — 延迟再灌注仍优于不灌注,但延迟损失了心肌。教训:STEMI心电图本不该被分流去观察。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'keep-observing',
            label: { en: 'Keep observing; recheck in 3 hours.', zh: '继续观察;3小时后复查。' },
            score: -6,
            nextNode: 'disposition',
            rationale: {
              en: 'Compounds the original error. A rising troponin with prior ST-elevation demands immediate reperfusion.',
              zh: '在原错误上雪上加霜。肌钙蛋白上升合并先前ST段抬高,须立即再灌注。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    // ── Branch C: Wrongful discharge ───────────────────────────────────
    {
      id: 'discharge-path',
      department: 'discharge',
      facility: 'ttsh',
      durationMin: 20,
      costSGD: 0,
      charge: 'a&e',
      requiresAnyFlag: ['route-discharge'],
      framing: {
        patient: { en: 'You go home relieved. By evening the pain is back, worse.', zh: '你松了口气回家。到了傍晚,疼痛又来了,更重。' },
        caregiver: { en: 'You call 995 when he goes grey and clammy.', zh: '他面色发灰、冷汗淋漓时,你拨打了995。' },
        staff: { en: '(Care review): the patient re-presents in cardiogenic shock. The discharge ECG showed a STEMI.', zh: '(病例回顾):患者以心源性休克再就诊。出院时的心电图本就显示STEMI。' },
      },
      decision: {
        id: 'discharge-rescue',
        prompt: { en: 'He returns by ambulance, now in shock. What now?', zh: '他由救护车送回,已休克。下一步?' },
        weight: 1.5,
        reference: ESC_ACS,
        options: [
          {
            id: 'cath-shock',
            label: { en: 'Emergency PCI + shock management; activate the team.', zh: '急诊PCI+休克管理;启动团队。' },
            score: 7,
            nextNode: 'disposition',
            rationale: {
              en: 'Salvage what remains. Outcomes are far worse than a timely first-visit PCI — the cost of the missed ECG.',
              zh: '尽量挽救。结局远差于及时的首诊PCI — 这是漏看心电图的代价。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'conservative-shock',
            label: { en: 'Medical therapy only; too high-risk for the lab.', zh: '仅药物治疗;认为风险太高不进导管室。' },
            score: -4,
            nextNode: 'disposition',
            rationale: {
              en: 'Cardiogenic shock from STEMI is an indication FOR revascularisation, not against it (SHOCK trial).',
              zh: 'STEMI所致心源性休克是血运重建的适应症,而非禁忌(SHOCK试验)。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    // ── Reconvergence: every branch lands here ─────────────────────────
    {
      id: 'disposition',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 200,
      charge: 'inpatient-ward',
      framing: {
        patient: {
          en: 'It is quieter now. Someone sits down to explain what happens next.',
          zh: '现在安静下来了。有人坐下来解释接下来会怎样。',
        },
        caregiver: { en: 'You finally get to ask your questions.', zh: '你终于能问出你的问题了。' },
        staff: {
          en: 'Whatever the route here, the same discharge discipline applies: documented diagnosis, secondary prevention, cardiac rehab, and safety-netting.',
          zh: '无论经由哪条路径到此,同样的出院纪律适用:记录诊断、二级预防、心脏康复与安全网。',
        },
      },
      decision: {
        id: 'safety-net',
        prompt: { en: 'Discharge / continuity plan?', zh: '出院 / 连续性计划?' },
        weight: 1,
        reference: SAFETY_NET,
        options: [
          {
            id: 'full-plan',
            label: {
              en: 'Secondary-prevention quartet + cardiac rehab referral + Healthier-SG GP + explicit return advice.',
              zh: '二级预防四联 + 心脏康复转介 + Healthier SG家庭医生 + 明确复诊建议。',
            },
            score: 10,
            rationale: {
              en: 'Closes the loop regardless of the route taken: meds, rehab, primary-care continuity, and red-flag advice.',
              zh: '无论走哪条路径都能闭环:药物、康复、基层连续性与危险征兆建议。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'meds-only',
            label: { en: 'Medications only; no rehab or follow-up.', zh: '仅给药;不安排康复或随访。' },
            score: 2,
            rationale: {
              en: 'Drugs without rehab + continuity leaves a third of the benefit on the table and risks non-adherence.',
              zh: '只给药而无康复与连续性,会损失约三分之一的获益并增加不依从风险。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
