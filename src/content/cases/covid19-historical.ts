import type { CaseDefinition } from '../../lib/types';

const MOH_COVID = {
  label: { en: 'MOH Singapore: COVID-19 Response', zh: '新加坡卫生部:新冠疫情应对' },
  body: {
    en: 'Public Health Preparedness Clinics, NCID lead, DORSCON Orange/Red, mass testing strategy, vaccine rollout.',
    zh: '公共卫生准备诊所(PHPC)、NCID主导、DORSCON橙/红、全民检测策略、疫苗接种。',
  },
};

const NCID_COVID = {
  label: { en: 'NCID COVID-19 Operations', zh: 'NCID新冠运营' },
  body: {
    en: 'NCID activated as the national isolation centre; cluster wards opened; HCW cohorting and rotation managed.',
    zh: 'NCID启动为全国隔离中心;开设感染聚集病房;医护分群与轮班管理。',
  },
};

const MOM_DORM = {
  label: { en: 'MOM / MOH Dormitory Outbreak Response', zh: '人力部 / 卫生部 客工宿舍疫情应对' },
  body: {
    en: 'Migrant-worker dormitory outbreaks 2020 — segregation, healthcare-on-site, vaccination drives.',
    zh: '2020年客工宿舍疫情 — 分区隔离、现场就医、疫苗接种行动。',
  },
};

const VAX_ROLLOUT = {
  label: { en: 'MOH Vaccination Rollout (2021)', zh: '卫生部疫苗接种推进(2021年)' },
  body: {
    en: 'mRNA-first nationwide rollout, vaccinated travel lanes, eldercare priority, paediatric subsequently.',
    zh: '以mRNA疫苗为先的全国接种、疫苗接种者旅行通道、长者优先、之后扩展到儿童。',
  },
};

