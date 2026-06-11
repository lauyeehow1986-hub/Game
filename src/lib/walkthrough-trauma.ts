/**
 * Major-trauma walkthrough — a scrubbable cinematic of a Singapore patient's
 * journey through blunt polytrauma after a motorcycle accident: scene control
 * and catastrophic-haemorrhage management on the SCDF xABCDE primary survey,
 * direct routing to a major trauma centre, a trauma-bay resuscitation on
 * damage-control principles (permissive hypotension, TXA, the massive
 * haemorrhage protocol), a FAST-positive damage-control laparotomy with REBOA
 * for temporary aortic occlusion, ICU damage-control physiology correction, a
 * planned relook and abdominal closure, and trauma rehabilitation — closing
 * with the back-of-house blood bank / radiography / portering that make the
 * time-critical response possible.
 *
 * Reuses the existing Walkthrough engine, showpiece overlays, and achievement
 * infrastructure exactly as the STEMI, stroke and sepsis pathways do.
 *
 * Three Bandersnatch-style decision points:
 *   1. End of `ambulance` — direct transport to the major trauma centre with a
 *      pre-alert (canonical) vs the nearest non-trauma ED (off-canonical, forces
 *      a secondary transfer and loses the golden hour).
 *   2. End of `resus` — damage-control resuscitation + activate the massive
 *      haemorrhage protocol (canonical) vs large-volume crystalloid (harmful:
 *      dilutional coagulopathy and clot disruption).
 *   3. End of `imaging` — straight to theatre for damage-control laparotomy in
 *      the unstable patient (canonical) vs insisting on a formal CT first
 *      (a dangerous delay; the patient arrests in the scanner anteroom and is
 *      rushed to theatre anyway).
 *
 * Content is English-authored; the ms / ta tracks add translations per
 * docs/ROADMAP.md just like the other pathways.
 */
import type { Walkthrough } from './walkthrough';

