import type { CaseDefinition } from '../../lib/types';

const ATLS = {
  label: { en: 'ATLS 11th Edition (2025)', zh: '高级创伤生命支持(ATLS)第11版(2025)' },
  body: {
    en: 'Advanced Trauma Life Support 11th edition: primary survey reordered to xABCDE — control exsanguinating external haemorrhage (tourniquet / wound packing) before airway. FAST, damage-control resuscitation, massive haemorrhage protocol.',
    zh: '高级创伤生命支持第11版:初次评估改为xABCDE — 先控制致命性外出血(止血带/伤口填塞)再处理气道。FAST、损伤控制复苏、大量出血方案。',
  },
};

const SCDF_TRAUMA = {
  label: { en: 'SCDF Trauma Protocol', zh: 'SCDF创伤分流规程' },
  body: {
    en: 'Pre-hospital trauma routing — direct transport to a major trauma centre when haemodynamically unstable.',
    zh: '院前创伤分流 — 血流动力学不稳的患者直接送往主要创伤中心。',
  },
};

const TXA = {
  label: { en: 'CRASH-2 / SG Trauma CPG', zh: 'CRASH-2 / 新加坡创伤临床实践指南' },
  body: {
    en: 'Tranexamic acid within 3h of injury for actively bleeding trauma patients.',
    zh: '受伤3小时内给活动性出血的创伤患者使用氨甲环酸(TXA)。',
  },
};

