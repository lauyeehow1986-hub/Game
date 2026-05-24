import type { CaseDefinition } from '../../lib/types';

const EPIP = {
  label: { en: 'IMH Early Psychosis Intervention Programme (EPIP)', zh: 'IMH 早期精神病干预计划(EPIP)' },
  body: {
    en: 'Singapore programme for early identification and treatment of first-episode psychosis with assertive community follow-up.',
    zh: '新加坡对首次精神病发作的早期识别与治疗计划,搭配主动式社区随访。',
  },
};

const NICE_PSY = {
  label: { en: 'NICE CG178 — Psychosis and Schizophrenia', zh: 'NICE CG178 — 精神病与精神分裂症' },
  body: {
    en: 'Antipsychotic monotherapy, psychosocial intervention, family involvement.',
    zh: '抗精神病药单药治疗、社会心理干预、家庭参与。',
  },
};

const CMHT = {
  label: { en: 'AIC Community Mental Health', zh: 'AIC社区心理卫生' },
  body: {
    en: 'Community Mental Health Teams + polyclinic mental-health services for stable patients.',
    zh: '社区心理卫生团队(CMHT)与综合诊疗所心理健康服务为稳定患者提供照护。',
  },
};

export const imhFirstEpisodeCase: CaseDefinition = {
  id: 'imh-first-psychosis',
  title: {
    en: 'First-episode psychosis — 22 y/o, family brings him to ED',
    zh: '首次精神病发作 — 22岁,家人陪同前往急诊',
  },
  blurb: {
    en: 'Mr Lee, 22. NS-completed. Last 3 months: withdrawal, paranoid ideation, hearing voices, sleep loss. Mum and elder sister bring him to TTSH ED at 11pm after he locked himself in his bedroom for two days.',
    zh: '李先生,22岁,已完成国民服役。近三个月:行为退缩、被害妄想、出现幻听、睡眠减少。把自己关在房里两天后,母亲与姐姐于晚上11点送他到TTSH急诊。',
  },
  category: 'acute',
  primaryFacility: 'imh',
  involvedFacilities: ['ttsh', 'imh', 'shp-bukit-merah'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [EPIP, NICE_PSY, CMHT],
  pathway: [
    {
      id: 'ttsh-ed',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 90,
      costSGD: 220,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 12, sleepDebt: 18 },
      framing: {
        patient: {
          en: '(quiet, watchful, refusing to make eye contact.)',
          zh: '(安静、警惕、不愿对视。)',
        },
        caregiver: { en: 'You both haven\'t slept properly in days.', zh: '你们已经好几天没好好睡过。' },
        staff: {
          en: 'ED: medically clear; toxicology negative. Psychiatric assessment done; high suicide risk screen flag.',
          zh: '急诊:躯体方面清楚;毒物筛查阴性。已完成精神科评估;高自杀风险筛查标记。',
        },
      },
      decision: {
        id: 'admit-or-divert',
        prompt: {
          en: 'Acutely psychotic, family-supported, no current overt aggression. Where to admit?',
          zh: '急性精神病状态,家属在旁支持,目前无明显攻击行为。送哪里收治?',
        },
        weight: 1.5,
        reference: EPIP,
        options: [
          {
            id: 'imh-admit',
            label: { en: 'Voluntary admission to IMH; EPIP team activated.', zh: '自愿入住IMH;启动EPIP团队。' },
            score: 10,
            rationale: {
              en: 'IMH is the national tertiary mental-health centre with EPIP for first-episode psychosis. Voluntary preserves engagement.',
              zh: 'IMH是全国三级心理卫生中心,EPIP专为首次精神病发作设计。自愿入院能保留治疗参与度。',
            },
            outcome: {
              patient: {
                en: '(quietly accepts admission with mum present.)',
                zh: '(母亲在旁,他安静地接受住院。)',
              },
              caregiver: { en: 'You sign forms; you cry quietly.', zh: '你签下文件;悄悄地哭。' },
              staff: { en: 'IMH bed booked; transfer arranged.', zh: 'IMH床位已订;转运已安排。' },
            },
          },
          {
            id: 'ttsh-psych',
            label: {
              en: 'Admit to TTSH general medical ward; await psych consult.',
              zh: '收入TTSH普通内科病房;等候精神科会诊。',
            },
            score: 4,
            rationale: {
              en: 'Acute psychosis better managed in a dedicated mental-health ward.',
              zh: '急性精神病更适合在专业心理卫生病房处理。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'TTSH refers to IMH next morning.', zh: 'TTSH次日清晨转介IMH。' },
            },
          },
          {
            id: 'home-ed',
            label: {
              en: 'Discharge home with crisis line; review at IMH outpatient in a week.',
              zh: '附上危机热线让其回家;一周后IMH门诊复诊。',
            },
            score: -4,
            rationale: {
              en: 'High-risk first-episode psychosis; family unable to monitor 24/7. Inpatient care safer for full assessment.',
              zh: '高风险的首次精神病发作;家属无法全天候监护。住院评估更安全。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Returns 3 days later in crisis.', zh: '3天后陷入危机再就诊。' },
            },
          },
        ],
      },
    },
    {
      id: 'imh-acute-ward',
      department: 'psych-ward',
      facility: 'imh',
      durationMin: 14400,
      costSGD: 1200,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 8, sleepDebt: -10 },
      framing: {
        patient: { en: '(starts engaging on D3; less guarded.)', zh: '(第3天开始愿意交流;戒备减少。)' },
        caregiver: {
          en: 'Family meeting on D5. The team explains psychosis carefully.',
          zh: '第5天召开家属会议。团队耐心讲解精神病的本质。',
        },
        staff: {
          en: 'EPIP team: started risperidone 2 mg, titrated to 4 mg by D7; PRN lorazepam; psychoeducation begun.',
          zh: 'EPIP团队:起始利培酮2 mg,第7天加至4 mg;必要时劳拉西泮;开始心理教育。',
        },
      },
      decision: {
        id: 'antipsychotic-choice',
        prompt: {
          en: 'First-episode psychosis. Antipsychotic selection?',
          zh: '首次精神病发作。抗精神病药选哪种?',
        },
        weight: 1.2,
        reference: NICE_PSY,
        options: [
          {
            id: 'risperidone',
            label: {
              en: 'Risperidone — second-generation, balance of efficacy + tolerability.',
              zh: '利培酮 — 第二代抗精神病药,兼顾疗效与耐受性。',
            },
            score: 10,
            rationale: {
              en: 'Standard first-line in many SG centres for first-episode; metabolic monitoring built in.',
              zh: '本地许多中心首次精神病的标准一线选择;代谢监测已纳入治疗常规。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'aripiprazole',
            label: {
              en: 'Aripiprazole — partial agonist, lower metabolic side-effects.',
              zh: '阿立哌唑 — 部分激动剂,代谢副作用较少。',
            },
            score: 9,
            rationale: {
              en: 'Reasonable choice; particularly attractive for younger patients concerned about weight gain.',
              zh: '合理选择;对担心体重增加的年轻患者尤其合适。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'haloperidol',
            label: { en: 'Haloperidol — first-generation.', zh: '氟哌啶醇 — 第一代抗精神病药。' },
            score: 4,
            rationale: {
              en: 'Effective but higher EPS; usually not first-line in early psychosis.',
              zh: '有效,但锥体外系副作用较多;通常不作为早期精神病一线。',
            },
            outcome: {
              patient: { en: 'Stiffness develops on D4.', zh: '第4天出现肢体僵硬。' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Switched.', zh: '已换药。' },
            },
          },
          {
            id: 'no-medication',
            label: { en: 'Hold antipsychotics; psychotherapy alone.', zh: '不用抗精神病药,仅用心理治疗。' },
            score: -8,
            rationale: {
              en: 'Active psychosis with risk; pharmacotherapy is part of the standard package.',
              zh: '存在风险的活动性精神病;药物治疗是标准方案的一部分。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Risk escalates.', zh: '风险升级。' },
            },
          },
        ],
      },
    },
    {
      id: 'imh-step-down',
      department: 'subacute-ward',
      facility: 'imh',
      durationMin: 14400,
      costSGD: 800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 0, sleepDebt: -8 },
      framing: {
        patient: {
          en: '(joining ward groups; doing OT activities.)',
          zh: '(开始参加病房小组活动;参与职能治疗。)',
        },
        caregiver: { en: 'Visiting on weekends.', zh: '周末来探望。' },
        staff: {
          en: 'Sub-acute ward: psychoeducation, family therapy sessions, vocational planning.',
          zh: '亚急性病房:心理教育、家庭治疗会议、职业规划。',
        },
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      facility: 'imh',
      durationMin: 60,
      framing: {
        patient: {
          en: 'Quieter; tells you he wants to go back to NS reservist work eventually.',
          zh: '人安静了些;告诉你他希望以后能回去做战备军人(NS reservist)的工作。',
        },
        caregiver: { en: 'You exhale.', zh: '你松一口气。' },
        staff: {
          en: 'EPIP outreach assigned; CMHT and polyclinic mental-health linkage done.',
          zh: '已分派EPIP外展;已对接社区心理卫生团队(CMHT)与综合诊疗所心理健康服务。',
        },
      },
      decision: {
        id: 'community-followup',
        prompt: {
          en: 'Two-year EPIP outreach available. Best ongoing arrangement?',
          zh: 'EPIP提供两年期外展服务。后续最佳安排?',
        },
        weight: 1.2,
        reference: CMHT,
        options: [
          {
            id: 'epip-cmht-poly',
            label: {
              en: 'EPIP outreach (assertive community follow-up) + SHP polyclinic mental-health team for stable medication review.',
              zh: 'EPIP外展(主动式社区随访)+ SHP综合诊疗所心理健康团队负责稳定期用药复查。',
            },
            score: 10,
            rationale: {
              en: 'Assertive community team prevents relapse; polyclinic right-sites stable maintenance.',
              zh: '主动式社区团队预防复发;综合诊疗所承接稳定期维持。',
            },
            outcome: {
              patient: { en: 'A case manager calls weekly.', zh: '个案管理员每周来电。' },
              caregiver: { en: 'You have a hotline that works.', zh: '你手上有一条真正能用的热线。' },
              staff: { en: 'NEHR populated.', zh: 'NEHR记录已更新。' },
            },
          },
          {
            id: 'imh-soc-only',
            label: { en: 'IMH SOC only; no community team.', zh: '仅安排IMH专科门诊;没有社区团队。' },
            score: 5,
            rationale: {
              en: 'Misses the relapse-prevention benefit of assertive outreach.',
              zh: '错过主动式外展在防复发上的获益。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: {
              en: 'Discharge to GP only with phone numbers.',
              zh: '仅转介家庭医生并附几张电话单。',
            },
            score: -6,
            rationale: {
              en: 'High relapse risk; first-episode psychosis benefits from intensive specialist follow-up for ≥2 years.',
              zh: '复发风险高;首次精神病发作受惠于至少两年的密集专科随访。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Relapse within 6 months.', zh: '6个月内复发。' },
            },
          },
        ],
      },
    },
  ],
};
