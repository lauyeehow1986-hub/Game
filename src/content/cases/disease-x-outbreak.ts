import type { CaseDefinition } from '../../lib/types';

const NCID_ISO = {
  label: { en: 'NCID Outbreak Response Framework', zh: 'NCID疫情应对框架' },
  body: {
    en: 'National Centre for Infectious Diseases isolation, cohorting and PPE escalation guidance.',
    zh: '国家传染病中心(NCID)关于隔离、分群病房及个人防护装备(PPE)升级的指引。',
  },
};

const MOH_DORSCON = {
  label: { en: 'MOH DORSCON system', zh: '卫生部 DORSCON 系统' },
  body: {
    en: 'Disease Outbreak Response System Condition — colour-coded national alert system.',
    zh: '疾病暴发响应系统级别 — 全国分色警戒系统(绿/黄/橙/红)。',
  },
};

const WHO_IPC = {
  label: { en: 'WHO Infection Prevention & Control (2022)', zh: '世卫组织感染预防与控制(2022)' },
  body: {
    en: 'Global IPC guidance for novel respiratory pathogens.',
    zh: '世卫组织对新型呼吸道病原体的全球感染防控指引。',
  },
};

export const diseaseXOutbreak: CaseDefinition = {
  id: 'disease-x',
  title: {
    en: 'Disease X — 34 y/o returning traveller, severe respiratory illness',
    zh: 'X病 — 34岁回国旅客,严重呼吸道病症',
  },
  blurb: {
    en: 'Mr Wong, 34. Returned from a regional outbreak hotspot 5 days ago. Now febrile, hypoxic, dry cough. Walks into TTSH ED. DORSCON status was raised to Yellow that morning.',
    zh: '黄先生,34岁。5天前从区域疫情热点回国。现发热、低氧、干咳。自行步入TTSH急诊。当天上午DORSCON刚升至黄色。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'ncid'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [NCID_ISO, MOH_DORSCON, WHO_IPC],
  pathway: [
    {
      id: 'ttsh-arrival',
      department: 'entrance',
      facility: 'ttsh',
      durationMin: 5,
      framing: {
        patient: {
          en: 'You feel dizzy at the entrance. The security guard asks about your travel history.',
          zh: '你在医院门口感到头晕。保安询问你的旅行史。',
        },
        caregiver: {
          en: 'Your wife waits outside; the entrance is now segregated.',
          zh: '太太在外等候;入口现已分流。',
        },
        staff: {
          en: 'Front-line screener flags travel + fever + hypoxia. Activates outbreak protocol.',
          zh: '一线筛查员发现旅行史 + 发热 + 低氧。启动疫情应对方案。',
        },
      },
      decision: {
        id: 'initial-routing',
        prompt: {
          en: 'Walk-in with travel + fever + hypoxia at TTSH ED. DORSCON is Yellow. What do you do?',
          zh: 'TTSH急诊步入患者有旅行史 + 发热 + 低氧。DORSCON黄色。下一步?',
        },
        weight: 1.5,
        reference: NCID_ISO,
        options: [
          {
            id: 'isolate-then-transfer',
            label: {
              en: 'Move to TTSH negative-pressure cubicle in ED, full PPE, then transfer to NCID once stabilised.',
              zh: '先移至TTSH急诊负压隔离间、全套PPE;稳定后再转运至NCID。',
            },
            score: 10,
            rationale: {
              en: 'Standard outbreak response — initial isolation at point of presentation, definitive cohorting at NCID. Limits cross-contamination in the general ED.',
              zh: '标准疫情应对 — 首诊点先隔离,在NCID再分群处置。限制普通急诊内的交叉污染。',
            },
            outcome: {
              patient: {
                en: 'A staff member in a hood and gown wheels you to a side cubicle.',
                zh: '一位戴罩、穿隔离衣的员工把你推到一个独立隔间。',
              },
              caregiver: {
                en: 'You\'re asked to wait outside; given a mask and a leaflet.',
                zh: '你被请到外面等待,领了一只口罩和一张说明单。',
              },
              staff: {
                en: 'Outbreak protocol invoked; NCID infectious diseases on call paged.',
                zh: '疫情应对方案启动;已呼叫NCID值班传染科。',
              },
            },
          },
          {
            id: 'general-ed',
            label: {
              en: 'Manage in the general ED stream — same as any pneumonia.',
              zh: '按普通肺炎走一般急诊流程处理。',
            },
            score: -8,
            rationale: {
              en: 'Risks seeding the ED with a novel pathogen — exactly the SARS 2003 failure mode at TTSH.',
              zh: '可能在急诊播散新型病原 — 正是2003年TTSH SARS事件的失败模式。',
            },
            outcome: {
              patient: { en: 'You wait in a packed ED cubicle.', zh: '你在挤满人的急诊隔间里等候。' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Subsequent contact tracing identifies dozens of exposed patients and staff.',
                zh: '后续接触者追踪显示数十位病人和员工已暴露。',
              },
            },
          },
          {
            id: 'send-home',
            label: {
              en: 'Send home with safety-net advice; review in 48h.',
              zh: '交代红旗症状,让其回家;48小时后复诊。',
            },
            score: -10,
            rationale: {
              en: 'Hypoxic; ambulatory management is unsafe and risks community transmission.',
              zh: '存在低氧;门诊处理既不安全,也增加社区传播风险。',
            },
            outcome: {
              patient: {
                en: 'Worsens overnight; collapses next morning.',
                zh: '一夜恶化;次日清晨晕倒。',
              },
              caregiver: { en: 'You panic.', zh: '你慌了。' },
              staff: {
                en: 'Cluster traced to community contacts.',
                zh: '追踪到一组社区接触者已感染。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'ttsh-isolation',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 280,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 8 },
      framing: {
        patient: {
          en: 'A doctor in goggles takes a swab. The cotton bud goes much deeper than you expected.',
          zh: '一位戴护目镜的医生为你采集咽拭子。棉签插得比你想的深得多。',
        },
        caregiver: {
          en: 'You are texted not to come in. You stare at your phone.',
          zh: '你被短信通知不要进医院。你只能盯着手机。',
        },
        staff: {
          en: 'Bedside obs: SpO2 86% RA → 94% on 4L. CXR bilateral infiltrates. Multiplex PCR sent.',
          zh: '床旁监测:空气下SpO2 86% → 4L氧下94%。胸片双肺浸润影。已送多病原PCR。',
        },
      },
      decision: {
        id: 'ppe-level',
        prompt: {
          en: 'What PPE level do you mandate for staff handling this patient?',
          zh: '处理该患者的员工PPE应达哪一级?',
        },
        weight: 1.2,
        reference: WHO_IPC,
        options: [
          {
            id: 'airborne-pre',
            label: {
              en: 'Airborne precautions: N95 + face shield + gown + gloves; AGP only in negative-pressure room.',
              zh: '空气传播防护:N95 + 面罩 + 隔离衣 + 手套;气溶胶生成操作(AGP)仅在负压房进行。',
            },
            score: 10,
            rationale: {
              en: 'For an unidentified novel respiratory pathogen, airborne precautions are the safe default until aetiology is known.',
              zh: '对尚未明确的新型呼吸道病原,在病因明确前默认采用空气传播防护是最安全的做法。',
            },
            outcome: {
              patient: {
                en: 'Staff appear in white hooded gowns and goggles. You feel both reassured and afraid.',
                zh: '员工身穿白色连帽隔离衣、戴护目镜出现。你既安心又害怕。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'PPE escalation logged; donning/doffing buddy assigned.',
                zh: 'PPE升级已记录;指派穿脱搭档。',
              },
            },
          },
          {
            id: 'droplet-only',
            label: {
              en: 'Droplet precautions: surgical mask + gown + gloves only.',
              zh: '飞沫防护:仅外科口罩 + 隔离衣 + 手套。',
            },
            score: 2,
            rationale: {
              en: 'Inadequate for an unknown pathogen with possible airborne transmission.',
              zh: '对可能存在空气传播的未知病原而言防护不足。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Two staff develop symptoms a week later.',
                zh: '一周后两位员工出现症状。',
              },
            },
          },
          {
            id: 'standard-only',
            label: { en: 'Standard precautions only.', zh: '仅采用标准防护。' },
            score: -10,
            rationale: {
              en: 'Healthcare-worker outbreak risk. SARS 2003 lesson learnt.',
              zh: '医护暴发风险极高。2003 SARS的血泪教训。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Multiple staff infections; ward closure.',
                zh: '多名员工感染;病房关闭。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'transfer-to-ncid',
      department: 'discharge',
      facility: 'ttsh',
      durationMin: 30,
      framing: {
        patient: {
          en: 'A van comes to the back of the hospital. The staff are masked. You don\'t see the route.',
          zh: '一辆专车开到医院后门。员工全戴口罩。你看不到路线。',
        },
        caregiver: {
          en: 'You receive a call from a Care Liaison Officer. They explain the transfer.',
          zh: '一位医疗联络员致电向你解释转院事宜。',
        },
        staff: {
          en: 'Direct corridor transfer to NCID via dedicated bay; SCDF and NCID coordinated.',
          zh: '通过专用通道直接转运至NCID;SCDF与NCID已协调。',
        },
      },
    },
    {
      id: 'ncid-isolation',
      department: 'isolation',
      facility: 'ncid',
      durationMin: 1440,
      costSGD: 1600,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 14, financialWorry: 18, sleepDebt: 18 },
      framing: {
        patient: {
          en: 'A new room. Even quieter. The door has two airlocks.',
          zh: '一间新房,更安静。门有两道气闸。',
        },
        caregiver: {
          en: 'Video call only. You see his face on a tablet.',
          zh: '只能视讯通话。你在平板上看着他的脸。',
        },
        staff: {
          en: 'AIIR negative-pressure room. ID consultant rounds q12h. Empirical antivirals + supportive care.',
          zh: 'AIIR负压隔离房。传染科主治每12小时查房。经验性抗病毒 + 支持治疗。',
        },
      },
      decision: {
        id: 'cohorting',
        prompt: {
          en: 'Six similar cases now in NCID. PCR suggests a novel coronavirus variant. How do you organise the ward?',
          zh: 'NCID现已有六例类似患者。PCR提示新型冠状病毒变异株。病房如何编组?',
        },
        weight: 1.2,
        reference: NCID_ISO,
        options: [
          {
            id: 'cohort-by-pcr',
            label: {
              en: 'Cohort confirmed cases on one floor, suspect/probable on another. Dedicated staff teams; no cross-floor movement.',
              zh: '确诊病例集中一层,疑似/可能病例集中另一层。专门团队照护;禁止跨层流动。',
            },
            score: 10,
            rationale: {
              en: 'Cohorting reduces nosocomial spread and protects the staff workforce — a core lesson from SARS and COVID-19.',
              zh: '分群可减少院内传播并保护医护队伍 — SARS与新冠的核心教训。',
            },
            outcome: {
              patient: {
                en: 'You are moved to the confirmed-case floor. The view is the same as before.',
                zh: '你被转到确诊层。窗外风景跟之前一样。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Cohort plan published; staff rota fixed; cross-cover restricted.',
                zh: '分群方案已公告;员工排班固定;限制跨层支援。',
              },
            },
          },
          {
            id: 'no-cohort',
            label: {
              en: 'Mixed wards; rotating staff across all rooms.',
              zh: '混合病房;员工跨所有房间轮转。',
            },
            score: -6,
            rationale: {
              en: 'Cross-contamination and staff burnout.',
              zh: '导致交叉污染及员工耗竭。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Two HCW infections within a week.',
                zh: '一周内两名医护感染。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'ncid-icu',
      department: 'icu',
      facility: 'ncid',
      durationMin: 4320,
      costSGD: 8400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 30, financialWorry: 24, sleepDebt: 28 },
      framing: {
        patient: {
          en: '(Sedated. The hum of the ventilator. Memory blank.)',
          zh: '(镇静中。呼吸机的嗡鸣声。记忆一片空白。)',
        },
        caregiver: {
          en: 'Daily 5-minute video calls. The consultant draws diagrams on a whiteboard.',
          zh: '每天5分钟的视讯通话。主治医生在白板上画图说明。',
        },
        staff: {
          en: 'Day 3 — worsening hypoxia, intubated, prone-positioning, dexamethasone, antiviral.',
          zh: '第3天 — 低氧加重,已插管,采用俯卧位通气,地塞米松,抗病毒药物。',
        },
      },
    },
    {
      id: 'ncid-ward',
      department: 'ward',
      facility: 'ncid',
      durationMin: 7200,
      costSGD: 1800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 20, financialWorry: 8, sleepDebt: -10 },
      framing: {
        patient: {
          en: 'You wake up. A nurse tells you it\'s been 8 days. You ask about your wife.',
          zh: '你醒了。护士告诉你已经过了8天。你问起太太。',
        },
        caregiver: {
          en: 'You see him sit up for the first time. You both cry.',
          zh: '你第一次看到他能坐起来。两人都哭了。',
        },
        staff: {
          en: 'Extubated. De-escalating O2. Two consecutive negative PCRs trigger de-isolation discussion.',
          zh: '已拔管。氧需求下降。连续两次PCR阴性,启动解除隔离评估。',
        },
      },
    },
    {
      id: 'de-isolation',
      department: 'discharge',
      facility: 'ncid',
      durationMin: 60,
      framing: {
        patient: {
          en: 'They unlock the door for you to walk through. The air on the other side smells different.',
          zh: '他们为你打开隔离门。门外的空气闻起来不一样了。',
        },
        caregiver: {
          en: 'You are allowed to bring his clothes. You hold his hand.',
          zh: '你被允许带衣服来给他。你紧紧握住他的手。',
        },
        staff: {
          en: 'Two negative PCRs ≥24h apart, afebrile ≥48h, clinically improved. De-isolation cleared.',
          zh: '两次PCR阴性间隔≥24小时,退热≥48小时,临床改善。批准解除隔离。',
        },
      },
      decision: {
        id: 'home-or-step-down',
        prompt: {
          en: 'He is medically stable but deconditioned, post-ICU. Where does he go next?',
          zh: '内科病情稳定但经历ICU后体力虚弱。下一步去哪里?',
        },
        weight: 1,
        reference: NCID_ISO,
        options: [
          {
            id: 'community-rehab',
            label: {
              en: 'Step-down to Yishun Community Hospital for 2 weeks of post-ICU rehab.',
              zh: '转至义顺社区医院(YCH)进行2周ICU后康复。',
            },
            score: 10,
            rationale: {
              en: 'Post-ICU syndrome (ICU-acquired weakness, deconditioning) responds well to inpatient rehab; reduces 90-day readmission.',
              zh: 'ICU后综合征(ICU相关无力、体力下降)对住院康复反应良好;可降低90天再住院率。',
            },
            outcome: {
              patient: {
                en: 'A new ward. The physio asks you to stand. You wobble but stand.',
                zh: '新病房。理疗师让你站起来。你摇晃了几下,但还是站住了。',
              },
              caregiver: {
                en: 'You can finally visit in person. You sleep that night.',
                zh: '你终于可以亲自来探病。当晚睡得很好。',
              },
              staff: {
                en: 'YCH bed booked; AIC referral submitted; NEHR records flow.',
                zh: 'YCH床位已预订;AIC转介已提交;NEHR记录流转。',
              },
            },
          },
          {
            id: 'discharge-home',
            label: { en: 'Discharge home with home-care therapy.', zh: '回家加居家治疗。' },
            score: 5,
            rationale: {
              en: 'Reasonable if home environment supports recovery; risk of falls and re-presentation.',
              zh: '若家中环境利于恢复尚可;存在跌倒及再就诊风险。',
            },
            outcome: {
              patient: { en: 'Home feels strange.', zh: '回到家反而觉得陌生。' },
              caregiver: {
                en: 'You take leave. You worry about every cough.',
                zh: '你请假在家。听到每一声咳嗽都紧张。',
              },
              staff: { en: 'PT/OT visits arranged.', zh: '已安排物理/职能治疗上门。' },
            },
          },
          {
            id: 'discharge-no-rehab',
            label: { en: 'Discharge without rehab.', zh: '不安排康复直接出院。' },
            score: -3,
            rationale: {
              en: 'Predictable functional decline after prolonged ICU stay.',
              zh: '长时间ICU住院后功能下降可预见。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Re-presents with a fall in 3 weeks.',
                zh: '3周后因跌倒再就诊。',
              },
            },
          },
        ],
      },
    },
  ],
};
