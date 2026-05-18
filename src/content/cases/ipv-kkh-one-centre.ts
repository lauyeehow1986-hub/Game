import type { CaseDefinition } from '../../lib/types';

const ONE_KKH = {
  label: 'KKH One Centre for Specialised Sexual Care',
  body: 'Singapore\'s one-stop centre for survivors of sexual assault and intimate-partner violence: clinical assessment, forensic medical examination, counselling, social-work and police liaison co-located 24/7.',
};

const WCRP = {
  label: 'Women\'s Charter Part VII — Personal Protection Orders',
  body: 'Family Justice Courts grant Personal Protection Orders (PPO), Domestic Exclusion Orders (DEO) and Counselling Orders (CGO) to protect family members from violence. Police can issue an Emergency Order on the spot.',
};

const HEARS = {
  label: 'MOH HEARS framework on family violence',
  body: 'How clinicians should ask, listen, document, signpost, and follow up when intimate-partner violence is suspected. Confidentiality, autonomy, safety planning.',
};

const PAVE_AWARE = {
  label: 'PAVe + AWARE Helpline + NAVH 1800-777-0000',
  body: 'PAVe (Promoting Alternatives to Violence) and AWARE provide counselling, court-support and safe-house referral. National Anti-Violence Helpline 1800-777-0000 is 24/7.',
};

