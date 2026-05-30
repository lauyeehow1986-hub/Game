import type { CaseDefinition } from '../../lib/types';

const EGS_AACG = {
  label: { en: 'EGS Terminology & Guidelines for Glaucoma, 6th edition (2024) — Acute angle closure', zh: '欧洲青光眼学会《青光眼术语与指南》第6版(2024) — 急性闭角型青光眼' },
  body: {
    en: 'Acute primary angle closure: rapid IOP lowering with topical + systemic agents, laser peripheral iridotomy as definitive treatment, prophylactic iridotomy in the fellow eye.',
    zh: '急性原发性闭角型青光眼:迅速以局部+全身药物降眼压,激光周边虹膜切开术为根治治疗,对侧眼行预防性虹膜切开。',
  },
};

const SNEC_EMERG = {
  label: { en: 'SNEC 24-h Ophthalmology Emergency', zh: 'SNEC 24小时眼科急诊' },
  body: {
    en: 'Singapore National Eye Centre runs a 24/7 ophthalmology emergency service at Outram. Walk-in or polyclinic referral; specialist on call.',
    zh: '新加坡国家眼科中心(SNEC)位于欧南园,设有24小时眼科急诊。可直接前往或由综合诊疗所转介;专科医生随叫随到。',
  },
};

const POLY_RED_EYE = {
  label: { en: 'Polyclinic red-eye triage', zh: '综合诊疗所红眼分诊' },
  body: {
    en: 'Polyclinic family-physician approach to acute painful red eye: red-flag screen (vision loss, severe pain, photophobia, halos, IOP), differential (AACG vs uveitis vs corneal injury vs keratitis), triage to SNEC if any red flag.',
    zh: '综合诊疗所家庭医生处理急性疼痛红眼的方法:危险征兆筛查(视力下降、剧痛、畏光、看见光环、眼压),鉴别诊断(AACG vs 葡萄膜炎 vs 角膜外伤 vs 角膜炎),任何危险征兆即转介SNEC。',
  },
};

