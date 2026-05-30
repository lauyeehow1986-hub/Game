import type { CaseDefinition } from '../../lib/types';

const NICE_SH = {
  label: { en: 'NICE NG225 — Self-harm assessment, management & preventing recurrence', zh: 'NICE NG225 — 自伤评估、管理与预防复发' },
  body: {
    en: 'All people who self-harm should receive a psychosocial assessment by a mental-health professional. Compassionate, person-centred approach; risk assessment is one input, not a triage filter.',
    zh: '所有自伤患者都应由心理卫生专业人员完成社会心理评估。以人为本、富有同情心;风险评估只是其中一项输入,不应被当作分诊筛选工具。',
  },
};

const MHCTA = {
  label: { en: 'Mental Health (Care & Treatment) Act 2008 (as amended 1 Jan 2025)', zh: '心理卫生(照护与治疗)法令(2008年,2025年1月1日修订)' },
  body: {
    en: 'Singapore statute governing involuntary admission for assessment (up to 72 h) and treatment (up to 1 month, renewable). Designated medical practitioners sign Forms 1 / 2 / 3. To be used only when voluntary care is refused and risk to self / others is high. Since the 1 Jan 2025 amendment, police may apprehend a person believed to have a mental disorder where they are "reasonably likely" to cause harm — the previous "imminent danger" threshold was relaxed.',
    zh: '新加坡关于非自愿评估住院(至多72小时)与治疗(至多1个月,可续期)的法令。由指定医师签署表1 / 表2 / 表3。仅当患者拒绝自愿照护且对自身或他人有高风险时方可使用。2025年1月1日修订后,警方在认为疑似精神障碍者"有合理可能"造成伤害时即可拘留 — 此前的"迫切危险"门槛已放宽。',
  },
};

const PARACETAMOL_OD = {
  label: { en: 'MOH CPG + Rumack-Matthew — Paracetamol overdose', zh: '卫生部CPG + Rumack-Matthew列线图 — 扑热息痛过量' },
  body: {
    en: 'N-acetylcysteine (NAC) within 8 h of single ingestion is highly effective. Plot paracetamol level at 4 h post-ingestion on the Rumack-Matthew nomogram. Empirical NAC for staggered / unknown-time ingestions or massive doses.',
    zh: '单次摄入8小时内给予N-乙酰半胱氨酸(NAC)效果极佳。摄入后4小时血药浓度对照Rumack-Matthew列线图。多次或时间不明的摄入,或剂量过大,经验性给NAC。',
  },
};

const IMH_LIAISON = {
  label: { en: 'IMH C-L Psychiatry + Mobile Crisis Team', zh: 'IMH会诊联络精神科 + 流动危机团队' },
  body: {
    en: 'IMH Consultation-Liaison covers acute hospitals 24/7. Mobile Crisis Team can do community follow-up within 72 h of discharge. Critical for the high-risk early-discharge window.',
    zh: 'IMH会诊联络(C-L)精神科24小时覆盖急性医院。流动危机团队可在出院后72小时内提供社区随访。对高风险的早期出院窗口至关重要。',
  },
};

const MINDLINE_1771 = {
  label: { en: 'National Mindline 1771 + Tiered Care Model', zh: '全国心理卫生热线Mindline 1771 + 分层照护模式' },
  body: {
    en: 'National Mindline 1771 (live 18 Jun 2025) is Singapore\'s 24/7 mental-health helpline — call, WhatsApp, or webchat, staffed by trained counsellors. It replaced the IMH Mental Health Helpline (6389-2222). The National Mental Health Office\'s Tiered Care Model routes callers to self-help, community providers, or IMH/tertiary care by severity.',
    zh: '全国心理卫生热线Mindline 1771(2025年6月18日启用)是新加坡24小时心理卫生热线 — 可电话、WhatsApp或网络聊天,由受训辅导员接听。它取代了IMH心理健康热线(6389-2222)。全国心理卫生办公室的分层照护模式按严重程度将来电者分流至自助、社区服务或IMH/三级照护。',
  },
};

