# clinical.dev Question Audit — Judge Demo Script

**Live:** https://audit.clinical.dev

**Goal:** in 90 seconds, show how a plausible sounding trial question gets audited before protocol lock. The hidden assumption is exposed, the failure mode is quantified, a better question is produced, and proof is attached.

## Who's who (say this in one breath up front)

> "Picture the person about to greenlight a clinical trial. A biotech founder or chief medical officer who has the science but not a full protocol design team. They are weeks from locking the protocol and about to commit tens of millions of dollars. Their board wants to trust the design. Their biostatistician and oncologist will have to sign off. That founder is who this is for, and for the next ninety seconds, that founder is you."

The cast:

- **You = the founder / CMO** running the audit before protocol lock.
- **The board / investor** who needs proof the question is sound. They get the share link and the brief.
- **The reviewers** who sign off by role: biostatistician, oncologist, trial ops, patient advocate. They appear in Team Review.

The NHS Galleri preset is the rehearsed, protected path. Run it first. The headline moment is the **Trial Question Transformation** panel, which the run auto-focuses on completion. The long analysis is supporting detail.

## Before judges arrive (10 seconds of setup)

1. Open **audit.clinical.dev**. It loads as a dark cockpit.
2. Toggle **"Use cached demo run"** ON in the left panel. The status chip will read **Cached audit**. This makes the run instant and reliable, so the demo never waits on a live generation.
3. Have the **NHS Galleri** preset visible. Do not click Audit yet.

> The live path is real and on by default. Cached mode runs the exact same flow in about 5 seconds and is clearly labeled, so it is the safe choice in front of judges. If a judge asks, flip the toggle off and run it live.

---

### 0 to 10s — Hook (you are the founder)

> "I am about to spend 50 million dollars on a trial. Clinical trials cost about 2.6 billion on average and roughly 90 percent fail. Most of that failure starts before a single patient signs up, when someone asks the wrong research question. So before I lock anything, I audit the question."

### 10 to 22s — Input (the founder types the plan)

Click **NHS Galleri**, then **Audit Trial Question**.

> "Here is my plan, the kind that sounds completely reasonable. Can a blood test cut late-stage cancer across all cancers in a general screening population? This is the exact question that cost the real NHS Galleri trial its endpoint."

Point at the **stage rail** advancing (Run Spec, Evidence Scan, Reasoning trace, Critique, Verification), the **live evidence scan**, and the **reasoning trace**.

> "It is not filling in a template for me. It pulls real studies, reasons through my question, then argues against its own answer."

### 22 to 50s — The money moment (what the founder sees first)

The screen auto-scrolls to the **Trial Question Transformation**.

> "This is the one card I would take to my board. My wrong question on the left in red. The better question on the right. Why mine fails, and exactly what to change."

Drive the **Why the question fails** simulator. This is the hero.

> "And here is the part my biostatistician would draw on a whiteboard, except it is live. In my general population the positive predictive value is only 23 percent. Of 100 positive tests, just these few are real cancers. The rest are false alarms that would scare patients and burn budget."

Click **Enriched population** (or drag the slider).

> "Move to a higher risk group and it jumps. Same test, better question."

Click the **Endpoint dilution** tab.

> "And the second trap. A real 30 percent effect in a few cancers gets averaged below the detection line once I pool all twelve. Target the right cancers and the signal comes back."

### 50 to 75s — Prove it to the board

Point at the **"Is this real?"** panel.

> "My board will ask if this is just a confident guess. So every claim is tagged. Evidence it used, evidence it set aside, candidates it ignored as off topic, the assumptions it made, and what still needs a human expert."

Point at the **Rubric self-check**.

> "It grades itself against a seven point checklist, and our own code verifies that grade. Seven out of seven."

### 75 to 90s — Hand it to the team and the board

Point at **Team review**, then **Export Brief** and **Copy Share Link** in the header.

> "Now my biostatistician, oncologist, and patient advocate sign off right here by role. Then I export a one page brief for the board, or send a link that rebuilds this whole summary with no login. Five minutes here can save the trial that would have failed months from now."

---

### If a judge pushes (answer in the founder's voice)

- **"Is this just cached for one study?"** "Let me run my own question." Flip **Use cached demo run** off, type any hypothesis, and keep **Live evidence scan** on. Fresh PubMed and ClinicalTrials.gov candidates, a new audit. Live runs take about 60 to 90 seconds.
- **"Show me the evidence handling."** Scroll the proof panel to the Ignored row. "The scan pulled NCT07133269 and NCT05699785, but the model judged them off topic, so they never count as evidence."
- **"Can my board take it with them?"** Click **Copy Share Link**, open it in a new tab. The summary, simulator, proof, and team comments all rebuild from the URL.

### Backup line if anything stalls

> "For demo reliability this is a cached run from the same prompt and evidence packet, clearly labeled as cached. The live path is the same flow."

You can also force cached mode without the toggle by setting `TRIALMIND_DEMO_MODE=1` in `.env.local`, or by running with no `ANTHROPIC_API_KEY`. The status chip reads **Cached audit** and never pretends cached output is live.
