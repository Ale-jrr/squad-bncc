import bnccIndex from "@/data/bncc-index.json";

export type BnccIndexEntry = {
  code: string;
  grade: number | null;
  subject: string;
  skill: string;
  pages: number[];
};

type BnccIndexPayload = {
  source: string;
  generatedAt: string;
  count: number;
  entries: BnccIndexEntry[];
};

const payload = bnccIndex as BnccIndexPayload;

function canonicalSubject(subject: string): string {
  const normalized = subject
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  if (["portugues", "lingua_portuguesa", "lp"].includes(normalized)) return "lingua_portuguesa";
  if (["matematica", "mat"].includes(normalized)) return "matematica";
  if (["ciencias", "ciencias_da_natureza", "natureza", "ci"].includes(normalized)) return "ciencias";
  if (["historia", "hi"].includes(normalized)) return "historia";
  if (["geografia", "geo", "ge"].includes(normalized)) return "geografia";
  if (["artes", "arte", "ar"].includes(normalized)) return "artes";

  return normalized;
}

export function findBnccFromIndex(grade: number, subject: string): BnccIndexEntry | null {
  const wantedSubject = canonicalSubject(subject);
  const direct = payload.entries.find((item) => item.grade === grade && canonicalSubject(item.subject) === wantedSubject);
  if (direct) return direct;

  return null;
}

export function getBnccIndexMeta() {
  return {
    source: payload.source,
    generatedAt: payload.generatedAt,
    count: payload.count
  };
}
