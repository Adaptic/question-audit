import type { EvidenceCandidate } from "./types";

export interface DemoFixture {
  presetId: string;
  queryTerms: string[];
  candidates: EvidenceCandidate[];
  thinking: string;
  analysis: string;
  critic: string;
}

const GALLERI_ANALYSIS = `## 1. Hypothesis Audit

The stated research question is: *can a multi-cancer early detection (MCED) blood test reduce the combined incidence of Stage III + Stage IV diagnoses across ALL cancer types in a general screening population aged 50–77?*

This sounds ambitious and reasonable, but it embeds several **unstated assumptions** that the trial never tests directly:

1. **That "all cancers pooled" is the right unit of effect.** The composite treats a stage shift in pancreatic cancer as interchangeable with one in prostate cancer. Biologically and operationally these are not comparable — some cancers already have effective screening, some shed almost no ctDNA at early stage.
2. **That a general 50–77 population has high enough per-cancer prevalence to power a stage-shift signal.** This is the load-bearing assumption, and it is almost certainly false for the rarer high-mortality cancers.
3. **That positive predictive value (PPV) at the population level will be high enough to convert detected signals into managed early-stage diagnoses** without a flood of false positives diluting the benefit.

The question being asked is "does MCED shift stage across all cancers?" The question that should be asked is "**in which population, and for which cancers, does MCED produce a stage shift large enough to detect and act on?**"

## 2. Evidence Context

- **NHS-Galleri (ISRCTN91431511):** ~140,000 participants randomized, composite Stage III/IV all-cancer endpoint. The composite was not met at the pre-specified interim, while a pre-specified subgroup of ~12 high-mortality cancers showed a more substantial late-stage reduction signal.
- **PATHFINDER (GRAIL):** reported MCED PPV in the ~40% range in a screening-eligible population — meaningfully better than most single-cancer screens, but realized PPV falls as the target prevalence falls.
- **NLST (lung CT screening):** demonstrated that stage shift and mortality benefit are detectable *when the population is enriched for risk* (heavy smokers) and the cancer is high-incidence within that group — the opposite design choice to a general all-cancer composite.
- **SEER incidence/survival data:** confirms that the high-mortality cancers (pancreatic, ovarian, liver) are individually rare in a general 50–77 cohort, so per-cancer event counts are small.

The pattern is consistent: stage-shift signals are found in *enriched* populations and *concentrated* endpoints, not diffuse composites.

## 3. Population Analysis

A general NHS screening population aged 50–77 has, for any single high-mortality cancer, an annual incidence on the order of tens per 100,000. At that prevalence, even a test with 99% specificity generates more false positives than true positives for that cancer — driving PPV well below the ~40% PATHFINDER figure when the target is a *specific* rare cancer rather than "any cancer."

- **Inclusion (revised target):** adults with elevated baseline risk — e.g. cancer survivors, strong family history, or established exposure — where pre-test probability is materially higher.
- **Exclusion:** cancers already covered by effective organized screening (breast, cervical, colorectal within program age ranges) should not anchor the primary endpoint, since incremental MCED benefit there is small and dilutes the estimate.

Pooling high-prevalence, slow-shifting cancers with rare, fast-killing ones is the core population error: it averages a detectable signal into an undetectable one.

## 4. Trial Design

- **Primary endpoint:** reduction in late-stage (III/IV) incidence within a **pre-specified high-mortality cancer set** (pancreatic, ovarian, liver, lung, esophageal, gastric), not an all-cancer composite.
- **Population:** enrichment for elevated risk to raise pre-test probability and per-cancer event rate.
- **Control arm:** standard-of-care surveillance / usual screening.
- **Statistical approach:** Bayesian adaptive design with pre-specified interim analyses; the high-mortality subgroup is the primary analysis, not a secondary rescue.
- **Sample-size signal:** enrichment raises per-cancer events, so the required N to detect a given relative stage shift falls materially versus the diffuse composite — the same intuition NLST exploited by enriching for smokers.
- **Timeline:** interim looks gate expansion, so a null high-mortality signal stops the trial early rather than after full enrollment.

## 5. Adversarial Critique

1. **Low-prevalence PPV collapse (mechanism):** at general-population prevalence, the ratio of true to false positives for any specific rare cancer is unfavorable, so detected signals don't convert to managed early-stage diagnoses at a rate that moves the endpoint. *This is the mechanism that sank the original composite.*
2. **Composite dilution (mechanism):** pooling cancers with no plausible MCED stage shift (already-screened, low-ctDNA-shedding) with those that do shrinks the averaged effect size below the powered threshold.
3. **Lead-time / overdiagnosis bias (mechanism):** earlier detection can shift apparent stage distribution without changing the trajectory of indolent disease, inflating a "stage shift" that is partly measurement artifact rather than benefit.

## 6. Adaptive Revision

Replace the all-cancer composite with an **adaptive enrichment design** focused on the high-mortality cancer set, in a higher-risk population, with Bayesian interim analyses that can expand or stop based on accumulating per-cancer signal. Concentrate the endpoint where the biology (ctDNA shedding at earlier stage) and the epidemiology (high mortality, poor existing screening) make a stage shift both plausible and clinically decisive.

This directly addresses each failure mode: enrichment fixes the PPV collapse (higher pre-test probability), the focused endpoint fixes composite dilution (no averaging against null cancers), and a pre-specified mortality/stage co-primary plus interim looks limit lead-time over-interpretation.

### Revised Research Question
Original: Does an MCED blood test reduce combined Stage III/IV incidence across ALL cancers in a general 50–77 screening population?
Revised: In a risk-enriched population, does an MCED test produce a clinically meaningful Stage IV reduction across a pre-specified set of high-mortality cancers, evaluated under an adaptive design?

The revised design improves on the original because it tests the effect where it can actually be detected and acted upon — concentrating statistical power and PPV on the cancers and patients for whom early detection changes outcomes, rather than diluting a real subgroup effect inside an unpowered all-cancer average.

### Executive Brief
- Wrong question: Can a blood test cut late-stage diagnoses across ALL cancers at once in the general public?
- Why it fails: In the general public any single cancer is rare, so most positive tests are false alarms (low PPV) and a real benefit in a few deadly cancers gets averaged away by cancers the test cannot shift.
- Better question: In higher-risk people, does the test cut Stage IV diagnoses for a focused set of high-mortality cancers?
- What changes: Enrich the population and target high-mortality cancers under an adaptive design, instead of an all-cancer composite in everyone.
- Evidence confidence: Moderate — grounded in NHS-Galleri, PATHFINDER and NLST, but specific PPV and effect-size figures are reasoned estimates.

### Candidate Evidence Verdicts
- NCT04241796: use — PATHFINDER anchors the multi-cancer PPV figure used in the analysis.
- NCT05611632: background — a general MCED screening study, related context only.
- PMID:37683136: background — MCED performance paper, supports background but not a specific claim.
- NCT07133269: ignore — generic blood-biomarker registry, off-topic for this endpoint question.
- NCT05699785: ignore — community screening engagement study, low relevance to the late-stage composite.

## Rubric Self-Check
- [x] The research question is explicitly restated and audited for hidden assumptions
- [x] At least 2 prior related trials or studies are referenced by name (NHS-Galleri, PATHFINDER, NLST, SEER)
- [x] The target population is specifically defined with inclusion/exclusion logic
- [x] Statistical power or PPV is addressed quantitatively or semi-quantitatively
- [x] At least 2 specific failure modes are identified with their mechanism
- [x] A revised or adaptive design is provided that directly addresses the identified risks
- [x] The output explains WHY the revised design improves on the original hypothesis

Score: Pass (7/7)`;

