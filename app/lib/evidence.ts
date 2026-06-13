import type { EvidencePacket } from "./types";

import galleri from "@/evidence/galleri.json";
import survivor from "@/evidence/cancer-survivor-mced.json";
import fatigue from "@/evidence/post-chemo-fatigue.json";

const PACKETS: Record<string, EvidencePacket> = {
  galleri: galleri as EvidencePacket,
  "cancer-survivor-mced": survivor as EvidencePacket,
  "post-chemo-fatigue": fatigue as EvidencePacket,
};

export function getEvidencePacket(id?: string): EvidencePacket | undefined {
  if (!id) return undefined;
  return PACKETS[id];
}
