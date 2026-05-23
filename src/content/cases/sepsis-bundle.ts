import type { CaseDefinition } from '../../lib/types';

const SSC = {
  label: { en: 'Surviving Sepsis Campaign 2021', zh: '拯救脓毒症运动指南 2021(SSC 2021)' },
  body: {
    en: 'International guidance: hour-1 bundle, lactate, broad-spectrum antibiotics within 1h, fluids, vasopressors.',
    zh: '国际指南:一小时集束化措施 — 测乳酸、1小时内启动广谱抗生素、补液、必要时升压药。',
  },
};

const SG_AMS = {
  label: { en: 'MOH Antimicrobial Stewardship', zh: '卫生部抗生素管理指引' },
  body: {
    en: 'Singapore primary-care and hospital antimicrobial stewardship — early de-escalation once cultures return.',
    zh: '新加坡基层医疗与医院的抗生素管理 — 培养结果回报后尽早降阶梯。',
  },
};

const NEWS = {
  label: { en: 'NEWS2 / qSOFA', zh: 'NEWS2 / qSOFA 急性恶化评分' },
  body: {
    en: 'Acute deterioration scoring; trigger sepsis pathway and ICU referral.',
    zh: '急性恶化评分系统;触发脓毒症诊疗路径及ICU会诊。',
  },
};