export const covid19Case: CaseDefinition = {
  id: 'covid19-historical',
  title: {
    en: 'COVID-19 — multi-cluster surge (historical educational scenario)',
    zh: '新冠 COVID-19 — 多集群激增(历史教学情景)',
  },
  blurb: {
    en: 'Historical educational scenario. 2020-2022. SARS-CoV-2 multi-cluster surge in Singapore. Decisions span DORSCON escalation, NCID activation, dormitory outbreaks, ICU surge planning, and vaccine rollout — referenced to MOH and NCID public communications.',
    zh: '历史教学情景。2020-2022年。新加坡新冠多集群激增。决策涵盖DORSCON升级、NCID启动、客工宿舍疫情、ICU扩容、疫苗推进 — 依卫生部与NCID公开资料编写。',
  },
  category: 'acute',
  primaryFacility: 'ncid',
  involvedFacilities: ['ttsh', 'ncid', 'home', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  historical: true,
  citations: [
    'Ministry of Health Singapore. COVID-19 situational reports & press releases (2020-2022).',
    'NCID. Reflections from the COVID-19 frontline. NCID Annual Report 2020-2021.',
    'Ministry of Manpower / MOH. Joint statement on dormitory outbreak response, April 2020.',
    'Lai SHS et al. Lessons from Singapore: COVID-19 vaccine rollout and equity. The Lancet Regional Health, 2022.',
  ],
  guidelines: [MOH_COVID, NCID_COVID, MOM_DORM, VAX_ROLLOUT],
  pathway: [
    {
      id: 'first-import',
      department: 'screening',
      facility: 'ncid',
      durationMin: 30,
      framing: {
        patient: {
          en: '(Returning traveller, mild fever, runny nose. PCR positive.)',
          zh: '(回国旅客,轻度发烧、流鼻涕。PCR阳性。)',
        },
        caregiver: {
          en: 'You watch the news evolve hour by hour.',
          zh: '你看着新闻一小时一小时地更新。',
        },
        staff: {
          en: 'January 2020. First imported cases routed straight to NCID isolation. DORSCON Yellow.',
          zh: '2020年1月。首批输入病例直接送NCID隔离。DORSCON黄色。',
        },
      },
      decision: {
        id: 'dorscon-escalation',
        prompt: {
          en: 'Imported cases growing; first community transmission cluster identified at the church. DORSCON action?',
          zh: '输入病例增加;教会出现首个社区传播聚集。DORSCON该作何调整?',
        },
        weight: 1.5,
        reference: MOH_COVID,
        options: [
          {
            id: 'orange',
            label: {
              en: 'Escalate to DORSCON Orange: ED visitor restrictions, staff splits, temperature screening, suspend large gatherings.',
              zh: '升至DORSCON橙色:急诊探视限制、员工分组、体温筛查、暂停大型聚会。',
            },
            score: 10,
            rationale: {
              en: 'Matches what Singapore did in February 2020 once a transmission cluster was detected. Pre-emptive escalation buys time.',
              zh: '与2020年2月新加坡识别出传播聚集后所采取的做法一致。前瞻性升级可为后续应对争取时间。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'Schools begin home-based learning briefly.',
                zh: '学校短期内启动居家学习。',
              },
              staff: {
                en: 'Hospital visitor restrictions activated within hours.',
                zh: '医院探视限制数小时内启动。',
              },
            },
            effects: { pandemic: { dorsconShift: 1, surgeCapacityPctDelta: 25 } },
          },
          {
            id: 'stay-yellow',
            label: {
              en: 'Hold DORSCON Yellow; rely on NCID isolation alone.',
              zh: '维持DORSCON黄色;仅依靠NCID隔离。',
            },
            score: -6,
            rationale: {
              en: 'Misses the early-window opportunity to slow community transmission.',
              zh: '错过减缓社区传播的早期窗口。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['delayed-escalation'], pandemic: { ppeStockpilePctDelta: -15, surgeCapacityPctDelta: -10 } },
          },
        ],
      },
    },
    {
      id: 'pphc-and-gp',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 30,
      costSGD: 60,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4, sleepDebt: 4 },
      framing: {
        patient: { en: '(URTI symptoms. Worried.)', zh: '(上呼吸道感染症状。心里很担心。)' },
        caregiver: { en: '(Worried more.)', zh: '(担心得更厉害。)' },
        staff: {
          en: 'Public Health Preparedness Clinic (PHPC) — subsidised respiratory consult during the outbreak; PCR / ART arranged.',
          zh: '公共卫生准备诊所(PHPC)— 疫情期间的津贴呼吸科问诊;安排PCR / 抗原检测。',
        },
      },
      decision: {
        id: 'phpc-mobilisation',
        prompt: {
          en: 'Outpatient respiratory load is overwhelming polyclinics and EDs. What\'s the right system response?',
          zh: '门诊呼吸道负担把综合诊疗所和急诊都压垮了。系统该怎么应对?',
        },
        weight: 1.2,
        reference: MOH_COVID,
        options: [
          {
            id: 'phpc-network',
            label: {
              en: "Activate the Public Health Preparedness Clinic network: subsidised consults at GP chains and selected solo clinics; offload polyclinics; capture data into NEHR via PHPC e-claims.",
              zh: '启动公共卫生准备诊所(PHPC)网络:在家庭医生连锁及指定独立诊所提供津贴问诊;减轻综合诊疗所负担;通过PHPC电子报销系统将数据写入NEHR。',
            },
            score: 10,
            rationale: {
              en: 'PHPC was Singapore\'s answer to surge — geographically distributed primary-care capacity, integrated billing, and data flow.',
              zh: 'PHPC是新加坡应对激增的方法 — 在地理上分散的基层医疗产能、整合计费与数据流。',
            },
            outcome: {
              patient: {
                en: 'You see your local GP for $10.',
                zh: '你只花10新元就在住家附近的家庭医生处看诊。',
              },
              caregiver: {
                en: 'You don\'t need to queue at the polyclinic.',
                zh: '不必再到综合诊疗所排队。',
              },
              staff: {
                en: 'PHPC e-claim flows; data informs national modelling.',
                zh: 'PHPC电子报销顺畅运转;数据用于全国疫情建模。',
              },
            },
          },
          {
            id: 'centralise',
            label: {
              en: 'Centralise all respiratory care at NCID and the polyclinics.',
              zh: '把所有呼吸道病例集中到NCID和综合诊疗所。',
            },
            score: -4,
            rationale: {
              en: 'Bottlenecks form; community transmission worsens; people delay seeking care.',
              zh: '会形成瓶颈;加剧社区传播;患者延迟就医。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'dorm-outbreak',
      department: 'ward',
      facility: 'home',
      durationMin: 1440,
      framing: {
        patient: {
          en: '(Migrant worker, dormitory resident, fever and cough. Roommate also unwell.)',
          zh: '(客工,住宿舍,发烧合咳嗽。室友也不舒服。)',
        },
        caregiver: {
          en: '(Family overseas. Friends share information on phone group chats.)',
          zh: '(家人在国外。朋友在手机群里互通消息。)',
        },
        staff: {
          en: 'April 2020. Dormitory outbreak. Tens of thousands at risk in dense living conditions.',
          zh: '2020年4月。客工宿舍疫情。数万人处于密集居住环境的高风险中。',
        },
      },
      decision: {
        id: 'dorm-response',
        prompt: {
          en: 'Dormitory clusters expanding. Best joint MOH / MOM response?',
          zh: '宿舍聚集扩大。卫生部 / 人力部联合应对的最佳方案?',
        },
        weight: 1.5,
        reference: MOM_DORM,
        options: [
          {
            id: 'on-site-care',
            label: {
              en: "Stand up on-site clinics + isolation accommodation + active case-finding + segregation by floor; bring healthcare workers and meals to the dorms; vaccinate as supply arrives.",
              zh: '在现场设立诊所 + 隔离住所 + 主动病例搜寻 + 按楼层分区隔离;把医护和餐食送进宿舍;有疫苗就接种。',
            },
            score: 10,
            rationale: {
              en: 'What Singapore eventually did: on-site Migrant Worker Medical Centres, segregation, mass testing, vaccination. Hospital surge protected.',
              zh: '新加坡最终采取的做法:设立客工医疗中心、分区隔离、全员检测、接种疫苗。保住了医院的应急产能。',
            },
            outcome: {
              patient: {
                en: 'You receive care in your dorm; meals delivered.',
                zh: '你在宿舍里就诊;有餐食送来。',
              },
              caregiver: {
                en: 'Family overseas video-call you nightly.',
                zh: '海外的家人每晚和你视讯。',
              },
              staff: {
                en: 'Acute hospitals not overwhelmed by dorm referrals.',
                zh: '急性医院没有被宿舍转来的病例压垮。',
              },
            },
            effects: { pandemic: { surgeCapacityPctDelta: 30 } },
          },
          {
            id: 'hospitalise-all',
            label: {
              en: 'Transfer every dorm case to acute hospitals.',
              zh: '把每个宿舍病例都送到急性医院。',
            },
            score: -8,
            rationale: {
              en: 'Would have collapsed the hospital system. Community-based isolation was the right answer.',
              zh: '将会压垮整个医院系统。社区隔离才是正解。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Hospitals overwhelmed.', zh: '医院不堪重负。' },
            },
            effects: { setFlags: ['system-strain'], pandemic: { surgeCapacityPctDelta: -40, ppeStockpilePctDelta: -20 } },
          },
          {
            id: 'no-action',
            label: {
              en: 'No active intervention; rely on dorm operators.',
              zh: '不主动干预;交由宿舍运营商处理。',
            },
            score: -10,
            rationale: {
              en: 'Equity failure and public-health failure.',
              zh: '既是公平失败也是公共卫生失败。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['system-strain'], pandemic: { surgeCapacityPctDelta: -30, dorsconShift: 1 } },
          },
        ],
      },
    },
    {
      id: 'icu-surge',
      department: 'icu',
      facility: 'ttsh',
      durationMin: 7200,
      costSGD: 12000,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 40, financialWorry: 10, sleepDebt: 30 },
      framing: {
        patient: {
          en: '(Severe COVID-19, intubated, prone-positioned, dexamethasone, remdesivir.)',
          zh: '(重症新冠,已插管,俯卧位通气,地塞米松,瑞德西韦。)',
        },
        caregiver: {
          en: 'Briefings by phone; cluster of relatives also unwell; iPad for family video calls organised.',
          zh: '电话沟通病情;家族里有数人也病了;借iPad让家属视讯。',
        },
        staff: {
          en: 'ICU surge: TTSH stands up additional ICU beds with redeployed staff; cluster-wide triage protocol.',
          zh: 'ICU扩容:TTSH调派人手开设额外ICU床;全集群分诊方案。',
        },
      },
      decision: {
        id: 'icu-surge-strategy',
        prompt: {
          en: 'Surge model — what works best when ICU demand outstrips baseline capacity?',
          zh: '扩容模式 — 当ICU需求超出基线产能时,哪种做法最有效?',
        },
        weight: 1.2,
        reference: NCID_COVID,
        options: [
          {
            id: 'cluster-surge',
            label: {
              en: "Cluster-wide surge: NCID leads; flexed ICU beds at TTSH/SGH/NUH; pause elective surgery; redeploy anaesthetic + theatre staff to ICU; cohort wards.",
              zh: '集群层面扩容:NCID主导;TTSH/SGH/NUH扩展ICU床位;暂停择期手术;把麻醉与手术室人员调至ICU;病房分群。',
            },
            score: 10,
            rationale: {
              en: 'Multi-hospital cluster surge with flexible workforce was the operational model that held.',
              zh: '多医院集群扩容加灵活人力是真正撑住了的运营模式。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'ICU bed availability stretched but maintained; elective backlog grows but acute care holds.',
                zh: 'ICU床位紧张但守住;择期手术积压增加,但急性照护稳住。',
              },
            },
          },
          {
            id: 'no-elective-pause',
            label: {
              en: 'Continue elective surgery to maintain throughput.',
              zh: '继续择期手术以维持产能。',
            },
            score: -6,
            rationale: {
              en: 'Resource competition; elective patients displaced anyway.',
              zh: '资源竞争;择期患者最终还是被挤掉。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'vax-rollout',
      department: 'treatment-room',
      facility: 'gp-healthway',
      durationMin: 45,
      costSGD: 0,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: -4, sleepDebt: -4 },
      framing: {
        patient: {
          en: 'You queue at a vaccination centre. They give you a sticker.',
          zh: '你在疫苗接种中心排队。打完后他们给你一张贴纸。',
        },
        caregiver: {
          en: 'You text photos of stickers across the family chat.',
          zh: '你把贴纸的照片发到家族群里。',
        },
        staff: {
          en: 'mRNA rollout: eldercare → adults → adolescents → paeds, with ART self-tests distributed nationally.',
          zh: 'mRNA疫苗推进:长者 → 成人 → 青少年 → 儿童,同时全国分发抗原自测包。',
        },
      },
      decision: {
        id: 'vax-prioritisation',
        prompt: {
          en: 'Limited initial vaccine supply. Prioritisation strategy?',
          zh: '初期疫苗供应有限。优先策略?',
        },
        weight: 1.5,
        reference: VAX_ROLLOUT,
        options: [
          {
            id: 'elderly-hcw-first',
            label: {
              en: 'Healthcare workers first → community-care residents → 70+ → 60+ → step down by age + comorbidity. Public dashboards, multi-language outreach.',
              zh: '医护优先 → 社区照护院友 → 70岁以上 → 60岁以上 → 按年龄 + 合并症逐级开放。设公共数据看板,多语言宣导。',
            },
            score: 10,
            rationale: {
              en: 'Mortality benefit and system-protection benefit maximised; matches Singapore actual rollout.',
              zh: '死亡率获益与系统保护获益最大化;符合新加坡实际推进方式。',
            },
            outcome: {
              patient: {
                en: 'You get your first dose at month 6.',
                zh: '你在第6个月接种第一剂。',
              },
              caregiver: {
                en: 'Older relatives vaccinated weeks earlier.',
                zh: '长辈早几周就打了疫苗。',
              },
              staff: {
                en: 'Coverage reaches >90% adults by 2H 2021.',
                zh: '2021年下半年成人接种率超过90%。',
              },
            },
          },
          {
            id: 'first-come-first-served',
            label: {
              en: 'First-come-first-served regardless of risk.',
              zh: '不分风险,先到先打。',
            },
            score: -6,
            rationale: {
              en: 'Younger lower-risk cohorts tend to capture early supply; mortality benefit lost.',
              zh: '更年轻、低风险的人群更会抢到早期供应;丧失死亡率获益。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'endemic-transition',
      department: 'discharge',
      facility: 'ncid',
      durationMin: 60,
      framing: {
        patient: {
          en: 'You return to work. Masks slowly become optional.',
          zh: '你回到工作岗位。口罩慢慢从强制变为自愿。',
        },
        caregiver: { en: 'Family overseas visit again.', zh: '海外的家人又能回来探亲了。' },
        staff: {
          en: 'October 2022 onwards: endemic transition; DORSCON drops to Yellow then Green; long-COVID clinic stands up at NCID and NUH.',
          zh: '2022年10月起:转入地方性流行阶段;DORSCON降至黄色再降至绿色;NCID与NUH设立长新冠门诊。',
        },
      },
      decision: {
        id: 'endemic-transition-plan',
        prompt: {
          en: 'Transition to endemic phase. Best long-term plan?',
          zh: '过渡到地方性流行阶段。长期方案?',
        },
        weight: 1,
        reference: MOH_COVID,
        options: [
          {
            id: 'right-site-and-surveillance',
            label: {
              en: 'Right-site stable patients to GP / polyclinic; maintain genomic surveillance; long-COVID clinics; standing dormitory + eldercare-facility outbreak protocols; vaccine boosters by risk group.',
              zh: '稳定患者按分级就诊原则转回家庭医生 / 综合诊疗所;维持基因组监测;长新冠门诊;常备宿舍 + 长者照护设施疫情方案;按风险分组追加疫苗加强剂。',
            },
            score: 10,
            rationale: {
              en: 'Sustainable — preserves capacity and embeds preparedness.',
              zh: '可持续 — 既保留产能又把准备工作制度化。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'forget-everything',
            label: {
              en: 'Stand down all surge protocols; assume the next outbreak is far away.',
              zh: '解散所有扩容方案;假设下次疫情还很遥远。',
            },
            score: -6,
            rationale: {
              en: 'The lesson of SARS was the lesson of COVID. Don\'t forget twice.',
              zh: 'SARS的教训正是新冠的教训。别再忘记一次。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
