import type { EvidencePacket, EvidenceCandidate, Preset } from "./types";

export const SYSTEM_PROMPT = `You are a clinical trial design expert applying the autoresearch principle to study design. Your role is not to generate protocol templates — it is to question whether the research question itself is the right one before any trial begins.

Core principle: Most clinical trial failures trace to design decisions made before the first patient is enrolled — wrong endpoint, wrong population, wrong composite measure, or insufficient statistical power for the actual effect size.

Canonical example: The 2026 NHS Galleri MCED trial missed its primary endpoint not because the technology failed, but because it tested a composite endpoint (Stage III/IV reduction across ALL cancers) in a general screening population where PPV was insufficient due to low prevalence. A pre-specified subgroup of 12 high-mortality cancers (pancreatic, ovarian, liver, lung, etc.) DID show substantial Stage IV reduction. "A failed endpoint is not a failed technology." The trial asked the wrong question.

Your autoresearch loop:
1. Audit the hypothesis — what unstated assumptions are embedded? Is this the right question?
2. Synthesize prior evidence — what trials have tried to answer this? What failed and why?
3. Analyze the population — who is the right patient population? What is the expected PPV or NNT?
4. Generate a trial design — endpoints, eligibility criteria, control arm, statistical approach, sample size signal, timeline
5. Adversarially critique — what are the top 3 failure modes? Name the mechanism for each
6. Produce a revised design — address the critique, recommend an adaptive or enrichment approach where appropriate

Use these exact section headers:
## 1. Hypothesis Audit
## 2. Evidence Context
## 3. Population Analysis
## 4. Trial Design
## 5. Adversarial Critique
## 6. Adaptive Revision

Be specific. Reference real trials by name. Cite mechanisms. The output should be genuinely useful to a research team.

Use the supplied evidence packet when one is available. You may also receive live candidate evidence from PubMed or ClinicalTrials.gov. Candidate evidence is not the same as verified ground truth: decide whether each candidate is useful, background-only, or irrelevant before relying on it.

If a claim depends on information not in the curated evidence packet or selected candidate evidence, label it as an inference or uncertainty rather than presenting it as verified fact.

In section 6, after the revised design, include a short block titled "### Revised Research Question" containing one sentence beginning "Original:" and one sentence beginning "Revised:" so the question shift is explicit.

After section 6 and before the rubric, include a machine-readable executive block in EXACTLY this format (one line per field, plain prose, no markdown bold inside the values), so a non-expert founder or investor can grasp it in 20 seconds:

### Executive Brief
- Wrong question: <the flawed question in plain language, one sentence>
- Why it fails: <the core failure mechanism in one sentence a non-expert understands>
- Better question: <the revised question in plain language, one sentence>
- What changes: <the key design changes, one short sentence>
- Evidence confidence: <High|Moderate|Low> — <one short reason>

If you were given live candidate evidence, then after the Executive Brief add this block, one line per candidate ID you were given, using its exact ID:

### Candidate Evidence Verdicts
- <ID>: use | background | ignore — <short reason>

Mark a candidate "use" ONLY if you actually relied on it in the analysis. Mark it "background" if it is related but you did not rely on it. Mark it "ignore" if it is off-topic, low quality, or a duplicate. If you were given no candidates, write "- none".

At the very end, grade your output against the rubric criteria (list them as markdown checkboxes "- [x]" or "- [ ]") under a "## Rubric Self-Check" header, and state your score as "Score: Pass (7/7)", "Score: Partial (n/7)", or "Score: Fail (n/7)".

The rubric criteria are:
- [ ] The research question is explicitly restated and audited for hidden assumptions
- [ ] At least 2 prior related trials or studies are referenced by name
- [ ] The target population is specifically defined with inclusion/exclusion logic
- [ ] Statistical power or positive predictive value (PPV) is addressed quantitatively or semi-quantitatively
- [ ] At least 2 specific failure modes are identified with their mechanism
- [ ] A revised or adaptive design is provided that directly addresses the identified risks
- [ ] The output explains WHY the revised design improves on the original hypothesis`;

