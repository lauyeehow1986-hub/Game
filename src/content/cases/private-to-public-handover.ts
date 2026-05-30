import type { CaseDefinition } from '../../lib/types';

const NEHR_RULES = {
  label: { en: 'MOH National Electronic Health Record (NEHR)', zh: '卫生部国家电子健康记录(NEHR)' },
  body: {
    en: 'NEHR participation is mandatory for restructured public providers; voluntary for private and primary-care providers.',
    zh: 'NEHR对政府改组医院强制参与;私立机构与基层医疗自愿参与。',
  },
};

const RIGHT_SITING = {
  label: { en: 'MOH Right-Siting / Healthier SG', zh: '卫生部分级就诊 / Healthier SG' },
  body: {
    en: 'Stable disease should be managed at the appropriate care setting; transfers between sectors require complete records hand-over.',
    zh: '病情稳定者应在合适的层级管理;跨层级转介须完整移交病历。',
  },
};

const RIBA = {
  label: { en: 'NCCN / SG Renal CPG', zh: 'NCCN / 新加坡肾占位临床指南' },
  body: {
    en: 'Workup of suspected renal mass: dedicated CT urogram or MR urogram, urine cytology, urology referral.',
    zh: '疑似肾占位检查:专门CT尿路造影或MR尿路造影、尿细胞学、转介泌尿外科。',
  },
};

