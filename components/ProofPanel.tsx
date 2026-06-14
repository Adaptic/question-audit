"use client";

import { ShieldCheck, Check, Info, AlertTriangle } from "lucide-react";
import type { ProofData } from "@/app/lib/types";

type Tone = "good" | "accent" | "warn";

interface Row {
  tone: Tone;
  tag: string;
  text: string;
}

const TONE = {
  good: { wrap: "bg-teal-soft text-teal", Icon: Check },
  accent: { wrap: "bg-teal-soft text-teal-ink", Icon: Info },
  warn: { wrap: "bg-amber-soft text-amber", Icon: AlertTriangle },
} as const;

export function ProofPanel({ proof }: { proof: ProofData }) {
  const used = proof.candidates.filter((c) => c.relevance === "use");
  const background = proof.candidates.filter((c) => c.relevance === "background");
  const ignored = proof.candidates.filter((c) => c.relevance === "ignore");

  const rows: Row[] = [];

  for (const s of proof.curatedSources) {
    rows.push({ tone: "good", tag: "Evidence", text: `${s.name} — curated ${s.type}` });
  }
  for (const c of used) {
    rows.push({ tone: "good", tag: "Evidence", text: `${c.id} (${c.source}) — live candidate, used` });
  }
  if (proof.namedStudies.length) {
    rows.push({ tone: "good", tag: "Named", text: `Named in analysis: ${proof.namedStudies.slice(0, 6).join(", ")}` });
  }
  if (background.length) {
    rows.push({ tone: "accent", tag: "Background", text: `Background only (not relied on): ${background.map((c) => c.id).join(", ")}` });
  }
  if (ignored.length) {
    rows.push({ tone: "warn", tag: "Ignored", text: `Ignored (off-topic / low relevance, not counted): ${ignored.map((c) => c.id).join(", ")}` });
  }
  for (const q of proof.quantChecks) rows.push({ tone: "good", tag: "Check", text: q });
  for (const a of proof.assumptions) rows.push({ tone: "accent", tag: "Assumption", text: a });
  for (const w of proof.unsupportedWarnings) rows.push({ tone: "warn", tag: "Warning", text: w });
  for (const u of proof.openUncertainty) rows.push({ tone: "warn", tag: "Open", text: u });

  if (rows.length === 0) {
    rows.push({ tone: "accent", tag: "Note", text: "No grounding evidence attached." });
  }

  return (
    <div className="animate-fade-in-up rounded-card border border-surface-line bg-surface shadow-panel">
      <div className="flex items-center gap-2 border-b border-surface-line px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-teal" strokeWidth={2.2} />
        <h3 className="text-[13px] font-bold tracking-tight text-graphite">Is this real?</h3>
        <span className="ml-auto font-mono text-[10.5px] tracking-[0.06em] text-graphite-faint">
          grounded
        </span>
      </div>

      {proof.lookupNote && (
        <div className="flex items-start gap-2 border-b border-surface-line bg-amber-soft px-4 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" strokeWidth={2.4} />
          <p className="text-[12.5px] leading-snug text-amber-ink">{proof.lookupNote}</p>
        </div>
      )}

      <div className="flex flex-col">
        {rows.map((r, i) => {
          const t = TONE[r.tone];
          const Icon = t.Icon;
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 border-t border-surface-line px-4 py-2.5 first:border-t-0"
            >
              <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm ${t.wrap}`}>
                <Icon className="h-2.5 w-2.5" strokeWidth={2.6} />
              </span>
              <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-graphite-muted">
                {r.text}
              </span>
              <span className="ml-1 mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.05em] text-graphite-faint">
                {r.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
