import type { CaseDefinition } from '../../lib/types';

const RCOG = {
  label: { en: 'RCOG / NICE / KKH Antenatal Pathways', zh: '英国皇家妇产科学院(RCOG)/ NICE / KKH 产前诊疗路径' },
  body: {
    en: 'Antenatal screening, gestational diabetes, anaemia, foetal monitoring.',
    zh: '产前筛查、妊娠糖尿病、贫血、胎儿监测。',
  },
};

const KKH_OBS = {
  label: { en: "KKH Women's Health CPG", zh: 'KKH妇女健康临床实践指南' },
  body: {
    en: 'KKH practice for low- and intermediate-risk obstetrics: birth-suite care, epidural pathway, postpartum care.',
    zh: 'KKH针对低风险及中风险产科的临床实践:产房照护、硬膜外镇痛路径、产后照护。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'Healthier SG (paeds & post-natal)', zh: 'Healthier SG(儿科与产后照护)' },
  body: {
    en: 'Right-siting healthy mother and baby to a Healthier-SG GP for routine post-natal and well-baby care.',
    zh: '将健康母婴的常规产后及健康儿童照护转至Healthier SG家庭医生。',
  },
};

export const obstetricDeliveryCase: CaseDefinition = {
  id: 'obstetric-delivery',
  title: {
    en: 'Antenatal-to-delivery — private GP shared-care to KKH delivery',
    zh: '产前到分娩 — 私立家庭医生联合护理至KKH分娩',
  },
  blurb: {
    en: "Mrs Lim, 31. First pregnancy. Antenatal care shared between Healthway (GP) and a private OBGYN at Mt Elizabeth Novena. Booked for delivery at KKH (subsidised, B2 ward) given developing GDM. Waters break at 39+2 at home.",
    zh: '林太太,31岁,初次怀孕。产前由康威医疗(Healthway)家庭医生与伊丽莎白诺维娜医院的私立妇产科医生共同照护。因出现妊娠糖尿病(GDM),已安排在KKH分娩(津贴B2级病房)。39+2周时在家破水。',
  },
  category: 'elective',
  primaryFacility: 'kkh',
  involvedFacilities: ['gp-healthway', 'novena-medical', 'kkh', 'home', 'shp-tampines'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [RCOG, KKH_OBS, HEALTHIER_SG],
  pathway: [
    {
      id: 'gp-shared-care',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 30,
      costSGD: 95,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: {
          en: 'You enrolled with this GP early. The receptionist remembers your name.',
          zh: '你早就在这家家庭医生处登记。前台记得你的名字。',
        },
        caregiver: { en: 'Your husband attends every visit.', zh: '先生每次产检都陪你来。' },
        staff: {
          en: 'GP shared-care 28-week visit: BP normal, OGTT 1h 11.4 mmol/L → GDM. Refers to private OBGYN; recommends KKH delivery.',
          zh: '联合产检第28周:血压正常,口服糖耐量1小时11.4 mmol/L → 妊娠糖尿病。转介私立妇产科医生;建议在KKH分娩。',
        },
      },
      decision: {
        id: 'delivery-venue',
        prompt: { en: 'GDM diagnosed. Delivery venue?', zh: '诊断妊娠糖尿病。分娩地点?' },
        weight: 1.5,
        reference: KKH_OBS,
        options: [
          {
            id: 'kkh-subsidised',
            label: {
              en: 'KKH subsidised (B2/C); continue private OBGYN antenatally; switch to KKH team for delivery.',
              zh: 'KKH津贴价(B2/C级);产前继续由私立妇产科医生跟进;分娩切换至KKH团队。',
            },
            score: 10,
            rationale: {
              en: 'Best balance: continuity of antenatal care + tertiary delivery for GDM with neonatal back-up. Cost-aware for a young couple.',
              zh: '最佳平衡:产前连续照护 + GDM分娩有三级医院与新生儿后备支援。对年轻夫妻而言费用合理。',
            },
            outcome: {
              patient: { en: 'A clear plan.', zh: '一份清晰的方案。' },
              caregiver: { en: 'You note the dates.', zh: '你把每个日期都记下来。' },
              staff: {
                en: 'Cross-sector referral letter; KKH antenatal slots booked.',
                zh: '跨部门转介信已写好;KKH产前预约已订。',
              },
            },
          },
          {
            id: 'mt-e-private',
            label: {
              en: 'Continue private all the way through Mt Elizabeth Novena delivery.',
              zh: '从头到尾走私立路线,在伊丽莎白诺维娜医院分娩。',
            },
            score: 6,
            rationale: {
              en: 'Convenient and continuous but considerably higher cost; appropriate if IP rider supports it.',
              zh: '方便且连续性强,但费用显著较高;有综合健保附加险(IP)支持时较合适。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You discuss the bill estimate.',
                zh: '你们讨论账单的预估。',
              },
              staff: { en: 'Acceptable.', zh: '可以接受。' },
            },
          },
          {
            id: 'all-public',
            label: {
              en: 'Switch all care to KKH antenatal SOC subsidised, drop private OBGYN.',
              zh: '产前完全转到KKH津贴价专科门诊,停掉私立妇产科。',
            },
            score: 7,
            rationale: {
              en: 'Cheapest; loses some continuity with the private OBGYN she trusted.',
              zh: '最便宜;失去与她信任的私立妇产科医生的连续性。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'obs-soc',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 45,
      costSGD: 280,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: {
          en: 'A reassuring scan. The OBGYN explains GDM diet and the KKH plan.',
          zh: '超声结果让人安心。妇产科医生解释GDM饮食及KKH分娩计划。',
        },
        caregiver: { en: 'You ask about glucose monitoring.', zh: '你问起血糖监测。' },
        staff: {
          en: 'GDM dietary trial; capillary glucose log given. KKH antenatal booking confirmed.',
          zh: 'GDM饮食试验;发放指尖血糖记录表。KKH产前预约已确认。',
        },
      },
    },
    {
      id: 'home-rom',
      department: 'entrance',
      facility: 'home',
      durationMin: 30,
      framing: {
        patient: {
          en: '(Waters break at 4am at home. Contractions every 7 minutes.)',
          zh: '(凌晨4点在家破水。宫缩每7分钟一次。)',
        },
        caregiver: {
          en: 'You\'re calm because you\'ve been to two antenatal classes.',
          zh: '因为上过两次产前课,你显得冷静。',
        },
        staff: {
          en: '(virtual triage suggests proceeding to KKH delivery suite.)',
          zh: '(在线分诊建议直接前往KKH产房。)',
        },
      },
      decision: {
        id: 'route-to-delivery',
        prompt: {
          en: '4am, ROM with regular contractions. Best route?',
          zh: '凌晨4点,破水合规律宫缩。最佳路线?',
        },
        weight: 1,
        reference: KKH_OBS,
        options: [
          {
            id: 'grab-kkh',
            label: {
              en: 'Drive (or Grab) to KKH labour ward; call ahead.',
              zh: '自驾(或Grab)前往KKH产房;先打电话通知。',
            },
            score: 10,
            rationale: {
              en: 'Standard. KKH staff are warned; bag is packed.',
              zh: '标准做法。KKH已被告知;待产包已备好。',
            },
            outcome: {
              patient: { en: 'A quick ride.', zh: '一段短短的车程。' },
              caregiver: { en: 'You arrive together.', zh: '两人一起到达。' },
              staff: { en: 'Ward warned.', zh: '产房已通知。' },
            },
          },
          {
            id: '995',
            label: { en: 'Call 995.', zh: '拨打995。' },
            score: 5,
            rationale: {
              en: 'Reasonable if precipitous, but EMS resource use is high for routine labour.',
              zh: '若临产急促可考虑,但常规分娩调用救护车资源占用较高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'wait-home',
            label: {
              en: 'Wait at home until contractions are 3 min apart.',
              zh: '在家等到宫缩间隔3分钟再去。',
            },
            score: 3,
            rationale: {
              en: 'Acceptable in early labour but ROM increases ascending infection risk; head in to be checked.',
              zh: '早期产程可接受,但破水后上行感染风险增加;应入院评估。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'kkh-labour',
      department: 'maternity-ward',
      facility: 'kkh',
      durationMin: 720,
      costSGD: 1800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 6, sleepDebt: 12 },
      framing: {
        patient: {
          en: 'A labour suite. The midwife has done this thousands of times.',
          zh: '产房。助产士已经接生过千百次。',
        },
        caregiver: {
          en: 'You hold her hand. The cup of ice chips becomes very important.',
          zh: '你握着她的手。那杯碎冰变得格外重要。',
        },
        staff: {
          en: 'Augmentation with oxytocin, epidural sited at 5 cm. Foetal monitoring reassuring.',
          zh: '催产素加强宫缩,宫口5cm时置入硬膜外。胎心监护无异常。',
        },
      },
      decision: {
        id: 'analgesia',
        prompt: { en: 'Choose intrapartum analgesia plan.', zh: '选择分娩镇痛方案。' },
        weight: 1.2,
        reference: KKH_OBS,
        options: [
          {
            id: 'epidural',
            label: {
              en: 'Epidural at 5 cm with patient request; gas-and-air pre-epidural.',
              zh: '宫口5cm时按产妇要求行硬膜外镇痛;在此之前给予氧化亚氮(笑气)。',
            },
            score: 10,
            rationale: {
              en: 'Excellent analgesia; KKH epidural rates among highest globally.',
              zh: '镇痛效果优秀;KKH的硬膜外使用率属全球前列。',
            },
            outcome: {
              patient: {
                en: 'You smile through the second stage.',
                zh: '整个第二产程你都微笑着。',
              },
              caregiver: {
                en: 'You take a photo at every milestone.',
                zh: '每个关键时刻你都拍了照。',
              },
              staff: { en: '', zh: '' },
            },
          },
          {
            id: 'pethidine',
            label: { en: 'IV pethidine only.', zh: '仅静脉哌替啶。' },
            score: 4,
            rationale: {
              en: 'Older agent; respiratory depression risk for baby if given near delivery.',
              zh: '较旧药物;接近分娩时使用可致新生儿呼吸抑制。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-analgesia',
            label: { en: 'No pharmacological analgesia.', zh: '不使用药物镇痛。' },
            score: 5,
            rationale: {
              en: 'Patient choice — perfectly acceptable if she prefers.',
              zh: '产妇选择 — 若她偏好,完全可以接受。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'delivery',
      department: 'ot',
      facility: 'kkh',
      durationMin: 90,
      costSGD: 2400,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 6 },
      framing: {
        patient: { en: 'You both cry the moment you hear her.', zh: '听到她哭的那一刻,你们两个都哭了。' },
        caregiver: { en: 'You cut the cord.', zh: '你亲手剪了脐带。' },
        staff: {
          en: 'Spontaneous vertex delivery, female 3.1 kg, Apgar 9/10. Skin-to-skin done. EBL minimal.',
          zh: '自然头位分娩,女婴3.1kg,Apgar 9/10。完成肌肤接触。估计失血量极少。',
        },
      },
    },
    {
      id: 'postnatal-ward',
      department: 'maternity-ward',
      facility: 'kkh',
      durationMin: 2880,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 4, sleepDebt: 18 },
      framing: {
        patient: { en: 'You learn to breastfeed. The midwife is patient.', zh: '你在学母乳喂养。助产士很有耐心。' },
        caregiver: { en: 'You bring teh-o.', zh: '你带来一杯teh-o(无糖红茶)。' },
        staff: {
          en: 'Mother and baby well; baby NIPS clear; vit K + hep B given; BCG before discharge.',
          zh: '母婴状况良好;新生儿筛查(NIPS)正常;已给维生素K + 乙肝疫苗;出院前接种卡介苗(BCG)。',
        },
      },
    },
    {
      id: 'postnatal-discharge',
      department: 'discharge',
      facility: 'kkh',
      durationMin: 60,
      framing: {
        patient: {
          en: 'You leave with a tiny human asleep on your chest.',
          zh: '你抱着一个熟睡的小生命走出医院。',
        },
        caregiver: { en: 'A new car-seat.', zh: '一张全新的婴儿安全座椅。' },
        staff: {
          en: 'D2 discharge; appointment with SHP for 6-week post-natal + well-baby; private OBGYN follow-up at 6 weeks.',
          zh: '第2天出院;已安排SHP综合诊疗所6周后产后及健康婴儿随访;私立妇产科医生6周后复查。',
        },
      },
      decision: {
        id: 'baby-followup',
        prompt: { en: 'Plan for mother and baby?', zh: '母婴的长期随访方案?' },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-poly-gp',
            label: {
              en: 'SHP polyclinic for routine baby + mother (vaccinations, weight checks); private OBGYN 6-week review.',
              zh: 'SHP综合诊疗所负责母婴常规事项(疫苗、体重监测);私立妇产科医生6周复查。',
            },
            score: 10,
            rationale: {
              en: 'Routine well-baby and post-natal at primary care; specialist for the 6-week tie-off.',
              zh: '日常的健康婴儿及产后照护交给基层;专科只负责6周收尾。',
            },
            outcome: {
              patient: {
                en: 'You schedule the 1-month appointments.',
                zh: '你已经预约好1个月时的复查。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'NEHR contains discharge summary; SHP receives via NEHR.',
                zh: '出院摘要已上传NEHR;SHP可经NEHR取得。',
              },
            },
          },
          {
            id: 'kkh-everything',
            label: {
              en: 'KKH SOC for everything baby + mother for the first year.',
              zh: '母婴第一年所有事项都在KKH专科门诊处理。',
            },
            score: 4,
            rationale: {
              en: 'Specialist time better used for complex cases; routine well-baby fits primary care.',
              zh: '专科时间应留给复杂病例;常规健康婴儿照护更适合基层。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'No structured follow-up.', zh: '不安排正式随访。' },
            score: -4,
            rationale: {
              en: 'Misses immunisations and post-natal mood screening.',
              zh: '会漏掉疫苗接种及产后情绪筛查。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
