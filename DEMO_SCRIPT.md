# clinical.dev Question Audit — 90-Second Demo Script

**Goal:** show a judge how a plausible-sounding clinical trial hypothesis gets audited — hidden assumption exposed, failure mechanism quantified, revised adaptive design produced — with proof attached.

The NHS Galleri preset is the rehearsed, protected path. Run it first. The headline moment is the **Trial Question Transformation** panel (the run auto-focuses there on completion); the long analysis is supporting detail.

---

**0–10s — Hook**
> "Clinical trials do not usually fail on launch day. They fail months earlier, when someone asks the wrong research question. clinical.dev Question Audit finds the flaw before protocol lock."

**10–25s — Input**
Click **NHS Galleri Trial (Historical Failure)**, then **Audit Question**.
> "This is the kind of hypothesis that sounds reasonable: can a multi-cancer blood test reduce late-stage cancers across all cancers in a general NHS screening population?"

Point at the **Stage Rail** advancing (Run Spec → Evidence Scan → Opus Reasoning → Critique → Verification) and the **Live evidence scan** rail filling with PubMed and ClinicalTrials.gov candidates.

**25–55s — Opus reasoning**
Point to the streaming **Opus 4.8 reasoning** panel and the six sections populating in the output.
> "Opus is not filling in a protocol template. It is auditing the assumption: is an all-cancer composite endpoint the right question for a low-prevalence screening population?"

**55–75s — Payoff**
The screen auto-focuses on the **Trial Question Transformation**: Wrong Question → Better Question, Why It Fails, What Changes. Then point at the **Why the question fails** simulator.
> "Here's the whole story in one card. And here's the mechanism, live: in a general population the PPV is ~23% — most positive tests are false alarms. Drag to an enriched population and it jumps. Flip to endpoint dilution: a real 30% effect in a few cancers averages below the detection threshold once you pool all twelve. The revised design enriches the population and targets the high-mortality cancers."

**75–90s — Proof**
Point to the **"Is this real?"** panel and the **rubric self-check** (model self-grade beside the deterministic check).
> "This is why the app is not just a chat UI. It shows the evidence packet, the assumptions, the deterministic rubric checks, and what still needs expert review. The output is useful, but also accountable."

---

### Backup line if live streaming is slow
> "For demo reliability, this is a cached run from the same prompt and evidence packet, clearly labeled as cached. The live path is the same stream."

Force the cached path by setting `TRIALMIND_DEMO_MODE=1` in `.env.local` (or running without `ANTHROPIC_API_KEY`). The status chip turns amber and reads **Cached demo run** — never pretending cached output is live.

### Generality beat (if a judge asks "is this just one cached study?")
Type a fresh hypothesis with **Live evidence scan** on. The PubMed / ClinicalTrials.gov rail fetches real candidate metadata for the new question and the model runs a fresh audit — proving the system generalizes beyond the rehearsed preset.

### Artifact beat (founder/investor close)
- **Export Audit Brief** downloads a clean Markdown brief — the kind of one-pager a founder forwards to a board or a CRO.
- **Copy Share Link** puts the executive summary, question diff, simulator state, proof summary, and team comments into the URL. Open it in a fresh tab to show the shared summary recreate with no backend.
- **Team Review**: drop a Biostatistician and an Investor/Board comment, then re-export — the sign-off trail travels with the brief.
