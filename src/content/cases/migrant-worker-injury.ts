import type { CaseDefinition } from '../../lib/types';

const MOM_WICA = {
  label: { en: 'MOM Work Injury Compensation Act (WICA)', zh: '人力部工伤赔偿法令(WICA)' },
  body: {
    en: 'Employer must report work injuries within 10 days; insurer pays medical leave wages, medical expenses, and lump-sum for permanent incapacity. Workers cannot sue employer if WICA claim is filed.',
    zh: '雇主须在10天内呈报工伤;保险公司支付病假工资、医疗费用及永久伤残一次性赔偿。若已提交WICA索赔,工人不得另行起诉雇主。',
  },
};

const FWMI = {
  label: { en: 'MOM Foreign Worker Medical Insurance (FWMI)', zh: '人力部客工医疗保险(FWMI)' },
  body: {
    en: 'Employers must purchase ≥ S$60,000/year medical insurance per Work Permit / S Pass holder. Covers inpatient care up to limit; outpatient is employer-paid. From Jul 2023 employer co-pay applies for the first S$15,000.',
    zh: '雇主须为每位工作准证 / S准证持有人购买每年至少S$60,000的医疗保险。住院在保额内由保险承担;门诊由雇主自费。自2023年7月起,首S$15,000由雇主共付。',
  },
};

const ATLS = {
  label: { en: 'ATLS 10th — Spinal precautions', zh: '高级创伤生命支持(ATLS)第10版 — 脊柱预防措施' },
  body: {
    en: 'Immobilise suspected spinal injuries with rigid collar + log-roll; imaging by CT in adults with mechanism, neurology, or distracting injury. Avoid unnecessary plain films before CT in significant mechanism.',
    zh: '疑似脊柱损伤须以硬质颈托固定 + 轴线翻身(log-roll);成人若机制重大、有神经异常或合并干扰性损伤,影像首选CT。重大机制下避免在CT前做不必要的平片。',
  },
};

const NEXUS = {
  label: { en: 'NEXUS / Canadian C-Spine Rule', zh: 'NEXUS / 加拿大颈椎规则' },
  body: {
    en: 'Clinical decision rules to exclude clinically significant cervical-spine injury without imaging in alert, non-intoxicated patients with no midline tenderness, no neurology, and no dangerous mechanism.',
    zh: '用于清醒、未中毒、无中线压痛、无神经体征、无危险机制的患者,无需影像即可临床排除有临床意义的颈椎损伤。',
  },
};

