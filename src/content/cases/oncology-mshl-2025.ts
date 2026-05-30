import type { CaseDefinition } from '../../lib/types';

const CDL = {
  label: { en: 'MediShield Life Cancer Drug List (refreshed 1 Apr 2026)', zh: 'MediShield Life癌症药物清单(CDL,2026年4月1日更新)' },
  body: {
    en: 'Only drugs on the Cancer Drug List are claimable under MediShield Life / MediSave, each at a per-treatment claim limit. A-list (high clinical value) drugs carry higher limits than B-list. Non-CDL drugs are not MediShield-claimable. The CDL was refreshed 1 Apr 2026.',
    zh: '只有列入癌症药物清单(CDL)的药物才能用MediShield Life / MediSave索赔,各设每次治疗索赔上限。A类(临床价值高)药物上限高于B类。未列入CDL的药物不能用MediShield索赔。CDL于2026年4月1日更新。',
  },
};

const MSHL_2025 = {
  label: { en: 'MediShield Life 2025 reform', zh: 'MediShield Life 2025改革' },
  body: {
    en: 'From 2025-26: higher claim limits funded by phased premium increases (offset by government subsidies and MediSave top-ups), tiered 3-10% co-insurance replacing the flat 10%, and a S$500 annual outpatient deductible from Jan 2026. Lower-/middle-income older citizens get 60% premium subsidy (up from 50%).',
    zh: '2025-26年起:以分阶段保费上调(由政府津贴与MediSave填补抵消)提高索赔上限,以3-10%分层共付取代固定10%,并自2026年1月起设每年500新元的门诊自付额。中低收入年长公民保费津贴升至60%(原为50%)。',
  },
};

const FINANCIAL_TOXICITY = {
  label: { en: 'Financial toxicity + MSW / Medifund', zh: '经济毒性 + 医务社工 / 保健基金' },
  body: {
    en: 'Out-of-pocket cancer costs drive non-adherence and treatment abandonment. Early medical-social-worker review layers subsidy, MediShield, MediSave, MAF (Medication Assistance Fund) and Medifund (last-resort) so the patient completes therapy.',
    zh: '癌症自付费用导致依从性下降与中断治疗。尽早由医务社工评估,叠加津贴、MediShield、MediSave、药物援助基金(MAF)与保健基金(Medifund,最后防线),使患者完成治疗。',
  },
};

