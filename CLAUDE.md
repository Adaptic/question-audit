# TrialMind — Claude Code Build Brief

**Tagline:** Before you spend $100M, ask the right question.
**Live URL target:** https://clinical.dev
**Built at:** Claude Build Day, San Francisco — June 13, 2026

---

## Problem Statement

Clinical trials cost $2.6 billion on average to develop and fail 90% of the time. A large share of failures trace to design decisions made before the first patient is enrolled — wrong endpoint, wrong population, wrong composite, insufficient statistical power for the actual effect size.

The 2026 NHS Galleri MCED trial is the canonical case: it missed its primary endpoint not because the technology failed, but because it tested a composite endpoint (Stage III/IV reduction across ALL cancers) in a general screening population where positive predictive value was too low due to low prevalence. A pre-specified subgroup of 12 high-mortality cancers DID show substantial Stage IV reduction. Peter Attia: "A failed endpoint is not a failed technology." The trial asked the wrong question.

TrialMind applies the autoresearch principle — as articulated by Andrej Karpathy's AutoResearch framework — to clinical trial design. AI doesn't just generate a protocol template. It questions whether the research question itself is correct, synthesizes prior evidence, generates a design, adversarially critiques it, and iterates.

This was originally conceived and co-authored by Luke Stewart (CEO, Adaptic Health) and Dr. Charlie Barr (CMO, Adaptic Health) in their March 2026 article "The Grail Trial Didn't Fail. It Asked the Wrong Question."

---

## Official Build Day Scoring Strategy

Build Day judging weights:

| Criterion | Weight | TrialMind strategy |
|---|---:|---|
| Impact | 35% | Make the cost of asking the wrong trial question obvious in the first 20 seconds: one design error can burn tens of millions before the first patient benefits. |
| Demo | 35% | Optimize the live run around the NHS Galleri preset: flawed hypothesis in, hidden assumption exposed, quantified failure mechanism, revised adaptive design out. |
| Opus 4.8 Use | 15% | Use Opus for the part that actually needs frontier judgment: cross-domain trial design reasoning across epidemiology, biostatistics, prior evidence, and adversarial critique. |
| Orchestration | 15% | Make the run auditable: curated evidence packets, live candidate lookup, streaming thinking/text separation, critic/auditor passes, deterministic rubric checks, and an "Is this real?" proof panel. |

The app should be demoed as a **trial-question audit run**, not a clinical chatbot:

```
hypothesis -> evidence packet -> candidate evidence scan -> statistical failure mode -> adversarial critique -> revised trial design -> proof panel
```

The three presets demonstrate breadth, but the NHS Galleri run is the winning moment. Every implementation choice should protect that 90-second story.

---

## What "Done" Looks Like

1. Running Next.js app at localhost:3000
2. NHS Galleri preset produces the strongest end-to-end demo: original question -> hidden assumption -> PPV/power issue -> revised adaptive design
3. The other two presets work end-to-end as proof the system generalizes beyond one hand-tuned example
4. Lightweight live lookup fetches capped PubMed and ClinicalTrials.gov candidate evidence for custom hypotheses
5. Claude Opus 4.8 extended thinking streams visibly in the UI
6. Each of the 6 autoresearch sections renders as streaming output completes
7. "Is this real?" proof panel appears with evidence references, assumptions, quantified checks, and unresolved uncertainty
8. Rubric self-check appears at the bottom of each completed analysis
9. Deterministic rubric parser independently verifies the model's self-grade where possible
10. App deploys to Vercel with a single `vercel --prod` command
11. README.md contains the full submission brief and 90-second demo script
12. `rubric.md` is in the repo root and Opus 4.8 grades its own output against it
13. A clearly labeled cached demo stream exists as a fallback if live API/network latency threatens the presentation

---

## Rubric (rubric.md — also save as a separate file)

A valid trial design analysis MUST satisfy ALL of the following criteria. Opus 4.8 grades itself against this at the end of each run, and `app/lib/rubric.ts` performs deterministic checks against the completed text:

