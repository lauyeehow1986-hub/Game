import type { CaseDefinition } from '../../lib/types';

const ACP = {
  label: { en: 'AIC Advance Care Planning (Singapore)', zh: '医疗关怀机构(AIC)预先护理规划' },
  body: {
    en: 'Agency for Integrated Care framework for advance care planning conversations.',
    zh: '医疗关怀机构对预先护理规划(ACP)对话的指导框架。',
  },
};

const SPC = {
  label: { en: 'Singapore Palliative Care CPG', zh: '新加坡舒缓医疗临床实践指南' },
  body: {
    en: 'Local clinical practice guidance on adult palliative symptom control and end-of-life pathways.',
    zh: '本地对成人舒缓医疗症状控制及临终照护路径的临床实践指引。',
  },
};

const HOME_HOSPICE = {
  label: { en: 'HCA / SHC Home Hospice Standards', zh: 'HCA / SHC 居家临终关怀服务标准' },
  body: {
    en: 'Home hospice service standards including 24/7 telephone support, anticipatory medication boxes, and bereavement follow-up.',
    zh: '居家临终关怀服务标准 — 包含全天候电话支持、预备药物包,以及丧亲随访。',
  },
};

export const palliativeEndOfLife: CaseDefinition = {
  id: 'palliative-eol',
  title: {
    en: 'Advanced metastatic lung cancer — end-of-life pathway',
    zh: '晚期转移性肺癌 — 临终关怀路径',
  },
  blurb: {
    en: 'Mr Tan, 67. Stage IV NSCLC, on 3rd-line therapy, increasing dyspnoea and cachexia. Brought to TTSH ED at 2am with severe breathlessness. Wife and son frightened.',
    zh: '陈先生,67岁。第四期非小细胞肺癌(NSCLC),目前接受第三线治疗;气促加重,体重持续下降。凌晨2点因严重呼吸困难送至TTSH急诊。太太与儿子非常惊慌。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'amkh', 'hca', 'home'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [ACP, SPC, HOME_HOSPICE],
  pathway: [
    {
      id: 'ed-arrival',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 320,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 8, sleepDebt: 14 },
      framing: {
        patient: {
          en: '(Sitting forward, mouth open, knuckles white on the sides of the trolley.)',
          zh: '(身体前倾、张口呼吸、紧握床沿的指节发白。)',
        },
        caregiver: {
          en: 'You wonder if this is it. Your son cries silently in the corner.',
          zh: '你怀疑这是不是终点。儿子在角落默默地哭。',
        },
        staff: {
          en: 'Stage IV NSCLC, KPS 50, on osimertinib. SpO2 89% on RA → 94% on 2L. Mild fluid in pleural effusion on lung US.',
          zh: '第四期非小细胞肺癌,KPS评分50,服用奥希替尼。空气下SpO2 89% → 2L氧下94%。肺部超声示少量胸腔积液。',
        },
      },
      decision: {
        id: 'aim-of-care',
        prompt: {
          en: "ACP on file: 'no escalation to ICU; comfort-focused, prefers home or hospice'. NEHR-stored. What do you do?",
          zh: '档案中有预先护理规划(ACP):"不升级至ICU;以舒适为先,优先在家或临终关怀机构"。已存NEHR。你怎么做?',
        },
        weight: 1.5,
        reference: ACP,
        options: [
          {
            id: 'comfort-care',
            label: {
              en: "Honour the ACP. Symptom-focused care: low-flow O2, opioid for dyspnoea, anxiolytic. Engage palliative team and AIC for hospice / home transition.",
              zh: '尊重ACP。以症状为重的照护:低流量给氧、用阿片类缓解气促、抗焦虑药。请舒缓医疗团队,并联系AIC安排居家或临终关怀机构。',
            },
            score: 10,
            rationale: {
              en: 'Following a documented ACP is the central principle. Comfort-focused care reduces ICU days at end of life and improves caregiver bereavement outcomes.',
              zh: '遵守已写定的ACP是核心原则。舒适为重的照护可减少临终前的ICU住院日,并改善家属丧亲后的健康结局。',
            },
            outcome: {
              patient: {
                en: '(A small dose of morphine; eyes soften within 20 minutes.)',
                zh: '(小剂量吗啡;20分钟内眼神变得平和。)',
              },
              caregiver: { en: 'You exhale for the first time in two hours.', zh: '你两个小时以来第一次松一口气。' },
              staff: {
                en: 'Pall care team paged; AIC notified for community-hospital or hospice routing.',
                zh: '已呼叫舒缓医疗团队;已通知AIC安排社区医院或临终关怀机构。',
              },
            },
          },
          {
            id: 'full-escalation',
            label: {
              en: 'Intubate, central line, ICU admission for full life-prolonging care.',
              zh: '插管、置中心静脉、收入ICU进行最大限度延命治疗。',
            },
            score: -10,
            rationale: {
              en: 'Directly contradicts a clear ACP. Causes harm and prolongs suffering; legal and ethical breach.',
              zh: '直接违反明确的ACP。造成伤害并延长痛苦;构成法律和伦理违规。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Family devastated.', zh: '家属心碎。' },
              staff: { en: 'Critical incident; legal review.', zh: '严重不良事件;启动法律审查。' },
            },
          },
          {
            id: 'discharge-home',
            label: {
              en: 'Reassure and discharge home with a GP follow-up letter.',
              zh: '安抚后让其回家,附一封家庭医生跟进信。',
            },
            score: -6,
            rationale: {
              en: 'Severely symptomatic; no plan for symptom control or anticipatory care; high risk of re-attendance and crisis death at home.',
              zh: '症状严重;缺乏症状控制与预备方案;再就诊及在家危机性死亡风险高。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Re-presents within 12h in distress.', zh: '12小时内带着痛苦再次就诊。' },
            },
          },
        ],
      },
    },
    {
      id: 'ttsh-symptom-control',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 2880,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 8, sleepDebt: -4 },
      framing: {
        patient: {
          en: '(Quieter today. Eats half a bowl of porridge. Asks his wife about the cat.)',
          zh: '(今天比较安静。吃了半碗粥。问太太家里的猫怎么样了。)',
        },
        caregiver: {
          en: 'You sleep on the recliner beside him. The nurse brings you a blanket.',
          zh: '你睡在他床边的躺椅上。护士拿了一条毛毯给你。',
        },
        staff: {
          en: 'Pall care team review: subcut PRN morphine + midazolam; bowel care; spiritual care request received.',
          zh: '舒缓医疗团队查房:必要时皮下吗啡 + 咪达唑仑;肠道护理;已收到灵性关怀的请求。',
        },
      },
      decision: {
        id: 'place-of-care',
        prompt: {
          en: 'Symptoms now controlled on subcut PRN. Patient and family prefer home if possible; some hesitation about caregiver capacity.',
          zh: '症状已经透过皮下PRN药物控制。患者与家属若可行,优先回家;但对照护能力有所顾虑。',
        },
        weight: 1.5,
        reference: HOME_HOSPICE,
        options: [
          {
            id: 'home-hospice',
            label: {
              en: 'Discharge home with HCA Home Hospice; anticipatory medication box + 24/7 phone line; respite admission booked at AMKH if needed.',
              zh: '由HCA居家临终关怀团队接手出院回家;配备预备药物包 + 全天候电话支持;必要时安排AMKH(宏茂桥宫医院)喘息住院。',
            },
            score: 10,
            rationale: {
              en: 'Home hospice with structured 24/7 support and a respite plan respects preferences while protecting against caregiver burnout.',
              zh: '具结构化全天候支持及喘息方案的居家临终关怀,既尊重患者意愿,也保护家属免于耗竭。',
            },
            outcome: {
              patient: {
                en: '(Home. The window of his bedroom faces east; he watches the morning light.)',
                zh: '(回到家中。他的卧室窗向东;他望着晨光。)',
              },
              caregiver: {
                en: 'A home-hospice nurse visits in 18 hours and teaches you the syringe driver.',
                zh: '居家临终关怀护士18小时内上门,教你使用注射器输药泵。',
              },
              staff: {
                en: 'HCA enrolment activated; AMKH respite slot held; NEHR updated.',
                zh: 'HCA登记启动;AMKH喘息床位预留;NEHR记录已更新。',
              },
            },
          },
          {
            id: 'inpatient-hospice',
            label: { en: 'Direct transfer to Dover Park Hospice.', zh: '直接转至Dover Park Hospice(多佛公园临终关怀院)。' },
            score: 8,
            rationale: {
              en: 'Reasonable if home is not feasible. Inpatient hospice provides excellent symptom control but loses preference for home.',
              zh: '若回家不可行属合理选择。住院临终关怀机构提供优秀的症状控制,但偏离了回家的意愿。',
            },
            outcome: {
              patient: { en: '(A new room. Quiet.)', zh: '(一间新房,很安静。)' },
              caregiver: { en: 'You visit daily; you sleep at home.', zh: '你每天去探望;晚上回家睡觉。' },
              staff: { en: 'DPH admits; care plan handed over.', zh: 'DPH(Dover Park Hospice)收治;照护计划已交接。' },
            },
          },
          {
            id: 'community-hospital',
            label: {
              en: 'Transfer to AMKH (community hospital) for ongoing palliative care without home plan.',
              zh: '转至AMKH(宏茂桥宫社区医院)继续舒缓医疗,不规划回家。',
            },
            score: 6,
            rationale: {
              en: "Acceptable — VWO community hospitals provide palliative beds. Doesn't actualise the home preference but ensures expert symptom control.",
              zh: 'VWO社区医院提供舒缓床位;选项合理。未实现回家的意愿,但能确保专业症状控制。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'You worry about going home.', zh: '你担心回家。' },
              staff: { en: 'AMKH bed booked.', zh: 'AMKH床位已预订。' },
            },
          },
          {
            id: 'wait-and-see',
            label: {
              en: 'Continue inpatient management at TTSH indefinitely.',
              zh: '在TTSH持续住院观察,不设期限。',
            },
            score: 2,
            rationale: {
              en: 'Acute hospital not the right environment for prolonged EOL care; high cost, lower quality of life.',
              zh: '急性医院并非长期临终照护的适当场所;费用高、生活质量降低。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Family stressed by hospital noise.', zh: '家属被医院的喧闹折腾。' },
              staff: { en: 'Bed-day cost mounts.', zh: '住院日费用不断累积。' },
            },
          },
        ],
      },
    },
    {
      id: 'home-hospice-period',
      department: 'ward',
      facility: 'home',
      durationMin: 14400, // ~10 days
      costSGD: 320,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 60, financialWorry: 6, sleepDebt: 22 },
      framing: {
        patient: {
          en: '(In his own bed. The cat sleeps by his feet most afternoons.)',
          zh: '(睡在自己的床上。下午,大多数时间猫都躺在他脚边。)',
        },
        caregiver: {
          en: 'You set up a routine. The hospice nurse calls each morning and visits twice a week. You get used to the syringe driver.',
          zh: '你养成了一套日常。居家临终关怀护士每天早上来电,每周上门两次。你也慢慢适应了注射器输药泵。',
        },
        staff: {
          en: 'HCA visits 3x/week; symptoms stable on subcut driver; family supported with bereavement counsellor introduction.',
          zh: 'HCA每周上门3次;皮下输药泵下症状稳定;为家属介绍丧亲辅导员。',
        },
      },
    },
    {
      id: 'final-days',
      department: 'ward',
      facility: 'home',
      durationMin: 4320,
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 0, sleepDebt: 12 },
      framing: {
        patient: {
          en: '(Mostly sleeping; brief moments of recognition; squeezes his wife\'s hand at the right moments.)',
          zh: '(大部分时间在睡;偶有短暂清醒;该握太太手时会回握。)',
        },
        caregiver: {
          en: 'You play his favourite Teresa Teng songs softly. Your son flies back from KL.',
          zh: '你轻轻放着他最爱的邓丽君的歌。儿子从吉隆坡飞回来。',
        },
        staff: {
          en: 'HCA on-call; anticipatory medications given at appropriate times; family briefed on changes to expect.',
          zh: 'HCA随时待命;在适当时机使用预备药物;已向家属说明接下来会出现的变化。',
        },
      },
      decision: {
        id: 'crisis-call',
        prompt: {
          en: "At 3am the patient becomes restless and tachypnoeic. Family panics and considers calling 995. What's the home-hospice plan?",
          zh: '凌晨3点,患者烦躁不安、呼吸急促。家属慌张到考虑拨打995。居家临终关怀的处理方案?',
        },
        weight: 1.2,
        reference: HOME_HOSPICE,
        options: [
          {
            id: 'phone-line',
            label: {
              en: 'Use the 24/7 home-hospice phone line; on-call team advises subcut midazolam from the anticipatory box; nurse visits within an hour.',
              zh: '拨打居家临终关怀全天候电话;值班团队指导从预备药物包取出咪达唑仑皮下给药;护士一小时内上门。',
            },
            score: 10,
            rationale: {
              en: 'Anticipatory medications + 24/7 support are designed exactly for this moment. Avoids unwanted ambulance transfer to ED at end of life.',
              zh: '预备药物包加全天候支持正是为这一刻设计。避免临终时被救护车送往急诊。',
            },
            outcome: {
              patient: {
                en: '(Settles within 15 minutes; breathing softens.)',
                zh: '(15分钟内平静下来;呼吸柔和。)',
              },
              caregiver: {
                en: 'You both cry, but quietly, holding his hands.',
                zh: '两人都哭了,但很安静地握着他的手。',
              },
              staff: {
                en: 'Nurse arrives at 4am; vigil supported.',
                zh: '护士凌晨4点抵达;陪伴守候。',
              },
            },
          },
          {
            id: 'call-995',
            label: { en: '995 to TTSH ED.', zh: '打995送TTSH急诊。' },
            score: -3,
            rationale: {
              en: 'Avoidable ambulance ride and ED attendance at the very end of life; contradicts the plan and patient\'s wishes.',
              zh: '临终时本可避免的救护车与急诊就诊;违背已订方案及患者意愿。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'Stress of strangers and bright lights.',
                zh: '陌生面孔与刺眼灯光带来的压力。',
              },
              staff: {
                en: 'ED palliative review and return home, but trauma incurred.',
                zh: '急诊舒缓医疗会诊后送回家,但创伤已造成。',
              },
            },
          },
          {
            id: 'no-action',
            label: { en: 'Do nothing; hope it passes.', zh: '什么都不做,希望熬过去。' },
            score: -2,
            rationale: {
              en: 'Symptom control needed; family distress not addressed.',
              zh: '症状需要控制;家属的焦虑也未被处理。',
            },
            outcome: {
              patient: { en: '(Distressed for hours.)', zh: '(痛苦了好几个小时。)' },
              caregiver: { en: 'Traumatic memory.', zh: '留下创伤性记忆。' },
              staff: { en: 'Quality of dying compromised.', zh: '善终的品质受损。' },
            },
          },
        ],
      },
    },
    {
      id: 'after-death',
      department: 'discharge',
      facility: 'home',
      durationMin: 60,
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: -4, sleepDebt: -10 },
      framing: {
        patient: {
          en: '(Peaceful at home with his wife and son holding his hands.)',
          zh: '(安详地在家中离世,太太和儿子握着他的手。)',
        },
        caregiver: {
          en: 'You sit for an hour before calling anyone. The morning is quiet.',
          zh: '你坐了一个小时才开始打电话。清晨非常宁静。',
        },
        staff: {
          en: 'Home-hospice nurse confirms death; certifies via teleconsult per protocol; bereavement support kicks in.',
          zh: '居家临终关怀护士确认死亡;依规程透过远程会诊开具死亡证明;丧亲支持随即启动。',
        },
      },
      decision: {
        id: 'bereavement',
        prompt: {
          en: "What's the post-death plan for the family?",
          zh: '家属在患者过世后的支持方案?',
        },
        weight: 1,
        reference: ACP,
        options: [
          {
            id: 'structured-bereavement',
            label: {
              en: 'Structured bereavement: HCA bereavement counsellor at week 2, week 6, month 6; GP follow-up for the spouse.',
              zh: '结构化丧亲随访:HCA丧亲辅导员第2周、第6周、第6个月分别介入;并安排家庭医生随访配偶。',
            },
            score: 10,
            rationale: {
              en: 'Bereavement is a recognised health outcome. Spouses of cancer decedents have higher mortality / morbidity in the year after; structured support reduces this.',
              zh: '丧亲本身是公认的健康结局。癌症亡者的配偶在随后一年内死亡率/罹病率较高;结构化支持可降低此风险。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You are not alone afterwards. You see your GP about your sleep.',
                zh: '之后你不再孤单。你也去看了家庭医生处理失眠问题。',
              },
              staff: {
                en: 'Bereavement schedule activated; spouse risk-flagged on NEHR.',
                zh: '丧亲随访已启动;配偶在NEHR上被标记为高风险。',
              },
            },
          },
          {
            id: 'ad-hoc',
            label: {
              en: 'Hand over to family; ad-hoc support if requested.',
              zh: '交由家属自行处理;有要求才提供支持。',
            },
            score: 5,
            rationale: {
              en: "Acceptable but doesn't capture spouses who silently struggle.",
              zh: '可接受,但漏掉那些默默挣扎的配偶。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You manage; sometimes you don\'t.',
                zh: '你勉强应付着;有时撑不下去。',
              },
              staff: { en: 'No flag.', zh: '未做标记。' },
            },
          },
          {
            id: 'no-followup',
            label: { en: 'No bereavement follow-up.', zh: '不安排任何丧亲随访。' },
            score: -3,
            rationale: {
              en: 'Misses preventable spouse morbidity.',
              zh: '错过本可预防的配偶身心健康问题。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'You isolate.', zh: '你陷入孤立。' },
              staff: {
                en: 'Spouse re-presents 6 months later with depression.',
                zh: '配偶6个月后因抑郁就诊。',
              },
            },
          },
        ],
      },
    },
  ],
};