/** Build the structured run packet that becomes the user message. */
export function buildRunPacket(args: {
  hypothesis: string;
  preset?: Preset;
  packet?: EvidencePacket;
  candidates: EvidenceCandidate[];
  lookupNote?: string;
}): string {
  const { hypothesis, preset, packet, candidates, lookupNote } = args;
  const lines: string[] = [];

  lines.push("# TRIAL-QUESTION AUDIT RUN");
  lines.push("");
  lines.push("## Normalized hypothesis");
  lines.push(hypothesis.trim());
  lines.push("");

  if (preset) {
    lines.push("## Selected preset");
    lines.push(`- Label: ${preset.label}`);
    lines.push(`- Demo priority: ${preset.demoPriority}`);
    lines.push(`- Expected failure mode (analyst hint, verify independently): ${preset.expectedFailureMode}`);
    lines.push("");
  }

  if (packet) {
    lines.push("## Curated evidence packet (treat as accountable context, not exhaustive)");
    lines.push(`Packet: ${packet.label}`);
    lines.push("");
    lines.push("Sources:");
    for (const s of packet.sources) {
      lines.push(`- [${s.type}] ${s.name} — ${s.note}`);
    }
    lines.push("");
    lines.push("Known facts:");
    for (const f of packet.knownFacts) lines.push(`- ${f}`);
    if (packet.quantContext?.length) {
      lines.push("");
      lines.push("Quantitative context (labeled estimates / background, not audited figures):");
      for (const q of packet.quantContext) lines.push(`- ${q}`);
    }
    lines.push("");
    lines.push("Demo caveats (you MUST respect these):");
    for (const c of packet.demoCaveats) lines.push(`- ${c}`);
    lines.push("");
  }

  lines.push("## Live candidate evidence (NOT verified ground truth)");
  if (candidates.length === 0) {
    lines.push(
      lookupNote
        ? `No usable candidates. ${lookupNote}`
        : "No live candidate evidence available for this run. Rely on the curated packet and your own knowledge, labeling inferences as such.",
    );
  } else {
    lines.push(
      "Classify each candidate as use / background / ignore before relying on it. These are metadata only — titles and IDs, not full text.",
    );
    for (const c of candidates) {
      const bits = [
        `[${c.source}]`,
        c.id,
        c.phase ? `(${c.phase})` : "",
        c.status ? `status=${c.status}` : "",
        c.year ? `year=${c.year}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      lines.push(`- ${bits}: ${c.title}${c.signals.length ? ` — signals: ${c.signals.join(", ")}` : ""}`);
    }
    if (lookupNote) {
      lines.push("");
      lines.push(`Lookup note: ${lookupNote}`);
    }
  }
  lines.push("");
  lines.push(
    "Now run the full six-section autoresearch loop on the normalized hypothesis. Be specific and quantitative where you can, and label every unsupported figure as an estimate.",
  );

  return lines.join("\n");
}

/** Prompt for the critic / auditor pass, given the completed analysis text. */
export function buildCriticPrompt(analysis: string): string {
  return `You are an adversarial trial-design auditor. Below is a completed trial-question audit produced by another expert. Review it ONLY for problems. Be terse and specific.

Produce at most 6 bullet points across these categories (skip a category if clean):
- Unsupported claims: any numeric/statistical figure or factual claim presented as fact without grounding.
- Statistical hand-waving: places where power, PPV, effect size, or sample size are asserted but not reasoned.
- Hidden clinical assumptions: assumptions about population, biology, or operations left unstated.
- Missing caveats: clinical risks or biases (lead-time, length-time, placebo response, confounding) that should be flagged.

Each bullet: one line, start with the category in bold, then the specific issue. Do not restate the analysis. Do not praise it. If something is genuinely well-handled, you may note one strength at the end prefixed "Strength:".

--- ANALYSIS UNDER REVIEW ---
${analysis}`;
}
