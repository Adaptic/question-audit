"use client";

import { forwardRef } from "react";
import { ArrowRight, AlertTriangle, Sparkles, Wrench, ShieldCheck } from "lucide-react";
import type { ExecutiveSummary } from "@/app/lib/types";

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "bg-teal-soft text-teal-ink border-teal/40",
  Moderate: "bg-amber-soft text-amber-ink border-amber/40",
  Low: "bg-coral-soft text-coral-ink border-coral/40",
};

export const ExecutiveTransformation = forwardRef<HTMLDivElement, { summary: ExecutiveSummary }>(
  function ExecutiveTransformation({ summary }, ref) {
    const conf = CONFIDENCE_STYLES[summary.evidenceConfidence.level] ?? CONFIDENCE_STYLES.Moderate;
    return (
      <div
        ref={ref}
        className="animate-fade-in-up scroll-mt-4 overflow-hidden rounded-card border border-graphite/20 bg-white shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-surface-line bg-graphite px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2.2} />
          <span className="text-[14px] font-bold text-white">Trial Question Transformation</span>
          <span
            className={`ml-auto rounded border px-2 py-0.5 text-[12px] font-semibold ${conf}`}
            title={summary.evidenceConfidence.reason}
          >
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            Evidence confidence: {summary.evidenceConfidence.level}
          </span>
        </div>

        {/* Wrong → Better */}
        <div className="grid gap-px bg-surface-line md:grid-cols-2">
          <div className="bg-coral-soft/40 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-coral-ink">
              <AlertTriangle className="h-4 w-4" strokeWidth={2.3} /> Wrong question
            </div>
            <p className="text-[15px] font-medium leading-snug text-graphite">
              {summary.wrongQuestion}
            </p>
          </div>
          <div className="relative bg-teal-soft/50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-teal-ink">
              <Sparkles className="h-4 w-4" strokeWidth={2.3} /> Better question
            </div>
            <p className="text-[15px] font-medium leading-snug text-graphite">
              {summary.betterQuestion}
            </p>
            <div className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-surface-line bg-white md:flex">
              <ArrowRight className="h-3.5 w-3.5 text-graphite-muted" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Why it fails / What changes */}
        <div className="grid gap-px bg-surface-line md:grid-cols-2">
          <div className="bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-amber-ink">
              <AlertTriangle className="h-4 w-4" strokeWidth={2.3} /> Why it fails
            </div>
            <p className="text-[14px] leading-relaxed text-graphite-muted">{summary.whyItFails}</p>
          </div>
          <div className="bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-teal-ink">
              <Wrench className="h-4 w-4" strokeWidth={2.3} /> What changes
            </div>
            <p className="text-[14px] leading-relaxed text-graphite-muted">{summary.whatChanges}</p>
          </div>
        </div>
      </div>
    );
  },
);
