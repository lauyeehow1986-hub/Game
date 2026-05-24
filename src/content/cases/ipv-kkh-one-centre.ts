import type { CaseDefinition } from '../../lib/types';

const ONE_KKH = {
  label: { en: 'KKH One Centre for Specialised Sexual Care', zh: 'KKH一站式性暴力专门照护中心(One Centre)' },
  body: {
    en: 'Singapore\'s one-stop centre for survivors of sexual assault and intimate-partner violence: clinical assessment, forensic medical examination, counselling, social-work and police liaison co-located 24/7.',
    zh: '新加坡为性侵与亲密关系暴力幸存者设立的一站式中心:临床评估、法医检查、辅导、社工与警方联络24小时同地集中提供。',
  },
};

const WCRP = {
  label: { en: 'Women\'s Charter Part VII — Personal Protection Orders', zh: '《妇女宪章》第七部 — 人身保护令' },
  body: {
    en: 'Family Justice Courts grant Personal Protection Orders (PPO), Domestic Exclusion Orders (DEO) and Counselling Orders (CGO) to protect family members from violence. Police can issue an Emergency Order on the spot.',
    zh: '家事法庭可签发人身保护令(PPO)、住家禁制令(DEO)及强制辅导令(CGO),以保护家庭成员免受暴力侵害。警方可在现场签发紧急保护令。',
  },
};

const HEARS = {
  label: { en: 'MOH HEARS framework on family violence', zh: '卫生部 HEARS 家庭暴力沟通框架' },
  body: {
    en: 'How clinicians should ask, listen, document, signpost, and follow up when intimate-partner violence is suspected. Confidentiality, autonomy, safety planning.',
    zh: '当怀疑亲密关系暴力时,医师该如何询问、倾听、记录、指引及随访的方法。强调保密、自主、安全计划。',
  },
};

const PAVE_AWARE = {
  label: { en: 'PAVe + AWARE Helpline + NAVH 1800-777-0000', zh: 'PAVe + AWARE 热线 + 全国反暴力热线 NAVH 1800-777-0000' },
  body: {
    en: 'PAVe (Promoting Alternatives to Violence) and AWARE provide counselling, court-support and safe-house referral. National Anti-Violence Helpline 1800-777-0000 is 24/7.',
    zh: 'PAVe(推动非暴力替代方案)与AWARE提供辅导、出庭支持及庇护所转介。全国反暴力热线1800-777-0000 24小时运作。',
  },
};

