/**
 * Stroke walkthrough — second pathway cinematic, demonstrating that the v9.4
 * engine + v9.8 scenery + v9.10 baked-sprite Phaser renderer + v9.11
 * showpieces all reuse cleanly for a new clinical journey.
 *
 * Patient: Mdm Lim, 72-year-old retired teacher. Sudden onset right-sided
 * weakness and aphasia during morning tai-chi in the void deck. Family notice
 * facial droop, dial 995. Singapore stroke network: SCDF FAST screen → "stroke
 * bypass" → NNI@TTSH (or NNI@SGH) hyperacute stroke unit. CT head excludes
 * haemorrhage, CT angiogram identifies M1 occlusion. Heart-team-equivalent
 * stroke decision branch: IV thrombolysis (alteplase / tenecteplase) within
 * 4.5 hours vs primary endovascular thrombectomy for the large-vessel
 * occlusion (HERMES, MR CLEAN, DAWN, DEFUSE-3 evidence).
 *
 * Two Bandersnatch-style decision points:
 *   1. End of `cta-decision` — IV thrombolysis only (canonical) vs primary
 *      endovascular thrombectomy (canonical, LVO).
 *      Actually since CTA shows LVO, BOTH happen — bridging therapy. Branch
 *      lets the learner pick "bridging" (canonical) vs "thrombectomy alone"
 *      (off-canonical, where contraindications to tPA exist).
 *   2. End of `family-conference` — proceed (canonical) vs defer for
 *      premorbid functional assessment (off-canonical: ward-only management).
 */
import type { Walkthrough } from './walkthrough';

