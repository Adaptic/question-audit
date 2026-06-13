import type {
  QuestionDiffData,
  ExecutiveSummary,
  EvidenceCandidate,
} from "./types";

/** Split text into sentence-ish fragments for keyword scanning. */
function sentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 320);
}

function pick(text: string, keywords: string[], limit: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of sentences(text)) {
    const lower = s.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      const key = s.slice(0, 60);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(s.replace(/^[-*\d.)\s]+/, "").replace(/\*\*/g, "").trim());
      }
    }
    if (out.length >= limit) break;
  }
  return out;
}

export function extractAssumptions(text: string): string[] {
  return pick(text, ["assum", "unstated", "implicit", "presume", "takes for granted"], 4);
}

export function extractQuantChecks(text: string): string[] {
  return pick(
    text,
    ["ppv", "positive predictive value", "power", "sample size", "nnt", "effect size", "prevalence", "sensitivity", "specificity", "%"],
    4,
  ).filter((s) => /\d/.test(s));
}

export function extractUncertainty(text: string): string[] {
  return pick(
    text,
    ["uncertain", "needs expert", "would require", "cannot confirm", "estimate", "not verified", "remains unclear", "should be validated", "further"],
    4,
  );
}

/** Parse the critic/auditor bullets into unsupported-claim warnings. */
export function parseCriticWarnings(critic: string): string[] {
  if (!critic) return [];
  const out: string[] = [];
  for (const raw of critic.split("\n")) {
    const line = raw.trim().replace(/^[-*]\s*/, "");
    if (!line) continue;
    if (/^strength:/i.test(line)) continue;
    // Keep bullets that read like flagged issues.
    if (/unsupported|hand-waving|hidden|missing|assumption|caveat|overstat|underpowered|bias/i.test(line)) {
      out.push(line.replace(/\*\*/g, ""));
    }
    if (out.length >= 6) break;
  }
  return out;
}

/** Parse the machine-readable "### Executive Brief" block. */
export function extractExecutive(text: string): ExecutiveSummary | null {
  const block = text.match(/###\s*Executive Brief([\s\S]{0,1600})/i);
  if (!block) return null;
  const body = block[1];

  const field = (label: string): string => {
    const m = body.match(new RegExp(`-\\s*${label}\\s*:\\s*(.+)`, "i"));
    return m ? m[1].replace(/\*\*/g, "").trim() : "";
  };

  const wrongQuestion = field("Wrong question");
  const whyItFails = field("Why it fails");
  const betterQuestion = field("Better question");
  const whatChanges = field("What changes");
  const ecRaw = field("Evidence confidence");

  if (!wrongQuestion && !betterQuestion) return null;

  let level: ExecutiveSummary["evidenceConfidence"]["level"] = "Moderate";
  let reason = ecRaw;
  const lm = ecRaw.match(/(High|Moderate|Low)\s*[—\-:]\s*(.+)/i);
  if (lm) {
    level = cap(lm[1]);
    reason = lm[2].trim();
  } else {
    const lv = ecRaw.match(/(High|Moderate|Low)/i);
    if (lv) {
      level = cap(lv[1]);
      reason = ecRaw.replace(lv[1], "").replace(/^[\s—\-:]+/, "").trim();
    }
  }

  return {
    wrongQuestion,
    whyItFails,
    betterQuestion,
    whatChanges,
    evidenceConfidence: { level, reason: reason || "based on the attached evidence" },
  };
}

function cap(s: string): ExecutiveSummary["evidenceConfidence"]["level"] {
  const l = s.toLowerCase();
  if (l === "high") return "High";
  if (l === "low") return "Low";
  return "Moderate";
}

type Verdict = "use" | "background" | "ignore";

function normId(id: string): string {
  return id
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^PMID:?/, "PMID:");
}

/**
 * Parse the model's "### Candidate Evidence Verdicts" block into ID -> verdict.
 * This is the model's own judgment about each live candidate.
 */
