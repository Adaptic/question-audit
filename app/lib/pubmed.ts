import type { EvidenceCandidate } from "./types";

const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

function compliance(): Record<string, string> {
  const out: Record<string, string> = {};
  if (process.env.NCBI_TOOL) out.tool = process.env.NCBI_TOOL;
  if (process.env.NCBI_EMAIL) out.email = process.env.NCBI_EMAIL;
  return out;
}

interface ESummaryDoc {
  uid?: string;
  title?: string;
  pubdate?: string;
  fulljournalname?: string;
  source?: string;
}

/**
 * PubMed lookup via NCBI E-utilities: ESearch -> ESummary. Metadata only, capped.
 * Never throws — returns [] on any failure.
 */
export async function searchPubMed(
  term: string,
  signal: AbortSignal,
  limit = 3,
): Promise<EvidenceCandidate[]> {
  try {
    const searchParams = new URLSearchParams({
      db: "pubmed",
      term,
      retmax: String(limit),
      retmode: "json",
      sort: "relevance",
      ...compliance(),
    });
    const searchRes = await fetch(`${ESEARCH}?${searchParams.toString()}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!searchRes.ok) return [];
    const searchData = (await searchRes.json()) as {
      esearchresult?: { idlist?: string[] };
    };
    const ids = (searchData.esearchresult?.idlist ?? []).slice(0, limit);
    if (ids.length === 0) return [];

    const sumParams = new URLSearchParams({
      db: "pubmed",
      id: ids.join(","),
      retmode: "json",
      ...compliance(),
    });
    const sumRes = await fetch(`${ESUMMARY}?${sumParams.toString()}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!sumRes.ok) return [];
    const sumData = (await sumRes.json()) as {
      result?: Record<string, ESummaryDoc | string[]>;
    };
    const result = sumData.result ?? {};

    const candidates: EvidenceCandidate[] = [];
    for (const id of ids) {
      const doc = result[id] as ESummaryDoc | undefined;
      if (!doc || !doc.title) continue;
      const year = doc.pubdate ? doc.pubdate.split(" ")[0] : undefined;
      const journal = doc.fulljournalname || doc.source;
      candidates.push({
        source: "pubmed",
        id: `PMID:${id}`,
        title: doc.title.replace(/\.$/, ""),
        year,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        signals: journal ? [journal] : ["term match"],
        relevance: "candidate",
      });
    }
    return candidates;
  } catch {
    return [];
  }
}