export const ipvDisclosureCase: CaseDefinition = {
  id: 'ipv-kkh-one-centre',
  title: {
    en: 'Suspected intimate-partner violence — CHAS GP → KKH One Centre',
    zh: '疑似亲密关系暴力 — CHAS诊所 → KKH一站式中心',
  },
  blurb: {
    en: 'Ms Tan, 32, returns for a third visit in eight weeks with non-specific headaches, sleep difficulty, and a "clumsy bruise" over her left zygoma. Husband waits in the car. She seems guarded but stays back to fill a form.',
    zh: '陈小姐,32岁。八周内第三次就诊,主诉非特异性头痛、睡眠困难,以及左颧骨上方的"不小心撞到的瘀伤"。先生在车上等。她神情戒备,但还是留下来填一张表。',
  },
  category: 'outpatient',
  primaryFacility: 'gp-healthway',
  involvedFacilities: ['gp-healthway', 'kkh', 'home'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [HEARS, ONE_KKH, WCRP, PAVE_AWARE],
  pathway: [
    {
      id: 'gp-encounter',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 15,
      costSGD: 65,
      charge: 'polyclinic',
      framing: {
        patient: {
          en: 'You don\'t want to keep coming. You don\'t want him to know.',
          zh: '你不想再三番两次跑医生。你也不想让他知道。',
        },
        caregiver: {
          en: '(A 7-year-old daughter sits quietly outside.)',
          zh: '(7岁的女儿安静地坐在外面。)',
        },
        staff: {
          en: 'Third visit. Vague somatic complaints, healing bruise, weight loss, flat affect. Husband loitering.',
          zh: '第三次就诊。模糊的躯体不适、正在消退的瘀伤、体重下降、情感平淡。先生在门外徘徊。',
        },
      },
      decision: {
        id: 'open-the-conversation',
        prompt: { en: 'How do you raise the topic?', zh: '该如何开口提起这个话题?' },
        weight: 1.5,
        reference: HEARS,
        options: [
          {
            id: 'private-direct',
            label: {
              en: 'Ask the nurse to take husband for a "form" outside; in the closed room ask directly and gently: "Sometimes injuries like this happen because someone at home hurts us. Is anyone hurting you?"',
              zh: '请护士以"填表"为由把先生请到门外;在关好门的诊间里温和而直接地问:"这种伤有时候是家里有人伤害我们造成的。有人在伤害你吗?"',
            },
            score: 10,
            rationale: {
              en: 'HEARS framework: H = Have privacy, E = Express concern, A = Ask directly, R = Respect autonomy, S = Safety plan. Direct, private, non-judgmental questioning is more effective than oblique hints.',
              zh: 'HEARS框架:H = 创造私密空间、E = 表达关心、A = 直接提问、R = 尊重自主、S = 安全计划。直接、私密、不评判的提问比含糊暗示更有效。',
            },
            outcome: {
              patient: {
                en: '(quiet for a long moment. Then nods.)',
                zh: '(沉默了很久。然后点了头。)',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Disclosure achieved; husband is in the lobby; she is safe in this room.',
                zh: '成功取得披露;先生在大堂;她在这间诊室里是安全的。',
              },
            },
            effects: { setFlags: ['disclosure-made'] },
          },
          {
            id: 'oblique-hint',
            label: {
              en: 'Ask vague questions: "Are things stressful at home?" — let her bring it up if she wants.',
              zh: '问含糊的问题:"家里压力大吗?" — 让她自己愿意提就提。',
            },
            score: 4,
            rationale: {
              en: 'Better than nothing, but vague questions reliably under-detect. Survivors interpret indirect questions as the clinician not wanting to know.',
              zh: '比什么都不问好,但含糊提问明显低估检出率。幸存者会把间接问句理解为"医生其实并不想知道"。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Patient deflects.', zh: '患者岔开话题。' },
            },
          },
          {
            id: 'ask-in-front',
            label: {
              en: 'Ask in front of the husband — "you two look stressed; what\'s going on at home?" — so he hears the concern.',
              zh: '当着先生的面问 — "你们两个看起来很紧张,家里发生了什么?" — 让他也听到关心。',
            },
            score: -10,
            rationale: {
              en: 'Disclosure in front of an abuser endangers the survivor. Never ask in front of a partner.',
              zh: '在施暴者面前披露会让幸存者陷入危险。绝不可在伴侣面前提问。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['unsafe-question'] },
          },
          {
            id: 'no-questions',
            label: {
              en: 'Treat the headache; prescribe an analgesic; review in 4 weeks.',
              zh: '处理头痛,开止痛药,4周后复诊。',
            },
            score: -4,
            rationale: {
              en: 'Missed opportunity. Repeated somatic presentation + injury + controlling-partner cues is a high-yield IPV screen.',
              zh: '错过机会。反复躯体不适 + 外伤 + 控制型伴侣的迹象 — 在IPV筛查中阳性率高。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'referral-pathway',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 20,
      requiresAnyFlag: ['disclosure-made'],
      framing: {
        patient: {
          en: 'She asks: "What happens now? He\'s outside."',
          zh: '她问:"现在怎么办?他就在外面。"',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Disclosure made. Plan referral while she\'s still in the building.',
          zh: '已取得披露。趁她还在诊所内规划转介。',
        },
      },
      decision: {
        id: 'where-to-refer',
        prompt: { en: 'Where do you direct her?', zh: '把她引导到哪里?' },
        weight: 1.5,
        reference: ONE_KKH,
        options: [
          {
            id: 'one-centre-now',
            label: {
              en: 'Call KKH One Centre on the direct line; arrange same-day transfer; offer the centre\'s number 6394-2466 and the National Anti-Violence Helpline 1800-777-0000.',
              zh: '拨打KKH一站式中心专线;安排当日转介;给她中心电话6394-2466与全国反暴力热线1800-777-0000。',
            },
            score: 10,
            rationale: {
              en: 'One Centre co-locates clinical, forensic, counselling, social-work and police liaison so the survivor doesn\'t have to retell the story across multiple agencies. Same-day momentum matters.',
              zh: '一站式中心在同一处集中提供临床、法医、辅导、社工与警方联络,幸存者无需在多个机构反复讲述。当日的"势头"很关键。',
            },
            outcome: {
              patient: {
                en: 'She memorises both numbers, repeats them back.',
                zh: '她把两个号码背下来,复述一遍。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'One Centre confirms — they\'ll see her this afternoon.',
                zh: '一站式中心确认 — 今天下午接见她。',
              },
            },
            effects: { setFlags: ['referred-to-one-centre'] },
          },
          {
            id: 'call-police-now',
            label: {
              en: 'Insist on calling the police immediately from the clinic.',
              zh: '坚持立即从诊所报警。',
            },
            score: 3,
            rationale: {
              en: 'Survivor autonomy: many will not be ready, and forcing police involvement can drive her back into hiding. Police can be involved later via One Centre. The exception is imminent danger — assess case-by-case.',
              zh: '幸存者的自主权:许多人尚未准备好,强行报警会让她重新封闭。日后可通过一站式中心介入警方。例外是迫切危险 — 须逐案评估。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'polyclinic-followup',
            label: {
              en: 'Refer to polyclinic for follow-up in a week.',
              zh: '转介综合诊疗所一周后跟进。',
            },
            score: -2,
            rationale: {
              en: 'Polyclinic isn\'t the right venue for IPV care. Loses the One Centre advantage of integrated services.',
              zh: '综合诊疗所并非IPV照护的合适场所;失去一站式中心的整合服务优势。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'send-home-think',
            label: {
              en: '"Go home, think about it, come back if it gets worse."',
              zh: '"先回家想一想,如果变严重再来。"',
            },
            score: -8,
            rationale: {
              en: 'Survivors who disclose and then are sent home without a plan face higher risk; the abuser often escalates after suspected disclosure.',
              zh: '披露之后未带方案就回家的幸存者风险更高;施暴者在察觉披露后常会升级行为。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'documentation',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 10,
      requiresAnyFlag: ['disclosure-made'],
      framing: {
        patient: { en: '', zh: '' },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'You document the encounter. What ends up in the record matters legally.',
          zh: '你记录这次就诊。写进病历的内容在法律上至关重要。',
        },
      },
      decision: {
        id: 'how-to-document',
        prompt: { en: 'Documentation approach?', zh: '记录方式?' },
        weight: 1.2,
        reference: HEARS,
        options: [
          {
            id: 'verbatim-photo-consent',
            label: {
              en: 'Verbatim quotes ("he hit me with the remote") + body diagram + photographs with explicit written consent; record her safety wishes; flag confidential.',
              zh: '原句直引("他用遥控器打我")+ 身体示意图 + 经明确书面同意的照片;记录她的安全意愿;病历标注保密。',
            },
            score: 10,
            rationale: {
              en: 'Forensic-quality documentation in your own words doesn\'t require police; survivor-led photography is consented; verbatim quotes are admissible. Keep the chart confidential — husband may read HealthHub.',
              zh: '具法医质量的自留记录无需警方介入;由幸存者主导且经同意的拍照才合规;原句直引在法庭可采信。病历务必标注保密 — 先生可能查看HealthHub。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'A clean, defensible record.', zh: '一份干净、经得起检视的记录。' },
            },
          },
          {
            id: 'minimal-coded',
            label: {
              en: 'A coded one-liner: "Possible domestic conflict. Refer KKH."',
              zh: '一句隐晦的话:"疑似家庭纠纷,转介KKH。"',
            },
            score: 3,
            rationale: {
              en: 'Protects from prying eyes but loses the forensic value if she ever pursues a PPO.',
              zh: '能避免被窥见,但若她日后申请PPO就失去法医价值。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'paraphrased-no-photo',
            label: {
              en: 'Paraphrase the patient\'s account in clinical language; no photographs.',
              zh: '用临床语言转述患者的描述;不拍照。',
            },
            score: 4,
            rationale: { en: 'Reasonable but weaker than verbatim + photos.', zh: '合理,但弱于"原句直引 + 照片"。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'photo-without-consent',
            label: {
              en: 'Photograph injuries without explicit consent — "for the record".',
              zh: '未经明确同意就拍下伤痕 — "存档用"。',
            },
            score: -8,
            rationale: {
              en: 'Consent is non-negotiable. Photos without consent breach autonomy and may not be admissible.',
              zh: '同意不可妥协。未经同意的照片侵犯自主,且可能不被采信。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'one-centre-assessment',
      department: 'soc',
      facility: 'kkh',
      durationMin: 90,
      costSGD: 0,
      charge: 'soc',
      requiresAnyFlag: ['referred-to-one-centre'],
      framing: {
        patient: {
          en: 'A private room with a soft chair. A social worker brings tea.',
          zh: '一间私密的房间,坐椅柔软。社工端来一杯茶。',
        },
        caregiver: {
          en: '(A children\'s play corner holds her daughter\'s attention.)',
          zh: '(一处儿童游戏角吸引住她女儿的注意。)',
        },
        staff: {
          en: 'One Centre assessment: clinical + forensic + social work + police liaison + counselling under one roof.',
          zh: '一站式中心评估:临床 + 法医 + 社工 + 警方联络 + 辅导,集中于同一屋檐下。',
        },
      },
      decision: {
        id: 'safety-plan',
        prompt: { en: 'Plan the next 72 hours?', zh: '接下来72小时的安全计划?' },
        weight: 1.3,
        reference: WCRP,
        options: [
          {
            id: 'multilayered-safety',
            label: {
              en: 'Safety plan: emergency bag at a friend\'s; PAVe shelter on standby; PPO discussion with the One Centre lawyer; coded phrase with her sister; school informed of the daughter\'s pickup list.',
              zh: '安全计划:在朋友家放一只应急包;PAVe庇护所待命;与一站式中心律师讨论PPO;与姐姐约定暗号;通知学校女儿的接送名单。',
            },
            score: 10,
            rationale: {
              en: 'Layered safety planning around the most-dangerous post-disclosure window is the standard of care. PPO is her option, not imposed.',
              zh: '在披露后最危险的窗口里采取多层次安全计划是标准照护。PPO是她的选项,不应强加。',
            },
            outcome: {
              patient: { en: 'She rehearses the coded phrase quietly.', zh: '她在嘴里轻轻地把暗号背了一遍。' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Multidisciplinary plan signed off.', zh: '多学科方案已确认。' },
            },
            effects: { setFlags: ['safety-plan-in-place'] },
          },
          {
            id: 'go-home-warn',
            label: {
              en: 'Send her home with the One Centre number and a leaflet.',
              zh: '给她一张一站式中心的电话和一张传单,让她回家。',
            },
            score: -2,
            rationale: {
              en: 'A leaflet is not a safety plan. The post-disclosure window is the highest-risk period.',
              zh: '一张传单不是安全计划。披露后的窗口是风险最高的时段。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'force-shelter',
            label: {
              en: 'Insist she goes straight to a women\'s shelter tonight against her wishes.',
              zh: '不顾她的意愿,强求她今晚就住进女性庇护所。',
            },
            score: 3,
            rationale: {
              en: 'Survivor autonomy matters; forced placement can backfire. Offer it as an option, respect her decision unless a child is in imminent danger.',
              zh: '幸存者的自主权很重要;强行安置可能适得其反。把庇护所作为选项提供,尊重她的决定 — 除非孩子面临迫切危险。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'six-week-followup',
      department: 'soc',
      facility: 'kkh',
      durationMin: 45,
      costSGD: 0,
      charge: 'soc',
      requiresAnyFlag: ['safety-plan-in-place'],
      framing: {
        patient: {
          en: 'Six weeks later. She came alone. She filed a PPO last Tuesday.',
          zh: '六周后。她自己一个人来。上周二刚申请了PPO。',
        },
        caregiver: {
          en: 'Her sister picks the daughter up from school now.',
          zh: '现在改由姐姐去学校接女儿。',
        },
        staff: {
          en: 'Follow-up: stable, sleeping better, attending PAVe counselling group.',
          zh: '随访:情况稳定,睡眠改善,持续参加PAVe辅导小组。',
        },
      },
      decision: {
        id: 'long-term',
        prompt: { en: 'Long-term plan?', zh: '长期方案?' },
        weight: 1,
        reference: PAVE_AWARE,
        options: [
          {
            id: 'integrated-continuation',
            label: {
              en: 'Continue PAVe counselling + KKH follow-up at 3 months + GP for chronic somatic symptoms + AIC family-violence subsidy for legal aid + check on the daughter via FAM@FSC.',
              zh: '继续PAVe辅导 + 3个月后KKH复查 + 家庭医生处理慢性躯体症状 + 通过AIC家庭暴力津贴申请法律援助 + 透过FAM@FSC关心女儿。',
            },
            score: 10,
            rationale: {
              en: 'Recovery is months-to-years. Multidisciplinary continuity (medical + psychological + legal + social + child) is what works.',
              zh: '恢复需要数月乃至数年。多学科连续照护(医疗 + 心理 + 法律 + 社会 + 儿童)才有效。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'NEHR updated; flagged confidential.', zh: 'NEHR已更新;标记为保密。' },
            },
          },
          {
            id: 'discharge-resolved',
            label: {
              en: 'Discharge — case is "resolved" since the PPO is filed.',
              zh: '结案 — 既然PPO已申请,案件"已解决"。',
            },
            score: -3,
            rationale: {
              en: 'IPV care doesn\'t end at the PPO. Most survivors need ongoing support.',
              zh: 'IPV照护并非以PPO为终点。多数幸存者仍需持续支持。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'meds-only',
            label: {
              en: 'Prescribe an SSRI; stop everything else.',
              zh: '开SSRI,其余全部停。',
            },
            score: 1,
            rationale: {
              en: 'May help anxiety/PTSD but not a substitute for trauma-informed therapy + social support.',
              zh: '或可缓解焦虑/PTSD,但不能取代创伤知情治疗 + 社会支持。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
