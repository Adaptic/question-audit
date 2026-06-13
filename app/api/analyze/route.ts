import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

import type { ProofData, StreamEvent } from "@/app/lib/types";
import { getPreset } from "@/app/lib/presets";
import { getEvidencePacket } from "@/app/lib/evidence";
import { runLookup } from "@/app/lib/lookup";
import {
  SYSTEM_PROMPT,
  buildRunPacket,
  buildCriticPrompt,
} from "@/app/lib/systemPrompt";
import { checkRubric, extractNamedStudies } from "@/app/lib/rubric";
import {
  extractAssumptions,
  extractQuantChecks,
  extractUncertainty,
  extractQuestionDiff,
  extractExecutive,
  classifyCandidates,
  extractCandidateVerdicts,
  parseCriticWarnings,
} from "@/app/lib/parse";
import type { EvidenceCandidate, ExecutiveSummary, QuestionDiffData } from "@/app/lib/types";
import { getFixture } from "@/app/lib/demoFixtures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A full live Opus run (high effort + critic pass) can take ~90s. 300s is the
// Vercel Pro/Fluid ceiling; Hobby caps at 60s (use TRIALMIND_DEMO_MODE=1 there).
export const maxDuration = 300;

const PRIMARY_MODEL = "claude-opus-4-8";
const FALLBACK_MODEL = "claude-opus-4-6";