const GALLERI_THINKING = `Let me start by separating the technology from the question. The Galleri assay detecting a cancer signal is a different claim from "this trial design can measure a stage shift." The brief result — composite missed, high-mortality subgroup positive — is the tell. That pattern almost always means the endpoint was too diffuse for the population's prevalence.

Work the PPV intuition: PPV depends on pre-test probability. In a general 50–77 cohort, any single rare cancer has very low prevalence, so even excellent specificity yields a poor true-to-false-positive ratio for that cancer. PATHFINDER's ~40% PPV was for "any cancer signal," not for a specific rare cancer — so the composite quietly relied on the common cancers to carry PPV while asking the rare ones to carry the mortality benefit. Those are in tension.

Then composite dilution: pooling already-screened cancers (breast, colorectal) and low-shedding cancers with the high-mortality set averages a real subgroup effect toward null. NLST is the clean contrast — enrich the population (smokers), concentrate the endpoint, and the signal becomes detectable.

So the revision writes itself: enrich the population, focus the endpoint on high-mortality cancers, use an adaptive design so a null stops early. I should be careful to label PPV/prevalence figures as estimates and flag lead-time bias as a genuine confounder, not hand-wave it.`;

const GALLERI_CRITIC = `- **Unsupported claims** The ~40% PATHFINDER PPV is cited correctly as "any-cancer," but the implied per-cancer PPV collapse is reasoned, not measured — keep it labeled as an estimate.
- **Statistical hand-waving** "Required N falls materially" under enrichment is directionally right but no target effect size or alpha/power is stated; a real protocol needs the assumed relative stage-shift and event rates.
- **Hidden clinical assumptions** Assumes the high-mortality cancers shed enough ctDNA at Stage I/II to be detectable earlier — true for some (lung) more than others (pancreatic); should be cancer-specific.
- **Missing caveats** Overdiagnosis is mentioned but the harm side (false-positive workup burden in an enriched, anxious survivor population) is under-weighted.
- Strength: the failure-mode-to-revision mapping is explicit and each mechanism is named rather than asserted.`;

