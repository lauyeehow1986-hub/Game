import type { CaseDefinition } from '../../lib/types';

const MOH_DENGUE_CPG = {
  label: {
    en: 'Singapore National Dengue Clinical Guideline (NCID / ACE, Mar 2026)',
    zh: '新加坡国家登革热临床指南(NCID / ACE,2026年3月)',
  },
  body: {
    en: 'Probable dengue: acute febrile illness + ≥2 of headache, retro-orbital pain, myalgia, arthralgia, rash, haemorrhagic manifestations, leukopenia. Warning signs (abdominal pain/tenderness, persistent vomiting, mucosal bleeding, lethargy, hepatomegaly, rising HCT with rapidly falling platelets) mandate admission. Severe dengue criteria = ICU.',
    zh: '疑似登革热:急性发热+≥2项症状(头痛、眼眶后痛、肌痛、关节痛、皮疹、出血表现、白细胞减少)。警示征(腹痛/压痛、持续呕吐、黏膜出血、嗜睡、肝肿大、血细胞比容上升伴血小板迅速下降)需住院。严重登革热须ICU。',
  },
};

const NEA_DENGUE_CLUSTER = {
  label: {
    en: 'NEA dengue cluster notification (Infectious Diseases Act)',
    zh: '国家环境局登革热聚集通报(传染病法令)',
  },
  body: {
    en: 'Suspected dengue must be notified to MOH within 24h. Confirmed cases trigger NEA vector-control inspection within 2 working days; clusters (≥2 cases in 150m radius within 14 days) trigger fogging and stop-work orders at construction sites. Foreign-worker dormitory clusters require employer compliance with MOM workplace health rules.',
    zh: '疑似登革热须在24小时内向卫生部呈报。确诊病例触发国家环境局媒介控制(2个工作日内);聚集病例(14天内150米半径≥2例)触发烟雾消杀及工地停工令。外籍劳工宿舍聚集需雇主依人力部职场健康守则配合。',
  },
};

const FWMI_DENGUE = {
  label: {
    en: 'Foreign Worker Medical Insurance (FWMI) — admission cost',
    zh: '外籍劳工医疗保险(FWMI) — 住院费用',
  },
  body: {
    en: 'Work-permit holders are not on MediShield Life. Employers fund hospitalisation via FWMI (annual cap; co-payments common). NTFGH/JCH have established workflows with employer welfare officers and MOM Migrant Worker Centre to avoid out-of-pocket catastrophe.',
    zh: '工作准证持有者不享有MediShield Life。雇主透过FWMI(年度上限,可能有共付)承担住院费用。NTFGH/JCH与雇主福利干事及人力部外籍员工中心已建立工作流程,避免劳工承受巨额自付。',
  },
};