- [ ] The research question is explicitly restated and audited for hidden assumptions
- [ ] At least 2 prior related trials or studies are referenced by name
- [ ] The target population is specifically defined with inclusion/exclusion logic
- [ ] Statistical power or positive predictive value (PPV) is addressed quantitatively or semi-quantitatively
- [ ] At least 2 specific failure modes are identified with their mechanism
- [ ] A revised or adaptive design is provided that directly addresses the identified risks
- [ ] The output explains WHY the revised design improves on the original hypothesis

**Score:** Pass (7/7) | Partial (4-6/7) | Fail (<4/7)

The UI must distinguish:
- **Model self-grade:** what Opus says about its own output
- **Deterministic check:** what the local parser can verify from visible text
- **Open uncertainty:** what needs expert or source review before a real clinical decision

---

## Tech Stack

- **Framework:** Next.js 14 App Router (TypeScript)
- **Styling:** Tailwind CSS
- **AI:** `@anthropic-ai/sdk` — model `claude-opus-4-8`, streaming enabled, extended thinking enabled
- **Evidence lookup:** ClinicalTrials.gov API v2 plus NCBI E-utilities metadata lookup, read-only and capped
- **Deploy:** Vercel (zero-config)
- **No database** — fully stateless, each request is independent

---

## File Structure

```
trialmind/
  package.json
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  next.config.js
  .env.example
  .env.local            (user creates — add ANTHROPIC_API_KEY; optional NCBI_TOOL/NCBI_EMAIL)
  rubric.md
  DEMO_SCRIPT.md
  README.md
  app/
    layout.tsx
    page.tsx
    globals.css
    lib/
      presets.ts
      rubric.ts          (deterministic rubric parser)
      demoFixtures.ts    (clearly labeled cached fallback stream)
      evidence.ts        (loads curated evidence packets)
      lookup.ts          (normalizes live lookup terms and merges candidates)
      clinicalTrials.ts  (ClinicalTrials.gov API v2 metadata adapter)
      pubmed.ts          (NCBI E-utilities ESearch/ESummary metadata adapter)
    api/
      analyze/
        route.ts        (streaming API route — core logic)
  components/
    PresetButtons.tsx
    StageRail.tsx
    EvidenceLookupRail.tsx
    ThinkingStream.tsx
    TrialOutput.tsx
    QuestionDiff.tsx
    RubricCheck.tsx
    ProofPanel.tsx
  evidence/
    galleri.json
    cancer-survivor-mced.json
    post-chemo-fatigue.json
```

---

## Orchestration Architecture

The winning version is more than a single prompt. Each run has six visible stages:

1. **Run Spec:** Normalize the user's hypothesis into a bounded trial-question audit request.
2. **Evidence Packet:** Attach curated facts for the selected preset, including trial names, baseline rates, known endpoint choices, and source notes.
3. **Candidate Lookup:** When enabled, fetch capped metadata from PubMed and ClinicalTrials.gov, then label it as candidate evidence rather than verified ground truth.
4. **Opus Autoresearch Pass:** Stream Opus 4.8 extended thinking and final text through the six-section system prompt.
5. **Critic/Auditor Pass:** Ask Opus to review the completed answer for unsupported claims, statistical hand-waving, and hidden clinical assumptions.
6. **Deterministic Verification:** Parse the final markdown for required sections, named studies, numeric/statistical language, checkboxes, and rubric score.

The UI should make these stages feel like accountable work, not a chat transcript. The key demo question is: **"Is the work real?"** The answer is shown through evidence links, quantified assumptions, rubric checks, and explicit caveats.

### Lightweight Lookup Contract

Lookup exists to answer the judge objection, "Is this just a cached run for one study?" It must be useful and visibly live, but tightly bounded.

- ClinicalTrials.gov: call `GET https://clinicaltrials.gov/api/v2/studies` with `query.term`, optional `query.cond` / `query.intr`, `fields`, and `pageSize`.
- PubMed: call NCBI E-utilities `ESearch` to find PMIDs, then `ESummary` to retrieve citation metadata.
- Cap results at 3 trial records and 3 publication records.
- Keep only metadata in the app: title, ID, source, status/year, phase where available, and short relevance reason.
- Do not fetch full articles or present this as a systematic review.
- If lookup times out, fails, or returns weak matches, continue with curated evidence and emit an explicit `lookup_unavailable` or `lookup_low_relevance` event.
- Use optional `.env.local` fields `NCBI_TOOL=TrialMind` and `NCBI_EMAIL=<contact email>` for compliant NCBI requests.

