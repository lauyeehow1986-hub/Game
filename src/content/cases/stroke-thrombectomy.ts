import type { CaseDefinition } from '../../lib/types';

const SCDF_STROKE = {
  label: { en: 'SCDF Pre-hospital Stroke Pathway', zh: 'SCDF院前中风诊疗路径' },
  body: {
    en: 'SCDF EMS protocol — FAST identification, hospital pre-notification, transport to nearest stroke-capable ED.',
    zh: '新加坡民防部队(SCDF)EMS规程 — FAST识别、提前通知接收医院、转送至最近的中风救治急诊。',
  },
};

const MOH_STROKE = {
  label: { en: 'MOH CPG Stroke (2018)', zh: '卫生部中风临床实践指南(2018年版)' },
  body: {
    en: 'Singapore Ministry of Health Clinical Practice Guidelines for stroke prevention and acute management.',
    zh: '新加坡卫生部中风预防与急性期管理临床实践指南。',
  },
};

const ESO_2022 = {
  label: { en: 'ESO / ESMINT Mechanical Thrombectomy (2022, updated 2024-25)', zh: '欧洲中风组织 / ESMINT机械取栓指南(2022,2024-25更新)' },
  body: {
    en: 'European Stroke Organisation guidelines on endovascular treatment of large-vessel occlusion stroke. Standard window 0-6h, and 6-24h with perfusion-mismatch selection (DAWN / DEFUSE-3). 2024-25 evidence extends thrombectomy to large established cores (ASPECTS 3-5, per SELECT2 and RESCUE-Japan LIMIT) and supports selected patients beyond 24h — a fixed 24h cut-off is now too restrictive.',
    zh: '欧洲中风组织对大血管闭塞性中风血管内治疗的指南。标准时间窗0-6小时,并可在6-24小时依灌注错配筛选(DAWN / DEFUSE-3)。2024-25证据将取栓扩展至大面积已形成梗死核心(ASPECTS 3-5,依SELECT2与RESCUE-Japan LIMIT),并支持部分超过24小时的患者 — 固定的24小时界限已过于保守。',
  },
};

const HEALTHIER_SG = {
  label: { en: 'Healthier SG', zh: 'Healthier SG' },
  body: {
    en: 'Right-siting stable post-stroke patients to a primary-care provider for secondary prevention.',
    zh: '中风后病情稳定的患者按分级就诊原则转回基层医疗以进行二级预防。',
  },
};