type LookupStatus = "ok" | "low_relevance" | "unavailable" | "none";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface AnalyzeBody {
  hypothesis?: string;
  presetId?: string;
  lookupEnabled?: boolean;
  demoMode?: boolean;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const hypothesis = (body.hypothesis ?? "").trim();
  if (!hypothesis) {
    return new Response(JSON.stringify({ error: "hypothesis is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const presetId = body.presetId;
  const lookupEnabled = body.lookupEnabled ?? true;
  const forceDemo =
    body.demoMode === true || process.env.TRIALMIND_DEMO_MODE === "1";

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: StreamEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      try {
        await runAnalysis({ hypothesis, presetId, lookupEnabled, forceDemo, emit });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        emit({ type: "error", message, fallbackAvailable: false });
      } finally {
        emit({ type: "done" });
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

async function runAnalysis(args: {
  hypothesis: string;
  presetId?: string;
  lookupEnabled: boolean;
  forceDemo: boolean;
  emit: (e: StreamEvent) => void;
}) {
  const { hypothesis, presetId, lookupEnabled, forceDemo, emit } = args;
  const preset = getPreset(presetId);
  const packet = getEvidencePacket(preset?.evidencePacketId);

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const useDemo = forceDemo || !hasKey;

  emit({
    type: "meta",
    model: PRIMARY_MODEL,
    cached: useDemo,
    presetId,
    lookupEnabled,
  });

  // ---- Stage 1: Run Spec ----
  emit({ type: "stage", stage: "run_spec", status: "active" });
  emit({
    type: "run_spec",
    hypothesis,
    presetLabel: preset?.label,
    caveats: packet?.demoCaveats ?? [
      "No curated evidence packet for a custom hypothesis — the model must label inferences explicitly.",
    ],
  });
  await sleep(200);
  emit({ type: "stage", stage: "run_spec", status: "done" });

  // ---- Stage 2: Evidence (curated packet + optional live lookup) ----
  emit({ type: "stage", stage: "evidence", status: "active" });
  const { candidates, status } = await runEvidenceStage({
    hypothesis,
    preset,
    lookupEnabled,
    useDemo,
    emit,
  });
  emit({ type: "stage", stage: "evidence", status: "done" });

  if (useDemo) {
    await runCachedReasoning({ hypothesis, presetId, candidates, status, packet, emit });
    return;
  }

  // ---- Live path ----
  try {
    await runLiveReasoning({ hypothesis, preset, packet, candidates, status, emit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Live API error";
    const fixture = getFixture(presetId);
    emit({ type: "error", message, fallbackAvailable: Boolean(fixture) });
    if (fixture) {
      // Graceful, clearly-labeled fallback to the cached run.
      emit({ type: "meta", model: PRIMARY_MODEL, cached: true, presetId, lookupEnabled });
      await runCachedReasoning({ hypothesis, presetId, candidates, status, packet, emit });
    } else {
      // Mark the remaining stages skipped so the UI doesn't hang.
      emit({ type: "stage", stage: "reasoning", status: "skipped" });
      emit({ type: "stage", stage: "critique", status: "skipped" });
      emit({ type: "stage", stage: "verification", status: "skipped" });
    }
  }
}

async function runEvidenceStage(args: {
  hypothesis: string;
  preset: ReturnType<typeof getPreset>;
  lookupEnabled: boolean;
  useDemo: boolean;
  emit: (e: StreamEvent) => void;
}): Promise<{ candidates: EvidenceCandidate[]; status: LookupStatus }> {
  const { hypothesis, preset, lookupEnabled, useDemo, emit } = args;

  if (!lookupEnabled) {
    return { candidates: [], status: "none" };
  }

  // In demo mode, stream the cached candidates so the rail still populates live-feel.
  if (useDemo) {
    const fixture = getFixture(preset?.id);
    if (fixture) {
      emit({ type: "lookup_start", queryTerms: fixture.queryTerms });
      for (const c of fixture.candidates) {
        await sleep(160);
        emit({ type: "lookup_candidate", candidate: c });
      }
      const trials = fixture.candidates.filter((c) => c.source === "clinicaltrials.gov").length;
      const publications = fixture.candidates.filter((c) => c.source === "pubmed").length;
      emit({
        type: "lookup_done",
        counts: { trials, publications },
        warnings: ["Cached candidate evidence."],
      });
      return { candidates: fixture.candidates, status: "ok" };
    }
    emit({ type: "lookup_unavailable", reason: "No cached candidates for this hypothesis." });
    return { candidates: [], status: "unavailable" };
  }

  // Live lookup.
  const { ctTerms, run } = startLiveLookup(hypothesis, preset);
  emit({ type: "lookup_start", queryTerms: ctTerms });
  const result = await run;

  for (const c of result.candidates) {
    await sleep(120);
    emit({ type: "lookup_candidate", candidate: c });
  }

  // For a preset, curated evidence is primary — a weak live scan is fine.
  const curatedNote = preset
    ? "Low relevance live scan; curated evidence carries this audit."
    : undefined;

  if (result.status === "unavailable") {
    emit({
      type: "lookup_unavailable",
      reason: curatedNote ?? result.warnings[0] ?? "Lookup unavailable.",
    });
  } else if (result.status === "low_relevance") {
    emit({
      type: "lookup_low_relevance",
      reason: curatedNote ?? result.warnings[0] ?? "Low-relevance candidates.",
    });
  } else {
    const trials = result.candidates.filter((c) => c.source === "clinicaltrials.gov").length;
    const publications = result.candidates.filter((c) => c.source === "pubmed").length;
    emit({ type: "lookup_done", counts: { trials, publications }, warnings: result.warnings });
  }

  return { candidates: result.candidates, status: result.status };
}

function startLiveLookup(hypothesis: string, preset: ReturnType<typeof getPreset>) {
  // Surface the display terms immediately, kick off the network calls in parallel.
  const run = runLookup(hypothesis, preset);
  // We need the display terms before run resolves; recompute synchronously.
  const ctTerms = preset
    ? preset.lookup.terms.slice(0, 5)
    : hypothesis
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 5);
  return { ctTerms, run };
}

async function runLiveReasoning(args: {
  hypothesis: string;
  preset: ReturnType<typeof getPreset>;
  packet: ReturnType<typeof getEvidencePacket>;
  candidates: EvidenceCandidate[];
  status: LookupStatus;
  emit: (e: StreamEvent) => void;
}) {
  const { hypothesis, preset, packet, candidates, status, emit } = args;
  const client = new Anthropic();

  const userPacket = buildRunPacket({
    hypothesis,
    preset,
    packet,
    candidates,
    lookupNote: candidates.length === 0 ? "No live candidates this run." : undefined,
  });

  // ---- Stage 3: Opus reasoning (streamed) ----
  emit({ type: "stage", stage: "reasoning", status: "active" });

  let analysis = "";
  const streamOnce = async (model: string) => {
    analysis = "";
    const s = client.messages.stream({
      model,
      max_tokens: 16000,
      // Adaptive thinking with summarized display — the correct way to get
      // visible extended reasoning on Opus 4.8 (budget_tokens 400s on this model).
      thinking: { type: "adaptive", display: "summarized" },
      output_config: { effort: "high" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPacket }],
      // Cast via unknown: SDK 0.71 types predate adaptive thinking + output_config,
      // but the API supports them and the SDK serializes the body as-is.
    } as unknown as Anthropic.MessageStreamParams);

    for await (const event of s) {
      if (event.type === "content_block_delta") {
        if (event.delta.type === "thinking_delta") {
          emit({ type: "thinking", text: event.delta.thinking });
        } else if (event.delta.type === "text_delta") {
          analysis += event.delta.text;
          emit({ type: "text", text: event.delta.text });
        }
        // signature_delta: retained by the SDK; not rendered as reasoning.
      }
    }
    await s.finalMessage();
  };

  try {
    await streamOnce(PRIMARY_MODEL);
  } catch (err) {
    if (err instanceof Anthropic.NotFoundError) {
      console.warn(`[clinical.dev] ${PRIMARY_MODEL} not found; falling back to ${FALLBACK_MODEL}`);
      await streamOnce(FALLBACK_MODEL);
    } else {
      throw err;
    }
  }

  emit({ type: "stage", stage: "reasoning", status: "done" });

  // ---- Stage 4: Critic / auditor pass ----
  emit({ type: "stage", stage: "critique", status: "active" });
  let critic = "";
  try {
    const criticRes = await client.messages.create({
      model: PRIMARY_MODEL,
      max_tokens: 1200,
      system:
        "You are a terse, adversarial trial-design auditor. Output only bullet points. No preamble, no final-answer reasoning.",
      messages: [{ role: "user", content: buildCriticPrompt(analysis) }],
    } as Anthropic.MessageCreateParamsNonStreaming);
    critic = criticRes.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (critic) emit({ type: "critic", text: critic });
  } catch {
    // Critic is a should-have; don't fail the run if it errors.
    critic = "";
  }
  emit({ type: "stage", stage: "critique", status: "done" });

  // ---- Stage 5: Deterministic verification + payoff panels ----
  emitVerification({ analysis, critic, hypothesis, packet, candidates, status, emit });
}

async function runCachedReasoning(args: {
  hypothesis: string;
  presetId?: string;
  candidates: EvidenceCandidate[];
  status: LookupStatus;
  packet: ReturnType<typeof getEvidencePacket>;
  emit: (e: StreamEvent) => void;
}) {
  const { hypothesis, presetId, candidates, status, packet, emit } = args;
  const fixture = getFixture(presetId) ?? getFixture("galleri");
  if (!fixture) {
    emit({
      type: "error",
      message:
        "No cached demo run is available for a custom hypothesis without a live API key. Add ANTHROPIC_API_KEY or select a preset.",
      fallbackAvailable: false,
    });
    emit({ type: "stage", stage: "reasoning", status: "skipped" });
    emit({ type: "stage", stage: "critique", status: "skipped" });
    emit({ type: "stage", stage: "verification", status: "skipped" });
    return;
  }

  // ---- Stage 3: stream cached thinking + analysis ----
  emit({ type: "stage", stage: "reasoning", status: "active" });
  await streamChunks(fixture.thinking, (t) => emit({ type: "thinking", text: t }), 9);
  await sleep(120);
  await streamChunks(fixture.analysis, (t) => emit({ type: "text", text: t }), 6);
  emit({ type: "stage", stage: "reasoning", status: "done" });

  // ---- Stage 4: cached critic ----
  emit({ type: "stage", stage: "critique", status: "active" });
  await sleep(150);
  emit({ type: "critic", text: fixture.critic });
  emit({ type: "stage", stage: "critique", status: "done" });

  // ---- Stage 5: verification + payoff ----
  emitVerification({
    analysis: fixture.analysis,
    critic: fixture.critic,
    hypothesis,
    packet,
    candidates,
    status,
    emit,
  });
}

function emitVerification(args: {
  analysis: string;
  critic: string;
  hypothesis: string;
  packet: ReturnType<typeof getEvidencePacket>;
  candidates: EvidenceCandidate[];
  status: LookupStatus;
  emit: (e: StreamEvent) => void;
}) {
  const { analysis, critic, hypothesis, packet, candidates, status, emit } = args;

  emit({ type: "stage", stage: "verification", status: "active" });

  const diff = extractQuestionDiff(analysis, hypothesis);
  if (diff) emit({ type: "diff", diff });

  // Executive layer — parse the machine-readable block, else synthesize from the diff.
  const executive = extractExecutive(analysis) ?? synthesizeExecutive(analysis, diff, hypothesis);
  if (executive) emit({ type: "executive", summary: executive });

  const verdicts = extractCandidateVerdicts(analysis);
  const classified = classifyCandidates(candidates, analysis, status, verdicts);
  const weakLive =
    (status === "low_relevance" || status === "unavailable") && Boolean(packet);

  const proof: ProofData = {
    curatedSources: packet?.sources ?? [],
    candidates: classified,
    namedStudies: extractNamedStudies(analysis),
    quantChecks: extractQuantChecks(analysis),
    assumptions: extractAssumptions(analysis),
    unsupportedWarnings: parseCriticWarnings(critic),
    openUncertainty: extractUncertainty(analysis),
    lookupNote: weakLive
      ? "Low relevance live scan; curated evidence carries this audit."
      : undefined,
  };
  emit({ type: "proof", proof });

  const result = checkRubric(analysis);
  emit({ type: "verification", result });

  emit({ type: "stage", stage: "verification", status: "done" });
}

/** Fallback executive summary if the model omitted the machine-readable block. */
function synthesizeExecutive(
  analysis: string,
  diff: QuestionDiffData | null,
  hypothesis: string,
): ExecutiveSummary | null {
  if (!diff) return null;
  // First failure-mode sentence as the "why it fails" line.
  const critiqueMatch = analysis.match(
    /##+\s*\d*\.?\s*Adversarial Critique([\s\S]*?)(?:\n##+\s|$)/i,
  );
  let why = "The endpoint or population choice dilutes the real effect below what the trial can detect.";
  if (critiqueMatch) {
    const firstItem = critiqueMatch[1]
      .split("\n")
      .map((l) => l.replace(/^\s*(?:\d+[.)]|[-*])\s*/, "").replace(/\*\*/g, "").trim())
      .find((l) => l.length > 30);
    if (firstItem) why = firstItem.split(/(?<=[.!?])\s/)[0];
  }
  return {
    wrongQuestion: diff.original || hypothesis,
    whyItFails: why,
    betterQuestion: diff.revised,
    whatChanges: diff.changes.map((c) => `${c.dimension}: ${c.from} → ${c.to}`).join("; "),
    evidenceConfidence: {
      level: "Moderate",
      reason: "grounded in the attached evidence; specific figures are estimates.",
    },
  };
}

/** Stream a long string in small word-grouped chunks with a delay, for cached mode. */
async function streamChunks(
  text: string,
  emit: (chunk: string) => void,
  wordsPerChunk: number,
) {
  const tokens = text.split(/(\s+)/); // keep whitespace
  let buffer = "";
  let wordCount = 0;
  for (const tok of tokens) {
    buffer += tok;
    if (/\S/.test(tok)) wordCount++;
    if (wordCount >= wordsPerChunk) {
      emit(buffer);
      buffer = "";
      wordCount = 0;
      await sleep(14);
    }
  }
  if (buffer) emit(buffer);
}
