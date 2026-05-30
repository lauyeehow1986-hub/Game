import type { CaseDefinition } from '../../lib/types';

const MINDLINE_1771 = {
  label: { en: 'National Mindline 1771 (live 18 Jun 2025)', zh: '全国心理卫生热线Mindline 1771(2025年6月18日启用)' },
  body: {
    en: 'Singapore\'s 24/7 national mental-health helpline — call, WhatsApp, or webchat, staffed by trained counsellors. Replaced the IMH Mental Health Helpline (6389-2222). First point of contact for distress that is not an immediate life-threat (for which 995 / nearest ED applies).',
    zh: '新加坡24小时全国心理卫生热线 — 可电话、WhatsApp或网络聊天,由受训辅导员接听。取代了IMH心理健康热线(6389-2222)。非即时危及生命的困扰的首个联系点(如即时危及生命则拨995或就近急诊)。',
  },
};

const TIERED_CARE = {
  label: { en: 'National Mental Health Office — Tiered Care Model', zh: '全国心理卫生办公室 — 分层照护模式' },
  body: {
    en: 'Severity-based routing: self-help / peer support → community providers (CMHTs, polyclinic / Healthier-SG GP mental-health services, FSCs) → IMH and tertiary care. Most distress is managed in the community; reserve IMH for higher acuity.',
    zh: '按严重程度分流:自助 / 同伴支持 → 社区服务(社区心理卫生团队、综合诊疗所 / Healthier SG家庭医生心理服务、家庭服务中心)→ IMH及三级照护。多数困扰在社区处理;IMH留给较高急性度者。',
  },
};

const HEALTHIER_SG_YOUTH = {
  label: { en: 'Healthier SG + ComLink+ (ages 25-39 from 2027)', zh: 'Healthier SG + ComLink+(2027年起涵盖25-39岁)' },
  body: {
    en: 'From 2027 Healthier SG extends to ComLink+ residents aged 25-39: fully subsidised health plan, polyclinic-priced chronic medications, free screening / vaccines, and health points. Enrolling a distressed young adult with a regular GP builds continuity and a single coordinating clinician.',
    zh: '2027年起Healthier SG涵盖25-39岁ComLink+居民:全额资助健康计划、综合诊疗所价格的慢性病药物、免费筛查 / 疫苗及健康积分。为陷入困扰的年轻人登记固定家庭医生可建立连续性与单一协调医生。',
  },
};

