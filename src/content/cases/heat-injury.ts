import type { CaseDefinition } from '../../lib/types';

const SAF_HEAT_PROTOCOL = {
  label: {
    en: 'SAF Heat-Injury Prevention & Response',
    zh: '新加坡武装部队中暑预防与处置流程',
  },
  body: {
    en: 'WBGT-based activity-modification matrix; mandatory cool-first-transport-second for exertional heat injury (EHI); cold-water / ice-sheet immersion before evacuation; SAF medical-orderly chain to a designated receiving hospital (TTSH / CGH / NUH by location).',
    zh: '依据WBGT(湿球黑球温度)的活动调整矩阵;运动型中暑(EHI)采"先降温、再后送"原则;后送前先冷水或冰被降温;武装部队医勤链送至按区域指定的接收医院(TTSH/CGH/NUH)。',
  },
};

const MOH_EHI_CPG = {
  label: {
    en: 'MOH / Society of Emergency Medicine Singapore — Exertional heat injury',
    zh: '卫生部 / 新加坡急诊医学会 — 运动型中暑指南',
  },
  body: {
    en: 'Diagnose by core temperature >40°C plus CNS dysfunction in an exerting patient. Cool to <39°C within 30 minutes — cold-water immersion is gold standard. Then assess for rhabdomyolysis (CK), AKI, DIC, hepatic injury, ARDS. ICU for multi-organ failure.',
    zh: '诊断标准:运动者核心体温>40°C合并中枢神经功能障碍。30分钟内降温至<39°C — 冷水浸泡为金标准。随后评估横纹肌溶解(CK)、急性肾损伤、弥散性血管内凝血、肝损伤、急性呼吸窘迫综合征。多器官衰竭须ICU。',
  },
};

const RTU_PROTOCOL = {
  label: {
    en: 'SAF Return-to-Unit (RTU) and graded re-exposure',
    zh: '武装部队回归单位(RTU)与逐步再暴露',
  },
  body: {
    en: 'After EHI: medical board, light duties 4–6 weeks, heat-tolerance test before return to outdoor PT, and SAF Heat Stress Programme close monitoring. Premature RTU has caused fatalities; documented in COI reports.',
    zh: '中暑后:医评、4-6周轻便勤务、户外训练前需通过耐热试验,并加入SAF热应激监控计划。过早RTU曾造成死亡(调查委员会报告记载)。',
  },
};