---

## System Prompt for Every API Call

```
You are a clinical trial design expert applying the autoresearch principle to study design. Your role is not to generate protocol templates — it is to question whether the research question itself is the right one before any trial begins.

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

At the very end, grade your output against the rubric criteria (list them as checkboxes) and state your score.
```

---

## Three Presets

Each preset has:
- `label`
- `hypothesis`
- `demoPriority` (`primary` for NHS Galleri, `secondary` for the other two)
- `evidencePacketPath`
- `expectedFailureMode`
- `backupFixturePath` for the cached demo fallback

**Preset 1 — "NHS Galleri Trial (Historical Failure)"**
```
A multi-cancer early detection blood test (Galleri/Grail) reduces the combined incidence of Stage III and Stage IV cancer diagnoses across all cancer types in adults aged 50-77 in a general NHS screening population of 142,000 participants.
```

Expected demo arc:
1. The original question looks plausible and ambitious.
2. Opus identifies the hidden assumption: pooled all-cancer stage-shift is the right endpoint in a general screening population.
3. It explains why low prevalence weakens PPV and statistical signal for a broad composite.
4. It contrasts the broad endpoint with a targeted high-mortality cancer strategy.
5. It produces a revised adaptive/enrichment design.

**Preset 2 — "Cancer Survivor MCED (Right Question)"**
```
A methylation-based multi-cancer early detection test improves early-stage cancer detection outcomes in cancer survivors with established risk factors compared to standard surveillance alone, specifically targeting 12 high-mortality cancer types including pancreatic, ovarian, liver, and lung cancer.
```

**Preset 3 — "Post-Chemo Fatigue Intervention"**
```
Low-dose naltrexone (4.5mg daily) reduces cancer-related fatigue severity scores by 30% or more in breast cancer survivors 6 to 24 months post-chemotherapy completion compared to placebo in a 12-week randomized controlled trial.
```

---

## API Route Pattern (app/api/analyze/route.ts)

The route must:
1. Accept POST with `{ hypothesis: string }` body
2. Accept optional `{ presetId: string }` to attach the matching evidence packet
3. Accept optional `{ lookupEnabled: boolean }` to run lightweight PubMed and ClinicalTrials.gov metadata lookup
4. Emit lookup stage events before the Opus call so the UI can show live candidate evidence
5. Call Anthropic SDK with streaming + extended thinking
6. Return a ReadableStream (Server-Sent Events or newline-delimited JSON)
7. Stream lookup, thinking, text, proof, rubric, and error events separately so the UI can show accountable stages
8. Run the deterministic rubric parser after stream completion and emit a final `verification` event
9. If the live API fails during demo mode, serve the clearly labeled cached fixture rather than silently pretending it is live

Key SDK call pattern:
```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-opus-4-8',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000
  },
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: hypothesis }]
});
```

The user message should contain a structured run packet, not just raw text: normalized hypothesis, selected preset metadata, curated evidence packet, live candidate evidence, and explicit caveats.

Stream event handling must explicitly support:
- Lookup start -> emit `{ type: "lookup_start", queryTerms }`
- Lookup candidate -> emit `{ type: "lookup_candidate", candidate }`
- Lookup completion -> emit `{ type: "lookup_done", counts, warnings }`
- Lookup failure/timeout -> emit `{ type: "lookup_unavailable", reason }` and continue if curated evidence exists
- `content_block_delta` with `delta.type === "thinking_delta"` -> emit `{ type: "thinking", text }`
- `content_block_delta` with `delta.type === "text_delta"` -> emit `{ type: "text", text }`
- `content_block_delta` with `delta.type === "signature_delta"` -> retain signature metadata without rendering it as reasoning
- `message_delta` / `message_stop` -> finalize parsing and rubric verification
- API errors -> emit `{ type: "error", message, fallbackAvailable }`

If `claude-opus-4-8` returns a model-not-found error, fall back to `claude-opus-4-6` and log a warning.

---

## UI Requirements (app/page.tsx)

**Theme:** Modern clinical command center. Use a light, high-contrast base with graphite text, crisp white surfaces, teal for evidence, amber for uncertainty, and coral for critical failure modes. The app should feel approachable and demo-worthy, not like a generic dark AI console.

