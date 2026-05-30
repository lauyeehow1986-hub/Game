import type { CaseDefinition } from '../../lib/types';

const AGE_WELL_SG = {
  label: { en: 'Age Well SG (S$3.5B / 10 yr)', zh: 'Age Well SG(100亿新元 / 10年的健康老龄计划)' },
  body: {
    en: 'National programme to help seniors age in place: Active Ageing Centres scaling to 220 by 2025, Age Well Neighbourhoods from 2026, wireless alert alarms in rental flats with seniors, and a single comprehensive long-term-care assessment from Apr 2026.',
    zh: '帮助长者在地安老的国家计划:活跃乐龄中心到2025年增至220间,2026年起设乐龄邻里,为有长者的租赁组屋安装无线警报器,并于2026年4月起采用单一综合长期照护评估。',
  },
};

const HPC_PLUS = {
  label: { en: 'HPC+ (Enhanced Home Personal Care)', zh: 'HPC+(增强型居家个人照护)' },
  body: {
    en: 'Home Personal Care with 24/7 remote fall monitoring, rolling out island-wide by end-2025; eligible-senior enrolment from 1 Apr 2026. Bundles personal care + light nursing + monitoring so a frail senior living alone can stay home safely.',
    zh: '附24小时远程跌倒监测的居家个人照护,2025年底前全岛推行;合资格长者自2026年4月1日起登记。整合个人照护+轻度护理+监测,让独居体弱长者安全居家。',
  },
};

const AIC = {
  label: { en: 'AIC care coordination + caregiver support', zh: '整合护理机构(AIC)护理协调 + 照护者支持' },
  body: {
    en: 'The Agency for Integrated Care coordinates community / home-care, the Home Caregiving Grant (S$400/mo), Caregivers Training Grant, and links to Active Ageing Centres. Single comprehensive LTC assessment determines eligibility from Apr 2026.',
    zh: '整合护理机构协调社区 / 居家照护、居家护理补助(每月400新元)、照护者培训补助,并衔接活跃乐龄中心。2026年4月起以单一综合长期照护评估确定资格。',
  },
};

