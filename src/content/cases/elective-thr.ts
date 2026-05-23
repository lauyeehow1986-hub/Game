import type { CaseDefinition } from '../../lib/types';

const NICE_OA = {
  label: { en: 'NICE NG226 (2022) — OA management', zh: 'NICE NG226(2022)— 骨关节炎管理' },
  body: {
    en: 'NICE guideline on osteoarthritis: care and management.',
    zh: 'NICE对骨关节炎照护与管理的指南。',
  },
};

const MOH_VTE = {
  label: { en: 'MOH CPG VTE Prophylaxis (2018)', zh: '卫生部静脉血栓栓塞预防临床指南(2018)' },
  body: {
    en: 'Singapore Ministry of Health guidance on venous thromboembolism prophylaxis.',
    zh: '新加坡卫生部对静脉血栓栓塞(VTE)预防的指引。',
  },
};

const ERAS = {
  label: { en: 'ERAS Society Hip Replacement (2020)', zh: 'ERAS学会髋关节置换共识(2020)' },
  body: {
    en: 'Enhanced Recovery After Surgery consensus for total hip arthroplasty.',
    zh: '术后快速康复(ERAS)对全髋关节置换术的共识。',
  },
};

const AGEING_PLAN = {
  label: { en: 'AIC Step-down Pathways', zh: 'AIC分级转介(step-down)路径' },
  body: {
    en: 'Agency for Integrated Care framework for sub-acute / community hospital transfers.',
    zh: '医疗关怀机构(AIC)对亚急性 / 社区医院转介的整体框架。',
  },
};