const SURVIVOR_ANALYSIS = `## 1. Hypothesis Audit

The question — *does a methylation MCED test improve early-stage detection in cancer survivors with risk factors, versus standard surveillance, across 12 high-mortality cancers?* — is much closer to the right question than the general-population Galleri framing, because it already enriches the population. The key **unstated assumptions**: (1) that "improved early-stage detection" will translate into outcome benefit rather than lead-time artifact; (2) that recurrence, second-primary, and de novo cancers can be cleanly distinguished; (3) that survivors' elevated risk is uniform across the 12 targeted cancers.

## 2. Evidence Context

- **PATHFINDER / PATHFINDER 2 (GRAIL):** MCED PPV and diagnostic yield in screening populations — the anchor for expected performance once prevalence is raised.
- **NLST:** establishes that enrichment for risk produces detectable stage shift, the principle this design leans on.
- **SEER survivorship data:** second primaries and recurrence are materially more common in survivors than de novo cancers in the general population, raising event rates and power.

## 3. Population Analysis

- **Inclusion:** cancer survivors 1–10 years from primary treatment with at least one established risk factor (prior smoking, hereditary syndrome, prior high-stage disease).
- **Exclusion:** active known malignancy, or cancers under effective organized surveillance where MCED adds little.

Enrichment raises pre-test probability, so realized PPV should exceed the general-population figure at the same test sensitivity/specificity. Expected event rates are high enough to power a stage-shift endpoint without an impractically large N.

## 4. Trial Design

- **Primary endpoint:** stage at diagnosis (Stage I/II vs III/IV) for the 12-cancer set, with a co-primary of cancer-specific outcome to guard against lead-time-only benefit.
- **Control:** guideline-concordant surveillance alone.
- **Statistics:** stratified by primary-cancer type; pre-specified adjudication separating recurrence / second-primary / de novo.
- **Sample size signal:** elevated survivor event rates reduce required N relative to general screening.
- **Timeline:** interim futility look on stage-shift signal.

## 5. Adversarial Critique

1. **Lead-time / length-time bias (mechanism):** earlier detection shifts the apparent stage distribution without necessarily changing outcome; a stage-only endpoint can look positive while mortality is unchanged.
2. **Classification confounding (mechanism):** misattributing recurrence as a "newly detected" cancer inflates apparent detection benefit.
3. **Heterogeneous risk (mechanism):** pooling 12 cancers with very different survivor-specific risk re-introduces a milder version of the composite-dilution problem.

## 6. Adaptive Revision

Use an **adaptive enrichment design** with a stage co-primary plus cancer-specific outcome, pre-specified adjudication of recurrence vs second-primary vs de novo, and interim looks that can drop low-yield cancers from the targeted set.

### Revised Research Question
Original: Does methylation MCED improve early-stage detection in survivors versus surveillance across 12 high-mortality cancers?
Revised: In risk-stratified survivors, does MCED produce a stage shift AND a cancer-specific outcome benefit, with adjudicated cancer classification, under an adaptive design that prunes low-yield targets?

The revision improves on the original by pairing the detection endpoint with an outcome co-primary (defeating lead-time-only wins) and by adjudicating cancer type (defeating recurrence misclassification) — converting a potentially artifactual detection signal into a defensible benefit claim.

### Executive Brief
- Wrong question: Does the test find cancers earlier in survivors than routine surveillance across 12 cancers?
- Why it fails: "Earlier detection" can be a measurement illusion (lead-time bias) and recurrences can be miscounted as new cancers, so a detection win may not be a real outcome win.
- Better question: In risk-stratified survivors, does the test produce both a stage shift AND a cancer-specific outcome benefit, with adjudicated cancer type?
- What changes: Add an outcome co-primary and pre-specified recurrence vs second-primary adjudication under an adaptive design that prunes low-yield cancers.
- Evidence confidence: Moderate — grounded in PATHFINDER, NLST and SEER survivorship data; population-specific performance figures are estimates.

## Rubric Self-Check
- [x] The research question is explicitly restated and audited for hidden assumptions
- [x] At least 2 prior related trials or studies are referenced by name (PATHFINDER, NLST, SEER)
- [x] The target population is specifically defined with inclusion/exclusion logic
- [x] Statistical power or PPV is addressed quantitatively or semi-quantitatively
- [x] At least 2 specific failure modes are identified with their mechanism
- [x] A revised or adaptive design is provided that directly addresses the identified risks
- [x] The output explains WHY the revised design improves on the original hypothesis

Score: Pass (7/7)`;

