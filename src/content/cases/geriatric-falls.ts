import type { CaseDefinition } from '../../lib/types';

const FRAILTY = {
  label: { en: 'AIC Frailty Pathway', zh: 'AIC衰弱诊疗路径' },
  body: {
    en: 'Singapore Agency for Integrated Care frailty assessment and intervention pathway.',
    zh: '新加坡医疗关怀机构(AIC)对衰弱评估及干预的诊疗路径。',
  },
};

const NICE_FALLS = {
  label: { en: 'NICE CG161 — Falls in older people', zh: 'NICE CG161 — 老年人跌倒' },
  body: {
    en: 'Multifactorial falls risk assessment, strength and balance training, home safety review.',
    zh: '多因素跌倒风险评估、力量与平衡训练、居家安全检视。',
  },
};

const AHHOME = {
  label: { en: 'AH@Home Virtual Ward', zh: 'AH@Home 居家虚拟病房' },
  body: {
    en: 'Alexandra Hospital virtual-ward programme — hospital-level acute care delivered at home with home visits and remote monitoring.',
    zh: '亚历山大医院(AH)虚拟病房计划 — 在家中提供医院级别的急性照护,辅以上门访视与远程监测。',
  },
};

export const geriatricFallsCase: CaseDefinition = {
  id: 'geriatric-falls',
  title: {
    en: 'Falls + frailty — 81 y/o uncle, repeated falls, AH@Home pathway',
    zh: '跌倒与衰弱 — 81岁伯伯,反复跌倒,AH@Home路径',
  },
  blurb: {
    en: 'Mr Chua, 81. Lives alone in a 4-room HDB. Three falls in 6 months. Latest fall last night — bruising, no fracture on AH ED radiographs. AH@Home virtual ward offered.',
    zh: '蔡伯伯,81岁,独居于四房式组屋。6个月内跌倒三次。昨晚再次跌倒 — 仅瘀伤,AH急诊X光未见骨折。建议加入AH@Home居家虚拟病房。',
  },
  category: 'acute',
  primaryFacility: 'ah',
  involvedFacilities: ['scdf', 'ah', 'home', 'slh', 'shp-bukit-merah'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [FRAILTY, NICE_FALLS, AHHOME],
  pathway: [
    {
      id: 'ah-ed',
      department: 'ed',
      facility: 'ah',
      durationMin: 60,
      costSGD: 240,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 4, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(bruise on the right hip, walking with a slow shuffle.)',
          zh: '(右髋有瘀伤,行走拖步缓慢。)',
        },
        caregiver: {
          en: 'Your daughter takes leave; she doesn\'t live with you.',
          zh: '女儿请假赶来;她并不和你同住。',
        },
        staff: {
          en: 'AH ED: no fracture; postural hypotension; polypharmacy (8 meds); CFS 5 (mild frailty).',
          zh: 'AH急诊:无骨折;体位性低血压;多药并用(8种);临床衰弱量表(CFS)5级 — 轻度衰弱。',
        },
      },
      decision: {
        id: 'admit-or-aatomh',
        prompt: {
          en: 'Stable; could be admitted or sent on AH@Home pathway. Which?',
          zh: '生命体征稳定;可收住院,也可走AH@Home路径。选哪个?',
        },
        weight: 1.5,
        reference: AHHOME,
        options: [
          {
            id: 'ah-at-home',
            label: {
              en: 'AH@Home virtual ward: home visits + remote monitoring + medication review at home.',
              zh: 'AH@Home居家虚拟病房:上门访视 + 远程监测 + 在家进行用药复核。',
            },
            score: 10,
            rationale: {
              en: "Right setting for a fragile community-dwelling senior; reduces hospital-acquired risks and supports independence.",
              zh: '对体弱、社区居住的长者最合适;减少院内获得性风险,并支持独立生活。',
            },
            outcome: {
              patient: {
                en: '(home that evening, with a kit on the kitchen table.)',
                zh: '(当晚回家,厨房桌上摆着一套居家照护配件。)',
              },
              caregiver: {
                en: 'You take the next 3 days off; the team visits twice.',
                zh: '你请了三天假;团队两次上门访视。',
              },
              staff: {
                en: 'AH@Home enrolled; vitals app paired.',
                zh: 'AH@Home已登记;生命体征App已配对。',
              },
            },
          },
          {
            id: 'admit-ward',
            label: {
              en: 'Admit to AH geriatric ward for full inpatient frailty work-up.',
              zh: '收入AH老年病房进行完整的衰弱评估。',
            },
            score: 7,
            rationale: {
              en: 'Reasonable for complex frailty; risks deconditioning. AH@Home achieves much of the same with better outcomes for many.',
              zh: '对复杂衰弱合理,但有住院失用风险。多数情况下AH@Home能达到类似目标且结局更好。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-no-plan',
            label: { en: 'Discharge home with GP follow-up.', zh: '让其回家,交家庭医生跟进。' },
            score: 2,
            rationale: {
              en: 'Misses falls intervention package; high recurrence risk.',
              zh: '错过跌倒干预方案;复发风险高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'home-visit-1',
      department: 'treatment-room',
      facility: 'home',
      durationMin: 90,
      costSGD: 220,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 2 },
      framing: {
        patient: {
          en: 'A nurse shows you how to use the app and the BP machine.',
          zh: '护士示范如何使用App和血压机。',
        },
        caregiver: {
          en: 'You take notes; you photograph every prescription.',
          zh: '你做笔记,把每张处方都拍下来。',
        },
        staff: {
          en: 'Home visit: medication reconciliation; rationalised from 8 to 5 meds. Identifies a loose rug and missing grab-rails.',
          zh: '上门访视:用药核对,从8种精简至5种。发现一块松动的地毯,以及缺少扶手。',
        },
      },
      decision: {
        id: 'falls-intervention',
        prompt: {
          en: 'Multifactorial falls intervention components — pick best package.',
          zh: '多因素跌倒干预 — 选最佳组合方案。',
        },
        weight: 1.2,
        reference: NICE_FALLS,
        options: [
          {
            id: 'all-bundle',
            label: {
              en: 'Strength + balance program; OT home modifications; vitamin D + calcium check; BP standing-and-supine review; deprescribing; vision check via SNEC referral.',
              zh: '力量+平衡训练;职能治疗师上门改造居家环境;查维生素D和钙;立位与卧位血压评估;减药(deprescribing);转介SNEC检查视力。',
            },
            score: 10,
            rationale: {
              en: 'Multifactorial bundle is what works in older adults — single interventions less effective.',
              zh: '老年人跌倒预防需多因素整体方案 — 单一干预效果有限。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'exercise-only',
            label: { en: 'Exercise program only.', zh: '仅安排运动训练。' },
            score: 5,
            rationale: {
              en: 'Helpful but misses environmental + medication contributors.',
              zh: '有帮助,但漏掉环境与药物因素。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'sedative-prn',
            label: { en: 'PRN benzodiazepine for sleep concerns.', zh: '为助眠开必要时苯二氮䓬类药物。' },
            score: -8,
            rationale: {
              en: 'Falls + benzodiazepine = higher fall risk and confusion. Avoid.',
              zh: '跌倒史 + 苯二氮䓬类 = 跌倒及神志混乱风险更高,应避免。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Reverted on consultant review.', zh: '主治医师查房后撤销该医嘱。' },
            },
          },
        ],
      },
    },
    {
      id: 'rehab-step-down',
      department: 'rehab-gym',
      facility: 'slh',
      durationMin: 14400,
      costSGD: 1800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -6, financialWorry: 4, sleepDebt: -10 },
      framing: {
        patient: {
          en: '(stronger, walking unaided after 2 weeks.)',
          zh: '(体力增强,两周后能不靠扶助独立行走。)',
        },
        caregiver: {
          en: 'You sleep better; she goes home with confidence.',
          zh: '你睡得更好了;伯伯也能放心回家。',
        },
        staff: {
          en: "St Luke's frailty rehab: 2 weeks; functional independence regained.",
          zh: '圣路加(St Luke\'s)社区医院衰弱康复:两周,恢复独立生活功能。',
        },
      },
    },
    {
      id: 'long-term-care',
      department: 'discharge',
      facility: 'shp-bukit-merah',
      durationMin: 30,
      framing: {
        patient: {
          en: 'A regular polyclinic for chronic check-ups.',
          zh: '一家固定的综合诊疗所做慢性病复查。',
        },
        caregiver: {
          en: 'A weekly call schedule between you and the GP.',
          zh: '你和家庭医生约好每周通电话一次。',
        },
        staff: {
          en: 'SHP polyclinic shared-care plan with AIC Active Ageing Centre referral.',
          zh: 'SHP综合诊疗所共享照护计划,并转介至AIC乐龄活跃中心(Active Ageing Centre)。',
        },
      },
      decision: {
        id: 'long-term-plan',
        prompt: { en: 'Long-term plan?', zh: '长期照护方案?' },
        weight: 1,
        reference: FRAILTY,
        options: [
          {
            id: 'shared-aic',
            label: {
              en: 'SHP polyclinic + AIC Active Ageing Centre + 6-monthly geriatrician review at AH.',
              zh: 'SHP综合诊疗所 + AIC乐龄活跃中心 + AH老年科每6个月复查一次。',
            },
            score: 10,
            rationale: {
              en: 'Continuity in primary care; community engagement; specialist surveillance for frailty progression.',
              zh: '基层照护连续性 + 社区参与 + 专科对衰弱进展进行监测。',
            },
            outcome: {
              patient: {
                en: 'You join a brisk-walk group at the AAC.',
                zh: '你在乐龄中心(AAC)加入了快步走小组。',
              },
              caregiver: { en: 'You worry less.', zh: '你少了几分担忧。' },
              staff: { en: 'NEHR populated.', zh: 'NEHR记录已更新。' },
            },
          },
          {
            id: 'soc-only',
            label: { en: 'AH geriatrics SOC quarterly indefinitely.', zh: '仅由AH老年科门诊每3个月复诊,无期限。' },
            score: 5,
            rationale: {
              en: 'Specialist-only is unsustainable for the population.',
              zh: '从全人群角度看,完全依赖专科不具可持续性。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'No follow-up.', zh: '不安排随访。' },
            score: -4,
            rationale: { en: 'High readmission risk.', zh: '再就诊风险高。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