export const ipvDisclosureCase: CaseDefinition = {
  id: 'ipv-kkh-one-centre',
  title: {
    en: 'Suspected intimate-partner violence — CHAS GP → KKH One Centre',
    zh: '疑似亲密关系暴力 — CHAS诊所 → KKH一站式中心',
  },
  blurb:
    'Ms Tan, 32, returns for a third visit in eight weeks with non-specific headaches, sleep difficulty, and a "clumsy bruise" over her left zygoma. Husband waits in the car. She seems guarded but stays back to fill a form.',
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
        patient: 'You don\'t want to keep coming. You don\'t want him to know.',
        caregiver: '(A 7-year-old daughter sits quietly outside.)',
        staff:
          'Third visit. Vague somatic complaints, healing bruise, weight loss, flat affect. Husband loitering.',
      },
      decision: {
        id: 'open-the-conversation',
        prompt: 'How do you raise the topic?',
        weight: 1.5,
        reference: HEARS,
        options: [
          {
            id: 'private-direct',
            label:
              'Ask the nurse to take husband for a "form" outside; in the closed room ask directly and gently: "Sometimes injuries like this happen because someone at home hurts us. Is anyone hurting you?"',
            score: 10,
            rationale:
              'HEARS framework: H = Have privacy, E = Express concern, A = Ask directly, R = Respect autonomy, S = Safety plan. Direct, private, non-judgmental questioning is more effective than oblique hints.',
            outcome: {
              patient: '(quiet for a long moment. Then nods.)',
              caregiver: '',
              staff: 'Disclosure achieved; husband is in the lobby; she is safe in this room.',
            },
            effects: { setFlags: ['disclosure-made'] },
          },
          {
            id: 'oblique-hint',
            label:
              'Ask vague questions: "Are things stressful at home?" — let her bring it up if she wants.',
            score: 4,
            rationale:
              'Better than nothing, but vague questions reliably under-detect. Survivors interpret indirect questions as the clinician not wanting to know.',
            outcome: { patient: '', caregiver: '', staff: 'Patient deflects.' },
          },
          {
            id: 'ask-in-front',
            label:
              'Ask in front of the husband — "you two look stressed; what\'s going on at home?" — so he hears the concern.',
            score: -10,
            rationale:
              'Disclosure in front of an abuser endangers the survivor. Never ask in front of a partner.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['unsafe-question'] },
          },
          {
            id: 'no-questions',
            label: 'Treat the headache; prescribe an analgesic; review in 4 weeks.',
            score: -4,
            rationale:
              'Missed opportunity. Repeated somatic presentation + injury + controlling-partner cues is a high-yield IPV screen.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'She asks: "What happens now? He\'s outside."',
        caregiver: '',
        staff: 'Disclosure made. Plan referral while she\'s still in the building.',
      },
      decision: {
        id: 'where-to-refer',
        prompt: 'Where do you direct her?',
        weight: 1.5,
        reference: ONE_KKH,
        options: [
          {
            id: 'one-centre-now',
            label:
              'Call KKH One Centre on the direct line; arrange same-day transfer; offer the centre\'s number 6394-2466 and the National Anti-Violence Helpline 1800-777-0000.',
            score: 10,
            rationale:
              'One Centre co-locates clinical, forensic, counselling, social-work and police liaison so the survivor doesn\'t have to retell the story across multiple agencies. Same-day momentum matters.',
            outcome: {
              patient: 'She memorises both numbers, repeats them back.',
              caregiver: '',
              staff: 'One Centre confirms — they\'ll see her this afternoon.',
            },
            effects: { setFlags: ['referred-to-one-centre'] },
          },
          {
            id: 'call-police-now',
            label: 'Insist on calling the police immediately from the clinic.',
            score: 3,
            rationale:
              'Survivor autonomy: many will not be ready, and forcing police involvement can drive her back into hiding. Police can be involved later via One Centre. The exception is imminent danger — assess case-by-case.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'polyclinic-followup',
            label: 'Refer to polyclinic for follow-up in a week.',
            score: -2,
            rationale:
              'Polyclinic isn\'t the right venue for IPV care. Loses the One Centre advantage of integrated services.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'send-home-think',
            label: '"Go home, think about it, come back if it gets worse."',
            score: -8,
            rationale:
              'Survivors who disclose and then are sent home without a plan face higher risk; the abuser often escalates after suspected disclosure.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: '',
        caregiver: '',
        staff: 'You document the encounter. What ends up in the record matters legally.',
      },
      decision: {
        id: 'how-to-document',
        prompt: 'Documentation approach?',
        weight: 1.2,
        reference: HEARS,
        options: [
          {
            id: 'verbatim-photo-consent',
            label:
              'Verbatim quotes ("he hit me with the remote") + body diagram + photographs with explicit written consent; record her safety wishes; flag confidential.',
            score: 10,
            rationale:
              'Forensic-quality documentation in your own words doesn\'t require police; survivor-led photography is consented; verbatim quotes are admissible. Keep the chart confidential — husband may read HealthHub.',
            outcome: { patient: '', caregiver: '', staff: 'A clean, defensible record.' },
          },
          {
            id: 'minimal-coded',
            label: 'A coded one-liner: "Possible domestic conflict. Refer KKH."',
            score: 3,
            rationale:
              'Protects from prying eyes but loses the forensic value if she ever pursues a PPO.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'paraphrased-no-photo',
            label: 'Paraphrase the patient\'s account in clinical language; no photographs.',
            score: 4,
            rationale: 'Reasonable but weaker than verbatim + photos.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'photo-without-consent',
            label: 'Photograph injuries without explicit consent — "for the record".',
            score: -8,
            rationale: 'Consent is non-negotiable. Photos without consent breach autonomy and may not be admissible.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'A private room with a soft chair. A social worker brings tea.',
        caregiver: '(A children\'s play corner holds her daughter\'s attention.)',
        staff:
          'One Centre assessment: clinical + forensic + social work + police liaison + counselling under one roof.',
      },
      decision: {
        id: 'safety-plan',
        prompt: 'Plan the next 72 hours?',
        weight: 1.3,
        reference: WCRP,
        options: [
          {
            id: 'multilayered-safety',
            label:
              'Safety plan: emergency bag at a friend\'s; PAVe shelter on standby; PPO discussion with the One Centre lawyer; coded phrase with her sister; school informed of the daughter\'s pickup list.',
            score: 10,
            rationale:
              'Layered safety planning around the most-dangerous post-disclosure window is the standard of care. PPO is her option, not imposed.',
            outcome: {
              patient: 'She rehearses the coded phrase quietly.',
              caregiver: '',
              staff: 'Multidisciplinary plan signed off.',
            },
            effects: { setFlags: ['safety-plan-in-place'] },
          },
          {
            id: 'go-home-warn',
            label: 'Send her home with the One Centre number and a leaflet.',
            score: -2,
            rationale: 'A leaflet is not a safety plan. The post-disclosure window is the highest-risk period.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'force-shelter',
            label: 'Insist she goes straight to a women\'s shelter tonight against her wishes.',
            score: 3,
            rationale:
              'Survivor autonomy matters; forced placement can backfire. Offer it as an option, respect her decision unless a child is in imminent danger.',
            outcome: { patient: '', caregiver: '', staff: '' },
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
        patient: 'Six weeks later. She came alone. She filed a PPO last Tuesday.',
        caregiver: 'Her sister picks the daughter up from school now.',
        staff: 'Follow-up: stable, sleeping better, attending PAVe counselling group.',
      },
      decision: {
        id: 'long-term',
        prompt: 'Long-term plan?',
        weight: 1,
        reference: PAVE_AWARE,
        options: [
          {
            id: 'integrated-continuation',
            label:
              'Continue PAVe counselling + KKH follow-up at 3 months + GP for chronic somatic symptoms + AIC family-violence subsidy for legal aid + check on the daughter via FAM@FSC.',
            score: 10,
            rationale:
              'Recovery is months-to-years. Multidisciplinary continuity (medical + psychological + legal + social + child) is what works.',
            outcome: { patient: '', caregiver: '', staff: 'NEHR updated; flagged confidential.' },
          },
          {
            id: 'discharge-resolved',
            label: 'Discharge — case is "resolved" since the PPO is filed.',
            score: -3,
            rationale: 'IPV care doesn\'t end at the PPO. Most survivors need ongoing support.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'meds-only',
            label: 'Prescribe an SSRI; stop everything else.',
            score: 1,
            rationale: 'May help anxiety/PTSD but not a substitute for trauma-informed therapy + social support.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
