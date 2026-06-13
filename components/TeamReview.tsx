"use client";

import { useState } from "react";
import { Check, MessageSquarePlus, Undo2, X, Users } from "lucide-react";
import type { ReviewComment } from "@/app/lib/share";

export const REVIEW_ROLES = [
  "Biostatistician",
  "Oncologist",
  "Trial Ops",
  "Patient Advocate",
  "Investor/Board",
] as const;

const ROLE_COLOR: Record<string, string> = {
  Biostatistician: "bg-teal-soft text-teal-ink",
  Oncologist: "bg-amber-soft text-amber-ink",
  "Trial Ops": "bg-surface-sunken text-graphite-muted",
  "Patient Advocate": "bg-coral-soft text-coral-ink",
  "Investor/Board": "bg-graphite text-white",
};

let _seq = 0;

export function TeamReview({
  comments,
  onChange,
  readOnly,
}: {
  comments: ReviewComment[];
  onChange: (c: ReviewComment[]) => void;
  readOnly?: boolean;
}) {
  const [role, setRole] = useState<string>(REVIEW_ROLES[0]);
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    _seq += 1;
    onChange([...comments, { id: `c${_seq}-${t.length}`, role, text: t, resolved: false }]);
    setText("");
  };

  const toggle = (id: string) =>
    onChange(comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)));
  const remove = (id: string) => onChange(comments.filter((c) => c.id !== id));

  return (
    <div className="rounded-card border border-surface-line bg-white">
      <div className="flex items-center gap-1.5 border-b border-surface-line px-4 py-2.5">
        <Users className="h-4 w-4 text-graphite-muted" strokeWidth={2.2} />
        <span className="text-[14px] font-bold text-graphite">Team review</span>
        <span className="ml-auto text-[13px] text-graphite-faint">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </span>
      </div>

      {!readOnly && (
        <div className="border-b border-surface-line p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {REVIEW_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded px-2 py-1 text-[13px] font-semibold transition ${
                  role === r ? ROLE_COLOR[r] : "bg-surface-sunken text-graphite-faint hover:text-graphite-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              placeholder={`Comment as ${role}…`}
              className="min-w-0 flex-1 rounded border border-surface-line bg-surface-sunken/50 px-2.5 py-1.5 text-[13px] text-graphite outline-none focus:border-teal focus:bg-white"
            />
            <button
              type="button"
              onClick={add}
              disabled={!text.trim()}
              className="flex items-center gap-1 rounded-card bg-graphite px-2.5 py-1.5 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="px-4 py-3 text-[13px] italic text-graphite-faint">
          No review comments yet. Add notes from each role to attach a sign-off trail to the audit.
        </p>
      ) : (
        <ul className="flex flex-col">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-2 border-b border-surface-line/70 px-4 py-2 last:border-b-0"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${ROLE_COLOR[c.role] ?? "bg-surface-sunken text-graphite-muted"}`}
              >
                {c.role}
              </span>
              <span
                className={`min-w-0 flex-1 text-[13px] leading-snug ${c.resolved ? "text-graphite-faint line-through" : "text-graphite"}`}
              >
                {c.text}
              </span>
              {!readOnly && (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    title={c.resolved ? "Reopen" : "Resolve"}
                    className="text-graphite-faint hover:text-teal-ink"
                  >
                    {c.resolved ? <Undo2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    title="Delete"
                    className="text-graphite-faint hover:text-coral-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
