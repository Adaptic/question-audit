"use client";

import { ArrowRight, GitCompareArrows, XCircle, CheckCircle2 } from "lucide-react";
import type { QuestionDiffData } from "@/app/lib/types";

const EYEBROW = "font-mono text-[10px] font-bold uppercase tracking-[0.12em]";

export function QuestionDiff({ diff }: { diff: QuestionDiffData }) {
  return (
    <div className="animate-fade-in-up rounded-card border border-surface-line bg-surface shadow-panel">
      <div className="flex items-center gap-2 border-b border-surface-line px-4 py-3">
        <GitCompareArrows className="h-4 w-4 text-teal" strokeWidth={2.2} />
        <h3 className="text-[13px] font-bold tracking-tight text-graphite">The question changed</h3>
      </div>

      <div className="border-b border-surface-line bg-coral-soft px-4 py-3">
        <div className={`${EYEBROW} mb-1.5 flex items-center gap-1.5 text-coral`}>
          <XCircle className="h-3.5 w-3.5" strokeWidth={2.4} /> Original question
        </div>
        <p className="text-[12.5px] leading-snug text-graphite">{diff.original}</p>
      </div>
      <div className="px-4 py-3">
        <div className={`${EYEBROW} mb-1.5 flex items-center gap-1.5 text-teal`}>
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} /> Revised question
        </div>
        <p className="text-[12.5px] leading-snug text-graphite">{diff.revised}</p>
      </div>

      {diff.changes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-surface-line px-4 py-2.5">
          {diff.changes.map((c) => (
            <span
              key={c.dimension}
              className="flex items-center gap-1 rounded-sm border border-surface-line bg-surface-sunken px-2 py-1 text-[11px]"
            >
              <span className="font-semibold text-graphite">{c.dimension}:</span>
              <span className="text-coral">{c.from}</span>
              <ArrowRight className="h-3 w-3 text-graphite-faint" />
              <span className="font-medium text-teal-ink">{c.to}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
