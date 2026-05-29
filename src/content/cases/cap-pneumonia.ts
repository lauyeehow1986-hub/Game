import type { CaseDefinition } from '../../lib/types';

const MOH_CAP_CPG = {
  label: {
    en: 'MOH / ACE CPG — Community-acquired pneumonia (adult)',
    zh: '卫生部 / ACE 临床指南 — 成人社区获得性肺炎',
  },
  body: {
    en: 'Severity assessment by CURB-65 (Confusion, Urea >7 mmol/L, RR ≥30, BP <90/60, Age ≥65). Score 0–1: outpatient. Score 2: short admission. Score ≥3: admit, consider ICU at ≥4. Empirical antibiotics per local sensitivities: amoxicillin/clavulanate + macrolide for severe; oral amoxicillin for mild outpatient.',
    zh: 'CURB-65严重程度评估(意识混乱、尿素>7 mmol/L、呼吸≥30、血压<90/60、年龄≥65)。0-1分:门诊;2分:短期住院;≥3分:住院,≥4分考虑ICU。根据本地药敏经验抗生素:重症用阿莫西林/克拉维酸+大环内酯;轻症门诊用口服阿莫西林。',
  },
};

const POLYCLINIC_RIGHT_SITING = {
  label: {
    en: 'Polyclinic / Healthier SG right-siting',
    zh: '综合诊疗所 / Healthier SG 适当分流',
  },
  body: {
    en: 'CURB-65 0 with stable vitals and no comorbid red flags can be safely managed at a polyclinic or Healthier-SG-enrolled GP with outpatient antibiotics, hydration, and 48–72h review. Sending stable mild CAP to the ED contributes to ED crowding without improving outcome.',
    zh: 'CURB-65为0且生命体征稳定、无合并危险因素者,可在综合诊疗所或Healthier SG家庭医生以口服抗生素+补液+48-72小时复诊处理。把稳定轻症送急诊只加重急诊拥挤,无益疗效。',
  },
};

const FLU_PNEUMOCOCCAL_VAX = {
  label: {
    en: 'NAIS adult flu + pneumococcal vaccination',
    zh: '全国成人免疫规划(NAIS) — 流感 + 肺炎球菌疫苗',
  },
  body: {
    en: 'Adults ≥65 and chronic-disease patients qualify for subsidised PCV13 + PPSV23 + annual influenza vaccine under NAIS; MediSave-payable at polyclinics, CHAS-GPs. Post-pneumonia is a high-yield teachable moment.',
    zh: '≥65岁成人及慢性病患可在NAIS下获得资助的PCV13+PPSV23+每年流感疫苗;综合诊疗所和CHAS家庭医生可用MediSave付费。肺炎康复期是疫苗教育的高效时机。',
  },
};

