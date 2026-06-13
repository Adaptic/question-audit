import type { RubricCriterion, RubricResult } from "./types";

// Well-known trial/study names that count as "referenced by name" when present.
const KNOWN_STUDIES = [
  "galleri", "grail", "pathfinder", "lung-map", "i-spy", "stampede",
  "recovery", "keynote", "checkmate", "tailorx", "mammaprint", "oncotype",
  "seer", "nlst", "plco", "summit", "symplify", "circulate",
];

/** Detect distinct named studies/trials in the completed analysis text. */
export function extractNamedStudies(fullText: string): string[] {
  const found = new Set<string>();
  // Scan only the analysis body, not the executive / verdict / rubric meta blocks
  // (those can list candidate IDs that are explicitly background or ignored).
  const cut = fullText.search(
    /^#{2,3}\s*(Executive Brief|Candidate Evidence Verdicts|Rubric Self-Check)/im,
  );
  const text = cut >= 0 ? fullText.slice(0, cut) : fullText;

  // NCT registry IDs.
  for (const m of text.matchAll(/NCT\d{8}/g)) found.add(m[0]);
  // PubMed IDs.
  for (const m of text.matchAll(/PMID:?\s?\d+/gi)) found.add(m[0].toUpperCase().replace(/\s/g, ""));
  // Known study names (case-insensitive).
  const lower = text.toLowerCase();
  for (const name of KNOWN_STUDIES) {
    if (lower.includes(name)) found.add(name.toUpperCase());
  }
  // "<Name> trial/study" patterns — capitalized token(s) immediately before trial/study.
  for (const m of text.matchAll(/\b([A-Z][A-Za-z0-9-]{2,}(?:\s[A-Z][A-Za-z0-9-]{2,})?)\s(?:trial|study)\b/g)) {
    const name = m[1].trim();
    if (name.length > 2 && !/^(The|This|That|A|An|Our|Their|Each|Such|Both)$/i.test(name)) {
      found.add(name);
    }
  }

  return Array.from(found);
}

function hasSection(text: string, header: string): boolean {
  return new RegExp(`^##+\\s*\\d*\\.?\\s*${header}`, "im").test(text);
}

/** Count distinct failure modes in the Adversarial Critique section. */
function countFailureModes(text: string): number {
  const sectionMatch = text.match(
    /##+\s*\d*\.?\s*Adversarial Critique([\s\S]*?)(?:\n##+\s|\s*$)/i,
  );
  const body = sectionMatch ? sectionMatch[1] : "";
  if (!body) return 0;
  // Count numbered or bulleted leaders, or "Failure mode" labels.
  const numbered = body.match(/^\s*(?:\d+[.)]|[-*])\s+/gim) ?? [];
  const labeled = body.match(/failure mode\s*\d*/gi) ?? [];
  return Math.max(numbered.length, labeled.length);
}

function mentionsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

/** Parse the model's self-declared score from its Rubric Self-Check block. */
function parseModelSelfScore(text: string): string | undefined {
  const m = text.match(/Score:\s*(Pass|Partial|Fail)\s*\(?\s*(\d)\s*\/\s*7\s*\)?/i);
  if (m) return `${m[1]} (${m[2]}/7)`;
  return undefined;
}

/**
 * Deterministic rubric check — what the local parser can verify from visible text.
 * Independent of the model's own self-grade.
 */
export function checkRubric(text: string): RubricResult {
  const namedStudies = extractNamedStudies(text);
  const failureModes = countFailureModes(text);
  const hasNumber = /\d/.test(text);

  const criteria: RubricCriterion[] = [
    {
      id: "question_audited",
      label: "Research question restated and audited for hidden assumptions",
      passed:
        hasSection(text, "Hypothesis Audit") &&
        mentionsAny(text, ["assumption", "assumes", "unstated", "implicit", "hidden"]),
      detail: hasSection(text, "Hypothesis Audit")
        ? "Hypothesis Audit section present"
        : "No Hypothesis Audit section found",
    },
    {
      id: "prior_trials",
      label: "At least 2 prior trials or studies referenced by name",
      passed: namedStudies.length >= 2,
      detail:
        namedStudies.length > 0
          ? `${namedStudies.length} named: ${namedStudies.slice(0, 5).join(", ")}`
          : "No named studies detected",
    },
    {
      id: "population",
      label: "Target population defined with inclusion/exclusion logic",
      passed:
        hasSection(text, "Population Analysis") &&
        mentionsAny(text, ["inclusion", "exclusion", "eligibility", "eligible", "enroll"]),
      detail: mentionsAny(text, ["inclusion", "exclusion", "eligibility"])
        ? "Inclusion/exclusion language present"
        : "No explicit eligibility logic found",
    },
    {
      id: "statistics",
      label: "Statistical power or PPV addressed quantitatively / semi-quantitatively",
      passed:
        hasNumber &&
        mentionsAny(text, [
          "ppv", "positive predictive value", "power", "sample size",
          "nnt", "effect size", "prevalence", "sensitivity", "specificity",
        ]),
      detail: mentionsAny(text, ["ppv", "power", "sample size", "effect size"])
        ? "Statistical reasoning with numeric content present"
        : "Statistical reasoning not clearly quantified",
    },
    {
      id: "failure_modes",
      label: "At least 2 specific failure modes identified with mechanism",
      passed: failureModes >= 2,
      detail: `${failureModes} failure mode item(s) detected in critique`,
    },
    {
      id: "revised_design",
      label: "Revised / adaptive design directly addresses identified risks",
      passed:
        hasSection(text, "Adaptive Revision") &&
        mentionsAny(text, ["adaptive", "enrich", "revised", "platform", "basket", "interim"]),
      detail: hasSection(text, "Adaptive Revision")
        ? "Adaptive Revision section present"
        : "No Adaptive Revision section found",
    },
    {
      id: "why_better",
      label: "Output explains WHY the revised design improves on the original",
      passed:
        /revised research question/i.test(text) ||
        (mentionsAny(text, ["improve", "because", "addresses", "mitigat"]) &&
          hasSection(text, "Adaptive Revision")),
      detail: /revised research question/i.test(text)
        ? "Explicit Original/Revised question contrast present"
        : "Improvement rationale inferred from revision section",
    },
  ];

  const passedCount = criteria.filter((c) => c.passed).length;
  const total = criteria.length;
  const band: RubricResult["band"] =
    passedCount === total ? "Pass" : passedCount >= 4 ? "Partial" : "Fail";

  return {
    criteria,
    passedCount,
    total,
    band,
    modelSelfScore: parseModelSelfScore(text),
  };
}
