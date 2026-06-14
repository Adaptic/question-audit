"use client";

import { FlaskConical, FileText, Search, AlertTriangle } from "lucide-react";
import type { EvidenceCandidate } from "@/app/lib/types";

export type LookupState = "idle" | "scanning" | "done" | "unavailable" | "low_relevance";

export function EvidenceLookupRail({
  candidates,
  state,
  queryTerms,
}: {
  candidates: EvidenceCandidate[];
  state: LookupState;
  queryTerms: string[];
}) {
  if (state === "idle") return null;

  return (
    <div className="rounded-card border border-surface-line bg-surface shadow-panel">
      <div className="flex items-center justify-between border-b border-surface-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-teal" strokeWidth={2.4} />
          <h3 className="text-[13px] font-bold tracking-tight text-graphite">Live evidence scan</h3>
          <span className="font-mono text-[10.5px] tracking-[0.04em] text-graphite-faint">
            metadata only
          </span>
        </div>
        {state === "scanning" && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-teal">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" />
            scanning
          </span>
        )}
      </div>

      {queryTerms.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b border-surface-line px-3 py-2">
          {queryTerms.map((t) => (
            <span
              key={t}
              className="rounded-sm border border-surface-line bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-graphite-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="max-h-44 overflow-y-auto tm-scroll p-2">
        {candidates.length === 0 && state === "scanning" && (
          <p className="px-1 py-2 text-[11px] text-graphite-faint">
            Querying PubMed and ClinicalTrials.gov…
          </p>
        )}
        {candidates.length === 0 && (state === "unavailable" || state === "low_relevance") && (
          <div className="flex items-start gap-1.5 px-1 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber" strokeWidth={2.5} />
            <p className="text-[11px] text-amber-ink">
              {state === "unavailable"
                ? "No live candidates returned — proceeding on curated evidence."
                : "Only weak matches — treated as background, curated evidence carries the run."}
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-1.5">
          {candidates.map((c) => (
            <li
              key={`${c.source}-${c.id}`}
              className="animate-fade-in-up rounded-sm border border-surface-line bg-surface-sunken px-2.5 py-2"
            >
              <div className="flex items-center gap-1.5">
                {c.source === "clinicaltrials.gov" ? (
                  <FlaskConical className="h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={2.2} />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-graphite-muted" strokeWidth={2.2} />
                )}
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[13px] font-semibold text-teal-ink hover:underline"
                  >
                    {c.id}
                  </a>
                ) : (
                  <span className="font-mono text-[13px] font-semibold text-graphite">{c.id}</span>
                )}
                {c.phase && (
                  <span className="rounded-sm bg-surface-raised px-1 py-0.5 text-[9px] text-graphite-muted">
                    {c.phase}
                  </span>
                )}
                {c.status && (
                  <span className="rounded-sm bg-surface-raised px-1 py-0.5 text-[9px] uppercase text-graphite-faint">
                    {c.status}
                  </span>
                )}
                {c.year && (
                  <span className="ml-auto text-[9px] text-graphite-faint">{c.year}</span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-graphite-muted">
                {c.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
