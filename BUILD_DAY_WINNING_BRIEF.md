# TrialMind — Build Day Winning Brief

**Owner:** Luke Stewart  
**Event:** Claude Build Day, San Francisco  
**Date:** 2026-06-13  
**Purpose:** Convert the TrialMind concept into a judged, demo-ready build strategy.

---

## One-Sentence Pitch

TrialMind audits the research question before a clinical trial begins, using Claude Opus 4.8 to expose hidden assumptions, quantify failure modes, and produce a revised trial design with proof attached.

---

## Official Scoring Strategy

| Criterion | Weight | What Must Land |
|---|---:|---|
| Impact | 35% | The judge should immediately understand that one wrong endpoint, population, or composite can waste tens of millions before the first patient benefits. |
| Demo | 35% | The NHS Galleri preset must produce a crisp before/after: plausible hypothesis -> hidden assumption -> PPV/power failure mode -> adaptive revised design. |
| Opus 4.8 Use | 15% | Opus must be used for expert judgment, not generic summarization: epidemiology, biostatistics, trial operations, evidence synthesis, and adversarial critique. |
| Orchestration | 15% | The app must show accountable work: evidence packets, live candidate lookup, streaming reasoning, critic/auditor pass, deterministic rubric checks, and an "Is this real?" proof panel. |

Build for the score. Extra features only matter if they improve one of these four rows.

---

## Product Frame

Do not position TrialMind as a clinical chatbot or protocol generator. Position it as a **trial-question audit run**:

```text
hypothesis -> evidence packet -> candidate evidence scan -> statistical failure mode -> adversarial critique -> revised trial design -> proof panel
```

The emotional hook:

> Clinical trials do not usually fail on launch day. They fail months earlier, when someone asks the wrong research question.

---

## Demo Priority

### Primary Demo: NHS Galleri

The NHS Galleri preset is the winning moment. It should be rehearsed and protected.

Expected arc:

1. The hypothesis sounds plausible.
2. Opus identifies the hidden assumption: pooled all-cancer stage shift is the right endpoint in a general screening population.
3. Opus explains the mechanism: low prevalence weakens PPV and dilutes statistical signal across a broad composite.
4. Opus contrasts broad all-cancer screening with a targeted high-mortality cancer strategy.
5. Opus proposes an adaptive or enrichment design.
6. The proof panel shows evidence references, assumptions, quantified checks, and unresolved uncertainty.

### Secondary Presets

Use these only if time allows or a judge asks whether the system generalizes:

- Cancer Survivor MCED: proves the same reasoning can find a better target population.
- Post-Chemo Fatigue Intervention: proves TrialMind is not only an MCED demo.

---

## 90-Second Judge Script

**0-10s — Hook**  
"Clinical trials do not usually fail on launch day. They fail months earlier, when someone asks the wrong research question. TrialMind audits the question before the first patient is enrolled."

**10-25s — Input**  
Click "NHS Galleri Trial (Historical Failure)."  
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

> For demo reliability, this is a cached run from the same prompt and evidence packet, clearly labeled as cached. The live path is the same stream.

---

## Must-Have Build Scope

| Feature | Why It Cannot Be Cut | Risk | Notes |
|---|---|---|---|
| Next.js app with one strong product-arc workflow | Required for demo clarity | Low | Question console, evidence scan rail, question diff, proof panel. |
| NHS Galleri preset | Core winning moment | Medium | Must produce specific, non-generic analysis. |
| Opus 4.8 streaming with thinking/text separation | Required for Opus scoring | Medium | Handle `thinking_delta`, `text_delta`, and `signature_delta`. |
| Six-section autoresearch output | Makes the reasoning legible | Low | Use exact headers for parsing. |
| Evidence packet for NHS Galleri | Prevents prompt-wrapper optics | Medium | Keep small, source-backed, and curated. |
| Lightweight live lookup | Proves this is generalizable beyond one cached case | Medium | Fetch capped PubMed and ClinicalTrials.gov candidates; never market it as full literature review. |
| "Is this real?" proof panel | Converts output into accountable work | Medium | Show evidence, assumptions, warnings, uncertainty. |
| Rubric self-grade plus deterministic parser | Protects against completion theater | Medium | Parser can be simple but visible. |
| Cached demo fallback | Protects live presentation | Low | Must be clearly labeled as cached. |
| README and demo script | Helps submission and judge review | Low | Copy from this doc. |

