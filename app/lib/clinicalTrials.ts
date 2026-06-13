import type { EvidenceCandidate } from "./types";

const BASE = "https://clinicaltrials.gov/api/v2/studies";

interface CTStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string };
    statusModule?: { overallStatus?: string };
    designModule?: { phases?: string[] };
    conditionsModule?: { conditions?: string[] };
  };
}

/**
 * ClinicalTrials.gov API v2 metadata lookup. Read-only, capped, metadata only.
 * Returns up to `limit` candidate records. Never throws — returns [] on any failure.
 */
export async function searchClinicalTrials(
  term: string,
  signal: AbortSignal,
  limit = 3,
): Promise<EvidenceCandidate[]> {
  const params = new URLSearchParams({
    "query.term": term,
    pageSize: String(limit),
    "fields":
      "NCTId,BriefTitle,OverallStatus,Phase,Condition",
    format: "json",
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { studies?: CTStudy[] };
    const studies = data.studies ?? [];

    return studies.slice(0, limit).map((s): EvidenceCandidate => {
      const id = s.protocolSection?.identificationModule?.nctId ?? "NCT?";
      const title =
        s.protocolSection?.identificationModule?.briefTitle ?? "(untitled study)";
      const status = s.protocolSection?.statusModule?.overallStatus;
      const phase = s.protocolSection?.designModule?.phases?.join("/");
      const conditions =
        s.protocolSection?.conditionsModule?.conditions ?? [];
      const signals = conditions.slice(0, 2).map((c) => `condition: ${c}`);
      return {
        source: "clinicaltrials.gov",
        id,
        title,
        status,
        phase: phase || undefined,
        url: id.startsWith("NCT") ? `https://clinicaltrials.gov/study/${id}` : undefined,
        signals: signals.length ? signals : ["term match"],
        relevance: "candidate",
      };
    });
  } catch {
    return [];
  }
}