export const sepsisCase: CaseDefinition = {
  id: 'sepsis-bundle',
  title: {
    en: 'Severe sepsis — 73 y/o auntie, fever and confusion',
    zh: '严重脓毒症 — 73岁阿姨,发烧伴神志不清',
  },
  blurb: {
    en: 'Mdm Lim, 73, retired, frail. Fever + confusion at the void deck this morning; family carried her to a Healthway GP. GP triaged her to the nearest ED at KTPH.',
    zh: '林女士,73岁,已退休、体弱。今早在组屋底层突发发烧加神志不清;家人扶她到一家康威医疗(Healthway)家庭医生。医生紧急转诊至最近的KTPH急诊。',
  },
  category: 'acute',
  primaryFacility: 'ktph',
  involvedFacilities: ['gp-healthway', 'scdf', 'ktph', 'ych'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  randomiseProfile: true,
  acuteTimer: {
    goalMin: 60,
    goalLabel: 'Antibiotic by',
    missedFlag: 'abx-delayed',
  },
  guidelines: [SSC, SG_AMS, NEWS],
  pathway: [
    {
      id: 'gp-recognises',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 15,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4, sleepDebt: 4 },
      framing: {
        patient: { en: '(Drowsy, mumbling. T 39.1, BP 96/58.)', zh: '(嗜睡,语无伦次。体温39.1,血压96/58。)' },
        caregiver: {
          en: 'You take her in and the GP\'s face changes when he sees her.',
          zh: '你扶她进诊间,医生一看到她脸色就变了。',
        },
        staff: {
          en: 'GP: qSOFA 2 (RR 24, AMS), T 39.1, hypotensive. Calls 995.',
          zh: '家庭医生:qSOFA 2分(呼吸24次/分、神志改变),体温39.1,血压低。拨打995。',
        },
      },
      decision: {
        id: 'recognise-route',
        prompt: {
          en: 'GP triage: confused, hypotensive, febrile elderly woman. What now?',
          zh: '家庭医生分诊:神志不清、血压偏低、发烧的老年女性。下一步?',
        },
        weight: 1.5,
        reference: NEWS,
        options: [
          {
            id: '995-blue-light',
            label: {
              en: 'Activate 995 with sepsis pre-notification; oxygen + 500 mL crystalloid bolus en route.',
              zh: '启动995并通知接收医院"疑似脓毒症";途中给氧 + 500 mL晶体液冲击补液。',
            },
            score: 10,
            rationale: {
              en: 'Pre-hospital recognition + ED pre-notification + early fluids meaningfully shorten time-to-antibiotics.',
              zh: '院前识别 + 预先通知急诊 + 早期补液能显著缩短"到达至抗生素"时间。',
            },
            outcome: {
              patient: { en: '(IV up; saline running.)', zh: '(静脉通路已建立,生理盐水在滴。)' },
              caregiver: { en: 'You ride along.', zh: '你跟着救护车一起去。' },
              staff: {
                en: 'Pre-notification arrives at KTPH ED 4 min before patient.',
                zh: '预通知比病人提早4分钟抵达KTPH急诊。',
              },
            },
          },
          {
            id: 'taxi',
            label: {
              en: 'Family takes her by Grab to KTPH ED.',
              zh: '家属叫Grab送她去KTPH急诊。',
            },
            score: 3,
            rationale: {
              en: 'Plausible if EMS not available, but loses pre-hospital time and pre-notification.',
              zh: '若无救护车尚可,但失去院前救治时间与预通知优势。',
            },
            outcome: {
              patient: { en: '(jolting along the PIE.)', zh: '(车在PIE高速上颠簸。)' },
              caregiver: {
                en: 'You arrive without warning to triage.',
                zh: '你抵达分诊台时医院没有任何预警。',
              },
              staff: { en: 'Triage P1 only after registration.', zh: '登记后才被分到P1分诊级别。' },
            },
          },
          {
            id: 'observe-clinic',
            label: {
              en: 'Observe in clinic; antipyretic and IV fluids only.',
              zh: '留在诊所观察;只给退烧药和静脉输液。',
            },
            score: -8,
            rationale: {
              en: 'Sepsis with end-organ dysfunction needs ED resus, not GP observation.',
              zh: '已有器官功能障碍的脓毒症需急诊复苏,不应留在诊所观察。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Deteriorates; eventual transfer too late.',
                zh: '病情恶化;最终转院为时已晚。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'ed-resus',
      department: 'ed',
      facility: 'ktph',
      durationMin: 30,
      costSGD: 320,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(O2 mask on, IV cannula in, blood draws.)',
          zh: '(已戴氧气面罩,静脉留置针在位,正在抽血。)',
        },
        caregiver: {
          en: 'You wait outside the resus bay. The senior nurse keeps you informed.',
          zh: '你在抢救室外等候。资深护士不时出来向你汇报情况。',
        },
        staff: {
          en: 'BP 90/52, HR 118, SpO2 92% RA → 95% on 4L. Lactate 4.6. WBC 18, CRP 240. Urine dip leucs +ve.',
          zh: '血压90/52,心率118,空气下SpO2 92% → 4L氧下95%。乳酸4.6。白细胞18,CRP 240。尿试纸白细胞酯酶阳性。',
        },
      },
      decision: {
        id: 'hour-1-bundle',
        prompt: {
          en: 'Lactate 4.6, urinary source likely. What do you do in the first hour?',
          zh: '乳酸4.6,可能为尿路源性脓毒症。第一小时该做什么?',
        },
        weight: 1.5,
        reference: SSC,
        options: [
          {
            id: 'full-bundle',
            label: {
              en: 'Cultures (blood + urine) → broad-spectrum antibiotics within 1h (e.g. piperacillin-tazobactam) → 30 mL/kg crystalloid → re-measure lactate.',
              zh: '送培养(血+尿)→ 1小时内给广谱抗生素(如哌拉西林-他唑巴坦)→ 30 mL/kg晶体液 → 复测乳酸。',
            },
            score: 10,
            rationale: {
              en: 'Hour-1 bundle is the cornerstone of early sepsis care; each hour\'s delay in antibiotics raises mortality.',
              zh: '一小时集束化措施是早期脓毒症救治的核心;每延迟一小时启用抗生素,死亡率上升。',
            },
            outcome: {
              patient: {
                en: '(antibiotic running by 38 min from arrival.)',
                zh: '(到院后38分钟抗生素已在滴注。)',
              },
              caregiver: { en: 'You hold her hand.', zh: '你握着她的手。' },
              staff: { en: 'Bundle complete; ICU paged.', zh: '集束化措施完成;已呼叫ICU。' },
            },
          },
          {
            id: 'antibiotics-first-skip-cultures',
            label: {
              en: 'Give antibiotics first; skip cultures.',
              zh: '先给抗生素;不送培养。',
            },
            score: 5,
            rationale: {
              en: 'Saves time but loses microbiology — harder to de-escalate later.',
              zh: '节省了时间但失去微生物学依据 — 后续难以降阶梯。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Stewardship audit hit.', zh: '抗生素管理稽查被标记。' },
            },
            effects: { setFlags: ['no-cultures'] },
          },
          {
            id: 'wait-for-cultures',
            label: {
              en: 'Wait for blood cultures and lactate to return before any antibiotics.',
              zh: '等血培养和乳酸结果回报后再给抗生素。',
            },
            score: -8,
            rationale: {
              en: 'Delaying antibiotics in hypotensive sepsis raises mortality; do not wait.',
              zh: '在低血压脓毒症中延迟抗生素会增加死亡率;切勿等待。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'BP drops further before antibiotics.',
                zh: '抗生素尚未给予前,血压进一步下降。',
              },
            },
            effects: { setFlags: ['abx-delayed', 'septic-deterioration'] },
          },
        ],
      },
    },
    {
      id: 'icu-admission',
      department: 'icu',
      facility: 'ktph',
      durationMin: 4320,
      costSGD: 6800,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 18, sleepDebt: 28 },
      framing: {
        patient: {
          en: '(Norepinephrine running. Sedated. Family on Zoom each evening.)',
          zh: '(去甲肾上腺素在持续输注。镇静中。家属每晚Zoom探视。)',
        },
        caregiver: {
          en: 'You sleep at home but you don\'t really sleep.',
          zh: '你回家睡了,可其实没真正睡着。',
        },
        staff: {
          en: 'ICU course: vasopressors weaned by D3; antibiotic de-escalated to ceftriaxone after sensitivities. Mild AKI resolving.',
          zh: 'ICU病程:第3天升压药已撤;药敏回报后抗生素降阶梯至头孢曲松。轻度急性肾损伤渐恢复。',
        },
      },
      decision: {
        id: 'subsidy-class',
        prompt: {
          en: 'Means-test eligible (MG card, low income, no IP rider). Ward class for step-down ward?',
          zh: '通过家庭收入审查(持立国一代MG卡、低收入、无综合健保附加险)。转入普通病房选哪个等级?',
        },
        weight: 0.8,
        reference: SSC,
        options: [
          {
            id: 'class-c',
            label: { en: 'Class C.', zh: 'C级病房。' },
            score: 10,
            rationale: { en: 'Best subsidy + MG top-up.', zh: '津贴最高,加上立国一代额外津贴。' },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Affordable.', zh: '负担得起。' },
              staff: { en: 'MSW pleased.', zh: '医务社工满意。' },
            },
            effects: { wardClass: 'C' },
          },
          {
            id: 'class-b2',
            label: { en: 'Class B2.', zh: 'B2级病房。' },
            score: 6,
            rationale: { en: 'Reasonable; smaller subsidy.', zh: '合理选择;津贴较少。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: 'OK.', zh: '可以。' } },
            effects: { wardClass: 'B2' },
          },
          {
            id: 'class-a',
            label: { en: 'Class A.', zh: 'A级病房。' },
            score: -3,
            rationale: {
              en: 'No clinical benefit; financial harm.',
              zh: '无临床获益;造成经济伤害。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You apply for Medifund later.',
                zh: '事后申请保健基金(Medifund)。',
              },
              staff: { en: 'MSW counsels.', zh: '医务社工提供辅导。' },
            },
            effects: { wardClass: 'A', setFlags: ['financial-distress'], caregiverBurden: { financialWorry: 24 } },
          },
        ],
      },
    },
    {
      id: 'septic-shock-deterioration',
      department: 'icu',
      facility: 'ktph',
      requiresAnyFlag: ['septic-deterioration', 'abx-delayed'],
      durationMin: 240,
      costSGD: 4200,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 12, sleepDebt: 24 },
      framing: {
        patient: {
          en: '(intubated; lactate 8; on noradrenaline + vasopressin.)',
          zh: '(已插管;乳酸8;去甲肾上腺素 + 加压素持续输注。)',
        },
        caregiver: {
          en: 'You are warned to expect the worst overnight. The chaplain visits.',
          zh: '你被告知今晚可能最坏的情况会发生。牧师来探望。',
        },
        staff: {
          en: 'Refractory septic shock. Hour-1 deviation amplifies mortality risk.',
          zh: '难治性脓毒性休克。偏离一小时集束化方案进一步放大死亡风险。',
        },
      },
      decision: {
        id: 'shock-rescue',
        prompt: {
          en: 'Refractory shock despite 60 mL/kg fluid + dual vasopressor. What now?',
          zh: '已给60 mL/kg液体 + 双联升压药仍属难治性休克。怎么办?',
        },
        weight: 1.5,
        reference: SSC,
        options: [
          {
            id: 'broaden-and-hydro',
            label: {
              en: 'Broaden antibiotics (add anti-pseudomonal cover); hydrocortisone 200 mg/day; source-control review.',
              zh: '扩大抗生素覆盖(加抗铜绿假单胞菌方案);氢化可的松200 mg/日;复核感染源控制。',
            },
            score: 10,
            rationale: {
              en: 'Standard escalation in refractory shock.',
              zh: '难治性休克的标准升级治疗。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { clearFlags: ['septic-deterioration'] },
          },
          {
            id: 'palliate-now',
            label: { en: 'Withdraw escalation; palliate.', zh: '停止积极治疗;转入舒缓治疗。' },
            score: -4,
            rationale: {
              en: 'Premature without senior + family discussion or trial of corticosteroid + source control.',
              zh: '尚未经上级医师讨论、家属沟通或皮质类固醇 + 感染源控制试验,过早终止治疗不合适。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'step-down-ward',
      department: 'ward',
      facility: 'ktph',
      durationMin: 5760,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 4, sleepDebt: -6 },
      framing: {
        patient: {
          en: '(Eating, mobilising with frame, asking for kopi.)',
          zh: '(能进食、扶助行架走路、开始要喝咖啡(kopi)。)',
        },
        caregiver: {
          en: 'She tells you off for not bringing her hairbrush.',
          zh: '她数落你没把她的梳子带来。',
        },
        staff: {
          en: 'Day 5: stable; complete 7-day antibiotic; physio for ICU-acquired weakness; geriatric review for frailty.',
          zh: '第5天:病情稳定;完成7天抗生素疗程;物理治疗处理ICU相关无力;老年科评估衰弱情况。',
        },
      },
    },
    {
      id: 'community-step-down',
      department: 'rehab-gym',
      facility: 'ych',
      durationMin: 14400,
      costSGD: 1800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -8, financialWorry: 4, sleepDebt: -10 },
      framing: {
        patient: {
          en: '(Stronger by day 7. The therapist is younger than your son.)',
          zh: '(第7天体力好转。治疗师比你儿子还年轻。)',
        },
        caregiver: {
          en: 'You sleep through the night for the first time.',
          zh: '你第一次睡了一整晚的好觉。',
        },
        staff: {
          en: 'YCH rehab: 2 weeks of frailty rehab; AIC enrolled for home modifications; smoke alarm fitted.',
          zh: 'YCH(义顺社区医院)康复:两周衰弱康复;通过AIC安排居家改造;安装烟雾报警器。',
        },
      },
      decision: {
        id: 'home-with-support',
        prompt: { en: 'Discharge plan?', zh: '出院计划?' },
        weight: 1,
        reference: SSC,
        options: [
          {
            id: 'home-gp-sg',
            label: {
              en: 'Home with home-care, AH@Home virtual ward, Healthier-SG GP enrolment.',
              zh: '回家 + 居家照护 + AH@Home虚拟病房 + 登记Healthier SG家庭医生。',
            },
            score: 10,
            rationale: {
              en: 'Best continuity for frail seniors; reduces 30-day readmission.',
              zh: '衰弱老人最佳连续性方案;可降低30天再住院率。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Less travel.', zh: '少跑医院。' },
              staff: { en: 'NEHR populated.', zh: 'NEHR记录已更新。' },
            },
          },
          {
            id: 'soc-only',
            label: { en: 'Geriatric SOC at KTPH only.', zh: '仅安排KTPH老年科门诊。' },
            score: 4,
            rationale: {
              en: 'Specialist time better used for complex cases.',
              zh: '专科时间应留给更复杂的病例。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'No follow-up.', zh: '不安排随访。' },
            score: -4,
            rationale: {
              en: 'High readmission risk in frail seniors.',
              zh: '衰弱老人再入院风险高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
