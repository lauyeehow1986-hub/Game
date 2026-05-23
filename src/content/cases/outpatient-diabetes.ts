import type { CaseDefinition } from '../../lib/types';

const MOH_DM = {
  label: { en: 'MOH CPG Diabetes Mellitus (2014, updated 2017)', zh: '卫生部糖尿病临床实践指南(2014年版,2017年更新)' },
  body: {
    en: 'Singapore MOH Clinical Practice Guidelines on diabetes mellitus.',
    zh: '新加坡卫生部糖尿病临床实践指南。',
  },
};

const ADA_EASD_2023 = {
  label: { en: 'ADA/EASD Consensus 2023', zh: '美国糖尿病协会(ADA)与欧洲糖尿病学会(EASD)2023共识' },
  body: {
    en: 'Hyperglycaemia management in T2DM — incorporates organ-protective agents (SGLT2i, GLP-1RA).',
    zh: '2型糖尿病高血糖管理 — 强调使用具有器官保护作用的药物(SGLT2抑制剂、GLP-1受体激动剂)。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'MOH Healthier SG (2023)', zh: '卫生部Healthier SG(2023)' },
  body: {
    en: 'Right-siting chronic care to a primary-care provider with one-physician continuity.',
    zh: '将慢性病照护下沉至基层,由一位家庭医生提供持续性照护。',
  },
};

const CDMP = {
  label: { en: 'MOH CDMP / Flexi-MediSave', zh: '卫生部慢性病管理计划(CDMP)/ Flexi-MediSave' },
  body: {
    en: 'Chronic Disease Management Programme — outpatient subsidy + MediSave drawdown for chronic conditions.',
    zh: '慢性病管理计划 — 门诊津贴 + 慢性病可动用保健储蓄(MediSave)。',
  },
};

export const outpatientDiabetes: CaseDefinition = {
  id: 'outpatient-diabetes',
  title: {
    en: 'Outpatient T2DM — 62 y/o male, poorly controlled, polyclinic referral',
    zh: '门诊2型糖尿病 — 62岁男性,控制欠佳,综合诊疗所转诊',
  },
  blurb: {
    en: 'Mr Rajan, 62. Long-distance lorry driver. T2DM x10y, HbA1c 9.4%, on metformin only. Walked into Toa Payoh Polyclinic with painful numb feet for two weeks. The polyclinic refers him to TTSH endocrinology SOC.',
    zh: 'Rajan先生,62岁,长途货车司机。2型糖尿病10年,HbA1c 9.4%,目前仅服二甲双胍。双足麻木伴疼痛两周,自行到大巴窑综合诊疗所就诊。诊疗所转介至TTSH内分泌专科门诊。',
  },
  category: 'outpatient',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [MOH_DM, ADA_EASD_2023, HEALTHIER_SG, CDMP],
  pathway: [
    {
      id: 'polyclinic',
      department: 'soc',
      durationMin: 60,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 5 },
      framing: {
        patient: {
          en: 'You queued at 7am. The polyclinic doctor types fast. She asks if you check your sugar at home — you don\'t.',
          zh: '你早上7点就排队了。综合诊疗所的医生打字很快。她问你在家有没有量血糖 — 你说没有。',
        },
        caregiver: {
          en: "Your wife came along. She's scared because Uncle next door went on dialysis last year.",
          zh: '太太陪你来。她很害怕,因为隔壁的伯伯去年开始洗肾了。',
        },
        staff: {
          en: 'GP at polyclinic: HbA1c 9.4, BP 152/92, foot exam — reduced monofilament, no ulcer. Refers to endocrine SOC.',
          zh: '综合诊疗所医生:HbA1c 9.4,血压152/92;足部检查 — 单丝触觉减弱,未见溃疡。转介内分泌专科门诊。',
        },
      },
      decision: {
        id: 'soc-or-private',
        prompt: {
          en: 'Where do you refer him? He has CHAS Orange and no IP plan.',
          zh: '该把他转去哪里?他持CHAS橙卡,没有综合健保附加险(IP)。',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'soc-subsidised',
            label: {
              en: 'Subsidised SOC referral to TTSH endocrinology.',
              zh: '津贴价转介TTSH内分泌专科门诊。',
            },
            score: 10,
            rationale: {
              en: 'Subsidised tertiary endocrine care via SOC referral letter. CHAS Orange + CDMP keeps cost manageable.',
              zh: '通过专科转介信获得津贴价的三级内分泌照护。CHAS橙卡 + CDMP使费用可控。',
            },
            outcome: {
              patient: {
                en: 'A pink referral letter. Appointment next week.',
                zh: '一张粉红色的转介信。下周的预约。',
              },
              caregiver: { en: 'You write down the date.', zh: '你把日期记下来。' },
              staff: {
                en: 'Subsidy preserved; appointment within 1 week as urgent referral.',
                zh: '津贴保留;以紧急转介在1周内安排预约。',
              },
            },
          },
          {
            id: 'soc-private',
            label: {
              en: 'Private referral to a private endocrinologist (Mt Elizabeth Novena).',
              zh: '转介至私人内分泌医生(伊丽莎白诺维娜医院)。',
            },
            score: 3,
            rationale: {
              en: 'Faster appointment and continuity, but full private rate. Without IP, this is significant OOP.',
              zh: '预约较快、连续性较好,但需自付完整私人价。没有IP的情况下,自付费用相当高。',
            },
            outcome: {
              patient: { en: 'Faster appointment, but the bill stings.', zh: '预约快,但账单也疼。' },
              caregiver: { en: 'You worry.', zh: '你很担心。' },
              staff: { en: 'Acceptable; cost discussed.', zh: '可以接受;已讨论费用。' },
            },
          },
          {
            id: 'no-referral',
            label: {
              en: 'Manage at polyclinic only — add second-line agent and review in 3 months.',
              zh: '仅在综合诊疗所管理 — 加二线药物,3个月后复查。',
            },
            score: 4,
            rationale: {
              en: 'Reasonable for stable T2DM, but with HbA1c 9.4% and foot symptoms specialist input is appropriate.',
              zh: '对稳定的2型糖尿病尚可,但HbA1c 9.4%加上足部症状,适合让专科介入。',
            },
            outcome: {
              patient: { en: 'Two new tablets, review in 3 months.', zh: '两种新药,3个月后复查。' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Polyclinic family physician comfortable; specialist input still ideal.',
                zh: '综合诊疗所家庭医生有把握;但专科参与仍是更理想方案。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'soc-visit',
      department: 'soc',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4 },
      framing: {
        patient: {
          en: 'A long form to fill. The young doctor introduces herself. She asks about your work, your sleep, your family.',
          zh: '要填一张很长的表格。年轻医生作了自我介绍。她问起你的工作、睡眠、家人。',
        },
        caregiver: {
          en: 'You sit on a plastic chair in the corridor. The fluorescent light hums.',
          zh: '你坐在走廊上的塑胶椅上。荧光灯发出低沉的嗡嗡声。',
        },
        staff: {
          en: 'Endocrine SOC: HbA1c 9.4, eGFR 62, ACR 80 (microalbuminuria), monofilament 4/10 sites both feet.',
          zh: '内分泌专科门诊:HbA1c 9.4,eGFR 62,尿白蛋白/肌酐比80(微量白蛋白尿),双足单丝触觉10个测试点中4个减弱。',
        },
      },
      decision: {
        id: 'second-line-agent',
        prompt: {
          en: 'On metformin 1g BD. eGFR 62, microalbuminuria, BMI 29. What do you add as second-line therapy?',
          zh: '正服二甲双胍1g每日两次。eGFR 62,微量白蛋白尿,BMI 29。二线治疗加什么?',
        },
        weight: 1.2,
        reference: ADA_EASD_2023,
        options: [
          {
            id: 'sglt2i',
            label: {
              en: 'Add an SGLT2 inhibitor (e.g. empagliflozin).',
              zh: '加SGLT2抑制剂(如恩格列净)。',
            },
            score: 10,
            rationale: {
              en: 'In T2DM with CKD or albuminuria, SGLT2 inhibitors confer renal and cardiovascular protection beyond glycaemic control (EMPA-KIDNEY, CREDENCE). Subsidised under MAF Standard Drug List.',
              zh: '合并慢性肾病或白蛋白尿的2型糖尿病中,SGLT2抑制剂除降糖外还能保护肾脏和心血管(EMPA-KIDNEY、CREDENCE)。属药物援助基金(MAF)标准用药,享有津贴。',
            },
            outcome: {
              patient: {
                en: 'A new tablet. The pharmacist warns you about UTIs and to drink water.',
                zh: '一种新药。药剂师叮嘱你注意泌尿道感染,要多喝水。',
              },
              caregiver: {
                en: 'You get told what side-effects to watch for.',
                zh: '医护交代了要留意的副作用。',
              },
              staff: {
                en: 'GDMT for diabetic kidney disease. Sensible long-term.',
                zh: '糖尿病肾病的指南导向药物治疗,长期获益明确。',
              },
            },
          },
          {
            id: 'glp1',
            label: {
              en: 'Add a GLP-1 receptor agonist (e.g. semaglutide).',
              zh: '加GLP-1受体激动剂(如司美格鲁肽)。',
            },
            score: 8,
            rationale: {
              en: 'Powerful HbA1c lowering and CV benefit. Excellent choice but expensive and not on the standard subsidy drug list at full dose.',
              zh: '降糖效果强且具心血管获益。优秀选择,但价格昂贵,足剂量并不在标准津贴药物清单内。',
            },
            outcome: {
              patient: {
                en: 'A weekly injection. Your wife is anxious about the cost.',
                zh: '每周打一针。太太对费用很焦虑。',
              },
              caregiver: {
                en: 'You ask about the cost. The pharmacist quotes the figure. You wince.',
                zh: '你问起价钱,药剂师报了数字,你皱了皱眉。',
              },
              staff: { en: 'Excellent agent; cost barrier discussed.', zh: '药物极佳;费用障碍已讨论。' },
            },
          },
          {
            id: 'sulfonylurea',
            label: { en: 'Add a sulfonylurea (e.g. gliclazide).', zh: '加磺脲类药物(如格列齐特)。' },
            score: 4,
            rationale: {
              en: 'Cheap and effective HbA1c reduction but raises hypoglycaemia and weight; no organ-protection benefit. Risky in a long-distance lorry driver.',
              zh: '便宜且能有效降糖,但增加低血糖与体重;无器官保护作用。对长途货车司机风险尤高。',
            },
            outcome: {
              patient: {
                en: 'You feel light-headed driving on the PIE that afternoon.',
                zh: '当天下午在PIE上开车时感到头晕。',
              },
              caregiver: {
                en: 'You start checking up on him during the day.',
                zh: '太太开始白天打电话查岗。',
              },
              staff: {
                en: 'Hypo risk in a commercial driver — flagged.',
                zh: '商业司机低血糖风险被标记。',
              },
            },
          },
          {
            id: 'insulin',
            label: { en: 'Start basal insulin immediately.', zh: '立即起始基础胰岛素。' },
            score: 3,
            rationale: {
              en: 'HbA1c 9.4% can often be brought down with oral therapy first; insulin is a step usually reserved for further failure or very high HbA1c.',
              zh: 'HbA1c 9.4%常可先用口服药控制;胰岛素通常用于进一步失效或HbA1c极高时。',
            },
            outcome: {
              patient: { en: 'A pen injector. You\'re scared.', zh: '一支注射笔。你很害怕。' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Reasonable but escalates earlier than guidelines suggest.',
                zh: '合理但比指南建议更早升阶。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'pharmacy-counsel',
      department: 'pharmacy',
      durationMin: 30,
      costSGD: 95,
      charge: 'pharmacy',
      caregiverBurden: { timeOffWorkHours: 1 },
      framing: {
        patient: {
          en: 'The pharmacist asks if you want the cheaper option. You nod.',
          zh: '药剂师问你要不要便宜的那款。你点头。',
        },
        caregiver: { en: 'You take photos of every pill.', zh: '你把每颗药都拍下来。' },
        staff: {
          en: 'CDMP claim filed; Flexi-MediSave activated; foot-care leaflet given.',
          zh: 'CDMP已申报;Flexi-MediSave已启用;发放足部护理传单。',
        },
      },
    },
    {
      id: 'right-siting',
      department: 'discharge',
      durationMin: 20,
      framing: {
        patient: {
          en: 'They ask if you have a regular GP near home. You shake your head.',
          zh: '他们问你住家附近有没有固定的家庭医生。你摇头。',
        },
        caregiver: {
          en: 'A care coordinator hands you a list of nearby Healthier-SG GPs.',
          zh: '医疗协调员递给你一份附近参加Healthier SG的家庭医生名单。',
        },
        staff: {
          en: 'Discharge plan: stable for primary-care management with shared NEHR.',
          zh: '出院计划:病情稳定,可由基层管理,共享NEHR。',
        },
      },
      decision: {
        id: 'right-siting-choice',
        prompt: {
          en: 'Long-term care plan for this stable, well-controlled patient?',
          zh: '这位稳定、控制尚可的患者长期照护方案?',
        },
        weight: 1.2,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'enrol-gp-cdmp',
            label: {
              en: 'Enrol with a Healthier-SG GP under CDMP; SOC review in 6 months for HbA1c trend, then annually.',
              zh: '在CDMP下登记一位Healthier SG家庭医生;6个月后专科复查HbA1c走势,之后每年一次。',
            },
            score: 10,
            rationale: {
              en: 'Continuity at a primary-care provider is the cornerstone of Healthier SG. CDMP plus Flexi-MediSave keeps OOP low. Frees up SOC capacity.',
              zh: '基层连续性是Healthier SG的核心。CDMP加上Flexi-MediSave使自付费用降到最低,同时释放专科产能。',
            },
            outcome: {
              patient: {
                en: 'A GP near your block. You can drop in on the way back from the depot.',
                zh: '组屋附近就有家庭医生。下班后顺路就能去。',
              },
              caregiver: {
                en: 'You stop worrying about driving him to TTSH every quarter.',
                zh: '太太不用再每3个月载他去TTSH了。',
              },
              staff: {
                en: 'NEHR populated; GP receives referral memo.',
                zh: 'NEHR记录已更新;家庭医生收到转介摘要。',
              },
            },
          },
          {
            id: 'soc-quarterly',
            label: { en: 'Continue SOC quarterly indefinitely.', zh: '专科门诊每3个月复诊,无期限。' },
            score: 4,
            rationale: {
              en: 'Specialist time better spent on uncontrolled / complex T2DM; for a now-stable patient, primary care is the right venue.',
              zh: '专科时间应留给未控制或复杂的糖尿病患者;对现已稳定的患者,基层才是合适的场所。',
            },
            outcome: {
              patient: {
                en: 'Long waits at SOC every 3 months.',
                zh: '每3个月在专科门诊苦等。',
              },
              caregiver: {
                en: 'Half-days off work for each visit.',
                zh: '每次都得请半天假。',
              },
              staff: { en: 'SOC slots squeezed.', zh: '专科预约越发紧张。' },
            },
          },
          {
            id: 'no-followup',
            label: {
              en: 'No structured follow-up — patient to self-manage.',
              zh: '不安排正式随访 — 让患者自我管理。',
            },
            score: -6,
            rationale: {
              en: 'Predictable HbA1c drift, microvascular and macrovascular harm.',
              zh: '可预见地出现HbA1c漂移、微血管与大血管并发症。',
            },
            outcome: {
              patient: { en: 'You forget the SGLT2 after a month.', zh: '一个月后你就忘了SGLT2抑制剂。' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Re-presents with neuropathy and a foot ulcer in 18 months.',
                zh: '18个月后因神经病变和足部溃疡再就诊。',
              },
            },
          },
        ],
      },
    },
  ],
};
