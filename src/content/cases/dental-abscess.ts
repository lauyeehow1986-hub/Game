import type { CaseDefinition } from '../../lib/types';

const ANTIBIOTIC_DENTAL = {
  label: { en: 'MOH / SDA dental antibiotic stewardship', zh: '卫生部 / 新加坡牙科协会(SDA)抗生素管理' },
  body: {
    en: 'Most localised dental infections do not need antibiotics if drainage is achieved. Antibiotics are indicated for systemic features (fever, lymphadenopathy, cellulitis) or immunocompromise. Definitive treatment is drainage / endodontic / extraction — not antibiotics alone.',
    zh: '多数局部性牙源感染只要引流即不需抗生素。出现全身症状(发烧、淋巴结肿大、蜂窝织炎)或免疫抑制者才需要抗生素。根本治疗是引流 / 根管 / 拔牙 — 而非单靠抗生素。',
  },
};

const LUDWIG = {
  label: { en: 'Ludwig angina red flags', zh: '路德维希咽峡炎(Ludwig angina)危险征兆' },
  body: {
    en: 'Bilateral submandibular swelling + tongue elevation + drooling + dysphagia + voice change + airway compromise = surgical emergency. Immediate transfer to OMFS / ED.',
    zh: '双侧颌下肿胀 + 舌抬高 + 流涎 + 吞咽困难 + 声音改变 + 气道受压 = 外科急症。立即转送口腔颌面外科或急诊。',
  },
};

const NDCS_PATHWAY = {
  label: { en: 'NDCS Emergency Dental Clinic', zh: 'NDCS 急诊牙科' },
  body: {
    en: 'National Dental Centre Singapore runs a walk-in emergency clinic during working hours (with after-hours via Outram SGH ED for surgical airway concerns). Subsidised for citizens with CHAS / referral.',
    zh: '新加坡国家牙科中心(NDCS)在工作时段设走入式急诊牙科(下班后由欧南SGH急诊承接需外科气道处理者)。公民持CHAS或转介可享津贴。',
  },
};

