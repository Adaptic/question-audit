"use client";

import { Check, Minus } from "lucide-react";
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
    <div className="flex items-center overflow-hidden">
      {STAGES.map((stage, i) => {
        const status = statuses[stage.id] ?? "pending";
        const last = i === STAGES.length - 1;
        return (
          <div key={stage.id} className={last ? "flex items-center" : "flex flex-1 items-center"}>
            <span className="flex items-center gap-2">
              <Node status={status} />
              <span
                className={[
                  "whitespace-nowrap text-[11.5px] font-semibold",
                  status === "active"
                    ? "text-teal-ink"
                    : status === "done"
                      ? "text-graphite"
                      : "text-graphite-faint",
                ].join(" ")}
              >
                {stage.label}
              </span>
            </span>
            {!last && (
              <span
                className={[
                  "mx-2 h-px flex-1",
                  status === "done"
                    ? "bg-gradient-to-r from-teal/70 to-surface-line"
                    : "bg-surface-line",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Node({ status }: { status: StageStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-teal/40 bg-teal-soft text-teal">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-[22px] w-[22px] animate-pulse-dot items-center justify-center rounded-full bg-accent text-canvas">
        <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-surface-line text-graphite-faint">
        <Minus className="h-3 w-3" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-surface-line">
      <span className="h-1.5 w-1.5 rounded-full bg-surface-line" />
    </span>
  );
}