export const privateToPublicHandover: CaseDefinition = {
  id: 'private-to-public-handover',
  title: {
    en: 'Renal Mass — private → public handover with hand-carry CD',
    zh: '肾占位 — 私立转公立移交,患者自携影像光盘',
  },
  blurb: {
    en: 'Mr Tan, 58 (Healthway Medical CHAS Orange GP). Routine private-clinic ultrasound for low back pain incidentally found a 4 cm right renal mass. Private radiologist recommended CT urogram, then escalation to a urologist. He transfers to subsidised SGH urology to manage costs. The CT report and images live on the private radiology PACS — not on NEHR.',
    zh: '陈先生,58岁(在康威医疗Healthway看的CHAS橙卡家庭医生)。因腰痛在私立诊所做常规超声,意外发现右肾4 cm肿块。私立放射科建议CT尿路造影,并转介泌尿外科。为控制费用,他转往SGH津贴泌尿外科。CT报告与影像存于私立放射科PACS,并未上传NEHR。',
  },
  category: 'outpatient',
  primaryFacility: 'gp-healthway',
  involvedFacilities: ['gp-healthway', 'asia-medic', 'sgh', 'home', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [NEHR_RULES, RIGHT_SITING, RIBA],
  pathway: [
    {
      id: 'gp-incidental-finding',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 25,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 6 },
      framing: {
        patient: {
          en: 'You came for back pain. The doctor mentions something on the scan you don\'t fully understand.',
          zh: '你来看腰痛,但医生提了一句你听不太懂的扫描发现。',
        },
        caregiver: {
          en: 'You re-read the report at home. The phrase "complex cystic mass" is on the second page.',
          zh: '回家你又重读了一次报告。第二页上写着"复杂囊性病变(complex cystic mass)"。',
        },
        staff: {
          en: 'Healthway GP: Bosniak III renal lesion on US incidental. Recommend CT urogram + urology.',
          zh: '康威家庭医生:超声偶然发现Bosniak III级肾囊性病变。建议CT尿路造影 + 泌尿外科会诊。',
        },
      },
      decision: {
        id: 'next-step-imaging',
        prompt: {
          en: 'Where to send him for the CT urogram and urology consult?',
          zh: 'CT尿路造影与泌尿外科会诊安排在哪里?',
        },
        weight: 1.5,
        reference: NEHR_RULES,
        options: [
          {
            id: 'private-ct-then-public-soc',
            label: {
              en: 'Asia Medic for private CT urogram (fast), then subsidised SGH urology SOC referral.',
              zh: '先到Asia Medic做私立CT尿路造影(快),再以津贴价转介至SGH泌尿外科专科门诊。',
            },
            score: 7,
            rationale: {
              en: "Pragmatic: private imaging is quick and the bulk of cost (treatment) goes through subsidised pathway. But the private CT will sit on a CD — not NEHR — so the patient must hand-carry images / report to SGH.",
              zh: '务实路径:私立影像快,后续大部分费用(治疗)走津贴路径。但私立CT只会存在光盘上 — 不上NEHR — 患者必须把影像与报告"手提"到SGH。',
            },
            outcome: {
              patient: {
                en: 'You go to Asia Medic for the scan. The private radiologist explains carefully.',
                zh: '你到Asia Medic做扫描。私立放射科医生耐心地解释。',
              },
              caregiver: {
                en: 'You collect a CD and a printed report. The receptionist puts them in a paper bag.',
                zh: '你领了一张光盘和一份打印报告。前台用纸袋装好递给你。',
              },
              staff: {
                en: 'CT report + images on CD; referral letter generated.',
                zh: 'CT报告与影像存光盘;转介信已开。',
              },
            },
          },
          {
            id: 'public-imaging-and-soc',
            label: {
              en: 'Subsidised SGH urology SOC referral; let SGH order their own CT under cluster lab/PACS.',
              zh: '直接津贴价转介SGH泌尿外科;由SGH在集群影像与PACS下自己安排CT。',
            },
            score: 9,
            rationale: {
              en: 'Cleanest record-flow pathway. CT and clinic both in NEHR; nothing for the patient to hand-carry. Slightly slower turnaround.',
              zh: '资料流转最干净的路径。CT与门诊记录都在NEHR内,患者不必"手提"任何东西。流转稍慢。',
            },
            outcome: {
              patient: { en: 'You wait 3-4 weeks for the slot.', zh: '你等了3-4周才约到。' },
              caregiver: { en: 'You worry but trust the system.', zh: '你担心,但选择相信系统。' },
              staff: {
                en: 'SGH urology accepts; CT booked in their slot.',
                zh: 'SGH泌尿外科已接收;CT在他们的档期内预约。',
              },
            },
          },
          {
            id: 'private-everything',
            label: {
              en: 'Continue private at Mt Elizabeth Novena urology end-to-end.',
              zh: '从头到尾走私立路线,在伊丽莎白诺维娜医院泌尿外科治疗。',
            },
            score: 4,
            rationale: {
              en: 'Fast and continuous, but full private rate; no MAF subsidy if treatment escalates.',
              zh: '快速、连续,但需付完整私人价;若治疗升级则无MAF津贴。',
            },
            outcome: {
              patient: { en: 'A consult next week.', zh: '下周就能看诊。' },
              caregiver: { en: 'You worry about the bill.', zh: '你担心账单。' },
              staff: { en: 'Acceptable; cost discussed.', zh: '可接受;已讨论费用。' },
            },
          },
          {
            id: 'no-followup',
            label: { en: 'Reassure, repeat US in 6 months.', zh: '安抚后,6个月后复查超声。' },
            score: -8,
            rationale: {
              en: 'Bosniak III lesion needs urgent characterisation — surveillance only is inappropriate.',
              zh: 'Bosniak III级病变需要尽快定性 — 仅做随访不合适。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Returns 1y later with a 6 cm mass.', zh: '一年后因6 cm肿块再就诊。' },
            },
          },
        ],
      },
    },
    {
      id: 'private-ct',
      department: 'imaging',
      facility: 'asia-medic',
      durationMin: 60,
      costSGD: 950,
      charge: 'imaging',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 14 },
      framing: {
        patient: {
          en: 'A new place. The radiographer explains the contrast injection. Your arm warms briefly.',
          zh: '一个陌生的地方。放射技师解释打造影剂的过程。你的手臂瞬间发热。',
        },
        caregiver: {
          en: 'You collect the CD and report on the way out — you don\'t know if it\'s the original.',
          zh: '出来时领了光盘和报告 — 你也不确定是不是原件。',
        },
        staff: {
          en: 'Triphasic CT urogram performed; report concludes likely Bosniak IV cystic RCC right kidney.',
          zh: '完成三期CT尿路造影;报告结论:右肾Bosniak IV级囊性肾细胞癌(RCC)可能性大。',
        },
      },
    },
    {
      id: 'home-prep',
      department: 'discharge',
      facility: 'home',
      durationMin: 60,
      framing: {
        patient: {
          en: 'You hold the CD case in your hand. You read the report twice.',
          zh: '你手里握着光盘盒。报告读了两遍。',
        },
        caregiver: {
          en: 'You photograph every page; you take the CD to your laptop and check it opens.',
          zh: '你把每一页都拍了照;还把光盘插进笔记本电脑,确认能打开。',
        },
        staff: {
          en: '(care coordinator: this is the moment data flow can fail — physical media + memory rather than NEHR.)',
          zh: '(医疗协调员:这正是资料流转可能出错的时刻 — 全靠实体载体和记忆,而非NEHR。)',
        },
      },
      decision: {
        id: 'records-handover-strategy',
        prompt: {
          en: 'Day before SGH appointment. CT not on NEHR. What do you advise the patient bring / arrange?',
          zh: 'SGH预约前一天。CT不在NEHR上。你建议患者带什么或事先安排什么?',
        },
        weight: 1.5,
        reference: NEHR_RULES,
        options: [
          {
            id: 'cd-plus-photos-plus-portal',
            label: {
              en: "Bring CD + paper report + photographs of the report; ask Healthway to upload referral letter to NEHR; check HealthHub on arrival.",
              zh: '带光盘 + 纸本报告 + 报告的照片;请康威把转介信上传至NEHR;到达后在HealthHub核对。',
            },
            score: 10,
            rationale: {
              en: 'Belt-and-braces. CD is sometimes unreadable on hospital workstations; photographs as backup; uploading the referral letter via HealthHub or memo ensures the receiving clinician has at least the structured findings.',
              zh: '双重保险。医院工作站有时读不出光盘;照片作为后备;把转介信透过HealthHub或备忘上传,可确保接诊医师至少能看到结构化的关键发现。',
            },
            outcome: {
              patient: { en: 'You arrive prepared.', zh: '你做足了准备来到医院。' },
              caregiver: { en: 'You feel less anxious.', zh: '你的焦虑少了一些。' },
              staff: {
                en: 'The reg loads the CD on the second workstation that accepts it; everything fits.',
                zh: '住院医师在第二台能识别的工作站上读取光盘;所有资料齐全。',
              },
            },
          },
          {
            id: 'cd-only',
            label: { en: 'Bring the CD only; trust SGH to load it.', zh: '只带光盘,完全靠SGH读取。' },
            score: 4,
            rationale: {
              en: 'Often works but sometimes the disc is unreadable; if SGH cannot load images they may need to repeat the CT — duplication of cost and radiation.',
              zh: '通常可行,但光盘偶尔会读不出来;若SGH无法读取就需要重做CT — 重复费用与辐射。',
            },
            effects: { setFlags: ['records-friction'] },
            outcome: {
              patient: {
                en: 'CD won\'t load on the first workstation.',
                zh: '第一台工作站读不出光盘。',
              },
              caregiver: { en: 'You feel embarrassed.', zh: '你觉得有些难堪。' },
              staff: {
                en: 'IT support paged; eventually loads on a different machine.',
                zh: '呼叫IT支持;最终在另一台机器上成功打开。',
              },
            },
          },
          {
            id: 'verbal-only',
            label: { en: 'Trust verbal hand-over.', zh: '只靠口头转告。' },
            score: -4,
            rationale: {
              en: 'Loss of detail; inevitable repeat imaging at unnecessary cost.',
              zh: '细节流失;影像必然要重做,造成不必要的费用。',
            },
            effects: { setFlags: ['records-missing', 'ct-repeated'] },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'CT repeated at SGH; financial and radiation burden.',
                zh: 'SGH重做CT;增加费用与辐射负担。',
              },
            },
          },
        ],
      },
    },
    // Conditional friction node: only fires if the player skimped on the
    // records hand-over. Concrete consequence of the cross-sector NEHR gap
    // — patient pays for a repeat CT plus extra SGH waiting room time.
    {
      id: 'sgh-records-friction',
      department: 'imaging',
      facility: 'sgh',
      durationMin: 90,
      costSGD: 400,
      charge: 'imaging',
      requiresAnyFlag: ['records-missing', 'records-friction'],
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4, sleepDebt: 1 },
      framing: {
        patient: {
          en: 'SGH front desk: "We can\'t open your CT. We\'ll need to repeat it before the doctor sees you." Another 90 minutes in the queue.',
          zh: 'SGH前台:"我们打不开您的CT,需要重做一次才能让医生看诊。"再排队等90分钟。',
        },
        caregiver: {
          en: 'You realise the morning is gone. Another S$400 on the bill.',
          zh: '你意识到整个早上都报销了。账单又多了S$400。',
        },
        staff: {
          en: 'Records gap manifest: private-sector CT not in NEHR + disc unreadable / not brought = repeat scan, repeat radiation dose, repeat consult delay.',
          zh: '资料缺口显现:私立CT不在NEHR + 光盘无法读取或未带 = 重做扫描、重复辐射、再次延迟会诊。',
        },
      },
    },
    {
      id: 'sgh-soc-visit',
      department: 'soc',
      facility: 'sgh',
      durationMin: 75,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'A different building. Different smell. The doctor pulls up images you brought on a CD.',
          zh: '一栋不一样的楼,空气里也是不一样的味道。医生把你带来的光盘上的影像调出来。',
        },
        caregiver: {
          en: 'You sit through the discussion. Every minute counts.',
          zh: '你陪着把整段讨论坐完。每一分钟都重要。',
        },
        staff: {
          en: 'SGH urology: reviews private CT (now on cluster PACS via CD import), confirms Bosniak IV. Plans for partial nephrectomy + MDT review.',
          zh: 'SGH泌尿外科:复看私立CT(已通过光盘导入集群PACS),证实Bosniak IV。计划行部分肾切除 + MDT讨论。',
        },
      },
      decision: {
        id: 'subsidy-class-soc',
        prompt: {
          en: 'Eligible for subsidised SGH care. He has CHAS Orange. Ward class for inpatient stay?',
          zh: '符合SGH津贴照护条件,持CHAS橙卡。住院选哪个等级?',
        },
        weight: 0.8,
        reference: RIGHT_SITING,
        options: [
          {
            id: 'class-c',
            label: { en: 'Class C (highest subsidy).', zh: 'C级病房(津贴最高)。' },
            score: 10,
            rationale: {
              en: 'Best fit given income and CHAS tier.',
              zh: '依其收入与CHAS等级,最合适。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'You exhale.', zh: '你松一口气。' },
              staff: { en: 'MSW happy.', zh: '医务社工满意。' },
            },
          },
          {
            id: 'class-b1',
            label: { en: 'Class B1.', zh: 'B1级病房。' },
            score: 4,
            rationale: { en: 'Reasonable; smaller subsidy.', zh: '合理选择;津贴较少。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: 'OK.', zh: '可以。' } },
          },
        ],
      },
    },
    {
      id: 'right-sited-back-to-gp',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 30,
      framing: {
        patient: {
          en: 'After surgery and recovery, you come back to the same clinic for follow-up bloods.',
          zh: '手术后恢复期过,你又回到熟悉的诊所做复查抽血。',
        },
        caregiver: {
          en: 'You bring the SGH discharge summary along — easier than relying on it pinging through.',
          zh: '你顺手把SGH的出院摘要带来 — 比等系统自动传过来快多了。',
        },
        staff: {
          en: 'Healthway GP receives discharge summary by email; updates patient record. NEHR pulls SGH segments.',
          zh: '康威家庭医生收到电邮形式的出院摘要;更新病历。NEHR可调取SGH的相关段落。',
        },
      },
      decision: {
        id: 'continuity',
        prompt: {
          en: 'Surveillance plan: post-partial-nephrectomy follow-up. How to share data?',
          zh: '监测方案:部分肾切除术后的随访。资料该怎么共享?',
        },
        weight: 1,
        reference: NEHR_RULES,
        options: [
          {
            id: 'shared-care-with-nehr',
            label: {
              en: 'Shared care: SGH urology surveillance imaging quarterly → annual; GP for chronic disease + repeat bloods. Patient enrolled in HealthHub for personal record copy.',
              zh: '共享照护:SGH泌尿外科每3个月影像监测,逐渐过渡至每年一次;家庭医生管理慢性病与复查抽血。患者登记HealthHub获取个人病历副本。',
            },
            score: 10,
            rationale: {
              en: 'NEHR captures SGH segments; HealthHub gives the patient a personal copy he can show his GP. GP records remain offline but the SGH records are viewable to him.',
              zh: 'SGH的资料进入NEHR;HealthHub给患者一份个人副本,可拿给家庭医生看。家庭医生的记录可能不在NEHR,但SGH的记录对他可见。',
            },
            outcome: {
              patient: { en: 'You learn to log in.', zh: '你学会登录HealthHub。' },
              caregiver: { en: 'You set up his account.', zh: '太太帮你把账户设好。' },
              staff: {
                en: 'Everything visible to GP through patient or NEHR.',
                zh: '所有内容透过患者或NEHR都对家庭医生可见。',
              },
            },
          },
          {
            id: 'soc-only',
            label: {
              en: 'SGH SOC only; GP doesn\'t need to know.',
              zh: '只做SGH专科门诊;不告诉家庭医生。',
            },
            score: 4,
            rationale: {
              en: 'Misses chronic disease management; fragmented.',
              zh: '错过慢性病管理;照护碎片化。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'BP / cholesterol drift.', zh: '血压 / 胆固醇逐渐失控。' },
            },
          },
        ],
      },
    },
  ],
};
