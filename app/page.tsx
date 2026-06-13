"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Microscope,
  Play,
  Loader2,
  Radio,
  Archive,
  AlertCircle,
  ScrollText,
  Pencil,
  Download,
  Link2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { PRESETS } from "@/app/lib/presets";
import type {
  EvidenceCandidate,
  ExecutiveSummary,
  ProofData,
  QuestionDiffData,
  RubricResult,
  StageId,
  StageStatus,
  StreamEvent,
} from "@/app/lib/types";
import type { ReviewComment, SimSettings, AuditArtifact } from "@/app/lib/share";
import { encodeShare, decodeShare, buildExportMarkdown } from "@/app/lib/share";

import { PresetButtons } from "@/components/PresetButtons";
import { StageRail } from "@/components/StageRail";
import { EvidenceLookupRail, type LookupState } from "@/components/EvidenceLookupRail";
import { ThinkingStream } from "@/components/ThinkingStream";
import { TrialOutput } from "@/components/TrialOutput";
import { QuestionDiff } from "@/components/QuestionDiff";
import { ProofPanel } from "@/components/ProofPanel";
import { RubricCheck } from "@/components/RubricCheck";
import { ExecutiveTransformation } from "@/components/ExecutiveTransformation";
import { WhyItFails } from "@/components/WhyItFails";
import { TeamReview } from "@/components/TeamReview";

const SECTIONS = [
  { id: "sec-audit", label: "1 · Audit" },
  { id: "sec-evidence", label: "2 · Evidence" },
  { id: "sec-population", label: "3 · Population" },
  { id: "sec-design", label: "4 · Design" },
  { id: "sec-critique", label: "5 · Critique" },
  { id: "sec-revision", label: "6 · Revision" },
];

