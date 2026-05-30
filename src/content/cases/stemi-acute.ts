import type { CaseDefinition } from '../../lib/types';

const MOH_ACS = {
  label: 'MOH CPG 2/2014: Acute Coronary Syndrome (superseded by ESC 2023 ACS)',
  body: 'Singapore Ministry of Health Clinical Practice Guidelines, ACS 2014 — largely superseded by the unified ESC 2023 ACS guideline; retained for historical context.',
};

const ESC_STEMI = {
  label: 'ESC 2023 ACS Guidelines',
  body: 'European Society of Cardiology 2023 guideline on acute coronary syndromes (unified STEMI + NSTE-ACS). Routine P2Y12 pre-treatment before angiography is now Class IIb-B (not routinely recommended). For ACS proceeding to PCI, prasugrel is preferred over ticagrelor (ISAR-REACT 5).',
};

const SCDF_TRIAGE = {
  label: 'SCDF EMS triage protocol',
  body: 'Singapore Civil Defence Force pre-hospital ECG and STEMI activation pathway.',
};

const HEALTHIER_SG = {
  label: 'MOH Healthier SG (2023)',
  body: 'Right-siting of chronic care to a primary-care provider after acute episodes.',
};

export const stemiAcute: CaseDefinition = {
  id: 'stemi-acute',
  title: {
    en: 'Acute STEMI — 58 y/o male, central chest pain',
    zh: '急性ST段抬高心肌梗死 — 58岁男性,胸骨后疼痛',
  },
  blurb: {
    en: 'Mr Tan, 58, taxi driver. Crushing chest pain 30 min ago, radiating to the left arm. Diaphoretic. SCDF en route to TTSH.',
    zh: '陈先生,58岁,出租车司机。30分钟前发作压榨样胸痛,放射至左臂,大汗淋漓。SCDF救护车正前往陈笃生医院。',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  randomiseProfile: true,
  acuteTimer: {
    goalMin: 90,
    goalLabel: 'Door-to-balloon',
    missedFlag: 'd2b-missed',
  },
  guidelines: [MOH_ACS, ESC_STEMI, SCDF_TRIAGE, HEALTHIER_SG],
  pathway: [
    {
      id: 'arrival',
      department: 'entrance',
      durationMin: 2,
      framing: {
        patient:
          'The ambulance jolts into the bay. Bright lights, voices. The pain is still there. You wonder if you should have just rested at home.',
        caregiver:
          "You followed in a Grab. You don't know which entrance to go to — security points you to the A&E reception.",
        staff:
          'SCDF radios in: 58M, ongoing chest pain, 12-lead transmitted, suspected anterior STEMI. ETA 2 min.',
      },
      decision: {
        id: 'pre-hospital-activation',
        prompt: {
          en: 'SCDF transmits the pre-hospital ECG en route. As ED registrar on duty, what do you do BEFORE the patient arrives?',
          zh: 'SCDF途中传送院前心电图。作为值班急诊主治,患者到达之前你应该做什么?',
        },
        weight: 1,
        reference: SCDF_TRIAGE,
        options: [
          {
            id: 'activate-cathlab',
            label: {
              en: 'Activate cath lab now; alert cardiology consultant; prepare resus bay.',
              zh: '立即启动导管室;通知心内科顾问;准备抢救区。',
            },
            score: 10,
            rationale: {
              en: 'Pre-hospital ECG-triggered cath lab activation shaves ~25 min off door-to-balloon time. Singapore data (SHF NSTEMI/STEMI registry) supports early activation.',
              zh: '院前心电图触发的导管室启动可使门-球时间缩短约25分钟。新加坡心脏基金会NSTEMI/STEMI登记数据支持早期启动。',
            },
            outcome: {
              patient: {
                en: 'Doors slide open. Three people in scrubs are already waiting for you.',
                zh: '大门滑开。三位穿手术衣的医护人员已在等候。',
              },
              caregiver: {
                en: 'You are still parking. By the time you reach the counter, your husband has been wheeled in.',
                zh: '你还在停车。等你赶到柜台时,丈夫已被推进抢救区。',
              },
              staff: {
                en: 'Cath lab confirms — team in 12 min. Resus bay ready, clopidogrel/ticagrelor at the bedside.',
                zh: '导管室确认 — 12分钟内集结。抢救区已就绪,氯吡格雷/替格瑞洛已备好床旁。',
              },
            },
          },
          {
            id: 'wait-arrival',
            label: {
              en: 'Wait until the patient arrives and you can repeat the ECG yourself.',
              zh: '等患者到达后自己再做一次心电图。',
            },
            score: 2,
            rationale: {
              en: 'Defensible but slower. Each 30 min delay to reperfusion in STEMI raises 1-year mortality by ~7.5% (Boersma et al.).',
              zh: '可辩护但更慢。STEMI再灌注每延迟30分钟,1年死亡率上升约7.5%(Boersma等)。',
            },
            outcome: {
              patient: {
                en: 'You are wheeled into a busy resus bay; the team only starts mobilising now.',
                zh: '你被推进繁忙的抢救区;团队此刻才开始集结。',
              },
              caregiver: {
                en: 'You arrive before the cath lab team does.',
                zh: '你比导管室团队还早到。',
              },
              staff: {
                en: 'Cath lab activates after your repeat ECG. Door-to-balloon clock starts late.',
                zh: '复查心电图后导管室才启动。门-球计时开始得晚。',
              },
            },
            effects: { setFlags: ['delayed-activation'] },
          },
          {
            id: 'thrombolyse-prehospital',
            label: {
              en: 'Order pre-hospital thrombolysis.',
              zh: '下医嘱院前溶栓。',
            },
            score: -3,
            rationale: {
              en: 'Not standard in Singapore — SCDF protocols transport directly to a PCI-capable centre; thrombolysis is a fallback only when PCI is unavailable within 120 min.',
              zh: '新加坡非标准做法 — SCDF流程是直接转运至可行PCI的中心;只在120分钟内无法行PCI时溶栓才是退路。',
            },
            outcome: {
              patient: {
                en: "You feel a rush of medication you don't understand.",
                zh: '你感到一阵药物在体内涌动,但不明所以。',
              },
              caregiver: {
                en: 'Confusion at the bedside about which step is happening.',
                zh: '床旁的人在搞不清正在执行哪一步。',
              },
              staff: {
                en: 'Protocol deviation flagged. Cardiology asks why thrombolysis was given when PCI was 12 min away.',
                zh: '记录违反流程。心内科质询:PCI仅12分钟外为何先溶栓?',
              },
            },
            effects: { setFlags: ['protocol-deviation', 'delayed-activation'] },
          },
        ],
      },
    },
    {
      id: 'triage',
      department: 'triage',
      durationMin: 3,
      framing: {
        patient: 'A nurse asks your name, your IC, and presses something on your finger.',
        caregiver: 'You watch through the glass. They say "P1" — you don\'t know what that means.',
        staff: 'Vitals: BP 102/64, HR 96, SpO2 95% on RA. Triage P1. Roll straight to resus.',
      },
    },
    {
      id: 'ed-resus',
      department: 'ed',
      durationMin: 12,
      costSGD: 160,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8, sleepDebt: 4 },
      framing: {
        patient: 'They keep cutting your shirt. Wires everywhere. Someone shoves a tablet.',
        caregiver: 'You are asked about allergies, medications, last meal. You scramble to remember.',
        staff: 'IV access x2, FBC/UECr/troponin/coag sent. ECG repeated: 2 mm STE V1–V4. Confirmed anterior STEMI.',
      },
      decision: {
        id: 'antiplatelet-loading',
        prompt:
          'You confirm STEMI. The patient has no contraindication to dual antiplatelet therapy. What loading regimen do you give before cath lab transfer?',
        weight: 1.2,
        reference: ESC_STEMI,
        options: [
          {
            id: 'asa-prasugrel',
            label: 'Aspirin 300 mg + Prasugrel 60 mg loading.',
            score: 10,
            rationale:
              'For ACS proceeding to primary PCI, ESC 2023 prefers prasugrel over ticagrelor (Class IIa, based on ISAR-REACT 5). Aspirin + a potent P2Y12 inhibitor loaded at diagnosis remains standard for STEMI going straight to the cath lab. Avoid prasugrel if prior stroke/TIA, age ≥75, or weight <60 kg.',
            outcome: {
              patient: 'You are told to chew the tablets. Bitter.',
              caregiver: 'A nurse explains the medications and writes them on the board for you.',
              staff: 'DAPT loaded. You sign the cath lab transfer note.',
            },
          },
          {
            id: 'asa-tica',
            label: 'Aspirin 300 mg + Ticagrelor 180 mg loading.',
            score: 9,
            rationale:
              'Aspirin + ticagrelor is a guideline-endorsed regimen for primary PCI and the right choice when prasugrel is contraindicated (prior stroke/TIA, age ≥75, low body weight). ESC 2023 now ranks prasugrel ahead of ticagrelor for ACS-PCI, but ticagrelor remains a strong option.',
            outcome: {
              patient: 'You are told to chew two tablets. Bitter.',
              caregiver: 'A nurse explains the medications and writes them on the board for you.',
              staff: 'DAPT loaded. You sign the cath lab transfer note.',
            },
          },
          {
            id: 'asa-clopi',
            label: 'Aspirin 300 mg + Clopidogrel 600 mg loading.',
            score: 7,
            rationale:
              'Acceptable, especially if bleeding risk is high or ticagrelor unavailable. Less potent platelet inhibition than ticagrelor but lower cost and broader formulary access.',
            outcome: {
              patient: 'Two tablets, water, off you go.',
              caregiver: 'Same nurse explains; everything still feels too fast.',
              staff: 'Loaded. Cardiology comfortable, especially given financial considerations.',
            },
          },
          {
            id: 'asa-only',
            label: 'Aspirin 300 mg only — let cath lab pick the second agent.',
            score: 1,
            rationale:
              'Delays effective platelet inhibition. Most centres want loading done in ED to maximise drug onset by balloon time.',
            outcome: {
              patient: 'One tablet only. Off to the lift.',
              caregiver: '',
              staff: 'Cardiology fellow grumbles in the lift — would have preferred DAPT loaded.',
            },
          },
          {
            id: 'no-antiplatelet',
            label: 'Hold antiplatelets until cath lab confirms culprit lesion.',
            score: -5,
            rationale:
              'Unsafe — STEMI is a thrombotic emergency; loading must occur as early as possible.',
            effects: { setFlags: ['delayed-activation'] },
            outcome: {
              patient: 'You are not given any tablets in the ED.',
              caregiver: '',
              staff: 'Cardiology consultant calls you back to ask why DAPT was withheld.',
            },
          },
        ],
      },
    },
    {
      id: 'imaging-bedside',
      department: 'imaging',
      durationMin: 5,
      costSGD: 90,
      charge: 'imaging',
      framing: {
        patient: 'They wheel you past more lights and a big machine.',
        caregiver: 'A staff member directs you to wait outside; you can see your husband through a window.',
        staff:
          'Bedside CXR rules out pneumothorax / aortic dissection mimics before heparinisation. POCUS: anterior wall hypokinesis confirms territory.',
      },
    },
    {
      id: 'cath-lab',
      department: 'cathlab',
      durationMin: 55,
      costSGD: 4200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 18, sleepDebt: 6 },
      framing: {
        patient: 'A new room, more cold gel. Someone says "small prick at the wrist." You drift.',
        caregiver:
          "You sit alone in the relatives' room. A volunteer brings you water. The clock on the wall stretches.",
        staff: 'Radial access, 6F sheath, 90 IU/kg heparin. LAD culprit, TIMI 0 → DES deployed → TIMI 3. Door-to-balloon 64 min.',
      },
      decision: {
        id: 'access-route',
        prompt:
          'The interventional cardiologist asks your preference for arterial access in this haemodynamically stable, non-shocked patient.',
        weight: 1,
        reference: ESC_STEMI,
        options: [
          {
            id: 'radial',
            label: 'Radial access.',
            score: 10,
            rationale:
              'MATRIX and RIVAL trials show lower bleeding and mortality with radial vs femoral in ACS. Default in stable STEMI.',
            outcome: {
              patient: 'A small prick on your wrist; you barely feel it.',
              caregiver: 'Tells you it went well — early ambulation expected.',
              staff: 'Radial closure, smooth case, post-procedure straight to CICU.',
            },
          },
          {
            id: 'femoral',
            label: 'Femoral access.',
            score: 5,
            rationale:
              'Reasonable if radial fails or the patient is shocked needing IABP / large-bore access. Higher access-site bleeding risk.',
            outcome: {
              patient: 'A bandage on your groin; you can\'t move that leg for hours.',
              caregiver: '',
              staff: 'Manual compression, longer bed-rest, consider FemoStop if oozing.',
            },
          },
          {
            id: 'thrombolyse-here',
            label: 'Switch to in-hospital thrombolysis instead of PCI.',
            score: -10,
            rationale:
              'Already in a PCI-capable centre with team activated — primary PCI is superior to thrombolysis when achievable in time.',
            outcome: {
              patient: '',
              caregiver: '',
              staff: 'Consultant overrides — proceed to PCI.',
            },
          },
        ],
      },
    },
    {
      id: 'cardiogenic-shock',
      department: 'icu',
      requiresAnyFlag: ['delayed-activation', 'd2b-missed', 'protocol-deviation'],
      durationMin: 60,
      costSGD: 1800,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 18, sleepDebt: 12 },
      framing: {
        patient: '(post-PCI hypotension; vasopressors started; Swan-Ganz line considered.)',
        caregiver: 'You are pulled into the family room. The phrase "complicated" is used twice.',
        staff: 'Post-PCI cardiogenic shock — late reperfusion; large infarct territory. IABP discussion; consider tertiary mechanical circulatory support transfer.',
      },
      decision: {
        id: 'shock-management',
        prompt:
          'Post-PCI cardiogenic shock. SBP 78 on noradrenaline. Lactate 5.2. Echo: severe LV dysfunction. What now?',
        weight: 1.5,
        reference: ESC_STEMI,
        options: [
          {
            id: 'iabp-mcs',
            label: 'IABP plus consider transfer to tertiary mechanical circulatory support (NHCS / NUHCS) for VA-ECMO.',
            score: 10,
            rationale:
              'Cardiogenic shock from STEMI requires haemodynamic support; ECMO/Impella centres are the appropriate venue when standard support insufficient.',
            outcome: {
              patient: '(transferred for advanced support.)',
              caregiver: 'You travel to NHCS. The team there meets you.',
              staff: 'IABP placed; NHCS accepts; transfer overnight.',
            },
            effects: { setFlags: ['post-shock'] },
          },
          {
            id: 'maximise-medical',
            label: 'Maximise vasopressors and inotropes; defer mechanical support.',
            score: 4,
            rationale:
              'Acceptable while awaiting decision but vasopressors at high doses worsen myocardial demand; mechanical support discussion shouldn\'t wait.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['post-shock'] },
          },
          {
            id: 'comfort-only',
            label: 'Comfort-only care.',
            score: -8,
            rationale: 'Premature; reversible mechanical complications need to be assessed first.',
            outcome: { patient: '', caregiver: 'Family meeting requested.', staff: 'Reverted on senior review.' },
          },
        ],
      },
    },
    {
      id: 'family-meeting',
      department: 'ward',
      requiresAnyFlag: ['post-shock', 'financial-distress'],
      durationMin: 30,
      framing: {
        patient: '(in bed listening; sometimes nodding.)',
        caregiver: 'You are in the family room with the consultant, the nurse manager, and the medical social worker. Nobody is rushing.',
        staff: 'Family meeting: prognosis, GDMT, financial counselling, cardiac rehab eligibility, secondary-prevention plan.',
      },
      decision: {
        id: 'financial-mitigation',
        prompt: 'How do you address the financial-distress signal raised earlier?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'msw-medifund',
            label: 'MSW activates Medifund, downgrade ward class going forward, structured Healthier-SG GP enrolment.',
            score: 10,
            rationale: 'Catches financial toxicity before it derails GDMT adherence.',
            outcome: { patient: '', caregiver: 'You feel less alone.', staff: 'Medifund + downgrade plan signed.' },
            effects: {
              wardClass: 'C',
              clearFlags: ['financial-distress'],
              caregiverBurden: { financialWorry: -16 },
            },
          },
          {
            id: 'no-mitigation',
            label: 'Note the bill but no MSW intervention.',
            score: -4,
            rationale: 'Patient stops eplerenone within a month; predictable HF readmission.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'icu',
      department: 'icu',
      durationMin: 1440, // ~24 h
      costSGD: 950,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 12, sleepDebt: 18 },
      framing: {
        patient: 'Beeps. A long night. A nurse adjusts something on your arm every hour.',
        caregiver: 'Visiting hours are restricted. You are told he is stable. You cry in the corridor.',
        staff: '12-hour troponin trend down-trending. No arrhythmia. Echo: EF 40%, anterior hypokinesis.',
      },
      decision: {
        id: 'medical-therapy',
        prompt:
          'EF 40%, no contraindications. What guideline-directed medical therapy do you start before transfer to the ward?',
        weight: 1.5,
        reference: MOH_ACS,
        options: [
          {
            id: 'full-gdmt',
            label:
              'DAPT + high-intensity statin + ACE-inhibitor + beta-blocker + MRA (eplerenone given EF ≤ 40%).',
            score: 12,
            rationale:
              'Full guideline-directed medical therapy after STEMI with reduced EF. EPHESUS supports MRA in post-MI EF ≤ 40% with HF or DM.',
            outcome: {
              patient: 'A box with five different tablets. The pharmacist explains them one by one.',
              caregiver: 'You take photos of each pill so you remember.',
              staff: 'GDMT charted. Nephrology/cards comfortable; biochemistry stable.',
            },
          },
          {
            id: 'partial-gdmt',
            label: 'DAPT + statin + beta-blocker only — defer ACE-i / MRA to outpatient.',
            score: 6,
            rationale:
              'Acceptable in some patients, but in-hospital initiation of ACE-i and (if EF ≤ 40%) MRA is associated with better adherence and outcomes.',
            outcome: {
              patient: 'Three tablets. Easier to remember.',
              caregiver: '',
              staff: 'SOC team will need to up-titrate later — adherence often slips.',
            },
          },
          {
            id: 'minimal-gdmt',
            label: 'DAPT only.',
            score: -2,
            rationale:
              'Misses the mortality benefit of statin and neurohormonal blockade post-STEMI.',
            outcome: { patient: '', caregiver: '', staff: 'Consultant queries the missing therapies on round.' },
          },
        ],
      },
    },
    {
      id: 'ward',
      department: 'ward',
      durationMin: 4320, // 3 days
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 22, sleepDebt: 10 },
      framing: {
        patient:
          'Day 2 — the curtain neighbour snores. The food is bland. You start to think about going home, your taxi rental, your bills.',
        caregiver:
          'You ask the medical social worker about MediSave and MediShield Life. You worry about the next instalment on the flat.',
        staff:
          'Ambulating, no chest pain, no arrhythmia. MSW engaged for financial counselling. Cardiac rehab referral made.',
      },
      decision: {
        id: 'subsidy-class',
        prompt:
          'The medical social worker asks about ward class and financing. The patient is a Singaporean taxi driver, household income S$2,400/mo, no Integrated Shield Plan, has CHAS Orange.',
        weight: 0.8,
        reference: {
          label: 'MOH ward class subsidy framework',
          body: 'Means-tested subsidies for ward classes B2 and C in restructured hospitals.',
        },
        options: [
          {
            id: 'class-c',
            label: 'Class C ward (highest subsidy, ~80%).',
            score: 10,
            rationale:
              'Means-tested subsidy aligns with household income. Reduces caregiver financial stress and out-of-pocket; MediShield Life covers the bulk of remaining bill.',
            outcome: {
              patient: 'Same care, shared cubicle. Manageable bill.',
              caregiver: 'Relief — you can see the figures and they are workable.',
              staff: 'MSW happy. Bill estimated S$1,400 patient share.',
            },
            effects: { wardClass: 'C' },
          },
          {
            id: 'class-b1',
            label: 'Class B1 (modest subsidy ~20%).',
            score: 3,
            rationale:
              'Patient still has access to subsidised doctors but room amenity does not change clinical outcomes. Likely large unsubsidised portion.',
            outcome: {
              patient: 'Slightly nicer cubicle. The bill is an unwelcome surprise.',
              caregiver: 'You discover the bill at discharge and panic.',
              staff: 'MSW flags financial distress. Bill reduction application initiated post-discharge.',
            },
            effects: {
              wardClass: 'B1',
              caregiverBurden: { financialWorry: 12, sleepDebt: 4 },
            },
          },
          {
            id: 'class-a',
            label: 'Class A (no subsidy, single room).',
            score: -4,
            rationale:
              'No clinical benefit; substantial financial harm to a low-income patient without an Integrated Shield Plan.',
            outcome: {
              patient: 'A nice room, but the bill at discharge is devastating.',
              caregiver: 'You apply for Medifund after discharge.',
              staff: 'MSW unhappy. Avoidable financial toxicity.',
            },
            effects: {
              wardClass: 'A',
              setFlags: ['financial-distress'],
              caregiverBurden: { financialWorry: 30, sleepDebt: 14 },
            },
          },
        ],
      },
    },
    {
      id: 'pharmacy',
      department: 'pharmacy',
      durationMin: 30,
      costSGD: 80,
      charge: 'pharmacy',
      framing: {
        patient:
          'The pharmacist asks if you smoke. You lie a little. She gives you a smoking-cessation pamphlet anyway.',
        caregiver: 'You ask about side-effects of each tablet and write them down.',
        staff: 'Adherence counselling done. NEHR updated; SOC and rehab appointments printed.',
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      durationMin: 20,
      framing: {
        patient: 'Hospital exit smells different. The taxi-stand sign feels strangely emotional.',
        caregiver: 'You take a Grab home together. You both stay quiet.',
        staff: 'Discharge summary uploaded to NEHR; cardiac rehab and SOC appointments confirmed.',
      },
      decision: {
        id: 'right-siting',
        prompt:
          'For ongoing chronic-disease management (HTN, dyslipidaemia, post-MI follow-up beyond the first review), where should this patient be right-sited?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'healthier-sg-gp',
            label:
              'Enrol with a Healthier SG GP near home; cardiology SOC for review at 2 weeks then 3 months, then annually.',
            score: 10,
            rationale:
              'Healthier SG enrolment provides continuity, subsidised chronic medications via CDMP, and offloads stable follow-up from tertiary clinics.',
            outcome: {
              patient: 'A GP near your block; appointments are easier to make.',
              caregiver: 'Less travel; less time off work for you.',
              staff: 'SOC schedules 2-week review then plans handover to GP.',
            },
          },
          {
            id: 'soc-only',
            label: 'Long-term cardiology SOC only — no GP enrolment.',
            score: 4,
            rationale:
              'Specialist-led care is appropriate early but indefinite SOC follow-up for stable patients clogs tertiary clinics and inflates patient cost over time.',
            outcome: {
              patient: 'Long waits at SOC every 6 months.',
              caregiver: 'Repeated half-days off work.',
              staff: 'SOC slots for new STEMIs squeezed.',
            },
          },
          {
            id: 'no-followup',
            label: 'Discharge with no structured follow-up beyond 2 weeks.',
            score: -5,
            rationale:
              'Post-MI patients without follow-up have worse adherence to GDMT and higher 1-year recurrence/death.',
            outcome: {
              patient: 'You stop the eplerenone after a month because it is unfamiliar.',
              caregiver: 'You worry but don\'t know who to call.',
              staff: 'Recurrent admission within 6 months for decompensated HF.',
            },
          },
        ],
      },
    },
    {
      id: 'soc',
      department: 'soc',
      durationMin: 45,
      costSGD: 110,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 0 },
      framing: {
        patient: 'Two weeks later. The waiting room is full. You are nervous about the bill.',
        caregiver: 'You took half a day off work to come.',
        staff: 'Patient ambulating well, minor bruising at radial site, no chest pain. Up-titrated bisoprolol.',
      },
    },
    {
      id: 'rehab',
      department: 'rehab',
      durationMin: 60,
      costSGD: 70,
      charge: 'rehab',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: -8, sleepDebt: -10 },
      framing: {
        patient:
          'The treadmill is slower than you thought. The physiotherapist tells you you can return to driving in two more weeks.',
        caregiver:
          'You sit in the corridor reading. For the first time since the ambulance, you breathe out.',
        staff:
          'Phase II cardiac rehab session 1/12. Risk-factor counselling: smoking cessation referral made.',
      },
    },
  ],
};
