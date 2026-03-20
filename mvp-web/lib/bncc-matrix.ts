export type BnccEntry = {
  grade: number;
  subject: string;
  code: string;
  skill: string;
};

const MATRIX: BnccEntry[] = [
  { grade: 1, subject: "lingua_portuguesa", code: "EF01LP05", skill: "Reconhecer o sistema de escrita alfabetica em atividades guiadas." },
  { grade: 1, subject: "matematica", code: "EF01MA06", skill: "Resolver problemas simples de adicao e subtracao com apoio visual." },
  { grade: 1, subject: "ciencias", code: "EF01CI01", skill: "Comparar caracteristicas de materiais e seres vivos do cotidiano." },
  { grade: 1, subject: "historia", code: "EF01HI01", skill: "Identificar elementos da propria historia e do grupo de convivio." },
  { grade: 1, subject: "geografia", code: "EF01GE01", skill: "Reconhecer referencias espaciais no ambiente proximo." },
  { grade: 1, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artisticos." },

  { grade: 2, subject: "lingua_portuguesa", code: "EF02LP06", skill: "Ler e compreender pequenos textos com apoio de estrategias de leitura." },
  { grade: 2, subject: "matematica", code: "EF02MA06", skill: "Resolver e elaborar problemas de adicao e subtracao com diferentes estrategias." },
  { grade: 2, subject: "ciencias", code: "EF02CI02", skill: "Investigar relacoes entre seres vivos e ambiente em situacoes proximas." },
  { grade: 2, subject: "historia", code: "EF02HI01", skill: "Reconhecer mudancas e permanencias no cotidiano e na comunidade." },
  { grade: 2, subject: "geografia", code: "EF02GE03", skill: "Descrever trajetos e referencias espaciais no bairro/comunidade." },
  { grade: 2, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artisticos." },

  { grade: 3, subject: "lingua_portuguesa", code: "EF03LP10", skill: "Produzir textos curtos considerando finalidade e interlocutor." },
  { grade: 3, subject: "matematica", code: "EF03MA07", skill: "Resolver problemas envolvendo multiplicacao e divisao em contextos simples." },
  { grade: 3, subject: "ciencias", code: "EF03CI01", skill: "Relacionar caracteristicas do ambiente e qualidade de vida." },
  { grade: 3, subject: "historia", code: "EF03HI04", skill: "Identificar diferentes formas de organizacao social no tempo." },
  { grade: 3, subject: "geografia", code: "EF03GE01", skill: "Comparar paisagens e usos do espaco em diferentes lugares." },
  { grade: 3, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artisticos." },

  { grade: 4, subject: "lingua_portuguesa", code: "EF04LP12", skill: "Planejar e revisar textos com apoio de criterios de clareza e coesao." },
  { grade: 4, subject: "matematica", code: "EF04MA08", skill: "Resolver problemas com multiplicacao e divisao envolvendo diferentes representacoes." },
  { grade: 4, subject: "ciencias", code: "EF04CI05", skill: "Analisar transformacoes de materiais e seus usos no cotidiano." },
  { grade: 4, subject: "historia", code: "EF04HI01", skill: "Identificar processos historicos em escala local e regional." },
  { grade: 4, subject: "geografia", code: "EF04GE04", skill: "Interpretar mapas e representacoes espaciais de diferentes escalas." },
  { grade: 4, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artisticos." },

  { grade: 5, subject: "lingua_portuguesa", code: "EF05LP09", skill: "Ler e produzir textos com progressiva autonomia e revisao orientada." },
  { grade: 5, subject: "matematica", code: "EF05MA07", skill: "Resolver problemas envolvendo numeros racionais em contextos significativos." },
  { grade: 5, subject: "ciencias", code: "EF05CI01", skill: "Investigar habitos de saude e relacoes com o ambiente." },
  { grade: 5, subject: "historia", code: "EF05HI02", skill: "Analisar experiencias historicas e culturais de diferentes grupos." },
  { grade: 5, subject: "geografia", code: "EF05GE01", skill: "Compreender dinamicas do territorio e do uso dos recursos." },
  { grade: 5, subject: "artes", code: "EF15AR04", skill: "Experimentar materiais, instrumentos e procedimentos artisticos." }
];

function normalizeSubject(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
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
  const found = MATRIX.find((item) => item.grade === grade && item.subject === subject);
  return found ?? null;
}
