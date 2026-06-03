import type { CaseDefinition } from '../../lib/types';

const PHARM_THROMB = {
  label: { en: 'Pharmaco-invasive STEMI strategy', zh: 'STEMI药物-介入综合策略' },
  body: {
    en: 'When primary PCI within 120 minutes of first medical contact is not feasible, fibrinolysis (tenecteplase) within 30 minutes of arrival, followed by transfer for early (2–24 h) angiography, beats waiting for PCI. ESC 2023 ACS.',
    zh: '若首次医疗接触120分钟内无法行直接PCI,应在到院30分钟内予溶栓(替奈普酶),随后转送行早期(2-24小时)冠脉造影,优于等待PCI。ESC 2023 ACS。',
  },
};

const SCDF_HEMS = {
  label: { en: 'SCDF inter-facility critical transfer', zh: 'SCDF院际危重转运' },
  body: {
    en: 'Inter-facility transfers for time-critical conditions use SCDF Critical Care Ambulance with a doctor/nurse escort. Pre-arrival activation of receiving cath lab + monitored escort cuts door-to-balloon.',
    zh: '时间紧迫的院际转运使用SCDF重症救护车并配医师/护士陪同。提前激活接收医院导管室+监护陪同可缩短门到球囊时间。',
  },
};

const STEMI_BLEEDING = {
  label: { en: 'Lytic contraindications + bleeding risk', zh: '溶栓禁忌与出血风险' },
  body: {
    en: 'Absolute contraindications include any prior intracranial haemorrhage, recent ischaemic stroke <3 mo, active bleeding, suspected aortic dissection. Age >75 favours half-dose tenecteplase.',
    zh: '绝对禁忌:既往任何颅内出血、近3个月内缺血性中风、活动性出血、疑似主动脉夹层。年龄>75岁应使用半量替奈普酶。',
  },
};

export const stemiRuralThrombolysisCase: CaseDefinition = {
  id: 'stemi-rural-thrombolysis',
  title: {
    en: 'STEMI at an offshore clinic — pharmaco-invasive transfer',
    zh: '近海诊所STEMI — 药物-介入策略转送',
  },
  blurb: {
    en: 'Mr Tan, 58, on a 6-month rotation at the small Pulau Ubin GP clinic. Crushing chest pain x 40 min, diaphoretic. ECG: inferior + RV STEMI. The nearest cathlab (CGH) is 95 minutes away by boat + ambulance.',
    zh: '陈先生,58岁,在乌敏岛小诊所轮调6个月。胸痛压榨感40分钟、大汗。心电图:下壁+右室STEMI。最近的导管室(CGH)由船+救护车需95分钟。',
  },
  category: 'acute',
  primaryFacility: 'cgh',
  involvedFacilities: ['cgh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 30,
    goalLabel: 'Lytic decision by',
    missedFlag: 'reperfusion-delayed',
  },
  guidelines: [PHARM_THROMB, SCDF_HEMS, STEMI_BLEEDING],
  pathway: [
    {
      id: 'island-decision',
      department: 'gp-room',
      facility: 'cgh',
      durationMin: 15,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: { en: 'Pain is bad. They show you the ECG strip. Boat or needle, they ask.', zh: '剧痛。他们把心电图给你看。问你:坐船还是打针。' },
        caregiver: { en: 'You speak to the nurse on the line. Time is muscle.', zh: '你与护士通话。时间就是心肌。' },
        staff: { en: 'Inferior + RV STEMI. PCI window is 120 min FMC-to-device. Transfer takes 95 min. Lytic + transfer is the strategy.', zh: '下壁+右室STEMI。PCI窗口为首次医疗接触至器械120分钟。转送需95分钟。溶栓+转送是策略。' },
      },
      decision: {
        id: 'reperfusion',
        prompt: { en: 'Reperfusion strategy on the island?', zh: '岛上的再灌注策略?' },
        weight: 2,
        reference: PHARM_THROMB,
        options: [
          {
            id: 'lytic-then-pci',
            label: { en: 'Tenecteplase now (age-adjusted) + activate SCDF transfer to CGH cath lab; pre-notify.', zh: '现在予替奈普酶(按年龄调整)+ 启动SCDF转送至CGH导管室;提前通知。' },
            score: 10,
            rationale: { en: 'Pharmaco-invasive strategy: clot now, definitive PCI within 2-24 h. Best outcome when PCI window is exceeded.', zh: '药物-介入策略:先溶栓,2-24小时内行确定性PCI。在PCI窗口超出时获益最大。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'transfer-only',
            label: { en: 'Skip lytic; transfer directly for primary PCI.', zh: '不溶栓;直接转送做直接PCI。' },
            score: 2,
            rationale: { en: 'Wastes the reperfusion window. PCI > 120 min FMC-to-device favours lytic-first.', zh: '浪费再灌注窗口。首次医疗接触至器械>120分钟时,应先溶栓。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'full-dose-elderly',
            label: { en: 'Full-dose tenecteplase regardless of age.', zh: '不考虑年龄,全量替奈普酶。' },
            score: 4,
            rationale: { en: '>75 y warrants half-dose to reduce intracranial bleed risk; this patient is 58, full dose is fine — but the principle should be remembered.', zh: '>75岁应用半量降低颅内出血风险;本例58岁可全量,但原则需牢记。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'observe',
            label: { en: 'Observe — pain may settle.', zh: '观察 — 可能自行缓解。' },
            score: -10,
            rationale: { en: 'STEMI does not self-resolve safely. Catastrophic.', zh: 'STEMI不会安全自行缓解。灾难性后果。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'arrival-cgh',
      department: 'cathlab',
      facility: 'cgh',
      durationMin: 95,
      costSGD: 9500,
      charge: 'inpatient-procedure',
      framing: {
        patient: { en: 'You\'re in a moving box of beeps. Someone\'s hand on your wrist.', zh: '你在一个会响的移动箱里。有人按着你的手腕。' },
        caregiver: { en: 'You meet the ambulance at the jetty.', zh: '你在码头接救护车。' },
        staff: { en: 'CGH cath lab activated, ECG resolved — successful lysis. Plan early angio.', zh: 'CGH导管室已激活,心电图回落 — 溶栓成功。计划早期造影。' },
      },
      decision: {
        id: 'post-lytic-window',
        prompt: { en: 'Post-lytic angiography window?', zh: '溶栓后造影时机?' },
        weight: 1,
        reference: PHARM_THROMB,
        options: [
          {
            id: 'two-to-24',
            label: { en: 'Angiogram within 2-24 h regardless of resolution.', zh: '无论缓解情况,2-24小时内造影。' },
            score: 10,
            rationale: { en: 'Routine early angio after lysis reduces re-infarction (STREAM, EARLY-MYO).', zh: '溶栓后常规早期造影减少再梗死(STREAM、EARLY-MYO)。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'rescue-only',
            label: { en: 'Only catheterise if lysis fails clinically.', zh: '只在临床溶栓失败时才造影。' },
            score: 3,
            rationale: { en: 'Outdated. Even successful lysis benefits from routine early invasive assessment.', zh: '已过时。即使溶栓成功,常规早期介入仍获益。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
