/**
 * English source dictionary. Other locales inherit any key they omit.
 * Keep keys grouped by panel / modal for legibility.
 */
export const en: Record<string, string> = {
  // Generic
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.start': 'Start',
  'common.stop': 'Stop',
  'common.pause': 'Pause',
  'common.resume': 'Resume',
  'common.reset': 'Reset',
  'common.import': 'Import',
  'common.export': 'Export',
  'common.share': 'Share',
  'common.delete': 'Delete',
  'common.next': 'Next',
  'common.back': 'Back',
  'common.skip': 'Skip',
  'common.gotIt': 'Got it',
  'common.score': 'Score',
  'common.decisions': 'Decisions',
  'common.cash': 'Cash',
  'common.reputation': 'Reputation',

  // App brand / HUD
  'app.brand.short': 'SG Pathway',
  'app.brand.subtitle': 'Singapore healthcare patient simulator',
  'hud.gameTime': 'Game time',
  'hud.status': 'Status',
  'hud.status.idle': 'Idle',
  'hud.status.running': 'In progress',
  'hud.status.awaiting': 'Decision required',
  'hud.status.completed': 'Completed',
  'hud.cashOop': 'Cash OOP so far',
  'hud.timer.exceeded': 'exceeded',
  'hud.audio.on': 'Audio on',
  'hud.audio.off': 'Audio off',
  'hud.tutorial': 'Tutorial',
  'hud.mode.case': 'Case',
  'hud.mode.ops': 'Hospital Ops',
  'hud.perspective.patient': 'Patient',
  'hud.perspective.caregiver': 'Caregiver',
  'hud.perspective.staff': 'Staff',
  'hud.language': 'Language',
  'hud.about': 'About',

  // Disclaimer
  'disclaimer.tag': 'Educational',
  'disclaimer.body':
    'Stylised simulation of Singapore healthcare pathways. Subsidy, MediShield, MediSave and CHAS calculations are illustrative only — not authoritative. Not a substitute for clinical judgement or current MOH / NCID guidance.',

  // Cases panel
  'cases.heading': 'Cases',
  'cases.importJson': 'Import JSON',
  'cases.startCase': 'Start case',
  'cases.restart': 'Restart',
  'cases.best': 'Best',
  'cases.notPlayed': 'Not played',
  'cases.badge.historical': 'Historical',
  'cases.badge.custom': 'Custom',
  'cases.shareToast.copied': 'Share link copied to clipboard.',
  'cases.shareToast.urlImported': 'Imported "{{title}}" from URL.',

  // Case import modal
  'import.heading': 'Import a case from JSON',
  'import.subtitle': 'Bring your own case',
  'import.body':
    'Paste a case JSON below or upload a .json file. Schema follows the built-in cases — the validator points to any field that\'s wrong. Imported cases are stored locally and appear in the Cases list with a Custom badge.',
  'import.insertSample': 'Insert sample',
  'import.placeholder': 'Paste a case JSON here…',
  'import.refLink': 'See the built-in cases for shape reference →',
  'import.success': 'Imported "{{title}}". It now appears under Cases with a Custom badge.',

  // Tycoon dashboard
  'tycoon.heading': 'Hospital KPIs',
  'tycoon.live': '{{facility}} live',
  'tycoon.bedOccupancy': 'Bed occupancy',
  'tycoon.edWait': 'ED median wait (P3)',
  'tycoon.staffFatigue': 'Staff fatigue index',
  'tycoon.dorscon': 'DORSCON',

  // Pandemic panel
  'pandemic.heading': 'Pandemic engine',
  'pandemic.dorscon': 'DORSCON',
  'pandemic.ppe': 'PPE stockpile',
  'pandemic.surge': 'Surge capacity',
  'pandemic.edDiversion': 'ED diversion',
  'pandemic.ncidActivated': 'NCID activated',
  'pandemic.active': 'Active',
  'pandemic.off': 'Off',

  // Financing panel
  'fin.heading': 'Financing',
  'fin.outpatient': 'Outpatient',
  'fin.gross': 'Gross (private rate)',
  'fin.subsidy': '− Government subsidy',
  'fin.mshl': '− MediShield Life claim',
  'fin.medisave': '− MediSave drawdown',
  'fin.cash': '= Cash out-of-pocket',
  'fin.cashRatioOfGross': '{{pct}}% of gross paid in cash',
  'fin.perSegment': 'Per-segment breakdown',
  'fin.caregiverBurden': 'Caregiver burden',
  'fin.timeOffWork': 'Time off work',
  'fin.financialWorry': 'Financial worry',
  'fin.sleepDebt': 'Sleep debt',

  // Patient panel
  'patient.heading.empty': 'Patient',
  'patient.empty': 'No active case. Pick a case below to begin.',
  'patient.citizenship': 'Citizenship',
  'patient.chas': 'CHAS',
  'patient.income': 'Per-capita income',
  'patient.medisave': 'MediSave',
  'patient.wardClass': 'Ward class',
  'patient.ip.active': 'Active — IP rider tops up to as-charged',
  'patient.ip.none': 'None — MediShield Life only',
  'patient.ip.label': 'Integrated Shield Plan',

  // Network browser
  'network.heading': 'Network',
  'network.facilities': '{{n}} facilities',
  'network.lockedNote':
    'Map follows the active patient. Stop the case to browse other facilities.',
  'network.group.acute': 'Acute hospitals (public)',
  'network.group.specialty': 'Specialty centres (public)',
  'network.group.community': 'Community / step-down',
  'network.group.polyclinic': 'Polyclinics',
  'network.group.privateAcute': 'Private hospitals',
  'network.group.privateSpecialist': 'Private specialists',
  'network.group.gp': 'Private GP clinics',
  'network.group.telemed': 'Telemedicine',
  'network.group.ancillary': 'Ancillary / pre-hospital / community',

  // Decisions
  'decision.heading': 'Decision required',
  'decision.maxScore': 'Max score',
  'decision.commit': 'Commit decision',
  'decision.hint': '↑/↓ to choose, 1–9 to jump, Enter to confirm.',

  // Decision log
  'log.heading': 'Decisions log',
  'log.made': '{{n}} made',
  'log.empty': 'As you make decisions, they will appear here with score and rationale.',

  // Data exchange
  'data.heading': 'Records & data exchange',
  'data.contributesNehr': 'Contributes to NEHR',
  'data.consumesNehr': 'Pulls NEHR',
  'data.healthhub': 'HealthHub visible',
  'data.notOnCd': 'Imaging not on CD',
  'data.lastTransfer': 'Last transfer',
  'data.transferLog': 'Transfer log ({{n}})',

  // Citations
  'cite.heading': 'References',
  'cite.tab.citations': 'Citations',
  'cite.tab.glossary': 'Glossary',
  'cite.guidelines': 'Guidelines & references',
  'cite.histCitations': 'Historical scenario citations',

  // Leaderboard
  'lb.heading': 'Personal best',
  'lb.runs': '{{runs}} runs · {{decisions}} decisions',
  'lb.cases': 'Cases',
  'lb.avg': 'Avg score',
  'lb.resetConfirm': 'Clear all personal bests and progress?',
  'lb.resetButton': 'Reset progress',

  // Trends
  'trends.heading': 'Your learning trends',
  'trends.grade': 'Avg grade',
  'trends.recentRuns': 'Recent runs (oldest left)',
  'trends.byCategory': 'Strength by category',
  'trends.recommended': 'Recommended next',
  'trends.replay': 'Replay',
  'trends.allCases': 'All cases',
  'trends.notes.heading': 'Your reflections',
  'trends.notes.export': 'Export notes',
  'trends.notes.clear': 'Clear all',

  // Case category labels (used in trends bars + lesson plans)
  'cases.category.acute': 'Acute',
  'cases.category.elective': 'Elective',
  'cases.category.outpatient': 'Outpatient',

  // Difficulty badges
  'cases.difficulty.beginner': 'Beginner',
  'cases.difficulty.intermediate': 'Intermediate',
  'cases.difficulty.advanced': 'Advanced',
  'cases.difficulty.beginner.tip': '{{decisions}} decisions · light stakes',
  'cases.difficulty.intermediate.tip': '{{decisions}} decisions · mixed stakes',
  'cases.difficulty.advanced.tip': '{{decisions}} decisions · high consequence',
  'cases.search.diffAny': 'Any difficulty',
  'cases.search.diffBeginner': 'Beginner',
  'cases.search.diffIntermediate': 'Intermediate',
  'cases.search.diffAdvanced': 'Advanced',

  // What's-new modal
  'whatsNew.title': "What's new",
  'whatsNew.subtitle': 'Features added since your last visit',
  'whatsNew.gotIt': 'Got it — close',
  'whatsNew.dontShow': "Don't show again",

  // Install prompt + offline
  'install.tag': 'Install',
  'install.body': 'Install SG Pathway to your home screen for offline use.',
  'install.cta': 'Install',
  'install.dismiss': 'Not now',
  'hud.offline': 'Offline',

  // Best-path demo
  'demo.tag': 'Best-practice walkthrough',
  'demo.subtitle':
    'Step through the highest-scoring option at every decision in this case. No score recorded; no commitment. Use ← → keys or the buttons.',
  'demo.stepCount': 'Step {{step}} / {{total}}',
  'demo.prompt': 'Prompt',
  'demo.bestChoice': 'Best choice',
  'demo.reference': 'Reference',
  'demo.outcome': 'What happens next',
  'demo.keyHint': '← → keys, Esc to close',
  'demo.noDecisions': 'This case has no decisions to walk through.',
  'cases.demoBestRun': 'Demo best run',

  // Case search
  'cases.search.placeholder': 'Search cases…',
  'cases.search.clear': 'Clear',
  'cases.search.empty': 'No cases match your filter.',
  'cases.search.hidden': '{{n}} hidden by filter',
  'cases.search.unplayed': 'Unplayed',

  // About / methodology — reset button
  'about.reset.h': 'Reset all local data',
  'about.reset.body':
    'Clears every locally-stored bit of state on this device: best scores, custom cases, custom curricula, language, audio settings, install/disclaimer flags, and any unfinished case.',
  'about.reset.button': 'Reset everything',
  'about.reset.confirm':
    'This permanently clears every locally-stored bit of state on this device. Continue?',
  'about.reset.done': 'Cleared. Reloading…',

  // Curricula
  'curr.heading': 'Curricula',
  'curr.objectives': 'Learning objectives',
  'curr.progress': '{{done}} / {{total}} cases',
  'curr.begin': 'Begin curriculum',
  'curr.continue': 'Continue',
  'curr.complete': 'Complete',
  'curr.nextLabel': 'Next: {{title}}',
  'curr.allDone': 'All cases in this curriculum have a personal best.',
  'curr.import.subtitle': 'Bring your own curriculum',
  'curr.import.heading': 'Import a curriculum bundle',
  'curr.import.body':
    "Paste a curriculum JSON below or upload a .json file. Bundles can include embedded custom cases — they're side-loaded automatically so caseIds resolve. Built-in case ids work too without being embedded.",
  'curr.importCurriculum': 'Import curriculum',
  'curr.createCurriculum': 'Create curriculum',
  'curr.shareCurriculum': 'Share',
  'curr.exportCurriculum': 'Export',
  'curr.shareToast.copied': 'Curriculum URL copied to clipboard.',
  'curr.shareToast.urlImported': 'Imported curriculum "{{title}}" from URL.',

  // Curriculum builder
  'builder.heading': 'Build a curriculum',
  'builder.subtitle': 'Compose your own syllabus',
  'builder.title': 'Title',
  'builder.idPreview': 'Auto-id',
  'builder.blurb': 'Blurb',
  'builder.author': 'Author (optional)',
  'builder.objectives': 'Learning objectives',
  'builder.add': 'Add',
  'builder.pickedCases': 'Cases in this curriculum ({{n}})',
  'builder.allCases': 'All available cases ({{n}})',
  'builder.noCases': 'Pick at least 2 cases below to enable Save.',
  'builder.save': 'Save curriculum',
  'builder.saved': 'Saved "{{title}}". It now appears in the Curricula panel.',

  'results.copyLesson': 'Copy lesson plan',
  'results.copyLessonDone': 'Lesson plan copied to clipboard',
  'results.shareRun': 'Share this run',
  'results.shareRunDone': 'Run URL copied to clipboard',
  'results.downloadLesson': 'Download lesson plan',
  'results.printLesson': 'Print / Save as PDF',
  'results.replay': 'Replay case',
  'results.note.label': 'Your reflection',
  'results.note.placeholder': 'Optional — included in the lesson plan export.',

  // Run review (when opening a ?run= URL)
  'runReview.heading': 'Reviewing a shared run',
  'runReview.subtitle': 'Replay of "{{title}}". Decisions below are the shared player\'s; the best-practice column shows what a perfect run would have chosen.',
  'runReview.notFound': 'Couldn\'t find the case "{{id}}" — the shared run links to a case that isn\'t installed.',

  // Results — replay comparison
  'results.bestPath.h': 'How a best-practice run would have chosen',
  'results.bestPath.match': 'Matched best-practice',
  'results.bestPath.miss': 'Differs from best-practice',
  'results.bestPath.you': 'Your choice',
  'results.bestPath.best': 'Best-practice choice',
  'results.bestPath.deltaScore': '{{delta}} pts vs best',

  // Ops
  'ops.heading': 'Hospital Ops',
  'ops.day': 'Day {{day}}',
  'ops.shift': 'Shift {{elapsed}} / {{total}}',
  'ops.startShift': 'Start 8-h shift',
  'ops.nextDay': 'Next day',
  'ops.netShift': 'Net shift',
  'ops.diversionState': 'ED diversion: {{state}}',
  'ops.deptHeader': 'Departments — staffing & capacity',
  'ops.dailyCost': 'Daily',
  'ops.beds': 'Beds',
  'ops.docs': 'Drs',
  'ops.nurses': 'Nurses',
  'ops.onFloor': 'On floor',
  'ops.discharged': 'Discharged',
  'ops.arrivals': 'Arrivals',
  'ops.deteriorated': 'Deteriorated',
  'ops.avgLos': 'Avg LOS',
  'ops.edP3Wait': 'ED P3 wait',
  'ops.endOfDay': 'End of day {{day}}',
  'ops.dayHistory': 'Day history ({{n}})',
  'ops.scenarioPass': 'Scenario PASS',
  'ops.scenarioFail': 'Scenario FAIL',

  // About / methodology
  'about.title': 'About this simulator',
  'about.tagline': 'How the model works, where the numbers come from, and what to be cautious about.',
  'about.financing.h': 'Financing model',
  'about.financing.body':
    'Subsidy %, MediShield Life claim caps, MediSave drawdown caps and CHAS top-ups are stylised heuristics, not the actual MOH formulae. Means-test bands and PG / MG top-ups are simplified. The cascade gross → subsidy → MediShield → CHAS → MediSave → cash matches reality in shape; the numbers are not authoritative. Refer to the MOH website and your hospital\'s billing department for any real-world figure.',
  'about.network.h': 'Network coverage',
  'about.network.body':
    'Facility lists are drawn from public MOH / cluster / private-hospital websites and are not endorsed by them. Department layouts within each facility are illustrative; tilemap fidelity is symbolic, not architectural.',
  'about.cases.h': 'Clinical content',
  'about.cases.body':
    'Cases are tabletop scenarios for educational discussion, not validated decision aids. Decision options reflect a small set of named guidelines (MOH CPG, ESC, NCCN, NICE, KDIGO, ATLS, Surviving Sepsis, ESO) at the time of authoring — always defer to current local guidance. Historical scenarios (SARS 2003, COVID-19) are reconstructions framed by post-outbreak reviews; outcomes are stylised.',
  'about.privacy.h': 'Privacy',
  'about.privacy.body':
    'Everything is local. No accounts, no analytics, no telemetry. localStorage holds your unlocked cases, best scores, custom imports, language, audio, and disclaimer-acknowledged flags. Clear them via the browser at any time.',
  'about.code.h': 'Source',
  'about.code.body':
    'Open source on GitHub. Issues, pull requests, and translation contributions welcome.',

  // Accessibility
  'a11y.skip': 'Skip to main content',
  'a11y.announce.decisionRequired': 'A decision is required.',
  'a11y.announce.caseComplete': 'Case complete: {{title}}.',
  'a11y.announce.runReset': 'Case reset. Pick a new case to begin.',
  'a11y.kbd.heading': 'Keyboard shortcuts',
  'a11y.kbd.subtitle': 'Press ? at any time to reopen this list.',
  'a11y.kbd.open': 'Keyboard shortcuts',
  'a11y.kbd.global': 'Global',
  'a11y.kbd.decision': 'Decision dialog',
  'a11y.kbd.demo': 'Best-practice demo',
  'a11y.kbd.tutorial': 'Tutorial',
  'a11y.kbd.k.help': 'Show this help',
  'a11y.kbd.k.esc': 'Close any open dialog',
  'a11y.kbd.k.tab': 'Cycle focus inside a dialog',
  'a11y.kbd.k.arrows': '↑ / ↓ to highlight an option',
  'a11y.kbd.k.nums': '1–9 to jump to that option',
  'a11y.kbd.k.enter': 'Enter to confirm',
  'a11y.kbd.k.lr': '← / → to step forward / back',

  // Achievements
  'ach.unlocked': 'Achievement unlocked',
  'ach.heading': 'Achievements',
  'ach.progress': '{{done}} / {{total}} unlocked',
  'ach.locked': 'Locked',
  'ach.title.first-case': 'First case',
  'ach.desc.first-case': 'Complete your first case.',
  'ach.title.distinction': 'Distinction',
  'ach.desc.distinction': 'Score 90% or higher on any case.',
  'ach.title.triple-distinction': 'Triple Distinction',
  'ach.desc.triple-distinction': 'Score 90% or higher on three different cases.',
  'ach.title.curriculum-graduate': 'Curriculum graduate',
  'ach.desc.curriculum-graduate': 'Complete every case in a curriculum.',
  'ach.title.streak-master': 'Streak master',
  'ach.desc.streak-master': 'Replay the same case three times.',
  'ach.title.tycoon': 'Tycoon',
  'ach.desc.tycoon': 'Finish a Hospital Ops shift.',
  'ach.title.tycoon-profit': 'In the black',
  'ach.desc.tycoon-profit': 'Finish a Hospital Ops shift with positive net SGD.',
  'ach.title.polyglot': 'Polyglot',
  'ach.desc.polyglot': 'Switch the interface language away from English.',
  'ach.title.open-mind': 'Open mind',
  'ach.desc.open-mind': 'Open the Demo best run for any case.',
  'ach.title.educator': 'Educator',
  'ach.desc.educator': 'Export a lesson plan or share a run/curriculum URL.',
  'ach.title.author': 'Author',
  'ach.desc.author': 'Import or build a custom case or curriculum.',
  'ach.title.completionist': 'Completionist',
  'ach.desc.completionist': 'Score at least once on every built-in case.',
};