export const dentalAbscessCase: CaseDefinition = {
  id: 'dental-abscess',
  title: {
    en: 'Dental abscess — Healthway GP after-hours → NDCS emergency',
    zh: '牙脓肿 — 康威医疗夜诊 → NDCS牙科急诊',
  },
  blurb: {
    en: 'Mr Tan, 45, taxi driver. Right lower-jaw pain for 4 days, now throbbing and unable to chew. Visible facial swelling near the angle of the right mandible since this morning. Walks into a 24-hr Healthway GP at 8pm.',
    zh: '陈先生,45岁,德士司机。右下颌痛已4天,目前持续跳痛、咀嚼困难。今晨开始右下颌角附近面部肿胀明显。晚上8点走入24小时康威医疗诊所。',
  },
  category: 'acute',
  primaryFacility: 'ndcs',
  involvedFacilities: ['gp-healthway', 'ndcs', 'sgh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [ANTIBIOTIC_DENTAL, LUDWIG, NDCS_PATHWAY],
  pathway: [
    {
      id: 'gp-after-hours',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 20,
      costSGD: 75,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 4, sleepDebt: 6 },
      framing: {
        patient: {
          en: 'You cannot open your mouth wider than two fingers. The right side of your face is swollen and warm.',
          zh: '你嘴只能张到两指宽。右脸又肿又热。',
        },
        caregiver: {
          en: 'Your wife came along; she points out the swelling has crept under the jaw line.',
          zh: '太太陪你来;她指出肿胀已经蔓延到下颌线下方。',
        },
        staff: {
          en: 'GP: localised right lower vestibular swelling + tender lymph node + T 37.8 + trismus (interincisal 25 mm). No tongue elevation, no drooling, no stridor. SpO2 99%.',
          zh: '家庭医生:右下颌前庭区局部肿胀 + 颌下淋巴结压痛 + 体温37.8 + 张口受限(切牙间距25 mm)。无舌抬高、无流涎、无喘鸣。SpO2 99%。',
        },
      },
      decision: {
        id: 'red-flag-screen',
        prompt: {
          en: 'Painful localised lower-jaw swelling + trismus + low-grade fever. Critical assessment?',
          zh: '下颌局限性肿痛 + 张口受限 + 低烧。关键评估?',
        },
        weight: 1.5,
        reference: LUDWIG,
        options: [
          {
            id: 'rule-out-ludwig',
            label: {
              en: "Explicit Ludwig-angina screen: bilateral floor-of-mouth firmness, tongue elevation, drooling, voice change, stridor. Document each — escalate to SGH ED if ANY positive.",
              zh: '明确进行Ludwig咽峡炎筛查:双侧口底硬实、舌抬高、流涎、声音改变、喘鸣。逐项记录 — 任一阳性即升级至SGH急诊。',
            },
            score: 10,
            rationale: {
              en: 'Ludwig angina kills via airway loss. Every after-hours dental swelling needs a 60-second airway red-flag screen before the GP picks the next venue. Negative screen → NDCS emergency dental in the morning; positive → SGH ED tonight.',
              zh: 'Ludwig咽峡炎可致命于气道丧失。任何下班后的牙源性肿胀都应在选择下一站前进行60秒的气道危险征兆筛查。阴性 → 早上NDCS急诊牙科;阳性 → 今晚SGH急诊。',
            },
            outcome: {
              patient: {
                en: 'The GP holds a torch under your chin and asks you to lift your tongue. You can.',
                zh: '医生用电筒照你下巴下方,让你抬舌。你可以做到。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'All red flags negative. Localised dental abscess most likely.',
                zh: '所有危险征兆阴性。最可能是局部牙脓肿。',
              },
            },
            effects: { setFlags: ['airway-clear'] },
          },
          {
            id: 'just-antibiotic',
            label: {
              en: 'Prescribe oral amoxicillin + paracetamol; review tomorrow.',
              zh: '开口服阿莫西林+扑热息痛;明天复诊。',
            },
            score: 1,
            rationale: {
              en: 'Antibiotics + analgesia treat the symptoms but miss the airway question. A patient could deteriorate overnight; the red-flag screen must precede a dispatch home.',
              zh: '抗生素和止痛能缓解症状,但回避了气道问题。患者可能一夜恶化;离开诊所前必须先完成危险征兆筛查。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'send-home-with-paracetamol',
            label: {
              en: '"It\'s just a toothache" — paracetamol + dentist on Monday.',
              zh: '"只是牙痛而已" — 扑热息痛 + 周一看牙医。',
            },
            score: -8,
            rationale: {
              en: 'Misses Ludwig screen, misses NDCS emergency option, misses fever + trismus + visible swelling — multiple flags for an evolving spreading infection.',
              zh: '错过Ludwig筛查,错过NDCS急诊选项,忽视发烧、张口受限、肉眼可见肿胀 — 进行性扩散感染的多个征兆。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'ndcs-emergency',
      department: 'soc',
      facility: 'ndcs',
      durationMin: 60,
      costSGD: 180,
      charge: 'soc',
      requiresAnyFlag: ['airway-clear'],
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4 },
      framing: {
        patient: {
          en: 'Morning at NDCS. The dentist taps each lower-right tooth gently; #46 makes you flinch.',
          zh: '次日早上到NDCS。牙医轻敲右下牙齿;#46让你猛地缩了一下。',
        },
        caregiver: { en: 'You took the morning off work.', zh: '你请了上午假。' },
        staff: {
          en: 'Periapical OPG: large periapical lucency #46, vestibular abscess. No fluctuant collection extending below the mandible.',
          zh: '根尖周X光:#46牙根尖大片透光区,前庭区脓肿。下颌缘以下未触及波动性脓肿。',
        },
      },
      decision: {
        id: 'drainage-route',
        prompt: {
          en: 'Localised vestibular abscess + #46 non-vital. Best next step?',
          zh: '局部前庭脓肿 + #46牙活力丧失。下一步最佳处理?',
        },
        weight: 1.5,
        reference: ANTIBIOTIC_DENTAL,
        options: [
          {
            id: 'drainage-plus-narrow-abx',
            label: {
              en: 'Local-anaesthetic incision + drainage; pulp extirpation (endo) of #46; narrow-spectrum amoxicillin only because of systemic fever; analgesia + saline rinses; review in 48 h.',
              zh: '局麻下切开引流;#46牙髓摘除(根管);因发烧加上窄谱阿莫西林;止痛 + 盐水漱口;48小时后复查。',
            },
            score: 10,
            rationale: {
              en: 'Drainage is curative; antibiotics are adjuncts only when systemic features are present. Narrow spectrum aligns with SDA stewardship. Endo (or extraction) is the definitive plan.',
              zh: '引流是根本性治疗;抗生素仅在出现全身症状时辅助使用。窄谱用药符合SDA抗生素管理。根管(或拔牙)是根治方案。',
            },
            outcome: {
              patient: {
                en: 'A burning local injection, then sudden relief.',
                zh: '局部注射时有灼热感,随后突然轻松了。',
              },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Abscess drained; pus sent for culture; review booked.', zh: '脓肿已引流;脓液送培养;复诊已订。' },
            },
            effects: { setFlags: ['drained'] },
          },
          {
            id: 'broad-spectrum-only',
            label: {
              en: 'Co-amoxiclav 1g BD x 7 days; no drainage today; review in 1 week.',
              zh: '阿莫西林/克拉维酸1g每日两次共7天;今天不引流;一周后复诊。',
            },
            score: -3,
            rationale: {
              en: 'Broad-spectrum without source control is wrong on both axes — stewardship breach and unlikely to clear the abscess. Drainage is the definitive step.',
              zh: '不做引流单靠广谱抗生素两头都错 — 违反抗生素管理且难以清除脓肿。引流才是根本。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Returns 4 days later with progressing swelling.', zh: '4天后肿胀加重再就诊。' },
            },
          },
          {
            id: 'extract-now',
            label: {
              en: 'Extract #46 today under LA without drainage first.',
              zh: '当日局麻下直接拔除#46,不先引流。',
            },
            score: 5,
            rationale: {
              en: 'Acceptable when endo is not viable, but in an acute abscess incision + drainage of the loculated pus first is gentler; immediate extraction risks spreading infection through the socket.',
              zh: '若不能行根管可考虑;但急性脓肿先切开引流囊袋脓液更温和;立即拔牙有经牙槽窝扩散感染风险。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'review-visit',
      department: 'soc',
      facility: 'ndcs',
      durationMin: 30,
      costSGD: 60,
      charge: 'soc',
      requiresAnyFlag: ['drained'],
      framing: {
        patient: {
          en: 'Two days later. The swelling is half. You can eat soft food on the left side.',
          zh: '两天后。肿胀减半。能用左侧吃软食。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Swelling reduced, drainage tract clean. Pus culture: oral streptococci, sensitive. Plan: complete root canal + crown.',
          zh: '肿胀消退,引流通道清洁。脓液培养:口腔链球菌,药敏敏感。计划:完成根管 + 烤瓷冠。',
        },
      },
      decision: {
        id: 'definitive-plan',
        prompt: { en: 'Long-term tooth-preservation plan?', zh: '长期牙齿保留方案?' },
        weight: 1,
        reference: NDCS_PATHWAY,
        options: [
          {
            id: 'rct-crown-recall',
            label: {
              en: 'Complete RCT + crown on #46; 6-month recall + scaling; refer to a CHAS-participating GP dentist for routine care.',
              zh: '完成#46根管 + 烤瓷冠;6个月召回 + 洗牙;转介参与CHAS的家庭牙医做常规照护。',
            },
            score: 10,
            rationale: {
              en: 'Save the tooth, return to community dental care for routine. NDCS specialist time reserved for complexity.',
              zh: '保住牙齿,把常规照护交回社区牙医。NDCS专科资源留给复杂病例。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'extract-and-stop',
            label: { en: 'Extract; no implant or denture.', zh: '拔牙;不做种植或义齿。' },
            score: 3,
            rationale: {
              en: 'Acceptable when patient declines restoration, but mastication suffers and adjacent teeth drift. Plan for restoration if affordable.',
              zh: '若患者拒绝修复尚可;咀嚼会受影响且邻牙会移位。可负担时建议修复。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'Discharge with no further plan.', zh: '出院不安排随访。' },
            score: -3,
            rationale: {
              en: 'Untreated necrotic pulp recurs; reattendance with worse infection likely.',
              zh: '未处理的坏死牙髓会复发;后续可能因更严重感染就诊。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
