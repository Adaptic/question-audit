"use client";

import { Check, X, ClipboardCheck } from "lucide-react";
import type { RubricResult } from "@/app/lib/types";

export function RubricCheck({ result }: { result: RubricResult }) {
  const bandColor =
    result.band === "Pass"
      ? "bg-teal-soft text-teal"
      : result.band === "Partial"
        ? "bg-amber-soft text-amber"
        : "bg-coral-soft text-coral";

  return (
    <div className="rounded-card border border-surface-line bg-surface shadow-panel">
      <div className="flex items-center gap-2 border-b border-surface-line px-4 py-3">
        <ClipboardCheck className="h-4 w-4 text-teal" strokeWidth={2.2} />
        <h3 className="text-[13px] font-bold tracking-tight text-graphite">Rubric self-check</h3>
        <span className="ml-auto font-mono text-[10.5px] tracking-[0.06em] text-graphite-faint">
          deterministic
        </span>
      </div>

      {/* big score + pills + band */}
      <div className="flex items-center gap-3.5 px-4 py-4">
        <div className="tm-nums text-[30px] font-extrabold leading-none tracking-tight text-graphite">
          {result.passedCount}
          <span className="text-[15px] font-semibold text-graphite-faint">/{result.total}</span>
        </div>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {result.criteria.map((c) => (
            <span
              key={c.id}
              title={c.label}
              className={`h-3.5 w-3.5 rounded-sm ${c.passed ? "bg-teal" : "bg-amber/55"}`}
            />
          ))}
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${bandColor}`}>
          {result.band}
        </span>
      </div>

      {result.modelSelfScore && (
        <div className="border-t border-surface-line px-4 py-2 text-[11.5px] text-graphite-faint">
          Model self-grade:{" "}
          <span className="font-semibold text-graphite-muted">{result.modelSelfScore}</span>
        </div>
      )}

      <ul className="border-t border-surface-line">
        {result.criteria.map((c) => (
          <li key={c.id} className="flex items-start gap-2 px-4 py-1.5 text-[12px] leading-snug">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm ${
                c.passed ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral"
              }`}
            >
              {c.passed ? (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              )}
            </span>
            <span className="text-graphite-muted">{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