export const ageWellHpcCase: CaseDefinition = {
  id: 'agewell-hpc',
  title: {
    en: 'Frailty + falls — Age Well SG, HPC+ and ageing in place',
    zh: '体弱与跌倒 — Age Well SG、HPC+与在地安老',
  },
  blurb: {
    en: 'Mdm Chua, 79, lives alone in a rental flat (wireless alert alarm fitted in 2025). Pioneer Generation, early dementia, two falls this year. Today her befriender finds her on the floor; the alarm had already alerted. She is brought to KTPH ED.',
    zh: 'Chua女士,79岁,独居于租赁组屋(2025年已装无线警报器)。建国一代、早期失智,今年已跌倒两次。今天义务探访者发现她倒在地上;警报器已先发出警示。她被送往KTPH急诊。',
  },
  category: 'outpatient',
  primaryFacility: 'ktph',
  involvedFacilities: ['home', 'ktph'],
  profileKey: 'frailSenior',
  allowsWardChoice: false,
  guidelines: [AGE_WELL_SG, HPC_PLUS, AIC],
  pathway: [
    {
      id: 'ed-assess',
      department: 'ed',
      facility: 'ktph',
      durationMin: 120,
      costSGD: 130,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'Bright lights, many questions. Nothing is broken, they say, but you cannot remember if you ate today. You want to go home.',
          zh: '灯光刺眼,问题很多。他们说没骨折,但你记不起今天有没有吃饭。你想回家。',
        },
        caregiver: {
          en: 'You are the befriender. You worry she cannot keep living alone, but you know she dreads a nursing home.',
          zh: '你是义务探访者。你担心她无法继续独居,但你知道她很怕住进疗养院。',
        },
        staff: {
          en: 'No fracture on X-ray. Frailty, early dementia, recurrent falls, lives alone. The acute issue is small; the function + safety issue is large.',
          zh: 'X光无骨折。体弱、早期失智、反复跌倒、独居。急性问题不大;功能与安全问题很大。',
        },
      },
      decision: {
        id: 'disposition',
        prompt: {
          en: 'No acute injury. Disposition for a frail senior who lives alone and wants to go home?',
          zh: '无急性损伤。对一位独居、想回家的体弱长者,如何处置?',
        },
        reference: AGE_WELL_SG,
        weight: 1.5,
        options: [
          {
            id: 'comprehensive-geriatric',
            label: {
              en: 'Comprehensive geriatric assessment + falls workup; refer to AIC for a single comprehensive LTC assessment; plan supported discharge home.',
              zh: '综合老年评估 + 跌倒检查;转介AIC做单一综合长期照护评估;规划有支持的居家出院。',
            },
            score: 10,
            rationale: {
              en: 'Falls + frailty + cognition need a structured assessment, not just "medically cleared". Age Well SG / AIC route enables ageing in place with the right supports.',
              zh: '跌倒+体弱+认知需要结构化评估,而非仅"医学上无碍"。Age Well SG / AIC路径可在适当支持下实现在地安老。',
            },
            effects: { setFlags: ['cga-done'] },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'admit-social',
            label: {
              en: 'Admit to an acute ward indefinitely until a nursing-home bed is found.',
              zh: '收入急性病房,无限期等到有疗养院床位。',
            },
            score: 2,
            rationale: {
              en: 'A social admission to an acute bed risks deconditioning and delirium, blocks acute capacity, and pre-empts her wish to age in place before alternatives are explored.',
              zh: '为社会因素占用急性床位有失能与谵妄风险,占用急性资源,且在探索替代方案前就否定了她在地安老的意愿。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-bare',
            label: {
              en: 'Discharge home now with a falls leaflet; no services arranged.',
              zh: '现在就让她带着跌倒须知出院;不安排任何服务。',
            },
            score: -4,
            rationale: {
              en: 'A bare discharge of a frail senior who lives alone after a fall predicts rapid re-presentation and injury. Services must be arranged before she goes home.',
              zh: '跌倒后让独居体弱长者空手出院,预示快速复诊与受伤。回家前必须先安排服务。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'home-package',
      department: 'discharge',
      facility: 'ktph',
      durationMin: 60,
      costSGD: 0,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 5, sleepDebt: 3 },
      framing: {
        patient: {
          en: 'They talk about someone coming to help at home, and a button you can press. You like that you would not have to leave your flat.',
          zh: '他们谈到会有人到家里帮忙,还有一个你可以按的按钮。你喜欢不必离开自己的组屋。',
        },
        caregiver: {
          en: 'A care coordinator explains HPC+ and a grant that helps with costs. It feels, for the first time, manageable.',
          zh: '一位护理协调员说明HPC+和一项帮补费用的补助。这第一次让人觉得应付得来。',
        },
        staff: {
          en: 'CGA done: home hazards, medication review, vision check. Plan ageing-in-place package matched to a frail PG senior living alone.',
          zh: '已完成综合老年评估:居家危险、用药审视、视力检查。为独居的建国一代体弱长者匹配在地安老配套。',
        },
      },
      decision: {
        id: 'home-care-package',
        prompt: {
          en: 'Build the ageing-in-place package?',
          zh: '如何搭建在地安老配套?',
        },
        reference: HPC_PLUS,
        weight: 1.5,
        options: [
          {
            id: 'hpc-plus-bundle',
            label: {
              en: 'HPC+ home personal care with 24/7 fall monitoring + Home Caregiving Grant + Active Ageing Centre enrolment + OT home-hazard fixes + medication review; keep the alert alarm.',
              zh: 'HPC+居家个人照护加24小时跌倒监测 + 居家护理补助 + 活跃乐龄中心登记 + 职能治疗师居家危险整改 + 用药审视;保留警报器。',
            },
            score: 10,
            rationale: {
              en: 'Layered Age Well SG supports let her stay home safely: monitoring catches falls, the grant offsets cost, the AAC reduces isolation, hazard fixes cut recurrence. This is the model the reforms are built for.',
              zh: '多层Age Well SG支持让她安全居家:监测可发现跌倒,补助抵消费用,乐龄中心减少孤立,危险整改降低复发。这正是改革所设计的模式。',
            },
            outcome: {
              patient: { en: 'You go home. Someone will visit tomorrow.', zh: '你回家了。明天会有人来探访。' },
              caregiver: { en: 'You program the new number into your phone.', zh: '你把新号码存进手机。' },
              staff: { en: 'HPC+ referral accepted; grant application filed.', zh: 'HPC+转介获接受;已提交补助申请。' },
            },
          },
          {
            id: 'family-only',
            label: {
              en: 'Discharge to family supervision only (daughter is overseas); revisit if problems.',
              zh: '仅交由家人看顾出院(女儿在海外);有问题再就诊。',
            },
            score: -2,
            rationale: {
              en: 'Her only family is overseas — "family supervision" is not real here. Without formal services she is back to square one.',
              zh: '她唯一的家人在海外 — 此处"家人看顾"并不存在。没有正式服务,她又回到原点。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'nursing-home-default',
            label: {
              en: 'Default to nursing-home placement as the safest option.',
              zh: '默认安排入住疗养院,视为最安全选项。',
            },
            score: 1,
            rationale: {
              en: 'Institutional care suits some, but defaulting to it against her wishes — before trying a supported home package — is neither person-centred nor aligned with Age Well SG\'s ageing-in-place intent.',
              zh: '机构照护适合部分人,但在未尝试有支持的居家配套前、违背其意愿地默认入住,既非以人为本,也不符合Age Well SG在地安老的宗旨。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
