import type { CaseDefinition } from '../../lib/types';

const NCCN_BREAST = {
  label: { en: 'NCCN Breast Cancer (v.2024)', zh: 'NCCN乳腺癌指南(2024版)' },
  body: {
    en: 'NCCN guidelines for breast cancer screening, diagnosis and treatment.',
    zh: '美国国立综合癌症网络(NCCN)对乳腺癌筛查、诊断与治疗的指南。',
  },
};

const MOH_CANCER = {
  label: { en: 'MOH National Cancer Strategy', zh: '卫生部全国癌症策略' },
  body: {
    en: 'Singapore strategy on early detection, equitable treatment access, and survivorship.',
    zh: '新加坡对早期发现、公平的治疗可及性以及生存者照护的国家级策略。',
  },
};

const MAF = {
  label: { en: 'MOH Medication Assistance Fund (MAF)', zh: '卫生部药物援助基金(MAF)' },
  body: {
    en: 'Subsidies for selected high-cost cancer drugs at restructured hospitals.',
    zh: '在政府改组医院针对选定的高价癌症药物提供津贴。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'Healthier SG', zh: 'Healthier SG' },
  body: {
    en: 'Right-siting stable post-treatment patients to a primary-care provider.',
    zh: '治疗后病情稳定的患者按分级就诊原则转回基层医疗。',
  },
};

export const breastCancerCrossCluster: CaseDefinition = {
  id: 'breast-ca-crosscluster',
  title: {
    en: 'Cross-cluster Breast Cancer — polyclinic referral, NHG → SingHealth',
    zh: '跨集群乳腺癌 — 综合诊疗所转诊,NHG → SingHealth',
  },
  blurb: {
    en: 'Mdm Lim, 54. Felt a right breast lump while showering 4 weeks ago. Visited Toa Payoh Polyclinic (NHG). Referred to SGH Breast Centre (SingHealth) for triple assessment, then NCCS for treatment.',
    zh: '林女士,54岁。4周前洗澡时摸到右乳肿块。前往大巴窑综合诊疗所(NHG)就诊。转介至SGH乳房中心(SingHealth)进行三联评估,之后转NCCS治疗。',
  },
  category: 'outpatient',
  primaryFacility: 'sgh',
  involvedFacilities: ['nhgp-toa-payoh', 'sgh', 'nccs'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: false,
  guidelines: [NCCN_BREAST, MOH_CANCER, MAF, HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic-presentation',
      department: 'gp-room',
      facility: 'nhgp-toa-payoh',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: {
          en: 'You sat in the carpark for ten minutes before going in. The doctor examines you, says little. You overhear the word "lump".',
          zh: '进诊所前你在停车场坐了十分钟。医生检查时话不多。你听到他低声说"肿块"两个字。',
        },
        caregiver: {
          en: 'Your daughter took the morning off to come with you.',
          zh: '女儿请了上午假陪你来。',
        },
        staff: {
          en: 'NHGP FP: 2 cm hard, fixed lump R UOQ. No skin tethering. Refers to a Breast Centre via subsidised SOC referral.',
          zh: 'NHGP家庭医生:右乳外上象限可触及2 cm质硬、固定的肿块;无皮肤牵拉。通过津贴价专科转介信转至乳房中心。',
        },
      },
      decision: {
        id: 'referral-routing',
        prompt: {
          en: 'Subsidised referral letter being written. Which centre, and how urgent?',
          zh: '正在开具津贴转介信。送哪个中心?多急?',
        },
        weight: 1.5,
        reference: MOH_CANCER,
        options: [
          {
            id: 'sgh-2-week',
            label: {
              en: 'Subsidised cross-cluster referral to SGH Breast Centre, 2-week-wait pathway (suspected cancer).',
              zh: '津贴价跨集群转介至SGH乳房中心,走2周内就诊路径(疑似癌症)。',
            },
            score: 10,
            rationale: {
              en: 'MOH cancer pathway prioritises 2-week assessment for clinically suspicious lumps. Cross-cluster referral is routine — SGH Breast Centre offers triple assessment in one visit; cluster does not gatekeep cancer pathways.',
              zh: '卫生部癌症路径要求对临床高度怀疑的肿块在2周内评估。跨集群转诊属常规 — SGH乳房中心一次问诊即可完成三联评估;集群边界并不阻挡癌症路径。',
            },
            outcome: {
              patient: {
                en: 'Appointment in 8 days. You write it on the calendar in pen and circle it.',
                zh: '8天后的预约。你用笔郑重地在日历上圈了起来。',
              },
              caregiver: { en: 'You set a reminder.', zh: '你在手机上设了提醒。' },
              staff: {
                en: 'NEHR populated; receiving end notified via cross-cluster e-referral.',
                zh: 'NEHR记录已更新;通过跨集群电子转介通知对方。',
              },
            },
          },
          {
            id: 'ttsh-routine',
            label: {
              en: 'NHG-internal referral to TTSH Breast Surgery, routine 6-week.',
              zh: 'NHG集群内转介至TTSH乳腺外科,按常规6周安排。',
            },
            score: 5,
            rationale: {
              en: 'Cluster-internal is administratively simpler but routine timeframe is too slow for a clinically suspicious lump. Speed matters more than cluster.',
              zh: '同集群在行政上较简单,但对临床高度怀疑的肿块6周太慢。"速度"重于"集群"。',
            },
            outcome: {
              patient: { en: 'Six weeks of waiting.', zh: '要等六个星期。' },
              caregiver: {
                en: 'You both don\'t sleep well.',
                zh: '两人都睡不好。',
              },
              staff: { en: 'Routine slot booked; not optimal.', zh: '常规预约已订;并非最佳。' },
            },
          },
          {
            id: 'private',
            label: {
              en: 'Private referral to a Mt Elizabeth surgeon.',
              zh: '私人转介至伊丽莎白医院的外科医生。',
            },
            score: 6,
            rationale: {
              en: 'Faster appointment but full private cost. Defensible if patient prefers, but loses MAF / subsidy advantage if treatment is needed.',
              zh: '预约较快但需付完整私人价。若患者偏好可接受,但若后续治疗会失去MAF / 津贴优势。',
            },
            outcome: {
              patient: {
                en: 'Appointment next week, but the bill begins.',
                zh: '下周就能看,但账单也开始累积。',
              },
              caregiver: { en: 'You worry about the cost.', zh: '你担心费用。' },
              staff: { en: 'Acceptable; cost discussed.', zh: '可接受;已讨论费用。' },
            },
          },
          {
            id: 'wait-and-watch',
            label: { en: 'Reassure and review in 6 weeks.', zh: '安抚后6周复诊。' },
            score: -8,
            rationale: {
              en: 'A clinically hard, fixed lump in a 54-year-old must be assessed urgently.',
              zh: '54岁女性的质硬固定肿块须紧急评估。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Returns 3 months later with worsening symptoms.',
                zh: '3个月后因症状加重再就诊。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'sgh-triple-assessment',
      department: 'soc',
      facility: 'sgh',
      durationMin: 120,
      costSGD: 380,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 5, financialWorry: 10, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'A nurse meets you with a one-stop guide. Examination, then mammogram, then ultrasound. You see the radiographer\'s face change.',
          zh: '一位护士拿着"一站式"指引接待你。先做体检,再做乳房X光,再做超声。你看到放射技师的表情变了。',
        },
        caregiver: {
          en: 'Long corridors. Your daughter holds your hand on the second one.',
          zh: '长长的走廊。第二段走廊里,女儿握住了你的手。',
        },
        staff: {
          en: 'Triple assessment: clinical (suspicious), mammogram (BI-RADS 5), US (irregular hypoechoic mass). Core biopsy taken under US guidance.',
          zh: '三联评估:临床(可疑)、乳房X光(BI-RADS 5)、超声(形态不规则的低回声肿块)。在超声引导下行粗针穿刺活检。',
        },
      },
      decision: {
        id: 'staging',
        prompt: {
          en: 'Histology returns 4 days later: invasive ductal carcinoma, ER+/PR+/HER2−, grade 2. Clinically T2, palpable axillary nodes. What is your staging plan?',
          zh: '4天后病理回报:浸润性导管癌,ER+/PR+/HER2−,2级。临床分期T2,可触及腋窝淋巴结。分期方案?',
        },
        weight: 1.2,
        reference: NCCN_BREAST,
        options: [
          {
            id: 'mri-axus',
            label: {
              en: 'Breast MRI for extent + axillary US ± FNA. Refer to NCCS multi-disciplinary tumour board for treatment plan.',
              zh: '乳房MRI评估病变范围 + 腋窝超声 ± 细针抽吸(FNA)。转介NCCS多学科肿瘤委员会(MDT)讨论治疗方案。',
            },
            score: 10,
            rationale: {
              en: 'Standard staging for a node-positive locally-advanced breast cancer. MDT discussion ensures coordinated surgical / oncology / radiation planning. NCCS hosts national MDT for complex cases.',
              zh: '腋窝阳性局部晚期乳腺癌的标准分期。MDT讨论确保手术 / 内科 / 放疗协调一致。NCCS承接复杂病例的全国MDT。',
            },
            outcome: {
              patient: {
                en: 'Another scan, but the staff are gentle and explain each step.',
                zh: '又要做一次扫描,但工作人员温柔地把每一步解释清楚。',
              },
              caregiver: {
                en: 'You take notes during the MDT explanation.',
                zh: 'MDT解释时你认真做笔记。',
              },
              staff: {
                en: 'MRI booked, axillary FNA positive, tumour board scheduled in 5 days.',
                zh: 'MRI已预约;腋窝FNA阳性;5天后召开肿瘤委员会会议。',
              },
            },
          },
          {
            id: 'just-surgery',
            label: { en: 'Proceed straight to mastectomy, defer staging.', zh: '直接行乳房切除,暂不分期。' },
            score: 0,
            rationale: {
              en: 'Staging informs neoadjuvant decisions; node-positive locally-advanced disease often benefits from neoadjuvant systemic therapy.',
              zh: '分期影响新辅助治疗的决定;腋窝阳性局部晚期常获益于新辅助全身治疗。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Senior reviews and adds staging.', zh: '上级医师审阅后补做分期。' },
            },
          },
          {
            id: 'pet-routine',
            label: { en: 'PET-CT routinely for stage I-II.', zh: '对I-II期常规PET-CT扫描。' },
            score: 4,
            rationale: {
              en: 'Reasonable for symptomatic / locally advanced cases but not first-line for asymptomatic stage I-II disease per NCCN.',
              zh: 'NCCN指南:症状性 / 局部晚期可考虑,但对无症状的I-II期并非一线。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Reasonable; cost-benefit discussed at MDT.',
                zh: '合理;MDT讨论了费用与获益。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'nccs-mdt',
      department: 'soc',
      facility: 'nccs',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8 },
      framing: {
        patient: {
          en: 'A new building. Ribbons on the lobby art. The oncologist draws on a card with the diagnosis and the plan.',
          zh: '一栋新楼。大堂的艺术品上系着丝带。肿瘤科医生在卡片上画出诊断与方案。',
        },
        caregiver: {
          en: 'You film the explanation on your phone (with consent) so you can replay it later.',
          zh: '在征得同意后,你用手机录下解释,以便事后重听。',
        },
        staff: {
          en: 'MDT decision: neoadjuvant chemo (AC-T) → surgery (mastectomy + axillary clearance) → adjuvant radiotherapy → endocrine therapy x 5 years.',
          zh: 'MDT决议:新辅助化疗(AC-T方案)→ 手术(乳房切除 + 腋窝清扫)→ 辅助放疗 → 内分泌治疗5年。',
        },
      },
      decision: {
        id: 'subsidy-and-drug-list',
        prompt: {
          en: 'Patient is means-test-eligible for subsidised treatment. AC-T is on the Standard Drug List. Trastuzumab not indicated (HER2−). What financing plan do you advise?',
          zh: '患者经家庭收入审查可享津贴治疗。AC-T在标准用药清单上。HER2阴性,无需曲妥珠单抗。如何安排费用?',
        },
        weight: 1,
        reference: MAF,
        options: [
          {
            id: 'subsidised-mdt',
            label: {
              en: 'Subsidised NCCS treatment; MediShield Life + MediSave + MAF; refer to medical social worker for further bill review.',
              zh: 'NCCS津贴价治疗;MediShield Life + MediSave + 药物援助基金(MAF);转介医务社工进一步审视账单。',
            },
            score: 10,
            rationale: {
              en: 'Standard pathway: maximise subsidy + MediSave + MediShield + MAF for Standard Drug List agents. For Cancer Drug List (CDL) chemo, MediShield Life pays per-treatment claim limits (the CDL was refreshed 1 Apr 2026); cell/gene therapies have had a separate CTGTP MediShield benefit since Oct 2025. MSW review captures unmet need; Medifund as last resort.',
              zh: '标准路径:对标准用药清单上的药物最大限度叠加津贴 + MediSave + MediShield + MAF。属癌症药物清单(CDL)的化疗,MediShield Life按每次治疗的索赔上限支付(CDL于2026年4月1日更新);细胞与基因疗法自2025年10月起有独立的CTGTP MediShield保障。医务社工评估未满足需求;最后申请保健基金(Medifund)。',
            },
            outcome: {
              patient: {
                en: 'The MSW spends an hour with you. The bill estimate is workable.',
                zh: '医务社工和你谈了一个小时。账单估算还能承受。',
              },
              caregiver: { en: 'You take photos of all the forms.', zh: '你把所有表格都拍下来。' },
              staff: { en: 'Subsidy class confirmed; MAF claim filed.', zh: '津贴等级已确认;MAF申报已提交。' },
            },
          },
          {
            id: 'private',
            label: {
              en: 'Switch to a private oncologist for faster turnaround.',
              zh: '改看私人肿瘤科医生以加快流程。',
            },
            score: 2,
            rationale: {
              en: 'Faster scheduling but loses subsidy and MAF; unless IP rider with as-charged plan, cost is significant.',
              zh: '安排较快但失去津贴与MAF;除非有"按实付"综合健保附加险,否则费用很高。',
            },
            outcome: {
              patient: { en: 'The bill grows.', zh: '账单不断攀升。' },
              caregiver: { en: 'You consider selling investments.', zh: '你考虑变卖投资。' },
              staff: { en: 'Acceptable; financial counselling done.', zh: '可接受;已进行财务辅导。' },
            },
          },
          {
            id: 'no-insurance-talk',
            label: {
              en: 'Skip financial counselling — discuss only the medical plan.',
              zh: '跳过财务辅导 — 只讨论治疗方案。',
            },
            score: -3,
            rationale: {
              en: 'Financial toxicity is a major contributor to non-completion of cancer therapy. Counselling at the start prevents mid-treatment crises.',
              zh: '"经济毒性"是癌症治疗中断的主要原因之一。开始即进行辅导可避免治疗中途陷入危机。',
            },
            outcome: {
              patient: {
                en: 'Halfway through, you receive an unexpected bill.',
                zh: '治疗到一半,收到意外账单。',
              },
              caregiver: { en: 'Family stress.', zh: '家中气氛紧张。' },
              staff: { en: 'MSW pulled in late.', zh: '医务社工较晚才介入。' },
            },
          },
        ],
      },
    },
    {
      id: 'nccs-day-tx',
      department: 'ot',
      facility: 'nccs',
      durationMin: 240,
      costSGD: 1800,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 4, sleepDebt: 6 },
      framing: {
        patient: {
          en: 'A reclining chair. A volunteer brings you mee siam from the kitchen. The drip runs slow.',
          zh: '一张可斜躺的椅子。志愿者从厨房端来一份mee siam(米暹)。点滴慢慢地滴。',
        },
        caregiver: {
          en: 'Your daughter brings you crochet wool. You finish a sleeve over four hours.',
          zh: '女儿带来钩针毛线。四个小时下来你钩完了一只袖子。',
        },
        staff: {
          en: 'Cycle 1 AC chemotherapy; granisetron + dexamethasone; G-CSF schedule explained.',
          zh: 'AC方案化疗第1周期;格拉司琼 + 地塞米松止吐;说明G-CSF用药安排。',
        },
      },
    },
    {
      id: 'sgh-surgery',
      department: 'ot',
      facility: 'sgh',
      durationMin: 240,
      costSGD: 9200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 14, sleepDebt: 12 },
      framing: {
        patient: {
          en: 'Same Outram campus, different building. The mastectomy team is the same surgeon you met at the Breast Centre.',
          zh: '同样在欧南园园区,只是换了栋楼。手术团队的主刀,正是你在乳房中心见过的那位医生。',
        },
        caregiver: {
          en: 'You wait in the family lounge. Hours pass.',
          zh: '你在家属休息区等候。时间一小时一小时过去。',
        },
        staff: {
          en: 'Right mastectomy + axillary clearance after neoadjuvant chemo. Path: ypT1c ypN1, complete surgical margins.',
          zh: '新辅助化疗后行右乳房切除 + 腋窝清扫。病理:ypT1c ypN1,切缘完整。',
        },
      },
    },
    {
      id: 'nccs-radiotherapy',
      department: 'soc',
      facility: 'nccs',
      durationMin: 1200,
      costSGD: 3200,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 25, financialWorry: 6, sleepDebt: 8 },
      framing: {
        patient: {
          en: 'Daily radiotherapy for 3 weeks. The drive is shorter than chemo days.',
          zh: '连续3周每日放疗。来回的路程比化疗日短一些。',
        },
        caregiver: {
          en: 'You drop her off and pick her up; you both find a routine.',
          zh: '你负责接送;两人都摸出一套节奏。',
        },
        staff: {
          en: 'Hypofractionated chest-wall + axillary RT; 15 fractions; mild skin reaction managed.',
          zh: '采用低分割放疗,胸壁 + 腋窝,共15次;轻度皮肤反应已对症处理。',
        },
      },
    },
    {
      id: 'right-site',
      department: 'discharge',
      facility: 'nccs',
      durationMin: 30,
      framing: {
        patient: { en: 'You ring the survivorship bell.', zh: '你敲响了"康复之钟"。' },
        caregiver: { en: 'Your daughter cries. You both laugh.', zh: '女儿哭了。两人也笑了。' },
        staff: {
          en: 'Survivorship summary uploaded. Endocrine therapy x 5y. Surveillance plan: annual mammogram + clinical review.',
          zh: '已上传生存者摘要。内分泌治疗5年。监测计划:每年乳房X光 + 临床复查。',
        },
      },
      decision: {
        id: 'survivorship-plan',
        prompt: {
          en: 'Stable, on letrozole. What survivorship plan do you adopt?',
          zh: '病情稳定,服用来曲唑。生存者照护方案?',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-care',
            label: {
              en: 'Shared survivorship: annual NCCS surveillance + quarterly Healthier-SG GP for endocrine therapy + chronic disease.',
              zh: '共享生存者照护:每年NCCS监测 + 每3个月Healthier SG家庭医生处理内分泌治疗与慢性病。',
            },
            score: 10,
            rationale: {
              en: 'Shared-care models reduce SOC load, improve continuity, and maintain specialist surveillance for recurrence. Healthier-SG GP enrolment maximises CDMP / Flexi-MediSave for ongoing chronic care.',
              zh: '共享照护模式减少专科负担、提升连续性、同时保留对复发的专科监测。登记Healthier SG家庭医生可最大化CDMP / Flexi-MediSave 对慢性病照护的支持。',
            },
            outcome: {
              patient: {
                en: 'Your GP near home becomes the centre of your medical world.',
                zh: '住家附近的家庭医生成了你医疗世界的中心。',
              },
              caregiver: {
                en: 'Less travel; less time off work.',
                zh: '少跑医院,少请假。',
              },
              staff: {
                en: 'Treatment summary handed to GP; cluster annual review remains.',
                zh: '治疗摘要已转交家庭医生;集群年度复查照常进行。',
              },
            },
          },
          {
            id: 'soc-only',
            label: { en: 'NCCS SOC every 3 months indefinitely.', zh: 'NCCS专科门诊每3个月复诊,无期限。' },
            score: 4,
            rationale: {
              en: 'Specialist time better used for active treatment; stable patients fit shared care.',
              zh: '专科时间应用于在治疗中的患者;稳定者更适合共享照护。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Repeated time off.', zh: '反复请假。' },
              staff: { en: 'SOC slots clogged.', zh: '专科预约越发紧张。' },
            },
          },
          {
            id: 'discharge-noplan',
            label: {
              en: 'Discharge to GP with no surveillance.',
              zh: '转给家庭医生,但不安排监测。',
            },
            score: -4,
            rationale: {
              en: 'Misses recurrence and contralateral disease.',
              zh: '会漏掉复发与对侧乳房疾病。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Avoidable late detection.', zh: '可避免的晚期诊断。' },
            },
          },
        ],
      },
    },
  ],
};