export const majorTraumaCase: CaseDefinition = {
  id: 'major-trauma',
  title: {
    en: 'Motorcycle accident — 28 y/o, blunt abdominal trauma',
    zh: '摩托车事故 — 28岁,腹部钝伤',
  },
  blurb: {
    en: 'Mr Lim, 28. Motorcycle vs taxi at Holland Road junction. Helmeted but thrown ~6 m. Unstable obs at scene. SCDF on scene with crew of 3.',
    zh: '林先生,28岁。在荷兰路路口骑摩托车与德士相撞。戴有头盔,但被抛出约6米。现场生命体征不稳。SCDF三人小组已到达现场。',
  },
  category: 'acute',
  primaryFacility: 'sgh',
  involvedFacilities: ['scdf', 'sgh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [ATLS, SCDF_TRAUMA, TXA],
  pathway: [
    {
      id: 'on-scene',
      department: 'treatment-room',
      facility: 'scdf',
      durationMin: 12,
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 6, sleepDebt: 6 },
      framing: {
        patient: {
          en: '(Pale; abdomen tender; GCS 14.)',
          zh: '(面色苍白;腹部压痛;GCS 14分。)',
        },
        caregiver: {
          en: '(not yet aware — wife is at work.)',
          zh: '(尚不知情 — 太太还在上班。)',
        },
        staff: {
          en: 'SCDF: BP 92/60, HR 118, SpO2 95% RA. Helmet on, no LOC reported. C-spine immobilised.',
          zh: 'SCDF:血压92/60,心率118,空气下SpO2 95%。戴头盔,未报告昏迷史。已完成颈椎固定。',
        },
      },
      decision: {
        id: 'destination',
        prompt: {
          en: 'SCDF destination decision: nearest centre is NUH; major trauma centre is SGH.',
          zh: 'SCDF目的地决定:最近的医院是NUH;主要创伤中心是SGH。',
        },
        weight: 1.5,
        reference: SCDF_TRAUMA,
        options: [
          {
            id: 'sgh-trauma',
            label: {
              en: 'Bypass nearest; transport direct to SGH major trauma centre with pre-notification.',
              zh: '绕过最近的医院,直接送往SGH主要创伤中心,并提前通知。',
            },
            score: 10,
            rationale: {
              en: 'Singapore protocol routes haemodynamically unstable blunt trauma to a major trauma centre with full surgical / IR / neurosurgical capability.',
              zh: '新加坡规程对血流动力学不稳的钝性创伤直接送往具备完整外科 / 介入放射 / 神经外科能力的主要创伤中心。',
            },
            outcome: {
              patient: { en: '(blue light to SGH.)', zh: '(救护车闪着蓝灯驶向SGH。)' },
              caregiver: { en: 'A friend calls his wife.', zh: '一位朋友打电话通知他太太。' },
              staff: {
                en: 'SGH trauma team activated; OT and IR on standby.',
                zh: 'SGH创伤团队已启动;手术室与介入放射室待命。',
              },
            },
          },
          {
            id: 'nuh-nearest',
            label: { en: 'Nearest hospital (NUH) for stabilisation.', zh: '先送最近的医院(NUH)稳定病情。' },
            score: 5,
            rationale: {
              en: 'Reasonable if patient peri-arrest; otherwise direct routing to a designated trauma centre is preferred.',
              zh: '如患者临近心跳骤停尚可考虑;否则应优先直接送往指定创伤中心。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Stabilised then transferred — incurs an extra 45 min.',
                zh: '先稳定后转院 — 多耗45分钟。',
              },
            },
          },
          {
            id: 'long-route',
            label: {
              en: 'Drive to a private hospital his insurance prefers.',
              zh: '按他保险偏好送到一家私人医院。',
            },
            score: -10,
            rationale: {
              en: 'Private hospitals do not run trauma teams at this acuity; pure delay.',
              zh: '私人医院无此急性度的创伤团队;纯粹延误时间。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Refuses transfer at private; loses time.',
                zh: '私人医院拒收,耗费时间。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'sgh-trauma-bay',
      department: 'ed',
      facility: 'sgh',
      durationMin: 25,
      costSGD: 480,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 8 },
      framing: {
        patient: { en: '(BP 84/52 on arrival. Confused.)', zh: '(到院时血压84/52,神志不清。)' },
        caregiver: {
          en: 'Wife arrives 15 min in; led to a quiet relatives\' room.',
          zh: '太太15分钟后到达;被带到安静的家属室。',
        },
        staff: {
          en: 'Trauma team: xABCDE (catastrophic external haemorrhage controlled first); FAST positive — free fluid Morrison\'s pouch + pelvis. Activate massive haemorrhage protocol.',
          zh: '创伤团队执行xABCDE(先控制致命性外出血);FAST阳性 — 莫氏窝及盆腔可见游离液。启动大量出血方案。',
        },
      },
      decision: {
        id: 'damage-control',
        prompt: { en: 'FAST positive, hypotensive. What now?', zh: 'FAST阳性,血压偏低。下一步?' },
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'mhp-tranexamic-ot',
            label: {
              en: 'Massive haemorrhage protocol: 1:1:1 blood + plasma + platelets, tranexamic acid 1g, straight to OT for damage-control laparotomy.',
              zh: '大量出血方案:1:1:1红细胞 + 血浆 + 血小板,氨甲环酸1g,直接进手术室行损伤控制性剖腹术。',
            },
            score: 10,
            rationale: {
              en: 'Damage-control surgery for an unstable abdomen. CRASH-2 supports TXA within 3h. Crystalloid-only resus is harmful.',
              zh: '腹部不稳定情况下的损伤控制性手术。CRASH-2研究支持3小时内使用TXA。单纯晶体液复苏有害。',
            },
            outcome: {
              patient: { en: '(in OT in 22 min.)', zh: '(22分钟内进入手术室。)' },
              caregiver: { en: 'You watch the door close.', zh: '你看着手术室门关上。' },
              staff: {
                en: 'OT booked; blood arriving in coolers.',
                zh: '手术室已预定;血液保温箱正在送达。',
              },
            },
          },
          {
            id: 'ct-first',
            label: {
              en: 'Stabilise with crystalloid; CT trauma series first.',
              zh: '先用晶体液稳定;先做CT创伤全套扫描。',
            },
            score: 3,
            rationale: {
              en: 'CT acceptable in haemodynamically responsive patients but unsafe in persistent hypotension.',
              zh: '对补液有反应的患者尚可接受CT;持续低血压情况下不安全。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Patient deteriorates en route to CT.',
                zh: '送CT途中病情恶化。',
              },
            },
          },
          {
            id: 'crystalloid-only',
            label: {
              en: 'Aggressive crystalloid resuscitation; no blood products yet.',
              zh: '激进的晶体液复苏;暂不输血液成分。',
            },
            score: -8,
            rationale: {
              en: 'Worsens dilutional coagulopathy and hypothermia; current trauma practice is balanced product resuscitation.',
              zh: '加重稀释性凝血障碍及低体温;现代创伤实践采用比例平衡的血液成分复苏。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Coagulopathy worsens.', zh: '凝血障碍加重。' },
            },
          },
        ],
      },
    },
    {
      id: 'damage-control-ot',
      department: 'ot',
      facility: 'sgh',
      durationMin: 90,
      costSGD: 14500,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 18, sleepDebt: 6 },
      framing: {
        patient: { en: '(intubated, sedated.)', zh: '(已插管、镇静。)' },
        caregiver: {
          en: 'You see the surgeon afterwards. He looks tired but says it went OK.',
          zh: '术后你见到外科医生。他看起来很累,但说手术还顺利。',
        },
        staff: {
          en: 'Splenectomy + pelvic packing; abdomen left open with VAC for second look.',
          zh: '行脾切除 + 盆腔填塞;暂以负压辅助闭合(VAC)留腹开放,待二次探查。',
        },
      },
    },
    {
      id: 'ct-icu',
      department: 'icu',
      facility: 'sgh',
      durationMin: 4320,
      costSGD: 8400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 32, financialWorry: 14, sleepDebt: 26 },
      framing: {
        patient: {
          en: '(Stable on D2; second-look laparotomy planned.)',
          zh: '(第2天病情稳定;计划二次剖腹探查。)',
        },
        caregiver: {
          en: 'Family meeting in the SICU. You meet the social worker.',
          zh: '在外科ICU召开家属会议。你见到了医务社工。',
        },
        staff: {
          en: 'D2: stable; warmed; coags corrected; second-look D3; abdomen closed.',
          zh: '第2天:病情稳定;复温完成;凝血纠正;第3天二次探查;关腹。',
        },
      },
    },
    {
      id: 'ward-rehab',
      department: 'ward',
      facility: 'sgh',
      durationMin: 7200,
      costSGD: 1300,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 8, sleepDebt: -4 },
      framing: {
        patient: {
          en: '(walking with a frame on D7; deep breath still painful.)',
          zh: '(第7天扶助行架行走;深呼吸仍疼痛。)',
        },
        caregiver: {
          en: 'You learn to dress the surgical wound at the kitchen table.',
          zh: '你在厨房的桌前学着给伤口换药。',
        },
        staff: {
          en: 'Stable; pneumovax + meningococcal post-splenectomy; trauma psychology referral.',
          zh: '病情稳定;脾切除后接种肺炎球菌及脑膜炎球菌疫苗;转介创伤心理科。',
        },
      },
      decision: {
        id: 'discharge-plan',
        prompt: {
          en: 'Discharge planning for a young splenectomised trauma survivor with PTSD risk.',
          zh: '年轻、已切脾、有创伤后应激障碍(PTSD)风险的创伤幸存者的出院规划。',
        },
        weight: 1,
        reference: ATLS,
        options: [
          {
            id: 'rehab-and-psych',
            label: {
              en: 'OCH inpatient rehab → home; vaccinations done; trauma psychology referral; GP for splenectomy lifelong care.',
              zh: 'OCH(欧南社区医院)住院康复 → 回家;疫苗已完成;转介创伤心理科;由家庭医生负责脾切除后终身随访。',
            },
            score: 10,
            rationale: {
              en: 'Functional + psychological recovery + lifelong infection prophylaxis education.',
              zh: '兼顾功能康复、心理康复以及终身感染预防教育。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'AIC referral submitted.', zh: '已提交AIC转介。' },
            },
          },
          {
            id: 'home-no-rehab',
            label: {
              en: 'Home directly; no rehab; outpatient surgical review only.',
              zh: '直接回家;不安排康复;仅安排外科门诊复查。',
            },
            score: 4,
            rationale: {
              en: 'Misses functional + psychological recovery opportunity.',
              zh: '错过功能及心理康复的机会。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You manage; sometimes you don\'t.',
                zh: '你勉强应付着;有时撑不下去。',
              },
              staff: { en: '', zh: '' },
            },
          },
        ],
      },
    },
  ],
};
