export type Perspective = 'patient' | 'caregiver' | 'staff';

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
  label: string;
  body: string;
};

export type DecisionOption = {
  id: string;
  label: string;
  rationale: string;
  /** Score awarded by selecting this option, can be negative for harms. */
  score: number;
  /** Outcome shown briefly after selection (per perspective). */
  outcome: Record<Perspective, string>;
  /** Optional next node id; if omitted, pathway proceeds linearly. */
  nextNode?: string;
};

export interface Decision {
  id: string;
  prompt: string;
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
  framing: Record<Perspective, string>;
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
    financialWorry?: number; // 0..100 delta
    sleepDebt?: number; // 0..100 delta
  };
}

export interface CaseDefinition {
  id: string;
  title: string;
  blurb: string;
  category: 'elective' | 'acute' | 'outpatient';
  primaryFacility: string;
  involvedFacilities: string[];
  pathway: PathwayNode[];
  guidelines: GuidelineRef[];
  /** Default patient profile id (key in DEFAULT_PROFILES). */
  profileKey: string;
  /** Whether the case lets the player choose a ward class up-front. */
  allowsWardChoice: boolean;
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
}

export type ProgressState = {
  unlockedCaseIds: string[];
  bestScores: Record<string, { score: number; max: number; at: number }>;
  decisionsMade: number;
  casesCompleted: number;
};
