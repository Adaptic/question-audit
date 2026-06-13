// Shared type contract for TrialMind.
// The API route emits a stream of StreamEvent objects (newline-delimited JSON);
// the UI consumes them to drive the StageRail, evidence rail, reasoning panel,
// output, question diff, proof panel, and rubric check.

export type DemoPriority = "primary" | "secondary";

/** A curated evidence source attached to a preset. */
export interface EvidenceSource {
  name: string;
  type: "trial" | "study" | "guideline" | "analysis";
  note: string;
}

/** A small, hand-curated evidence packet — grounds a preset so the run is accountable. */
export interface EvidencePacket {
  id: string;
  label: string;
  sources: EvidenceSource[];
  knownFacts: string[];
  /** Quantitative anchors the model may reference (kept clearly labeled as context). */
  quantContext?: string[];
  demoCaveats: string[];
}

/** One of the three demo presets. */
export interface Preset {
  id: string;
  label: string;
  shortLabel: string;
  hypothesis: string;
  demoPriority: DemoPriority;
  evidencePacketId: string;
  expectedFailureMode: string;
  /** Hints for the live lookup term builder. */
  lookup: {
    condition?: string;
    intervention?: string;
    terms: string[];
  };
  /** Path to a cached fixture used when live API is unavailable / demo mode is on. */
  backupFixtureId?: string;
}

export type CandidateSource = "clinicaltrials.gov" | "pubmed";

/** A single live-lookup candidate — metadata only, labeled as candidate evidence. */
export interface EvidenceCandidate {
  source: CandidateSource;
  id: string;
  title: string;
  status?: string;
  phase?: string;
  year?: string;
  url?: string;
  signals: string[];
  /** How the model later classified it; "candidate" until then. */
  relevance: "candidate" | "use" | "background" | "ignore";
}

export type StageId =
  | "run_spec"
  | "evidence"
  | "reasoning"
  | "critique"
  | "verification";

export type StageStatus = "pending" | "active" | "done" | "skipped";

/** Deterministic rubric parser output. */
export interface RubricCriterion {
  id: string;
  label: string;
  /** What the local parser could verify from the visible text. */
  passed: boolean;
  detail: string;
}

export interface RubricResult {
  criteria: RubricCriterion[];
  passedCount: number;
  total: number;
  band: "Pass" | "Partial" | "Fail";
  /** What the model claimed about itself, parsed from its checkbox block. */
  modelSelfScore?: string;
}

/** "Is this real?" proof panel payload, assembled after the run completes. */
export interface ProofData {
  curatedSources: EvidenceSource[];
  /** Live candidates, each classified used / background / ignore. */
  candidates: EvidenceCandidate[];
  namedStudies: string[];
  quantChecks: string[];
  assumptions: string[];
  unsupportedWarnings: string[];
  openUncertainty: string[];
  /** Set when a preset's live scan was weak and curated evidence carries the audit. */
  lookupNote?: string;
}

/** Founder/investor executive layer — the main demo moment. */
export interface ExecutiveSummary {
  wrongQuestion: string;
  whyItFails: string;
  betterQuestion: string;
  whatChanges: string;
  evidenceConfidence: {
    level: "High" | "Moderate" | "Low";
    reason: string;
  };
}

/** Original-vs-revised question diff. */
export interface QuestionDiffData {
  original: string;
  revised: string;
  changes: { dimension: string; from: string; to: string }[];
}

// ---- Stream events emitted by /api/analyze ----

export type StreamEvent =
  | { type: "meta"; model: string; cached: boolean; presetId?: string; lookupEnabled: boolean }
  | { type: "stage"; stage: StageId; status: StageStatus; note?: string }
  | { type: "run_spec"; hypothesis: string; presetLabel?: string; caveats: string[] }
  | { type: "lookup_start"; queryTerms: string[] }
  | { type: "lookup_candidate"; candidate: EvidenceCandidate }
  | { type: "lookup_done"; counts: { trials: number; publications: number }; warnings: string[] }
  | { type: "lookup_unavailable"; reason: string }
  | { type: "lookup_low_relevance"; reason: string }
  | { type: "thinking"; text: string }
  | { type: "text"; text: string }
  | { type: "critic"; text: string }
  | { type: "proof"; proof: ProofData }
  | { type: "executive"; summary: ExecutiveSummary }
  | { type: "diff"; diff: QuestionDiffData }
  | { type: "verification"; result: RubricResult }
  | { type: "error"; message: string; fallbackAvailable: boolean }
  | { type: "done" };
