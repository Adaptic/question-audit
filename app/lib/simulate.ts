// Pure, dependency-free models behind the "Why the Question Fails" simulators.
// Shared by the interactive component and the export artifact so the numbers match.

export interface PpvInputs {
  prevalencePct: number; // disease prevalence in the tested population, %
  sensitivity: number; // 0-1
  specificity: number; // 0-1
}

export interface PpvResult {
  prevalencePct: number;
  truePositives: number;
  falsePositives: number;
  ppvPct: number; // of everyone who tests positive, % who truly have disease
}

// Modest MCED-style operating point for a single rarer cancer at early stage.
export const DEFAULT_SENS = 0.6;
export const DEFAULT_SPEC = 0.99;

export const POPULATION_PRESETS = {
  general: { label: "General screening population", prevalencePct: 0.5 },
  enriched: { label: "Risk-enriched population", prevalencePct: 6 },
} as const;

export type PopulationKey = keyof typeof POPULATION_PRESETS;

/** Per 100,000 tested, compute true/false positives and PPV. */
export function ppvModel(inputs: PpvInputs): PpvResult {
  const N = 100_000;
  const { prevalencePct, sensitivity, specificity } = inputs;
  const diseased = (N * prevalencePct) / 100;
  const healthy = N - diseased;
  const tp = diseased * sensitivity;
  const fp = healthy * (1 - specificity);
  const ppv = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
  return {
    prevalencePct,
    truePositives: Math.round(tp),
    falsePositives: Math.round(fp),
    ppvPct: ppv,
  };
}

export interface DilutionInputs {
  totalCancers: number; // composite size, e.g. 12
  responsiveCancers: number; // # with a real detectable stage-shift effect
  perCancerEffect: number; // relative late-stage reduction for a responsive cancer (0-1)
  detectableThreshold: number; // minimum pooled effect the trial can detect (0-1)
}

export interface DilutionResult {
  pooledEffect: number; // averaged across the whole composite
  targetedEffect: number; // if you only enroll/measure the responsive cancers
  threshold: number;
  pooledDetected: boolean;
  targetedDetected: boolean;
}

export const DEFAULT_DILUTION: DilutionInputs = {
  totalCancers: 12,
  responsiveCancers: 5,
  perCancerEffect: 0.3,
  detectableThreshold: 0.15,
};

/** A composite endpoint averages a real subgroup effect across non-responding cancers. */
export function dilutionModel(inputs: DilutionInputs): DilutionResult {
  const { totalCancers, responsiveCancers, perCancerEffect, detectableThreshold } = inputs;
  const pooled = (responsiveCancers * perCancerEffect) / totalCancers;
  const targeted = perCancerEffect;
  return {
    pooledEffect: pooled,
    targetedEffect: targeted,
    threshold: detectableThreshold,
    pooledDetected: pooled >= detectableThreshold,
    targetedDetected: targeted >= detectableThreshold,
  };
}