const FATIGUE_ANALYSIS = `## 1. Hypothesis Audit

The question — *does low-dose naltrexone (4.5 mg) reduce cancer-related fatigue by ≥30% versus placebo in breast cancer survivors 6–24 months post-chemo over 12 weeks?* — embeds **unstated assumptions**: (1) that a 30% relative responder threshold is the right effect size given high placebo response on fatigue PROs; (2) that 12 weeks is long enough to separate drug effect from natural recovery; (3) that fatigue is a single mechanism LDN can act on, when it is multifactorial (anemia, deconditioning, sleep, depression, inflammation).

## 2. Evidence Context

- **LDN fibromyalgia/fatigue RCTs:** small studies suggest a plausible but modest anti-inflammatory effect — not a 30% responder rate at high confidence.
- **PROMIS Fatigue / FACIT-F validation studies:** define MCID, which is typically *smaller* than a 30% relative change — the chosen threshold may be too coarse.
- **NCCN Cancer-Related Fatigue guideline:** defines the multifactorial standard-of-care comparator.

## 3. Population Analysis

- **Inclusion:** breast cancer survivors 6–24 months post-chemo with clinically significant fatigue (e.g. BFI ≥ 4) and no untreated anemia/hypothyroidism.
- **Exclusion:** active disease, opioid use (naltrexone interaction), untreated depression as primary driver.

Screening for fatigue severity at entry concentrates the treatable signal and limits floor/ceiling effects.

## 4. Trial Design

- **Primary endpoint:** change in continuous fatigue score (not a 30% responder dichotomy), powered against the instrument MCID.
- **Control:** placebo, with both arms on guideline supportive care.
- **Statistics:** mixed-model repeated measures to use the full trajectory; placebo-response adjustment.
- **Sample size signal:** continuous endpoint at MCID needs fewer subjects than a high-threshold responder analysis.
- **Timeline:** extend to 16–24 weeks with a run-in to net out spontaneous recovery.

## 5. Adversarial Critique

1. **Placebo response (mechanism):** fatigue PROs show large placebo effects; a 30% responder bar without placebo adjustment confounds drug effect with expectation.
2. **Spontaneous recovery (mechanism):** post-chemo fatigue improves naturally over 6–24 months, so a short window can credit natural recovery to the drug.
3. **Multifactorial dilution (mechanism):** enrolling fatigue from heterogeneous causes (anemia, depression) dilutes any LDN-specific anti-inflammatory effect.

## 6. Adaptive Revision

Switch to a **continuous MCID-powered endpoint with a placebo run-in and a longer window**, enrich for inflammatory-phenotype fatigue, and use MMRM over the full trajectory with an interim futility look.

### Revised Research Question
Original: Does LDN produce ≥30% fatigue reduction vs placebo in post-chemo breast cancer survivors over 12 weeks?
Revised: In survivors with significant, inflammatory-phenotype fatigue, does LDN produce an MCID-exceeding improvement in continuous fatigue score over a placebo run-in–controlled window, analyzed by MMRM?

The revision improves on the original by replacing an arbitrary, placebo-confounded 30% bar with an MCID-anchored continuous endpoint, and by controlling for spontaneous recovery — so a positive result reflects drug effect rather than measurement choice.

### Executive Brief
- Wrong question: Does low-dose naltrexone cut fatigue by 30% versus placebo over 12 weeks in post-chemo breast cancer survivors?
- Why it fails: Fatigue scores have large placebo responses and improve on their own after chemo, so a short trial with an arbitrary 30% bar can credit natural recovery and placebo to the drug.
- Better question: In survivors with significant inflammatory-phenotype fatigue, does the drug beat the instrument's clinically meaningful threshold over a placebo-run-in-controlled window?
- What changes: Replace the 30% responder bar with an MCID-anchored continuous endpoint, add a placebo run-in, lengthen the window, and analyze by MMRM.
- Evidence confidence: Low — prior low-dose naltrexone fatigue evidence is small-sample; effect sizes are estimates.

## Rubric Self-Check
- [x] The research question is explicitly restated and audited for hidden assumptions
- [x] At least 2 prior related trials or studies are referenced by name (LDN RCTs, PROMIS/FACIT-F, NCCN)
- [x] The target population is specifically defined with inclusion/exclusion logic
- [x] Statistical power or PPV is addressed quantitatively or semi-quantitatively
- [x] At least 2 specific failure modes are identified with their mechanism
- [x] A revised or adaptive design is provided that directly addresses the identified risks
- [x] The output explains WHY the revised design improves on the original hypothesis

Score: Pass (7/7)`;

