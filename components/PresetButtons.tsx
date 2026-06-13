"use client";

import { Beaker, Target, Activity } from "lucide-react";
import type { Preset } from "@/app/lib/types";

const ICONS: Record<string, typeof Beaker> = {
  galleri: Beaker,
  "cancer-survivor-mced": Target,
  "post-chemo-fatigue": Activity,
};

export function PresetButtons({
  presets,
  activeId,
  onSelect,
  disabled,
}: {
  presets: Preset[];
  activeId?: string;
  onSelect: (preset: Preset) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {presets.map((preset) => {
        const Icon = ICONS[preset.id] ?? Beaker;
        const active = preset.id === activeId;
        const primary = preset.demoPriority === "primary";
        return (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset)}
            className={[
              "group flex items-start gap-2.5 rounded-card border px-3 py-2.5 text-left transition",
              active
                ? "border-teal bg-teal-soft"
                : "border-surface-line bg-white hover:border-teal/50 hover:bg-teal-soft/40",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            ].join(" ")}
          >
            <Icon
              className={active ? "mt-0.5 h-4 w-4 text-teal-ink" : "mt-0.5 h-4 w-4 text-graphite-muted"}
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-semibold text-graphite">
                  {preset.shortLabel}
                </span>
                <span
                  className={[
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    primary
                      ? "bg-coral-soft text-coral-ink"
                      : "bg-surface-sunken text-graphite-faint",
                  ].join(" ")}
                >
                  {primary ? "Primary demo" : "Secondary"}
                </span>
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-graphite-muted">
                {preset.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