export const migrantWorkerInjuryCase: CaseDefinition = {
  id: 'migrant-worker-injury',
  title: {
    en: 'Construction fall — migrant worker, FWMI + WICA pathway',
    zh: '工地坠落 — 客工,FWMI与工伤赔偿路径',
  },
  blurb: {
    en: 'Mr Hossain, 34, falls 2m from scaffolding at a Bukit Merah BTO site. Conscious, complaining of lower-back pain and right-ankle pain. Employer foreman calls. Site clinic is 5 minutes away; NUH ED is 8 minutes by ambulance.',
    zh: 'Hossain先生,34岁。在红山BTO工地的脚手架上跌落2米。神志清醒,自诉腰痛及右脚踝痛。雇主工头致电。工地诊所5分钟车程;NUH急诊救护车8分钟。',
  },
  category: 'acute',
  primaryFacility: 'nuh',
  involvedFacilities: ['scdf', 'nuh', 'ah', 'home', 'workplace-health'],
  profileKey: 'migrantWorker',
  allowsWardChoice: false,
  guidelines: [MOM_WICA, FWMI, ATLS, NEXUS],
  pathway: [
    {
      id: 'site-triage',
      department: 'triage',
      facility: 'workplace-health',
      durationMin: 8,
      framing: {
        patient: {
          en: 'Your colleagues lay you flat on the dusty ground; the foreman is on the phone in Bengali and English.',
          zh: '工友把你平放在尘土飞扬的地上;工头在电话上用孟加拉语和英语交替对话。',
        },
        caregiver: {
          en: 'Your wife is in Bangladesh; the WhatsApp group at the dorm starts pinging.',
          zh: '太太在孟加拉国;宿舍的WhatsApp群已经开始响个不停。',
        },
        staff: {
          en: 'Foreman: "He fell from second level. He moved his legs. Back hurts." Mechanism is significant.',
          zh: '工头:"他从二层摔下来。腿能动。腰痛。"机制属重大。',
        },
      },
      decision: {
        id: 'site-disposition',
        prompt: { en: 'Initial site decision?', zh: '现场初步处置?' },
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'scdf-spinal',
            label: {
              en: 'Call 995 (SCDF EMS) with spinal precautions; keep him flat; collar if available; do NOT let him walk.',
              zh: '拨打995(SCDF EMS)并采取脊柱预防;保持平卧;有颈托即上;切勿让他走动。',
            },
            score: 10,
            rationale: {
              en: "Significant mechanism + axial pain → assume spinal injury until imaging clears it. SCDF can immobilise and transport. Site clinic isn't equipped for spinal imaging.",
              zh: '重大机制 + 中轴痛 → 在影像排除前一律按脊柱损伤处理。SCDF可固定并转运。工地诊所没有脊柱影像能力。',
            },
            outcome: {
              patient: {
                en: 'SCDF arrives in 7 minutes. A collar goes on; you are scooped onto a board.',
                zh: 'SCDF 7分钟内到达。颈托戴上;你被铲式担架抬上脊柱板。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'EMS departs NUH ED, pre-alerts trauma team.',
                zh: 'EMS驶向NUH急诊,预先通知创伤团队。',
              },
            },
            effects: { setFlags: ['scdf-activated'] },
          },
          {
            id: 'private-ambulance',
            label: {
              en: 'Call employer\'s contracted private ambulance to bring him to the site clinic for review.',
              zh: '叫雇主签约的私人救护车把他送到工地诊所先评估。',
            },
            score: 4,
            rationale: {
              en: 'Slower for a possible spinal injury; clinic cannot CT the spine. Employer may prefer this to control billing — but clinically wrong here.',
              zh: '对疑似脊柱损伤过慢;诊所无法做脊柱CT。雇主或许为了控费偏好这种方式 — 但临床上不当。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'walk-in',
            label: {
              en: 'Two colleagues help him walk to the site clinic; assess there first.',
              zh: '让两位工友扶他走到工地诊所先评估。',
            },
            score: -8,
            rationale: {
              en: 'Movement of an unstable spine risks catastrophic cord injury. Never let a suspected spinal injury walk.',
              zh: '不稳定脊柱被移动可造成灾难性脊髓损伤。疑似脊柱损伤绝不可走动。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Foreman ignored the spinal mechanism.',
                zh: '工头忽略了脊柱机制。',
              },
            },
            effects: { setFlags: ['mobilised-unsafely'] },
          },
        ],
      },
    },
    {
      id: 'nuh-ed',
      department: 'ed',
      facility: 'nuh',
      durationMin: 45,
      costSGD: 380,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'Bright lights. A nurse asks your full name, work permit number, and employer.',
          zh: '刺眼的灯。护士询问你的全名、工作准证号、雇主。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'NUH ED: GCS 15, BP 132/84, HR 96, SpO2 99%. Tender L1 area, no neurology, painful right-ankle eversion. NEXUS positive for midline tenderness.',
          zh: 'NUH急诊:GCS 15,血压132/84,心率96,SpO2 99%。L1区域压痛,无神经体征,右脚踝外翻痛。NEXUS:中线压痛阳性。',
        },
      },
      decision: {
        id: 'imaging-choice',
        prompt: { en: 'Imaging strategy?', zh: '影像策略?' },
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'ct-spine-ankle-xr',
            label: {
              en: 'CT thoracolumbar spine + plain right-ankle radiographs. Mobilise off the board only after CT clears.',
              zh: '胸腰椎CT + 右脚踝平片。CT排除后再撤脊柱板。',
            },
            score: 10,
            rationale: {
              en: 'CT is the modality of choice for adult trauma spine with significant mechanism + tenderness. Plain ankle film is appropriate before CT-ing every joint.',
              zh: '成人重大机制 + 压痛的创伤脊柱,首选CT。先做脚踝平片再决定是否CT每个关节较合理。',
            },
            outcome: {
              patient: {
                en: 'The scanner is loud; they explain in Bengali via an interpreter line.',
                zh: 'CT机很响;医护透过孟加拉语翻译热线解释。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'CT: stable L1 wedge compression fracture, < 25% loss of height, no canal compromise. Ankle: lateral malleolus avulsion.',
                zh: 'CT:稳定的L1楔形压缩性骨折,高度丢失 < 25%,无椎管受累。脚踝:外踝撕脱性骨折。',
              },
            },
            effects: { setFlags: ['l1-wedge-fracture'] },
          },
          {
            id: 'plain-films-only',
            label: {
              en: 'Plain films of T-L spine + ankle; reserve CT only if plain films abnormal.',
              zh: '胸腰椎 + 脚踝平片;平片异常时才做CT。',
            },
            score: 3,
            rationale: {
              en: 'Plain films miss occult vertebral injury and add radiation if you end up CT-ing anyway. NICE / ATLS prefer CT for significant mechanism.',
              zh: '平片可能漏掉隐匿椎体损伤,最终还要CT反而多吃辐射。NICE / ATLS对重大机制优先CT。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'Plain T-L film reported "no fracture"; symptoms persist.',
                zh: '胸腰椎平片报告"未见骨折";症状仍持续。',
              },
            },
            effects: { setFlags: ['delayed-diagnosis'] },
          },
          {
            id: 'mri-first',
            label: { en: 'MRI whole spine + ankle MRI now.', zh: '立即做全脊柱MRI + 脚踝MRI。' },
            score: 0,
            rationale: {
              en: 'MRI is for spinal-cord injury / ligamentous concern; not the first-line for bony spinal trauma. Slow and expensive.',
              zh: 'MRI适用于脊髓损伤或韧带损伤的怀疑;并非骨性脊柱创伤一线。慢且贵。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-clinical',
            label: {
              en: 'Discharge with analgesia; clinical follow-up by site clinic.',
              zh: '开止痛药出院;由工地诊所跟进。',
            },
            score: -10,
            rationale: {
              en: 'Missed unstable spinal injury risks paralysis. Standard of care requires imaging here.',
              zh: '漏诊不稳定脊柱损伤可能瘫痪。此处标准照护必须影像评估。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'admission-choice',
      department: 'ward',
      facility: 'nuh',
      durationMin: 4320,
      costSGD: 1800,
      charge: 'inpatient-ward',
      requiresAnyFlag: ['l1-wedge-fracture'],
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 18 },
      framing: {
        patient: { en: '', zh: '' },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'L1 wedge fracture, neurologically intact, stable on CT. Plan: TLSO brace, mobilise within 48h, 3-day admission.',
          zh: 'L1楔形骨折,神经完整,CT稳定。计划:TLSO胸腰骶矫形器,48小时内开始活动,住院3天。',
        },
      },
      decision: {
        id: 'admit-class',
        prompt: {
          en: 'Worker is a foreigner: no MShL, no MediSave, no subsidy. How to bill the admission?',
          zh: '该工人是外籍人士:无MediShield Life、无MediSave、无津贴。住院如何计费?',
        },
        weight: 1.4,
        reference: FWMI,
        options: [
          {
            id: 'fwmi-direct-bill',
            label: {
              en: 'Admit Class C ward; bill the employer\'s FWMI insurer directly (Letter of Guarantee from employer).',
              zh: '收入C级病房;凭雇主保函(LoG)直接向FWMI保险公司计费。',
            },
            score: 10,
            rationale: {
              en: 'FWMI requires the employer to insure for ≥ S$60,000/year. Direct billing avoids the worker paying out-of-pocket. Class C is the cheapest ward — keeps the FWMI claim within limits.',
              zh: 'FWMI要求雇主投保每年至少S$60,000。直接计费可让工人无需自付。C级病房最便宜 — 让FWMI索赔不超额。',
            },
            outcome: {
              patient: {
                en: 'A six-bed room. The dorm WhatsApp group sends prayers.',
                zh: '六人间病房。宿舍的WhatsApp群送来祝福。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'FWMI claim opened; LoG faxed by employer HR.',
                zh: 'FWMI索赔已开立;雇主人事部传真保函。',
              },
            },
            effects: { wardClass: 'C', setFlags: ['fwmi-direct-bill'] },
          },
          {
            id: 'private-class-b1',
            label: {
              en: 'Admit Class B1 — employer can claim later if they wish.',
              zh: '收入B1级病房 — 雇主之后想报销再报。',
            },
            score: 4,
            rationale: {
              en: 'B1 is far more expensive at full private rate. May exhaust the FWMI cap on a single admission and leave the worker liable for the excess if the employer disputes.',
              zh: 'B1按完整私立价计费贵得多。可能因一次住院就用尽FWMI保额上限;若雇主推诿,工人将承担差额。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
            effects: { wardClass: 'B1' },
          },
          {
            id: 'worker-pays-cash',
            label: {
              en: 'Bill the worker directly; he can recover from the employer later.',
              zh: '直接向工人计费;让他之后向雇主追讨。',
            },
            score: -6,
            rationale: {
              en: 'WICA Section 14 says employer is liable for medical expenses for work injuries. Demanding payment from the worker undermines the protection MOM built. Also impractical — worker has no MediSave.',
              zh: 'WICA第14条规定:工伤医疗费用由雇主承担。要求工人付款违背人力部建立的保护机制;实务上也不可行 — 工人没有MediSave。',
            },
            outcome: {
              patient: { en: '', zh: '' },
              caregiver: {
                en: 'You stop sleeping; your wife sends you the family savings.',
                zh: '你睡不着;太太把家里的积蓄汇给你。',
              },
              staff: { en: '', zh: '' },
            },
            effects: { caregiverBurden: { financialWorry: 25, sleepDebt: 20 } },
          },
        ],
      },
    },
    {
      id: 'discharge-mc',
      department: 'discharge',
      facility: 'nuh',
      durationMin: 60,
      requiresAnyFlag: ['l1-wedge-fracture'],
      framing: {
        patient: {
          en: 'You can sit, walk a few steps in the brace. The MC paper is in your hand.',
          zh: '戴着矫形器你能坐起来、走几步。手里拿着病假单(MC)。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Discharge: TLSO brace 8 weeks, no lifting > 5 kg, follow-up at ortho-spine SOC in 2 weeks.',
          zh: '出院:TLSO矫形器佩戴8周,不得提起 > 5 kg,2周后骨科脊柱专科门诊复查。',
        },
      },
      decision: {
        id: 'medical-leave',
        prompt: {
          en: 'Medical leave (MC) duration + MOM reporting?',
          zh: '病假(MC)时长 + 是否呈报人力部?',
        },
        weight: 1.3,
        reference: MOM_WICA,
        options: [
          {
            id: 'mc-21d-wica',
            label: {
              en: '21-day MC; employer must file MOM iReport within 10 days; insurer pays MC wages at 2/3 average earnings.',
              zh: '21天MC;雇主须在10天内通过iReport向人力部呈报;保险公司按平均工资的2/3支付病假期工资。',
            },
            score: 10,
            rationale: {
              en: 'WICA-compliant. > 3 days MC + work injury triggers mandatory employer notification to MOM. Worker gets 2/3 wages during MC, 100% of medical bills via insurer.',
              zh: '符合WICA。MC > 3天 + 工伤即触发雇主向人力部呈报的强制义务。工人病假期获2/3工资,医疗费用由保险公司全额承担。',
            },
            outcome: {
              patient: {
                en: 'You go back to the dorm in a brace, with a fan and a copy of the MC.',
                zh: '你戴着矫形器回宿舍,带着风扇和一份MC复印件。',
              },
              caregiver: { en: '', zh: '' },
              staff: {
                en: 'iReport filed; insurer claim pending.',
                zh: 'iReport已提交;保险公司理赔受理中。',
              },
            },
            effects: { setFlags: ['wica-filed'] },
          },
          {
            id: 'mc-3d-pressure',
            label: {
              en: 'Give 3 days MC only — employer asked to "keep it short". Worker can come back on light duties.',
              zh: '只开3天MC — 雇主要求"尽量短"。工人可回去做轻活。',
            },
            score: -7,
            rationale: {
              en: 'Pressuring a clinically inadequate MC for cost reasons is unethical and dangerous for an L1 fracture in a brace. Also legally exposes the employer if injury progresses.',
              zh: '因费用压力开具临床上不足的MC既不合伦理,也对戴矫形器的L1骨折危险。如果伤情进展还会让雇主面临法律风险。',
            },
            outcome: {
              patient: {
                en: 'You return to the site after 4 days, in pain.',
                zh: '你4天后忍痛回到工地。',
              },
              caregiver: { en: '', zh: '' },
              staff: { en: '', zh: '' },
            },
            effects: { setFlags: ['inadequate-mc'] },
          },
          {
            id: 'mc-no-report',
            label: {
              en: 'Issue MC; tell the employer they don\'t need to report — it\'s a "minor injury".',
              zh: '开MC;告诉雇主不必呈报 — 是"小伤"。',
            },
            score: -10,
            rationale: {
              en: 'Mandatory under WICA Section 11. Employer failing to report is a criminal offence up to S$5,000 fine for first offence. Active concealment exposes both clinician and employer.',
              zh: 'WICA第11条规定的强制义务。雇主不呈报属刑事罪,首犯可罚款至S$5,000。主动隐瞒会让医师与雇主双双暴露在法律风险下。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'followup',
      department: 'soc',
      facility: 'nuh',
      durationMin: 30,
      costSGD: 220,
      charge: 'soc',
      framing: {
        patient: {
          en: 'Two weeks later. The brace is hot. You ask when you can fly home to see your family.',
          zh: '两周后。矫形器很闷。你问什么时候能飞回家看家人。',
        },
        caregiver: { en: '', zh: '' },
        staff: {
          en: 'Ortho SOC: tender L1, no neurology, ankle healing. Imaging unchanged.',
          zh: '骨科专科门诊:L1仍有压痛,无神经体征,脚踝渐愈合。影像无变化。',
        },
      },
      decision: {
        id: 'social-plan',
        prompt: {
          en: 'Discharge / repatriation considerations?',
          zh: '出院 / 遣返时机的考虑?',
        },
        weight: 1,
        reference: MOM_WICA,
        options: [
          {
            id: 'continue-mc-rehab',
            label: {
              en: 'Continue MC + brace 6 more weeks; arrange physiotherapy via FWMI; flag dorm-based light-duty plan with employer.',
              zh: '继续MC + 再戴矫形器6周;通过FWMI安排物理治疗;与雇主商定宿舍内轻工作方案。',
            },
            score: 10,
            rationale: {
              en: 'Standard fracture recovery. Light-duty work is permissible only when bone-healing allows. Many employers offer in-dorm rehab arrangements with HCPs.',
              zh: '标准骨折恢复。骨愈合允许时才可安排轻工作。许多雇主可与医疗服务机构合作提供宿舍内康复安排。',
            },
            outcome: {
              patient: {
                en: 'You video-call your daughter. She asks if you can come home.',
                zh: '你和女儿视讯。她问你能不能回家。',
              },
              caregiver: { en: '', zh: '' },
              staff: { en: '', zh: '' },
            },
          },
          {
            id: 'repatriate-now',
            label: {
              en: 'Recommend immediate repatriation to Bangladesh for continued care — employer wants to "close the case".',
              zh: '建议立即遣返孟加拉国继续治疗 — 雇主希望"了结此案"。',
            },
            score: 2,
            rationale: {
              en: 'Repatriation before MOM signs off on permanent-incapacity assessment can void the worker\'s WICA entitlement. MOM frowns on premature repatriation for active claims.',
              zh: '人力部尚未完成永久伤残评定前遣返可能让工人失去WICA权益。对仍有索赔的案件,人力部不鼓励过早遣返。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-no-followup',
            label: {
              en: 'Discharge to GP; no further hospital follow-up.',
              zh: '转给家庭医生;不再安排医院随访。',
            },
            score: -3,
            rationale: {
              en: 'Vertebral fracture warrants specialist surveillance until healing is documented.',
              zh: '椎体骨折在愈合记录确认前需要专科监测。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
