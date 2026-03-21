import { findBnccFromIndex } from "@/lib/bncc-index";

export type BnccEntry = {
  grade: number;
  subject: string;
  code: string;
  skill: string;
  sourcePage?: number;
};

const MATRIX: BnccEntry[] = [
  { grade: 1, subject: "lingua_portuguesa", code: "EF01LP05", skill: "Reconhecer o sistema de escrita alfabética em atividades guiadas." },
  { grade: 1, subject: "matematica", code: "EF01MA06", skill: "Resolver problemas simples de adição e subtração com apoio visual." },
  { grade: 1, subject: "ciencias", code: "EF01CI01", skill: "Comparar características de materiais e seres vivos do cotidiano." },
  { grade: 1, subject: "historia", code: "EF01HI01", skill: "Identificar elementos da própria história e do grupo de convívio." },
  { grade: 1, subject: "geografia", code: "EF01GE01", skill: "Reconhecer referências espaciais no ambiente próximo." },
  { grade: 1, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artísticos." },

  { grade: 2, subject: "lingua_portuguesa", code: "EF02LP06", skill: "Ler e compreender pequenos textos com apoio de estratégias de leitura." },
  { grade: 2, subject: "matematica", code: "EF02MA06", skill: "Resolver e elaborar problemas de adição e subtração com diferentes estratégias." },
  { grade: 2, subject: "ciencias", code: "EF02CI02", skill: "Investigar relações entre seres vivos e ambiente em situações próximas." },
  { grade: 2, subject: "historia", code: "EF02HI01", skill: "Reconhecer mudanças e permanências no cotidiano e na comunidade." },
  { grade: 2, subject: "geografia", code: "EF02GE03", skill: "Descrever trajetos e referências espaciais no bairro/comunidade." },
  { grade: 2, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artísticos." },

  { grade: 3, subject: "lingua_portuguesa", code: "EF03LP10", skill: "Produzir textos curtos considerando finalidade e interlocutor." },
  { grade: 3, subject: "matematica", code: "EF03MA07", skill: "Resolver problemas envolvendo multiplicação e divisão em contextos simples." },
  { grade: 3, subject: "ciencias", code: "EF03CI01", skill: "Relacionar características do ambiente e qualidade de vida." },
  { grade: 3, subject: "historia", code: "EF03HI04", skill: "Identificar diferentes formas de organização social no tempo." },
  { grade: 3, subject: "geografia", code: "EF03GE01", skill: "Comparar paisagens e usos do espaço em diferentes lugares." },
  { grade: 3, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artísticos." },

  { grade: 4, subject: "lingua_portuguesa", code: "EF04LP12", skill: "Planejar e revisar textos com apoio de critérios de clareza e coesão." },
  { grade: 4, subject: "matematica", code: "EF04MA08", skill: "Resolver problemas com multiplicação e divisão envolvendo diferentes representações." },
  { grade: 4, subject: "ciencias", code: "EF04CI05", skill: "Analisar transformações de materiais e seus usos no cotidiano." },
  { grade: 4, subject: "historia", code: "EF04HI01", skill: "Identificar processos históricos em escala local e regional." },
  { grade: 4, subject: "geografia", code: "EF04GE04", skill: "Interpretar mapas e representações espaciais de diferentes escalas." },
  { grade: 4, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artísticos." },

  { grade: 5, subject: "lingua_portuguesa", code: "EF05LP09", skill: "Ler e produzir textos com progressiva autonomia e revisão orientada." },
  { grade: 5, subject: "matematica", code: "EF05MA07", skill: "Resolver problemas envolvendo números racionais em contextos significativos." },
  { grade: 5, subject: "ciencias", code: "EF05CI01", skill: "Investigar hábitos de saúde e relações com o ambiente." },
  { grade: 5, subject: "historia", code: "EF05HI02", skill: "Analisar experiências históricas e culturais de diferentes grupos." },
  { grade: 5, subject: "geografia", code: "EF05GE01", skill: "Compreender dinâmicas do território e do uso dos recursos." },
  { grade: 5, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artísticos." }
];

function normalizeSubject(value: string): string {
  const normalized = value
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

function parseGrade(value: string): number | null {
  const match = value.match(/\d+/);
  if (!match) return null;
  const grade = Number(match[0]);
  if (Number.isNaN(grade) || grade < 1 || grade > 9) return null;
  return grade;
}

export function suggestBnccCode(gradeRaw: string, subjectRaw: string): BnccEntry | null {
  const grade = parseGrade(gradeRaw);
  if (!grade) return null;

  const subject = normalizeSubject(subjectRaw);
  const indexed = findBnccFromIndex(grade, subject);
  if (indexed) {
    return {
      grade,
      subject,
      code: indexed.code,
      skill: indexed.skill,
      sourcePage: indexed.pages[0]
    };
  }

  const found = MATRIX.find((item) => item.grade === grade && item.subject === subject);
  return found ?? null;
}