export const mentalHealthCrisisCase: CaseDefinition = {
  id: 'mental-health-crisis-sgh-imh',
  title: {
    en: 'Paracetamol overdose, 2 am — SGH ED → IMH liaison',
    zh: '扑热息痛过量,凌晨两点 — SGH急诊 → IMH精神科会诊',
  },
  blurb: {
    en: 'Ms Lim, 23, polytechnic student. Roommate brings her to SGH ED at 02:14 after finding empty paracetamol blisters (~30 × 500 mg). Ingestion ~3 h ago. Conscious, tearful, asking to "just go home". History of anxiety + depression; no prior admissions.',
    zh: '林小姐,23岁,理工学院学生。室友凌晨02:14将她送至SGH急诊,起因是发现30片500 mg的扑热息痛空泡罩。约3小时前摄入。神志清醒、流泪,要求"只想回家"。有焦虑+抑郁病史;无过往住院。',
  },
  category: 'acute',
  primaryFacility: 'sgh',
  involvedFacilities: ['sgh', 'imh', 'home', 'shp-outram'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [NICE_SH, MHCTA, PARACETAMOL_OD, IMH_LIAISON, MINDLINE_1771],
  pathway: [
    {
      id: 'ed-triage',
      department: 'triage',
      facility: 'sgh',
      durationMin: 8,
      framing: {
        patient: {
          en: 'Bright lights hurt your eyes. The nurse asks your name, your IC, and what you took.',
          zh: '刺眼的灯让你眼睛发酸。护士询问你的姓名、身份证号,以及吃了什么。',
        },
        caregiver: {
          en: 'The roommate hands over the empty blister packs in a plastic bag.',
          zh: '室友把空泡罩装在塑料袋里递过来。',
        },
        staff: {
          en: 'Conscious, GCS 15, BP 118/72, HR 92, RR 16. Reports 30 × 500 mg paracetamol ~3 h ago. No vomiting. Tearful, withdrawn, says "leave me alone".',
          zh: '清醒,GCS 15,血压118/72,心率92,呼吸16。报告约3小时前服用30片500 mg扑热息痛。无呕吐。流泪、退缩,口中说"别管我"。',
        },
      },
      decision: {
        id: 'triage-acuity',
        prompt: { en: 'Triage acuity?', zh: '分诊级别?' },
        weight: 1.2,
        reference: PARACETAMOL_OD,
        options: [
          {
            id: 'p1-resus',
            label: {
              en: 'P1: bring to resus immediately for IV access, bloods, NAC standby.',
              zh: 'P1级:立即送入抢救区,建立静脉通路、抽血、备好NAC。',
            },
            score: 10,
            rationale: {
              en: 'Toxic-dose paracetamol overdose (≥ 150 mg/kg or > 12 g) within the 8-h window is time-critical. Rapid bloods + NAC initiation prevent hepatocellular injury. Acuity reflects toxicological risk regardless of conversational appearance.',
              zh: '中毒剂量(≥150 mg/kg或>12 g)的扑热息痛过量、8小时窗口内属时间紧迫。迅速抽血+启动NAC可预防肝细胞损伤。分诊级别反映的是毒理风险,而非表面对答能力。',
            },
            outcome: {
              patient: {
                en: 'You are wheeled into a curtained bay. Two cannulas go in fast.',
                zh: '你被推进一个隔帘隔出的抢救位。两根静脉针迅速扎好。',
              },
              caregiver: {
                en: 'The roommate is shown to the relatives\' waiting area.',
                zh: '室友被带到家属等候区。',
              },
              staff: { en: 'P1 activated. Toxicology consulted.', zh: '已启动P1。已请毒理科会诊。' },
            },
            effects: { setFlags: ['nac-prompt'] },
          },
          {
            id: 'p2-acute',
            label: {
              en: 'P2: standard acute bay, bloods in queue, NAC after level result.',
              zh: 'P2级:走标准急性区,排队抽血,血药浓度结果出来后再给NAC。',
            },
            score: 4,
            rationale: {
              en: 'Reasonable if ingestion timing is uncertain, but here we know ~3 h — running the clock loses minutes for no gain. For a confirmed toxic dose, P1 is safer.',
              zh: '若摄入时间不明尚可;但此处已知约3小时,拖延白白损失时间。对已确认的中毒剂量,P1更安全。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Bloods sent; delay of ~20 min before NAC starts.',
                zh: '血样已送;NAC启动延迟约20分钟。',
              },
            },
            effects: { setFlags: ['nac-delayed'] },
          },
          {
            id: 'p3-walkin',
            label: {
              en: 'P3: she is conversant and refused care once — leave in waiting area, review when calmer.',
              zh: 'P3级:能对话且曾拒绝照护 — 让她在候诊区等,情绪平静后再看。',
            },
            score: -10,
            rationale: {
              en: 'Conversational appearance does NOT exclude life-threatening toxicity. Paracetamol hepatotoxicity is delayed; refusing care is itself a risk signal. P3 here is dangerous and falls below the duty of care for self-harm.',
              zh: '能对话不代表无致命毒性。扑热息痛肝毒性发生于延迟期;拒绝照护本身就是风险信号。在此分到P3危险,且未达自伤患者的应尽照护义务。',
            },
            outcome: {
              patient: { en: 'You sit in the corner; nobody comes.', zh: '你坐在角落;没人来。' },
              caregiver: { en: '', zh: '' },
              staff: { en: '', zh: '' },
            },
            effects: { setFlags: ['triage-failure', 'nac-delayed'] },
          },
        ],
      },
    },
    {
      id: 'medical-mgmt',
      department: 'ed',
      facility: 'sgh',
      durationMin: 60,
      costSGD: 380,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'They want to draw blood "again". You ask if you can go home now.',
          zh: '又要"再"抽一次血。你问现在能不能回家。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Paracetamol level at 4 h post-ingestion plots well above the 100-line on Rumack-Matthew. ALT 32, INR 1.0, creatinine 78. Asymptomatic so far.',
          zh: '4小时血药浓度在Rumack-Matthew列线图上明显高于100线。ALT 32,INR 1.0,肌酐78。目前无症状。',
        },
      },
      decision: {
        id: 'nac-decision',
        prompt: { en: 'Medical antidote strategy?', zh: '医学解毒策略?' },
        weight: 1.4,
        reference: PARACETAMOL_OD,
        options: [
          {
            id: 'iv-nac-now',
            label: {
              en: '21-h IV N-acetylcysteine starting now; recheck LFT + INR at 12 h and 24 h.',
              zh: '现在起始21小时静脉N-乙酰半胱氨酸;12小时与24小时复查肝功能和INR。',
            },
            score: 10,
            rationale: {
              en: 'Single-time ingestion above the 100-line treatment threshold within the 8-h window: IV NAC reliably prevents hepatocellular injury. The 21-h regimen is standard.',
              zh: '8小时窗口内单次摄入超过100线治疗阈值:静脉NAC可可靠地预防肝细胞损伤。21小时方案是标准做法。',
            },
            outcome: {
              patient: {
                en: 'A bag of clear fluid goes up; the nurse explains it tastes like nothing because it\'s through the IV.',
                zh: '一袋清液挂了起来;护士解释通过静脉点滴是没有味道的。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'NAC bag 1 (loading) over 60 min, bag 2 over 4 h, bag 3 over 16 h.',
                zh: 'NAC第1袋(负荷量)60分钟内、第2袋4小时、第3袋16小时。',
              },
            },
          },
          {
            id: 'observe-only',
            label: {
              en: 'Observe for symptoms; only start NAC if she develops nausea / RUQ pain.',
              zh: '观察症状;若出现恶心 / 右上腹痛再启动NAC。',
            },
            score: -10,
            rationale: {
              en: 'Waiting for symptoms means waiting for hepatocellular injury that is already irreversible. Paracetamol-induced ALF develops 2–4 days post-ingestion. NAC works before injury, not after.',
              zh: '等待症状等于等待已经不可逆的肝细胞损伤。扑热息痛诱发的急性肝衰竭在摄入后2–4天发生。NAC只在损伤前奏效。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Risk of acute liver failure; transplant unit alerted later.',
                zh: '急性肝衰竭风险;之后联系移植单位。',
              },
            },
            effects: { setFlags: ['hepatotoxic-risk'] },
          },
          {
            id: 'gastric-lavage',
            label: { en: 'Gastric lavage and activated charcoal now.', zh: '立即洗胃和活性炭。' },
            score: -3,
            rationale: {
              en: 'Activated charcoal is useful within 1–2 h of ingestion; at 3+ h it has minimal benefit. Lavage is not indicated for paracetamol. NAC remains the key intervention.',
              zh: '活性炭在摄入1–2小时内有用;3小时后几乎无益。扑热息痛无洗胃适应症。关键仍是NAC。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-clinical',
            label: {
              en: 'Asymptomatic and a "minor overdose" — discharge with GP follow-up.',
              zh: '无症状且"剂量不大" — 让其回家,交家庭医生跟进。',
            },
            score: -10,
            rationale: {
              en: 'A toxic dose with a Rumack-Matthew level over the treatment line is never a discharge — full stop. This is the classic missed-paracetamol fatality.',
              zh: '中毒剂量、Rumack-Matthew超过治疗线 — 绝不可让其回家。经典的"被错过的扑热息痛死亡"。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['hepatotoxic-risk', 'unsafe-discharge'] },
          },
        ],
      },
    },
    {
      id: 'risk-assessment',
      department: 'ed',
      facility: 'sgh',
      durationMin: 30,
      framing: {
        patient: {
          en: 'You stare at the ceiling tiles. A doctor pulls up a chair and sits at your eye level.',
          zh: '你盯着天花板的瓷砖。一位医生拉过椅子,坐在与你视线齐平的位置。',
        },
        caregiver: {
          en: 'You are asked to step out so she can speak privately.',
          zh: '医护请你出去,以便她能私下交谈。',
        },
        staff: {
          en: 'NAC is running. Time to do the psychosocial assessment. How you frame it matters as much as the questions.',
          zh: 'NAC在滴。现在做社会心理评估。怎么开场和问什么同样重要。',
        },
      },
      decision: {
        id: 'how-to-assess',
        prompt: { en: 'Approach to the mental-health assessment?', zh: '心理评估的方式?' },
        weight: 1.5,
        reference: NICE_SH,
        options: [
          {
            id: 'compassionate-detailed',
            label: {
              en: 'Sit down, ask permission, allow silences. Cover: precipitating event, suicidal intent, plan, means, protective factors, social supports, hopelessness, past attempts. Acknowledge distress.',
              zh: '坐下来,先征得同意,容许沉默。涵盖:诱发事件、自杀意图、计划、手段、保护因素、社会支持、无望感、既往尝试。承认她的痛苦。',
            },
            score: 10,
            rationale: {
              en: 'NICE NG225: psychosocial assessment is a clinical intervention in itself, not a triage filter. Compassionate, non-judgmental, person-centred. Builds therapeutic alliance which is the single best predictor of engagement.',
              zh: 'NICE NG225:社会心理评估本身就是一项临床干预,而非分诊筛选。富有同情、不评判、以人为本。建立治疗联盟 — 这是参与度最重要的单一预测因子。',
            },
            outcome: {
              patient: {
                en: '(slowly): "I don\'t want to die. I just wanted it to stop."',
                zh: '(慢慢地):"我不是想死。我只是想让它停下来。"',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Risk: moderate, with protective factors (engaged, family contact).',
                zh: '风险:中等,具保护因素(愿意参与、有家庭联系)。',
              },
            },
            effects: { setFlags: ['risk-assessed'] },
          },
          {
            id: 'tick-box',
            label: {
              en: 'Run through a standard SAD-PERSONS / Columbia checklist at the bedside, score, document.',
              zh: '床旁过一遍SAD-PERSONS / 哥伦比亚量表,打分,记录。',
            },
            score: 4,
            rationale: {
              en: 'Structured tools are useful adjuncts but should NOT replace a clinical interview. SAD-PERSONS has poor positive predictive value when used alone. NICE explicitly says risk scales must not be used to decide disposition.',
              zh: '结构化工具可作辅助,但不能取代临床访谈。SAD-PERSONS单独使用时阳性预测值差。NICE明文指出不得用风险量表决定去留。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'interrogate',
            label: {
              en: 'Direct questioning: "Did you want to die? Will you do it again? Are you lying to us?" Document responses.',
              zh: '直白盘问:"你想死吗?还会再做吗?你是不是在骗我们?"记录回答。',
            },
            score: -7,
            rationale: {
              en: 'Confrontational style erodes trust, drives concealment, and worsens engagement. The clinical task is to understand, not to interrogate.',
              zh: '对抗式风格侵蚀信任、迫使隐瞒、削弱参与。临床任务是理解,不是审问。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'defer-to-imh',
            label: {
              en: 'Skip the assessment; refer to IMH for "their experts to do".',
              zh: '跳过评估;转介IMH"让他们的专家做"。',
            },
            score: 2,
            rationale: {
              en: 'The ED clinician is part of the duty of care. Deferral wastes the early window and signals to the patient that her crisis isn\'t the ED\'s problem.',
              zh: '急诊医师也是照护义务的一部分。推卸会浪费早期窗口,并向患者传递"你的危机与急诊无关"的信号。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'disposition',
      department: 'ward',
      facility: 'sgh',
      durationMin: 45,
      requiresAnyFlag: ['risk-assessed'],
      framing: {
        patient: {
          en: 'She agrees to see "the IMH doctor". She does not want her parents called yet.',
          zh: '她同意见"IMH的医生"。但目前不希望通知父母。',
        },
        caregiver: {
          en: '(Roommate waiting; parents un-informed.)',
          zh: '(室友在等候;父母尚未被告知。)',
        },
        staff: {
          en: 'NAC running. Risk: moderate, engageable. IMH C-L Psychiatry available. Plan disposition.',
          zh: 'NAC在滴。风险:中等,可对话。IMH C-L精神科可用。规划去向。',
        },
      },
      decision: {
        id: 'disposition-route',
        prompt: { en: 'Admission pathway?', zh: '住院路径?' },
        weight: 1.5,
        reference: IMH_LIAISON,
        options: [
          {
            id: 'medical-ward-cl',
            label: {
              en: 'Admit SGH medical ward to complete 21-h NAC + LFT serial trend; IMH C-L Psychiatry to see in 24 h before discharge.',
              zh: '收入SGH内科病房完成21小时NAC + 肝功能动态监测;出院前24小时内由IMH C-L精神科会诊。',
            },
            score: 10,
            rationale: {
              en: 'Medical management is incomplete. NAC must run to 21 h; LFT/INR trends settle the toxicology question. IMH C-L within 24 h is the standard pathway and avoids the destabilising mid-treatment transfer.',
              zh: '内科治疗尚未完成。NAC需滴满21小时;肝功能/INR走势用于确认毒理结局。IMH C-L在24小时内会诊属标准路径,避免治疗中途的转运不稳定。',
            },
            outcome: {
              patient: {
                en: 'A medical-ward bed by 4 am. The IMH doctor will come tomorrow afternoon.',
                zh: '凌晨4点前进入内科病房。IMH的医生明天下午会来。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'C-L referral submitted; NAC continuation orders written.',
                zh: 'C-L转介已提交;NAC续滴医嘱已开。',
              },
            },
            effects: { setFlags: ['medical-ward-cl'] },
          },
          {
            id: 'direct-imh-voluntary',
            label: {
              en: 'Stop NAC, transfer to IMH for voluntary admission now.',
              zh: '停NAC,立即转IMH自愿住院。',
            },
            score: -2,
            rationale: {
              en: 'Stopping NAC mid-treatment risks hepatotoxicity. IMH wards are not set up for IV NAC infusions. Medical first, psychiatric in parallel.',
              zh: '半途停NAC会带来肝毒性风险。IMH病房并不具备静脉NAC输液的条件。应先处理内科,精神科并行。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['nac-aborted'] },
          },
          {
            id: 'form-1-involuntary',
            label: {
              en: 'Sign MHCTA Form 1 (medical practitioner) for involuntary IMH admission immediately on the basis of overdose.',
              zh: '以药物过量为由立即签署MHCTA表1(由医师)申请非自愿入住IMH。',
            },
            score: -5,
            rationale: {
              en: 'MHCTA Form 1 is for patients who refuse care AND pose imminent risk. She is engaging voluntarily and consented to IMH review — there is no statutory basis here. Using MHCTA when not warranted is a misuse and damages trust.',
              zh: 'MHCTA表1适用于"拒绝照护且有迫切风险"的患者。她在自愿参与并同意IMH评估 — 这里并无法定依据。无适应症时使用MHCTA属误用,且会破坏信任。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['mhcta-misuse'] },
          },
          {
            id: 'discharge-soft',
            label: {
              en: 'Stable enough — discharge home with the roommate, IMH outpatient appointment next week.',
              zh: '"够稳定" — 让她跟室友回家,下周IMH门诊预约。',
            },
            score: -10,
            rationale: {
              en: 'NAC is mid-infusion and she has acute self-harm intent. Discharge during the first 72 h post-attempt is the highest-risk window for reattempt. Standard of care is inpatient until cleared.',
              zh: 'NAC尚在输注中,且存在急性自伤意图。自伤后72小时是再次尝试的最高风险窗口。标准做法是在排除前住院观察。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { setFlags: ['unsafe-discharge'] },
          },
        ],
      },
    },
    {
      id: 'family-safety',
      department: 'ward',
      facility: 'sgh',
      durationMin: 30,
      requiresAnyFlag: ['medical-ward-cl'],
      framing: {
        patient: {
          en: 'She is adamant: "Do NOT tell my parents. They will lose it."',
          zh: '她态度坚决:"千万别告诉我爸妈。他们会崩溃。"',
        },
        caregiver: {
          en: '(Roommate in the corridor, scrolling her phone.)',
          zh: '(室友在走廊上滑手机。)',
        },
        staff: {
          en: 'Patient is 23 — legally autonomous. Parents not yet informed.',
          zh: '患者23岁 — 在法律上具完全行为能力。父母尚未被告知。',
        },
      },
      decision: {
        id: 'involve-family',
        prompt: { en: 'Family / safety-net approach?', zh: '家属 / 安全网络的处理?' },
        weight: 1.2,
        reference: NICE_SH,
        options: [
          {
            id: 'autonomy-collaborative',
            label: {
              en: 'Respect autonomy. Explore her concerns about disclosure. Negotiate a safety-net contact she trusts (older sibling, cousin, school counsellor) and seek consent to contact them. Provide National Mindline 1771 (24/7 call / WhatsApp / webchat) + Samaritans of Singapore 1-767. (The old IMH Mental Health Helpline 6389-2222 was retired on 18 Jun 2025 when 1771 launched.)',
              zh: '尊重自主。了解她对告知的顾虑。协商一位她信任的安全网络联系人(年长的兄姐、表亲、学校辅导员)并征得同意联系。提供全国心理卫生热线Mindline 1771(24小时电话 / WhatsApp / 网络聊天)+ 新加坡援人协会(SOS)1-767。(旧的IMH心理健康热线6389-2222已于2025年6月18日1771启用时停用。)',
            },
            score: 10,
            rationale: {
              en: 'Confidentiality is a core principle; over-riding it without consent destroys engagement and is rarely necessary for a 23-y-o engaging voluntarily. A negotiated safety net captures most of the benefit of family involvement without the harm.',
              zh: '保密是核心原则;未经同意越权告知会摧毁参与度,在23岁自愿参与的患者身上鲜有必要。协商安全网络可获得家庭参与的大部分益处而无伤害。',
            },
            outcome: {
              patient: {
                en: 'She nods at "my cousin". Cousin called; agrees to come tomorrow.',
                zh: '她对"我表姐"这个名字点了头。表姐已联系;同意明天过来。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Safety plan documented with consented contact.',
                zh: '安全计划及经同意的联系人已记录。',
              },
            },
          },
          {
            id: 'tell-parents-anyway',
            label: {
              en: 'Call her parents anyway — they have a right to know their daughter is in hospital.',
              zh: '不管怎样还是打电话给父母 — 他们有权知道女儿住院。',
            },
            score: -6,
            rationale: {
              en: 'At 23 she is legally an adult. Confidentiality applies. Calling against her explicit wishes breaches autonomy and can fracture the therapeutic relationship she just started to build.',
              zh: '23岁在法律上已是成人,适用保密义务。违背她明确意愿的告知侵犯自主,可能毁掉她刚开始建立的治疗关系。',
            },
            outcome: {
              patient: {
                en: 'She refuses to speak to you again.',
                zh: '她从此不再开口与你说话。',
              },
              caregiver: { en: '', zh: '' },
              staff: { en: '', zh: '' },
            },
          },
          {
            id: 'no-safety-net',
            label: {
              en: 'She wants no one involved — respect it fully, no safety-net contact discussion.',
              zh: '她不愿任何人介入 — 完全尊重,不再讨论安全网络。',
            },
            score: 3,
            rationale: {
              en: 'Pure autonomy without exploring safety nets misses an opportunity. A negotiated middle path captures more protective benefit while still respecting the patient.',
              zh: '只讲自主而不探讨安全网络错失机会。协商的中间路径能在尊重患者的同时争取更多保护性获益。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'discharge-plan',
      department: 'discharge',
      facility: 'sgh',
      durationMin: 30,
      requiresAnyFlag: ['medical-ward-cl'],
      framing: {
        patient: {
          en: 'Two days later. LFT normalised, NAC done. The IMH doctor and the SGH team agree you can go home.',
          zh: '两天后。肝功能恢复正常,NAC已完成。IMH医生与SGH团队都同意你可以回家。',
        },
        caregiver: {
          en: 'Cousin arrived; cousin\'s phone number is in the chart.',
          zh: '表姐已到;她的电话已记录在病历上。',
        },
        staff: {
          en: 'C-L review: low-moderate risk, engaged, agrees to outpatient psychiatry + follow-up.',
          zh: 'C-L复评:低-中风险,愿意参与,同意门诊精神科 + 随访。',
        },
      },
      decision: {
        id: 'aftercare-plan',
        prompt: { en: 'Post-discharge plan?', zh: '出院后方案?' },
        weight: 1.3,
        reference: IMH_LIAISON,
        options: [
          {
            id: 'integrated-followup',
            label: {
              en: 'IMH psychiatry outpatient in 7 days + IMH Mobile Crisis Team home visit within 72 h + safety plan card with National Mindline 1771 + Healthier-SG enrolment at her polyclinic for primary-care continuity. Under the Tiered Care Model, 1771 triages future crises to community services or IMH as severity dictates.',
              zh: '7天内安排IMH精神科门诊 + 72小时内IMH流动危机团队上门 + 写着全国心理卫生热线Mindline 1771的安全计划卡 + 在综合诊疗所登记Healthier SG以维持基层照护连续性。在分层照护模式下,1771会按严重程度把日后的危机分流至社区服务或IMH。',
            },
            score: 10,
            rationale: {
              en: 'The first 72 h post-discharge is the highest-risk reattempt window. Mobile Crisis Team bridges that window; outpatient psychiatry begins ongoing care; primary care anchors long-term follow-up. Multi-layered safety net is the standard.',
              zh: '出院后72小时是再次尝试的最高风险窗。流动危机团队跨越此窗;门诊精神科开启持续照护;基层医疗承担长期随访。多层次安全网络是标准做法。',
            },
            outcome: {
              patient: {
                en: 'Crisis team SMS arrives the next morning; appointment letter in your bag.',
                zh: '次日清晨收到危机团队的短信;预约信放进了你的包里。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Discharge summary copied to IMH, polyclinic.',
                zh: '出院摘要抄送IMH与综合诊疗所。',
              },
            },
          },
          {
            id: 'imh-only',
            label: { en: 'IMH outpatient in 4 weeks; nothing in between.', zh: '4周后IMH门诊;中间不安排任何随访。' },
            score: -2,
            rationale: {
              en: '4 weeks leaves the entire high-risk window uncovered. Standard is < 7 days plus interim outreach.',
              zh: '4周让整个高风险窗口无人覆盖。标准是 < 7天加上中间的外展。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'gp-only',
            label: { en: 'GP-only follow-up for medication.', zh: '仅交家庭医生续药跟进。' },
            score: -5,
            rationale: {
              en: 'Primary care alone is not equipped for the post-attempt high-risk window. Specialist follow-up + crisis-team bridge are needed.',
              zh: '基层无法独立应对自伤后的高风险窗口。需要专科随访 + 危机团队衔接。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
