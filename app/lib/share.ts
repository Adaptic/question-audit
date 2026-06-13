import type {
  ExecutiveSummary,
  QuestionDiffData,
  ProofData,
  RubricResult,
} from "./types";
import {
  ppvModel,
  dilutionModel,
  DEFAULT_SENS,
  DEFAULT_SPEC,
  DEFAULT_DILUTION,
  POPULATION_PRESETS,
  type PopulationKey,
} from "./simulate";

export interface ReviewComment {
  id: string;
  role: string;
  text: string;
  resolved: boolean;
}

export interface SimSettings {
  mode: "ppv" | "dilution";
  population: PopulationKey;
}

export interface AuditArtifact {
  hypothesis: string;
  executive: ExecutiveSummary | null;
  diff: QuestionDiffData | null;
  proof: ProofData | null;
  rubric: RubricResult | null;
  comments: ReviewComment[];
  sim: SimSettings;
}

// ---- Compact share state (URL hash) ----

interface ShareState {
  v: 1;
  h: string;
  e: [string, string, string, string, string, string] | null; // wq, wf, bq, wc, level, reason
  d: { o: string; r: string; c: [string, string, string][] } | null;
  s: [SimSettings["mode"], PopulationKey];
  p: { u: string[]; a: string[]; w: string[]; n: string[] } | null;
  r: [number, number, string] | null; // passed, total, band
  c: [string, string, 0 | 1][]; // role, text, resolved
}

const truncate = (s: string, n = 240) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function encodeShare(a: AuditArtifact): string {
  const state: ShareState = {
    v: 1,
    h: truncate(a.hypothesis, 300),
    e: a.executive
      ? [
          truncate(a.executive.wrongQuestion),
          truncate(a.executive.whyItFails),
          truncate(a.executive.betterQuestion),
          truncate(a.executive.whatChanges),
          a.executive.evidenceConfidence.level,
          truncate(a.executive.evidenceConfidence.reason, 160),
        ]
      : null,
    d: a.diff
      ? {
          o: truncate(a.diff.original),
          r: truncate(a.diff.revised),
          c: a.diff.changes.slice(0, 4).map((c) => [c.dimension, c.from, c.to]),
        }
      : null,
    s: [a.sim.mode, a.sim.population],
    p: a.proof
      ? {
          u: [
            ...a.proof.curatedSources.map((s) => s.name),
            ...a.proof.candidates.filter((c) => c.relevance === "use").map((c) => c.id),
          ].slice(0, 8),
          a: a.proof.assumptions.slice(0, 4).map((s) => truncate(s, 160)),
          w: a.proof.unsupportedWarnings.slice(0, 4).map((s) => truncate(s, 160)),
          n: a.proof.openUncertainty.slice(0, 4).map((s) => truncate(s, 160)),
        }
      : null,
    r: a.rubric ? [a.rubric.passedCount, a.rubric.total, a.rubric.band] : null,
    c: a.comments.slice(0, 12).map((c) => [c.role, truncate(c.text, 200), c.resolved ? 1 : 0]),
  };
  return b64encode(state);
}

export interface DecodedShare {
  hypothesis: string;
  executive: ExecutiveSummary | null;
  diff: QuestionDiffData | null;
  sim: SimSettings;
  proof: Partial<ProofData> | null;
  rubricBand?: { passedCount: number; total: number; band: string };
  comments: ReviewComment[];
}

export function decodeShare(encoded: string): DecodedShare | null {
  try {
    const s = b64decode(encoded) as ShareState;
    if (!s || s.v !== 1) return null;
    return {
      hypothesis: s.h ?? "",
      executive: s.e
        ? {
            wrongQuestion: s.e[0],
            whyItFails: s.e[1],
            betterQuestion: s.e[2],
            whatChanges: s.e[3],
            evidenceConfidence: {
              level: s.e[4] as ExecutiveSummary["evidenceConfidence"]["level"],
              reason: s.e[5],
            },
          }
        : null,
      diff: s.d
        ? {
            original: s.d.o,
            revised: s.d.r,
            changes: s.d.c.map(([dimension, from, to]) => ({ dimension, from, to })),
          }
        : null,
      sim: { mode: s.s?.[0] ?? "ppv", population: s.s?.[1] ?? "general" },
      proof: s.p
        ? {
            namedStudies: s.p.u,
            assumptions: s.p.a,
            unsupportedWarnings: s.p.w,
            openUncertainty: s.p.n,
          }
        : null,
      rubricBand: s.r ? { passedCount: s.r[0], total: s.r[1], band: s.r[2] } : undefined,
      comments: (s.c ?? []).map(([role, text, resolved], i) => ({
        id: `s${i}`,
        role,
        text,
        resolved: resolved === 1,
      })),
    };
  } catch {
    return null;
  }
}

