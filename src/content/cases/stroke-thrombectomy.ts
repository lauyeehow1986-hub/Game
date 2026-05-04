import type { CaseDefinition } from '../../lib/types';

const SCDF_STROKE = {
  label: 'SCDF Pre-hospital Stroke Pathway',
  body: 'SCDF EMS protocol — FAST identification, hospital pre-notification, transport to nearest stroke-capable ED.',
};

const MOH_STROKE = {
  label: 'MOH CPG Stroke (2018)',
  body: 'Singapore Ministry of Health Clinical Practice Guidelines for stroke prevention and acute management.',
};

const ESO_2022 = {
  label: 'ESO 2022 Mechanical Thrombectomy',
  body: 'European Stroke Organisation guidelines on endovascular treatment of large-vessel occlusion stroke.',
};

const HEALTHIER_SG = {
  label: 'Healthier SG',
  body: 'Right-siting stable post-stroke patients to a primary-care provider for secondary prevention.',
};

export const strokeThrombectomy: CaseDefinition = {
  id: 'stroke-thrombectomy',
  title: 'Acute Ischaemic Stroke — 67 y/o female, large-vessel occlusion',
  blurb:
    'Mdm Lee, 67. Sudden right-sided weakness and aphasia at home in Clementi 30 min ago. Husband called 995. SCDF en route. NUH ED is the nearest stroke-capable centre.',
  category: 'acute',
  primaryFacility: 'nuh',
  involvedFacilities: ['nuh', 'jch'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [SCDF_STROKE, MOH_STROKE, ESO_2022, HEALTHIER_SG],
  pathway: [
    {
      id: 'arrival',
      department: 'entrance',
      facility: 'nuh',
      durationMin: 3,
      framing: {
        patient: '(slumped to one side, drooling, eyes open but tracking only one direction)',
        caregiver: 'You held her hand the whole way. The paramedic kept telling you the time.',
        staff: 'SCDF radio: 67F, FAST positive at 30 min, last-seen-well 50 min, BP 178/96. ETA 2 min. Stroke team activated.',
      },
      decision: {
        id: 'pre-hospital-routing',
        prompt:
          'SCDF is 2 min out. NUH is the nearest comprehensive stroke centre with thrombectomy capability. What does the receiving team do?',
        weight: 1.5,
        reference: SCDF_STROKE,
        options: [
          {
            id: 'stroke-fast-track',
            label:
              'Activate stroke fast-track: ED bypasses to CT immediately on arrival; stroke neurologist meets at CT scanner; bloods at point of care.',
            score: 10,
            rationale:
              'Direct-to-CT pathways shave ~15-20 min off door-to-needle and door-to-puncture times. Time is brain — every minute lost = 1.9 million neurons.',
            outcome: {
              patient: '(wheeled past triage straight into the scanner)',
              caregiver: 'You are met by a Care Liaison Officer who explains every step.',
              staff: 'Stroke neurologist, neurointerventionalist, nurse, radiographer all assembled at CT in 8 min.',
            },
          },
          {
            id: 'standard-triage',
            label: 'Standard ED triage; CT after registration and bloods.',
            score: 1,
            rationale:
              'Defensible but every minute lost means more infarcted tissue. Modern stroke pathways prioritise direct-to-CT.',
            outcome: { patient: '', caregiver: '', staff: 'Door-to-imaging delayed by ~25 min.' },
          },
          {
            id: 'transfer-to-other-centre',
            label: 'Send SCDF to a non-stroke-capable hospital closer.',
            score: -10,
            rationale:
              'Stroke care is centralised at thrombectomy-capable centres. Diverting away costs irreversible brain tissue.',
            outcome: { patient: '', caregiver: '', staff: 'SCDF protocol violated; serious M&M case.' },
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
        patient: '(eyes open, moaning, not responsive to verbal commands)',
        caregiver: 'You see four staff in the resus bay around her. Your son arrives.',
        staff: 'NIHSS 18 (severe). BP 178/96. POC glucose 6.4. ECG sinus. IV access x2. Bloods sent.',
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
        patient: '(eyes closed in scanner)',
        caregiver: 'You wait outside the scanner with a nurse who keeps you informed.',
        staff: 'Non-contrast CT: no haemorrhage, ASPECTS 8. CTA: left M1 occlusion. CT perfusion: small core, large penumbra. Eligible for thrombectomy.',
      },
      decision: {
        id: 'reperfusion-strategy',
        prompt:
          'Time from last-seen-well: 75 min. Left M1 occlusion, NIHSS 18, ASPECTS 8, mismatch present. No contraindication to tPA. What reperfusion strategy?',
        weight: 1.5,
        reference: ESO_2022,
        options: [
          {
            id: 'iv-tpa-then-evt',
            label: 'IV tPA (alteplase) bridge + immediate transfer to endovascular suite for mechanical thrombectomy.',
            score: 10,
            rationale:
              'Within 4.5h of onset and large-vessel occlusion: IV tPA + thrombectomy is standard. Bridging therapy improves outcomes vs thrombectomy alone in early window.',
            outcome: {
              patient: '(infusion running; whisked from CT to endovascular suite)',
              caregiver: 'You sign consent. Hands shaking.',
              staff: 'tPA bolus + infusion at 14 min. Endovascular team paged; suite ready in 5 min.',
            },
          },
          {
            id: 'evt-only',
            label: 'Skip IV tPA, proceed straight to thrombectomy.',
            score: 6,
            rationale:
              'Some trials (DIRECT-MT, MR CLEAN-NO IV) suggest non-inferiority of EVT alone in selected centres, but Singapore practice and guidelines still favour bridging therapy when not contraindicated.',
            outcome: { patient: '', caregiver: '', staff: 'Defensible; debated at neuro grand round.' },
          },
          {
            id: 'tpa-only',
            label: 'IV tPA only; no thrombectomy.',
            score: -2,
            rationale:
              'Misses the major benefit of EVT in M1 occlusion. tPA alone has limited reperfusion success in large-vessel occlusion (~30%).',
            outcome: { patient: '', caregiver: '', staff: 'NIHSS at 24h higher than expected; M&M discussion.' },
          },
          {
            id: 'no-treatment',
            label: 'No reperfusion — admit to stroke unit for supportive care.',
            score: -10,
            rationale:
              'Eligible patient denied evidence-based therapy. Severe disability or death likely.',
            outcome: { patient: '', caregiver: '', staff: 'Critical incident; serious M&M.' },
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
        patient: '(awake, mildly sedated, on the angio table)',
        caregiver: 'You wait in the family lounge. The clock seems frozen.',
        staff: 'Right common femoral access; aspiration + stent retriever; recanalisation TICI 2b at 50 min from groin puncture. Door-to-puncture 32 min, door-to-recanalisation 82 min.',
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
        patient: '(NIHSS now 6 — moving the right side weakly, speech returning in single words)',
        caregiver: 'You see her squeeze your hand back for the first time. You both cry.',
        staff: 'Post-procedure obs in NeuroICU; BP 140-160 systolic target; no haemorrhagic transformation on 24h CT.',
      },
      decision: {
        id: 'subsidy-class',
        prompt:
          'Mdm Lee is means-test eligible (per-capita income S$950, MG card, no IP rider). Husband worried about the bill. MSW asks about ward class.',
        weight: 0.8,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'class-c',
            label: 'Class C (highest subsidy ~85% with PG/MG top-up).',
            score: 10,
            rationale:
              'Means-test plus Merdeka Generation top-up gives the highest subsidy. Same neurologist, same evidence-based care.',
            outcome: { patient: 'A 6-bedder cubicle.', caregiver: 'You see the bill estimate and breathe out.', staff: 'MSW happy.' },
          },
          {
            id: 'class-b2',
            label: 'Class B2.',
            score: 7,
            rationale: 'Reasonable; smaller subsidy.',
            outcome: { patient: '', caregiver: '', staff: 'OK.' },
          },
          {
            id: 'class-a',
            label: 'Class A — single room, no subsidy.',
            score: -4,
            rationale: 'Avoidable financial harm; no clinical benefit from amenity choice.',
            outcome: { patient: '', caregiver: 'Family considers Medifund.', staff: 'MSW counsels family.' },
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
        patient: '(walking with a frame by day 4; mild expressive aphasia improving)',
        caregiver: 'You bring her favourite kueh. She names it correctly. You both laugh.',
        staff: 'Stroke unit bundle: dysphagia screen, VTE prophylaxis, statin, antiplatelet (clopidogrel 75 mg started after 24h post-tPA), AF screen.',
      },
      decision: {
        id: 'secondary-prevention',
        prompt:
          'Cause workup: ECG and 24h Holter showed sinus rhythm. Echo: normal. Carotid US: no significant stenosis. CTA already showed no atheroma. What secondary prevention do you start?',
        weight: 1.2,
        reference: MOH_STROKE,
        options: [
          {
            id: 'aspirin-statin-bp',
            label:
              'Aspirin 100 mg OD + clopidogrel 75 mg OD x 21 days (CHANCE/POINT) → aspirin alone; high-intensity statin; BP target < 130/80; lifestyle / smoking cessation.',
            score: 10,
            rationale:
              'Short-term DAPT for 21 days followed by single antiplatelet is standard for non-cardioembolic minor stroke / TIA (CHANCE-2, POINT, THALES). High-intensity statin reduces recurrence (SPARCL).',
            outcome: { patient: 'A new pillbox.', caregiver: 'You take a photo of every tablet.', staff: 'GDMT charted.' },
          },
          {
            id: 'noac',
            label: 'Direct oral anticoagulant for AF.',
            score: -3,
            rationale: 'No AF detected; anticoagulation here adds bleeding risk without indication.',
            outcome: { patient: '', caregiver: '', staff: 'Reverted on senior review.' },
          },
          {
            id: 'aspirin-only',
            label: 'Aspirin 100 mg OD only; no statin (cholesterol normal).',
            score: 4,
            rationale:
              'High-intensity statin is recommended post-stroke regardless of LDL (SPARCL); statin omission misses ~16% relative-risk reduction in recurrence.',
            outcome: { patient: '', caregiver: '', staff: 'Senior reg adds statin.' },
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
        patient: 'A new building. The therapist asks you to name pictures. You laugh at how slow you are. You name them anyway.',
        caregiver: 'You can sleep at home. You visit on weekends.',
        staff: 'Step-down to JCH for inpatient rehab. PT/OT/SLT triple package; cognitive rehab; mood screen.',
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      facility: 'jch',
      durationMin: 30,
      framing: {
        patient: 'You walk out of the lift unaided. The husband cries.',
        caregiver: 'You start a WhatsApp group with the rehab team for after-discharge questions.',
        staff: 'Discharged home with home-care therapy + AH@Home virtual ward enrolment + Healthier-SG GP referral.',
      },
      decision: {
        id: 'right-siting',
        prompt:
          'Long-term post-stroke care plan?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-care',
            label:
              'Healthier-SG GP for chronic disease + secondary prevention; NUH stroke clinic at 3 months then annually; AH@Home virtual rehab for 6 weeks.',
            score: 10,
            rationale:
              'Shared-care model: specialist surveillance + primary-care continuity + virtual rehab. Reduces SOC load and improves adherence.',
            outcome: { patient: 'Your GP near home calls each month.', caregiver: 'Less travel.', staff: 'NEHR / HealthHub populated.' },
          },
          {
            id: 'soc-only',
            label: 'NUH neurology SOC every 3 months indefinitely.',
            score: 4,
            rationale: 'Specialist time better used for complex cases; stable patients fit primary care.',
            outcome: { patient: '', caregiver: 'Repeated time off.', staff: 'SOC slots squeezed.' },
          },
          {
            id: 'no-followup',
            label: 'Discharge to GP with no surveillance.',
            score: -4,
            rationale: 'Misses recurrent stroke detection and therapy adherence.',
            outcome: { patient: '', caregiver: '', staff: 'Recurrent event possible.' },
          },
        ],
      },
    },
  ],
};
