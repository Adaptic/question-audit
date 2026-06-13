"use client";

import { Check, X, ClipboardCheck, Cpu, ScanLine } from "lucide-react";
import type { RubricResult } from "@/app/lib/types";

export function RubricCheck({ result }: { result: RubricResult }) {
  const bandColor =
    result.band === "Pass"
      ? "bg-teal-soft text-teal-ink"
      : result.band === "Partial"
        ? "bg-amber-soft text-amber-ink"
        : "bg-coral-soft text-coral-ink";

  return (
    <div className="rounded-card border border-surface-line bg-white">
      <div className="flex items-center gap-1.5 border-b border-surface-line px-3 py-2">
        <ClipboardCheck className="h-4 w-4 text-graphite-muted" strokeWidth={2.3} />
        <span className="text-[14px] font-bold text-graphite">Rubric self-check</span>
      </div>

      {/* Two-track header: model self-grade vs deterministic check. */}
      <div className="grid grid-cols-2 gap-px border-b border-surface-line bg-surface-line">
        <div className="bg-white px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-faint">
            <Cpu className="h-3 w-3" /> Model self-grade
          </div>
          <div className="mt-0.5 text-[13px] font-bold text-graphite">
            {result.modelSelfScore ?? "—"}
          </div>
        </div>
        <div className="bg-white px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-graphite-faint">
            <ScanLine className="h-3 w-3" /> Deterministic check
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-graphite">
              {result.passedCount}/{result.total}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${bandColor}`}>
              {result.band}
            </span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col">
        {result.criteria.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-2 border-b border-surface-line/70 px-3 py-1.5 last:border-b-0"
          >
            <span
              className={[
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded",
                c.passed ? "bg-teal-soft text-teal-ink" : "bg-coral-soft text-coral-ink",
              ].join(" ")}
            >
              {c.passed ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium leading-snug text-graphite">
                {c.label}
              </span>
              <span className="block text-[11.5px] leading-snug text-graphite-faint">
                {c.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
