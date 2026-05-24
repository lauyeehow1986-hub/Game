import type { CaseDefinition } from '../../lib/types';

const NICE_CATARACT = {
  label: { en: 'NICE NG77 — Cataracts in adults', zh: 'NICE NG77 — 成人白内障' },
  body: {
    en: 'NICE guideline on cataract management; surgery indicated when cataract impacts function or quality of life.',
    zh: 'NICE对白内障管理的指南;当白内障影响功能或生活质量时建议手术。',
  },
};

const MOH_DAY_SURGERY = {
  label: { en: 'MOH Day-Surgery Subsidy Framework', zh: '卫生部日间手术津贴框架' },
  body: {
    en: 'Day-surgery procedures including cataract phacoemulsification are eligible for ward-class-equivalent subsidy at restructured hospitals.',
    zh: '在政府改组医院进行的日间手术 — 包括超声乳化白内障手术 — 可享与病房等级对应的津贴。',
  },
};

const IP_RIDERS = {
  label: { en: 'MOH Integrated Shield Plan / Rider Reform (2018)', zh: '卫生部综合健保附加险及附加险改革(2018)' },
  body: {
    en: 'Co-payment requirements on IP riders; private as-charged plans subject to claim-based pricing and panel network.',
    zh: 'IP附加险须设有共付额;私立"按实付"计划须遵循基于理赔的定价及指定医生网络。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'Healthier SG', zh: 'Healthier SG' },
  body: {
    en: 'Right-siting stable post-op patients to a primary-care provider for follow-up.',
    zh: '术后病情稳定的患者按分级就诊原则转回基层医疗随访。',
  },
};

export const privateCataract: CaseDefinition = {
  id: 'private-cataract',
  title: {
    en: 'Cataract — public SNEC vs private (Mt Elizabeth Novena)',
    zh: '白内障 — 公立SNEC对比私立(诺维娜伊丽莎白山医院)',
  },
  blurb: {
    en: 'Mdm Lim, 71. Right-eye cataract, vision down to 6/24, struggling with reading and night driving. CHAS Orange + Merdeka Generation; her son insists on a private surgeon she found online. She has an IP rider on a Class B1/A plan.',
    zh: '林女士,71岁。右眼白内障,视力降至6/24,看报与夜间开车都吃力。持CHAS橙卡 + 立国一代;儿子坚持找他在网上看到的一位私立医生。她有附加险(IP rider),覆盖B1/A级。',
  },
  category: 'elective',
  primaryFacility: 'snec',
  involvedFacilities: ['snec', 'mt-elizabeth-novena', 'novena-medical', 'gp-healthway'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [NICE_CATARACT, MOH_DAY_SURGERY, IP_RIDERS, HEALTHIER_SG],
  pathway: [
    {
      id: 'gp-referral',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 25,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: {
          en: 'You squint at the eye chart. The doctor confirms what you suspected.',
          zh: '你眯着眼看视力表。医生证实了你猜想已久的事。',
        },
        caregiver: {
          en: 'Your son is on his phone reading reviews of private eye surgeons.',
          zh: '儿子在手机上查私立眼科医生的评价。',
        },
        staff: {
          en: 'GP confirms cataract; offers subsidised SNEC referral or private referral.',
          zh: '家庭医生确诊白内障;给出津贴SNEC转介或私立转介两种选择。',
        },
      },
      decision: {
        id: 'venue-choice',
        prompt: {
          en: 'Where to refer? She has CHAS Orange + MG card; IP rider B1/A integrated plan with co-payment.',
          zh: '该转到哪里?她持CHAS橙卡 + 立国一代MG卡;IP附加险为B1/A级综合计划,含共付额。',
        },
        weight: 1.5,
        reference: IP_RIDERS,
        options: [
          {
            id: 'snec-subsidised',
            label: {
              en: 'Subsidised referral to SNEC; expect day-surgery phaco at ~S$1,200 patient share post-subsidy and MediShield.',
              zh: '津贴价转介至SNEC;日间手术超声乳化术,扣除津贴及MediShield后患者自付约S$1,200。',
            },
            score: 10,
            rationale: {
              en: 'Best value for a low-income MG senior. SNEC volumes among highest in the world; outcomes equivalent to private. Honour IP only when value-add justifies it.',
              zh: '对低收入立国一代长者而言性价比最佳。SNEC手术量位列全球前列;结果与私立相当。IP附加险应在确有附加价值时才动用。',
            },
            outcome: {
              patient: {
                en: 'A pink referral letter; appointment in 5 weeks.',
                zh: '一封粉红色转介信;5周后的预约。',
              },
              caregiver: {
                en: 'You grumble about the wait but accept the bill estimate.',
                zh: '你嫌等得久,但账单估算让你愿意接受。',
              },
              staff: { en: 'NEHR populated; SNEC accepts.', zh: 'NEHR记录已更新;SNEC已接收。' },
            },
          },
          {
            id: 'private-mt-e',
            label: {
              en: "Private referral to Mt Elizabeth Novena (son's choice); will rely on IP rider.",
              zh: '私立转介至伊丽莎白诺维娜医院(儿子选的);主要靠IP附加险报销。',
            },
            score: 5,
            rationale: {
              en: 'Choice of surgeon and short wait, but private day-surgery cataract is ~S$5,000–8,000 — IP rider co-payment plus excess can still be material; avoidable cost for a routine procedure.',
              zh: '可选医生、等待短,但私立日间白内障手术约S$5,000–8,000 — IP共付额加自付费仍可能不小;常规手术费用本可避免。',
            },
            outcome: {
              patient: {
                en: 'A consult in 2 weeks; an immaculate clinic.',
                zh: '两周后就能看诊;诊所环境无可挑剔。',
              },
              caregiver: {
                en: 'You feel reassured; the bill arrives later.',
                zh: '你觉得安心;账单稍后才寄到。',
              },
              staff: {
                en: 'Private referral letter issued; cost discussed.',
                zh: '私立转介信已开具;已讨论费用。',
              },
            },
          },
          {
            id: 'wait-watch',
            label: {
              en: 'Defer surgery, prescribe new spectacles only.',
              zh: '暂缓手术,仅重新配眼镜。',
            },
            score: 3,
            rationale: {
              en: 'Reasonable if function is acceptable, but vision 6/24 is well below driving threshold; quality-of-life impact warrants surgery.',
              zh: '如功能尚可可考虑;但视力6/24远低于驾驶门槛,对生活质量影响明显,应安排手术。',
            },
            outcome: {
              patient: { en: 'You stop driving at night.', zh: '你晚上不再开车。' },
              caregiver: { en: 'You drive her around.', zh: '儿子接送她出门。' },
              staff: { en: 'Conservative; revisit in 6 months.', zh: '保守处理;6个月后复评。' },
            },
          },
        ],
      },
    },
    {
      id: 'private-consult',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 45,
      costSGD: 350,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 8 },
      framing: {
        patient: {
          en: 'A bright suite, soft music. The receptionist offers tea.',
          zh: '明亮的诊室,放着轻音乐。前台递来一杯茶。',
        },
        caregiver: { en: 'You scan the bill at the front desk.', zh: '你在前台扫账单看了一眼。' },
        staff: {
          en: 'Private OT&A: dense nuclear cataract right; mild on left. Consents signed; surgery booked at MEN day-surgery.',
          zh: '私立眼科:右眼核性白内障致密,左眼轻度。同意书已签;预约在MEN(伊丽莎白诺维娜)日间手术中心。',
        },
      },
      decision: {
        id: 'lens-choice',
        prompt: {
          en: 'IOL choice: monofocal vs multifocal vs toric. Strong family pressure for the most premium lens.',
          zh: '人工晶体(IOL)选择:单焦点 vs 多焦点 vs 散光矫正型。家属强烈倾向最高级别的晶体。',
        },
        weight: 1.2,
        reference: NICE_CATARACT,
        options: [
          {
            id: 'monofocal',
            label: {
              en: 'Monofocal IOL (standard, fully covered by IP for the lens; reading glasses for near).',
              zh: '单焦点IOL(标准款;晶体本身可全数纳入IP理赔;近距离戴老花镜)。',
            },
            score: 10,
            rationale: {
              en: 'Excellent visual outcomes at any centre; standard of care. Premium lenses charge a non-claimable upgrade; not justified by clinical benefit in most patients.',
              zh: '任何中心皆有优秀视觉结果;属标准照护。高端晶体收取不能报销的升级费;对多数患者无临床获益。',
            },
            outcome: {
              patient: {
                en: 'You will need reading glasses afterwards. You are fine with that.',
                zh: '术后看近需要老花镜。你能接受。',
              },
              caregiver: { en: 'Bill comes down significantly.', zh: '账单显著下降。' },
              staff: { en: 'Sensible; patient counselled.', zh: '理性选择;已对患者作说明。' },
            },
          },
          {
            id: 'multifocal',
            label: {
              en: 'Multifocal premium IOL — patient pays substantial out-of-pocket upgrade.',
              zh: '多焦点高级IOL — 患者需自付可观升级费。',
            },
            score: 6,
            rationale: {
              en: 'Acceptable in selected patients comfortable with halos / glare and able to afford the upgrade; not better outcomes for everyone.',
              zh: '若患者能接受光晕/眩光且经济能负担可考虑;对所有人并非更佳选择。',
            },
            outcome: {
              patient: {
                en: 'No more glasses for most things — but halos at night.',
                zh: '多数情况无需眼镜 — 但夜间有光晕。',
              },
              caregiver: { en: 'Bill grows.', zh: '账单上升。' },
              staff: { en: 'Counselled on glare.', zh: '已就眩光风险作辅导。' },
            },
          },
          {
            id: 'toric',
            label: {
              en: 'Toric IOL for astigmatism (≥1.5 D corneal astigmatism on biometry).',
              zh: '散光矫正型IOL(生物测量提示角膜散光≥1.5 D)。',
            },
            score: 8,
            rationale: {
              en: 'Indicated when corneal astigmatism is significant; refractive outcomes better than monofocal here. Some upgrade cost.',
              zh: '角膜散光显著时有适应症;此种情况下屈光结果优于单焦点。需支付一定升级费。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Reasonable when astigmatism present.', zh: '有散光时合理。' },
            },
          },
        ],
      },
    },
    {
      id: 'private-surgery',
      department: 'ot',
      facility: 'mt-elizabeth-novena',
      durationMin: 60,
      costSGD: 6800,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 8, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'A short procedure. Bright lights, drops, your eye numb. You watch a colour change you can\'t describe.',
          zh: '一次短短的手术。强光、滴眼液、眼睛麻木。你看到一种说不出来的颜色变化。',
        },
        caregiver: {
          en: 'You wait in a quiet lounge with a magazine.',
          zh: '你在安静的休息区翻杂志等候。',
        },
        staff: {
          en: 'Phacoemulsification + monofocal IOL implant right eye. Uneventful. Day-surgery discharge.',
          zh: '右眼超声乳化术 + 单焦点IOL植入。过程顺利。日间手术后出院。',
        },
      },
    },
    {
      id: 'private-followup',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 20,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2 },
      framing: {
        patient: {
          en: 'Day-1 review. The chart now shows 6/9. You read the numbers aloud.',
          zh: '术后第一天复查。视力表上写着6/9。你把数字念出来。',
        },
        caregiver: { en: 'You both laugh.', zh: '两人都笑了。' },
        staff: {
          en: 'POD1 — uncorrected VA 6/9 right; quiet AC; IOP 14. Drops schedule reinforced.',
          zh: '术后第1天 — 右眼裸视6/9;前房安静;眼压14。再次嘱咐滴眼液时间表。',
        },
      },
    },
    {
      id: 'right-siting',
      department: 'discharge',
      facility: 'novena-medical',
      durationMin: 10,
      framing: {
        patient: {
          en: 'They ask about your other eye. You say not yet.',
          zh: '医生问起另一只眼。你说还没准备好。',
        },
        caregiver: { en: 'You note the next review date.', zh: '你把下次复查日期记下来。' },
        staff: {
          en: 'Long-term plan: GP for chronic eye drops if needed; second eye when ready.',
          zh: '长期方案:慢性滴眼液由家庭医生续配;另一只眼准备好后再处理。',
        },
      },
      decision: {
        id: 'long-term',
        prompt: {
          en: 'Long-term plan for the second eye and ongoing eye health?',
          zh: '另一只眼及长期眼睛健康的安排?',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'snec-second-eye',
            label: {
              en: "Subsidised SNEC for the second eye when ready; GP for routine optometry / hypertension; revisit in 12 months.",
              zh: '另一只眼准备好后走津贴SNEC路径;家庭医生负责常规验光与高血压管理;12个月后复诊。',
            },
            score: 10,
            rationale: {
              en: 'Once private convenience served the urgent eye, the second eye does not need the same premium; SNEC offers the same outcome at lower cost.',
              zh: '紧急的那只眼已享受过私立便利;另一只眼无需再支付溢价;SNEC同等效果而成本更低。',
            },
            outcome: {
              patient: { en: 'You agree.', zh: '你同意了。' },
              caregiver: { en: 'Your wallet thanks you.', zh: '你的钱包松了一口气。' },
              staff: {
                en: 'NEHR populated; subsidised pathway re-engaged.',
                zh: 'NEHR记录已更新;重新走津贴路径。',
              },
            },
          },
          {
            id: 'private-everything',
            label: {
              en: 'Continue private for second eye and routine review.',
              zh: '另一只眼及常规复查也继续走私立。',
            },
            score: 4,
            rationale: {
              en: 'Convenient but doubles cost without clinical advantage.',
              zh: '方便但花费翻倍,且无临床优势。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Cost climbs.', zh: '费用上升。' },
              staff: { en: 'OK.', zh: '可以。' },
            },
          },
          {
            id: 'no-followup',
            label: {
              en: 'No structured plan; come back when symptomatic.',
              zh: '不安排结构化方案;有症状再来。',
            },
            score: -3,
            rationale: {
              en: 'Misses the opportunity to plan the second eye and detect glaucoma / AMD early.',
              zh: '错过另一只眼的规划机会,也错过青光眼 / 老年黄斑变性的早期发现。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Missed surveillance.', zh: '错过监测机会。' },
            },
          },
        ],
      },
    },
  ],
};
