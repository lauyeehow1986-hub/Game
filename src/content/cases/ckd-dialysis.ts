import type { CaseDefinition } from '../../lib/types';

const KDIGO = {
  label: { en: 'KDIGO 2024 CKD Guideline', zh: 'KDIGO 2024慢性肾病指南' },
  body: {
    en: 'International CKD guideline: ACR / eGFR staging, RAS-blockade, SGLT2i, dialysis preparation.',
    zh: '国际慢性肾病(CKD)指南:ACR / eGFR分期、RAS阻断剂、SGLT2抑制剂、透析前准备。',
  },
};

const NKF_SG = {
  label: { en: 'NKF Singapore Subsidy Framework', zh: '新加坡肾脏基金会(NKF)津贴框架' },
  body: {
    en: 'NKF and KDF dialysis centres provide means-tested subsidised haemodialysis for Singapore citizens.',
    zh: 'NKF与KDF透析中心为新加坡公民提供以家庭收入审查为基础的津贴血液透析。',
  },
};

const PRE_DIALYSIS = {
  label: { en: 'MOH Pre-Dialysis Care Pathway', zh: '卫生部透析前照护路径' },
  body: {
    en: 'Vascular access (AVF) creation 6–12 months before anticipated dialysis start; transplant work-up where eligible.',
    zh: '预计开始透析前6–12个月建立血管通路(AVF);若符合条件则开展肾移植评估。',
  },
};