---

## Should-Have Scope

| Feature | Why It Helps | Trigger |
|---|---|---|
| Evidence packets for all three presets | Shows generality | Add after NHS Galleri works end-to-end. |
| Critic/auditor second pass | Strengthens orchestration score | Add if live API latency remains acceptable. |
| Export/copy analysis button | Useful artifact for judges | Add only after proof panel works. |
| Polished secondary preset visuals | Shows breadth without distracting from Galleri | Add only after the primary run rehearses cleanly. |

---

## Cut Line

Do not build:

- User accounts
- Database persistence
- Uploads
- Full systematic literature review
- Full-text article ingestion
- Paywalled or account-gated literature sources
- Real clinical recommendation workflow
- Collaboration features
- Admin dashboard
- Complex visualization beyond the evidence rail, question diff, and proof panel

These are impressive-sounding but do not improve the 90-second judging path enough for Build Day.

---

## Orchestration Requirements

Each run should make the work look managed, not merely answered:

1. **Run Spec:** Normalize the input hypothesis and selected preset.
2. **Evidence Packet:** Attach curated facts for the selected preset.
3. **Candidate Lookup:** If enabled, fetch a small set of live PubMed and ClinicalTrials.gov candidates and convert them into a bounded evidence candidate list.
4. **Opus Autoresearch Pass:** Stream thinking and final text.
5. **Critic/Auditor Pass:** Flag unsupported claims, statistical hand-waving, hidden assumptions, and missing caveats.
6. **Deterministic Verification:** Parse the completed markdown for sections, named studies, numeric/statistical language, checkbox score, and rubric status.

If time is tight, implement steps 1, 2, 4, and 6 first. Candidate lookup is the first generality upgrade; the critic/auditor pass is valuable, but the demo can still work without it if the proof panel is strong.

---

## Evidence Packet Shape

Use small JSON files, not a database.

```json
{
  "id": "galleri",
  "label": "NHS Galleri Trial",
  "sources": [
    {
      "name": "NHS-Galleri trial",
      "type": "trial",
      "note": "Use for endpoint, population, and high-level design facts."
    }
  ],
  "knownFacts": [
    "Adults aged 50-77 in a general NHS screening population",
    "Broad late-stage cancer endpoint across cancer types",
    "Concern: low-prevalence screening weakens positive predictive value"
  ],
  "demoCaveats": [
    "Do not present inferred subgroup strategy as a verified clinical recommendation.",
    "Label any unsupported numeric claim as an estimate or assumption."
  ]
}
```

The evidence packet is not there to be exhaustive. It is there to make the run accountable.

---

## Lightweight Lookup Scope

Lookup should make TrialMind feel real and generalizable without taking on full evidence synthesis.

Use two public, read-only sources:

- **ClinicalTrials.gov API v2:** `GET /studies` with `query.term`, optional `query.cond`, `query.intr`, `fields`, and `pageSize`. Source: <https://clinicaltrials.gov/api/v2/studies>
- **NCBI E-utilities for PubMed:** `ESearch` to find PMIDs, then `ESummary` to fetch citation metadata. Source: <https://eutils.ncbi.nlm.nih.gov/entrez/eutils/>

The lookup contract:

1. Derive 3-6 search terms from the hypothesis: condition, intervention, population, endpoint, comparator where possible.
2. Query ClinicalTrials.gov and PubMed in parallel with a 2-4 second timeout.
3. Cap results at 3 trials and 3 publications.
4. Store only candidate metadata: title, registry ID or PMID, source, year/status, phase if available, and a one-line relevance reason.
5. Ask Opus to classify each candidate as `use`, `background`, or `ignore`.
6. Treat live lookup as candidate evidence, not verified ground truth.
7. If lookup times out or returns irrelevant results, continue with the curated evidence packet and mark lookup as unavailable or low relevance.

Do not fetch full articles, quote abstracts at length, or imply that the app has completed a systematic review. The UI should call this "Live evidence scan" or "Candidate evidence," not "literature review."

Suggested candidate shape:

```json
{
  "source": "clinicaltrials.gov",
  "id": "NCT00000000",
  "title": "Short public title",
  "status": "RECRUITING",
  "phase": "PHASE2",
  "signals": ["condition match", "endpoint overlap"],
  "relevance": "candidate"
}
```

This is the answer to the "is this cached for one study?" objection. The NHS Galleri preset is the rehearsed demo, but a custom hypothesis can still produce a fresh evidence scan and a new audit run.

---

## UI Direction

Tone: modern clinical command center, approachable enough for founders and judges, rigorous enough for researchers.

The first screen should be the product, not a landing page. The judge should immediately see a hypothesis becoming an accountable research audit.

Visual product arc:

1. **Research Question Console:** left-side hypothesis composer with preset chips and a focused "Audit Question" action.
2. **Evidence Scan Rail:** compact live rail showing PubMed and ClinicalTrials.gov candidates as they arrive, with source icons, IDs, and relevance badges.
3. **Opus 4.8 Reasoning Stream:** visible but controlled reasoning panel that proves serious model work without overwhelming the user.
4. **Question Diff:** a high-payoff card showing `Original question` vs `Revised question` with highlighted endpoint/population changes.
5. **Proof Panel:** final accountability layer with evidence used, assumptions, deterministic checks, warnings, and unresolved uncertainty.

Required first-screen elements:

- TrialMind title and tagline
- Hypothesis input
- Preset buttons
- Audit Question button
- Run-stage progress rail
- Live evidence scan rail
- Streaming reasoning panel
- Main markdown output panel with section anchors
- Original vs revised question diff
- Proof panel after completion

Visual language:

- Use a light, high-contrast base with graphite text, crisp white surfaces, teal for evidence, amber for uncertainty, and coral for critical failure modes.
- Use restrained motion: evidence chips stream in, stage rail advances, and diff highlights appear when the revised question lands.
- Use icons for scan, evidence, warning, verification, and export actions.
- Keep repeated cards to 8px radius or less. Avoid nested cards.
- Make the NHS Galleri run feel like a story: plausible question -> hidden assumption -> failure mechanism -> revised design -> proof.

Avoid:

- Landing-page hero copy
- Marketing cards explaining the whole product
- Decorative medical imagery
- Dense walls of model output without section anchors
- One-note dark dashboard styling that makes the app feel like a generic AI console

The judge should understand the product by watching one run.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Output sounds generic | Medium | High | Ground NHS Galleri in a curated evidence packet and expected failure mode. |
| Live API latency hurts demo | Medium | High | Add cached fallback stream, clearly labeled. |
| Lookup returns weak or irrelevant candidates | Medium | Medium | Cap results, label candidates by relevance, and let curated evidence carry the preset. |
| Lookup scope expands into literature-review product | High | High | Metadata only, capped results, no full-text ingestion, no systematic-review claims. |
| Thinking stream handling breaks | Medium | Medium | Explicitly handle SDK delta types and degrade to final text if needed. |
| Judges see it as a prompt wrapper | Medium | High | Show proof panel, deterministic parser, and evidence packet. |
| Clinical claims overreach | Medium | High | Include caveats and "needs expert review" uncertainty section. |
| Too much scope | High | High | Protect NHS Galleri path first; add secondary presets only after core run works. |

---

## Build Order

1. Scaffold Next.js app and static UI.
2. Implement the product-arc UI: question console, stage rail, evidence scan rail, output, question diff, proof panel.
3. Implement presets and NHS Galleri evidence packet.
4. Implement lightweight lookup adapters for ClinicalTrials.gov and PubMed metadata.
5. Implement `/api/analyze` streaming with Opus 4.8.
6. Render lookup, thinking, and text streams as separate accountable stages.
7. Parse six sections and rubric checkboxes.
8. Add deterministic rubric parser.
9. Add cached fallback stream.
10. Add README and demo script.
11. Deploy to Vercel and rehearse the 90-second NHS Galleri run.

---

## Final Bar

The winning demo should answer three judge questions without explanation:

1. **Why does this matter?** Because wrong trial questions waste enormous money and patient time.
2. **Why Opus 4.8?** Because the hard part is careful cross-domain judgment, not text generation.
3. **Why is this real?** Because the app shows evidence, assumptions, deterministic checks, and uncertainty instead of asking the judge to trust a polished answer.
