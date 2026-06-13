"use client";

import { Check, Loader2, Minus } from "lucide-react";
import type { StageId, StageStatus } from "@/app/lib/types";

const STAGES: { id: StageId; label: string }[] = [
  { id: "run_spec", label: "Run Spec" },
  { id: "evidence", label: "Evidence Scan" },
  { id: "reasoning", label: "Reasoning trace" },
  { id: "critique", label: "Critique" },
  { id: "verification", label: "Verification" },
];

export function StageRail({
  statuses,
}: {
  statuses: Partial<Record<StageId, StageStatus>>;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto tm-scroll">
      {STAGES.map((stage, i) => {
        const status = statuses[stage.id] ?? "pending";
        return (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className={[
                "flex items-center gap-1.5 rounded-card border px-2.5 py-1.5 transition",
                status === "active"
                  ? "border-teal bg-teal-soft"
                  : status === "done"
                    ? "border-teal/30 bg-white"
                    : status === "skipped"
                      ? "border-surface-line bg-surface-sunken"
                      : "border-surface-line bg-white",
              ].join(" ")}
            >
              <StageIcon status={status} />
              <span
                className={[
                  "whitespace-nowrap text-[12.5px] font-semibold",
                  status === "active"
                    ? "text-teal-ink"
                    : status === "done"
                      ? "text-graphite"
                      : "text-graphite-faint",
                ].join(" ")}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={[
                  "h-px w-3 shrink-0",
                  status === "done" ? "bg-teal/40" : "bg-surface-line",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "active")
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-teal" strokeWidth={2.5} />;
  if (status === "done")
    return <Check className="h-3.5 w-3.5 text-teal" strokeWidth={3} />;
  if (status === "skipped")
    return <Minus className="h-3.5 w-3.5 text-graphite-faint" strokeWidth={2.5} />;
  return (
    <span className="h-2 w-2 rounded-full border border-surface-line bg-surface-sunken" />
  );
}
