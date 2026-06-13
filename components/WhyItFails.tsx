"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Layers } from "lucide-react";
import {
  ppvModel,
  dilutionModel,
  DEFAULT_SENS,
  DEFAULT_SPEC,
  DEFAULT_DILUTION,
  POPULATION_PRESETS,
} from "@/app/lib/simulate";
import type { SimSettings } from "@/app/lib/share";

export function WhyItFails({
  value,
  onChange,
}: {
  value: SimSettings;
  onChange: (s: SimSettings) => void;
}) {
  const [prevalence, setPrevalence] = useState<number>(
    POPULATION_PRESETS[value.population].prevalencePct,
  );
  const [responsive, setResponsive] = useState<number>(DEFAULT_DILUTION.responsiveCancers);

  // Sync prevalence when the population preset changes (incl. from a share link).
  useEffect(() => {
    setPrevalence(POPULATION_PRESETS[value.population].prevalencePct);
  }, [value.population]);

  const ppv = useMemo(
    () => ppvModel({ prevalencePct: prevalence, sensitivity: DEFAULT_SENS, specificity: DEFAULT_SPEC }),
    [prevalence],
  );
  const dil = useMemo(
    () => dilutionModel({ ...DEFAULT_DILUTION, responsiveCancers: responsive }),
    [responsive],
  );

  const greenDots = Math.max(0, Math.min(100, Math.round(ppv.ppvPct)));

  const setMode = (mode: SimSettings["mode"]) => onChange({ ...value, mode });
  const setPopulation = (population: SimSettings["population"]) => onChange({ ...value, population });
  const onPrevSlider = (v: number) => {
    setPrevalence(v);
    onChange({ ...value, population: v >= 3 ? "enriched" : "general" });
  };

  return (
    <div className="rounded-card border border-surface-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-line px-4 py-2.5">
        <span className="text-[14px] font-bold text-graphite">Why the question fails</span>
        <span className="text-[13px] text-graphite-faint">interactive · 20-second read</span>
        <div className="ml-auto flex gap-1">
          <ModeTab active={value.mode === "ppv"} onClick={() => setMode("ppv")} icon={Activity}>
            PPV &amp; prevalence
          </ModeTab>
          <ModeTab active={value.mode === "dilution"} onClick={() => setMode("dilution")} icon={Layers}>
            Endpoint dilution
          </ModeTab>
        </div>
      </div>

      {value.mode === "ppv" ? (
        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Preset
              active={value.population === "general"}
              onClick={() => setPopulation("general")}
            >
              General population
            </Preset>
            <Preset
              active={value.population === "enriched"}
              onClick={() => setPopulation("enriched")}
            >
              Enriched population
            </Preset>
            <label className="ml-auto flex items-center gap-2 text-[13px] text-graphite-muted">
              Prevalence: <span className="font-semibold text-graphite">{prevalence.toFixed(1)}%</span>
              <input
                type="range"
                min={0.2}
                max={15}
                step={0.1}
                value={prevalence}
                onChange={(e) => onPrevSlider(parseFloat(e.target.value))}
                className="w-32 accent-teal"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <div className="text-[13px] text-graphite-muted">Positive predictive value</div>
              <div
                className={`text-[40px] font-bold leading-none ${
                  ppv.ppvPct < 25 ? "text-coral" : ppv.ppvPct < 50 ? "text-amber" : "text-teal"
                }`}
              >
                {ppv.ppvPct.toFixed(0)}%
              </div>
              <div className="mt-1 max-w-[180px] text-[13px] leading-snug text-graphite-faint">
                Of 100 positive tests, <strong className="text-graphite">{greenDots}</strong> are
                real cancers; the rest are false alarms.
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-[3px]">
                {Array.from({ length: 100 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-sm ${i < greenDots ? "bg-teal" : "bg-coral/70"}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-[13px] text-graphite-muted">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-teal" /> True positive
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-coral/70" /> False positive
                </span>
                <span className="ml-auto text-graphite-faint">
                  per 100k: {ppv.truePositives.toLocaleString()} TP vs{" "}
                  {ppv.falsePositives.toLocaleString()} FP
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-snug text-graphite-muted">
            Low prevalence, not test quality, is what collapses PPV. Enriching the population raises
            pre-test probability and pulls real cancers out of the false-alarm noise.
          </p>
        </div>
      ) : (
        <div className="p-4">
          <label className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-graphite-muted">
            Cancers with a real ~{Math.round(DEFAULT_DILUTION.perCancerEffect * 100)}% effect, out of{" "}
            {DEFAULT_DILUTION.totalCancers}:{" "}
            <span className="font-semibold text-graphite">{responsive}</span>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={responsive}
              onChange={(e) => setResponsive(parseInt(e.target.value, 10))}
              className="ml-1 w-40 accent-teal"
            />
          </label>

          <div className="flex flex-col gap-3">
            <Bar
              label={`Composite — all ${DEFAULT_DILUTION.totalCancers} cancers pooled`}
              pct={dil.pooledEffect * 100}
              threshold={dil.threshold * 100}
              detected={dil.pooledDetected}
            />
            <Bar
              label="Targeted — responsive cancers only"
              pct={dil.targetedEffect * 100}
              threshold={dil.threshold * 100}
              detected={dil.targetedDetected}
            />
          </div>

          <p className="mt-3 text-[13px] leading-snug text-graphite-muted">
            The composite averages a real{" "}
            <strong className="text-graphite">{(dil.targetedEffect * 100).toFixed(0)}%</strong>{" "}
            effect down to{" "}
            <strong className={dil.pooledDetected ? "text-teal" : "text-coral"}>
              {(dil.pooledEffect * 100).toFixed(1)}%
            </strong>{" "}
            — {dil.pooledDetected ? "still detectable" : "below"} the ~
            {(dil.threshold * 100).toFixed(0)}% the trial can detect. Targeting the responsive
            cancers preserves the signal.
          </p>
        </div>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-card border px-2.5 py-1.5 text-[13px] font-semibold transition ${
        active
          ? "border-teal bg-teal-soft text-teal-ink"
          : "border-surface-line bg-white text-graphite-muted hover:border-teal/40"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.3} />
      {children}
    </button>
  );
}

function Preset({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-card border px-2.5 py-1.5 text-[13px] font-medium transition ${
        active
          ? "border-teal bg-teal-soft text-teal-ink"
          : "border-surface-line bg-white text-graphite-muted hover:border-teal/40"
      }`}
    >
      {children}
    </button>
  );
}

function Bar({
  label,
  pct,
  threshold,
  detected,
}: {
  label: string;
  pct: number;
  threshold: number;
  detected: boolean;
}) {
  // Scale bars against a fixed 35% ceiling for readability.
  const ceiling = 35;
  const w = Math.min(100, (pct / ceiling) * 100);
  const tx = Math.min(100, (threshold / ceiling) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="text-graphite-muted">{label}</span>
        <span className={`font-bold ${detected ? "text-teal-ink" : "text-coral-ink"}`}>
          {pct.toFixed(1)}% {detected ? "· detectable" : "· too small to detect"}
        </span>
      </div>
      <div className="relative h-5 w-full overflow-hidden rounded bg-surface-sunken">
        <div
          className={`h-full ${detected ? "bg-teal" : "bg-coral/70"}`}
          style={{ width: `${w}%` }}
        />
        {/* Detection threshold marker */}
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-graphite/60"
          style={{ left: `${tx}%` }}
          title={`Detection threshold ~${threshold.toFixed(0)}%`}
        />
      </div>
    </div>
  );
}