const GENERIC_THINKING = `Separate the intervention's plausibility from the question's design. Identify the load-bearing assumption in the hypothesis, check whether the chosen population and endpoint can actually detect the claimed effect, reason about PPV/power at the stated prevalence, then name the failure modes and write a revision that concentrates the signal. Label any specific figure as an estimate.`;

const GENERIC_CRITIC = `- **Statistical hand-waving** Effect-size and power assumptions are directional; a real protocol needs explicit alpha, power, and assumed event rates.
- **Hidden clinical assumptions** Assumes the endpoint instrument and population are homogeneous; both should be stratified.
- **Missing caveats** Bias sources (lead-time, placebo response, confounding) are named but their magnitude is not quantified.
- Strength: failure modes are mapped directly onto the revised design.`;

const GALLERI_CANDIDATES: EvidenceCandidate[] = [
  {
    source: "clinicaltrials.gov",
    id: "NCT05611632",
    title: "A Study to Evaluate a Multi-Cancer Early Detection Test in a Screening Population",
    status: "RECRUITING",
    phase: "N/A",
    url: "https://clinicaltrials.gov/study/NCT05611632",
    signals: ["condition: cancer", "endpoint overlap"],
    relevance: "candidate",
  },
  {
    source: "clinicaltrials.gov",
    id: "NCT04241796",
    title: "The PATHFINDER Study: Multi-Cancer Early Detection",
    status: "COMPLETED",
    phase: "N/A",
    url: "https://clinicaltrials.gov/study/NCT04241796",
    signals: ["condition: cancer", "PPV reference"],
    relevance: "candidate",
  },
  {
    source: "pubmed",
    id: "PMID:37683136",
    title: "Multi-cancer early detection test in symptom-based and screening populations",
    year: "2023",
    url: "https://pubmed.ncbi.nlm.nih.gov/37683136/",
    signals: ["Annals of Oncology"],
    relevance: "candidate",
  },
  {
    source: "clinicaltrials.gov",
    id: "NCT07133269",
    title: "Observational Registry of Blood-Based Biomarkers in Adults",
    status: "RECRUITING",
    url: "https://clinicaltrials.gov/study/NCT07133269",
    signals: ["term match"],
    relevance: "candidate",
  },
  {
    source: "clinicaltrials.gov",
    id: "NCT05699785",
    title: "Community Screening Engagement Study",
    status: "RECRUITING",
    url: "https://clinicaltrials.gov/study/NCT05699785",
    signals: ["term match"],
    relevance: "candidate",
  },
];

