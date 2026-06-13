# TrialMind Rubric

A valid trial-question audit MUST satisfy ALL of the following criteria. Claude Opus 4.8 grades its own output against this at the end of every run, and `app/lib/rubric.ts` performs an **independent deterministic check** against the completed text.

- [ ] The research question is explicitly restated and audited for hidden assumptions
- [ ] At least 2 prior related trials or studies are referenced by name
- [ ] The target population is specifically defined with inclusion/exclusion logic
- [ ] Statistical power or positive predictive value (PPV) is addressed quantitatively or semi-quantitatively
- [ ] At least 2 specific failure modes are identified with their mechanism
- [ ] A revised or adaptive design is provided that directly addresses the identified risks
- [ ] The output explains WHY the revised design improves on the original hypothesis

**Score:** Pass (7/7) | Partial (4–6/7) | Fail (<4/7)

## Three-track accountability

The UI distinguishes three things on purpose:

1. **Model self-grade** — what Opus says about its own output (parsed from the `## Rubric Self-Check` checkbox block it writes).
2. **Deterministic check** — what the local parser in `app/lib/rubric.ts` can independently verify from the visible text (named studies via registry IDs + known-trial dictionary + "X trial/study" patterns, section presence, eligibility language, numeric/statistical content, failure-mode count, revision section).
3. **Open uncertainty** — what still needs expert or source review before any real clinical decision, surfaced in the "Is this real?" proof panel.

The deterministic parser is intentionally conservative: it can confirm structure and named-entity presence, but it does not claim to verify clinical correctness. That boundary is the point — TrialMind shows its work instead of asking you to trust a polished answer.