export const dengueSurgeCase: CaseDefinition = {
  id: 'dengue-surge',
  title: {
    en: 'Dengue with warning signs — dormitory cluster → NTFGH',
    zh: '登革热伴警示征 — 宿舍聚集 → NTFGH',
  },
  blurb: {
    en: 'Mr Hossain, 34, Bangladeshi construction worker. Day 5 fever, headache, body aches; now nauseous with right-upper-quadrant tenderness. Two co-workers in the same dormitory block were hospitalised last week with dengue. Brought by employer welfare officer to NTFGH ED.',
    zh: '霍辛先生,34岁,孟加拉建筑工人。发热第5天,头痛、全身酸痛;现恶心伴右上腹压痛。上周同一宿舍楼两名同事因登革热住院。雇主福利干事陪同就诊于NTFGH急诊。',
  },
  category: 'acute',
  primaryFacility: 'ntfgh',
  involvedFacilities: ['ntfgh', 'ncid'],
  profileKey: 'migrantWorker',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 240,
    goalLabel: 'Admit + IV fluids by',
    missedFlag: 'dengue-late-admit',
  },
  guidelines: [MOH_DENGUE_CPG, NEA_DENGUE_CLUSTER, FWMI_DENGUE],
  pathway: [
    {
      id: 'ed-triage',
      department: 'triage',
      facility: 'ntfgh',
      durationMin: 15,
      costSGD: 130,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'You feel weaker than yesterday. The welfare officer fills in forms while you wait. You worry about losing income if you stay overnight.',
          zh: '你比昨天更虚弱。福利干事帮你填表,你等候期间担心住院会让你少赚工资。',
        },
        caregiver: {
          en: 'You are the employer welfare officer. You have FWMI papers ready. Two colleagues from the same block were also unwell last week.',
          zh: '你是雇主福利干事。FWMI文件已备好。上周同一宿舍楼两位同事也病倒。',
        },
        staff: {
          en: 'P3 febrile traveller-like presentation. Tourniquet test, FBC + dengue NS1/IgM, LFT, U/E. Notify MOH within 24h if probable.',
          zh: 'P3发热,旅行/夜归类似表现。压脉试验、全血+登革热NS1/IgM、肝肾功能。若疑似登革热,24小时内呈报卫生部。',
        },
      },
      decision: {
        id: 'work-up',
        prompt: {
          en: 'Workup priority at triage?',
          zh: '分诊时的检查优先级?',
        },
        reference: MOH_DENGUE_CPG,
        weight: 1.5,
        options: [
          {
            id: 'fbc-ns1-tourniquet',
            label: {
              en: 'FBC + dengue NS1/IgM + tourniquet test + LFT + notify MOH.',
              zh: '全血+登革热NS1/IgM+压脉试验+肝功能+呈报卫生部。',
            },
            score: 3,
            rationale: {
              en: 'Aligned with MOH CPG. NS1 useful day 1–7; tourniquet test cheap and informative.',
              zh: '符合卫生部指南。NS1在第1-7天有效;压脉试验便宜且有用。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'malaria-only',
            label: {
              en: 'Send malaria film and discharge with paracetamol.',
              zh: '只送疟原虫涂片并给扑热息痛出院。',
            },
            score: -3,
            rationale: {
              en: 'Misses dengue warning-sign workup and notification obligations; risk of severe dengue rebound.',
              zh: '漏诊登革热警示征,亦未履行呈报义务;有严重登革热风险。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'broad-septic-screen',
            label: {
              en: 'Full septic screen incl. blood cultures + broad-spectrum IV antibiotics.',
              zh: '完整脓毒症筛查含血培养+广谱静脉抗生素。',
            },
            score: 0,
            rationale: {
              en: 'Antibiotics not indicated unless bacterial co-infection. Otherwise reasonable workup but not tailored.',
              zh: '除非合并细菌感染,否则抗生素无适应症。其他检查合理但未针对性。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'ed-admit-decision',
      department: 'ed',
      facility: 'ntfgh',
      durationMin: 60,
      costSGD: 280,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'Bloods are back. Doctor says your platelets are 92, HCT 48%. They ask if you can stay overnight.',
          zh: '化验结果出来。医生说你的血小板92,血细胞比容48%。问你能否住院过夜。',
        },
        caregiver: {
          en: 'FWMI covers admission. You confirm with the employer by phone. Two co-workers had similar trajectory.',
          zh: 'FWMI涵盖住院费。你电话与雇主确认。两位同事也曾如此发展。',
        },
        staff: {
          en: 'Dengue probable, warning sign (RUQ tenderness, rising HCT, dropping platelet). Per CPG: admit, IV crystalloid, monitor.',
          zh: '疑似登革热伴警示征(右上腹压痛、血细胞比容上升、血小板下降)。按指南:住院、静脉晶体液、监测。',
        },
      },
      decision: {
        id: 'admit-or-discharge',
        prompt: {
          en: 'Disposition with warning sign present?',
          zh: '出现警示征时的处置?',
        },
        reference: MOH_DENGUE_CPG,
        weight: 2,
        options: [
          {
            id: 'admit-iv-fluids',
            label: {
              en: 'Admit; isotonic crystalloid 5–7 mL/kg/h; 4-hourly obs; daily FBC.',
              zh: '住院;等渗晶体液5-7 mL/kg/h;每4小时观察;每日全血。',
            },
            score: 4,
            rationale: {
              en: 'CPG-recommended. Early IV fluids in warning-sign phase prevent progression to severe dengue.',
              zh: '符合指南建议。警示征期早期静脉补液可预防进展为严重登革热。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-oral-fluids',
            label: {
              en: 'Discharge with oral hydration advice and review in 24h.',
              zh: '出院,口服补液并24小时后复诊。',
            },
            score: -4,
            rationale: {
              en: 'Warning signs warrant admission. Discharge risks dengue shock syndrome at home overnight.',
              zh: '出现警示征应住院。出院可能在家发生登革休克综合征。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'icu-prophylactic',
            label: {
              en: 'Direct ICU admission for prophylactic monitoring.',
              zh: '直接ICU预防性监测。',
            },
            score: 1,
            rationale: {
              en: 'Without severe dengue criteria, ICU consumes scarce capacity; ward-level care is appropriate.',
              zh: '尚未达严重登革热标准,ICU资源紧张;病房级别照护已足够。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'ed-cluster-decision',
      department: 'ed',
      facility: 'ntfgh',
      durationMin: 15,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'The team asks where you live and how many room-mates you share with.',
          zh: '团队询问你住哪里、室友几人。',
        },
        caregiver: {
          en: 'You list the dorm address and which blocks the previous cases came from.',
          zh: '你列出宿舍地址及前两例所住楼栋。',
        },
        staff: {
          en: 'Cluster suspected (3 cases, same dorm, <14 days). MOH notification mandatory; NEA + MOM loop in.',
          zh: '怀疑聚集(同一宿舍3例,14天内)。卫生部呈报必须;并通知国家环境局+人力部。',
        },
      },
      decision: {
        id: 'cluster-action',
        prompt: {
          en: 'Public-health action given the dormitory cluster?',
          zh: '宿舍聚集的公共卫生应对?',
        },
        reference: NEA_DENGUE_CLUSTER,
        weight: 1,
        options: [
          {
            id: 'notify-and-coordinate',
            label: {
              en: 'Notify MOH; alert NEA + MOM Migrant Worker Centre; coordinate dorm vector inspection.',
              zh: '呈报卫生部;通报国家环境局及人力部外籍员工中心;协调宿舍媒介检查。',
            },
            score: 2,
            rationale: {
              en: 'Statutory notification + dorm-level outbreak control prevents further admissions.',
              zh: '法定呈报+宿舍层面控制可防止更多病例。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'notify-moh-only',
            label: {
              en: 'Notify MOH only; do not loop in NEA or MOM.',
              zh: '只呈报卫生部;不通报国家环境局或人力部。',
            },
            score: 0,
            rationale: {
              en: 'Misses cluster-control opportunity; NEA inspection mandated for confirmed cases.',
              zh: '错失聚集控制机会;确诊病例必须由国家环境局检查。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-notification',
            label: {
              en: 'Treat patient; no notification (employer prefers low profile).',
              zh: '只治疗病人;不呈报(雇主希望低调)。',
            },
            score: -3,
            rationale: {
              en: 'Statutory offence under Infectious Diseases Act; allows outbreak to spread.',
              zh: '违反传染病法令,放任疫情扩散。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'inpatient-day-3',
      department: 'ward',
      facility: 'ntfgh',
      durationMin: 4320,
      costSGD: 980,
      charge: 'inpatient-ward',
      framing: {
        patient: {
          en: 'Fever has broken. Your platelet count dipped to 58 but is now climbing. The doctor talks about discharge.',
          zh: '退烧了。血小板曾降至58,正在回升。医生提及出院。',
        },
        caregiver: {
          en: 'Employer asks about return-to-work date. You explain dengue convalescence and need for follow-up.',
          zh: '雇主询问复工日期。你说明登革热恢复期及随访需要。',
        },
        staff: {
          en: 'Critical phase passed. Plan: discharge once platelet >50, eating well, no warning signs.',
          zh: '关键期已过。计划:血小板>50、进食良好、无警示征即可出院。',
        },
      },
      decision: {
        id: 'discharge-plan',
        prompt: {
          en: 'Discharge and follow-up?',
          zh: '出院与随访计划?',
        },
        reference: FWMI_DENGUE,
        weight: 1,
        options: [
          {
            id: 'discharge-followup-fwmi',
            label: {
              en: 'Discharge; 72h dorm visit by company welfare officer; polyclinic review; FWMI claim filed.',
              zh: '出院;72小时由公司福利干事到宿舍探访;综合诊疗所复诊;申报FWMI。',
            },
            score: 2,
            rationale: {
              en: 'Safety-nets the worker, leverages employer obligation, ensures public-system follow-up is funded.',
              zh: '保障劳工安全,落实雇主义务,确保公立系统随访由保险承担。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-no-followup',
            label: {
              en: 'Discharge to dormitory; no scheduled follow-up.',
              zh: '出院回宿舍;不安排随访。',
            },
            score: -2,
            rationale: {
              en: 'Post-dengue lethargy + work pressure → represent risk. Welfare check is a low-cost safety net.',
              zh: '登革热后乏力+工作压力→易复返就诊。福利探访是低成本安全网。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'private-followup',
            label: {
              en: 'Refer to a private GP (no follow-up funded).',
              zh: '转介私人家庭医生(费用未承担)。',
            },
            score: 0,
            rationale: {
              en: 'Private GP works but FWMI cap may not cover; the worker may default. Polyclinic with FWMI claim is more reliable.',
              zh: '私人家庭医生可行但FWMI上限可能不够,劳工易放弃。综合诊疗所配合FWMI更可靠。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
