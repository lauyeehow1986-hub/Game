import type { CaseDefinition } from '../../lib/types';

const SARS_REPORT = {
  label: { en: 'MOH Singapore: Lessons from SARS (2003)', zh: '新加坡卫生部:SARS的经验教训(2003年)' },
  body: {
    en: 'Ministry of Health post-outbreak review identifying super-spreader recognition, ED isolation, PPE, and ring-fencing as core lessons.',
    zh: '卫生部疫情后回顾,确立超级传播者识别、急诊隔离、PPE及"圈隔"为核心教训。',
  },
};

const NCID_HX = {
  label: { en: 'NCID — A History', zh: '国家传染病中心(NCID)— 简史' },
  body: {
    en: 'NCID was conceived in the wake of SARS 2003 to centralise outbreak response and isolate suspect cases away from general acute care.',
    zh: 'NCID源于2003年SARS之后,旨在集中疫情应对、将疑似病例与一般急诊分隔。',
  },
};

const WHO_SARS = {
  label: { en: 'WHO Consensus Document SARS (2003)', zh: '世卫组织SARS共识文件(2003年)' },
  body: {
    en: 'WHO retrospective consensus on transmission, IPC failures and healthcare-worker mortality during the 2003 SARS outbreak.',
    zh: '世卫组织对2003年SARS暴发期间传播途径、感染防控失误及医护死亡的回顾性共识。',
  },
};

