export type Perspective = 'patient' | 'caregiver' | 'staff';

/**
 * A string that may be localised. Authors can write either a plain string
 * (the legacy form — treated as English) or an object keyed by locale code.
 * Missing locales fall back to English, then to the first available string.
 *
 * Example:
 *   "Cases"
 *   { en: "Cases", zh: "病例", ms: "Kes" }
 */
export type LocalisedString = string | Partial<Record<'en' | 'zh' | 'ms' | 'ta', string>>;

export type FacilityType =
  | 'acute'
  | 'specialty'
  | 'community'
  | 'polyclinic'
  | 'vwo'
  | 'private-acute'
  | 'private-specialist'
  | 'gp'
  | 'telemed'
  | 'ancillary';

export type Sector = 'public' | 'private' | 'vwo' | 'pre-hospital' | 'community';

export type Cluster =
  | 'singhealth'
  | 'nuhs'
  | 'nhg'
  | 'vwo'
  | 'ihh-parkway'
  | 'raffles'
  | 'standalone'
  | 'national'
  | 'na';

/**
 * Department identifier. Common values used across multiple facilities are
 * documented below; specific facilities (NCID isolation, IMH ECT, NSC
 * phototherapy, etc.) can declare their own ids without type churn.
 *
 * Common values: 'entrance' | 'triage' | 'ed' | 'imaging' | 'cathlab' |
 * 'icu' | 'ot' | 'ward' | 'pharmacy' | 'discharge' | 'soc' | 'rehab' |
 * 'isolation' | 'lab' | 'psych-ward' | 'psych-clinic' | 'ect' |
 * 'derm-clinic' | 'phototherapy' | 'gp-room' | 'treatment-room' |
 * 'rehab-gym' | 'subacute-ward' | 'consult-room' | 'screening'.
 */
export type DepartmentId = string;

export interface Department {
  id: DepartmentId;
  name: string;
  shortLabel: string;
  /** Pixel coordinates within the rendered hospital map (centre point). */
  position: { x: number; y: number };
  /** Radius for hit-testing. */
  radius: number;
  colour: string;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  sector: Sector;
  cluster: Cluster;
  departments: Department[];
  /** Path patient walks: ordered list of department ids, room-to-room. */
  defaultRoute?: DepartmentId[];
}

export type GuidelineRef = {
  label: LocalisedString;
  body: LocalisedString;
};

/**
 * Effects fired when a player commits a decision option. Replaces the
 * previous string-based hack of detecting ward-class changes from the
 * option id. The pathway engine reads these explicitly.
 */
export interface DecisionEffects {
  /** Set the patient's ward class — only meaningful for inpatient cases. */
  wardClass?: 'A' | 'B1' | 'B2' | 'C' | 'na';
  /** Toggle the patient's Integrated Shield Plan rider. */
  integratedShield?: boolean;
  /** Add flags that conditional pathway nodes can read. */
  setFlags?: string[];
  /** Remove flags that have been resolved. */
  clearFlags?: string[];
  /** Adjustments to the running pandemic state. */
  pandemic?: {
    dorsconShift?: 1 | -1;
    ppeStockpilePctDelta?: number;
    surgeCapacityPctDelta?: number;
  };
  /** Add to caregiver burden in addition to the next node's burden. */
  caregiverBurden?: {
    timeOffWorkHours?: number;
    financialWorry?: number;
    sleepDebt?: number;
  };
  /** Force a specific deteriorating-or-recovery branch by node id. */
  branchTo?: string;
}

export type DecisionOption = {
  id: string;
  label: LocalisedString;
  rationale: LocalisedString;
  /** Score awarded by selecting this option, can be negative for harms. */
  score: number;
  /** Outcome shown briefly after selection (per perspective). */
  outcome: Record<Perspective, LocalisedString>;
  /** Optional next node id; if omitted, pathway proceeds linearly. */
  nextNode?: string;
  /** Side effects fired when this option is chosen. */
  effects?: DecisionEffects;
};

