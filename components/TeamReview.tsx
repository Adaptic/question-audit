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

function initials(role: string): string {
  const words = role.split(/[\s/]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return role.slice(0, 2).toUpperCase();
}

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
    <div className="rounded-card border border-surface-line bg-surface shadow-panel">
      <div className="flex items-center gap-2 border-b border-surface-line px-4 py-3">
        <Users className="h-4 w-4 text-teal" strokeWidth={2.2} />
        <h3 className="text-[13px] font-bold tracking-tight text-graphite">Team review</h3>
        <span className="ml-auto font-mono text-[10.5px] tracking-[0.06em] text-graphite-faint">
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
                className={`rounded-sm px-2 py-1 text-[13px] font-semibold transition ${
                  role === r
                    ? "bg-teal-soft text-teal-ink"
                    : "bg-surface-sunken text-graphite-faint hover:text-graphite-muted"
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
              className="min-w-0 flex-1 rounded-sm border border-surface-line bg-surface-sunken px-2.5 py-1.5 text-[13px] text-graphite outline-none placeholder:text-graphite-faint focus:border-teal"
            />
            <button
              type="button"
              onClick={add}
              disabled={!text.trim()}
              className="flex items-center gap-1 rounded-sm border border-surface-line bg-surface-raised px-2.5 py-1.5 text-[13px] font-semibold text-graphite hover:border-teal disabled:opacity-40"
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
              className="border-t border-surface-line px-4 py-3 first:border-t-0"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-raised font-mono text-[9px] font-bold text-teal-ink">
                  {initials(c.role)}
                </span>
                <span className="text-[11.5px] font-semibold text-graphite">{c.role}</span>
                <span className="rounded-sm bg-teal-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-teal-ink">
                  {c.resolved ? "resolved" : "comment"}
                </span>
                {!readOnly && (
                  <span className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      title={c.resolved ? "Reopen" : "Resolve"}
                      className="text-graphite-faint hover:text-teal"
                    >
                      {c.resolved ? <Undo2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      title="Delete"
                      className="text-graphite-faint hover:text-coral"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
              <p
                className={`mt-1.5 text-[12px] leading-snug ${
                  c.resolved ? "text-graphite-faint line-through" : "text-graphite-muted"
                }`}
              >
                {c.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