First screen must be the working product, not a landing page. The judge should see a research question moving through evidence, critique, revision, and verification.

**Primary layout:**
- Header row: "TrialMind" wordmark, tagline "Before you spend $100M, ask the right question.", live/cached status chip
- Left column: Research Question Console
  - Textarea: "Enter your research hypothesis..." (6+ rows)
  - Three preset chips with short labels and priority badges
  - Toggle: "Live evidence scan" (on by default, disabled for cached fallback)
  - Button: "Audit Question" (disabled while streaming, shows spinner)
- Center column: Run Workspace
  - StageRail with Run Spec -> Evidence Scan -> Opus Reasoning -> Critique -> Verification
  - EvidenceLookupRail showing PubMed and ClinicalTrials.gov candidates as compact rows with source, ID, title, and relevance badge
  - Main output panel with section anchors for the 6 autoresearch sections
  - Collapsible "Opus 4.8 reasoning" stream in a controlled, muted panel
- Right column or lower band: Product Payoff
  - QuestionDiff comparing original question vs revised question, highlighting endpoint/population changes
  - "Is this real?" ProofPanel with curated evidence, candidate evidence used, assumptions, quantified checks, unsupported-claim warnings, and unresolved uncertainty
  - RubricCheck showing model self-grade beside deterministic verification

**Motion and visual behavior:**
- Evidence candidates stream in before the model answer begins.
- StageRail advances as route events arrive.
- QuestionDiff appears when Adaptive Revision is detected.
- ProofPanel uses verification icons and warning colors rather than large text explanations.
- Keep repeated cards to 8px radius or less. Avoid nested cards.

**Avoid:**
- Landing-page hero copy
- Marketing cards explaining the whole product
- Decorative medical imagery
- Dense walls of model output without section anchors
- One-note dark dashboard styling
- Claiming the evidence scan is a literature review

---

## 90-Second Demo Script (DEMO_SCRIPT.md)

**0-10s — Hook**
"Clinical trials do not usually fail on launch day. They fail months earlier, when someone asks the wrong research question. TrialMind audits the question before the first patient is enrolled."

**10-25s — Input**
Click "NHS Galleri Trial (Historical Failure)".
"This is the kind of hypothesis that sounds reasonable: can a multi-cancer blood test reduce late-stage cancers across all cancers in a general NHS screening population?"

**25-55s — Opus reasoning**
Point to the streaming reasoning and the six sections as they populate.
"Opus is not filling in a protocol template. It is auditing the assumption: is an all-cancer composite endpoint the right question for a low-prevalence screening population?"

**55-75s — Payoff**
Point to Population Analysis, Adversarial Critique, and Adaptive Revision.
"The failure mode is statistical and clinical: low prevalence weakens PPV and dilutes signal across a broad composite. The revised design enriches for a higher-risk population and focuses on cancers where stage shift is biologically and statistically more plausible."

**75-90s — Proof**
Point to the "Is this real?" panel and rubric.
"This is why the app is not just a chat UI. It shows the evidence packet, the assumptions, the deterministic rubric checks, and what still needs expert review. The output is useful, but also accountable."

Backup line if live streaming is slow:
"For demo reliability, this is a cached run from the same prompt and evidence packet, clearly labeled as cached. The live path is the same stream."

---

## README.md (Submission Brief)