export const capPneumoniaCase: CaseDefinition = {
  id: 'cap-pneumonia',
  title: {
    en: 'Community-acquired pneumonia — polyclinic triage → KTPH ED',
    zh: '社区获得性肺炎 — 综合诊疗所分流 → KTPH急诊',
  },
  blurb: {
    en: 'Mr Rajan, 62, T2DM, smoker. 3 days fever, productive cough, breathless on stairs. Daughter brings him to AMK polyclinic at 10am. RR 26, SpO2 93% room air, BP 138/82, looks tired but conversant.',
    zh: '拉詹先生,62岁,2型糖尿病,吸烟者。发热3天,有痰咳嗽,上楼气喘。女儿上午10点带他到宏茂桥综合诊疗所。呼吸26,血氧93%,血压138/82,疲惫但能交谈。',
  },
  category: 'acute',
  primaryFacility: 'ktph',
  involvedFacilities: ['nhgp-amk', 'ktph'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [POLYCLINIC_RIGHT_SITING, MOH_CAP_CPG, FLU_PNEUMOCOCCAL_VAX],
  pathway: [
    {
      id: 'polyclinic-triage',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 25,
      costSGD: 32,
      charge: 'polyclinic',
      framing: {
        patient: {
          en: 'You came hoping for a quick cough syrup. The nurse pops a pulse oximeter on your finger and the number stays at 93.',
          zh: '你本想拿瓶止咳水。护士夹上血氧仪,数值一直停在93。',
        },
        caregiver: {
          en: 'Your father insisted on the polyclinic over the hospital. You worry about getting him admitted; he hates hospitals.',
          zh: '父亲坚持来综合诊疗所而非医院。你担心住院 — 他很怕医院。',
        },
        staff: {
          en: 'CURB-65 candidate. Quick history: confusion no, urea unknown, RR 26 (<30), BP fine, age 62 (no point). Score 0 so far. SpO2 93% on T2DM smoker — borderline.',
          zh: '需CURB-65评估。简短问诊:无意识混乱、尿素未知、呼吸26(<30)、血压正常、年龄62(无分)。目前0分。糖尿病吸烟者血氧93% — 临界。',
        },
      },
      decision: {
        id: 'polyclinic-disposition',
        prompt: {
          en: 'What is the safest disposition from the polyclinic?',
          zh: '综合诊疗所最安全的处置?',
        },
        reference: POLYCLINIC_RIGHT_SITING,
        weight: 1.5,
        options: [
          {
            id: 'ed-transfer',
            label: {
              en: 'Refer to KTPH ED — SpO2 borderline + T2DM + smoker raises severity risk.',
              zh: '转介KTPH急诊 — 血氧临界+糖尿病+吸烟提高重症风险。',
            },
            score: 3,
            rationale: {
              en: 'CURB-65 may underestimate risk in diabetics/smokers. SpO2 ≤93% warrants ED chest X-ray, ABG, and admission consideration.',
              zh: 'CURB-65对糖尿病/吸烟者可能低估风险。血氧≤93%应到急诊行胸片、动脉血气并考虑住院。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'oral-abx-home',
            label: {
              en: 'Oral amoxicillin + paracetamol; review in 48h.',
              zh: '口服阿莫西林+扑热息痛;48小时后复诊。',
            },
            score: -2,
            rationale: {
              en: 'Misses the borderline SpO2 in a high-risk profile. Likely to deteriorate at home.',
              zh: '忽视高风险体型下的临界血氧。在家恶化可能。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'admit-direct-soc',
            label: {
              en: 'Direct admission via SOC referral (no ED visit).',
              zh: '直接经专科门诊(SOC)收治(不去急诊)。',
            },
            score: 0,
            rationale: {
              en: 'SOC route delays imaging and IV antibiotics. ED is the right gate for acute deterioration risk.',
              zh: 'SOC路径延迟影像与静脉抗生素。急诊才是急性恶化风险的正确入口。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'ed-cxr',
      department: 'ed',
      facility: 'ktph',
      durationMin: 90,
      costSGD: 240,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'KTPH ED. You wait on a trolley. The X-ray tech wheels you in. Cough is making your chest sore.',
          zh: '在KTPH急诊。你躺在推车上等候。X光技师推你进检查室。咳得胸口酸痛。',
        },
        caregiver: {
          en: 'You translate for the doctor. They show you the X-ray on the screen — a white patch in the right lower lobe.',
          zh: '你帮医生翻译。医生在屏幕上指出右下肺的白色阴影。',
        },
        staff: {
          en: 'CXR: right lower lobe consolidation. CURB-65 still 0; SpO2 92% on RA. Vital signs stable, but T2DM smoker — admit?',
          zh: '胸片:右下肺实变。CURB-65 0;空气下血氧92%。生命体征稳定,但糖尿病吸烟者 — 是否住院?',
        },
      },
      decision: {
        id: 'admit-or-discharge',
        prompt: {
          en: 'Admit, observation ward, or short-stay?',
          zh: '收治普通病房、观察病房还是短期留观?',
        },
        reference: MOH_CAP_CPG,
        weight: 2,
        options: [
          {
            id: 'short-stay-iv-abx',
            label: {
              en: 'Short-stay unit; IV co-amoxiclav + oral azithromycin; 24h review.',
              zh: '短期留观;静脉氨苄西林克拉维酸+口服阿奇霉素;24小时复评。',
            },
            score: 3,
            rationale: {
              en: 'Balances under-treatment risk for diabetic with conservative resource use. CURB-65 0 with borderline SpO2 fits short-stay.',
              zh: '在糖尿病不足治疗风险与资源节约间取得平衡。CURB-65 0但血氧临界,适合短期留观。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'icu-admit',
            label: {
              en: 'Admit to MICU for close monitoring.',
              zh: '收治内科ICU严密监测。',
            },
            score: -1,
            rationale: {
              en: 'Not severe enough by CURB-65 or SpO2 to justify ICU resource. Inappropriate use blocks beds for actual crashes.',
              zh: '按CURB-65或血氧未达ICU标准。占用ICU资源会阻碍真正重症病人。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-with-oral',
            label: {
              en: 'Discharge with oral co-amoxiclav; polyclinic review 48h.',
              zh: '口服氨苄西林克拉维酸出院;综合诊疗所48小时复诊。',
            },
            score: -2,
            rationale: {
              en: 'Risk of decompensation overnight in a high-risk profile. CXR confirmed lobar consolidation.',
              zh: '高风险人群隔夜恶化风险。胸片已确诊肺叶实变。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'discharge-vaccination',
      department: 'consult-room',
      facility: 'nhgp-amk',
      durationMin: 30,
      costSGD: 25,
      charge: 'polyclinic',
      framing: {
        patient: {
          en: 'You came home after two days. The polyclinic nurse mentions catching up on vaccinations now that you have recovered.',
          zh: '住院两天后回家。综合诊疗所护士提议趁恢复期补打疫苗。',
        },
        caregiver: {
          en: 'You want to reduce the chance of this happening again. The nurse mentions flu + pneumococcal vaccines + smoking-cessation referral.',
          zh: '你想减少复发。护士提及流感+肺炎球菌疫苗以及戒烟转介。',
        },
        staff: {
          en: 'Convalescent visit. T2DM smoker, just had CAP — high-yield NAIS vaccination + smoking-cessation moment.',
          zh: '康复期随访。糖尿病吸烟者刚患社区肺炎 — NAIS疫苗+戒烟干预正当时。',
        },
      },
      decision: {
        id: 'prevention-plan',
        prompt: {
          en: 'Best prevention plan at follow-up?',
          zh: '随访时的最佳预防计划?',
        },
        reference: FLU_PNEUMOCOCCAL_VAX,
        weight: 1,
        options: [
          {
            id: 'vaccinate-and-quit-line',
            label: {
              en: 'Offer PCV13 today + plan PPSV23 in 8 weeks; annual flu; refer to HPB I-Quit hotline; arrange Healthier-SG GP enrolment.',
              zh: '今天接种PCV13+8周后PPSV23;每年流感;转介保健促进局I-Quit戒烟热线;安排Healthier SG家庭医生注册。',
            },
            score: 2,
            rationale: {
              en: 'Aligned with NAIS; layered prevention; chronic-disease right-siting for ongoing T2DM care.',
              zh: '符合NAIS;多层次预防;为糖尿病管理实现适当分流。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'vaccinate-only',
            label: {
              en: 'Vaccinate (PCV13 + flu); skip smoking-cessation referral.',
              zh: '只打疫苗(PCV13+流感);不转介戒烟。',
            },
            score: 0,
            rationale: {
              en: 'Vaccination is good but missing the dominant modifiable risk factor (smoking) is a wasted teachable moment.',
              zh: '接种合理但忽视最关键的可改变风险(吸烟),错失教育时机。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'nothing-now',
            label: {
              en: 'Recover first; revisit prevention at the next routine appointment.',
              zh: '先恢复;下次常规就诊再谈预防。',
            },
            score: -2,
            rationale: {
              en: 'Convalescent window has highest patient receptivity. Deferring loses the moment.',
              zh: '康复期患者接受度最高。推迟会错失机会。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