export const acuteAngleClosureCase: CaseDefinition = {
  id: 'acute-angle-closure',
  title: {
    en: 'Acute angle-closure glaucoma — polyclinic → SNEC emergency',
    zh: '急性闭角型青光眼 — 综合诊疗所 → SNEC急诊',
  },
  blurb: {
    en: "Mdm Goh, 68, hyperopic. Severe right-eye pain at home this morning with nausea and seeing halos around lights. Visual acuity is reduced. Walks into Outram polyclinic at 9am.",
    zh: '吴女士,68岁,远视。今早在家突发右眼剧烈疼痛,合并恶心,看到灯光出现光环。视力下降。上午9点步入欧南综合诊疗所。',
  },
  category: 'acute',
  primaryFacility: 'snec',
  involvedFacilities: ['shp-outram', 'snec'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 120,
    goalLabel: 'IOP-lowering by',
    missedFlag: 'iop-delayed',
  },
  guidelines: [POLY_RED_EYE, EGS_AACG, SNEC_EMERG],
  pathway: [
    {
      id: 'polyclinic-triage',
      department: 'gp-room',
      facility: 'shp-outram',
      durationMin: 20,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: {
          en: 'Your right eye throbs and your stomach turns. The lights in the corridor hurt to look at.',
          zh: '右眼跳着痛,胃里翻腾。走廊上的灯一看就眼疼。',
        },
        caregiver: {
          en: 'Your daughter drove you over. She helps you to a seat in the dim corner of the waiting room.',
          zh: '女儿开车送你来。她扶你到候诊室昏暗的角落坐下。',
        },
        staff: {
          en: 'GP: severe painful red right eye + nausea + halos + reduced VA. Cornea hazy, pupil mid-dilated and fixed. Provisional AACG.',
          zh: '家庭医生:右眼剧痛红肿 + 恶心 + 看到光环 + 视力下降。角膜雾状混浊,瞳孔中等大固定。初步诊断:急性闭角型青光眼(AACG)。',
        },
      },
      decision: {
        id: 'first-call',
        prompt: {
          en: 'Painful red eye + halos + nausea + reduced VA in a 68-y-o hyperope. Best next step?',
          zh: '68岁远视者出现疼痛性红眼 + 光环 + 恶心 + 视力下降。下一步最佳处理?',
        },
        weight: 1.5,
        reference: POLY_RED_EYE,
        options: [
          {
            id: 'snec-now',
            label: {
              en: 'Call SNEC 24-h Ophthalmology Emergency direct line; arrange same-morning urgent transfer.',
              zh: '直接拨打SNEC 24小时眼科急诊;安排当天上午紧急转送。',
            },
            score: 10,
            rationale: {
              en: 'Classic AACG: irreversible optic-nerve damage with every hour of high IOP. SNEC is 5 minutes away; same-morning urgent transfer with phone-ahead is the standard pathway from Outram polyclinic.',
              zh: '典型AACG:眼压每高出一小时,视神经损伤就更不可逆。SNEC距离只有5分钟;由欧南综合诊疗所先电话联系再当天紧急转送是标准路径。',
            },
            outcome: {
              patient: {
                en: 'A nurse helps you into a taxi. The driver knows the way.',
                zh: '护士扶你上德士。司机熟门熟路。',
              },
              caregiver: {
                en: 'You follow in your car.',
                zh: '你开车跟在后面。',
              },
              staff: {
                en: 'SNEC alerted; specialist meets the patient at triage.',
                zh: '已通知SNEC;专科医生在分诊处等候。',
              },
            },
            effects: { setFlags: ['snec-routed'] },
          },
          {
            id: 'start-eye-drops-here',
            label: {
              en: 'Start pilocarpine 2% + timolol 0.5% + IV acetazolamide at the polyclinic; then refer SNEC.',
              zh: '在综合诊疗所先给毛果芸香碱2% + 噻吗洛尔0.5% + 静脉乙酰唑胺;再转介SNEC。',
            },
            score: 8,
            rationale: {
              en: 'IOP-lowering at the first contact is reasonable if it does not delay specialist care. Polyclinics may not stock the full set; the time-to-SNEC is usually faster than working through emergency drug supplies. Defensible but second-best.',
              zh: '在首诊点降眼压若不耽误专科治疗也合理。综合诊疗所可能没有齐全的药物;往SNEC的转送时间往往比凑齐急救药快。说得通,但非最佳。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Drops administered; transferred to SNEC 30 min later.',
                zh: '给药完成;30分钟后转送SNEC。',
              },
            },
            effects: { setFlags: ['snec-routed'] },
          },
          {
            id: 'tomorrow-soc',
            label: {
              en: 'Prescribe analgesia and routine ophthalmology SOC appointment next week.',
              zh: '开止痛药,安排下周常规眼科专科门诊。',
            },
            score: -10,
            rationale: {
              en: 'AACG is a sight-threatening emergency — delay risks permanent visual loss. Routine SOC misses the diagnosis entirely.',
              zh: 'AACG是威胁视力的急症 — 延误可致永久性视力丧失。常规专科门诊完全错失诊断。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Returns 24h later with 6/60 vision.', zh: '24小时后视力降至6/60再就诊。' },
            },
            effects: { setFlags: ['iop-delayed', 'visual-loss'] },
          },
          {
            id: 'tan-tock-seng-ed',
            label: {
              en: 'Send to nearest acute hospital ED instead of SNEC.',
              zh: '送到最近的急性医院急诊,不去SNEC。',
            },
            score: 4,
            rationale: {
              en: 'Acute hospitals can stabilise but don\'t have on-site laser iridotomy capacity. SNEC, when reachable, gets the patient to the definitive treatment faster.',
              zh: '急性医院可稳定病情,但院内通常不具激光虹膜切开能力。可达SNEC时优先送SNEC,患者更快接受根治治疗。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['snec-routed'] },
          },
        ],
      },
    },
    {
      id: 'snec-emergency',
      department: 'screening',
      facility: 'snec',
      durationMin: 30,
      costSGD: 240,
      charge: 'a&e',
      requiresAnyFlag: ['snec-routed'],
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: {
          en: 'A glaucoma fellow examines you in a dim room. She measures your eye pressure and quietly says the number to the consultant.',
          zh: '一位青光眼专科Fellow在昏暗的房间里为你检查。她量了眼压,小声把数字告诉主治。',
        },
        caregiver: {
          en: 'You wait outside reading the patient leaflet.',
          zh: '你在外面等候,翻看病人须知。',
        },
        staff: {
          en: 'IOP 52 mmHg right (5 mmHg left). Gonio confirms closed angle. Visual acuity 6/24. Cornea hazy. Confirmed AACG.',
          zh: '右眼眼压52 mmHg(左眼5 mmHg)。前房角镜证实闭角。视力6/24。角膜雾状混浊。确诊AACG。',
        },
      },
      decision: {
        id: 'iop-lowering',
        prompt: {
          en: 'IOP 52. Initial medical management?',
          zh: '眼压52 mmHg。初始药物处理?',
        },
        weight: 1.5,
        reference: EGS_AACG,
        options: [
          {
            id: 'multi-agent',
            label: {
              en: 'Topical timolol + brimonidine + pilocarpine 2% + IV acetazolamide 500 mg; reassess IOP in 30 min; supine head-down for 30s mannitol if needed.',
              zh: '局部噻吗洛尔 + 溴莫尼定 + 毛果芸香碱2% + 静脉乙酰唑胺500 mg;30分钟后复测眼压;若必要给予甘露醇。',
            },
            score: 10,
            rationale: {
              en: 'Standard multi-agent AACG protocol. Pilocarpine constricts the pupil and pulls the iris off the trabecular meshwork; the others lower aqueous production.',
              zh: 'AACG的标准多药方案。毛果芸香碱缩瞳并把虹膜拉离小梁网;其他药物减少房水生成。',
            },
            outcome: {
              patient: {
                en: 'A burning drop, then several more. The nurse stays beside you.',
                zh: '一滴药水有灼热感,接着又点了几次。护士一直陪着你。',
              },
              caregiver: { en: '', zh: '' },
              staff: { en: 'IOP drops to 22 mmHg within 45 min; cornea clearing.', zh: '45分钟内眼压降至22 mmHg;角膜逐渐清亮。' },
            },
            effects: { setFlags: ['iop-controlled'] },
          },
          {
            id: 'timolol-only',
            label: {
              en: 'Topical timolol only; wait for response.',
              zh: '仅局部噻吗洛尔;等待反应。',
            },
            score: 1,
            rationale: {
              en: 'Inadequate for IOP 52. Multi-agent therapy is the standard for acute presentations.',
              zh: '眼压52时单药不足。急性发作的标准是多药联合。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'IOP barely drops in 1 h; switched to full protocol.', zh: '1小时内眼压几乎未降;改用完整方案。' },
            },
            effects: { setFlags: ['iop-delayed'] },
          },
          {
            id: 'pilocarpine-alone-high-dose',
            label: {
              en: 'Pilocarpine 4% drops every 5 minutes for 1 hour; nothing systemic.',
              zh: '每5分钟点一次毛果芸香碱4%,持续1小时;不给全身用药。',
            },
            score: -2,
            rationale: {
              en: 'High-dose pilocarpine alone can paradoxically worsen angle closure if the iris is ischaemic from very high IOP. Multi-agent is safer.',
              zh: '眼压极高时虹膜可能缺血;单用高浓度毛果芸香碱反而可能加重闭角。多药联合更安全。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'laser-iridotomy',
      department: 'ot',
      facility: 'snec',
      durationMin: 45,
      costSGD: 1800,
      charge: 'inpatient-procedure',
      requiresAnyFlag: ['iop-controlled'],
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8 },
      framing: {
        patient: {
          en: 'You sit at a slit lamp; the doctor clips a lens to your eye and warns of bright flashes.',
          zh: '你坐在裂隙灯前;医生在你眼前夹上特殊镜片,提醒会有强光闪烁。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'YAG peripheral iridotomy right eye, uncomplicated. Prophylactic PI offered for left eye in 1 week.',
          zh: '右眼YAG激光周边虹膜切开,过程顺利。一周后对左眼行预防性虹膜切开。',
        },
      },
      decision: {
        id: 'fellow-eye-pi',
        prompt: {
          en: 'Plan for the fellow (left) eye?',
          zh: '对侧(左)眼的处理?',
        },
        weight: 1,
        reference: EGS_AACG,
        options: [
          {
            id: 'prophylactic-pi',
            label: {
              en: 'Prophylactic laser peripheral iridotomy on the left eye within 1–2 weeks.',
              zh: '1–2周内对左眼行预防性激光周边虹膜切开。',
            },
            score: 10,
            rationale: {
              en: 'The fellow eye in AACG has a high (40–80%) lifetime risk of acute closure. Prophylactic PI is the standard of care.',
              zh: 'AACG患者对侧眼终生闭角风险高(40–80%)。预防性虹膜切开为标准照护。',
            },
            outcome: {
              patient: { en: 'You agree to the second laser.', zh: '你同意接受第二只眼的激光。' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'PI booked.', zh: '虹膜切开已预约。' },
            },
          },
          {
            id: 'watch-fellow-eye',
            label: { en: 'Watch and wait; only treat if symptomatic.', zh: '观察等待;有症状才处理。' },
            score: -4,
            rationale: {
              en: 'Misses primary-prevention opportunity; high reattendance risk.',
              zh: '错过一级预防机会;再就诊风险高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'right-siting',
      department: 'discharge',
      facility: 'snec',
      durationMin: 20,
      framing: {
        patient: {
          en: 'A care coordinator hands you a follow-up card and explains your drop schedule.',
          zh: '医疗协调员递给你一张复诊卡,讲解滴眼液时间表。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Stable. Standard follow-up at SNEC for IOP + visual fields. Drops continued for 1 month.',
          zh: '病情稳定。SNEC安排眼压及视野复查。滴眼液继续1个月。',
        },
      },
      decision: {
        id: 'longterm-followup',
        prompt: { en: 'Long-term follow-up plan?', zh: '长期随访方案?' },
        weight: 1,
        reference: SNEC_EMERG,
        options: [
          {
            id: 'snec-then-poly',
            label: {
              en: 'SNEC at 3 months for visual field + IOP, then annual; polyclinic for chronic disease + general primary care.',
              zh: '3个月后SNEC复查视野+眼压,之后每年一次;综合诊疗所负责慢性病及一般基层照护。',
            },
            score: 10,
            rationale: {
              en: 'Specialist surveillance for glaucoma progression + primary care for everything else. Right-sited continuity.',
              zh: '专科监测青光眼进展,基层照护其余事项。分级就诊的连续性。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'private',
            label: { en: 'Continue private ophthalmologist for everything.', zh: '所有事都交私立眼科医生。' },
            score: 4,
            rationale: {
              en: 'Acceptable if IP rider covers it; loses SNEC subsidy and the cluster\'s glaucoma research follow-up.',
              zh: '若有IP附加险可接受;失去SNEC津贴及SingHealth集群青光眼专科随访。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-noplan',
            label: { en: 'No follow-up.', zh: '不安排随访。' },
            score: -4,
            rationale: {
              en: 'Glaucoma can progress silently; surveillance is essential.',
              zh: '青光眼可无症状进展;监测必不可少。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
