"use client";

import React from "react";

const SECTION_IDS: Record<string, string> = {
  "1. Hypothesis Audit": "sec-audit",
  "2. Evidence Context": "sec-evidence",
  "3. Population Analysis": "sec-population",
  "4. Trial Design": "sec-design",
  "5. Adversarial Critique": "sec-critique",
  "6. Adaptive Revision": "sec-revision",
};

/** Minimal, dependency-free inline markdown: **bold**, *italic*, `code`. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) {
      nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    } else {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface Block {
  type: "h2" | "h3" | "p" | "ul" | "ol";
  content?: string;
  items?: string[];
}

function parseBlocks(md: string): Block[] {
  // Drop the executive brief + rubric self-check — both rendered in dedicated panels.
  const cut = md.search(/^#{2,3}\s*(Executive Brief|Rubric Self-Check)/im);
  const text = cut >= 0 ? md.slice(0, cut) : md;

  const lines = text.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let listType: "ul" | "ol" = "ul";

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", content: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list && list.length) {
      blocks.push({ type: listType, items: list });
    }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const ul = line.match(/^\s*[-*]\s+(.*)$/);

    if (h2) {
      flushPara();
      flushList();
      blocks.push({ type: "h2", content: h2[1] });
    } else if (h3) {
      flushPara();
      flushList();
      blocks.push({ type: "h3", content: h3[1] });
    } else if (ol) {
      flushPara();
      if (!list || listType !== "ol") {
        flushList();
        list = [];
        listType = "ol";
      }
      list.push(ol[1]);
    } else if (ul) {
      flushPara();
      if (!list || listType !== "ul") {
        flushList();
        list = [];
        listType = "ul";
      }
      list.push(ul[1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export function TrialOutput({ markdown }: { markdown: string }) {
  if (!markdown.trim()) return null;
  const blocks = parseBlocks(markdown);

  return (
    <div className="tm-prose">
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          const id = SECTION_IDS[b.content ?? ""];
          return (
            <h2 key={i} id={id}>
              {renderInline(b.content ?? "", `h2-${i}`)}
            </h2>
          );
        }
        if (b.type === "h3") {
          return <h3 key={i}>{renderInline(b.content ?? "", `h3-${i}`)}</h3>;
        }
        if (b.type === "ul") {
          return (
            <ul key={i}>
              {b.items!.map((it, j) => (
                <li key={j}>{renderInline(it, `ul-${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i}>
              {b.items!.map((it, j) => (
                <li key={j}>{renderInline(it, `ol-${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{renderInline(b.content ?? "", `p-${i}`)}</p>;
      })}
    </div>
  );
}