export const sars2003Case: CaseDefinition = {
  id: 'sars-2003-historical',
  title: {
    en: 'SARS 2003 — TTSH outbreak (historical educational scenario)',
    zh: '2003年SARS — 陈笃生医院疫情(历史教学情景)',
  },
  blurb: {
    en: 'Historical educational scenario. March 2003. A returning traveller with atypical pneumonia is admitted to TTSH general medical ward. Within days, dozens of healthcare workers are infected. Decisions modelled here are framed against MOH and WHO post-outbreak reviews.',
    zh: '历史教学情景。2003年3月。一名回国旅客因非典型肺炎被收入TTSH普通内科病房。数日内,数十名医护感染。本场景的决策以卫生部与世卫组织的疫情后回顾为基准。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'ncid'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  historical: true,
  citations: [
    'Ministry of Health Singapore. SARS in Singapore — Challenges, Strategies and Lessons. 2004.',
    'Hsu LY et al. Severe Acute Respiratory Syndrome (SARS) in Singapore. Emerging Infectious Diseases. 2003;9(6):713-717.',
    'WHO. Consensus document on the epidemiology of severe acute respiratory syndrome (SARS). 2003.',
  ],
  guidelines: [SARS_REPORT, NCID_HX, WHO_SARS],
  pathway: [
    {
      id: 'ed-arrival',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 240,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(Atypical pneumonia — fever, dry cough, myalgia. Recent travel.)',
          zh: '(非典型肺炎 — 发热、干咳、肌痛。近期有旅行史。)',
        },
        caregiver: {
          en: '(Family worry about the new disease in the news.)',
          zh: '(家属担心新闻里报道的"新病"。)',
        },
        staff: {
          en: 'TTSH ED 2003: case admitted with "atypical pneumonia". Travel history not yet linked nationally; airborne hypothesis not yet established.',
          zh: '2003年TTSH急诊:以"非典型肺炎"收入。当时全国尚未串联旅行史信息;空气传播假说亦未确立。',
        },
      },
      decision: {
        id: 'initial-isolation-2003',
        prompt: {
          en: 'March 2003. Pathogen unknown. PPE generic. With hindsight, what should have happened?',
          zh: '2003年3月。病原未明。PPE非专门配置。事后回顾,本应怎样处理?',
        },
        weight: 1.5,
        reference: SARS_REPORT,
        options: [
          {
            id: 'airborne-as-default',
            label: {
              en: 'Apply airborne + droplet precautions by default for any unidentified novel respiratory illness; segregate the patient from the general ward.',
              zh: '对任何未明的新型呼吸道疾病默认采取空气+飞沫防护;将患者与普通病房分隔。',
            },
            score: 10,
            rationale: {
              en: 'A core SARS lesson: when the pathogen is unknown, default to the highest plausible level of precaution. Today, NCID and DORSCON encode this — it didn\'t exist in March 2003.',
              zh: 'SARS的核心教训:病原未明时,默认采用合理范围内的最高防护等级。如今NCID与DORSCON已制度化这一原则 — 2003年3月并不存在。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Cohort cubicle, full PPE, smaller exposure footprint.',
                zh: '分群隔间、全套PPE,暴露面更小。',
              },
            },
            effects: { pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -8 } },
          },
          {
            id: 'standard-only',
            label: {
              en: 'Manage on a general ward with standard precautions until aetiology known.',
              zh: '在病因明确前于普通病房按标准防护处理。',
            },
            score: -10,
            rationale: {
              en: 'What actually happened in the early weeks. Resulted in extensive nosocomial spread to staff and patients.',
              zh: '正是早期数周实际发生的情况。结果导致医护与患者大规模院内传播。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Multiple HCW infections; outbreak amplified.',
                zh: '多名医护感染;疫情扩大。',
              },
            },
            effects: { setFlags: ['hcw-cluster'], pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -20, surgeCapacityPctDelta: -20 } },
          },
        ],
      },
    },
    {
      id: 'ttsh-ringfence',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 1440,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 12, sleepDebt: 22 },
      framing: {
        patient: {
          en: '(Worsening dyspnoea; oxygen requirements rising.)',
          zh: '(气促加重;氧需求上升。)',
        },
        caregiver: { en: 'Visiting suspended.', zh: '探视已停。' },
        staff: {
          en: 'Cluster of healthcare-worker infections recognised; institutional response activated.',
          zh: '识别出医护感染聚集;启动机构层面应对。',
        },
      },
      decision: {
        id: 'ringfence-decision',
        prompt: {
          en: 'A cluster among ED + medical ward staff is recognised. With 2003 hindsight, what is the right institutional response?',
          zh: '急诊与内科病房员工出现感染聚集。以2003年的事后视角看,机构应作何反应?',
        },
        weight: 1.5,
        reference: SARS_REPORT,
        options: [
          {
            id: 'ringfence-ttsh',
            label: {
              en: 'Ring-fence TTSH as the national SARS hospital: dedicated wards, no inter-hospital transfers, dedicated staff cohorts; no rotation, no movement; ED diversion to other hospitals.',
              zh: '将TTSH圈隔为全国SARS指定医院:专用病房、禁止跨院转运、专门员工分群、不轮转、不流动;急诊分流至其他医院。',
            },
            score: 10,
            rationale: {
              en: 'This was the operational decision that broke the chain. Centralisation + ring-fencing + no rotation prevents seeding of other hospitals.',
              zh: '这是真正切断传播链的决策。集中 + 圈隔 + 不轮转,可防止向其他医院播散。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'TTSH becomes the SARS hospital; other hospitals continue routine care.',
                zh: 'TTSH成为SARS指定医院;其他医院维持常规诊疗。',
              },
            },
            effects: { clearFlags: ['hcw-cluster'], pandemic: { dorsconShift: 1, surgeCapacityPctDelta: 20 } },
          },
          {
            id: 'distribute',
            label: {
              en: 'Distribute SARS patients across hospitals to share the load.',
              zh: '将SARS患者分散到各医院以分担负担。',
            },
            score: -10,
            rationale: {
              en: 'Multiplies seeding events — opposite of what the outbreak needed.',
              zh: '反而增加多点播散 — 与当时疫情所需正好相反。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'New clusters at SGH and NUH.',
                zh: 'SGH与NUH出现新感染聚集。',
              },
            },
            effects: { setFlags: ['multi-cluster-seeded'], pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -25, surgeCapacityPctDelta: -30 } },
          },
          {
            id: 'no-change',
            label: {
              en: 'Continue routine workflow; advise enhanced PPE only.',
              zh: '维持常规流程;仅建议加强PPE。',
            },
            score: -8,
            rationale: {
              en: 'Inadequate; PPE alone without ring-fencing failed in early-2003 reality.',
              zh: '不足;仅靠PPE而无圈隔在2003年早期已被证实失败。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Spread continues.', zh: '传播持续。' },
            },
            effects: { pandemic: { ppeStockpilePctDelta: -15, surgeCapacityPctDelta: -15 } },
          },
        ],
      },
    },
    {
      id: 'icu-2003',
      department: 'icu',
      facility: 'ttsh',
      durationMin: 4320,
      costSGD: 5400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 30, financialWorry: 14, sleepDebt: 26 },
      framing: {
        patient: {
          en: '(Intubated; prone position; respiratory failure.)',
          zh: '(已插管;俯卧位通气;呼吸衰竭。)',
        },
        caregiver: {
          en: 'Family briefings by speakerphone — they cannot enter.',
          zh: '家属只能通过免提电话听简报 — 无法进入病房。',
        },
        staff: {
          en: 'ICU team in cohort rota; full PPE; nebulised treatments minimised; dedicated equipment.',
          zh: 'ICU团队按分群排班;全套PPE;雾化治疗减至最少;设备专用。',
        },
      },
      decision: {
        id: 'aerosol-procedures',
        prompt: {
          en: 'High-flow oxygen and nebulised bronchodilators are routine on most wards. With SARS-era IPC understanding, what changes?',
          zh: '高流量氧疗与雾化扩张支气管是多数病房的常规。基于SARS时期的感染防控认识,要改什么?',
        },
        weight: 1.2,
        reference: WHO_SARS,
        options: [
          {
            id: 'minimise-agp',
            label: {
              en: 'Minimise aerosol-generating procedures (AGPs): MDI with spacer instead of nebs; closed-circuit ventilator suction; intubation by an experienced team in a negative-pressure room only.',
              zh: '尽量减少气溶胶生成操作(AGP):以定量吸入器加储雾罐替代雾化;闭路抽吸;只在负压房由经验丰富的团队插管。',
            },
            score: 10,
            rationale: {
              en: 'AGP minimisation was a key SARS / COVID-era control measure to protect staff.',
              zh: '减少AGP是SARS / 新冠时期保护医护的关键防控措施。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Lower HCW exposure events.', zh: '医护暴露事件减少。' },
            },
          },
          {
            id: 'routine-agp',
            label: {
              en: 'Continue routine nebs, open-suction, etc.',
              zh: '继续常规雾化、开放式抽吸等。',
            },
            score: -8,
            rationale: { en: 'Aerosol generation = staff exposure.', zh: '产生气溶胶即等于员工暴露。' },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Further cluster.', zh: '又一波聚集感染。' },
            },
          },
        ],
      },
    },
    {
      id: 'post-outbreak-reform',
      department: 'discharge',
      facility: 'ttsh',
      durationMin: 60,
      framing: {
        patient: {
          en: '(Recovers slowly; long convalescence.)',
          zh: '(缓慢康复;恢复期很长。)',
        },
        caregiver: {
          en: '(Family and bereaved colleagues attend HCW memorials.)',
          zh: '(家属与失去亲人同事一起出席医护悼念仪式。)',
        },
        staff: {
          en: 'Post-outbreak review identifies system reforms — outpatient screening, NCID, DORSCON.',
          zh: '疫情后回顾确立系统性改革方向 — 门诊筛查、NCID、DORSCON。',
        },
      },
      decision: {
        id: 'system-reform',
        prompt: {
          en: 'After SARS, what reforms would best prepare for the next pathogen?',
          zh: 'SARS之后,什么样的改革最能为下次疫情做好准备?',
        },
        weight: 1.5,
        reference: NCID_HX,
        options: [
          {
            id: 'ncid-and-dorscon',
            label: {
              en: 'Build a national infectious-disease centre (NCID); create a colour-coded outbreak alert system (DORSCON); standing PPE stockpile and surge plans; mandatory IPC training across all healthcare workers.',
              zh: '建立国家传染病中心(NCID);设立分色疫情警戒系统(DORSCON);常备PPE储备与扩容方案;面向所有医护的强制感染防控培训。',
            },
            score: 10,
            rationale: {
              en: 'These are the actual reforms Singapore implemented; they paid off during H1N1, MERS, COVID-19.',
              zh: '这些正是新加坡随后落实的改革;在H1N1、MERS、新冠期间均见成效。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'NCID groundbreaking 2014; DORSCON formalised; reusable surge plans authored.',
                zh: 'NCID 2014年动土;DORSCON正式化;可复用的扩容方案完成。',
              },
            },
          },
          {
            id: 'business-as-usual',
            label: {
              en: 'Lessons documented but no structural reform.',
              zh: '只记录教训,不进行结构性改革。',
            },
            score: -8,
            rationale: {
              en: 'Without structural change, the next outbreak repeats the same pattern.',
              zh: '若无结构性改变,下次疫情会重蹈覆辙。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