export interface Decision {
  id: string;
  prompt: LocalisedString;
  options: DecisionOption[];
  reference: GuidelineRef;
  /** Multiplier on individual option scores when computing final case score. */
  weight: number;
}

export interface PathwayNode {
  id: string;
  department: DepartmentId;
  /** Optional facility id; defaults to the case's primaryFacility if unset. */
  facility?: string;
  /** In-game minutes the patient spends here (before decision and travel). */
  durationMin: number;
  /** Per-perspective narrative shown when the patient enters this node. */
  framing: Record<Perspective, LocalisedString>;
  /** Optional decision presented at this node. */
  decision?: Decision;
  /** Cost incurred at this node (SGD, gross/private rate; financing engine applies subsidy etc). */
  costSGD?: number;
  /** Charge category for the financing engine. */
  charge?:
    | 'inpatient-ward'
    | 'inpatient-procedure'
    | 'icu'
    | 'imaging'
    | 'pharmacy'
    | 'soc'
    | 'polyclinic'
    | 'rehab'
    | 'community-hospital'
    | 'a&e';
  /** Caregiver-burden delta applied when the patient enters this node. */
  caregiverBurden?: {
    timeOffWorkHours?: number;
    financialWorry?: number;
    sleepDebt?: number;
  };
  /**
   * Optional flag predicate. When set, the pathway engine skips this node if
   * the run does not have any of these flags. Lets cases author a branch that
   * only fires after a particular bad decision (e.g. 'deterioration',
   * 'familyMeeting', 'readmission').
   */
  requiresAnyFlag?: string[];
  /** Skip this node if the run has any of these flags. */
  skipIfAnyFlag?: string[];
}

export interface CaseDefinition {
  id: string;
  title: LocalisedString;
  blurb: LocalisedString;
  category: 'elective' | 'acute' | 'outpatient';
  primaryFacility: string;
  involvedFacilities: string[];
  pathway: PathwayNode[];
  guidelines: GuidelineRef[];
  /** Default patient profile id (key in DEFAULT_PROFILES). */
  profileKey: string;
  /** Whether the case lets the player choose a ward class up-front. */
  allowsWardChoice: boolean;
  /** Marks scenarios drawn from real historical events. UI shows a badge
   *  and an educational disclaimer; citations should accompany them. */
  historical?: boolean;
  /** Optional citation block for historical / educational scenarios. */
  citations?: string[];
  /**
   * Time-pressure goal for acute cases. When set, the player is shown a
   * countdown against this in-game-minute goal; exceeding it triggers a
   * deterioration flag (e.g. door-to-balloon < 90 min for STEMI).
   */
  acuteTimer?: { goalMin: number; goalLabel: string; missedFlag: string };
  /**
   * If true, the patient profile is randomly perturbed each time the case
   * starts (CHAS tier, IP rider, MediSave balance, ward class). Adds replay
   * variety without authoring multiple cases.
   */
  randomiseProfile?: boolean;
}

export type DecisionLogEntry = {
  nodeId: string;
  decisionId: string;
  optionId: string;
  scoreEarned: number;
  maxScore: number;
};

export type CaseRunStatus = 'idle' | 'running' | 'awaiting-decision' | 'completed';

export interface CaseRunSnapshot {
  caseId: string | null;
  status: CaseRunStatus;
  currentNodeId: string | null;
  currentFacilityId: string | null;
  pendingDecision: { nodeId: string; decision: Decision } | null;
  log: DecisionLogEntry[];
  startedAtGameMin: number;
  elapsedGameMin: number;
  totalCostSGD: number;
  /** Active flags set by decision effects; conditional nodes read these. */
  flags: string[];
}

export type ProgressState = {
  unlockedCaseIds: string[];
  bestScores: Record<string, { score: number; max: number; at: number }>;
  decisionsMade: number;
  casesCompleted: number;
};