export function extractCandidateVerdicts(text: string): Record<string, Verdict> {
  const out: Record<string, Verdict> = {};
  const block = text.match(/###\s*Candidate Evidence Verdicts([\s\S]*?)(?:\n#{2,3}\s|$)/i);
  if (!block) return out;
  for (const m of block[1].matchAll(
    /-\s*(NCT\d{6,9}|PMID:?\s*\d+)\s*:\s*(use|background|ignore)\b/gi,
  )) {
    out[normId(m[1])] = m[2].toLowerCase() as Verdict;
  }
  return out;
}

/**
 * Classify live candidates. The model's explicit verdict wins; if absent, fall
 * back to a conservative heuristic. Curated evidence stays primary; live lookup
 * is secondary, and ignored candidates never count as "used".
 */
export function classifyCandidates(
  candidates: EvidenceCandidate[],
  analysisText: string,
  lookupStatus: "ok" | "low_relevance" | "unavailable" | "none",
  verdicts: Record<string, Verdict> = {},
): EvidenceCandidate[] {
  const lower = analysisText.toLowerCase();
  return candidates.map((c) => {
    const modelVerdict = verdicts[normId(c.id)];
    let relevance: EvidenceCandidate["relevance"];
    if (modelVerdict) {
      relevance = modelVerdict;
    } else {
      const core = c.id.replace(/^PMID:/i, "").toLowerCase();
      const named =
        lower.includes(c.id.toLowerCase()) || (core.length >= 5 && lower.includes(core));
      if (lookupStatus === "low_relevance" || lookupStatus === "unavailable") {
        relevance = "ignore";
      } else {
        relevance = named ? "use" : "background";
      }
    }
    return { ...c, relevance };
  });
}

/**
 * Extract the original-vs-revised research question diff.
 * Looks for the "Revised Research Question" block (Original: / Revised: lines).
 */
export function extractQuestionDiff(
  text: string,
  fallbackOriginal: string,
): QuestionDiffData | null {
  const block = text.match(/Revised Research Question[\s\S]{0,1200}/i);
  let original = fallbackOriginal.trim();
  let revised = "";

  if (block) {
    const body = block[0];
    const o = body.match(/Original:\s*(.+?)(?:\n|$)/i);
    const r = body.match(/Revised:\s*(.+?)(?:\n|$)/i);
    if (o) original = o[1].replace(/\*\*/g, "").trim();
    if (r) revised = r[1].replace(/\*\*/g, "").trim();
  }

  if (!revised) return null;

  // Derive a few high-level change dimensions heuristically.
  const changes: QuestionDiffData["changes"] = [];
  const lo = original.toLowerCase();
  const lr = revised.toLowerCase();

  const endpointShift =
    (lo.includes("composite") || lo.includes("all cancer") || lo.includes("all-cancer") || lo.includes("combined")) &&
    (lr.includes("high-mortality") || lr.includes("targeted") || lr.includes("subgroup") || lr.includes("specific") || lr.includes("single"));
  if (endpointShift) {
    changes.push({ dimension: "Endpoint", from: "broad / composite", to: "targeted / enriched" });
  }

  const popShift =
    (lo.includes("general") || lo.includes("all ") || lo.includes("average-risk")) &&
    (lr.includes("enrich") || lr.includes("high-risk") || lr.includes("survivor") || lr.includes("higher-risk") || lr.includes("selected"));
  if (popShift) {
    changes.push({ dimension: "Population", from: "general / unselected", to: "enriched / higher-risk" });
  }

  const designShift = lr.includes("adaptive") || lr.includes("platform") || lr.includes("basket") || lr.includes("interim") || lr.includes("bayesian");
  if (designShift) {
    changes.push({ dimension: "Design", from: "fixed single-question", to: "adaptive / enrichment" });
  }

  if (changes.length === 0) {
    changes.push({ dimension: "Framing", from: "original question", to: "revised question" });
  }

  return { original, revised, changes };
}
