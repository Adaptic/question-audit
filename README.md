# clinical.dev — Question Audit
**Find the flaw before protocol lock.**

Live target: https://audit.clinical.dev

Question Audit by **clinical.dev** audits the *research question* behind a clinical trial before the first patient is enrolled, using Claude Opus 4.8 to expose hidden assumptions, quantify failure modes, and produce a revised adaptive design — with proof attached.

> Product surface is branded **clinical.dev Question Audit**. The model (Claude Opus 4.8) is discussed in this README and the demo/submission docs, but kept out of the product UI on purpose — judges and founders see a product, not a model output page.

## The Problem
Clinical trials cost ~$2.6B on average and fail ~90% of the time. Most failures trace to design decisions made before enrollment — wrong endpoint, wrong population, wrong composite, insufficient power for the real effect size. The 2026 NHS Galleri MCED trial is the canonical example: it missed its primary endpoint not because the technology failed, but because it tested a composite all-cancer late-stage endpoint in a general low-prevalence population, where positive predictive value was too low and the per-cancer signal was diluted. A pre-specified subgroup of 12 high-mortality cancers *did* show a stage shift. **A failed endpoint is not a failed technology — the trial asked the wrong question.**

## What Question Audit Does
Input a research hypothesis in plain English. Question Audit turns it into a bounded **trial-question audit run**:

```
hypothesis → evidence packet → live candidate evidence scan → statistical failure mode
          → adversarial critique → revised adaptive design → proof panel
```

The six-section autoresearch loop runs while a **reasoning trace streams live**, grounded in a curated evidence packet, a capped live PubMed / ClinicalTrials.gov scan, an adversarial critic pass, and a deterministic rubric check.

### Founder/investor layer
- **Trial Question Transformation** — the headline payoff: Wrong Question → Better Question, Why It Fails, What Changes, and an Evidence Confidence badge. The run auto-focuses here on completion; the long analysis is supporting detail.
- **Why the question fails** — an interactive 20-second explainer with two simulators: a **PPV / prevalence** dot grid (general vs enriched population) and an **endpoint dilution** bar model (broad composite vs targeted high-mortality panel).
- **Export Audit Brief** — one click downloads a clean Markdown brief (questions, failure mechanism, PPV + dilution explanations, evidence, assumptions, auditor warnings, rubric, team comments).
- **Copy Share Link** — encodes a compact executive summary, question diff, simulator settings, proof summary, and team comments into the URL hash. No backend; opening the link recreates the shared summary.
- **Team Review** — local role-based sign-off (Biostatistician, Oncologist, Trial Ops, Patient Advocate, Investor/Board). Comments flow into the export and the share link.

## Why This Matters
A tool for any research team — academic, biotech, small pharma — that doesn't have a full protocol design team. Before spending $50M on a trial, spend five minutes stress-testing the question.

## How It Uses Claude Opus 4.8
Extended thinking (adaptive, summarized) is enabled on every request. Opus 4.8 is used for the work that requires frontier judgment: reasoning across epidemiology, biostatistics, prior evidence, trial operations, and adversarial critique simultaneously. The thinking stream is visible; final claims are checked against rubric and evidence signals.

> Note: Opus 4.8 uses **adaptive thinking** (`thinking: {type: "adaptive", display: "summarized"}`). The older fixed `budget_tokens` extended-thinking parameter returns a 400 on this model — adaptive thinking with summarized display is the correct way to surface visible reasoning.

## Orchestration
- `rubric.md` defines 7 grading criteria
- Curated evidence packets (`evidence/*.json`) ground each preset
- Lightweight, capped PubMed + ClinicalTrials.gov lookup adds **live candidate evidence** for any hypothesis (metadata only — never a systematic review)
- A **critic/auditor pass** flags unsupported claims and hidden assumptions
- Opus 4.8 grades its own output; a **deterministic parser** (`app/lib/rubric.ts`) independently verifies what it can from the visible text
- An **"Is this real?"** panel separates evidence, assumptions, warnings, and open uncertainty
- A clearly-labeled **cached fallback** protects the live demo without misrepresenting it as live
- Fully stateless — every request is independent

## Architecture
- **Framework:** Next.js 14 App Router (TypeScript), Tailwind CSS
- **AI:** `@anthropic-ai/sdk`, model `claude-opus-4-8`, streaming + adaptive extended thinking
- **Streaming:** the API route emits newline-delimited JSON events (`lookup_*`, `thinking`, `text`, `critic`, `diff`, `proof`, `verification`, `stage`, `error`) the UI consumes to drive the stage rail, evidence rail, reasoning panel, output, question diff, proof panel, and rubric
- **Evidence lookup:** ClinicalTrials.gov API v2 + NCBI E-utilities (ESearch → ESummary), read-only, capped at 3 trials + 3 publications, timeout-safe
- **No database** — fully stateless

```
app/
  page.tsx              # product-arc UI + stream consumer
  api/analyze/route.ts  # streaming orchestration (core logic)
  lib/                  # presets, evidence, lookup, rubric, parse, fixtures, prompt
components/             # PresetButtons, StageRail, EvidenceLookupRail, ThinkingStream,
                        # TrialOutput, QuestionDiff, ProofPanel, RubricCheck
evidence/               # curated evidence packets (galleri / survivor / fatigue)
```

## Official Scoring Alignment
| Criterion | Approach |
|-----------|----------|
| Impact (35%) | The demo makes the cost of a wrong trial question obvious in the first 20 seconds — one endpoint/population choice can waste tens of millions before the first patient benefits. |
| Demo (35%) | Click NHS Galleri and watch the app expose the hidden assumption, quantify the PPV/power failure mode, and produce a revised adaptive design. |
| Opus 4.8 Use (15%) | Visible extended thinking on multi-step scientific reasoning where frontier judgment matters: clinical context, statistics, endpoint logic, adversarial critique. |
| Orchestration (15%) | Evidence packets, live candidate lookup, critic/auditor pass, deterministic rubric parser, proof panel, cached fallback, stateless repeatability. |

## Demo Script
See `DEMO_SCRIPT.md` — a 90-second judge walkthrough optimized around the NHS Galleri preset.

## Run Locally
```bash
git clone <repo>
cd trialmind
npm install
cp .env.example .env.local
# add ANTHROPIC_API_KEY to .env.local
# optional NCBI E-utilities metadata compliance:
#   NCBI_TOOL=TrialMind
#   NCBI_EMAIL=you@example.com
# optional cached-demo fallback:
#   TRIALMIND_DEMO_MODE=1
npm run dev
# open http://localhost:3000
```

If `ANTHROPIC_API_KEY` is absent (or `TRIALMIND_DEMO_MODE=1`), Question Audit serves a clearly-labeled cached run so the demo always works. (The `TRIALMIND_*` env var name is retained internally for compatibility; it is not shown in the product.)

## Deploy (Vercel)
```bash
npm i -g vercel
vercel --prod
# set ANTHROPIC_API_KEY (and optional NCBI_TOOL / NCBI_EMAIL) in the Vercel dashboard
```

## Built At
Claude Build Day, San Francisco — June 13, 2026
By Luke Stewart, Adaptic Health / CaringHand.
Intellectual grounding: "The Grail Trial Didn't Fail. It Asked the Wrong Question." (Luke Stewart + Dr. Charlie Barr, 2026).