export const ckdDialysisCase: CaseDefinition = {
  id: 'ckd-dialysis',
  title: {
    en: 'CKD progression — polyclinic → NUH renal SOC → NKF dialysis',
    zh: '慢性肾病进展 — 综合诊疗所 → 国立大学医院肾内科 → NKF透析',
  },
  blurb: {
    en: 'Mr Rajan, 62. Long-distance lorry driver, T2DM x12y, CKD stage 4 (eGFR 22), HbA1c 8.2%. NHGP polyclinic flags ACR rising; refers to NUH renal SOC.',
    zh: 'Rajan先生,62岁,长途货车司机。2型糖尿病12年,慢性肾病4期(eGFR 22),HbA1c 8.2%。NHGP综合诊疗所发现尿白蛋白/肌酐比(ACR)上升,转介NUH肾内科。',
  },
  category: 'outpatient',
  primaryFacility: 'nuh',
  involvedFacilities: ['nhgp-toa-payoh', 'nuh', 'nkf'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [KDIGO, NKF_SG, PRE_DIALYSIS],
  pathway: [
    {
      id: 'polyclinic-flag',
      department: 'gp-room',
      facility: 'nhgp-toa-payoh',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: { en: 'You feel fine. Just tired.', zh: '你觉得没什么,只是累。' },
        caregiver: {
          en: 'Your wife notices the swelling around your ankles.',
          zh: '太太注意到你脚踝周围有浮肿。',
        },
        staff: {
          en: 'Polyclinic: eGFR 22, ACR 92, K 4.8. Refers urgently to NUH renal SOC.',
          zh: '综合诊疗所:eGFR 22,ACR 92,血钾4.8。紧急转介NUH肾内科。',
        },
      },
    },
    {
      id: 'nuh-soc',
      department: 'soc',
      facility: 'nuh',
      durationMin: 90,
      costSGD: 280,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8 },
      framing: {
        patient: {
          en: 'A nurse explains how kidneys work using a kitchen-sink analogy.',
          zh: '护士用厨房水槽的比喻向你解释肾脏的工作原理。',
        },
        caregiver: { en: 'You write everything down.', zh: '你把每句话都记下来。' },
        staff: {
          en: 'Renal SOC: eGFR 22 stable last 6 months. Anaemia, mild hyperphosphataemia. Discusses RRT options.',
          zh: '肾内科门诊:近6个月eGFR 22稳定。贫血、轻度高磷血症。讨论肾脏替代治疗(RRT)选项。',
        },
      },
      decision: {
        id: 'medical-optimisation',
        prompt: {
          en: 'CKD G4 with diabetes. He is already on metformin (dose-reduced) and an ARB. Add what?',
          zh: '糖尿病合并CKD G4。目前已在用二甲双胍(减量)及ARB。还要加什么?',
        },
        weight: 1.5,
        reference: KDIGO,
        options: [
          {
            id: 'sglt2-erythropoietin',
            label: {
              en: 'Add SGLT2i (dapagliflozin) at renal-protective dose; iron + erythropoietin for anaemia; phosphate binder; counselling on AVF creation.',
              zh: '加SGLT2抑制剂(达格列净)用肾保护剂量;补铁 + 促红细胞生成素纠正贫血;磷结合剂;并就AVF(动静脉瘘)建立进行咨询。',
            },
            score: 10,
            rationale: {
              en: 'KDIGO 2024 supports SGLT2i down to eGFR 20 for renal + cardiovascular benefit. EPO + iron for symptomatic anaemia. Early AVF planning prevents temporary catheter dialysis.',
              zh: 'KDIGO 2024支持SGLT2i用至eGFR 20,带来肾脏与心血管双重获益。症状性贫血给予EPO + 铁剂。提前规划AVF可避免使用临时导管透析。',
            },
            outcome: {
              patient: {
                en: 'You start a new tablet and a fortnightly injection.',
                zh: '你开始服一种新药,以及每两周一次的注射。',
              },
              caregiver: { en: 'You learn to give the injection.', zh: '太太学着帮你打针。' },
              staff: { en: 'GDMT + AVF referral made.', zh: 'GDMT到位,AVF转介已发出。' },
            },
          },
          {
            id: 'no-sglt2',
            label: {
              en: 'Hold SGLT2i because eGFR < 30; only treat anaemia.',
              zh: '因eGFR < 30暂不用SGLT2i;仅治疗贫血。',
            },
            score: 4,
            rationale: {
              en: 'Outdated; SGLT2i has been shown safe and beneficial down to eGFR 20.',
              zh: '观点过时;SGLT2i已被证实可安全用至eGFR 20且具获益。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Senior reg adds SGLT2i.', zh: '上级住院医师补开SGLT2i。' },
            },
          },
          {
            id: 'wait-and-see',
            label: {
              en: 'Watch and wait; review in 6 months.',
              zh: '观察等待;6个月后复诊。',
            },
            score: -4,
            rationale: {
              en: 'CKD progression continues; misses both protective therapy and AVF lead time.',
              zh: 'CKD会继续进展;错失肾保护治疗与AVF的提前时间。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'CKD progresses to G5 before AVF created.',
                zh: '尚未建AVF,CKD已进展至G5。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'avf-creation',
      department: 'ot',
      facility: 'nuh',
      durationMin: 120,
      costSGD: 4200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 6 },
      framing: {
        patient: {
          en: '(local anaesthesia; the surgeon talks you through every step.)',
          zh: '(局部麻醉;外科医生一步一步告诉你在做什么。)',
        },
        caregiver: {
          en: 'You\'re told to feel for the "thrill" each morning.',
          zh: '你被嘱咐每天清晨摸一下AVF的"震颤感"。',
        },
        staff: {
          en: 'Brachiocephalic AVF created; maturation expected in 6–12 weeks.',
          zh: '建立肱-头静脉AVF;预计6–12周成熟。',
        },
      },
    },
    {
      id: 'transplant-discussion',
      department: 'soc',
      facility: 'nuh',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 4 },
      framing: {
        patient: {
          en: 'A new doctor; she explains transplant lists and living donation.',
          zh: '换了一位医生;她解释肾移植轮候名单与活体捐肾。',
        },
        caregiver: { en: 'Your son volunteers to be tested.', zh: '儿子主动提出愿意做配型。' },
        staff: {
          en: 'Transplant work-up initiated; cardiac, infection screen, HLA typing.',
          zh: '启动移植前评估;心脏检查、感染筛查、HLA配型。',
        },
      },
      decision: {
        id: 'rrt-modality',
        prompt: {
          en: 'Modality discussion: HD vs PD vs pre-emptive transplant. He is a working lorry driver, lives with wife and son.',
          zh: '讨论RRT方式:血液透析(HD)vs 腹膜透析(PD)vs 抢先肾移植。他是在职货车司机,和太太儿子同住。',
        },
        weight: 1.2,
        reference: PRE_DIALYSIS,
        options: [
          {
            id: 'transplant-list',
            label: {
              en: 'List for transplant + start in-centre HD via AVF when needed; living donor work-up for son.',
              zh: '列入移植轮候名单 + 需要时通过AVF开始中心血液透析;同步评估儿子是否符合活体捐肾。',
            },
            score: 10,
            rationale: {
              en: 'Pre-emptive transplant is best; HD as bridge keeps him working flexibly.',
              zh: '抢先肾移植效果最好;HD作为过渡可让他保持工作灵活度。',
            },
            outcome: {
              patient: { en: 'A long road, but a clearer one.', zh: '一条漫长但清晰的路。' },
              caregiver: { en: 'Your son begins testing.', zh: '儿子开始做各项检查。' },
              staff: { en: 'Transplant team takes over coordination.', zh: '移植团队接手协调。' },
            },
          },
          {
            id: 'home-pd',
            label: {
              en: 'Start home peritoneal dialysis immediately, defer transplant.',
              zh: '立即开始居家腹膜透析,移植暂缓。',
            },
            score: 7,
            rationale: {
              en: 'PD is reasonable; preserves work + lifestyle. Transplant should still be discussed in parallel.',
              zh: '腹膜透析合理;有利于继续工作和生活方式。移植仍应同时讨论。',
            },
            outcome: {
              patient: {
                en: 'Bags and a cycler at home.',
                zh: '家里多了透析液袋和循环治疗仪。',
              },
              caregiver: { en: 'You learn the protocol.', zh: '你学会整套操作流程。' },
              staff: {
                en: 'Transplant deferred — minor opportunity cost.',
                zh: '移植暂缓 — 存在一定机会成本。',
              },
            },
          },
          {
            id: 'in-centre-hd-only',
            label: {
              en: 'In-centre HD only; no transplant discussion.',
              zh: '只走中心血液透析,不讨论移植。',
            },
            score: 4,
            rationale: {
              en: 'Misses the best long-term option for a fit 62-year-old.',
              zh: '对一位身体尚可的62岁患者而言,错失最佳长期方案。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Reg flags the gap.', zh: '住院医师指出此缺漏。' },
            },
          },
        ],
      },
    },
    {
      id: 'first-hd-session',
      department: 'treatment-room',
      facility: 'nkf',
      durationMin: 240,
      costSGD: 380,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 10, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'A reclining chair, four hours, the news on the TV opposite.',
          zh: '一张可斜躺的椅子,四个小时,对面的电视在播新闻。',
        },
        caregiver: { en: 'You bring lunch in a tiffin.', zh: '你带了便当(tiffin)过来。' },
        staff: {
          en: 'NKF dialysis centre: AVF cannulated; uneventful first session; subsidy + MediSave handled at counter.',
          zh: 'NKF透析中心:AVF穿刺;首次透析顺利;津贴 + 保健储蓄(MediSave)在柜台处理。',
        },
      },
    },
    {
      id: 'ongoing-care',
      department: 'discharge',
      facility: 'nkf',
      durationMin: 30,
      framing: {
        patient: {
          en: 'Three days a week, four hours each. You learn to schedule trips around it.',
          zh: '一周三次,每次四小时。你学着围绕透析时间安排长途出车。',
        },
        caregiver: { en: 'You drive him on Mondays.', zh: '太太每周一开车送他。' },
        staff: {
          en: 'Stable; transplant work-up ongoing in parallel.',
          zh: '病情稳定;同时持续推进移植评估。',
        },
      },
      decision: {
        id: 'continuity',
        prompt: { en: 'Long-term care plan?', zh: '长期照护方案?' },
        weight: 1,
        reference: KDIGO,
        options: [
          {
            id: 'shared-care',
            label: {
              en: 'NKF for HD; NUH renal SOC quarterly; Healthier-SG GP for diabetes / BP / vaccines.',
              zh: 'NKF负责血液透析;NUH肾内科门诊每3个月复诊一次;Healthier SG家庭医生管理糖尿病 / 血压 / 疫苗。',
            },
            score: 10,
            rationale: { en: 'Right-sited continuity.', zh: '分级就诊带来的连续性。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'soc-only',
            label: { en: 'NUH SOC for everything.', zh: 'NUH专科门诊负责所有事项。' },
            score: 5,
            rationale: {
              en: 'Specialist-only; no primary care.',
              zh: '只有专科;缺乏基层照护。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'Dialysis only.', zh: '只做透析,不安排其他随访。' },
            score: -4,
            rationale: {
              en: 'Misses chronic-disease management.',
              zh: '错失慢性病管理。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
