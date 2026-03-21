/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_PDF_PATH = path.resolve(PROJECT_ROOT, "..", "PDF BNCC", "BNCC_EI_EF_110518_versaofinal_site.pdf");
const OUTPUT_PATH = path.resolve(PROJECT_ROOT, "data", "bncc-index.json");

function normalizeLine(value) {
  return fixEncoding(value).replace(/\s+/g, " ").trim();
}

function fixEncoding(value) {
  if (!value) return "";
  if (!/[ÃÂ]/.test(value)) return value;
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function detectSubjectFromCode(code) {
  if (code.includes("LP")) return "lingua_portuguesa";
  if (code.includes("MA")) return "matematica";
  if (code.includes("CI")) return "ciencias";
  if (code.includes("HI")) return "historia";
  if (code.includes("GE")) return "geografia";
  if (code.includes("AR")) return "artes";
  return "geral";
}

function detectGradeFromCode(code) {
  const match = code.match(/^EF(\d{2})/);
  if (!match) return null;
  return Number(match[1]);
}

function extractSkill(lines, lineIndex, code) {
  const line = lines[lineIndex];
  const afterCode = normalizeLine(line.replace(code, "").replace(/^\(\)\s*/, "").replace(/^[-:–.\s]+/, ""));
  if (afterCode.length >= 12) return afterCode;

  for (let i = lineIndex + 1; i < Math.min(lines.length, lineIndex + 5); i += 1) {
    const candidate = normalizeLine(lines[i]);
    if (!candidate) continue;
    if (/^EF\d{2}|^EI\d{2}/.test(candidate)) continue;
    if (candidate.length >= 12) return candidate;
  }

  return "";
}

async function extractPdfPages(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  await parser.destroy();

  return result.pages.map((page) => ({
    page: page.num,
    text: page.text
  }));
}

function buildIndexFromPages(pages) {
  const codeRegex = /\b(EF\d{2}[A-Z]{2}\d{2,3}|EI\d{2}[A-Z]{2}\d{2})\b/g;
  const map = new Map();

  for (const page of pages) {
    const lines = page.text.split(/\n+/).map(normalizeLine).filter(Boolean);

    lines.forEach((line, idx) => {
      const matches = line.match(codeRegex);
      if (!matches) return;

      matches.forEach((code) => {
        const key = code.trim();
        const skill = extractSkill(lines, idx, key).replace(/^\(\)\s*/, "");
        const grade = detectGradeFromCode(key);
        const subject = detectSubjectFromCode(key);

        if (!map.has(key)) {
          map.set(key, {
            code: key,
            grade,
            subject,
            skill: skill || "Habilidade BNCC extraída da base oficial.",
            pages: [page.page]
          });
          return;
        }

        const existing = map.get(key);
        if (!existing.pages.includes(page.page)) existing.pages.push(page.page);
        if ((!existing.skill || existing.skill.length < 20) && skill.length >= 12) {
          existing.skill = skill;
        }
      });
    });
  }

  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code, "pt-BR"));
}

async function main() {
  const pdfPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PDF_PATH;

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF não encontrado: ${pdfPath}`);
  }

  console.log(`Extraindo PDF: ${pdfPath}`);
  const pages = await extractPdfPages(pdfPath);
  console.log(`Páginas lidas: ${pages.length}`);

  const entries = buildIndexFromPages(pages);
  console.log(`Códigos BNCC indexados: ${entries.length}`);

  const output = {
    source: path.basename(pdfPath),
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Índice salvo em: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
