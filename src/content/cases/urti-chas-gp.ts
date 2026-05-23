import type { CaseDefinition } from '../../lib/types';

const HEALTHIER_SG = {
  label: { en: 'Healthier SG (2023)', zh: 'Healthier SG 健康SG(2023年)' },
  body: {
    en: "MOH primary-care continuity programme; one-physician chronic-care relationship.",
    zh: '卫生部基层医疗连续性计划;由一位家庭医生持续管理慢性疾病的关系。',
  },
};

const CHAS = {
  label: { en: 'CHAS Subsidy Framework', zh: 'CHAS社保援助津贴框架' },
  body: {
    en: 'Community Health Assist Scheme — tiered subsidies (Blue / Orange / Green + PG/MG) at participating private GPs and dentists.',
    zh: '社区医疗援助计划(CHAS) — 在参与计划的私人家庭医生和牙医处提供分级津贴(蓝/橙/绿卡 + 建国一代PG / 立国一代MG)。',
  },
};

const TELEMED_GUIDE = {
  label: { en: 'MOH Direct Telemedicine Services Guidelines', zh: '卫生部远程医疗服务直接执业准则' },
  body: {
    en: 'MOH guidance on safe telemedicine practice — scope, identity verification, prescribing limits, NEHR contribution.',
    zh: '卫生部对安全远程医疗执业的指引 — 涵盖服务范围、身份验证、处方限制、以及国家电子健康记录(NEHR)的资料贡献。',
  },
};

const ANTIBIOTIC_STEWARDSHIP = {
  label: { en: 'MOH Antimicrobial Stewardship', zh: '卫生部抗生素管理指引' },
  body: {
    en: 'Singapore primary-care guidance on URTI antibiotic prescribing — most viral, do not prescribe.',
    zh: '新加坡基层医疗对上呼吸道感染开抗生素的指引 — 多数为病毒感染,不应开抗生素。',
  },
};