export const traumaWalkthrough: Walkthrough = {
  id: 'trauma-pathway-v1',
  title: 'Major trauma — motorcycle polytrauma to recovery',
  startChapterId: 'onset',
  actors: {
    /* Patient + family */
    'patient': {
      id: 'trauma-patient',
      role: 'Mr Lim, 28',
      team: 'patient',
      bio: 'A 28-year-old delivery rider. Helmeted but thrown ~6 m when a taxi turned across his motorcycle at the Holland Road junction. Blunt abdominal and pelvic trauma, hypotensive at scene.',
      swatch: '#3aa6ff',
    },
    'family-wife': {
      id: 'trauma-wife',
      role: 'Wife, 27',
      team: 'patient',
      bio: 'The patient\'s wife, a retail supervisor. Reached by the police while at work; arrives during the resuscitation and becomes the family decision-maker through the emergency-surgery consent.',
      swatch: '#60a5fa',
    },
    'bystander': {
      id: 'trauma-bystander',
      role: 'Bystander',
      team: 'bystander',
      bio: 'A passer-by who calls 995, keeps the rider still, and applies firm pressure to the bleeding thigh until SCDF arrives.',
      swatch: '#93c5fd',
    },

    /* Pre-hospital */
    'paramedic': {
      id: 'trauma-paramedic',
      role: 'SCDF paramedic',
      team: 'ambulance',
      bio: 'SCDF Advanced Care Paramedic. Runs the xABCDE primary survey, controls catastrophic external haemorrhage with a tourniquet, splints the pelvis, and pre-notifies the trauma centre.',
      swatch: '#f87171',
    },
    'driver': {
      id: 'trauma-driver',
      role: 'SCDF EA driver',
      team: 'ambulance',
      bio: 'Emergency Ambulance driver. Routes a haemodynamically unstable patient directly to the major trauma centre and pre-alerts the ED so the trauma team and bay are ready.',
      swatch: '#fb923c',
    },

    /* Emergency Department — trauma team */
    'triage-nurse': {
      id: 'trauma-triage-nurse',
      role: 'ED triage nurse',
      team: 'ed',
      bio: 'Receives the pre-alert, assigns a P1 trauma category, and routes the patient straight into the resus bay with the trauma team activated.',
      swatch: '#fbbf24',
    },
    'trauma-lead': {
      id: 'trauma-team-leader',
      role: 'Trauma team leader',
      team: 'ed',
      bio: 'Emergency physician leading the resuscitation. Runs xABCDE, calls the massive haemorrhage protocol, gives TXA within the hour, and drives the decision to theatre.',
      swatch: '#ef4444',
    },
    'ed-nurse': {
      id: 'trauma-ed-nurse',
      role: 'Trauma resus nurse',
      team: 'ed',
      bio: 'Establishes large-bore access, sends a trauma panel and group-and-crossmatch, starts the warmed blood-product transfusion and runs the rapid infuser.',
      swatch: '#dc2626',
    },
    'anaesthetist': {
      id: 'trauma-anaesthetist',
      role: 'Trauma anaesthetist',
      team: 'ed',
      bio: 'Manages the airway with in-line C-spine stabilisation, titrates anaesthesia to permissive hypotension, and co-runs the massive transfusion to a 1:1:1 ratio.',
      swatch: '#f59e0b',
    },

    /* Imaging */
    'radiographer': {
      id: 'trauma-radiographer',
      role: 'Trauma radiographer',
      team: 'ed',
      bio: 'Shoots the trauma-series chest and pelvis films in the bay and stands ready for the CT polytrauma protocol once the patient is stable enough to scan.',
      swatch: '#a855f7',
    },
    'radiologist': {
      id: 'trauma-radiologist',
      role: 'Radiologist',
      team: 'ed',
      bio: 'Performs and reports the FAST, confirms free intraperitoneal fluid, and flags the unstable patient as needing theatre before any formal CT.',
      swatch: '#9333ea',
    },

    /* Operating theatre — damage control */
    'surgeon': {
      id: 'trauma-surgeon',
      role: 'Trauma surgeon',
      team: 'cath',
      bio: 'Performs the damage-control laparotomy — packs the bleeding, controls the splenic injury, and uses REBOA for temporary aortic occlusion when the abdomen is opened.',
      swatch: '#c026d3',
    },
    'scrub-nurse': {
      id: 'trauma-scrub-nurse',
      role: 'Scrub nurse',
      team: 'cath',
      bio: 'Sets up the damage-control laparotomy set, counts and hands instruments, and keeps the rapid pace of a bleeding-control operation.',
      swatch: '#e879f9',
    },

    /* ICU */
    'intensivist': {
      id: 'trauma-intensivist',
      role: 'ICU intensivist',
      team: 'ward',
      bio: 'Admits the open-abdomen patient for damage-control physiology — rewarming, correcting acidosis and coagulopathy, and planning the relook laparotomy.',
      swatch: '#22d3ee',
    },
    'icu-nurse': {
      id: 'trauma-icu-nurse',
      role: 'ICU nurse',
      team: 'ward',
      bio: 'One-to-one critical-care nursing: actively rewarms the patient, runs the thromboelastography-guided products, and monitors the temporary abdominal closure.',
      swatch: '#06b6d4',
    },

    /* Ward + rehab */
    'ward-surgeon': {
      id: 'trauma-ward-surgeon',
      role: 'Surgical consultant (ward)',
      team: 'ward',
      bio: 'Performs the relook laparotomy, achieves definitive fascial closure once the physiology has normalised, and leads the step-down ward care.',
      swatch: '#10b981',
    },
    'physio': {
      id: 'trauma-physio',
      role: 'Trauma physiotherapist',
      team: 'rehab',
      bio: 'Leads early trauma rehabilitation — respiratory physio, graded mobilisation around the healing laparotomy, and a return-to-work plan for the rider.',
      swatch: '#a3e635',
    },

    /* Back-of-house support staff (atmospheric throughout + featured chapter) */
    'blood-bank': {
      id: 'trauma-bloodbank-scientist',
      role: 'Blood-bank scientist',
      team: 'support',
      bio: 'Issues the emergency O-negative units, then the group-specific and crossmatched products that feed the massive haemorrhage protocol without a pause.',
      swatch: '#78716c',
    },
    'porter': {
      id: 'trauma-porter',
      role: 'Hospital porter',
      team: 'support',
      bio: 'Moves the patient between resus, theatre and ICU — every transfer on the critical path of a time-dependent, bleeding injury.',
      swatch: '#d6d3d1',
    },
    'cleaner-theatre': {
      id: 'trauma-cleaner',
      role: 'Theatre cleaner',
      team: 'support',
      bio: 'Turns the emergency theatre around between cases under time pressure, with the infection-prevention discipline that protects the next trauma call.',
      swatch: '#e7e5e4',
    },
  },
  chapters: {
    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 1 — Onset: motorcycle accident, catastrophic thigh bleed
     * ──────────────────────────────────────────────────────────────────── */
    onset: {
      id: 'onset',
      title: 'Impact — 17:50, Holland Road',
      scene: 'street',
      durationSec: 28,
      timeOfDay: '17:50 SGT',
      location: 'Holland Road junction',
      defaultNextChapterId: 'ambulance',
      beats: [
        { at: 0, actorId: 'patient', action: 'Thrown from the motorcycle as a taxi turns across the junction.', pos: { x: 206, y: 236 }, pose: 'collapsed', expression: 'pained' },
        { at: 3, actorId: 'bystander', action: 'Runs over, sees a pumping bleed from the right thigh, kneels to press hard.', pos: { x: 252, y: 240 }, pose: 'kneel', direction: 'W', expression: 'alarmed' },
        { at: 8, actorId: 'bystander', action: 'Dials 995 — "motorbike accident, rider down, heavy bleeding, conscious".', pos: { x: 258, y: 232 }, pose: 'point', direction: 'W', expression: 'alarmed', sfx: '📞 995' },
        { at: 13, actorId: 'patient', action: 'Pale and frightened, complaining of belly and pelvis pain, breathing fast.', pos: { x: 206, y: 238 }, pose: 'collapsed', expression: 'distressed' },
        { at: 18, actorId: 'bystander', action: 'Dispatcher coaches firm direct pressure and to keep the rider still.', pos: { x: 252, y: 234 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 23, actorId: 'patient', action: 'Quieter now, clammy and grey — losing blood faster than he can make it.', pos: { x: 204, y: 240 }, pose: 'collapsed', expression: 'unconscious' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 2 — Ambulance: xABCDE, tourniquet, pelvic binder, pre-alert
     * Branch: major trauma centre (canonical) vs nearest non-trauma ED
     * ──────────────────────────────────────────────────────────────────── */
    ambulance: {
      id: 'ambulance',
      title: 'SCDF on scene — 18:02',
      scene: 'street',
      durationSec: 30,
      timeOfDay: '18:02 SGT',
      location: 'Holland Road junction',
      defaultNextChapterId: 'resus',
      branchPoint: {
        prompt: 'BP 84/52, HR 128, GCS 14, pumping thigh bleed, pelvic instability. Where do you transport?',
        options: [
          {
            label: 'Direct to the major trauma centre — trauma team pre-alerted',
            hint: 'An unstable polytrauma patient needs definitive haemorrhage control; bypass to a trauma centre saves the golden hour.',
            nextChapterId: 'resus',
          },
          {
            label: 'Nearest ED — a non-trauma hospital around the corner',
            hint: 'A non-trauma ED cannot deliver damage-control surgery; a secondary transfer wastes the time the patient does not have.',
            nextChapterId: 'divert-delay',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'On the road — mottled, drowsy, peripherally shut down.', pos: { x: 172, y: 244 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'paramedic', action: 'xABCDE: catastrophic haemorrhage FIRST — high tourniquet on the thigh.', pos: { x: 224, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused', sfx: '🩹 TOURNIQUET' },
        { at: 5, actorId: 'paramedic', action: 'Bleed controlled. Airway patent, in-line C-spine, oxygen on, pelvic binder applied.', pos: { x: 224, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 11, actorId: 'paramedic', action: 'Two large-bore IVs; blood pressure kept deliberately low — permissive hypotension.', pos: { x: 224, y: 244 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 16, actorId: 'driver', action: 'Loads priority one and pre-alerts the trauma centre: unstable polytrauma, ETA 8 min.', pos: { x: 314, y: 238 }, pose: 'point', direction: 'W', expression: 'focused', walking: true, sfx: '🚨 SIREN' },
        { at: 22, actorId: 'bystander', action: 'Gives a quick mechanism handover — "taxi turned across him, thrown about six metres".', pos: { x: 286, y: 236 }, pose: 'stand', expression: 'distressed' },
        { at: 27, actorId: 'paramedic', action: 'Trauma bay confirmed; the team is gloved and waiting on arrival.', pos: { x: 224, y: 240 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* Off-canonical: diverted to a non-trauma ED, then secondary transfer. */
    'divert-delay': {
      id: 'divert-delay',
      title: 'Wrong destination — the clock keeps running',
      scene: 'clinic',
      durationSec: 18,
      timeOfDay: '18:20 SGT',
      location: 'Non-trauma ED',
      defaultNextChapterId: 'resus',
      beats: [
        { at: 0, actorId: 'patient', action: 'Arrives somewhere that cannot operate on him — still bleeding internally.', pos: { x: 210, y: 236 }, pose: 'collapsed', expression: 'distressed' },
        { at: 5, actorId: 'triage-nurse', action: 'Realises this is beyond their service — calls for an emergency transfer.', pos: { x: 262, y: 230 }, pose: 'point', direction: 'W', expression: 'alarmed', sfx: '☎ TRANSFER' },
        { at: 11, actorId: 'driver', action: 'Re-loads for the trauma centre — but the golden hour is already spent.', pos: { x: 312, y: 238 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        { at: 15, actorId: 'patient', action: 'Rushed back out — physiology worse than it needed to be.', pos: { x: 220, y: 238 }, pose: 'collapsed', expression: 'pained' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 3 — Trauma bay: xABCDE, FAST, massive haemorrhage protocol, TXA
     * Branch: damage-control resuscitation (canonical) vs crystalloid
     * ──────────────────────────────────────────────────────────────────── */
    resus: {
      id: 'resus',
      title: 'Trauma bay — damage-control resuscitation',
      scene: 'resus',
      durationSec: 34,
      timeOfDay: '18:12 SGT',
      location: 'Trauma resuscitation bay',
      defaultNextChapterId: 'imaging',
      branchPoint: {
        prompt: 'Class III shock, FAST positive, pelvic injury. How do you resuscitate?',
        options: [
          {
            label: 'Damage-control resuscitation — activate the massive haemorrhage protocol, 1:1:1 blood products, TXA',
            hint: 'Balanced blood-product resuscitation with TXA and permissive hypotension is the standard for haemorrhagic shock.',
            nextChapterId: 'imaging',
          },
          {
            label: 'Large-volume crystalloid to chase the blood pressure',
            hint: 'Crystalloid dilutes clotting factors, raises pressure enough to pop fresh clot, and worsens the lethal triad.',
            nextChapterId: 'crystalloid-delay',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'Into the trauma bay — BP 82/50, HR 130, abdomen rigid.', pos: { x: 200, y: 236 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'triage-nurse', action: 'Handover: motorcyclist, tourniquet on, pelvic binder, permissive hypotension maintained.', pos: { x: 150, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 4, actorId: 'trauma-lead', action: 'Runs xABCDE; declares haemorrhagic shock; activates the massive haemorrhage protocol.', pos: { x: 250, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '🅾 MHP' },
        { at: 9, actorId: 'radiologist', action: 'FAST scan — free fluid in the abdomen. The source of the shock is intra-abdominal.', pos: { x: 224, y: 232 }, pose: 'kneel', direction: 'W', expression: 'focused', sfx: '⚠ FAST +' },
        { at: 14, actorId: 'ed-nurse', action: 'Large-bore access, warmed 1:1:1 blood products through the rapid infuser.', pos: { x: 226, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 19, actorId: 'trauma-lead', action: 'Tranexamic acid given within the hour of injury — CRASH-2.', pos: { x: 250, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '💉 TXA' },
        { at: 24, actorId: 'anaesthetist', action: 'Airway secured with in-line stabilisation; anaesthesia titrated to permissive hypotension.', pos: { x: 286, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 29, actorId: 'trauma-lead', action: 'Transient responder — bleeding faster than we can transfuse. This is a theatre problem.', pos: { x: 250, y: 234 }, pose: 'point', direction: 'W', expression: 'focused' },
      ],
    },

    /* Off-canonical: crystalloid worsens coagulopathy, then merges to imaging. */
    'crystalloid-delay': {
      id: 'crystalloid-delay',
      title: 'Crystalloid chase — the lethal triad deepens',
      scene: 'resus',
      durationSec: 18,
      timeOfDay: '18:30 SGT',
      location: 'Trauma resuscitation bay',
      defaultNextChapterId: 'imaging',
      beats: [
        { at: 0, actorId: 'patient', action: 'Pressure briefly rises, then fresh clot is flushed away — bleeding accelerates.', pos: { x: 204, y: 236 }, pose: 'collapsed', expression: 'distressed' },
        { at: 5, actorId: 'ed-nurse', action: 'Patient is cold, acidotic and now coagulopathic — the lethal triad.', pos: { x: 232, y: 244 }, pose: 'kneel', direction: 'W', expression: 'alarmed' },
        { at: 10, actorId: 'trauma-lead', action: 'Reverses course — stops the crystalloid, switches to balanced blood products and TXA.', pos: { x: 252, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '↺ BLOOD' },
        { at: 14, actorId: 'trauma-lead', action: 'Damage done: dilutional coagulopathy makes the operation ahead far harder.', pos: { x: 252, y: 234 }, pose: 'stand', expression: 'distressed' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 4 — Decision to operate: FAST positive, unstable
     * Branch: straight to theatre (canonical) vs formal CT first
     * ──────────────────────────────────────────────────────────────────── */
    imaging: {
      id: 'imaging',
      title: 'To theatre or to the scanner? — 18:34',
      scene: 'imaging',
      durationSec: 26,
      timeOfDay: '18:34 SGT',
      location: 'Trauma bay — imaging decision',
      defaultNextChapterId: 'surgery',
      branchPoint: {
        prompt: 'FAST positive, transient responder, persistently hypotensive. Next step?',
        options: [
          {
            label: 'Straight to theatre — damage-control laparotomy now',
            hint: 'The unstable, FAST-positive patient needs bleeding control in theatre, not a CT. "Too sick to scan" goes to surgery.',
            nextChapterId: 'surgery',
          },
          {
            label: 'Formal CT polytrauma series first to define every injury',
            hint: 'CT belongs to the stable patient; sending an exsanguinating patient to the scanner risks an arrest in the doughnut.',
            nextChapterId: 'ct-delay',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'radiographer', action: 'Shoots the trauma-series chest and pelvis films at the bedside.', pos: { x: 240, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 5, actorId: 'radiologist', action: 'Repeat FAST still positive; free fluid increasing — the abdomen is the bleeding source.', pos: { x: 286, y: 230 }, pose: 'point', direction: 'W', expression: 'focused', showpiece: { kind: 'svg', id: 'mri-bore-slide', title: 'FAST / trauma imaging', caption: 'Free intraperitoneal fluid — positive FAST' }, sfx: '⚠ FAST +' },
        { at: 12, actorId: 'patient', action: 'Still hypotensive despite blood products — a transient responder.', pos: { x: 206, y: 238 }, pose: 'collapsed', expression: 'pained' },
        { at: 18, actorId: 'trauma-lead', action: '"Too unstable to scan." Calls the surgeon — straight to theatre for damage control.', pos: { x: 232, y: 234 }, pose: 'point', direction: 'W', expression: 'focused', sfx: '➜ THEATRE' },
      ],
    },

    /* Off-canonical: CT-first in an unstable patient nearly ends in arrest. */
    'ct-delay': {
      id: 'ct-delay',
      title: 'CT first — an arrest in the anteroom',
      scene: 'imaging',
      durationSec: 18,
      timeOfDay: '18:48 SGT',
      location: 'CT anteroom',
      defaultNextChapterId: 'surgery',
      beats: [
        { at: 0, actorId: 'patient', action: 'Wheeled toward the scanner — loses output on the trolley as bleeding outpaces transfusion.', pos: { x: 210, y: 236 }, pose: 'collapsed', expression: 'unconscious', sfx: '⚠ ARREST' },
        { at: 5, actorId: 'anaesthetist', action: 'Calls it — "he is exsanguinating, not scanning". Reverts to the theatre plan.', pos: { x: 262, y: 230 }, pose: 'kneel', direction: 'W', expression: 'alarmed' },
        { at: 11, actorId: 'trauma-lead', action: 'Rushed to theatre — but minutes and blood were lost that the patient could not spare.', pos: { x: 224, y: 234 }, pose: 'point', direction: 'W', expression: 'focused', sfx: '➜ THEATRE' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 5 — Theatre: damage-control laparotomy + REBOA
     * ──────────────────────────────────────────────────────────────────── */
    surgery: {
      id: 'surgery',
      title: 'Damage control — laparotomy and REBOA',
      scene: 'cathlab',
      durationSec: 30,
      timeOfDay: '18:45 SGT',
      location: 'Emergency operating theatre',
      defaultNextChapterId: 'icu',
      beats: [
        { at: 0, actorId: 'scrub-nurse', action: 'Damage-control set open, counts done, patient prepped and draped in seconds.', pos: { x: 168, y: 240 }, pose: 'kneel', direction: 'E', expression: 'focused' },
        { at: 5, actorId: 'surgeon', action: 'REBOA — a balloon catheter inflated in the aorta buys control while the abdomen is opened.', pos: { x: 240, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', showpiece: { kind: 'svg', id: 'stent-deployment', title: 'REBOA', caption: 'Resuscitative endovascular balloon occlusion of the aorta' }, sfx: '🎈 REBOA' },
        { at: 12, actorId: 'surgeon', action: 'Laparotomy: packs all four quadrants, controls the shattered spleen, stops the bleeding.', pos: { x: 240, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '🩸 PACKED' },
        { at: 19, actorId: 'patient', action: 'Physiology turns the corner as the bleeding is controlled — heart rate settles.', pos: { x: 206, y: 238 }, pose: 'collapsed', expression: 'relieved' },
        { at: 24, actorId: 'surgeon', action: 'Abdomen left open under a temporary closure — definitive repair deferred to the relook.', pos: { x: 240, y: 234 }, pose: 'point', direction: 'W', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 6 — ICU: damage-control physiology, reverse the lethal triad
     * ──────────────────────────────────────────────────────────────────── */
    icu: {
      id: 'icu',
      title: 'ICU — rewarm, reverse, reassess',
      scene: 'ward',
      durationSec: 30,
      timeOfDay: '20:30 SGT',
      location: 'Surgical ICU',
      defaultNextChapterId: 'ward',
      beats: [
        { at: 0, actorId: 'patient', action: 'Open abdomen, intubated, cold and acidotic — but alive and no longer exsanguinating.', pos: { x: 206, y: 236 }, pose: 'collapsed', expression: 'pained' },
        { at: 4, actorId: 'intensivist', action: 'Damage-control physiology: actively rewarm, correct acidosis, restore clotting.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 10, actorId: 'icu-nurse', action: 'Warming blanket, fluid warmer, TEG-guided products; tracks the temporary closure.', pos: { x: 228, y: 244 }, pose: 'kneel', direction: 'W', expression: 'focused', sfx: '🌡 REWARM' },
        { at: 16, actorId: 'intensivist', action: 'Lactate clearing, clotting normalising — the lethal triad is reversing.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'relieved', sfx: '📉 LACTATE' },
        { at: 22, actorId: 'family-wife', action: 'Reaches the bedside, consents to the planned relook, hears "critical but stable".', pos: { x: 300, y: 236 }, pose: 'stand', expression: 'distressed' },
        { at: 27, actorId: 'intensivist', action: 'Stable overnight — physiology corrected, ready for the relook laparotomy.', pos: { x: 252, y: 232 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 7 — Ward: relook laparotomy, definitive closure, step-down
     * ──────────────────────────────────────────────────────────────────── */
    ward: {
      id: 'ward',
      title: 'Relook and closure — step-down',
      scene: 'ward',
      durationSec: 28,
      timeOfDay: 'Day 2 — 09:00',
      location: 'Surgical ward',
      defaultNextChapterId: 'rehab',
      beats: [
        { at: 0, actorId: 'patient', action: 'Back from the relook — fascia closed, drains in, breathing on his own again.', pos: { x: 208, y: 232 }, pose: 'sit', expression: 'relieved' },
        { at: 5, actorId: 'ward-surgeon', action: 'Relook confirmed no further bleeding; achieved definitive abdominal closure.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '✓ CLOSED' },
        { at: 11, actorId: 'ward-surgeon', action: 'Tourniquet-limb reviewed and salvaged; pelvic fixation planned with orthopaedics.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 17, actorId: 'family-wife', action: 'Sits with him through the first solid meal — the worst is behind them.', pos: { x: 300, y: 234 }, pose: 'stand', expression: 'relieved' },
        { at: 22, actorId: 'patient', action: 'Sore and tired, but lucid and asking when he can go home.', pos: { x: 208, y: 232 }, pose: 'sit', expression: 'neutral' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 8 — Rehab: trauma rehabilitation, return to function
     * ──────────────────────────────────────────────────────────────────── */
    rehab: {
      id: 'rehab',
      title: 'Rehabilitation — back on his feet',
      scene: 'rehab',
      durationSec: 26,
      timeOfDay: 'Week 4 — rehab gym',
      location: 'Trauma rehabilitation',
      defaultNextChapterId: 'backhouse',
      beats: [
        { at: 0, actorId: 'patient', action: 'Walks into the rehab gym with a frame — slow, determined, recovering.', pos: { x: 204, y: 232 }, pose: 'walk', walking: true, direction: 'E', expression: 'neutral' },
        { at: 5, actorId: 'physio', action: 'Respiratory physio and graded mobilisation around the healing laparotomy.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 11, actorId: 'physio', action: 'Rebuilds core and limb strength; plans a staged return to delivery riding.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 17, actorId: 'physio', action: 'Screens mood and sleep — trauma recovery is physical and psychological.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 22, actorId: 'family-wife', action: 'Films a few steps on her phone to show him how far he has come.', pos: { x: 300, y: 234 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 9 — Back-of-house: the unseen trauma response
     * ──────────────────────────────────────────────────────────────────── */
    backhouse: {
      id: 'backhouse',
      title: 'Back-of-house — the unseen response',
      scene: 'backhouse',
      durationSec: 28,
      timeOfDay: 'Throughout',
      location: 'Blood bank · radiography · portering',
      beats: [
        { at: 0, actorId: 'blood-bank', action: 'Issued emergency O-negative within minutes, then group-specific crossmatched units.', pos: { x: 168, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 6, actorId: 'blood-bank', action: 'Kept the massive haemorrhage protocol fed — packs, plasma and platelets without a pause.', pos: { x: 168, y: 232 }, pose: 'point', direction: 'E', expression: 'focused', sfx: '🅾 O-NEG' },
        { at: 12, actorId: 'radiographer', action: 'Ran the trauma-series films and stood ready for the CT the moment he was stable.', pos: { x: 244, y: 236 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 18, actorId: 'porter', action: 'Logged every transfer — resus → theatre → ICU — without a wasted minute.', pos: { x: 300, y: 240 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        { at: 23, actorId: 'cleaner-theatre', action: 'Turned the emergency theatre around so the next trauma call could go straight in.', pos: { x: 210, y: 236 }, pose: 'stand', direction: 'S', expression: 'neutral' },
      ],
    },
  },
};