function b64encode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(s: string): unknown {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

// ---- Markdown export ("Export Audit Brief") ----

export function buildExportMarkdown(a: AuditArtifact): string {
  const L: string[] = [];
  const e = a.executive;
  const d = a.diff;

  L.push(`# clinical.dev — Question Audit Brief`);
  L.push("");
  L.push(`_Evidence-backed audit of a clinical trial research question, generated before protocol lock._`);
  L.push("");

  if (e) {
    L.push(`## Executive summary`);
    L.push(`- **Wrong question:** ${e.wrongQuestion}`);
    L.push(`- **Why it fails:** ${e.whyItFails}`);
    L.push(`- **Better question:** ${e.betterQuestion}`);
    L.push(`- **What changes:** ${e.whatChanges}`);
    L.push(`- **Evidence confidence:** ${e.evidenceConfidence.level} — ${e.evidenceConfidence.reason}`);
    L.push("");
  }

  L.push(`## Original vs revised question`);
  L.push(`**Original:** ${d?.original ?? a.hypothesis}`);
  L.push("");
  L.push(`**Revised:** ${d?.revised ?? "(not produced)"}`);
  if (d?.changes.length) {
    L.push("");
    for (const c of d.changes) L.push(`- ${c.dimension}: ${c.from} → ${c.to}`);
  }
  L.push("");

  // Failure mechanism + the two quantified explanations.
  L.push(`## Failure mechanism`);
  if (e?.whyItFails) L.push(e.whyItFails);
  L.push("");

  const general = ppvModel({
    prevalencePct: POPULATION_PRESETS.general.prevalencePct,
    sensitivity: DEFAULT_SENS,
    specificity: DEFAULT_SPEC,
  });
  const enriched = ppvModel({
    prevalencePct: POPULATION_PRESETS.enriched.prevalencePct,
    sensitivity: DEFAULT_SENS,
    specificity: DEFAULT_SPEC,
  });
  L.push(`### PPV / prevalence`);
  L.push(
    `At ~${general.prevalencePct}% prevalence (general screening population), a test at ${Math.round(
      DEFAULT_SENS * 100,
    )}% sensitivity / ${(DEFAULT_SPEC * 100).toFixed(1)}% specificity yields a positive predictive value of only **${general.ppvPct.toFixed(
      1,
    )}%** — about ${general.truePositives} true positives against ${general.falsePositives} false positives per 100,000 tested. Enriching to ~${enriched.prevalencePct}% prevalence raises PPV to **${enriched.ppvPct.toFixed(
      1,
    )}%**. Low prevalence, not test quality, is what sinks the positive predictive value.`,
  );
  L.push("");

  const dil = dilutionModel(DEFAULT_DILUTION);
  L.push(`### Endpoint dilution`);
  L.push(
    `A composite across ${DEFAULT_DILUTION.totalCancers} cancers where only ${DEFAULT_DILUTION.responsiveCancers} show a real ~${Math.round(
      DEFAULT_DILUTION.perCancerEffect * 100,
    )}% late-stage reduction averages to a pooled effect of just **${(dil.pooledEffect * 100).toFixed(
      1,
    )}%** — ${dil.pooledDetected ? "above" : "below"} the ~${(dil.threshold * 100).toFixed(
      0,
    )}% the trial can detect. Targeting only the responsive cancers preserves the **${(dil.targetedEffect * 100).toFixed(
      0,
    )}%** effect (${dil.targetedDetected ? "detectable" : "still not detectable"}). The composite drowns a real signal.`,
  );
  L.push("");

  if (a.proof) {
    const used = [
      ...a.proof.curatedSources.map((s) => `${s.name} (curated ${s.type})`),
      ...a.proof.candidates
        .filter((c) => c.relevance === "use")
        .map((c) => `${c.id} — ${c.title} (${c.source}, used)`),
    ];
    const background = a.proof.candidates
      .filter((c) => c.relevance === "background")
      .map((c) => `${c.id} (${c.source})`);
    const ignored = a.proof.candidates
      .filter((c) => c.relevance === "ignore")
      .map((c) => `${c.id} (${c.source})`);
    L.push(`## Evidence used`);
    if (a.proof.lookupNote) L.push(`_${a.proof.lookupNote}_`, "");
    for (const u of used) L.push(`- ${u}`);
    L.push("");
    L.push(`### Evidence status`);
    L.push(`- Used: ${used.length} source(s) above.`);
    L.push(
      `- Background only (not relied on): ${background.length ? background.join("; ") : "none"}`,
    );
    L.push(
      `- Ignored (off-topic / low relevance, not counted): ${ignored.length ? ignored.join("; ") : "none"}`,
    );
    L.push("");

    if (a.proof.assumptions.length) {
      L.push(`## Assumptions surfaced`);
      for (const s of a.proof.assumptions) L.push(`- ${s}`);
      L.push("");
    }
    if (a.proof.unsupportedWarnings.length) {
      L.push(`## Auditor warnings`);
      for (const s of a.proof.unsupportedWarnings) L.push(`- ${s}`);
      L.push("");
    }
    if (a.proof.openUncertainty.length) {
      L.push(`## Open uncertainty — needs expert review`);
      for (const s of a.proof.openUncertainty) L.push(`- ${s}`);
      L.push("");
    }
  }

  if (a.rubric) {
    L.push(`## Rubric result`);
    L.push(`Deterministic check: **${a.rubric.passedCount}/${a.rubric.total} — ${a.rubric.band}**` + (a.rubric.modelSelfScore ? ` · model self-grade: ${a.rubric.modelSelfScore}` : ""));
    L.push("");
    for (const c of a.rubric.criteria) {
      L.push(`- [${c.passed ? "x" : " "}] ${c.label}`);
    }
    L.push("");
  }

  if (a.comments.length) {
    L.push(`## Team review`);
    for (const c of a.comments) {
      L.push(`- **${c.role}**${c.resolved ? " (resolved)" : ""}: ${c.text}`);
    }
    L.push("");
  }

  L.push(`---`);
  L.push(`_Generated by clinical.dev Question Audit. Evidence packets, a live candidate scan, an adversarial critic pass, and a deterministic rubric check ground each run. Not a clinical recommendation._`);

  return L.join("\n");
}