export const urtiChasGP: CaseDefinition = {
  id: 'urti-chas-gp',
  title: {
    en: 'URTI — adult patient choosing telemed vs CHAS GP vs polyclinic',
    zh: '上呼吸道感染 — 成年患者在远程医疗 / CHAS家庭医生 / 综合诊疗所之间选择',
  },
  blurb: {
    en: 'Mr Rajan, 62. Long-distance lorry driver, CHAS Orange, on metformin and SGLT2i for T2DM. Two days of cough, runny nose, mild fever. Wife wants him to "see someone today".',
    zh: 'Rajan先生,62岁。长途货车司机,持CHAS橙卡,因2型糖尿病服用二甲双胍及SGLT2抑制剂。咳嗽、流鼻涕、低烧已两天。太太坚持"今天一定要看医生"。',
  },
  category: 'outpatient',
  primaryFacility: 'gp-healthway',
  involvedFacilities: ['home', 'telemed-doctor-anywhere', 'gp-healthway', 'nhgp-toa-payoh'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [HEALTHIER_SG, CHAS, TELEMED_GUIDE, ANTIBIOTIC_STEWARDSHIP],
  pathway: [
    {
      id: 'home-decision',
      department: 'entrance',
      facility: 'home',
      durationMin: 10,
      framing: {
        patient: {
          en: "You're tired. You'd rather sleep. Your wife is in the doorway with her phone.",
          zh: '你很累,只想睡觉。太太站在门口,手机举在手上。',
        },
        caregiver: {
          en: 'You scroll through three healthcare apps. The wait at the polyclinic is 90 minutes online.',
          zh: '你滑过三个医疗App。综合诊疗所的网上排队显示要等90分钟。',
        },
        staff: {
          en: '(care coordinator perspective: most stable URTIs can be handled at primary care or via telemed safely)',
          zh: '(医疗协调员视角:大多数稳定的上呼吸道感染可在基层医疗或远程医疗中安全处理。)',
        },
      },
      decision: {
        id: 'choose-entry-point',
        prompt: {
          en: 'Adult with mild URTI, on a chronic disease, CHAS Orange. Where should the wife route him for fastest, safest, cheapest care?',
          zh: '成年人,轻度上呼吸道感染,有慢性病,持CHAS橙卡。太太该送他去哪里 — 最快、最安全、最划算?',
        },
        weight: 1.5,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'chas-gp',
            label: {
              en: 'CHAS-participating GP nearby (Healthway Medical) — same-day appointment, CHAS Orange subsidy applies; routine drop-off for metformin refill at the same visit.',
              zh: '附近参与CHAS的家庭医生(康威医疗 Healthway Medical) — 当日有空,CHAS橙卡津贴适用;顺便补开二甲双胍。',
            },
            score: 10,
            rationale: {
              en: "Single visit handles acute symptoms + chronic prescription continuity at lowest patient cost (CHAS subsidy). Best fit for Healthier-SG continuity.",
              zh: '一次就诊同时处理急性症状与慢性病续药,患者自付最少(享CHAS津贴)。最契合Healthier SG的连续性照护原则。',
            },
            outcome: {
              patient: { en: 'A 7-minute walk. The clinic remembers your name.', zh: '步行7分钟。诊所记得你的名字。' },
              caregiver: { en: 'You take 30 minutes off work.', zh: '你请了半小时假。' },
              staff: {
                en: 'Patient seen, prescription refilled, NEHR contribution from CHAS clinic.',
                zh: '患者已就诊,处方已续开,CHAS诊所向NEHR上传记录。',
              },
            },
          },
          {
            id: 'telemed',
            label: {
              en: 'Doctor Anywhere telemed — instant video consult; e-prescription delivered in 2 hours.',
              zh: 'Doctor Anywhere 远程医疗 — 即时视讯问诊;电子处方2小时内送达。',
            },
            score: 7,
            rationale: {
              en: 'Fast and convenient for clearly mild URTI. Cost is private rate (no CHAS via telemed providers); chronic-disease prescription via telemed only safe if recent labs available.',
              zh: '对明显轻度的上呼吸道感染又快又方便。但费用按私人价计算(远程医疗供应商不接CHAS);慢性病处方仅在近期化验齐全时才适合远程开。',
            },
            outcome: {
              patient: {
                en: '(You answer questions on a video call from the sofa.)',
                zh: '(你窝在沙发上,通过视讯回答问题。)',
              },
              caregiver: { en: 'Resolved in 30 minutes.', zh: '半小时搞定。' },
              staff: {
                en: 'Telemed note may or may not flow into NEHR; chronic care continuity at risk if used as primary route.',
                zh: '远程医疗的病历未必上传NEHR;若长期作为主要就诊管道,慢性病的连续性照护会受影响。',
              },
            },
          },
          {
            id: 'polyclinic',
            label: {
              en: 'Walk-in polyclinic (NHGP Toa Payoh) — most subsidised but long wait.',
              zh: '直接到综合诊疗所(NHGP大巴窑) — 津贴最高,但排队最久。',
            },
            score: 6,
            rationale: {
              en: "Cheapest but longest wait; polyclinic better used for chronic-disease reviews and complex acute presentations.",
              zh: '最便宜但等最久;综合诊疗所更适合处理慢性病复诊或复杂的急性病况。',
            },
            outcome: {
              patient: { en: 'Two-hour wait. You both regret the choice.', zh: '等了两小时。两人都开始后悔。' },
              caregiver: { en: 'Half-day off work.', zh: '半天工不见了。' },
              staff: {
                en: 'Polyclinic capacity used on a self-limiting URTI.',
                zh: '综合诊疗所的资源被一例自限性上呼吸道感染占用。',
              },
            },
          },
          {
            id: 'self-care-only',
            label: { en: 'Self-medicate from a pharmacy; no consult.', zh: '到药房买成药自医,不看医生。' },
            score: 3,
            rationale: {
              en: 'Reasonable for very mild symptoms in a healthy adult — but he has T2DM, so threshold to seek care should be slightly lower.',
              zh: '对健康成人若症状极轻可行 — 但他有2型糖尿病,就诊门槛理应略低。',
            },
            outcome: {
              patient: { en: 'You sleep better that afternoon.', zh: '那个下午睡得好一点了。' },
              caregiver: { en: 'You worry quietly.', zh: '你心里默默担心。' },
              staff: { en: '', zh: '' },
            },
          },
          {
            id: 'go-to-ed',
            label: { en: '995 to TTSH / KTPH ED.', zh: '打995叫救护车到TTSH / KTPH急诊。' },
            score: -8,
            rationale: {
              en: 'Wholly inappropriate for a mild URTI; clogs ED capacity and incurs major cost / time.',
              zh: '轻度上呼吸道感染完全不适合急诊;挤占急诊资源,费用和时间都高昂。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'ED capacity squeezed unnecessarily.', zh: '急诊资源被不必要地占用。' },
            },
          },
        ],
      },
    },
    {
      id: 'gp-consult',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 20,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 2 },
      framing: {
        patient: {
          en: 'The doctor smells of coffee and listens to your chest carefully.',
          zh: '医生身上有股咖啡味,他仔仔细细听了你的胸。',
        },
        caregiver: { en: 'You go for kopi while you wait.', zh: '你趁等的空档去喝杯咖啡。' },
        staff: {
          en: 'GP: T 37.6, clear chest, mild pharyngeal injection, no red flags. Reviews recent HbA1c (6.6%) — well controlled.',
          zh: '家庭医生:体温37.6,肺音清晰,咽部轻度充血,无危险征兆。复看近期HbA1c(6.6%)— 控制良好。',
        },
      },
      decision: {
        id: 'antibiotic-choice',
        prompt: {
          en: 'Mild URTI, no red flags, T2DM well controlled, no consolidation on examination. What do you prescribe?',
          zh: '轻度上呼吸道感染,无危险征兆,2型糖尿病控制良好,检查无肺实变。该开什么药?',
        },
        weight: 1.5,
        reference: ANTIBIOTIC_STEWARDSHIP,
        options: [
          {
            id: 'symptomatic-only',
            label: {
              en: 'Symptomatic care only: paracetamol PRN, hydration, salt-water gargle. Safety-net advice. No antibiotic. Continue diabetes meds; sick-day rules briefed.',
              zh: '仅对症处理:必要时服用扑热息痛、多喝水、盐水漱口。交代复诊红旗。不开抗生素。糖尿病药继续使用,并向他交代生病时的服药原则(sick-day rules)。',
            },
            score: 10,
            rationale: {
              en: "Most URTIs are viral. Antibiotic stewardship matters — Singapore primary-care AMR rates rising. Sick-day rules for SGLT2i particularly important (hold if dehydrated to avoid euDKA).",
              zh: '大部分上呼吸道感染为病毒性。抗生素管理至关重要 — 新加坡基层医疗的耐药率正在上升。SGLT2抑制剂的"生病时停药原则"尤其重要(脱水时停药,避免正常血糖糖尿病酮症酸中毒,即euDKA)。',
            },
            outcome: {
              patient: { en: 'A simple plan and a spare day.', zh: '一份简单的处理方案,加一天休息。' },
              caregiver: { en: 'You thank the doctor.', zh: '你向医生道谢。' },
              staff: {
                en: 'Adherent to MOH stewardship; brief diabetes safety check done.',
                zh: '符合卫生部抗生素管理指引;并简要做了糖尿病安全提醒。',
              },
            },
          },
          {
            id: 'amoxiclav',
            label: { en: 'Co-amoxiclav 625 mg TDS x 5 days.', zh: '阿莫西林/克拉维酸 625 mg,一日三次,共5天。' },
            score: -4,
            rationale: {
              en: 'Routine antibiotic for URTI is contrary to stewardship guidelines; adds adverse-effect risk and contributes to community AMR.',
              zh: '上呼吸道感染常规开抗生素违反管理指引;增加副作用风险并助长社区耐药性。',
            },
            outcome: {
              patient: { en: 'Diarrhoea on day 2.', zh: '第二天开始腹泻。' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Stewardship audit flag.', zh: '抗生素管理稽查被标记。' },
            },
          },
          {
            id: 'sglt2-cont',
            label: {
              en: 'Symptomatic care + continue SGLT2i without sick-day brief.',
              zh: '对症处理 + 继续服用SGLT2抑制剂,但未交代生病时的服药原则。',
            },
            score: 4,
            rationale: {
              en: 'Misses an important safety conversation: SGLT2i should be held if the patient is dehydrated / not eating to prevent euglycaemic DKA.',
              zh: '错过一次关键的安全沟通:脱水或进食不足时应停SGLT2抑制剂,以预防正常血糖糖尿病酮症酸中毒(euDKA)。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Patient told to come back if worse; no sick-day plan.',
                zh: '只交代"严重就回来",未给出生病时的服药方案。',
              },
            },
            effects: { setFlags: ['sglt2-sick-day-missed'] },
          },
        ],
      },
    },
    {
      id: 'eu-dka-readmission',
      department: 'ed',
      facility: 'ttsh',
      requiresAnyFlag: ['sglt2-sick-day-missed'],
      durationMin: 240,
      costSGD: 920,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 14, sleepDebt: 16 },
      framing: {
        patient: { en: '(Day 4: nauseous, drowsy, breathing fast.)', zh: '(第四天:恶心、嗜睡、呼吸急促。)' },
        caregiver: {
          en: 'You panic when he is too tired to walk to the kitchen. You drive to TTSH ED.',
          zh: '看他累得连走到厨房都不行,你慌了。开车送他到TTSH急诊。',
        },
        staff: {
          en: 'Euglycaemic DKA: glucose 9 but pH 7.18, ketones +++. Likely SGLT2i-related, dehydration, missed sick-day rules.',
          zh: '正常血糖糖尿病酮症酸中毒:血糖9 mmol/L,但pH 7.18,血酮+++。考虑SGLT2抑制剂相关、脱水、未遵循生病时停药原则。',
        },
      },
      decision: {
        id: 'eu-dka-management',
        prompt: { en: 'eu-DKA on a routine URTI. Plan?', zh: '上呼吸道感染却演变成eu-DKA。处理方案?' },
        weight: 1.2,
        reference: ANTIBIOTIC_STEWARDSHIP,
        options: [
          {
            id: 'standard-dka',
            label: {
              en: 'Stop SGLT2i; IV fluids + insulin infusion + dextrose; ICU admission. Endocrine review for restart timing.',
              zh: '停SGLT2抑制剂;静脉补液 + 胰岛素持续静滴 + 葡萄糖;收入ICU。内分泌科会诊以确定何时复用。',
            },
            score: 10,
            rationale: {
              en: 'Standard eu-DKA management; SGLT2i must be paused; restart timed once euvolaemic and well.',
              zh: '正常血糖糖尿病酮症酸中毒的标准处理;必须暂停SGLT2抑制剂;待容量恢复且病情稳定后再决定复用时机。',
            },
            outcome: {
              patient: { en: '(IV running.)', zh: '(静脉补液正在滴注。)' },
              caregiver: { en: 'You re-learn the medication list.', zh: '你重新把所有药一字一字记一次。' },
              staff: { en: '', zh: '' },
            },
            effects: { clearFlags: ['sglt2-sick-day-missed'] },
          },
          {
            id: 'continue-sglt2',
            label: { en: 'Continue SGLT2i; treat infection only.', zh: '继续SGLT2抑制剂,只处理感染。' },
            score: -8,
            rationale: {
              en: 'SGLT2i with active ketosis worsens the DKA loop.',
              zh: '酮症活跃时仍服用SGLT2抑制剂会进一步加重DKA循环。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'pharmacy-pickup',
      department: 'pharmacy',
      facility: 'gp-healthway',
      durationMin: 10,
      costSGD: 35,
      charge: 'pharmacy',
      framing: {
        patient: {
          en: 'A small bag with a paracetamol box and a top-up of metformin.',
          zh: '一个小袋,装着一盒扑热息痛和续配的二甲双胍。',
        },
        caregiver: {
          en: 'You walk home together; it is sunny and bright.',
          zh: '两人一起走回家;阳光很好。',
        },
        staff: {
          en: 'CHAS Orange subsidy applied at counter; receipt notes Flexi-MediSave on chronic items.',
          zh: '柜台已使用CHAS橙卡津贴;收据显示慢性药品已透过Flexi-MediSave结算。',
        },
      },
    },
    {
      id: 'right-siting-decision',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 10,
      framing: {
        patient: {
          en: 'The receptionist asks if you want to enrol with this GP under Healthier SG.',
          zh: '前台问你要不要在这位家庭医生处登记参加Healthier SG。',
        },
        caregiver: { en: 'You both look at each other.', zh: '两个人对视一眼。' },
        staff: {
          en: 'Healthier-SG enrolment discussion: continuity, CDMP, single-physician relationship.',
          zh: '说明Healthier SG登记:连续性、慢性病管理计划(CDMP)、由单一医生持续看诊的关系。',
        },
      },
      decision: {
        id: 'healthier-sg-enrol',
        prompt: {
          en: "He has a chronic disease and uses different clinics. What's the long-term primary-care plan?",
          zh: '他有慢性病,平时又在不同诊所看病。长远的基层医疗规划该怎么走?',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'enrol-here',
            label: {
              en: 'Enrol under Healthier SG with this CHAS-GP for both acute and chronic care; maintain SOC at NUH endo for tougher decisions.',
              zh: '在这位CHAS家庭医生处登记Healthier SG,急慢性病都由他看;复杂情况仍由NUH内分泌专科门诊管理。',
            },
            score: 10,
            rationale: {
              en: "Healthier-SG enrolment delivers continuity, CDMP-subsidised chronics, and a single-physician relationship. SOC reserved for complexity.",
              zh: 'Healthier SG登记带来连续性、CDMP津贴的慢性药物,以及与单一医生的固定关系。专科门诊则留给复杂的诊治。',
            },
            outcome: {
              patient: { en: 'You sign up. You\'re given a card.', zh: '你签名登记。前台递给你一张卡。' },
              caregiver: { en: 'You add the GP to your phone contacts.', zh: '你把医生的电话存进通讯录。' },
              staff: {
                en: 'Enrolment recorded in NEHR; care plan handover initiated.',
                zh: '登记已上传NEHR;照护方案的交接已启动。',
              },
            },
          },
          {
            id: 'shop-around',
            label: {
              en: 'Continue using whichever clinic is most convenient on the day.',
              zh: '哪家诊所方便就去哪家,不固定。',
            },
            score: 4,
            rationale: {
              en: 'Loses continuity; chronic care fragmented; misses Healthier-SG / CDMP optimisation.',
              zh: '失去连续性;慢性病照护碎片化;错过Healthier SG / CDMP的优化机会。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Care plan harder to coordinate.', zh: '照护方案难以协调。' },
            },
          },
          {
            id: 'telemed-only',
            label: { en: 'Telemed for everything from now on.', zh: '今后所有问题都用远程医疗。' },
            score: 3,
            rationale: {
              en: 'Convenient but loses physical examination, in-clinic vaccinations, and (currently) full NEHR continuity.',
              zh: '方便,但失去理学检查、诊所内的疫苗接种,以及(目前而言)完整的NEHR连续性。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Useful adjunct but not best as sole care channel.',
                zh: '作为辅助管道有用,但不宜作为唯一的就诊渠道。',
              },
            },
          },
        ],
      },
    },
  ],
};
