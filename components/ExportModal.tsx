"use client";

import { useRef, useState } from "react";
import { Download, Copy, Check, X, FileText } from "lucide-react";

export function ExportModal({
  markdown,
  onClose,
}: {
  markdown: string;
  onClose: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectHint, setSelectHint] = useState(false);

  const download = () => {
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clinical-dev-question-audit.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Download blocked (e.g. in-app browser) — fall back to select-to-copy.
      taRef.current?.focus();
      taRef.current?.select();
      setSelectHint(true);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — select the text so the user can copy manually.
      taRef.current?.focus();
      taRef.current?.select();
      setSelectHint(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-surface-line bg-surface shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-surface-line px-4 py-3">
          <FileText className="h-4 w-4 text-graphite-muted" strokeWidth={2.3} />
          <span className="text-[15px] font-bold text-graphite">Audit brief</span>
          <span className="text-[12px] text-graphite-faint">Markdown · download or copy</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-graphite-faint hover:text-graphite"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-surface-line px-4 py-2.5">
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 text-[13px] font-bold text-canvas hover:brightness-105"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2.4} /> Download .md
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-sm border border-surface-line bg-surface-raised px-3 py-1.5 text-[13px] font-semibold text-graphite-muted hover:border-teal hover:text-graphite"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-teal" strokeWidth={2.6} /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={2.3} /> Copy to clipboard
              </>
            )}
          </button>
          {selectHint && (
            <span className="text-[12.5px] text-amber-ink">
              Download/clipboard blocked — text is selected, press Cmd/Ctrl+C.
            </span>
          )}
        </div>

        <textarea
          ref={taRef}
          readOnly
          value={markdown}
          onFocus={(e) => e.currentTarget.select()}
          className="tm-scroll min-h-[40vh] flex-1 resize-none bg-surface-sunken/40 p-4 font-mono text-[12.5px] leading-relaxed text-graphite outline-none"
        />
      </div>
    </div>
  );
}
