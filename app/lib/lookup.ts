import type { EvidenceCandidate, Preset } from "./types";
import { searchClinicalTrials } from "./clinicalTrials";
import { searchPubMed } from "./pubmed";

const STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "for", "to", "and", "or", "with", "by",
  "compared", "versus", "vs", "than", "that", "this", "is", "are", "be", "as",
  "at", "from", "into", "across", "reduces", "improves", "increase", "increases",
  "decrease", "decreases", "test", "trial", "study", "patients", "participants",
  "more", "less", "their", "who", "which", "including", "specifically", "alone",
  "combined", "incidence", "outcomes", "severity", "scores", "percent", "daily",
]);

export interface LookupResult {
  queryTerms: string[];
  candidates: EvidenceCandidate[];
  status: "ok" | "unavailable" | "low_relevance";
  warnings: string[];
}

/** Derive 3-6 search terms from the hypothesis and/or preset metadata. */
export function buildQueryTerms(hypothesis: string, preset?: Preset): {
  ctTerm: string;
  pubmedTerm: string;
  display: string[];
} {
  if (preset) {
    const ctTerm =
      [preset.lookup.condition, preset.lookup.intervention]
        .filter(Boolean)
        .join(" ") || preset.lookup.terms[0];
    const pubmedTerm = preset.lookup.terms.slice(0, 2).join(" ");
    return { ctTerm, pubmedTerm, display: preset.lookup.terms.slice(0, 5) };
  }

  // Custom hypothesis: pull salient keywords.
  const words = hypothesis
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  // Dedupe, keep order, cap.
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      keywords.push(w);
    }
    if (keywords.length >= 6) break;
  }

  const ctTerm = keywords.slice(0, 4).join(" ") || hypothesis.slice(0, 60);
  const pubmedTerm = keywords.slice(0, 3).join(" ") || hypothesis.slice(0, 40);
  return { ctTerm, pubmedTerm, display: keywords.slice(0, 5) };
}

/**
 * Run the lightweight live evidence scan. Capped at 3 trials + 3 publications,
 * metadata only, timeout-safe. Never throws.
 */
export async function runLookup(
  hypothesis: string,
  preset: Preset | undefined,
  timeoutMs = 3500,
): Promise<LookupResult> {
  const { ctTerm, pubmedTerm, display } = buildQueryTerms(hypothesis, preset);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let trials: EvidenceCandidate[] = [];
  let pubs: EvidenceCandidate[] = [];
  const warnings: string[] = [];

  try {
    [trials, pubs] = await Promise.all([
      searchClinicalTrials(ctTerm, controller.signal, 3),
      searchPubMed(pubmedTerm, controller.signal, 3),
    ]);
  } catch {
    // Promise.all only rejects if an adapter throws; adapters swallow errors,
    // so this is defensive.
  } finally {
    clearTimeout(timer);
  }

  const candidates = [...trials, ...pubs];

  if (candidates.length === 0) {
    return {
      queryTerms: display,
      candidates,
      status: "unavailable",
      warnings: [
        "Live evidence scan returned no candidates (timeout, network, or no matches). Proceeding on curated evidence.",
      ],
    };
  }

  if (candidates.length < 2) {
    warnings.push("Only weak matches returned — treating as low-relevance background.");
    return { queryTerms: display, candidates, status: "low_relevance", warnings };
  }

  return { queryTerms: display, candidates, status: "ok", warnings };
}