export const heatInjuryCase: CaseDefinition = {
  id: 'heat-injury',
  title: {
    en: 'Exertional heat injury — SAF training → TTSH ED → ICU',
    zh: '运动型中暑 — SAF训练 → TTSH急诊 → ICU',
  },
  blurb: {
    en: 'CPL Tan, 22, full-time NSF. Collapsed during 8km route march, WBGT 31.2°C. Co-trainees noted slurred speech and unsteady gait before he fell. SAF medical orderly on scene; ambient time of collapse 11:18am.',
    zh: '陈下士,22岁,全职国民服役人员。8公里行军中倒下,湿球黑球温度31.2°C。倒下前同袍发现他口齿不清、步态不稳。现场有武装部队医勤;倒下时间上午11:18。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 30,
    goalLabel: 'Cool to <39°C by',
    missedFlag: 'cooling-delayed',
  },
  guidelines: [SAF_HEAT_PROTOCOL, MOH_EHI_CPG, RTU_PROTOCOL],
  pathway: [
    {
      id: 'field-cooling',
      department: 'triage',
      facility: 'ttsh',
      durationMin: 12,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'You don\'t remember collapsing. You feel hot, sick, confused, your skin is burning. Voices are far away.',
          zh: '你不记得自己倒下。觉得发烫、恶心、迷糊,皮肤像烧着。周围声音遥远。',
        },
        caregiver: {
          en: 'You are the section commander. Your trainee is on the ground, eyes rolled back, twitching. Medical orderly opens the cold-water immersion kit.',
          zh: '你是班长。受训员倒地,眼上翻、抽搐。医勤打开冷水浸泡装备。',
        },
        staff: {
          en: 'SAF medical orderly: tympanic temp 41.6°C, GCS 12, RR 28, HR 132. Cold-water immersion tub on site. Pre-evacuation cooling indicated.',
          zh: '武装部队医勤:鼓膜温41.6°C,GCS 12,呼吸28,心率132。现场有冷水浸泡桶。后送前先降温。',
        },
      },
      decision: {
        id: 'cool-first',
        prompt: {
          en: 'Pre-evacuation action at the training area?',
          zh: '训练场后送前的处置?',
        },
        reference: SAF_HEAT_PROTOCOL,
        weight: 2,
        options: [
          {
            id: 'immerse-then-evac',
            label: {
              en: 'Cold-water immersion until temp <39°C (or 15 min), then evacuate by SAF ambulance to TTSH ED.',
              zh: '冷水浸泡至体温<39°C(或15分钟),再由武装部队救护车送TTSH急诊。',
            },
            score: 4,
            rationale: {
              en: 'SAF cool-first-transport-second protocol. On-site cooling saves lives; 30-min mortality window matters more than transport speed.',
              zh: '武装部队"先降温、再后送"原则。现场降温救命;30分钟降温窗口比后送速度更重要。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'rush-to-ed',
            label: {
              en: 'Skip immersion; rush to ED for in-hospital cooling.',
              zh: '不浸泡,直接后送急诊在院内降温。',
            },
            score: -4,
            rationale: {
              en: 'Transport delay = brain injury. Field cooling is the largest survival lever for EHI.',
              zh: '后送延迟=脑损伤。现场降温是中暑最关键的救命措施。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'iv-paracetamol',
            label: {
              en: 'IV paracetamol and let the body cool gradually.',
              zh: '静脉扑热息痛,让体温自然下降。',
            },
            score: -3,
            rationale: {
              en: 'Antipyretics do not work for exertional heat injury — set-point is normal, the problem is heat-clearance failure.',
              zh: '退烧药对运动型中暑无效 — 体温调定点正常,问题在散热失败。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'ed-workup',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 90,
      costSGD: 420,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'You wake up in a cold trolley with cooling blankets. Your urine bag is dark red-brown. Everything aches.',
          zh: '你在覆盖降温毯的推车上醒来。尿袋里是深红棕色。全身酸痛。',
        },
        caregiver: {
          en: 'Mother is on her way; SAF medical officer at bedside. They explain the cooling worked but kidneys may be hurt.',
          zh: '母亲赶来途中;武装部队军医陪床。解释降温有效,但肾脏可能受损。',
        },
        staff: {
          en: 'Core temp now 38.4°C. CK 18,000, creatinine 220, ALT 410, K+ 5.8. Rhabdomyolysis + AKI + transaminitis. Disposition?',
          zh: '核心体温38.4°C。CK 18,000,肌酐220,ALT 410,钾5.8。横纹肌溶解+急性肾损伤+肝酶升高。处置?',
        },
      },
      decision: {
        id: 'icu-or-ward',
        prompt: {
          en: 'Disposition with rhabdo + AKI?',
          zh: '横纹肌溶解+急性肾损伤的处置?',
        },
        reference: MOH_EHI_CPG,
        weight: 2,
        options: [
          {
            id: 'micu',
            label: {
              en: 'MICU; aggressive IV crystalloid to urine output 200–300 mL/h; correct K+ urgently; serial CK and renal function.',
              zh: '内科ICU;静脉晶体液目标尿量200-300 mL/h;紧急纠正高钾;连续监测CK和肾功能。',
            },
            score: 4,
            rationale: {
              en: 'Multi-organ involvement + hyperkalaemia after EHI = ICU monitoring. Volume status drives renal recovery.',
              zh: '中暑后多器官受累+高钾血症 = ICU监测。容量状态决定肾脏恢复。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'general-ward-fluid',
            label: {
              en: 'General ward; oral hydration + IV maintenance; daily bloods.',
              zh: '普通病房;口服补液+静脉维持;每日抽血。',
            },
            score: -2,
            rationale: {
              en: 'K+ 5.8 + CK 18k + creatinine 220 is too unstable for ward-level care.',
              zh: '钾5.8+CK 18,000+肌酐220过于不稳定,病房不适合。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-home',
            label: {
              en: 'Discharge once temp normal; outpatient bloods.',
              zh: '体温降至正常即出院;门诊抽血。',
            },
            score: -4,
            rationale: {
              en: 'Untreated rhabdo can cause anuric AKI and lethal hyperkalaemia. Discharge is unsafe.',
              zh: '未处理的横纹肌溶解可致无尿性急性肾损伤与致死性高钾血症,出院极不安全。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'rtu-decision',
      department: 'consult-room',
      facility: 'ttsh',
      durationMin: 30,
      costSGD: 0,
      charge: 'soc',
      framing: {
        patient: {
          en: 'Five days later you are stepping down. The SAF medical officer asks about returning to your unit.',
          zh: '5天后准备转出。武装部队军医问及回归单位事宜。',
        },
        caregiver: {
          en: 'Your son tells you the unit is short of men for an upcoming exercise. The doctor asks for your view on his fitness.',
          zh: '儿子告诉你单位即将演习人手不够。医生问你对他体能的看法。',
        },
        staff: {
          en: 'Kidneys recovered, CK trending down. Heat-tolerance testing not yet done. SAF heat-injury rehab pathway: light duties 4–6 weeks before retest.',
          zh: '肾功能恢复,CK下降。耐热试验尚未进行。SAF中暑康复路径:4-6周轻便勤务后再测。',
        },
      },
      decision: {
        id: 'return-to-unit',
        prompt: {
          en: 'Return-to-unit plan?',
          zh: '回归单位计划?',
        },
        reference: RTU_PROTOCOL,
        weight: 1.5,
        options: [
          {
            id: 'light-duties-rehab',
            label: {
              en: 'Light duties 4–6 weeks; complete SAF Heat Stress Programme; heat-tolerance test before any outdoor PT.',
              zh: '4-6周轻便勤务;完成SAF热应激计划;户外训练前先通过耐热试验。',
            },
            score: 3,
            rationale: {
              en: 'SAF-mandated graded re-exposure with documented tolerance testing. Prevents repeat EHI fatality.',
              zh: 'SAF规定的逐步再暴露并须通过耐热试验。预防再次中暑致死。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'rapid-rtu',
            label: {
              en: 'Return to full duties this week; unit short of men.',
              zh: '本周回归全部勤务;单位缺人。',
            },
            score: -3,
            rationale: {
              en: 'Premature RTU has caused subsequent EHI deaths (COI reports). Operational pressure does not override safety.',
              zh: '过早RTU曾导致再次中暑死亡(调查报告记载)。任务压力不能凌驾安全。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'permanent-downgrade',
            label: {
              en: 'Permanent downgrade; no outdoor activity for the rest of NS.',
              zh: '永久降等;余下国民服役期间不再户外活动。',
            },
            score: 0,
            rationale: {
              en: 'Most EHI patients regain heat tolerance with graded re-exposure. Blanket permanent downgrade is over-restrictive without a failed test.',
              zh: '多数中暑患者经逐步再暴露可恢复耐热。未做不及格试验即永久降等过于保守。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
