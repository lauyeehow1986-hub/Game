import type { CaseDefinition } from '../../lib/types';

const NICE_FEBRILE = {
  label: { en: 'NICE NG143 — Fever in under 5s', zh: 'NICE NG143 — 5岁以下儿童发热' },
  body: {
    en: 'NICE guideline on assessment and initial management of fever in young children.',
    zh: 'NICE对幼儿发热评估及初步处理的指南。',
  },
};

const KKH_PEWS = {
  label: { en: 'KKH Paediatric Early Warning Score', zh: 'KKH儿科早期预警评分(PEWS)' },
  body: {
    en: 'KK Hospital paediatric early warning score and escalation pathway.',
    zh: '竹脚妇幼医院(KKH)儿科早期预警评分及升级处置路径。',
  },
};

const MOH_HEALTHIER_SG = {
  label: { en: 'MOH Healthier SG', zh: '卫生部 Healthier SG' },
  body: {
    en: 'Right-siting paediatric chronic / well-child care to a primary-care provider.',
    zh: '将儿童慢性病及健康儿童照护下沉至基层医疗。',
  },
};

export const paediatricFeverKKH: CaseDefinition = {
  id: 'paeds-fever-kkh',
  title: {
    en: 'Febrile Toddler — 18 mo with fever for 3 days, lethargy',
    zh: '发热幼儿 — 18个月,持续发烧3天,精神倦怠',
  },
  blurb: {
    en: 'Aaisha, 18 months. Fever 39.6°C for 3 days, off feeds, parents brought her to the polyclinic at 8am where the nurse advised KKH Children\'s Emergency.',
    zh: 'Aaisha,18个月。发烧39.6°C持续3天,拒奶。父母上午8点带她到综合诊疗所,护士建议立即转送KKH儿童急诊。',
  },
  category: 'acute',
  primaryFacility: 'kkh',
  involvedFacilities: ['shp-tampines', 'kkh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [NICE_FEBRILE, KKH_PEWS, MOH_HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic',
      department: 'gp-room',
      facility: 'shp-tampines',
      durationMin: 30,
      costSGD: 70,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(non-verbal — restless, flushed cheeks, refusing the bottle)',
          zh: '(尚不会说话 — 烦躁不安,双颊潮红,拒喝奶瓶。)',
        },
        caregiver: {
          en: "She's been crying since 4am. The polyclinic doctor measures her temperature, frowns, and writes a referral letter to KKH.",
          zh: '她从凌晨4点就开始哭。综合诊疗所医生量了体温后皱眉,马上写了一封转介信到KKH。',
        },
        staff: {
          en: 'Polyclinic FP: T 39.6, HR 165, cap refill 3s, lethargic between cries. Refers immediately to KKH CE.',
          zh: '综合诊疗所家庭医生:体温39.6,心率165,毛细血管再充盈3秒,啼哭间隙呈嗜睡状。立即转介KKH儿童急诊。',
        },
      },
    },
    {
      id: 'kkh-arrival',
      department: 'entrance',
      facility: 'kkh',
      durationMin: 5,
      framing: {
        patient: { en: '(carried in arms)', zh: '(被抱在怀里。)' },
        caregiver: {
          en: 'You queue at the Children\'s Emergency reception. The receptionist scans the referral.',
          zh: '你在儿童急诊柜台排队。接待员扫了转介信。',
        },
        staff: {
          en: 'Triage nurse acknowledges referral; ushers family into paediatric triage.',
          zh: '分诊护士确认转介,带家属进入儿科分诊区。',
        },
      },
    },
    {
      id: 'kkh-triage',
      department: 'triage',
      facility: 'kkh',
      durationMin: 10,
      framing: {
        patient: { en: '(wails when finger-prick)', zh: '(扎指头时哇哇大哭。)' },
        caregiver: {
          en: 'You hold her tiny hand while the nurse measures everything again.',
          zh: '护士又量了一遍所有指标,你紧握着她的小手。',
        },
        staff: {
          en: 'PEWS calculated: HR 168, RR 38, T 39.4, SpO2 96%, alert when stimulated. PEWS = 4.',
          zh: 'PEWS评估:心率168,呼吸38,体温39.4,SpO2 96%,有刺激时清醒。PEWS = 4。',
        },
      },
      decision: {
        id: 'pews-action',
        prompt: {
          en: 'PEWS 4 with lethargy and prolonged fever. What is your next step?',
          zh: 'PEWS 4分伴嗜睡及持续发热。下一步?',
        },
        weight: 1.5,
        reference: KKH_PEWS,
        options: [
          {
            id: 'urgent-resus',
            label: {
              en: 'Move to resus / acute observation; FBC + CRP + blood culture + urine MC&S; antipyretic; IV access.',
              zh: '送至抢救/急诊观察区;查全血细胞计数 + CRP + 血培养 + 尿培养(MC&S);给退烧药;建立静脉通路。',
            },
            score: 10,
            rationale: {
              en: 'PEWS ≥ 4 with lethargy in a child < 3y warrants urgent escalation. Septic screen with blood culture before antibiotics is standard. Urine MC&S is essential — UTI is a leading cause of fever without source in this age group.',
              zh: '3岁以下儿童PEWS ≥ 4分伴嗜睡需紧急升级处置。抗生素前先送血培养是标准做法。该年龄段"无明显感染源的发热"常见原因是尿路感染,尿培养必不可少。',
            },
            outcome: {
              patient: {
                en: '(IV cannula goes in. Cries. Then quietens with mum.)',
                zh: '(扎了静脉留置针,大哭一阵后在妈妈怀里安静下来。)',
              },
              caregiver: {
                en: 'You watch four staff move around her. You feel both scared and looked after.',
                zh: '你看着四位医护围着她忙碌,既害怕又安心。',
              },
              staff: {
                en: 'Resus bay opened. Bloods sent. Paeds reg paged.',
                zh: '抢救室已就绪。血样已送检。已呼叫儿科住院总。',
              },
            },
          },
          {
            id: 'paracetamol-discharge',
            label: {
              en: 'Give paracetamol, observe for 30 min, send home if afebrile.',
              zh: '给扑热息痛、观察30分钟,退烧就回家。',
            },
            score: -8,
            rationale: {
              en: 'Misses occult bacteraemia / UTI / meningitis. NICE traffic-light "amber" features (no smile, dry mucous membranes) require senior review and investigations.',
              zh: '会漏诊隐性菌血症 / 尿路感染 / 脑膜炎。NICE"交通灯"中"黄灯"特征(不笑、口干黏膜)须由上级医师评估并进一步检查。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Returns 6 hours later in shock.',
                zh: '6小时后处于休克状态再来。',
              },
            },
          },
          {
            id: 'admit-but-no-screen',
            label: { en: 'Admit to ward without septic screen.', zh: '直接收入病房,不做脓毒症筛查。' },
            score: 3,
            rationale: {
              en: 'Safer than discharge but delays diagnosis. Blood and urine cultures should be sent before any antibiotic.',
              zh: '比让她回家安全,但延误诊断。任何抗生素前都应先送血和尿培养。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Senior reg orders the screen on the ward.',
                zh: '上级住院医师在病房补开筛查。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'kkh-resus',
      department: 'ed',
      facility: 'kkh',
      durationMin: 90,
      costSGD: 280,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 8, sleepDebt: 6 },
      framing: {
        patient: {
          en: '(latched on to a small bottle of dilute apple juice; tearful but feeding)',
          zh: '(抱着一小瓶稀释苹果汁喝起来;眼泪汪汪但开始进食。)',
        },
        caregiver: {
          en: 'You haven\'t eaten since dinner last night. A volunteer brings you a sandwich.',
          zh: '你从昨晚饭后就没吃东西。一位志愿者递来三明治。',
        },
        staff: {
          en: 'Bloods: WBC 18.4 (neutrophilic), CRP 92. Urine dip: leuks 3+, nitrites +. UTI presumed.',
          zh: '化验:白细胞18.4(中性粒细胞为主),CRP 92。尿试纸:白细胞酯酶3+、亚硝酸盐阳性。考虑尿路感染。',
        },
      },
      decision: {
        id: 'empirical-abx',
        prompt: {
          en: 'Urine dip strongly positive. Catheter-specimen-of-urine sent for MC&S. What empirical antibiotic do you start?',
          zh: '尿试纸明显阳性,导尿留取尿样已送MC&S。经验性抗生素选什么?',
        },
        weight: 1.2,
        reference: NICE_FEBRILE,
        options: [
          {
            id: 'iv-cefotaxime',
            label: {
              en: 'IV cefotaxime (or ceftriaxone) — admit for 48–72h IV cover, then step down to oral.',
              zh: '静脉头孢噻肟(或头孢曲松)— 住院48–72小时静脉用药,随后改口服。',
            },
            score: 10,
            rationale: {
              en: 'Standard in pyelonephritis < 3y. Local Singapore E. coli sensitivity supports 3rd-gen cephalosporin first-line; switch to oral once afebrile and tolerating feeds.',
              zh: '3岁以下肾盂肾炎的标准做法。本地大肠杆菌对第三代头孢菌素敏感性高,适合作为一线;退热并能进食后改口服。',
            },
            outcome: {
              patient: {
                en: '(IV antibiotic running. Drifts to sleep on mum.)',
                zh: '(静脉抗生素在滴注。在妈妈怀里慢慢睡着了。)',
              },
              caregiver: { en: 'You finally exhale.', zh: '你终于松了一口气。' },
              staff: {
                en: 'Admitted to paeds ward. Renal US scheduled if recurrent.',
                zh: '收入儿科病房。如复发再安排肾脏超声。',
              },
            },
          },
          {
            id: 'oral-augmentin',
            label: {
              en: 'Oral co-amoxiclav at home; review in 48h.',
              zh: '口服阿莫西林/克拉维酸在家治疗;48小时后复诊。',
            },
            score: 2,
            rationale: {
              en: 'Acceptable for older children with pyelonephritis but a lethargic 18-month-old with PEWS 4 should receive IV in-hospital therapy.',
              zh: '较大儿童肾盂肾炎可以接受;但18个月、嗜睡、PEWS 4的患儿应住院静脉治疗。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Senior overrules — admits.', zh: '上级医师推翻决定,收住院。' },
            },
          },
          {
            id: 'no-abx-await-cultures',
            label: {
              en: 'Await culture sensitivities before starting antibiotics.',
              zh: '等培养及药敏结果回报后再开始抗生素。',
            },
            score: -6,
            rationale: {
              en: 'Delaying antibiotics in a clinically septic child of this age increases bacteraemia / pyelonephritis morbidity.',
              zh: '该年龄段已临床表现脓毒症的患儿延迟抗生素会增加菌血症与肾盂肾炎并发症。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Worsens over 12h; converted to broad-spectrum.',
                zh: '12小时内病情加重;改广谱抗生素。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'kkh-ward',
      department: 'ward',
      facility: 'kkh',
      durationMin: 4320,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 12, sleepDebt: 22 },
      framing: {
        patient: {
          en: '(playing with a soft toy by day 2; afebrile)',
          zh: '(第2天已经在玩布偶,体温正常。)',
        },
        caregiver: {
          en: 'You sleep on the foldout bed beside her cot. Hospital nights are loud.',
          zh: '你睡在她小床旁的折叠床上。医院的夜晚很吵。',
        },
        staff: {
          en: 'Day 2 — afebrile 24h, feeding, urine culture: E. coli sensitive. Step-down to oral co-amoxiclav.',
          zh: '第2天 — 24小时未发烧,能进食,尿培养:大肠杆菌,药敏敏感。降阶梯口服阿莫西林/克拉维酸。',
        },
      },
    },
    {
      id: 'kkh-discharge',
      department: 'discharge',
      facility: 'kkh',
      durationMin: 30,
      framing: {
        patient: {
          en: '(running circles around the discharge nurse, wearing only a nappy)',
          zh: '(只穿着尿布,绕着出院护士跑圈。)',
        },
        caregiver: {
          en: 'You\'re tired but laughing for the first time in days.',
          zh: '你累得不行,但好几天来第一次笑出声。',
        },
        staff: {
          en: 'Discharge summary uploaded; SHP follow-up arranged; renal US booked.',
          zh: '出院摘要已上传;已安排SHP综合诊疗所随访;肾脏超声已预约。',
        },
      },
      decision: {
        id: 'followup-plan',
        prompt: {
          en: 'First febrile UTI in an 18-month-old girl with E. coli on urine culture. What follow-up plan?',
          zh: '18个月女童首次发热性尿路感染,尿培养大肠杆菌。随访方案?',
        },
        weight: 1,
        reference: NICE_FEBRILE,
        options: [
          {
            id: 'rus-mcug',
            label: {
              en: 'Renal ultrasound during admission, MCUG only if recurrent / atypical; SOC review at 6 weeks; right-site to SHP for general well-child after.',
              zh: '住院期间做肾脏超声;仅复发或不典型时才做排尿性膀胱尿道造影(MCUG);6周后专科门诊复查;之后转回SHP综合诊疗所进行健康儿童随访。',
            },
            score: 10,
            rationale: {
              en: 'NICE recommends ultrasound for atypical / recurrent UTIs in this age group; routine MCUG no longer first-line. Right-siting to polyclinic / GP supports Healthier SG.',
              zh: 'NICE建议此年龄段不典型或复发性尿路感染做超声;MCUG不再是一线常规。转回综合诊疗所 / 家庭医生符合Healthier SG的精神。',
            },
            outcome: {
              patient: {
                en: '(running back and forth in the corridor; wholly recovered)',
                zh: '(在走廊里跑来跑去;已完全康复。)',
              },
              caregiver: {
                en: 'You add the polyclinic appointment to your phone.',
                zh: '你把综合诊疗所的预约存进手机。',
              },
              staff: {
                en: 'NEHR records visible to SHP; vaccinations confirmed up to date.',
                zh: 'SHP可在NEHR上看到记录;确认疫苗接种已跟上。',
              },
            },
          },
          {
            id: 'soc-only',
            label: { en: 'KKH SOC quarterly indefinitely.', zh: 'KKH专科门诊每3个月复诊,无期限。' },
            score: 4,
            rationale: {
              en: 'Specialist time better used for atypical / recurrent UTIs. Stable post-UTI children should return to primary care.',
              zh: '专科时间应留给不典型或复发性尿路感染。痊愈后的患儿适合返回基层。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Repeated half-days off work.', zh: '反复请半天假。' },
              staff: { en: 'SOC slots squeezed.', zh: '专科预约越发紧张。' },
            },
          },
          {
            id: 'no-followup',
            label: { en: 'No structured follow-up.', zh: '不安排正式随访。' },
            score: -4,
            rationale: {
              en: 'Misses occult VUR / recurrent UTI which can drive renal scarring.',
              zh: '会漏掉隐性的膀胱输尿管反流或反复尿路感染,可能造成肾瘢痕。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Re-presents with a 2nd UTI 6 months later.',
                zh: '6个月后因第二次尿路感染再就诊。',
              },
            },
          },
        ],
      },
    },
  ],
};
