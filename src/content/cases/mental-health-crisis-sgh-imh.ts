import type { CaseDefinition } from '../../lib/types';

const NICE_SH = {
  label: 'NICE NG225 — Self-harm assessment, management & preventing recurrence',
  body: 'All people who self-harm should receive a psychosocial assessment by a mental-health professional. Compassionate, person-centred approach; risk assessment is one input, not a triage filter.',
};

const MHCTA = {
  label: 'Mental Health (Care & Treatment) Act 2008',
  body: 'Singapore statute governing involuntary admission for assessment (up to 72 h) and treatment (up to 1 month, renewable). Designated medical practitioners sign Forms 1 / 2 / 3. To be used only when voluntary care is refused and risk to self / others is high.',
};

const PARACETAMOL_OD = {
  label: 'MOH CPG + Rumack-Matthew — Paracetamol overdose',
  body: 'N-acetylcysteine (NAC) within 8 h of single ingestion is highly effective. Plot paracetamol level at 4 h post-ingestion on the Rumack-Matthew nomogram. Empirical NAC for staggered / unknown-time ingestions or massive doses.',
};

const IMH_LIAISON = {
  label: 'IMH C-L Psychiatry + Mobile Crisis Team',
  body: 'IMH Consultation-Liaison covers acute hospitals 24/7. Mobile Crisis Team can do community follow-up within 72 h of discharge. Critical for the high-risk early-discharge window.',
};