export const strokeWalkthrough: Walkthrough = {
  id: 'stroke-pathway-v1',
  title: 'Stroke — large-vessel occlusion pathway',
  startChapterId: 'collapse',
  actors: {
    /* Patient + family */
    'patient': {
      id: 'stroke-patient',
      role: 'Mdm Lim, 72',
      team: 'patient',
      bio: 'A 72-year-old retired primary-school teacher. Hypertensive, on amlodipine, occasionally non-adherent. Sudden onset right-sided weakness and aphasia during morning tai-chi at the HDB void deck.',
      swatch: '#3aa6ff',
    },
    'family-daughter': {
      id: 'family-daughter',
      role: 'Daughter, 44',
      team: 'patient',
      bio: 'The patient\'s daughter, an accounts manager. First to notice the facial droop and slurred speech at the void deck. Calls 995, accompanies the ambulance, acts as the family liaison through admission and discharge planning.',
      swatch: '#60a5fa',
    },

    /* Pre-hospital */
    'bystander': {
      id: 'stroke-bystander',
      role: 'Tai-chi neighbour',
      team: 'bystander',
      bio: 'A 65-year-old neighbour from the same tai-chi group. Helps lower Mdm Lim to the void-deck bench, notes the time of onset (08:35), keeps her airway clear while the daughter calls 995.',
      swatch: '#a3e635',
    },

    /* Ambulance */
    'paramedic': {
      id: 'stroke-paramedic',
      role: 'SCDF paramedic',
      team: 'ambulance',
      bio: 'SCDF Advanced Care Paramedic. Runs the FAST screen (Face, Arm, Speech, Time), confirms suspected stroke, transmits the stroke-bypass alert to the receiving NNI hyperacute stroke unit.',
      swatch: '#f87171',
    },
    'driver': {
      id: 'stroke-driver',
      role: 'SCDF EA driver',
      team: 'ambulance',
      bio: 'Emergency Ambulance driver. Routes to NNI@TTSH (the nearer NNI campus), pre-notifies the stroke team via the secondary-alert line.',
      swatch: '#fb923c',
    },

    /* ED / hyperacute stroke unit */
    'ed-neurologist': {
      id: 'stroke-neurologist',
      role: 'Stroke neurologist',
      team: 'ed',
      bio: 'On-call hyperacute stroke neurologist. Confirms NIHSS score, assesses thrombolysis eligibility, leads the imaging review and the family conversation.',
      swatch: '#ef4444',
    },
    'ed-nurse': {
      id: 'stroke-nurse',
      role: 'Stroke nurse',
      team: 'ed',
      bio: 'Hyperacute stroke unit nurse. Establishes IV access bilaterally, draws bloods (glucose, FBC, coag, U&E), monitors BP for thrombolysis target (<185/110).',
      swatch: '#dc2626',
    },

    /* Imaging */
    'imaging-radiog': {
      id: 'stroke-radiog',
      role: 'CT radiographer',
      team: 'cath',
      bio: 'CT radiographer. Runs the unenhanced head CT then the CT angiogram from arch to vertex; reconstructs the multiplanar views the neurologist needs to decide.',
      swatch: '#6b21a8',
    },
    'neuroradiologist': {
      id: 'neuroradiologist',
      role: 'Neuroradiologist',
      team: 'cath',
      bio: 'Diagnostic neuroradiologist. Reads the non-contrast CT (ASPECTS score), CT angiogram (identifies the M1 occlusion), and CT perfusion (ischaemic core vs penumbra).',
      swatch: '#a855f7',
    },

    /* Endovascular team */
    'neuro-intervent': {
      id: 'neuro-intervent',
      role: 'Interventional neuroradiologist',
      team: 'cath',
      bio: 'Endovascular interventional neuroradiologist. Performs the diagnostic angiogram, executes the mechanical thrombectomy using a stent retriever + aspiration catheter.',
      swatch: '#9333ea',
    },
    'angio-nurse': {
      id: 'stroke-angio-nurse',
      role: 'Angio suite nurse',
      team: 'cath',
      bio: 'Angio suite nurse. Scrubs in, monitors haemodynamics, manages contrast and heparin dosing, records the procedure log.',
      swatch: '#7e22ce',
    },
    'angio-radiog': {
      id: 'stroke-angio-radiog',
      role: 'Angio radiographer',
      team: 'cath',
      bio: 'Operates the biplane angio C-arms; optimises views for the operator; manages radiation dose during long mechanical-thrombectomy runs.',
      swatch: '#581c87',
    },

    /* Neuro-ICU + stroke ward */
    'nicu-doctor': {
      id: 'stroke-nicu-doctor',
      role: 'Neuro-ICU registrar',
      team: 'ward',
      bio: 'Neuro-ICU registrar. Receives the post-thrombectomy patient, monitors for symptomatic intracranial haemorrhage in the first 24h, manages BP targets.',
      swatch: '#0ea5e9',
    },
    'ward-consultant': {
      id: 'stroke-ward-consultant',
      role: 'Stroke unit consultant',
      team: 'ward',
      bio: 'Consultant neurologist leading the daily stroke ward round. Reviews the case, sets the secondary-prevention plan, drives the multidisciplinary discussion.',
      swatch: '#0284c7',
    },
    'ward-nurse': {
      id: 'stroke-ward-nurse',
      role: 'Stroke ward nurse',
      team: 'ward',
      bio: 'Stroke unit staff nurse. Hourly neuro observations, swallow screening before any oral intake, falls-risk management.',
      swatch: '#075985',
    },

    /* Multidisciplinary rehab */
    'speech-therapist': {
      id: 'speech-therapist',
      role: 'Speech-language therapist (AHP)',
      team: 'ward',
      bio: 'Speech-language therapist. Formal swallow assessment after bedside screen; aphasia workup; communication strategies for the family.',
      swatch: '#10b981',
    },
    'ward-physio': {
      id: 'stroke-physio',
      role: 'Stroke physiotherapist (AHP)',
      team: 'ward',
      bio: 'Stroke physiotherapist. Early mobilisation, balance retraining, gait reeducation. Coordinates the discharge mobility plan with OT.',
      swatch: '#059669',
    },
    'ward-ot': {
      id: 'stroke-ot',
      role: 'Occupational therapist (AHP)',
      team: 'ward',
      bio: 'Stroke OT. Upper-limb function, ADL retraining, home assessment, equipment prescription for the HDB flat.',
      swatch: '#047857',
    },

    /* Outpatient + rehab */
    'rehab-physio': {
      id: 'stroke-rehab-physio',
      role: 'Community rehab physio',
      team: 'rehab',
      bio: 'Community hospital stroke rehab physiotherapist. Supervises the 4-week inpatient rehab block at the community hospital after the acute admission.',
      swatch: '#ec4899',
    },
    'clinic-neuro': {
      id: 'clinic-neuro',
      role: 'Stroke clinic neurologist',
      team: 'outpatient',
      bio: 'Outpatient stroke clinic neurologist. 6-week review: imaging follow-up, antiplatelet plan, statin titration, BP target, lifestyle reinforcement.',
      swatch: '#f97316',
    },

    /* Support */
    'discharge-coord': {
      id: 'stroke-discharge-coord',
      role: 'Case manager',
      team: 'ward',
      bio: 'Discharge planner. Coordinates community-hospital rehab transfer, home-mod assessment, financial counselling (MediShield Life, ElderShield, Pioneer Generation subsidies).',
      swatch: '#022c22',
    },
  },

  chapters: {
    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 1 — Onset at the void deck. FAST positive.
     * ──────────────────────────────────────────────────────────────────── */
    collapse: {
      id: 'collapse',
      title: 'Sudden onset — 08:35 at the void deck',
      scene: 'kopitiam',
      durationSec: 28,
      timeOfDay: '08:35 SGT',
      location: 'HDB void deck — Tampines',
      defaultNextChapterId: 'ambulance',
      beats: [
        { at: 0, actorId: 'patient', action: 'Mid-tai-chi — sudden right-arm drop, slurred speech, listing to one side.', pos: { x: 214, y: 224 }, pose: 'stand', expression: 'pained' },
        { at: 3, actorId: 'bystander', action: 'Catches her arm. Eases her to the void-deck bench. Notes the time.', pos: { x: 264, y: 222 }, pose: 'stand', expression: 'alarmed' },
        { at: 7, actorId: 'family-daughter', action: 'Runs over. Notices the facial droop and slurred speech — phones 995.', pos: { x: 304, y: 220 }, pose: 'point', expression: 'distressed' },
        { at: 12, actorId: 'patient', action: 'Right arm weak, speech slurred, comprehending. Awake.', pos: { x: 184, y: 234 }, pose: 'sit', expression: 'distressed' },
        { at: 16, actorId: 'family-daughter', action: 'On 995: gives the FAST positive features and the exact onset time.', pos: { x: 304, y: 220 }, pose: 'point', expression: 'distressed' },
        { at: 22, actorId: 'bystander', action: 'Keeps her upright, head supported. Family on the phone with dispatcher.', pos: { x: 244, y: 226 }, pose: 'kneel', direction: 'E', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 2 — Ambulance, FAST screen, stroke bypass
     * ──────────────────────────────────────────────────────────────────── */
    ambulance: {
      id: 'ambulance',
      title: 'Ambulance on scene — 08:48',
      scene: 'street',
      durationSec: 26,
      timeOfDay: '08:48 SGT',
      location: 'Tampines block · 13 min from NNI@TTSH',
      defaultNextChapterId: 'arrive-nni',
      beats: [
        { at: 0, actorId: 'paramedic', action: 'Arrives with EA. Confirms FAST: facial droop, right arm drift, slurred speech.', pos: { x: 222, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 4, actorId: 'patient', action: 'On the stretcher — alert, right hemiparesis, expressive aphasia.', pos: { x: 170, y: 244 }, pose: 'collapsed', expression: 'distressed' },
        { at: 8, actorId: 'paramedic', action: 'BP 178/102. Capillary glucose 6.4 (rules out hypoglycaemia).', pos: { x: 222, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 13, actorId: 'driver', action: 'Stroke bypass called. Routes to NNI@TTSH. Pre-notifies stroke team.', pos: { x: 312, y: 238 }, pose: 'point', expression: 'focused' },
        { at: 19, actorId: 'paramedic', action: 'Last-known-well 08:35. Onset-to-door projected: 27 min.', pos: { x: 222, y: 240 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 24, actorId: 'family-daughter', action: 'Travels in the EA cabin; supplies medication list and NRIC.', pos: { x: 154, y: 236 }, pose: 'sit', expression: 'distressed' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 3 — Arrive NNI@TTSH, hyperacute stroke unit fast track
     * ──────────────────────────────────────────────────────────────────── */
    'arrive-nni': {
      id: 'arrive-nni',
      title: 'NNI@TTSH stroke bypass — 09:02',
      scene: 'resus',
      durationSec: 30,
      timeOfDay: '09:02 SGT',
      location: 'NNI@TTSH hyperacute stroke unit',
      defaultNextChapterId: 'ct-scan',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the resus trolley — NIHSS being scored on arrival.', pos: { x: 250, y: 181 }, pose: 'collapsed', expression: 'distressed' },
        { at: 0, actorId: 'paramedic', action: 'Verbal handover: FAST positive, LKW 08:35, BP 178/102, GCS 14.', pos: { x: 138, y: 226 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 7, actorId: 'ed-neurologist', action: 'Quick neuro exam. NIHSS 14 — moderate-severe stroke. Activates the lab.', pos: { x: 200, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 14, actorId: 'ed-nurse', action: 'Two large-bore IVs. Bloods (glucose, FBC, coag, U&E) sent stat.', pos: { x: 320, y: 226 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 20, actorId: 'ed-neurologist', action: 'BP 178/102 — within thrombolysis threshold. Walks family to CT.', pos: { x: 200, y: 232 }, pose: 'point', expression: 'focused' },
        { at: 26, actorId: 'family-daughter', action: 'Hovers at the trolley. Holds her mother\'s left hand.', pos: { x: 286, y: 224 }, pose: 'stand', direction: 'W', expression: 'distressed' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 4 — CT head + CT angiogram + CT perfusion
     * Branch: CTA shows M1 occlusion → bridging IV-tPA + thrombectomy (canonical)
     *   vs primary thrombectomy alone (off-canonical, tPA contraindicated)
     * ──────────────────────────────────────────────────────────────────── */
    'ct-scan': {
      id: 'ct-scan',
      title: 'CT head + CTA + CTP — 09:14',
      scene: 'imaging',
      durationSec: 28,
      timeOfDay: '09:14 SGT',
      location: 'NNI@TTSH CT suite',
      defaultNextChapterId: 'cta-decision',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the CT table, sliding into the gantry.', pos: { x: 195, y: 181 }, pose: 'collapsed', expression: 'distressed' },
        { at: 0, actorId: 'imaging-radiog', action: 'Non-contrast head CT first — rules out haemorrhage.', pos: { x: 138, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 8, actorId: 'neuroradiologist', action: 'Non-contrast: ASPECTS 8 — limited early ischaemic change.', pos: { x: 320, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 14, actorId: 'imaging-radiog', action: 'CT angiogram from arch to vertex. Contrast bolus tracked.', pos: { x: 138, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 20, actorId: 'neuroradiologist', action: 'CTA: left M1 cut-off. CTP: small core, large penumbra.', pos: { x: 320, y: 232 }, pose: 'point', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 5 — CTA decision: bridging tPA + thrombectomy (canonical) vs
     * primary thrombectomy alone (off-canonical: tPA contraindications)
     * ──────────────────────────────────────────────────────────────────── */
    'cta-decision': {
      id: 'cta-decision',
      title: 'Reperfusion decision — 09:30',
      scene: 'counsel',
      durationSec: 30,
      timeOfDay: '09:30 SGT',
      location: 'NNI@TTSH stroke decision area',
      defaultNextChapterId: 'thrombolysis',
      branchPoint: {
        prompt:
          'Onset-to-door 27 min. CTA shows left M1 occlusion. CTP: small core, large penumbra. No tPA contraindications on screen. What does the stroke team do?',
        options: [
          {
            label: 'Bridging IV thrombolysis + endovascular thrombectomy',
            hint: 'Within the 4.5h tPA window AND a large-vessel occlusion eligible for thrombectomy. Standard of care.',
            nextChapterId: 'thrombolysis',
          },
          {
            label: 'Primary thrombectomy only (skip thrombolysis)',
            hint: 'tPA contraindicated (recent surgery, INR > 1.7, BP > 185/110 not controllable). Goes straight to angio suite.',
            nextChapterId: 'thrombectomy',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'ed-neurologist', action: 'Frames the choice for the family in plain English + Mandarin.', pos: { x: 150, y: 222 }, pose: 'point', expression: 'focused' },
        { at: 8, actorId: 'family-daughter', action: 'Sits beside her mother. Asks about bleeding risk.', pos: { x: 320, y: 226 }, pose: 'sit', expression: 'distressed' },
        { at: 16, actorId: 'neuroradiologist', action: 'Shows CTA M1 cut-off + CTP mismatch on the workstation.', pos: { x: 200, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 24, actorId: 'ed-neurologist', action: 'Recommends bridging IV thrombolysis + thrombectomy.', pos: { x: 150, y: 222 }, pose: 'point', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 6 (canonical) — IV thrombolysis bolus + infusion
     * ──────────────────────────────────────────────────────────────────── */
    'thrombolysis': {
      id: 'thrombolysis',
      title: 'IV thrombolysis — 09:36',
      scene: 'resus',
      durationSec: 22,
      timeOfDay: '09:36 SGT',
      location: 'NNI@TTSH HSU bay 2',
      defaultNextChapterId: 'thrombectomy',
      beats: [
        { at: 0, actorId: 'patient', action: 'Receiving bolus. BP 172/96, monitored continuously.', pos: { x: 250, y: 181 }, pose: 'collapsed', expression: 'distressed' },
        { at: 0, actorId: 'ed-nurse', action: 'Alteplase 0.9 mg/kg — 10% bolus over 1 minute.', pos: { x: 200, y: 232 }, pose: 'point', expression: 'focused' },
        { at: 7, actorId: 'ed-neurologist', action: 'Door-to-needle 34 min. Within national target.', pos: { x: 290, y: 230 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 14, actorId: 'ed-nurse', action: 'Remaining 90% over 60 min as infusion. BP target <180/105.', pos: { x: 200, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 7 — Endovascular thrombectomy with stent retriever + aspiration
     * ──────────────────────────────────────────────────────────────────── */
    'thrombectomy': {
      id: 'thrombectomy',
      title: 'Mechanical thrombectomy — 09:58',
      scene: 'cathlab',
      durationSec: 42,
      timeOfDay: '09:58 SGT',
      location: 'NNI@TTSH biplane angio suite',
      defaultNextChapterId: 'nicu-transfer',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the angio table — alert, draped, right femoral access prep.', pos: { x: 210, y: 187 }, pose: 'collapsed', expression: 'distressed' },
        { at: 0, actorId: 'neuro-intervent', action: 'Right common femoral artery access via micropuncture.', pos: { x: 138, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 8, actorId: 'angio-radiog', action: 'Biplane runs: left ICA cervical, then intracranial.', pos: { x: 320, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 14, actorId: 'neuro-intervent', action: 'Navigates intermediate catheter to M1. Confirms cut-off.', pos: { x: 138, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 22, actorId: 'angio-nurse', action: 'Stent retriever deployed across the clot. 4-minute wait.', pos: { x: 256, y: 230 }, pose: 'stand', expression: 'focused' },
        { at: 30, actorId: 'neuro-intervent', action: 'Aspiration + stent retriever withdrawal — clot captured.', pos: { x: 138, y: 232 }, pose: 'point', expression: 'focused', showpiece: { kind: 'svg', id: 'thrombectomy-pass' } },
        { at: 38, actorId: 'neuro-intervent', action: 'Final run: TICI 2b reperfusion. Procedure complete.', pos: { x: 138, y: 232 }, pose: 'stand', direction: 'E', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 8 — Neuro-ICU transfer for 24h monitoring
     * ──────────────────────────────────────────────────────────────────── */
    'nicu-transfer': {
      id: 'nicu-transfer',
      title: 'Neuro-ICU transfer — 11:05',
      scene: 'ward',
      durationSec: 24,
      timeOfDay: '11:05 SGT',
      location: 'NNI@TTSH Neuro-ICU',
      defaultNextChapterId: 'stroke-ward',
      beats: [
        { at: 0, actorId: 'patient', action: 'Settled in the NICU bed. Right side improving — moving the arm.', pos: { x: 205, y: 183 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'nicu-doctor', action: 'Receives patient. Hourly neuro obs; BP target <180/105 for 24h.', pos: { x: 200, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 7, actorId: 'ward-nurse', action: 'Bedside swallow screen positive — NBM pending SLT assessment.', pos: { x: 300, y: 230 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 14, actorId: 'family-daughter', action: 'At the bedside. Mother recognises her, mouths her name.', pos: { x: 110, y: 230 }, pose: 'stand', direction: 'E', expression: 'relieved' },
        { at: 20, actorId: 'nicu-doctor', action: 'No symptomatic ICH on 24h CT. Step-down to stroke ward.', pos: { x: 200, y: 232 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 9 — Stroke ward MDT round
     * ──────────────────────────────────────────────────────────────────── */
    'stroke-ward': {
      id: 'stroke-ward',
      title: 'Stroke unit MDT round — day 2',
      scene: 'ward',
      durationSec: 38,
      timeOfDay: '09:30 day 2',
      location: 'NNI@TTSH stroke unit',
      defaultNextChapterId: 'family-conference',
      beats: [
        { at: 0, actorId: 'patient', action: 'Sitting up in bed. NIHSS now 6 — significant improvement.', pos: { x: 175, y: 184 }, pose: 'sit', expression: 'relieved' },
        { at: 0, actorId: 'ward-consultant', action: 'Daily MDT round. Plan: dual antiplatelet 21 days, then SAPT.', pos: { x: 150, y: 232 }, pose: 'point', expression: 'focused' },
        { at: 9, actorId: 'speech-therapist', action: 'Formal swallow assessment passed for thickened fluids.', pos: { x: 220, y: 228 }, pose: 'stand', expression: 'focused' },
        { at: 17, actorId: 'ward-physio', action: 'Mobilises bedside. Edmonton balance assessment scheduled.', pos: { x: 290, y: 224 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 24, actorId: 'ward-ot', action: 'Upper-limb function — right grip 60% of left. Plans home assessment.', pos: { x: 350, y: 220 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 32, actorId: 'family-daughter', action: 'Asks about home modifications and going-home timeline.', pos: { x: 90, y: 224 }, pose: 'sit', expression: 'neutral' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 10 — Family conference. Secondary prevention + rehab plan.
     * Branch: accept community-hospital transfer (canonical) vs home with
     *   outpatient rehab (off-canonical)
     * ──────────────────────────────────────────────────────────────────── */
    'family-conference': {
      id: 'family-conference',
      title: 'Family conference — day 4',
      scene: 'counsel',
      durationSec: 32,
      timeOfDay: '14:00 day 4',
      location: 'NNI@TTSH stroke unit counselling room',
      defaultNextChapterId: 'community-rehab',
      branchPoint: {
        prompt: 'Mdm Lim has plateaued; right-sided weakness remains moderate. What\'s the rehab destination?',
        options: [
          {
            label: 'Transfer to community hospital for 4-week inpatient rehab',
            hint: 'Goal-oriented inpatient programme — best modified-Rankin outcome at 90 days for moderate residual deficits.',
            nextChapterId: 'community-rehab',
          },
          {
            label: 'Discharge home with outpatient rehab',
            hint: 'Faster home reintegration; daughter is available; outpatient blocks at TTSH. Less intensive.',
            nextChapterId: 'outpatient-review',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'ward-consultant', action: 'Frames the rehab options for the family.', pos: { x: 150, y: 222 }, pose: 'point', expression: 'neutral' },
        { at: 8, actorId: 'family-daughter', action: 'Sits with her mother. Asks about subsidies and length of stay.', pos: { x: 320, y: 226 }, pose: 'sit', expression: 'neutral' },
        { at: 14, actorId: 'discharge-coord', action: 'Walks through MediShield Life claim and CHAS subsidy bands.', pos: { x: 200, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 22, actorId: 'patient', action: 'Speaks slowly: prefers the community-hospital block.', pos: { x: 280, y: 228 }, pose: 'sit', expression: 'neutral' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 11 (canonical) — Community-hospital rehab block
     * ──────────────────────────────────────────────────────────────────── */
    'community-rehab': {
      id: 'community-rehab',
      title: 'Community hospital rehab — week 2',
      scene: 'rehab',
      durationSec: 32,
      timeOfDay: '10:00 · week 2',
      location: 'Bright Vision Community Hospital',
      defaultNextChapterId: 'outpatient-review',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the parallel bars — assisted gait practice, daily.', pos: { x: 130, y: 218 }, pose: 'walk', walking: true, direction: 'E', expression: 'focused' },
        { at: 0, actorId: 'rehab-physio', action: 'Supervises gait training. Berg balance score improving week-on-week.', pos: { x: 200, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 10, actorId: 'speech-therapist', action: 'Naming therapy block. Mdm Lim names 14/20 common objects.', pos: { x: 290, y: 224 }, pose: 'sit', expression: 'focused' },
        { at: 18, actorId: 'ward-ot', action: 'Kitchen task: makes a cup of teh herself — first since admission.', pos: { x: 350, y: 218 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 26, actorId: 'family-daughter', action: 'Visits after work. Home modifications (grab bars, shower seat) installed.', pos: { x: 80, y: 224 }, pose: 'stand', direction: 'E', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 12 — Outpatient stroke clinic at 6 weeks
     * ──────────────────────────────────────────────────────────────────── */
    'outpatient-review': {
      id: 'outpatient-review',
      title: 'Stroke clinic review — 6 weeks',
      scene: 'clinic',
      durationSec: 26,
      timeOfDay: '14:00 · 6 weeks later',
      location: 'NNI@TTSH neurology clinic',
      beats: [
        { at: 0, actorId: 'patient', action: 'Walks into clinic with a four-point stick. mRS 2.', pos: { x: 250, y: 220 }, pose: 'stand', walking: true, expression: 'relieved' },
        { at: 0, actorId: 'clinic-neuro', action: 'Reviews recovery: NIHSS 2, expressive aphasia mild residual.', pos: { x: 320, y: 222 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 9, actorId: 'clinic-neuro', action: 'Continues clopidogrel monotherapy after the 21-day DAPT block.', pos: { x: 320, y: 222 }, pose: 'point', expression: 'focused' },
        { at: 16, actorId: 'clinic-neuro', action: 'Atorvastatin 40 mg. BP target <130/80. Books 6-month review.', pos: { x: 320, y: 222 }, pose: 'stand', direction: 'W', expression: 'neutral' },
        { at: 22, actorId: 'family-daughter', action: 'Asks about driving and flying — guidance given.', pos: { x: 180, y: 222 }, pose: 'sit', expression: 'neutral' },
      ],
    },
  },
};