export const electiveTHR: CaseDefinition = {
  id: 'elective-thr',
  title: {
    en: 'Elective Total Hip Replacement — 71 y/o female, severe right hip OA',
    zh: '择期全髋关节置换 — 71岁女性,右髋重度骨关节炎',
  },
  blurb: {
    en: 'Mdm Lim, 71, retired. Right hip OA failed conservative management. Listed for elective right THR at TTSH. Lives with her daughter.',
    zh: '林女士,71岁,退休。右髋骨关节炎保守治疗失败。已排入TTSH择期右侧全髋关节置换(THR)。与女儿同住。',
  },
  category: 'elective',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [NICE_OA, MOH_VTE, ERAS, AGEING_PLAN],
  pathway: [
    {
      id: 'preadmission',
      department: 'soc',
      durationMin: 90,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6 },
      framing: {
        patient: {
          en: 'You sit through ECG, bloods, and a long counselling session. The orthopaedic nurse is patient. You sign the consent form, hand still trembling.',
          zh: '你完成了心电图、抽血,以及一场冗长的术前讲解。骨科护士很有耐心。手还在抖,你还是签了同意书。',
        },
        caregiver: {
          en: 'You took a half-day to drive Mum here. The nurse hands you a checklist of things to bring on admission day.',
          zh: '你请了半天假载妈妈过来。护士给你一张入院当日必带物品清单。',
        },
        staff: {
          en: 'Pre-admission clinic: ECG normal, Hb 12.4, eGFR 78, MRSA swab sent. Anaesthetist clears her — ASA 2.',
          zh: '术前评估门诊:心电图正常,血红蛋白12.4,eGFR 78,已送MRSA拭子。麻醉科评估通过 — ASA 2级。',
        },
      },
      decision: {
        id: 'preop-medication-rec',
        prompt: {
          en: 'She is on aspirin 100 mg OD (primary prevention only) and bisoprolol for HTN. What do you advise pre-operatively?',
          zh: '她服用阿司匹林100 mg每日一次(仅作一级预防)以及比索洛尔控制高血压。术前建议?',
        },
        weight: 1,
        reference: ERAS,
        options: [
          {
            id: 'stop-asa-cont-bb',
            label: {
              en: 'Stop aspirin 7 days pre-op (primary prevention only); continue bisoprolol with morning sip of water.',
              zh: '术前7天停阿司匹林(因仅是一级预防);比索洛尔继续服用,当天清晨用少量水吞服。',
            },
            score: 10,
            rationale: {
              en: 'For primary-prevention aspirin without CV indication, stopping pre-op reduces bleeding without ischaemic harm. Continuing beta-blocker peri-op is class I in cardiac patients.',
              zh: '无心血管适应症、仅作一级预防的阿司匹林,术前停药可减少出血而无缺血危害。围术期继续β受体阻滞剂对心血管患者属I级推荐。',
            },
            outcome: {
              patient: {
                en: 'You write down the new instructions and tape them to the kitchen wall.',
                zh: '你把新嘱托写下来,贴在厨房墙上。',
              },
              caregiver: {
                en: 'Helps Mum mark the calendar with the stop date.',
                zh: '帮妈妈在日历上圈出停药日期。',
              },
              staff: { en: 'Anaesthetist agrees, plan documented.', zh: '麻醉科同意,方案已记录。' },
            },
          },
          {
            id: 'continue-asa',
            label: {
              en: 'Continue aspirin and bisoprolol up to surgery.',
              zh: '阿司匹林与比索洛尔均持续服用至手术当日。',
            },
            score: 4,
            rationale: {
              en: 'Acceptable in many centres for low-bleeding-risk surgery, but THR has higher transfusion risk. Defensible but suboptimal.',
              zh: '对低出血风险手术许多中心可接受,但THR输血风险较高。说得通,但并非最佳。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Surgeon prefers to stop ASA in primary prevention; flagged on round.',
                zh: '外科医生倾向一级预防时停阿司匹林;查房时被提醒。',
              },
            },
          },
          {
            id: 'stop-bb',
            label: {
              en: 'Stop both aspirin and bisoprolol on the morning of surgery.',
              zh: '手术当日早上把阿司匹林与比索洛尔一起停掉。',
            },
            score: -4,
            rationale: {
              en: 'Stopping beta-blockers abruptly raises peri-op cardiac event risk (POISE).',
              zh: '突然停用β受体阻滞剂会增加围术期心血管事件风险(POISE研究)。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Anaesthesia rejects plan.', zh: '麻醉科否决该方案。' },
            },
          },
        ],
      },
    },
    {
      id: 'admission',
      department: 'entrance',
      durationMin: 30,
      framing: {
        patient: {
          en: 'You arrive before 7am. The reception lady recognises you from last week.',
          zh: '你七点前就到。前台阿姨记得你上周来过。',
        },
        caregiver: {
          en: 'You hold the bag with her toiletries. The lift takes a long time.',
          zh: '你提着装有妈妈洗漱用品的袋子。电梯等了好一会儿。',
        },
        staff: {
          en: 'Patient registered, NEHR pulled, anaesthetic chart ready.',
          zh: '患者已登记,NEHR记录已调阅,麻醉单已备好。',
        },
      },
    },
    {
      id: 'ward-preop',
      department: 'ward',
      durationMin: 60,
      costSGD: 220,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'A nurse marks an arrow on your right thigh with a permanent marker.',
          zh: '护士用油性笔在你右大腿上画了一个箭头。',
        },
        caregiver: {
          en: 'They ask you to wait downstairs at the family lounge once she goes in.',
          zh: '医护让你在妈妈进去后,到楼下家属休息区等候。',
        },
        staff: {
          en: 'WHO surgical safety checklist done, antibiotics charted, group-and-cross-match available.',
          zh: '已完成世卫组织手术安全核查,预防性抗生素已开,血型与交叉配血结果可用。',
        },
      },
      decision: {
        id: 'subsidy-class',
        prompt: {
          en: 'Mdm Lim is a Merdeka Generation citizen, per-capita household income S$950/mo, no IP rider. The MSW asks about ward class.',
          zh: '林女士属立国一代公民,家庭人均月收入S$950,无综合健保附加险(IP)。医务社工询问病房等级。',
        },
        weight: 1,
        reference: AGEING_PLAN,
        options: [
          {
            id: 'class-c',
            label: {
              en: 'Class C (highest subsidy ~85% with PG/MG top-up).',
              zh: 'C级病房(津贴最高,约85%,加上立国/建国一代额外津贴)。',
            },
            score: 10,
            rationale: {
              en: 'Means-test plus Merdeka Generation top-up gives the highest subsidy. Same surgeon, same prosthesis, same outcomes.',
              zh: '家庭收入审查加立国一代津贴叠加后津贴最高。同一位外科医生、同款假体、同等临床结果。',
            },
            outcome: {
              patient: {
                en: 'A 6-bedder cubicle. The auntie next bed offers you biscuits.',
                zh: '六人间病房。隔壁床的阿姨递来饼干给你吃。',
              },
              caregiver: {
                en: 'You sigh — the bill estimate is manageable.',
                zh: '你叹了口气 — 估算的账单负担得起。',
              },
              staff: {
                en: 'MSW pleased; bill estimate ~S$2,200 patient share.',
                zh: '医务社工满意;估算患者自付约S$2,200。',
              },
            },
            effects: { wardClass: 'C' },
          },
          {
            id: 'class-b2',
            label: { en: 'Class B2 (substantial subsidy ~65%).', zh: 'B2级病房(可观津贴,约65%)。' },
            score: 7,
            rationale: {
              en: 'Reasonable for a 4-bedder; still subsidised. Higher OOP than Class C without clinical benefit.',
              zh: '四人间合理选择;仍有津贴。但自付高于C级,且无临床获益。',
            },
            outcome: {
              patient: { en: 'A 4-bedder, slightly more privacy.', zh: '四人间,稍多一点私密性。' },
              caregiver: { en: 'You squint at the bill estimate but it works.', zh: '看了账单估算虽紧但还能撑。' },
              staff: { en: 'MSW notes Class C would have been cheaper.', zh: '医务社工指出C级会更省。' },
            },
            effects: { wardClass: 'B2' },
          },
          {
            id: 'class-b1',
            label: { en: 'Class B1 (modest subsidy ~20%).', zh: 'B1级病房(津贴较少,约20%)。' },
            score: 3,
            rationale: {
              en: 'No clinical benefit, significantly higher OOP. Often chosen for amenity reasons only.',
              zh: '无临床获益,自付显著更高。通常仅出于环境/舒适考虑而选。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Family willing; MSW counsels on cost.', zh: '家属愿意;医务社工就费用进行辅导。' },
            },
            effects: { wardClass: 'B1', caregiverBurden: { financialWorry: 12 } },
          },
          {
            id: 'class-a',
            label: { en: 'Class A (no subsidy, single room).', zh: 'A级病房(无津贴,单人间)。' },
            score: -3,
            rationale: {
              en: 'Punishing for a low-income MG senior with no IP rider. Avoidable financial toxicity.',
              zh: '对一位低收入、无IP附加险的立国一代长者来说太重;可避免的经济伤害。',
            },
            outcome: {
              patient: {
                en: 'A single room, but the bill at discharge is shocking.',
                zh: '单人间,但出院时账单令人震惊。',
              },
              caregiver: {
                en: 'You consider Medifund application.',
                zh: '你考虑申请保健基金(Medifund)。',
              },
              staff: { en: 'MSW unhappy.', zh: '医务社工不悦。' },
            },
            effects: { wardClass: 'A', setFlags: ['financial-distress'], caregiverBurden: { financialWorry: 28 } },
          },
        ],
      },
    },
    {
      id: 'ot',
      department: 'ot',
      durationMin: 110,
      costSGD: 6800,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 16, sleepDebt: 12 },
      framing: {
        patient: {
          en: 'A bright light. Someone says count backwards from ten. You don\'t make it past seven.',
          zh: '一道刺眼的灯。有人让你从十倒数。你只数到七就睡着了。',
        },
        caregiver: {
          en: 'You wait in the family lounge with your phone on silent. A volunteer offers tea.',
          zh: '你在家属休息区静音等候。一位志愿者端来热茶。',
        },
        staff: {
          en: 'Spinal + light sedation. Posterior approach right THR, cementless cup, ceramic-on-PE bearing.',
          zh: '脊髓麻醉 + 轻度镇静。后侧入路右侧THR,非骨水泥髋臼杯,陶瓷-聚乙烯关节面。',
        },
      },
      decision: {
        id: 'vte-prophylaxis',
        prompt: {
          en: 'Surgery uneventful, EBL 350 mL. What VTE prophylaxis do you start post-op?',
          zh: '手术顺利,估计失血量350 mL。术后VTE预防方案?',
        },
        weight: 1,
        reference: MOH_VTE,
        options: [
          {
            id: 'lmwh',
            label: {
              en: 'Mechanical (calf pumps) + LMWH (enoxaparin 40 mg SC OD) for 28–35 days.',
              zh: '机械预防(小腿气压泵) + 低分子量肝素(依诺肝素40 mg皮下每日一次),共28–35天。',
            },
            score: 10,
            rationale: {
              en: 'Standard of care for THR. Extended chemoprophylaxis beats in-hospital-only regimens; mechanical adds incremental benefit.',
              zh: 'THR的标准照护。延长疗程的药物预防优于仅住院期间用药;机械方法进一步增益。',
            },
            outcome: {
              patient: {
                en: 'A small jab on the abdomen each evening. You learn to do it yourself by day 3.',
                zh: '每晚在腹部打一针。到了第3天你自己就学会打了。',
              },
              caregiver: {
                en: 'You help with the injection at home for the first week.',
                zh: '回家后第一周你协助打针。',
              },
              staff: {
                en: 'Plan charted; pharmacy delivers home LMWH supply.',
                zh: '方案已开立;药房安排居家低分子量肝素配送。',
              },
            },
          },
          {
            id: 'asa-only',
            label: {
              en: 'Aspirin 100 mg OD + mechanical only.',
              zh: '仅阿司匹林100 mg每日一次 + 机械预防。',
            },
            score: 5,
            rationale: {
              en: 'Increasingly accepted for low-risk THR (PEPPER trial). Acceptable but less common locally for high-risk profiles; this patient is 71.',
              zh: '对低风险THR日益被接受(PEPPER研究)。对高风险患者本地较少使用;这位患者71岁。',
            },
            outcome: {
              patient: { en: 'Just one tablet a day.', zh: '每天只吃一片药。' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Surgeon accepts in selected patients; this patient borderline.',
                zh: '外科医生在选择性患者中可接受;此例处于边缘范围。',
              },
            },
          },
          {
            id: 'mechanical-only',
            label: { en: 'Mechanical (calf pumps) only.', zh: '仅机械预防(小腿气压泵)。' },
            score: -3,
            rationale: {
              en: 'Inadequate for THR; misses chemoprophylaxis benefit, raises symptomatic VTE rate.',
              zh: '对THR防护不足;错过药物预防的获益,症状性VTE发生率上升。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Consultant queries the omission.', zh: '主治医师质询为何遗漏。' },
            },
          },
        ],
      },
    },
    {
      id: 'ward-postop',
      department: 'ward',
      durationMin: 4320, // 3 days
      costSGD: 1400,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 18, financialWorry: 10, sleepDebt: 14 },
      framing: {
        patient: {
          en: 'Day 2: you stand for the first time. The physio holds your elbow. Tears, but you walk three steps.',
          zh: '第二天:第一次站起来。物理治疗师扶着你的手肘。你哭了,但走了三步。',
        },
        caregiver: {
          en: 'You bring her favourite porridge from home. She finishes half and smiles for the first time in days.',
          zh: '你从家里带来妈妈最爱的粥。她吃了一半,几天来第一次露出笑容。',
        },
        staff: {
          en: 'POD2 — mobilised with frame, Hb 9.2 (no transfusion needed), wound clean.',
          zh: '术后第2天 — 用助行架活动,血红蛋白9.2(无需输血),伤口清洁。',
        },
      },
      decision: {
        id: 'discharge-destination',
        prompt: {
          en: 'POD3, mobilising with a frame, pain controlled, lives in a 5th-floor walk-up with stairs at the void deck. Where does she go next?',
          zh: '术后第3天,用助行架活动,疼痛已控制,住在五楼无电梯组屋,底层还有阶梯。下一站去哪里?',
        },
        weight: 1.5,
        reference: AGEING_PLAN,
        options: [
          {
            id: 'community-rehab',
            label: {
              en: 'Transfer to a community hospital (St Luke\'s / Ren Ci / OCH) for 2–3 weeks of inpatient rehab.',
              zh: '转至社区医院(圣路加 / 仁慈 / OCH欧南)进行2–3周住院康复。',
            },
            score: 10,
            rationale: {
              en: 'Step-down rehab for older adults with stairs at home reduces 90-day readmission and improves functional independence (TOC, AIC pathways).',
              zh: '对家中有阶梯的长者而言,分级康复可降低90天再住院率并改善功能独立(过渡照护、AIC路径)。',
            },
            outcome: {
              patient: {
                en: 'You move to St Luke\'s. The physio there is encouraging. You begin to climb stairs.',
                zh: '你转到圣路加。那里的物理治疗师很鼓励你。你开始练爬楼梯。',
              },
              caregiver: {
                en: 'You get some sleep. The community-hospital social worker calls you with a plan.',
                zh: '你终于能睡一会儿。社区医院的社工打来告诉你后续方案。',
              },
              staff: {
                en: 'Bed booked at St Luke\'s; AIC referral submitted; NEHR records flow.',
                zh: '圣路加床位已订;AIC转介已提交;NEHR记录已上传。',
              },
            },
          },
          {
            id: 'home-therapy',
            label: {
              en: 'Discharge home with home-care therapy and a follow-up SOC review in 2 weeks.',
              zh: '出院回家,安排居家治疗,2周后专科门诊复查。',
            },
            score: 4,
            rationale: {
              en: 'Possible if family support is robust and home is wheelchair-accessible — but a 5th-floor walk-up with stairs is unsafe at this stage.',
              zh: '若家庭支持强且家中无障碍尚可 — 但五楼无电梯加阶梯的环境在此阶段并不安全。',
            },
            outcome: {
              patient: {
                en: 'You go home. The first stairs feel insurmountable.',
                zh: '回到家。第一段楼梯感觉根本爬不上去。',
              },
              caregiver: {
                en: 'You take 2 weeks unpaid leave. You worry about falls.',
                zh: '你请了两周无薪假。担心妈妈跌倒。',
              },
              staff: { en: 'PT/OT visit scheduled; risk of fall flagged.', zh: '已安排PT/OT上门;跌倒风险已标记。' },
            },
          },
          {
            id: 'discharge-no-rehab',
            label: { en: 'Discharge home with no rehab pathway.', zh: '出院回家,不安排康复路径。' },
            score: -5,
            rationale: {
              en: 'High readmission risk, poor functional outcome, caregiver collapse.',
              zh: '再住院风险高,功能结局差,照护者崩溃。',
            },
            outcome: {
              patient: {
                en: 'A fall on day 5 at home; readmitted with dislocation.',
                zh: '回家第5天跌倒;因髋关节脱位再住院。',
              },
              caregiver: { en: 'You blame yourself.', zh: '你不断自责。' },
              staff: { en: 'Avoidable readmission.', zh: '可避免的再住院。' },
            },
          },
        ],
      },
    },
    {
      id: 'community-hospital',
      department: 'rehab',
      durationMin: 28800, // ~20 days
      costSGD: 2800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -6, financialWorry: 6, sleepDebt: -10 },
      framing: {
        patient: {
          en: 'Mornings: physio. Afternoons: rest. Evenings: a volunteer reads the paper to you.',
          zh: '上午:物理治疗。下午:休息。晚上:志愿者陪你读报。',
        },
        caregiver: {
          en: 'You visit on weekends. You watch your mother climb six steps unaided. You cry quietly.',
          zh: '你周末来探望。看着妈妈不靠人爬上六级台阶。你悄悄哭了。',
        },
        staff: {
          en: 'Rehab progressing — TUG improved, independent transfers, stairs ×6 with rail.',
          zh: '康复进展顺利 — Timed Up-and-Go进步,转移已独立,扶栏可上下六级台阶。',
        },
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      durationMin: 30,
      framing: {
        patient: {
          en: 'The Grab driver helps you with the bag. Home smells of home.',
          zh: 'Grab司机帮你提行李。家里有家的味道。',
        },
        caregiver: {
          en: 'You take the rest of the afternoon off. You both eat porridge in silence.',
          zh: '你请了半天假。两人安静地一起喝粥。',
        },
        staff: {
          en: 'Discharge summary uploaded; HCA home-care nurse to visit in 3 days; SOC at 6 weeks.',
          zh: '出院摘要已上传;HCA居家照护护士3天后上门;6周后专科门诊复查。',
        },
      },
    },
  ],
};