export const mindlineYoungAdultCase: CaseDefinition = {
  id: 'mindline-young-adult',
  title: {
    en: 'Young adult in distress — Mindline 1771 → Tiered Care',
    zh: '陷入困扰的年轻人 — Mindline 1771 → 分层照护',
  },
  blurb: {
    en: 'Ms Nurul, 28, was retrenched three weeks ago. Sleepless, tearful, withdrawn; tonight she messages a friend "what\'s the point". The friend stays on the line and helps her reach out for help at 11pm.',
    zh: 'Nurul女士,28岁,三周前被裁员。失眠、流泪、退缩;今晚她传讯息给朋友说"还有什么意义"。朋友守在电话另一端,在晚上11点帮她寻求协助。',
  },
  category: 'outpatient',
  primaryFacility: 'imh',
  involvedFacilities: ['home', 'nhgp-amk', 'imh'],
  profileKey: 'youngAdult',
  allowsWardChoice: false,
  guidelines: [MINDLINE_1771, TIERED_CARE, HEALTHIER_SG_YOUTH],
  pathway: [
    {
      id: 'first-contact',
      department: 'consult-room',
      facility: 'home',
      durationMin: 30,
      costSGD: 0,
      charge: 'polyclinic',
      framing: {
        patient: {
          en: 'It is late and your chest feels tight. Your friend asks if you would talk to someone right now — not the hospital, just someone who listens.',
          zh: '夜深了,你觉得胸口发紧。朋友问你愿不愿意现在跟人聊聊 — 不是去医院,只是找个会倾听的人。',
        },
        caregiver: {
          en: 'You are the friend. You are scared. You do not want to overreact, but "what\'s the point" frightened you.',
          zh: '你是那位朋友。你很害怕。你不想反应过度,但"还有什么意义"这句话吓到了你。',
        },
        staff: {
          en: 'No stated plan or means, no immediate life-threat described — this is distress needing a warm, accessible first contact, not necessarily an ED.',
          zh: '未述明计划或手段,未描述即时生命威胁 — 这是需要温暖、可及的首个联系点的困扰,未必需要急诊。',
        },
      },
      decision: {
        id: 'route-first-contact',
        prompt: {
          en: 'Best first point of contact tonight?',
          zh: '今晚最佳的首个联系点?',
        },
        reference: MINDLINE_1771,
        weight: 1.5,
        options: [
          {
            id: 'mindline',
            label: {
              en: 'National Mindline 1771 — call / WhatsApp / webchat, 24/7 trained counsellors; stay with her while she connects.',
              zh: '全国心理卫生热线Mindline 1771 — 电话 / WhatsApp / 网络聊天,24小时受训辅导员;陪她直到接通。',
            },
            score: 10,
            rationale: {
              en: 'Right tier: accessible, 24/7, non-stigmatising first contact for distress without immediate life-threat. Friend staying on the line is protective.',
              zh: '正确层级:可及、24小时、无污名化,适合无即时生命威胁的困扰首个联系点。朋友守线具保护作用。',
            },
            effects: { setFlags: ['mindline-engaged'] },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'ed-now',
            label: {
              en: 'Send her to the nearest ED immediately by ambulance.',
              zh: '立即叫救护车送她到最近的急诊。',
            },
            score: 4,
            rationale: {
              en: 'Not wrong if acute risk is high, but with no stated plan/means an ED at 11pm can be over-medicalising and off-putting; Tiered Care favours a community first contact here.',
              zh: '若急性风险高并非错误;但在无计划/手段时,深夜急诊可能过度医疗化且令人却步;此处分层照护倾向社区首个联系点。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'wait-morning',
            label: {
              en: 'Tell her to sleep and see how she feels in the morning.',
              zh: '叫她先睡,看早上感觉如何。',
            },
            score: -4,
            rationale: {
              en: 'Dismissive of an expressed hopelessness statement; misses the window for support and safety planning.',
              zh: '忽视已表达的绝望陈述;错失支持与安全计划的时机。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'triage-tier',
      department: 'consult-room',
      facility: 'home',
      durationMin: 40,
      costSGD: 0,
      charge: 'polyclinic',
      framing: {
        patient: {
          en: 'The counsellor is calm and unhurried. You talk for forty minutes. They ask careful questions about safety and what tomorrow could look like.',
          zh: '辅导员平和而不急躁。你们聊了四十分钟。他们小心地询问安全状况以及明天可以是什么样子。',
        },
        caregiver: {
          en: 'You hear her voice soften. The counsellor asks to speak with you briefly about how to help overnight.',
          zh: '你听到她的声音柔和下来。辅导员请你简短交谈,商量如何在夜间帮忙。',
        },
        staff: {
          en: 'Mindline counsellor: no immediate plan/intent, distress + situational stressor (retrenchment). Tiered Care → route to community / primary-care mental-health, not IMH.',
          zh: 'Mindline辅导员:无即时计划 / 意图,困扰+情境性压力源(裁员)。分层照护 → 分流至社区 / 基层心理服务,而非IMH。',
        },
      },
      decision: {
        id: 'tier-routing',
        prompt: {
          en: 'Where should follow-up be routed under the Tiered Care Model?',
          zh: '在分层照护模式下,随访应分流到哪里?',
        },
        reference: TIERED_CARE,
        weight: 1.5,
        options: [
          {
            id: 'community-primary',
            label: {
              en: 'Polyclinic / Healthier-SG GP mental-health service + a Community Mental Health Team / FSC for practical + emotional support; safety plan; follow-up call from Mindline.',
              zh: '综合诊疗所 / Healthier SG家庭医生心理服务 + 社区心理卫生团队 / 家庭服务中心提供实际与情绪支持;安全计划;Mindline回访。',
            },
            score: 10,
            rationale: {
              en: 'Matches acuity to the right tier; keeps her in the community with coordinated primary-care + psychosocial support. Retrenchment needs practical help (FSC, employment) alongside mood support.',
              zh: '将急性度匹配到正确层级;让她留在社区,获得协调的基层照护与社会心理支持。裁员需要实际帮助(家庭服务中心、就业)与情绪支持并行。',
            },
            effects: { setFlags: ['community-routed'] },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'imh-direct',
            label: {
              en: 'Refer directly to IMH specialist outpatient for all follow-up.',
              zh: '直接转介IMH专科门诊负责全部随访。',
            },
            score: 3,
            rationale: {
              en: 'Over-tiered for situational distress without high acuity; consumes scarce specialist capacity and can feel stigmatising. Escalate to IMH only if she deteriorates.',
              zh: '对无高急性度的情境性困扰而言层级过高;占用稀缺专科资源且可能令人感到污名化。仅在恶化时升级至IMH。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-followup',
            label: {
              en: 'End the call with hotline numbers only; no scheduled follow-up.',
              zh: '只给热线号码就结束通话;不安排随访。',
            },
            score: -3,
            rationale: {
              en: 'A single call without warm handover risks her falling through the gap. Tiered Care expects active linkage to the next tier.',
              zh: '仅一通电话而无热情交接,可能让她从缝隙中漏掉。分层照护要求主动衔接到下一层级。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'continuity',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 30,
      costSGD: 18,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 5, sleepDebt: 3 },
      framing: {
        patient: {
          en: 'A week later you see a polyclinic doctor who already has the Mindline summary. They ask if you would like one regular doctor to coordinate your care.',
          zh: '一周后你见了综合诊疗所的医生,他已收到Mindline的摘要。医生问你是否想要一位固定医生来协调你的照护。',
        },
        caregiver: {
          en: 'You came along. It helps that the doctor already knows the story and you do not have to retell the worst night.',
          zh: '你陪她来。医生已了解经过,你们不必重述那个最糟的夜晚,这让人安心。',
        },
        staff: {
          en: 'Polyclinic FP: situational depression-spectrum distress, improving. Continuity + psychosocial linkage matter more than immediate pharmacotherapy.',
          zh: '综合诊疗所家庭医生:情境性抑郁谱系困扰,正在好转。连续性与社会心理衔接比立即药物治疗更重要。',
        },
      },
      decision: {
        id: 'continuity-plan',
        prompt: {
          en: 'Best continuity plan?',
          zh: '最佳连续性计划?',
        },
        reference: HEALTHIER_SG_YOUTH,
        weight: 1,
        options: [
          {
            id: 'healthier-sg-enrol',
            label: {
              en: 'Enrol with this Healthier-SG GP for continuity; brief psychological intervention + FSC employment support; review in 2 weeks; safety-net with Mindline 1771.',
              zh: '在这位Healthier SG家庭医生处登记以建立连续性;简短心理干预 + 家庭服务中心就业支持;2周复诊;以Mindline 1771作安全网。',
            },
            score: 10,
            rationale: {
              en: 'One coordinating clinician + psychosocial support is the right-sited plan. From 2027 Healthier SG extends to ages 25-39 (ComLink+), strengthening exactly this continuity.',
              zh: '一位协调医生 + 社会心理支持是正确分流的方案。2027年起Healthier SG涵盖25-39岁(ComLink+),正强化这种连续性。',
            },
            outcome: {
              patient: { en: 'You leave with one doctor\'s name and a next appointment.', zh: '你带着一位医生的名字和下次预约离开。' },
              caregiver: { en: 'You exhale for the first time in weeks.', zh: '你几周来第一次松了口气。' },
              staff: { en: 'Enrolled; FSC referral sent.', zh: '已登记;已发出家庭服务中心转介。' },
            },
          },
          {
            id: 'antidepressant-only',
            label: {
              en: 'Start an antidepressant and discharge with no scheduled review.',
              zh: '开始抗抑郁药,不安排复诊即出院。',
            },
            score: 2,
            rationale: {
              en: 'Pharmacotherapy may have a role, but without follow-up or psychosocial support it misses the situational driver and the continuity that matters most here.',
              zh: '药物治疗可能有作用,但无随访或社会心理支持会忽略情境性诱因以及此处最重要的连续性。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-self',
            label: {
              en: 'Reassure and discharge; she can re-book if she feels worse.',
              zh: '安抚后让她出院;若变差可自行再预约。',
            },
            score: -2,
            rationale: {
              en: 'Passive disposition loses the chance to build continuity at the moment she is engaged and receptive.',
              zh: '被动处置错失在她愿意参与、接受度高时建立连续性的机会。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
