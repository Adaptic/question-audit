import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  {
    id: "galleri",
    label: "NHS Galleri Trial (Historical Failure)",
    shortLabel: "NHS Galleri",
    hypothesis:
      "A multi-cancer early detection blood test (Galleri/Grail) reduces the combined incidence of Stage III and Stage IV cancer diagnoses across all cancer types in adults aged 50-77 in a general NHS screening population of 142,000 participants.",
    demoPriority: "primary",
    evidencePacketId: "galleri",
    expectedFailureMode:
      "A pooled all-cancer composite late-stage endpoint in a low-prevalence general screening population dilutes the per-cancer stage-shift signal and depresses realized positive predictive value, so the trial is underpowered to detect the real effect it was built to find.",
    lookup: {
      condition: "cancer",
      intervention: "multi-cancer early detection",
      terms: [
        "multi-cancer early detection",
        "MCED screening",
        "circulating tumor DNA screening",
        "cancer stage shift screening",
      ],
    },
    backupFixtureId: "galleri",
  },
  {
    id: "cancer-survivor-mced",
    label: "Cancer Survivor MCED (Right Question)",
    shortLabel: "Survivor MCED",
    hypothesis:
      "A methylation-based multi-cancer early detection test improves early-stage cancer detection outcomes in cancer survivors with established risk factors compared to standard surveillance alone, specifically targeting 12 high-mortality cancer types including pancreatic, ovarian, liver, and lung cancer.",
    demoPriority: "secondary",
    evidencePacketId: "cancer-survivor-mced",
    expectedFailureMode:
      "Without careful handling of lead-time / length-time bias and a clear distinction between recurrence, second primary, and de novo cancer, an apparent detection benefit in survivors can be a measurement artifact rather than a true outcome improvement.",
    lookup: {
      condition: "cancer survivors",
      intervention: "multi-cancer early detection methylation",
      terms: [
        "cancer survivor surveillance",
        "second primary cancer detection",
        "methylation multi-cancer early detection",
        "high mortality cancer screening",
      ],
    },
    backupFixtureId: "cancer-survivor-mced",
  },
  {
    id: "post-chemo-fatigue",
    label: "Post-Chemo Fatigue Intervention",
    shortLabel: "LDN Fatigue",
    hypothesis:
      "Low-dose naltrexone (4.5mg daily) reduces cancer-related fatigue severity scores by 30% or more in breast cancer survivors 6 to 24 months post-chemotherapy completion compared to placebo in a 12-week randomized controlled trial.",
    demoPriority: "secondary",
    evidencePacketId: "post-chemo-fatigue",
    expectedFailureMode:
      "A 30% responder threshold over only 12 weeks ignores high placebo response on fatigue PROs and spontaneous post-chemo recovery, so the trial risks being underpowered or attributing natural improvement and placebo effect to the drug.",
    lookup: {
      condition: "cancer-related fatigue breast cancer",
      intervention: "low-dose naltrexone",
      terms: [
        "low-dose naltrexone fatigue",
        "cancer-related fatigue trial",
        "breast cancer survivor fatigue",
        "naltrexone randomized controlled trial",
      ],
    },
    backupFixtureId: "post-chemo-fatigue",
  },
];

export function getPreset(id?: string): Preset | undefined {
  if (!id) return undefined;
  return PRESETS.find((p) => p.id === id);
}
