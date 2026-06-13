"use client";

import { ArrowRight, GitCompareArrows } from "lucide-react";
import type { QuestionDiffData } from "@/app/lib/types";

export function QuestionDiff({ diff }: { diff: QuestionDiffData }) {
  return (
    <div className="animate-fade-in-up rounded-card border border-teal/40 bg-white">
      <div className="flex items-center gap-1.5 border-b border-surface-line px-3 py-2">
        <GitCompareArrows className="h-3.5 w-3.5 text-teal-ink" strokeWidth={2.4} />
        <span className="text-[14px] font-bold text-graphite">The question changed</span>
      </div>

      <div className="grid gap-px bg-surface-line sm:grid-cols-2">
        <div className="bg-coral-soft/40 p-3">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-coral-ink">
            Original question
          </div>
          <p className="text-[13px] leading-snug text-graphite">{diff.original}</p>
        </div>
        <div className="bg-teal-soft/50 p-3">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-teal-ink">
            Revised question
          </div>
          <p className="text-[13px] leading-snug text-graphite">{diff.revised}</p>
        </div>
      </div>

      {diff.changes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-surface-line px-3 py-2">
          {diff.changes.map((c) => (
            <span
              key={c.dimension}
              className="flex items-center gap-1 rounded bg-surface-sunken px-2 py-1 text-[10px]"
            >
              <span className="font-semibold text-graphite">{c.dimension}:</span>
              <span className="text-coral-ink">{c.from}</span>
              <ArrowRight className="h-3 w-3 text-graphite-faint" />
              <span className="font-medium text-teal-ink">{c.to}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
