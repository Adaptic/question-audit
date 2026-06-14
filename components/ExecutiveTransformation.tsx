"use client";

import { forwardRef } from "react";
import { ArrowRight, XCircle, CheckCircle2 } from "lucide-react";
import type { ExecutiveSummary } from "@/app/lib/types";

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "bg-teal-soft text-teal border-teal/35",
  Moderate: "bg-amber-soft text-amber border-amber/35",
  Low: "bg-coral-soft text-coral border-coral/35",
};

const EYEBROW = "font-mono text-[10px] font-bold uppercase tracking-[0.12em]";

export const ExecutiveTransformation = forwardRef<HTMLDivElement, { summary: ExecutiveSummary }>(
  function ExecutiveTransformation({ summary }, ref) {
    const conf = CONFIDENCE_STYLES[summary.evidenceConfidence.level] ?? CONFIDENCE_STYLES.Moderate;
    return (
      <div
        ref={ref}
        className="animate-fade-in-up scroll-mt-4 overflow-hidden rounded-card border border-surface-line bg-surface shadow-panel"
      >
        {/* head */}
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-line px-4 py-3.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-ink">
            Trial Question Transformation
          </span>
          <span
            className={`ml-auto rounded-full border px-2.5 py-1 text-[11px] font-bold ${conf}`}
            title={summary.evidenceConfidence.reason}
          >
            Evidence confidence · {summary.evidenceConfidence.level}
          </span>
        </div>

        {/* wrong → arrow → better */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_34px_1fr]">
          <div className="bg-coral-soft px-4 py-4">
            <div className={`${EYEBROW} mb-2 flex items-center gap-1.5 text-coral`}>
              <XCircle className="h-3.5 w-3.5" strokeWidth={2.4} /> Wrong question
            </div>
            <p className="text-[14.5px] font-medium leading-snug text-graphite">
              {summary.wrongQuestion}
            </p>
          </div>
          <div className="hidden items-center justify-center bg-surface-sunken text-teal md:flex">
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </div>
          <div className="px-4 py-4">
            <div className={`${EYEBROW} mb-2 flex items-center gap-1.5 text-teal`}>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} /> Better question
            </div>
            <p className="text-[14.5px] font-medium leading-snug text-graphite">
              {summary.betterQuestion}
            </p>
          </div>
        </div>

        {/* why it fails / what changes */}
        <div className="grid grid-cols-1 gap-px border-t border-surface-line bg-surface-line md:grid-cols-2">
          <div className="bg-surface px-4 py-3.5">
            <div className="tm-eyebrow mb-1.5">Why it fails</div>
            <p className="text-[12.5px] leading-relaxed text-graphite-muted">
              {summary.whyItFails}
            </p>
          </div>
          <div className="bg-surface px-4 py-3.5">
            <div className="tm-eyebrow mb-1.5">What changes</div>
            <p className="text-[12.5px] leading-relaxed text-graphite-muted">
              {summary.whatChanges}
            </p>
          </div>
        </div>
      </div>
    );
  },
);
