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

  const ppvColor =
    ppv.ppvPct < 25 ? "text-coral" : ppv.ppvPct < 50 ? "text-amber" : "text-teal";

  return (
    <div className="rounded-card border border-surface-line bg-surface shadow-panel">
      {/* head */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-line px-4 py-3">
        <span className="text-[15px] font-bold tracking-tight text-graphite">
          Why the question fails
        </span>
        <span className="font-mono text-[11.5px] tracking-[0.04em] text-graphite-faint">
          interactive · 20-second read
        </span>
        <div className="ml-auto flex gap-1 rounded-full border border-surface-line bg-surface-sunken p-1">
          <Tab active={value.mode === "ppv"} onClick={() => setMode("ppv")} icon={Activity}>
            PPV &amp; prevalence
          </Tab>
          <Tab active={value.mode === "dilution"} onClick={() => setMode("dilution")} icon={Layers}>
            Endpoint dilution
          </Tab>
        </div>
      </div>

      {value.mode === "ppv" ? (
        <div className="p-5">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-full border border-surface-line bg-surface-sunken">
              <Seg active={value.population === "general"} onClick={() => setPopulation("general")}>
                General population
              </Seg>
              <Seg active={value.population === "enriched"} onClick={() => setPopulation("enriched")}>
                Enriched population
              </Seg>
            </div>
            <label className="ml-auto flex items-center gap-2.5 text-[13px] text-graphite-muted">
              Prevalence{" "}
              <span className="tm-nums font-bold text-graphite">{prevalence.toFixed(1)}%</span>
              <input
                type="range"
                min={0.2}
                max={15}
                step={0.1}
                value={prevalence}
                onChange={(e) => onPrevSlider(parseFloat(e.target.value))}
                className="h-1.5 w-36 cursor-pointer accent-teal"
                aria-label="Prevalence"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
            <div>
              <div className="text-[13px] font-semibold text-graphite-muted">
                Positive predictive value
              </div>
              <div className={`tm-nums text-[46px] font-extrabold leading-none tracking-tight ${ppvColor}`}>
                {ppv.ppvPct.toFixed(0)}%
              </div>
              <div className="mt-2.5 max-w-[190px] text-[12px] leading-relaxed text-graphite-faint">
                Of 100 positive tests, <b className="text-graphite">{greenDots}</b> are real cancers
                — the rest are false alarms.
              </div>
            </div>

            <div>
              <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
                {Array.from({ length: 100 }).map((_, i) => (
                  <span
                    key={i}
                    className={`aspect-square rounded-[3px] ${i < greenDots ? "bg-teal" : "bg-coral/85"}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[13px] text-graphite-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-[3px] bg-teal" /> True positive
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-[3px] bg-coral/85" /> False positive
                </span>
                <span className="tm-nums ml-auto font-mono text-[11px] text-graphite-faint">
                  per 100k · {ppv.truePositives.toLocaleString()} TP vs{" "}
                  {ppv.falsePositives.toLocaleString()} FP
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 border-t border-surface-line pt-3.5 text-[12.5px] leading-relaxed text-graphite-muted">
            <b className="text-graphite">Low prevalence, not test quality, is what collapses PPV.</b>{" "}
            Enriching the population raises pre-test probability and pulls real cancers out of the
            false-alarm noise.
          </p>
        </div>
      ) : (
        <div className="p-5">
          <label className="mb-4 flex flex-wrap items-center gap-2.5 text-[13px] text-graphite-muted">
            Cancers with a real ~{Math.round(DEFAULT_DILUTION.perCancerEffect * 100)}% effect, out of{" "}
            {DEFAULT_DILUTION.totalCancers}:{" "}
            <span className="tm-nums font-bold text-graphite">{responsive}</span>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={responsive}
              onChange={(e) => setResponsive(parseInt(e.target.value, 10))}
              className="ml-1 h-1.5 w-40 cursor-pointer accent-teal"
              aria-label="Responsive cancers"
            />
          </label>

          <div className="flex flex-col gap-4">
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

          <p className="mt-4 border-t border-surface-line pt-3.5 text-[12.5px] leading-relaxed text-graphite-muted">
            The composite averages a real{" "}
            <b className="text-graphite">{(dil.targetedEffect * 100).toFixed(0)}%</b> effect down to{" "}
            <b className={dil.pooledDetected ? "text-teal" : "text-coral"}>
              {(dil.pooledEffect * 100).toFixed(1)}%
            </b>{" "}
            — {dil.pooledDetected ? "still detectable" : "below"} the ~
            {(dil.threshold * 100).toFixed(0)}% the trial can detect. Targeting the responsive
            cancers preserves the signal.
          </p>
        </div>
      )}
    </div>
  );
}

function Tab({
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
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
        active ? "bg-accent text-canvas" : "text-graphite-muted hover:text-graphite"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {children}
    </button>
  );
}

function Seg({
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
      className={`px-3.5 py-1.5 text-[13px] font-semibold transition ${
        active ? "bg-teal-soft text-teal-ink" : "text-graphite-muted hover:text-graphite"
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
  const ceiling = 35;
  const w = Math.min(100, (pct / ceiling) * 100);
  const tx = Math.min(100, (threshold / ceiling) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="text-graphite-muted">{label}</span>
        <span className={`tm-nums font-bold ${detected ? "text-teal" : "text-coral"}`}>
          {pct.toFixed(1)}% {detected ? "· detectable" : "· too small to detect"}
        </span>
      </div>
      <div className="relative h-5 w-full overflow-hidden rounded-sm bg-surface-raised">
        <div
          className={`h-full ${detected ? "bg-teal" : "bg-coral/85"}`}
          style={{ width: `${w}%` }}
        />
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-graphite-muted"
          style={{ left: `${tx}%` }}
          title={`Detection threshold ~${threshold.toFixed(0)}%`}
        />
      </div>
    </div>
  );
}