export const strokeThrombectomy: CaseDefinition = {
  id: 'stroke-thrombectomy',
  title: {
    en: 'Acute Ischaemic Stroke — 67 y/o female, large-vessel occlusion',
    zh: '急性缺血性中风 — 67岁女性,大血管闭塞',
  },
  blurb: {
    en: 'Mdm Lee, 67. Sudden right-sided weakness and aphasia at home in Clementi 30 min ago. Husband called 995. SCDF en route. NUH ED is the nearest stroke-capable centre.',
    zh: '李女士,67岁。30分钟前在金文泰家中突发右侧肢体无力及失语。先生拨打995。SCDF已出动。最近的中风救治中心为NUH急诊。',
  },
  category: 'acute',
  primaryFacility: 'nuh',
  involvedFacilities: ['nuh', 'jch'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  randomiseProfile: true,
  acuteTimer: {
    goalMin: 60,
    goalLabel: 'Door-to-puncture',
    missedFlag: 'd2p-missed',
  },
  guidelines: [SCDF_STROKE, MOH_STROKE, ESO_2022, HEALTHIER_SG],
  pathway: [
    {
      id: 'arrival',
      department: 'entrance',
      facility: 'nuh',
      durationMin: 3,
      framing: {
        patient: {
          en: '(slumped to one side, drooling, eyes open but tracking only one direction)',
          zh: '(身体瘫向一侧,流口水,眼睛睁着但只朝一个方向看。)',
        },
        caregiver: {
          en: 'You held her hand the whole way. The paramedic kept telling you the time.',
          zh: '一路上你都握着她的手。救护员不断地报时间给你听。',
        },
        staff: {
          en: 'SCDF radio: 67F, FAST positive at 30 min, last-seen-well 50 min, BP 178/96. ETA 2 min. Stroke team activated.',
          zh: 'SCDF无线电:67岁女性,30分钟前FAST阳性,最后正常时间50分钟前,血压178/96。预计2分钟内到达。中风团队已启动。',
        },
      },
      decision: {
        id: 'pre-hospital-routing',
        prompt: {
          en: 'SCDF is 2 min out. NUH is the nearest comprehensive stroke centre with thrombectomy capability. What does the receiving team do?',
          zh: 'SCDF距离2分钟到达。NUH是最近的、具备取栓能力的综合中风中心。接收团队该怎么做?',
        },
        weight: 1.5,
        reference: SCDF_STROKE,
        options: [
          {
            id: 'stroke-fast-track',
            label: {
              en: 'Activate stroke fast-track: ED bypasses to CT immediately on arrival; stroke neurologist meets at CT scanner; bloods at point of care.',
              zh: '启动中风快速通道:到达后直接绕过急诊送到CT扫描室;中风神经内科医生在CT旁待命;床旁抽血。',
            },
            score: 10,
            rationale: {
              en: 'Direct-to-CT pathways shave ~15-20 min off door-to-needle and door-to-puncture times. Time is brain — every minute lost = 1.9 million neurons.',
              zh: '直接到CT的路径可缩短"门到针"和"门到穿刺"约15-20分钟。时间即脑组织 — 每延误一分钟相当于损失190万个神经元。',
            },
            outcome: {
              patient: {
                en: '(wheeled past triage straight into the scanner)',
                zh: '(担架床绕过分诊台直接推进扫描室。)',
              },
              caregiver: {
                en: 'You are met by a Care Liaison Officer who explains every step.',
                zh: '一位医疗联络员接待你,把每一步都解释清楚。',
              },
              staff: {
                en: 'Stroke neurologist, neurointerventionalist, nurse, radiographer all assembled at CT in 8 min.',
                zh: '中风神经内科、神经介入、护士、放射技师8分钟内已全员到位于CT旁。',
              },
            },
          },
          {
            id: 'standard-triage',
            label: {
              en: 'Standard ED triage; CT after registration and bloods.',
              zh: '按一般急诊分诊流程;登记并抽血后才送CT。',
            },
            score: 1,
            rationale: {
              en: 'Defensible but every minute lost means more infarcted tissue. Modern stroke pathways prioritise direct-to-CT.',
              zh: '勉强说得过去,但每延误一分钟就意味着更多的脑梗死。现代中风路径优先采取"直接到CT"。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Door-to-imaging delayed by ~25 min.',
                zh: '"门到影像"时间延误约25分钟。',
              },
            },
          },
          {
            id: 'transfer-to-other-centre',
            label: {
              en: 'Send SCDF to a non-stroke-capable hospital closer.',
              zh: '让SCDF转送到更近的、不具备中风救治能力的医院。',
            },
            score: -10,
            rationale: {
              en: 'Stroke care is centralised at thrombectomy-capable centres. Diverting away costs irreversible brain tissue.',
              zh: '中风救治集中于具备取栓能力的中心;转往他处会造成不可逆的脑组织损失。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'SCDF protocol violated; serious M&M case.',
                zh: '违反SCDF规程;构成严重的并发症与死亡(M&M)讨论案例。',
              },
            },
          },
        ],
      },
    },
    {
      id: 'ed-resus',
      department: 'ed',
      facility: 'nuh',
      durationMin: 8,
      costSGD: 320,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8, sleepDebt: 4 },
      framing: {
        patient: {
          en: '(eyes open, moaning, not responsive to verbal commands)',
          zh: '(眼睛睁着,呻吟,对呼唤无反应。)',
        },
        caregiver: {
          en: 'You see four staff in the resus bay around her. Your son arrives.',
          zh: '抢救区里四个医护围着她。儿子赶到了。',
        },
        staff: {
          en: 'NIHSS 18 (severe). BP 178/96. POC glucose 6.4. ECG sinus. IV access x2. Bloods sent.',
          zh: 'NIHSS评分18分(重度)。血压178/96。床旁血糖6.4。心电图窦性心律。已建立两条静脉通路。已抽血送检。',
        },
      },
    },
    {
      id: 'imaging',
      department: 'imaging',
      facility: 'nuh',
      durationMin: 12,
      costSGD: 380,
      charge: 'imaging',
      framing: {
        patient: { en: '(eyes closed in scanner)', zh: '(在扫描机内闭着眼。)' },
        caregiver: {
          en: 'You wait outside the scanner with a nurse who keeps you informed.',
          zh: '你在扫描室外等候,一位护士不断告诉你进展。',
        },
        staff: {
          en: 'Non-contrast CT: no haemorrhage, ASPECTS 8. CTA: left M1 occlusion. CT perfusion: small core, large penumbra. Eligible for thrombectomy.',
          zh: '平扫CT:未见出血,ASPECTS 8分。CTA:左侧M1段闭塞。CT灌注:核心梗死小、缺血半暗带大。符合取栓适应症。',
        },
      },
      decision: {
        id: 'reperfusion-strategy',
        prompt: {
          en: 'Time from last-seen-well: 75 min. Left M1 occlusion, NIHSS 18, ASPECTS 8, mismatch present. No contraindication to tPA. What reperfusion strategy?',
          zh: '距最后正常时间75分钟。左M1闭塞、NIHSS 18、ASPECTS 8、存在错配。无tPA禁忌。再灌注策略?',
        },
        weight: 1.5,
        reference: ESO_2022,
        options: [
          {
            id: 'iv-tpa-then-evt',
            label: {
              en: 'IV tPA (alteplase) bridge + immediate transfer to endovascular suite for mechanical thrombectomy.',
              zh: '静脉tPA(阿替普酶)桥接 + 立即转送至血管内介入室进行机械取栓。',
            },
            score: 10,
            rationale: {
              en: 'Within 4.5h of onset and large-vessel occlusion: IV tPA + thrombectomy is standard. Bridging therapy improves outcomes vs thrombectomy alone in early window.',
              zh: '发病4.5小时内的大血管闭塞:静脉tPA + 取栓为标准方案。在早期窗内桥接治疗的预后优于单纯取栓。',
            },
            outcome: {
              patient: {
                en: '(infusion running; whisked from CT to endovascular suite)',
                zh: '(静脉滴注已开始;从CT直接推往介入室。)',
              },
              caregiver: { en: 'You sign consent. Hands shaking.', zh: '你签同意书,手在抖。' },
              staff: {
                en: 'tPA bolus + infusion at 14 min. Endovascular team paged; suite ready in 5 min.',
                zh: '14分钟时已注入tPA冲击剂量并开始持续输注。介入团队已呼叫;5分钟内介入室就绪。',
              },
            },
          },
          {
            id: 'evt-only',
            label: { en: 'Skip IV tPA, proceed straight to thrombectomy.', zh: '不给静脉tPA,直接取栓。' },
            score: 6,
            rationale: {
              en: 'Some trials (DIRECT-MT, MR CLEAN-NO IV) suggest non-inferiority of EVT alone in selected centres, but Singapore practice and guidelines still favour bridging therapy when not contraindicated.',
              zh: '部分研究(DIRECT-MT、MR CLEAN-NO IV)显示在精选中心单纯EVT不劣于桥接,但新加坡现行做法和指南在无禁忌时仍优先采用桥接治疗。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Defensible; debated at neuro grand round.',
                zh: '可辩护;神经科大查房上有讨论。',
              },
            },
          },
          {
            id: 'tpa-only',
            label: { en: 'IV tPA only; no thrombectomy.', zh: '仅给静脉tPA;不做取栓。' },
            score: -2,
            rationale: {
              en: 'Misses the major benefit of EVT in M1 occlusion. tPA alone has limited reperfusion success in large-vessel occlusion (~30%).',
              zh: '错失M1闭塞下EVT的核心获益。单独tPA对大血管闭塞的再通成功率有限(约30%)。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'NIHSS at 24h higher than expected; M&M discussion.',
                zh: '24小时NIHSS高于预期;列入M&M讨论。',
              },
            },
          },
          {
            id: 'no-treatment',
            label: {
              en: 'No reperfusion — admit to stroke unit for supportive care.',
              zh: '不进行再灌注治疗 — 收入中风单元行支持治疗。',
            },
            score: -10,
            rationale: {
              en: 'Eligible patient denied evidence-based therapy. Severe disability or death likely.',
              zh: '符合条件的患者却未得到循证治疗。预后多为严重残障或死亡。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Critical incident; serious M&M.', zh: '严重不良事件;重大M&M讨论。' },
            },
          },
        ],
      },
    },
    {
      id: 'thrombectomy',
      department: 'ot',
      facility: 'nuh',
      durationMin: 65,
      costSGD: 14500,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 22, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(awake, mildly sedated, on the angio table)',
          zh: '(清醒、轻度镇静,躺在血管造影台上。)',
        },
        caregiver: {
          en: 'You wait in the family lounge. The clock seems frozen.',
          zh: '你在家属休息区等。墙上的钟好像不会动了。',
        },
        staff: {
          en: 'Right common femoral access; aspiration + stent retriever; recanalisation TICI 2b at 50 min from groin puncture. Door-to-puncture 32 min, door-to-recanalisation 82 min.',
          zh: '右股动脉穿刺;抽吸 + 支架取栓;穿刺后50分钟达TICI 2b再通。"门到穿刺"32分钟,"门到再通"82分钟。',
        },
      },
    },
    {
      id: 'icu',
      department: 'icu',
      facility: 'nuh',
      durationMin: 1440,
      costSGD: 1400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 14, sleepDebt: 18 },
      framing: {
        patient: {
          en: '(NIHSS now 6 — moving the right side weakly, speech returning in single words)',
          zh: '(NIHSS降至6分 — 右侧能轻微活动,讲话开始有单字回复。)',
        },
        caregiver: {
          en: 'You see her squeeze your hand back for the first time. You both cry.',
          zh: '你第一次感到她回握你的手。两人都哭了。',
        },
        staff: {
          en: 'Post-procedure obs in NeuroICU; BP 140-160 systolic target; no haemorrhagic transformation on 24h CT.',
          zh: '术后在神经ICU观察;收缩压目标140-160 mmHg;24小时CT未见出血转化。',
        },
      },
      decision: {
        id: 'subsidy-class',
        prompt: {
          en: 'Mdm Lee is means-test eligible (per-capita income S$950, MG card, no IP rider). Husband worried about the bill. MSW asks about ward class.',
          zh: '李女士符合家庭收入审查(人均收入S$950,持立国一代MG卡,无综合健保附加险)。先生担心账单。医务社工询问病房等级。',
        },
        weight: 0.8,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'class-c',
            label: {
              en: 'Class C (highest subsidy ~85% with PG/MG top-up).',
              zh: 'C级病房(津贴最高,约85%,加上PG/MG津贴)。',
            },
            score: 10,
            rationale: {
              en: 'Means-test plus Merdeka Generation top-up gives the highest subsidy. Same neurologist, same evidence-based care.',
              zh: '家庭收入审查加立国一代津贴叠加后津贴最高。同一位神经内科医生、同等循证照护。',
            },
            outcome: {
              patient: { en: 'A 6-bedder cubicle.', zh: '六人间病房。' },
              caregiver: {
                en: 'You see the bill estimate and breathe out.',
                zh: '看到账单预估你松了一口气。',
              },
              staff: { en: 'MSW happy.', zh: '医务社工满意。' },
            },
            effects: { wardClass: 'C' },
          },
          {
            id: 'class-b2',
            label: { en: 'Class B2.', zh: 'B2级病房。' },
            score: 7,
            rationale: { en: 'Reasonable; smaller subsidy.', zh: '合理选择;津贴较少。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: 'OK.', zh: '可以。' } },
            effects: { wardClass: 'B2' },
          },
          {
            id: 'class-a',
            label: { en: 'Class A — single room, no subsidy.', zh: 'A级病房 — 单人间,无津贴。' },
            score: -4,
            rationale: {
              en: 'Avoidable financial harm; no clinical benefit from amenity choice.',
              zh: '可避免的经济伤害;舒适度的选择并未带来临床获益。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'Family considers Medifund.',
                zh: '家属开始考虑申请保健基金(Medifund)。',
              },
              staff: { en: 'MSW counsels family.', zh: '医务社工辅导家属。' },
            },
            effects: { wardClass: 'A', setFlags: ['financial-distress'], caregiverBurden: { financialWorry: 22 } },
          },
        ],
      },
    },
    {
      id: 'stroke-ward',
      department: 'ward',
      facility: 'nuh',
      durationMin: 5760, // 4 days
      costSGD: 1500,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 6, sleepDebt: 8 },
      framing: {
        patient: {
          en: '(walking with a frame by day 4; mild expressive aphasia improving)',
          zh: '(第4天能扶助行架行走;轻度表达性失语逐渐改善。)',
        },
        caregiver: {
          en: 'You bring her favourite kueh. She names it correctly. You both laugh.',
          zh: '你带来她最爱吃的糕(kueh)。她正确地叫出名字。两人都笑了。',
        },
        staff: {
          en: 'Stroke unit bundle: dysphagia screen, VTE prophylaxis, statin, antiplatelet (clopidogrel 75 mg started after 24h post-tPA), AF screen.',
          zh: '中风单元综合处理:吞咽功能筛查、静脉血栓预防、他汀类、抗血小板(tPA后24小时起用氯吡格雷75 mg)、房颤筛查。',
        },
      },
      decision: {
        id: 'secondary-prevention',
        prompt: {
          en: 'Cause workup: ECG and 24h Holter showed sinus rhythm. Echo: normal. Carotid US: no significant stenosis. CTA already showed no atheroma. What secondary prevention do you start?',
          zh: '病因检查:心电图与24小时动态心电图均为窦性;心脏超声正常;颈动脉超声无明显狭窄;CTA无动脉粥样硬化。该启动什么二级预防?',
        },
        weight: 1.2,
        reference: MOH_STROKE,
        options: [
          {
            id: 'aspirin-statin-bp',
            label: {
              en: 'Aspirin 100 mg OD + clopidogrel 75 mg OD x 21 days (CHANCE/POINT) → aspirin alone; high-intensity statin; BP target < 130/80; lifestyle / smoking cessation.',
              zh: '阿司匹林100 mg每日一次 + 氯吡格雷75 mg每日一次共21天(CHANCE/POINT方案) → 之后单用阿司匹林;高强度他汀类;血压目标 < 130/80;生活方式干预 / 戒烟。',
            },
            score: 10,
            rationale: {
              en: 'Short-term DAPT for 21 days followed by single antiplatelet is standard for non-cardioembolic minor stroke / TIA (CHANCE-2, POINT, THALES). High-intensity statin reduces recurrence (SPARCL).',
              zh: '21天双抗后改单抗是非心源性轻型中风 / 短暂性脑缺血(TIA)的标准方案(CHANCE-2、POINT、THALES)。高强度他汀类可降低复发率(SPARCL)。',
            },
            outcome: {
              patient: { en: 'A new pillbox.', zh: '一只新的药盒。' },
              caregiver: { en: 'You take a photo of every tablet.', zh: '你把每一颗药都拍照。' },
              staff: { en: 'GDMT charted.', zh: '指南导向药物治疗(GDMT)已开具。' },
            },
          },
          {
            id: 'noac',
            label: {
              en: 'Direct oral anticoagulant for AF.',
              zh: '针对房颤启用直接口服抗凝药。',
            },
            score: -3,
            rationale: {
              en: 'No AF detected; anticoagulation here adds bleeding risk without indication.',
              zh: '未发现房颤;此处抗凝无指征,只会增加出血风险。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Reverted on senior review.', zh: '上级医师查房后撤销该医嘱。' },
            },
          },
          {
            id: 'aspirin-only',
            label: {
              en: 'Aspirin 100 mg OD only; no statin (cholesterol normal).',
              zh: '仅阿司匹林100 mg每日一次;不开他汀(胆固醇正常)。',
            },
            score: 4,
            rationale: {
              en: 'High-intensity statin is recommended post-stroke regardless of LDL (SPARCL); statin omission misses ~16% relative-risk reduction in recurrence.',
              zh: '中风后无论LDL水平都推荐高强度他汀(SPARCL);不开他汀将错失约16%的复发相对风险下降。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Senior reg adds statin.', zh: '高级住院医师补开他汀。' },
            },
          },
        ],
      },
    },
    {
      id: 'jch-rehab',
      department: 'rehab-gym',
      facility: 'jch',
      durationMin: 14400, // 10 days
      costSGD: 2200,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -8, financialWorry: 4, sleepDebt: -12 },
      framing: {
        patient: {
          en: 'A new building. The therapist asks you to name pictures. You laugh at how slow you are. You name them anyway.',
          zh: '一座新建筑。治疗师让你看图片说名称。你笑自己反应慢,但还是把它们一一说出。',
        },
        caregiver: {
          en: 'You can sleep at home. You visit on weekends.',
          zh: '你终于可以回家睡觉,周末才来探病。',
        },
        staff: {
          en: 'Step-down to JCH for inpatient rehab. PT/OT/SLT triple package; cognitive rehab; mood screen.',
          zh: '转至JCH(裕廊社区医院)进行住院康复。物理 / 职能 / 语言治疗三合一;认知康复;情绪筛查。',
        },
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      facility: 'jch',
      durationMin: 30,
      framing: {
        patient: {
          en: 'You walk out of the lift unaided. The husband cries.',
          zh: '你不用搀扶就走出电梯。先生哭了。',
        },
        caregiver: {
          en: 'You start a WhatsApp group with the rehab team for after-discharge questions.',
          zh: '你和康复团队建了一个WhatsApp群,方便出院后咨询。',
        },
        staff: {
          en: 'Discharged home with home-care therapy + AH@Home virtual ward enrolment + Healthier-SG GP referral.',
          zh: '出院回家;同时安排居家治疗 + 加入AH@Home虚拟病房 + 转介至Healthier SG家庭医生。',
        },
      },
      decision: {
        id: 'right-siting',
        prompt: { en: 'Long-term post-stroke care plan?', zh: '中风后的长期照护方案?' },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-care',
            label: {
              en: 'Healthier-SG GP for chronic disease + secondary prevention; NUH stroke clinic at 3 months then annually; AH@Home virtual rehab for 6 weeks.',
              zh: 'Healthier SG家庭医生负责慢性病及二级预防;NUH中风门诊3个月后复查,之后每年一次;AH@Home虚拟康复持续6周。',
            },
            score: 10,
            rationale: {
              en: 'Shared-care model: specialist surveillance + primary-care continuity + virtual rehab. Reduces SOC load and improves adherence.',
              zh: '共享照护模式:专科监测 + 基层连续性 + 虚拟康复。减轻专科负荷,同时提高依从性。',
            },
            outcome: {
              patient: {
                en: 'Your GP near home calls each month.',
                zh: '住家附近的家庭医生每个月打电话来。',
              },
              caregiver: { en: 'Less travel.', zh: '少跑医院。' },
              staff: { en: 'NEHR / HealthHub populated.', zh: 'NEHR与HealthHub均已更新。' },
            },
          },
          {
            id: 'soc-only',
            label: {
              en: 'NUH neurology SOC every 3 months indefinitely.',
              zh: 'NUH神经科门诊每3个月复诊,无期限。',
            },
            score: 4,
            rationale: {
              en: 'Specialist time better used for complex cases; stable patients fit primary care.',
              zh: '专科时间应留给复杂病例;稳定患者适合基层管理。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: 'Repeated time off.', zh: '反复请假。' },
              staff: { en: 'SOC slots squeezed.', zh: '专科预约越发紧张。' },
            },
          },
          {
            id: 'no-followup',
            label: {
              en: 'Discharge to GP with no surveillance.',
              zh: '转给家庭医生而不安排监测。',
            },
            score: -4,
            rationale: {
              en: 'Misses recurrent stroke detection and therapy adherence.',
              zh: '错失复发中风的监测及治疗依从性管理。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: { en: 'Recurrent event possible.', zh: '存在复发可能。' },
            },
          },
        ],
      },
    },
  ],
};