export const DEMO_FIXTURES: Record<string, DemoFixture> = {
  galleri: {
    presetId: "galleri",
    queryTerms: ["multi-cancer early detection", "MCED screening", "ctDNA screening", "cancer stage shift"],
    candidates: GALLERI_CANDIDATES,
    thinking: GALLERI_THINKING,
    analysis: GALLERI_ANALYSIS,
    critic: GALLERI_CRITIC,
  },
  "cancer-survivor-mced": {
    presetId: "cancer-survivor-mced",
    queryTerms: ["cancer survivor surveillance", "second primary cancer", "methylation MCED", "high mortality cancer"],
    candidates: [
      {
        source: "clinicaltrials.gov",
        id: "NCT05205967",
        title: "Multi-Cancer Early Detection in Individuals at Elevated Risk",
        status: "RECRUITING",
        url: "https://clinicaltrials.gov/study/NCT05205967",
        signals: ["condition: cancer", "enriched population"],
        relevance: "candidate",
      },
      {
        source: "pubmed",
        id: "PMID:36041471",
        title: "Clinical validation of a targeted methylation-based multi-cancer early detection test",
        year: "2021",
        url: "https://pubmed.ncbi.nlm.nih.gov/36041471/",
        signals: ["Annals of Oncology"],
        relevance: "candidate",
      },
    ],
    thinking: GENERIC_THINKING,
    analysis: SURVIVOR_ANALYSIS,
    critic: GENERIC_CRITIC,
  },
  "post-chemo-fatigue": {
    presetId: "post-chemo-fatigue",
    queryTerms: ["low-dose naltrexone fatigue", "cancer-related fatigue", "breast cancer survivor fatigue", "naltrexone RCT"],
    candidates: [
      {
        source: "clinicaltrials.gov",
        id: "NCT04372108",
        title: "Low-Dose Naltrexone for Cancer-Related Fatigue",
        status: "UNKNOWN",
        url: "https://clinicaltrials.gov/study/NCT04372108",
        signals: ["intervention: naltrexone", "endpoint: fatigue"],
        relevance: "candidate",
      },
      {
        source: "pubmed",
        id: "PMID:30248967",
        title: "Low-dose naltrexone in the treatment of fibromyalgia and chronic fatigue",
        year: "2018",
        url: "https://pubmed.ncbi.nlm.nih.gov/30248967/",
        signals: ["clinical review"],
        relevance: "candidate",
      },
    ],
    thinking: GENERIC_THINKING,
    analysis: FATIGUE_ANALYSIS,
    critic: GENERIC_CRITIC,
  },
};

export function getFixture(presetId?: string): DemoFixture | undefined {
  if (!presetId) return undefined;
  return DEMO_FIXTURES[presetId];
}
