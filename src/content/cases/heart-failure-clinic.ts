import type { CaseDefinition } from '../../lib/types';

const ESC_HF = {
  label: { en: 'ESC HF Guidelines 2023', zh: '欧洲心脏病学会(ESC)心衰指南2023' },
  body: {
    en: 'European HF guidelines: four-pillar therapy (ACE-i / ARB / ARNI + beta-blocker + MRA + SGLT2i).',
    zh: '欧洲心衰指南:四大支柱疗法(ACE抑制剂 / ARB / ARNI + β受体阻断剂 + MRA + SGLT2抑制剂)。',
  },
};

const SHF_CPG = {
  label: { en: 'Singapore Heart Foundation HF Pathway', zh: '新加坡心脏基金会(SHF)心衰诊疗路径' },
  body: {
    en: 'SHF / NHCS / NUHCS local guidance for HF management and right-siting.',
    zh: 'SHF / NHCS / NUHCS对本地心衰管理及"分级就诊(right-siting)"的指引。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'Healthier SG (HF chronic care)', zh: 'Healthier SG(心衰慢性照护)' },
  body: {
    en: 'Right-siting stable HF to a Healthier-SG GP after specialist initiation.',
    zh: '稳定心衰患者在专科起始治疗后,转回Healthier SG家庭医生持续管理。',
  },
};

export const heartFailureCase: CaseDefinition = {
  id: 'hf-outpatient',
  title: {
    en: 'New-onset heart failure — polyclinic to NHCS HF clinic',
    zh: '新发心衰 — 综合诊疗所转NHCS心衰门诊',
  },
  blurb: {
    en: 'Mr Tan, 64. Three weeks of breathlessness and ankle swelling; can\'t finish his usual NTUC walk. NHGP polyclinic flags JVP raised and bibasal crackles; refers to NHCS HF clinic urgently.',
    zh: '陈先生,64岁。气喘、脚踝水肿已三周;平时去NTUC的散步走不完一圈。NHGP综合诊疗所发现颈静脉压升高、两肺底湿啰音;紧急转介NHCS心衰门诊。',
  },
  category: 'outpatient',
  primaryFacility: 'nhcs',
  involvedFacilities: ['nhgp-amk', 'nhcs', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [ESC_HF, SHF_CPG, HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic-flag',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: {
          en: 'You finally accepted you\'ve been getting more breathless.',
          zh: '你终于承认自己越来越喘了。',
        },
        caregiver: { en: 'Your wife noticed first.', zh: '太太是最早察觉的人。' },
        staff: {
          en: 'NHGP: BP 152/88, HR 96, JVP +5, bibasal crackles. NT-proBNP 1,800. Refers to NHCS HF clinic.',
          zh: 'NHGP:血压152/88,心率96,颈静脉压+5,两肺底湿啰音。NT-proBNP 1,800。转介NHCS心衰门诊。',
        },
      },
      decision: {
        id: 'route-to-hf-clinic',
        prompt: { en: 'Where to refer?', zh: '该转介到哪里?' },
        weight: 1,
        reference: SHF_CPG,
        options: [
          {
            id: 'nhcs-hf',
            label: {
              en: 'Subsidised NHCS HF clinic (cross-cluster from NHG to SingHealth).',
              zh: '津贴价的NHCS心衰门诊(跨集群:从NHG转至SingHealth)。',
            },
            score: 10,
            rationale: {
              en: 'NHCS runs a high-volume HF clinic; cluster boundaries don\'t gatekeep.',
              zh: 'NHCS的心衰门诊量大、经验丰富;集群边界不应成为转介的障碍。',
            },
            outcome: {
              patient: { en: 'A 1-week appointment.', zh: '一周后的预约。' },
              caregiver: { en: 'You note it.', zh: '你把日期记下来。' },
              staff: {
                en: 'Cross-cluster e-referral; NEHR populated.',
                zh: '跨集群电子转介;NEHR记录已更新。',
              },
            },
          },
          {
            id: 'ttsh-cardio',
            label: { en: 'NHG-internal: TTSH cardiology SOC.', zh: 'NHG集群内:TTSH心脏科专科门诊。' },
            score: 8,
            rationale: {
              en: 'Reasonable; same-cluster routing. Either centre acceptable.',
              zh: '合理选择;同集群转介。两个中心都可接受。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'private',
            label: { en: 'Private cardiology consult.', zh: '私人心脏专科门诊。' },
            score: 5,
            rationale: {
              en: 'Faster but private rate; no MAF for HF medications.',
              zh: '看得快,但按私人价计费;心衰药物没有政府药物援助基金(MAF)津贴。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Cost concerns.', zh: '担心费用。' },
              staff: { en: '', zh: '' },
            },
          },
        ],
      },
    },
    {
      id: 'nhcs-hf-clinic',
      department: 'soc',
      facility: 'nhcs',
      durationMin: 90,
      costSGD: 320,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6 },
      framing: {
        patient: {
          en: 'A cardiologist explains your heart\'s pumping function with a diagram.',
          zh: '心脏科医生画图给你看,解释心脏的泵血功能。',
        },
        caregiver: {
          en: 'You ask how long the medications will be needed.',
          zh: '你问药要吃多久。',
        },
        staff: {
          en: 'Echo: LVEF 32%; mild MR; LV dilated. Diagnosis: HFrEF.',
          zh: '心脏超声:左室射血分数(LVEF)32%;轻度二尖瓣返流;左室扩大。诊断:射血分数降低的心衰(HFrEF)。',
        },
      },
      decision: {
        id: 'four-pillar',
        prompt: {
          en: 'HFrEF (LVEF 32%). Four-pillar GDMT — start how?',
          zh: 'HFrEF(LVEF 32%)。四大支柱指南导向药物治疗(GDMT)— 如何起始?',
        },
        weight: 1.5,
        reference: ESC_HF,
        options: [
          {
            id: 'all-four',
            label: {
              en: 'Start sacubitril/valsartan (ARNI) + bisoprolol + spironolactone + dapagliflozin together at low doses; titrate over 4–6 weeks.',
              zh: '同时起始沙库巴曲缬沙坦(ARNI) + 比索洛尔 + 螺内酯 + 达格列净,均从小剂量开始;4–6周内逐步加量。',
            },
            score: 10,
            rationale: {
              en: 'STRONG-HF and current ESC guidance support rapid simultaneous initiation rather than sequential. Up-titration follow-up matters.',
              zh: 'STRONG-HF研究和现行ESC指南支持四种药物快速同时启动,而非按顺序逐一加入。加量过程中的随访同样关键。',
            },
            outcome: {
              patient: { en: 'Four new tablets.', zh: '四种新药。' },
              caregiver: { en: 'You photograph each one.', zh: '你把每种药都拍了照。' },
              staff: { en: 'Ambulatory titration plan.', zh: '门诊加量方案已订立。' },
            },
          },
          {
            id: 'sequential',
            label: {
              en: 'Start ACE-i + beta-blocker; add MRA + SGLT2i sequentially over months.',
              zh: '先起始ACE抑制剂 + β受体阻断剂;数月内逐步加入MRA和SGLT2抑制剂。',
            },
            score: 7,
            rationale: {
              en: 'Old paradigm; many patients never reach the 4-pillar combination. Acceptable but slower.',
              zh: '旧式做法;许多患者最终未能用齐四种药。可接受,但太慢。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'diuretic-only',
            label: { en: 'Frusemide only; lifestyle advice.', zh: '只开呋塞米(利尿剂);生活方式指导。' },
            score: -6,
            rationale: {
              en: 'Diuretic for symptoms but does not address mortality. Misses the four-pillar foundation.',
              zh: '利尿剂只缓解症状,无法改善死亡率。错过四大支柱治疗的基础。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Reg adds GDMT.', zh: '住院医加上GDMT。' },
            },
            effects: { setFlags: ['hf-undertreated'] },
          },
        ],
      },
    },
    {
      id: 'hf-decompensation',
      department: 'ed',
      facility: 'ttsh',
      requiresAnyFlag: ['hf-undertreated'],
      durationMin: 180,
      costSGD: 540,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 12, sleepDebt: 14 },
      framing: {
        patient: {
          en: '(orthopnoea, ankle swelling, can\'t finish his sentences.)',
          zh: '(端坐呼吸、脚踝水肿,说话说不完一句。)',
        },
        caregiver: { en: 'You drive him to the ED at midnight.', zh: '你半夜开车送他去急诊。' },
        staff: {
          en: 'Acute decompensation: predictable when the four-pillar therapy was withheld; admit, IV diuretic, escalate GDMT now.',
          zh: '急性失代偿:未给四大支柱治疗下完全可以预见;收住院、静脉利尿剂、现在就升级GDMT。',
        },
      },
      decision: {
        id: 'rescue-gdmt',
        prompt: {
          en: 'Diuretic-only patient now in acute decompensation. Action?',
          zh: '只用过利尿剂的患者现已急性失代偿。该怎么做?',
        },
        weight: 1.2,
        reference: SHF_CPG,
        options: [
          {
            id: 'rescue-init-four',
            label: {
              en: 'IV frusemide + start ARNI/BB/MRA/SGLT2i during admission per STRONG-HF; titrate at HF nurse follow-up.',
              zh: '静脉呋塞米 + 按STRONG-HF于住院期间启动ARNI / β受体阻断剂 / MRA / SGLT2抑制剂;心衰专科护士门诊随访加量。',
            },
            score: 10,
            rationale: {
              en: 'STRONG-HF showed early in-hospital initiation reduces 6-month death/HFH.',
              zh: 'STRONG-HF研究显示:住院期间早期启动四大支柱可降低6个月内死亡及心衰再住院率。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { clearFlags: ['hf-undertreated'] },
          },
          {
            id: 'discharge-quickly',
            label: {
              en: 'IV diuretic, then discharge with diuretic-only and GP review.',
              zh: '静脉利尿剂后出院,仅带利尿剂回家,交家庭医生随访。',
            },
            score: -4,
            rationale: {
              en: 'Misses the in-hospital window; high re-admission risk.',
              zh: '错过住院期间起始治疗的黄金窗口;再住院风险高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'titration-clinic',
      department: 'soc',
      facility: 'nhcs',
      durationMin: 45,
      costSGD: 150,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 2 },
      framing: {
        patient: { en: 'You feel better. The walks are easier.', zh: '感觉好多了。散步走起来轻松了。' },
        caregiver: { en: 'You go to the supermarket together again.', zh: '又能一起去超市了。' },
        staff: {
          en: 'Up-titration: bisoprolol 5 mg, ARNI 49/51 BD; eGFR stable; K 4.4.',
          zh: '加量:比索洛尔5 mg、ARNI 49/51每日两次;eGFR稳定;血钾4.4。',
        },
      },
    },
    {
      id: 'right-site-gp',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 30,
      framing: {
        patient: { en: 'A familiar clinic.', zh: '一家熟悉的诊所。' },
        caregiver: { en: 'You understand the plan now.', zh: '你现在清楚整个治疗计划了。' },
        staff: {
          en: 'Stable on optimised GDMT. Right-sited to Healthway GP under Healthier SG; NHCS surveillance annually.',
          zh: '经优化的GDMT下病情稳定。按Healthier SG分级就诊原则转回Healthway家庭医生;NHCS每年复查一次。',
        },
      },
      decision: {
        id: 'right-siting',
        prompt: { en: 'Long-term care plan once optimised?', zh: '治疗优化后,长期照护方案?' },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared',
            label: {
              en: 'Healthier-SG GP + NHCS HF clinic annually.',
              zh: 'Healthier SG家庭医生主管 + NHCS心衰门诊每年复查。',
            },
            score: 10,
            rationale: {
              en: 'Right-sited continuity; NHCS for complex events only.',
              zh: '分级就诊带来连续性;NHCS只处理复杂事件。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'soc-only',
            label: {
              en: 'NHCS HF clinic every 3 months indefinitely.',
              zh: 'NHCS心衰门诊每3个月复诊,无期限。',
            },
            score: 4,
            rationale: {
              en: 'Unnecessary specialist load for a stable patient.',
              zh: '稳定患者无需占用如此多的专科资源。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: { en: 'No follow-up.', zh: '不安排随访。' },
            score: -6,
            rationale: {
              en: 'High decompensation risk; titration needed.',
              zh: '失代偿风险高;仍需药物加量监测。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