export const oncologyMshl2025Case: CaseDefinition = {
  id: 'oncology-mshl-2025',
  title: {
    en: 'Stage III breast cancer — financing under the MSHL 2025 reform',
    zh: 'III期乳腺癌 — MSHL 2025改革下的费用安排',
  },
  blurb: {
    en: 'Mdm Lim, 71, Merdeka Generation, HER2-positive stage III breast cancer at NCCS. The MDT recommends trastuzumab-based therapy. She is anxious about cost after hearing premiums went up. How does the bill actually fall under the 2025 MediShield Life reform?',
    zh: 'Lim女士,71岁,立国一代,NCCS诊断为HER2阳性III期乳腺癌。多学科团队建议以曲妥珠单抗为基础的治疗。她听说保费上涨后担心费用。在2025年MediShield Life改革下,账单实际如何分担?',
  },
  category: 'outpatient',
  primaryFacility: 'nccs',
  involvedFacilities: ['nccs', 'sgh'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: false,
  guidelines: [CDL, MSHL_2025, FINANCIAL_TOXICITY],
  pathway: [
    {
      id: 'drug-choice',
      department: 'soc',
      facility: 'nccs',
      durationMin: 45,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 9, sleepDebt: 3 },
      framing: {
        patient: {
          en: 'The oncologist explains a targeted drug that works well for your cancer type. You hear "trastuzumab" and immediately think about money.',
          zh: '肿瘤科医生说明一种对你这型癌症很有效的标靶药。你听到"曲妥珠单抗"立刻想到钱。',
        },
        caregiver: {
          en: 'You are her daughter. You will help pay, but you need to understand what is claimable and what is not.',
          zh: '你是她女儿。你会帮忙出钱,但你需要弄清楚哪些能索赔、哪些不能。',
        },
        staff: {
          en: 'HER2+ stage III: trastuzumab-based regimen is standard. Claimability depends on Cancer Drug List status — choose a CDL-listed regimen where clinically equivalent to keep it MediShield-claimable.',
          zh: 'HER2+ III期:以曲妥珠单抗为基础的方案为标准。可索赔性取决于癌症药物清单状态 — 在临床等效时选择CDL所列方案,以保持可用MediShield索赔。',
        },
      },
      decision: {
        id: 'regimen-financing',
        prompt: {
          en: 'How do you choose the regimen with financing in mind?',
          zh: '如何在考虑费用的前提下选择方案?',
        },
        reference: CDL,
        weight: 1.5,
        options: [
          {
            id: 'cdl-listed',
            label: {
              en: 'Choose the clinically-appropriate CDL-listed trastuzumab regimen so MediShield Life / MediSave apply at the per-treatment claim limit; document indication.',
              zh: '选择临床合适且列入CDL的曲妥珠单抗方案,使MediShield Life / MediSave按每次治疗索赔上限适用;记录适应症。',
            },
            score: 10,
            rationale: {
              en: 'Matching an effective, CDL-listed regimen preserves MediShield/MediSave claimability — the single biggest lever on her out-of-pocket cost. Clinical appropriateness is not compromised here.',
              zh: '选用有效且列入CDL的方案可保住MediShield / MediSave的可索赔性 — 这是影响她自付费用的最大杠杆。此处临床合理性不受影响。',
            },
            effects: { setFlags: ['cdl-regimen'] },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'non-cdl-premium',
            label: {
              en: 'Default to a newer non-CDL agent without checking the list or discussing claimability.',
              zh: '默认选用更新但未列入CDL的药物,不查清单也不谈可索赔性。',
            },
            score: -3,
            rationale: {
              en: 'A non-CDL drug is not MediShield-claimable — the patient bears the full cost. Choosing it without clinical justification or a cost conversation risks treatment abandonment.',
              zh: '未列入CDL的药物不能用MediShield索赔 — 患者承担全额。无临床理由或费用沟通就选用,有中断治疗的风险。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'undertreat-cost',
            label: {
              en: 'Drop targeted therapy entirely to save money, against MDT advice.',
              zh: '为省钱违背多学科团队建议,完全不用标靶治疗。',
            },
            score: -5,
            rationale: {
              en: 'Under-treating curable-intent HER2+ disease to save cost is the wrong trade-off when a claimable CDL option exists. Fix the financing, not the oncology.',
              zh: '在存在可索赔的CDL选项时,为省钱而对有治愈意图的HER2+疾病治疗不足,是错误的取舍。该解决的是费用,而非肿瘤治疗。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'finance-plan',
      department: 'soc',
      facility: 'nccs',
      durationMin: 40,
      costSGD: 0,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 7 },
      framing: {
        patient: {
          en: 'A medical social worker sits with you and a printed estimate. The numbers are big, but she keeps drawing arrows that make them smaller.',
          zh: '一位医务社工与你坐下,拿着一份打印的估算。数字很大,但她不断画箭头把它们变小。',
        },
        caregiver: {
          en: 'You learn what MediShield pays per cycle, what the new outpatient deductible is, and where MediSave and MAF fit. It is the first time the plan feels real.',
          zh: '你了解到MediShield每个疗程支付多少、新的门诊自付额是多少,以及MediSave和MAF如何衔接。这是计划第一次让人觉得真实。',
        },
        staff: {
          en: 'MG senior, CDL regimen. Layer the cascade: subsidy → MediShield Life (tiered co-insurance, S$500 outpatient deductible Jan 2026) → MediSave → MAF → Medifund. MSW review reduces financial toxicity + abandonment.',
          zh: '立国一代长者,CDL方案。叠加级联:津贴 → MediShield Life(分层共付、2026年1月起500新元门诊自付额)→ MediSave → MAF → 保健基金。医务社工评估可降低经济毒性与中断风险。',
        },
      },
      decision: {
        id: 'cascade',
        prompt: {
          en: 'Best financing plan to get her through the full course?',
          zh: '帮助她完成整个疗程的最佳费用方案?',
        },
        reference: FINANCIAL_TOXICITY,
        weight: 1.5,
        options: [
          {
            id: 'full-cascade',
            label: {
              en: 'MSW-led plan: maximise subsidy, MediShield Life CDL claims each cycle, MediSave drawdown, MAF for the drug, MG top-ups; Medifund as last resort; schedule reviews so she never stops for cost.',
              zh: '由医务社工主导:最大化津贴、每疗程的MediShield Life CDL索赔、MediSave提取、药物的MAF、立国一代补助;保健基金作最后防线;安排复诊使她不因费用中断。',
            },
            score: 10,
            rationale: {
              en: 'The full cascade plus active MSW follow-up is the evidence-based answer to financial toxicity. The 2025 reform\'s higher claim limits help, but only if every layer is actually applied.',
              zh: '完整级联加上医务社工主动随访,是应对经济毒性的循证答案。2025改革提高的索赔上限有帮助,但前提是每一层都真正落实。',
            },
            outcome: {
              patient: { en: 'You can see how each month will be paid. You agree to start.', zh: '你能看清每个月怎么付。你同意开始治疗。' },
              caregiver: { en: 'You photograph the plan so you both remember it.', zh: '你把方案拍下来,好让你们都记得。' },
              staff: { en: 'MAF + Medifund applications filed; first cycle booked.', zh: '已提交MAF与保健基金申请;已预约首个疗程。' },
            },
          },
          {
            id: 'medishield-only',
            label: {
              en: 'Tell her MediShield Life will cover it and send her home without an itemised plan.',
              zh: '告诉她MediShield Life会包了,不给逐项方案就让她回家。',
            },
            score: 1,
            rationale: {
              en: 'MediShield Life covers claim-limited amounts only — there is still a deductible, co-insurance and any above-limit gap. An unspecified reassurance leaves her exposed to a mid-course bill shock.',
              zh: 'MediShield Life只支付有上限的金额 — 仍有自付额、共付及任何超限缺口。含糊的安抚会让她在疗程中途遭遇账单冲击。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-msw',
            label: {
              en: 'Skip the MSW; let the family sort out payment themselves.',
              zh: '不转介医务社工;让家属自行处理付款。',
            },
            score: -3,
            rationale: {
              en: 'Without an MSW, eligible schemes (MAF, MG top-ups, Medifund) are routinely under-claimed and abandonment risk rises. This is the avoidable failure mode the reform cannot fix on its own.',
              zh: '没有医务社工,合资格计划(MAF、立国一代补助、保健基金)常被少申领,中断风险上升。这是改革本身无法解决、却可避免的失败模式。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