export const mentalHealthCrisisCase: CaseDefinition = {
  id: 'mental-health-crisis-sgh-imh',
  title: {
    en: 'Paracetamol overdose, 2 am — SGH ED → IMH liaison',
    zh: '扑热息痛过量,凌晨两点 — SGH急诊 → IMH精神科会诊',
  },
  blurb:
    'Ms Lim, 23, polytechnic student. Roommate brings her to SGH ED at 02:14 after finding empty paracetamol blisters (~30 × 500 mg). Ingestion ~3 h ago. Conscious, tearful, asking to "just go home". History of anxiety + depression; no prior admissions.',
  category: 'acute',
  primaryFacility: 'sgh',
  involvedFacilities: ['sgh', 'imh', 'home', 'shp-outram'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [NICE_SH, MHCTA, PARACETAMOL_OD, IMH_LIAISON],
  pathway: [
    {
      id: 'ed-triage',
      department: 'triage',
      facility: 'sgh',
      durationMin: 8,
      framing: {
        patient: 'Bright lights hurt your eyes. The nurse asks your name, your IC, and what you took.',
        caregiver: 'The roommate hands over the empty blister packs in a plastic bag.',
        staff:
          'Conscious, GCS 15, BP 118/72, HR 92, RR 16. Reports 30 × 500 mg paracetamol ~3 h ago. No vomiting. Tearful, withdrawn, says "leave me alone".',
      },
      decision: {
        id: 'triage-acuity',
        prompt: 'Triage acuity?',
        weight: 1.2,
        reference: PARACETAMOL_OD,
        options: [
          {
            id: 'p1-resus',
            label: 'P1: bring to resus immediately for IV access, bloods, NAC standby.',
            score: 10,
            rationale:
              'Toxic-dose paracetamol overdose (≥ 150 mg/kg or > 12 g) within the 8-h window is time-critical. Rapid bloods + NAC initiation prevent hepatocellular injury. Acuity reflects toxicological risk regardless of conversational appearance.',
            outcome: {
              patient: 'You are wheeled into a curtained bay. Two cannulas go in fast.',
              caregiver: 'The roommate is shown to the relatives\' waiting area.',
              staff: 'P1 activated. Toxicology consulted.',
            },
            effects: { setFlags: ['nac-prompt'] },
          },
          {
            id: 'p2-acute',
            label: 'P2: standard acute bay, bloods in queue, NAC after level result.',
            score: 4,
            rationale:
              'Reasonable if ingestion timing is uncertain, but here we know ~3 h — running the clock loses minutes for no gain. For a confirmed toxic dose, P1 is safer.',
            outcome: { patient: '', caregiver: '', staff: 'Bloods sent; delay of ~20 min before NAC starts.' },
            effects: { setFlags: ['nac-delayed'] },
          },
          {
            id: 'p3-walkin',
            label: 'P3: she is conversant and refused care once — leave in waiting area, review when calmer.',
            score: -10,
            rationale:
              'Conversational appearance does NOT exclude life-threatening toxicity. Paracetamol hepatotoxicity is delayed; refusing care is itself a risk signal. P3 here is dangerous and falls below the duty of care for self-harm.',
            outcome: { patient: 'You sit in the corner; nobody comes.', caregiver: '', staff: '' },
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
        patient: 'They want to draw blood "again". You ask if you can go home now.',
        caregiver: '',
        staff:
          'Paracetamol level at 4 h post-ingestion plots well above the 100-line on Rumack-Matthew. ALT 32, INR 1.0, creatinine 78. Asymptomatic so far.',
      },
      decision: {
        id: 'nac-decision',
        prompt: 'Medical antidote strategy?',
        weight: 1.4,
        reference: PARACETAMOL_OD,
        options: [
          {
            id: 'iv-nac-now',
            label: '21-h IV N-acetylcysteine starting now; recheck LFT + INR at 12 h and 24 h.',
            score: 10,
            rationale:
              'Single-time ingestion above the 100-line treatment threshold within the 8-h window: IV NAC reliably prevents hepatocellular injury. The 21-h regimen is standard.',
            outcome: {
              patient: 'A bag of clear fluid goes up; the nurse explains it tastes like nothing because it\'s through the IV.',
              caregiver: '',
              staff: 'NAC bag 1 (loading) over 60 min, bag 2 over 4 h, bag 3 over 16 h.',
            },
          },
          {
            id: 'observe-only',
            label: 'Observe for symptoms; only start NAC if she develops nausea / RUQ pain.',
            score: -10,
            rationale:
              'Waiting for symptoms means waiting for hepatocellular injury that is already irreversible. Paracetamol-induced ALF develops 2–4 days post-ingestion. NAC works before injury, not after.',
            outcome: { patient: '', caregiver: '', staff: 'Risk of acute liver failure; transplant unit alerted later.' },
            effects: { setFlags: ['hepatotoxic-risk'] },
          },
          {
            id: 'gastric-lavage',
            label: 'Gastric lavage and activated charcoal now.',
            score: -3,
            rationale:
              'Activated charcoal is useful within 1–2 h of ingestion; at 3+ h it has minimal benefit. Lavage is not indicated for paracetamol. NAC remains the key intervention.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'discharge-clinical',
            label: 'Asymptomatic and a "minor overdose" — discharge with GP follow-up.',
            score: -10,
            rationale:
              'A toxic dose with a Rumack-Matthew level over the treatment line is never a discharge — full stop. This is the classic missed-paracetamol fatality.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'You stare at the ceiling tiles. A doctor pulls up a chair and sits at your eye level.',
        caregiver: 'You are asked to step out so she can speak privately.',
        staff:
          'NAC is running. Time to do the psychosocial assessment. How you frame it matters as much as the questions.',
      },
      decision: {
        id: 'how-to-assess',
        prompt: 'Approach to the mental-health assessment?',
        weight: 1.5,
        reference: NICE_SH,
        options: [
          {
            id: 'compassionate-detailed',
            label:
              'Sit down, ask permission, allow silences. Cover: precipitating event, suicidal intent, plan, means, protective factors, social supports, hopelessness, past attempts. Acknowledge distress.',
            score: 10,
            rationale:
              'NICE NG225: psychosocial assessment is a clinical intervention in itself, not a triage filter. Compassionate, non-judgmental, person-centred. Builds therapeutic alliance which is the single best predictor of engagement.',
            outcome: {
              patient: '(slowly): "I don\'t want to die. I just wanted it to stop."',
              caregiver: '',
              staff: 'Risk: moderate, with protective factors (engaged, family contact).',
            },
            effects: { setFlags: ['risk-assessed'] },
          },
          {
            id: 'tick-box',
            label: 'Run through a standard SAD-PERSONS / Columbia checklist at the bedside, score, document.',
            score: 4,
            rationale:
              'Structured tools are useful adjuncts but should NOT replace a clinical interview. SAD-PERSONS has poor positive predictive value when used alone. NICE explicitly says risk scales must not be used to decide disposition.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'interrogate',
            label: 'Direct questioning: "Did you want to die? Will you do it again? Are you lying to us?" Document responses.',
            score: -7,
            rationale:
              'Confrontational style erodes trust, drives concealment, and worsens engagement. The clinical task is to understand, not to interrogate.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'defer-to-imh',
            label: 'Skip the assessment; refer to IMH for "their experts to do".',
            score: 2,
            rationale:
              'The ED clinician is part of the duty of care. Deferral wastes the early window and signals to the patient that her crisis isn\'t the ED\'s problem.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'She agrees to see "the IMH doctor". She does not want her parents called yet.',
        caregiver: '(Roommate waiting; parents un-informed.)',
        staff:
          'NAC running. Risk: moderate, engageable. IMH C-L Psychiatry available. Plan disposition.',
      },
      decision: {
        id: 'disposition-route',
        prompt: 'Admission pathway?',
        weight: 1.5,
        reference: IMH_LIAISON,
        options: [
          {
            id: 'medical-ward-cl',
            label:
              'Admit SGH medical ward to complete 21-h NAC + LFT serial trend; IMH C-L Psychiatry to see in 24 h before discharge.',
            score: 10,
            rationale:
              'Medical management is incomplete. NAC must run to 21 h; LFT/INR trends settle the toxicology question. IMH C-L within 24 h is the standard pathway and avoids the destabilising mid-treatment transfer.',
            outcome: {
              patient: 'A medical-ward bed by 4 am. The IMH doctor will come tomorrow afternoon.',
              caregiver: '',
              staff: 'C-L referral submitted; NAC continuation orders written.',
            },
            effects: { setFlags: ['medical-ward-cl'] },
          },
          {
            id: 'direct-imh-voluntary',
            label: 'Stop NAC, transfer to IMH for voluntary admission now.',
            score: -2,
            rationale:
              'Stopping NAC mid-treatment risks hepatotoxicity. IMH wards are not set up for IV NAC infusions. Medical first, psychiatric in parallel.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['nac-aborted'] },
          },
          {
            id: 'form-1-involuntary',
            label:
              'Sign MHCTA Form 1 (medical practitioner) for involuntary IMH admission immediately on the basis of overdose.',
            score: -5,
            rationale:
              'MHCTA Form 1 is for patients who refuse care AND pose imminent risk. She is engaging voluntarily and consented to IMH review — there is no statutory basis here. Using MHCTA when not warranted is a misuse and damages trust.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['mhcta-misuse'] },
          },
          {
            id: 'discharge-soft',
            label: 'Stable enough — discharge home with the roommate, IMH outpatient appointment next week.',
            score: -10,
            rationale:
              'NAC is mid-infusion and she has acute self-harm intent. Discharge during the first 72 h post-attempt is the highest-risk window for reattempt. Standard of care is inpatient until cleared.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'She is adamant: "Do NOT tell my parents. They will lose it."',
        caregiver: '(Roommate in the corridor, scrolling her phone.)',
        staff: 'Patient is 23 — legally autonomous. Parents not yet informed.',
      },
      decision: {
        id: 'involve-family',
        prompt: 'Family / safety-net approach?',
        weight: 1.2,
        reference: NICE_SH,
        options: [
          {
            id: 'autonomy-collaborative',
            label:
              'Respect autonomy. Explore her concerns about disclosure. Negotiate a safety-net contact she trusts (older sibling, cousin, school counsellor) and seek consent to contact them. Provide SOS hotline + Samaritans 1800-221-4444 + IMH Mental Health Helpline 6389-2222.',
            score: 10,
            rationale:
              'Confidentiality is a core principle; over-riding it without consent destroys engagement and is rarely necessary for a 23-y-o engaging voluntarily. A negotiated safety net captures most of the benefit of family involvement without the harm.',
            outcome: {
              patient: 'She nods at "my cousin". Cousin called; agrees to come tomorrow.',
              caregiver: '',
              staff: 'Safety plan documented with consented contact.',
            },
          },
          {
            id: 'tell-parents-anyway',
            label: 'Call her parents anyway — they have a right to know their daughter is in hospital.',
            score: -6,
            rationale:
              'At 23 she is legally an adult. Confidentiality applies. Calling against her explicit wishes breaches autonomy and can fracture the therapeutic relationship she just started to build.',
            outcome: { patient: 'She refuses to speak to you again.', caregiver: '', staff: '' },
          },
          {
            id: 'no-safety-net',
            label:
              'She wants no one involved — respect it fully, no safety-net contact discussion.',
            score: 3,
            rationale:
              'Pure autonomy without exploring safety nets misses an opportunity. A negotiated middle path captures more protective benefit while still respecting the patient.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'Two days later. LFT normalised, NAC done. The IMH doctor and the SGH team agree you can go home.',
        caregiver: 'Cousin arrived; cousin\'s phone number is in the chart.',
        staff: 'C-L review: low-moderate risk, engaged, agrees to outpatient psychiatry + follow-up.',
      },
      decision: {
        id: 'aftercare-plan',
        prompt: 'Post-discharge plan?',
        weight: 1.3,
        reference: IMH_LIAISON,
        options: [
          {
            id: 'integrated-followup',
            label:
              'IMH psychiatry outpatient in 7 days + IMH Mobile Crisis Team home visit within 72 h + safety plan card with hotlines + Healthier-SG enrolment at her polyclinic for primary-care continuity.',
            score: 10,
            rationale:
              'The first 72 h post-discharge is the highest-risk reattempt window. Mobile Crisis Team bridges that window; outpatient psychiatry begins ongoing care; primary care anchors long-term follow-up. Multi-layered safety net is the standard.',
            outcome: {
              patient: 'Crisis team SMS arrives the next morning; appointment letter in your bag.',
              caregiver: '',
              staff: 'Discharge summary copied to IMH, polyclinic.',
            },
          },
          {
            id: 'imh-only',
            label: 'IMH outpatient in 4 weeks; nothing in between.',
            score: -2,
            rationale: '4 weeks leaves the entire high-risk window uncovered. Standard is < 7 days plus interim outreach.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'gp-only',
            label: 'GP-only follow-up for medication.',
            score: -5,
            rationale: 'Primary care alone is not equipped for the post-attempt high-risk window. Specialist follow-up + crisis-team bridge are needed.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