export default function Page() {
  const [hypothesis, setHypothesis] = useState("");
  const [activePreset, setActivePreset] = useState<string | undefined>();
  const [lookupEnabled, setLookupEnabled] = useState(true);

  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [cached, setCached] = useState(false);
  const [sharedView, setSharedView] = useState(false);
  const [hypoCollapsed, setHypoCollapsed] = useState(false);

  const [stages, setStages] = useState<Partial<Record<StageId, StageStatus>>>({});
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [queryTerms, setQueryTerms] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<EvidenceCandidate[]>([]);
  const [presetLabel, setPresetLabel] = useState<string | undefined>();

  const [thinking, setThinking] = useState("");
  const [output, setOutput] = useState("");
  const [critic, setCritic] = useState("");

  const [executive, setExecutive] = useState<ExecutiveSummary | null>(null);
  const [diff, setDiff] = useState<QuestionDiffData | null>(null);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [rubric, setRubric] = useState<RubricResult | null>(null);
  const [rubricBand, setRubricBand] = useState<{ passedCount: number; total: number; band: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [simSettings, setSimSettings] = useState<SimSettings>({ mode: "ppv", population: "general" });

  const [copied, setCopied] = useState(false);
  const [outputOpen, setOutputOpen] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const execRef = useRef<HTMLDivElement>(null);

  // Recreate an audit summary from a share link on mount.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#a=")) return;
    const dec = decodeShare(hash.slice(3));
    if (!dec) return;
    setSharedView(true);
    setStarted(true);
    setHypoCollapsed(true);
    setHypothesis(dec.hypothesis);
    setExecutive(dec.executive);
    setDiff(dec.diff);
    setSimSettings(dec.sim);
    setComments(dec.comments);
    setRubricBand(dec.rubricBand ?? null);
    if (dec.proof) {
      setProof({
        curatedSources: [],
        candidates: [],
        namedStudies: dec.proof.namedStudies ?? [],
        quantChecks: dec.proof.quantChecks ?? [],
        assumptions: dec.proof.assumptions ?? [],
        unsupportedWarnings: dec.proof.unsupportedWarnings ?? [],
        openUncertainty: dec.proof.openUncertainty ?? [],
      });
    }
  }, []);

  const selectPreset = (id: string, text: string) => {
    setActivePreset(id);
    setHypothesis(text);
    setHypoCollapsed(false);
  };

  const handleEvent = useCallback((e: StreamEvent) => {
    switch (e.type) {
      case "meta":
        setCached(e.cached);
        break;
      case "stage":
        setStages((s) => ({ ...s, [e.stage]: e.status }));
        break;
      case "run_spec":
        setPresetLabel(e.presetLabel);
        break;
      case "lookup_start":
        setLookupState("scanning");
        setQueryTerms(e.queryTerms);
        break;
      case "lookup_candidate":
        setCandidates((c) => [...c, e.candidate]);
        break;
      case "lookup_done":
        setLookupState("done");
        break;
      case "lookup_unavailable":
        setLookupState("unavailable");
        break;
      case "lookup_low_relevance":
        setLookupState("low_relevance");
        break;
      case "thinking":
        setThinking((t) => t + e.text);
        break;
      case "text":
        setOutput((o) => o + e.text);
        break;
      case "critic":
        setCritic(e.text);
        break;
      case "executive":
        setExecutive(e.summary);
        break;
      case "diff":
        setDiff(e.diff);
        break;
      case "proof":
        setProof(e.proof);
        break;
      case "verification":
        setRubric(e.result);
        break;
      case "error":
        setErrorMsg(e.message);
        break;
      case "done":
        setRunning(false);
        requestAnimationFrame(() =>
          execRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
        break;
    }
  }, []);

  const runAudit = useCallback(async () => {
    if (!hypothesis.trim() || running) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSharedView(false);
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    setRunning(true);
    setStarted(true);
    setHypoCollapsed(true);
    setStages({});
    setLookupState(lookupEnabled ? "scanning" : "idle");
    setQueryTerms([]);
    setCandidates([]);
    setThinking("");
    setOutput("");
    setCritic("");
    setExecutive(null);
    setDiff(null);
    setProof(null);
    setRubric(null);
    setRubricBand(null);
    setErrorMsg(null);
    setOutputOpen(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hypothesis: hypothesis.trim(),
          presetId: activePreset,
          lookupEnabled,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            handleEvent(JSON.parse(line) as StreamEvent);
          } catch {
            /* ignore malformed line */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrorMsg((err as Error).message || "Stream error");
      }
    } finally {
      setRunning(false);
    }
  }, [hypothesis, running, activePreset, lookupEnabled, handleEvent]);

  const buildArtifact = useCallback((): AuditArtifact => {
    // In shared mode only the band survives; synthesize a minimal rubric so the
    // export always carries a rubric result.
    const exportRubric: RubricResult | null =
      rubric ??
      (rubricBand
        ? {
            criteria: [],
            passedCount: rubricBand.passedCount,
            total: rubricBand.total,
            band: rubricBand.band as RubricResult["band"],
          }
        : null);
    return {
      hypothesis,
      executive,
      diff,
      proof,
      rubric: exportRubric,
      comments,
      sim: simSettings,
    };
  }, [hypothesis, executive, diff, proof, rubric, rubricBand, comments, simSettings]);

  const exportBrief = useCallback(() => {
    const md = buildExportMarkdown(buildArtifact());
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinical-dev-question-audit.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [buildArtifact]);

  const copyShareLink = useCallback(async () => {
    const enc = encodeShare(buildArtifact());
    const url = `${window.location.origin}${window.location.pathname}#a=${enc}`;
    window.history.replaceState(null, "", `#a=${enc}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — at least the URL bar now carries the share state.
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [buildArtifact]);

  const newAudit = () => {
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    setSharedView(false);
    setStarted(false);
    setHypoCollapsed(false);
    setExecutive(null);
    setDiff(null);
    setProof(null);
    setRubric(null);
    setRubricBand(null);
    setOutput("");
    setThinking("");
    setComments([]);
    setStages({});
    setLookupState("idle");
    setCandidates([]);
  };

  const reasoningActive = stages.reasoning === "active";
  const completed = sharedView || (!running && (executive !== null || output.length > 0));
  const hasPayoff = diff || proof || rubric || rubricBand || executive;

  return (
    <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-4 sm:px-6">
      {/* Header */}
      <header className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-surface-line bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-card bg-graphite">
          <Microscope className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="flex items-baseline gap-2 leading-tight">
            <span className="text-[18px] font-bold text-graphite">clinical.dev</span>
            <span className="text-[15px] font-semibold text-teal-ink">Question Audit</span>
          </h1>
          <p className="text-[13px] leading-tight text-graphite-muted">
            Find the flaw before protocol lock.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {completed && (
            <>
              <button
                type="button"
                onClick={exportBrief}
                className="flex items-center gap-1.5 rounded-card border border-surface-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-graphite-muted transition hover:border-teal/50 hover:text-teal-ink"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.3} /> Export Audit Brief
              </button>
              <button
                type="button"
                onClick={copyShareLink}
                className="flex items-center gap-1.5 rounded-card border border-surface-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-graphite-muted transition hover:border-teal/50 hover:text-teal-ink"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal" strokeWidth={2.6} /> Copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" strokeWidth={2.3} /> Copy Share Link
                  </>
                )}
              </button>
            </>
          )}
          <StatusChip cached={cached} running={running} started={started} sharedView={sharedView} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left — Research Question Console */}
        <section className="flex flex-col gap-3 xl:col-span-3">
          <div className="rounded-card border border-surface-line bg-white p-3">
            <label className="mb-1.5 block text-[14px] font-bold text-graphite">
              Research question
            </label>

            {hypoCollapsed && hypothesis ? (
              <div className="rounded border border-surface-line bg-surface-sunken/50 p-2.5">
                <p className="line-clamp-3 text-[13px] leading-snug text-graphite-muted">
                  {hypothesis}
                </p>
                {!sharedView && (
                  <button
                    type="button"
                    onClick={() => setHypoCollapsed(false)}
                    disabled={running}
                    className="mt-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-teal-ink hover:underline disabled:opacity-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit question
                  </button>
                )}
              </div>
            ) : (
              <textarea
                value={hypothesis}
                onChange={(e) => {
                  setHypothesis(e.target.value);
                  setActivePreset(undefined);
                }}
                placeholder="Enter your research hypothesis…  e.g. 'Drug X reduces endpoint Y in population Z versus placebo over N weeks.'"
                rows={6}
                disabled={running}
                className="w-full resize-y rounded border border-surface-line bg-surface-sunken/50 p-2.5 text-[14px] leading-relaxed text-graphite outline-none transition focus:border-teal focus:bg-white disabled:opacity-60"
              />
            )}

            <button
              type="button"
              onClick={runAudit}
              disabled={running || !hypothesis.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-card bg-graphite px-3 py-2.5 text-[14px] font-semibold text-white transition hover:bg-graphite/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Auditing…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" strokeWidth={2.4} /> Audit Trial Question
                </>
              )}
            </button>

            <label className="mt-2.5 flex cursor-pointer items-center justify-between rounded border border-surface-line bg-surface-sunken/40 px-2.5 py-2">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-graphite-muted">
                <Radio className="h-3.5 w-3.5 text-teal" strokeWidth={2.3} />
                Live evidence scan
              </span>
              <input
                type="checkbox"
                checked={lookupEnabled}
                disabled={running}
                onChange={(e) => setLookupEnabled(e.target.checked)}
                className="h-4 w-4 accent-teal"
              />
            </label>
          </div>

          <div className="rounded-card border border-surface-line bg-white p-3">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-graphite-faint">
              Presets
            </div>
            <PresetButtons
              presets={PRESETS}
              activeId={activePreset}
              disabled={running}
              onSelect={(p) => selectPreset(p.id, p.hypothesis)}
            />
          </div>
        </section>

        {/* Center — Run Workspace */}
        <section className="flex flex-col gap-3 xl:col-span-5">
          {sharedView && (
            <div className="flex flex-wrap items-center gap-2 rounded-card border border-teal/30 bg-teal-soft/50 px-3 py-2.5">
              <Link2 className="h-4 w-4 text-teal-ink" strokeWidth={2.3} />
              <span className="text-[13px] font-medium text-teal-ink">
                Shared audit summary. The full reasoning trace lives in the live tool.
              </span>
              <button
                type="button"
                onClick={newAudit}
                className="ml-auto flex items-center gap-1 rounded-card bg-graphite px-2.5 py-1 text-[12.5px] font-semibold text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Run a fresh audit
              </button>
            </div>
          )}

          {!sharedView && (
            <div className="rounded-card border border-surface-line bg-white px-3 py-2.5">
              <StageRail statuses={stages} />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-card border border-amber/40 bg-amber-soft px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-ink" strokeWidth={2.3} />
              <div className="text-[13px] text-amber-ink">
                <span className="font-semibold">Live path notice:</span> {errorMsg}
                {cached && " — continuing on the clearly-labeled cached run."}
              </div>
            </div>
          )}

          {/* Executive layer — the main demo moment */}
          {executive && <ExecutiveTransformation ref={execRef} summary={executive} />}

          {/* Interactive explanation */}
          {(executive || completed) && (
            <WhyItFails value={simSettings} onChange={setSimSettings} />
          )}

          {!sharedView && lookupEnabled && (
            <EvidenceLookupRail candidates={candidates} state={lookupState} queryTerms={queryTerms} />
          )}

          {!sharedView && <ThinkingStream text={thinking} active={reasoningActive} />}

          {/* Output (supporting detail) */}
          {!started ? (
            <IdleExplainer />
          ) : sharedView ? null : (
            <div className="rounded-card border border-surface-line bg-white">
              <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-line px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setOutputOpen((o) => !o)}
                  className="flex items-center gap-1.5"
                >
                  {outputOpen ? (
                    <ChevronDown className="h-4 w-4 text-graphite-faint" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-graphite-faint" />
                  )}
                  <ScrollText className="h-4 w-4 text-graphite-muted" strokeWidth={2.3} />
                  <span className="text-[13px] font-bold text-graphite">
                    Full audit detail
                  </span>
                  <span className="text-[11px] text-graphite-faint">supporting</span>
                </button>
                {presetLabel && (
                  <span className="text-[11px] text-graphite-faint">· {presetLabel}</span>
                )}
                {outputOpen && output && (
                  <div className="ml-auto flex flex-wrap gap-1">
                    {SECTIONS.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10.5px] font-medium text-graphite-muted hover:bg-teal-soft hover:text-teal-ink"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {outputOpen && (
                <div className="px-4 py-2">
                  {output ? (
                    <TrialOutput markdown={output} />
                  ) : (
                    <p className="py-6 text-center text-[13px] text-graphite-faint">
                      {reasoningActive ? "Reasoning through the question…" : "Preparing run…"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right — Product Payoff (sticky cockpit panel) */}
        <aside className="flex flex-col gap-3 xl:col-span-4 xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto tm-scroll">
          {diff && <QuestionDiff diff={diff} />}
          {proof && <ProofPanel proof={proof} />}
          {rubric ? (
            <RubricCheck result={rubric} />
          ) : rubricBand ? (
            <CompactRubric band={rubricBand} />
          ) : null}
          {(completed || started) && (
            <TeamReview comments={comments} onChange={setComments} readOnly={sharedView} />
          )}
          {!hasPayoff && <PayoffPlaceholder started={started} />}
        </aside>
      </div>

      <footer className="mt-6 border-t border-surface-line pt-3 text-center text-[12px] text-graphite-faint">
        clinical.dev · Question Audit — an evidence-backed question audit grounded in curated
        evidence, a live candidate scan, an adversarial critic pass, and a deterministic rubric
        check. Not a clinical recommendation.
      </footer>
    </div>
  );
}

function StatusChip({
  cached,
  running,
  started,
  sharedView,
}: {
  cached: boolean;
  running: boolean;
  started: boolean;
  sharedView: boolean;
}) {
  if (sharedView) {
    return (
      <span className="flex items-center gap-1.5 rounded-card border border-surface-line bg-surface-sunken px-2.5 py-1.5 text-[12.5px] font-semibold text-graphite-muted">
        <Link2 className="h-3.5 w-3.5" strokeWidth={2.4} />
        Shared summary
      </span>
    );
  }
  if (!started) {
    return (
      <span className="flex items-center gap-1.5 rounded-card border border-surface-line bg-surface-sunken px-2.5 py-1.5 text-[12.5px] font-semibold text-graphite-muted">
        <span className="h-2 w-2 rounded-full bg-teal" />
        Ready
      </span>
    );
  }
  if (cached) {
    return (
      <span className="flex items-center gap-1.5 rounded-card border border-amber/40 bg-amber-soft px-2.5 py-1.5 text-[12.5px] font-semibold text-amber-ink">
        <Archive className="h-3.5 w-3.5" strokeWidth={2.4} />
        Cached audit
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-card border border-teal/40 bg-teal-soft px-2.5 py-1.5 text-[12.5px] font-semibold text-teal-ink">
      <span className={`h-2 w-2 rounded-full bg-teal ${running ? "animate-pulse-dot" : ""}`} />
      {running ? "Live audit" : "Live audit complete"}
    </span>
  );
}

function CompactRubric({
  band,
}: {
  band: { passedCount: number; total: number; band: string };
}) {
  const color =
    band.band === "Pass"
      ? "bg-teal-soft text-teal-ink"
      : band.band === "Partial"
        ? "bg-amber-soft text-amber-ink"
        : "bg-coral-soft text-coral-ink";
  return (
    <div className="rounded-card border border-surface-line bg-white px-4 py-3">
      <div className="text-[14px] font-bold text-graphite">Rubric result</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[15px] font-bold text-graphite">
          {band.passedCount}/{band.total}
        </span>
        <span className={`rounded px-2 py-0.5 text-[12px] font-bold ${color}`}>{band.band}</span>
      </div>
    </div>
  );
}

function IdleExplainer() {
  const steps = [
    ["Audit the question", "What unstated assumptions are embedded? Is this the right question?"],
    ["Synthesize prior evidence", "Which trials tried to answer this — and what failed, and why?"],
    ["Analyze the population", "Who is the right patient population? What PPV should we expect?"],
    ["Generate a trial design", "Endpoints, eligibility, control arm, statistics, sample-size signal."],
    ["Adversarially critique", "Name the top failure modes and the mechanism behind each."],
    ["Produce an adaptive revision", "Address the critique with an enrichment or adaptive design."],
  ];
  return (
    <div className="rounded-card border border-surface-line bg-white p-4">
      <h2 className="text-[15px] font-bold text-graphite">Find the flaw before protocol lock</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-graphite-muted">
        Question Audit runs a closed-loop audit of the research question itself — the decisions that
        sink most trials before the first patient is enrolled. Pick the{" "}
        <span className="font-semibold text-coral-ink">NHS Galleri</span> preset and press Audit
        Trial Question.
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map(([title, body], i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[12px] font-bold text-teal-ink">
              {i + 1}
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold text-graphite">{title}</span>
              <span className="block text-[13px] leading-snug text-graphite-muted">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PayoffPlaceholder({ started }: { started: boolean }) {
  return (
    <div className="rounded-card border border-dashed border-surface-line bg-white/60 p-4 text-center">
      <p className="text-[13px] font-semibold text-graphite-muted">Product payoff</p>
      <p className="mt-1 text-[12.5px] leading-snug text-graphite-faint">
        {started
          ? "The question diff, the “Is this real?” proof panel, the rubric check, and team review land here as the audit completes."
          : "Run an audit to see the transformation, the question diff, the proof panel, the rubric check, and team review."}
      </p>
    </div>
  );
}