```markdown
# TrialMind
**Before you spend $100M, ask the right question.**

Live: https://clinical.dev

## The Problem
Clinical trials cost $2.6B on average and fail 90% of the time. Most failures trace to design decisions made before the first patient is enrolled. The 2026 NHS Galleri MCED trial is the canonical example: it missed its primary endpoint not because the technology failed, but because it tested the wrong composite endpoint in a general low-prevalence population.

## What TrialMind Does
Input a research hypothesis in plain English. TrialMind turns it into a bounded trial-question audit run: hypothesis -> evidence packet -> live candidate evidence scan -> statistical failure mode -> adversarial critique -> revised adaptive design -> proof panel. Claude Opus 4.8 runs the autoresearch loop while extended thinking streams live so you can watch the model reason through the problem.

## Why This Matters
This is a tool for any research team — academic, biotech, small pharma — that doesn't have a full protocol design team. Before spending $50M on a trial, spend 5 minutes stress-testing the question.

## How It Uses Claude Opus 4.8
Extended thinking is enabled on every request. Opus 4.8 is used for the work that requires frontier judgment: reasoning across epidemiology, biostatistics, prior evidence, trial operations, and adversarial critique. The thinking stream is visible, while final claims are checked against rubric and evidence signals.

## Orchestration
- `rubric.md` in this repo defines 7 grading criteria
- Curated evidence packets ground each preset
- Lightweight PubMed and ClinicalTrials.gov lookup adds capped live candidate evidence for custom hypotheses
- Opus 4.8 grades its own output on every run
- A deterministic parser independently checks visible rubric criteria
- An "Is this real?" panel separates evidence, assumptions, warnings, and uncertainty
- A cached fallback stream protects the live demo without misrepresenting it as live
- Fully stateless — another team can run this on any hypothesis tomorrow

## Official Scoring Alignment
| Criterion | Approach |
|-----------|----------|
| Impact (35%) | Trial design failures cost billions globally. The demo shows how a single wrong endpoint/population choice can waste a trial before enrollment begins. |
| Demo (35%) | Click the NHS Galleri preset and watch the app expose the hidden assumption, quantify the failure mode, and produce a revised adaptive design. |
| Opus 4.8 Use (15%) | Extended thinking on multi-step scientific reasoning where frontier judgment matters: clinical context, statistics, endpoint logic, and adversarial critique. |
| Orchestration (15%) | Evidence packets, live candidate lookup, critic/auditor pass, deterministic rubric parser, proof panel, cached fallback, stateless repeatability. |

## Demo Script
See `DEMO_SCRIPT.md`. The live run is optimized for a 90-second judge walkthrough: hook, NHS Galleri input, visible Opus reasoning, adaptive-design payoff, proof panel.

## Run Locally
\`\`\`bash
git clone <repo>
cd trialmind
npm install
cp .env.example .env.local
# add ANTHROPIC_API_KEY to .env.local
# optional for NCBI E-utilities metadata lookup:
# NCBI_TOOL=TrialMind
# NCBI_EMAIL=you@example.com
npm run dev
\`\`\`

## Built At
Claude Build Day, San Francisco — June 13, 2026
By Luke Stewart, Adaptic Health / CaringHand
Intellectual grounding: "The Grail Trial Didn't Fail. It Asked the Wrong Question." (Luke Stewart + Dr. Charlie Barr, 2026)
```

---

## Deploy Instructions

```bash
# 1. Install Vercel CLI if needed
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variable in Vercel dashboard
# ANTHROPIC_API_KEY = your key
# NCBI_TOOL = TrialMind
# NCBI_EMAIL = contact email for E-utilities requests

# 4. DNS: Point clinical.dev to Vercel
# In your DNS registrar, add:
# Type: CNAME
# Name: @ (or www)
# Value: cname.vercel-dns.com
# TTL: 300

# Or add an A record to Vercel's IP if CNAME on apex isn't supported
```

---

## Session Log

Claude Code saves session logs automatically to `.claude/` in the project directory. After the build, export the session log for the submission:

```bash
# Find the session log
ls -la .claude/

# The main session file is typically:
# .claude/projects/<project-id>/session-*.jsonl
```

Include the session log path in your submission.

---

## Intellectual Background

This tool is grounded in:

1. **The Galleri case (Luke Stewart + Dr. Charlie Barr, 2026):** "The Grail Trial Didn't Fail. It Asked the Wrong Question." — The NHS Galleri trial missed its composite endpoint not because the technology failed, but because the study design chose the wrong question for the wrong population.

2. **Karpathy's AutoResearch (March 2026):** An open-source framework for AI agents that autonomously run research experiments. TrialMind applies the same closed-loop principle to trial design: hypothesis → evidence → design → critique → revision.

3. **Adaptive enrichment designs:** Population enrichment, basket trials (Lung-MAP), and platform trials all share the same logic — test targeted hypotheses in defined subgroups rather than composite endpoints in general populations.

4. **Adaptic Health origin:** "At Adaptic Health, our origin was in applying simulation and AI to clinical trial design." (Stewart + Barr, 2026)
