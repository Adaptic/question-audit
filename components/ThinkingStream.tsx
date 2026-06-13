"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";

export function ThinkingStream({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll while streaming.
  useEffect(() => {
    if (open && active && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [text, open, active]);

  if (!text && !active) return null;

  return (
    <div className="rounded-card border border-surface-line bg-surface-sunken">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-graphite-faint" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-graphite-faint" />
        )}
        <Brain className="h-3.5 w-3.5 text-graphite-muted" strokeWidth={2.2} />
        <span className="text-[13px] font-semibold text-graphite-muted">Reasoning trace</span>
        {active && (
          <span className="flex items-center gap-1 text-[11px] text-graphite-faint">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-graphite-muted" />
            reasoning
          </span>
        )}
        <span className="ml-auto text-[11px] text-graphite-faint">summarized</span>
      </button>
      {open && (
        <div
          ref={bodyRef}
          className="max-h-52 overflow-y-auto tm-scroll border-t border-surface-line px-3 py-2"
        >
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-graphite-muted">
            {text || "…"}
          </pre>
        </div>
      )}
    </div>
  );
}
