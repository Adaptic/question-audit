"use client";

import {
  ShieldCheck,
  BookMarked,
  Sigma,
  HelpCircle,
  AlertTriangle,
  CircleDot,
  Info,
} from "lucide-react";
import type { ProofData } from "@/app/lib/types";

function Section({
  icon: Icon,
  title,
  tone,
  items,
  empty,
}: {
  icon: typeof ShieldCheck;
  title: string;
  tone: "teal" | "amber" | "coral" | "graphite";
  items: string[];
  empty?: string;
}) {
  const toneClasses = {
    teal: "text-teal-ink",
    amber: "text-amber-ink",
    coral: "text-coral-ink",
    graphite: "text-graphite-muted",
  }[tone];

  if (items.length === 0 && !empty) return null;

  return (
    <div className="px-4 py-3">
      <div className={`mb-1.5 flex items-center gap-1.5 text-[13px] font-bold ${toneClasses}`}>
        <Icon className="h-4 w-4" strokeWidth={2.3} />
        {title}
        <span className="text-[12px] font-normal text-graphite-faint">
          {items.length > 0 ? `(${items.length})` : ""}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] italic text-graphite-faint">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CircleDot className={`mt-1 h-3 w-3 shrink-0 ${toneClasses}`} strokeWidth={2.5} />
              <span className="text-[13px] leading-snug text-graphite-muted">{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProofPanel({ proof }: { proof: ProofData }) {
  const usedCandidates = proof.candidates.filter((c) => c.relevance === "use");
  const backgroundCandidates = proof.candidates.filter((c) => c.relevance === "background");
  const ignoredCount = proof.candidates.filter((c) => c.relevance === "ignore").length;

  const sourceItems = [
    ...proof.curatedSources.map((s) => `${s.name} — curated ${s.type}`),
    ...usedCandidates.map((c) => `${c.id} (${c.source}) — live candidate, used`),
  ];
  if (proof.namedStudies.length) {
    sourceItems.push(`Named in analysis: ${proof.namedStudies.slice(0, 6).join(", ")}`);
  }

  return (
    <div className="animate-fade-in-up rounded-card border border-graphite/15 bg-white">
      <div className="flex items-center gap-1.5 border-b border-surface-line bg-graphite px-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.3} />
        <span className="text-[14px] font-bold text-white">Is this real?</span>
        <span className="ml-auto text-[12px] text-white/60">evidence · checks · uncertainty</span>
      </div>

      {proof.lookupNote && (
        <div className="flex items-start gap-1.5 border-b border-surface-line bg-amber-soft/60 px-4 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-ink" strokeWidth={2.4} />
          <p className="text-[13px] leading-snug text-amber-ink">{proof.lookupNote}</p>
        </div>
      )}

      <div className="divide-y divide-surface-line">
        <Section
          icon={BookMarked}
          title="Evidence used"
          tone="teal"
          items={sourceItems}
          empty="No grounding evidence attached."
        />
        {(backgroundCandidates.length > 0 || ignoredCount > 0) && (
          <div className="px-4 py-2.5">
            <div className="text-[13px] text-graphite-faint">
              {backgroundCandidates.length > 0 && (
                <span>
                  Background only (not relied on):{" "}
                  <span className="text-graphite-muted">
                    {backgroundCandidates.map((c) => c.id).join(", ")}
                  </span>
                  . {" "}
                </span>
              )}
              {ignoredCount > 0 && <span>{ignoredCount} low-relevance candidate(s) ignored.</span>}
            </div>
          </div>
        )}
        <Section icon={Sigma} title="Quantified checks" tone="teal" items={proof.quantChecks} />
        <Section
          icon={HelpCircle}
          title="Assumptions surfaced"
          tone="amber"
          items={proof.assumptions}
        />
        <Section
          icon={AlertTriangle}
          title="Auditor warnings"
          tone="coral"
          items={proof.unsupportedWarnings}
        />
        <Section
          icon={HelpCircle}
          title="Open uncertainty — needs expert review"
          tone="graphite"
          items={proof.openUncertainty}
          empty="No residual uncertainty flagged."
        />
      </div>
    </div>
  );
}
