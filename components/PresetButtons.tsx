"use client";

import type { Preset } from "@/app/lib/types";

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
        const active = preset.id === activeId;
        const primary = preset.demoPriority === "primary";
        return (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset)}
            className={[
              "block w-full rounded-sm border px-3 py-2.5 text-left transition",
              active
                ? "border-teal bg-teal-soft"
                : "border-surface-line bg-surface-sunken hover:border-teal/50",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            ].join(" ")}
          >
            <span className="flex items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-graphite">
                {preset.shortLabel}
              </span>
              {primary ? (
                <span className="shrink-0 rounded-sm bg-coral-soft px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-coral">
                  canonical
                </span>
              ) : (
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-graphite-faint">
                  secondary
                </span>
              )}
            </span>
            <span className="mt-1 block text-[11.5px] leading-snug text-graphite-faint">
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
