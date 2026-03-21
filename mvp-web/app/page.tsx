"use client";

import { useEffect, useMemo, useState } from "react";
import { suggestBnccCode } from "@/lib/bncc-matrix";

type AreaMode = "inclusiva" | "regular";

type ApiResponse = {
  objective: string;
  bnccCode: string;
  steps: string[];
  adaptations: string[];
  planB: string;
  successCriteria: string;
  printable: {
    title: string;
    blocks: string[];
  };
};

type FormState = {
  studentName: string;
  age: number;
  grade: string;
  profiles: string;
  supportLevel: string;
  subject: string;
  bnccCode: string;
  objective: string;
  context: "sala_regular" | "aee" | "casa";
  durationMin: number;
};

type HistoryEntry = {
  id: string;
  createdAt: string;
  mode: AreaMode;
  form: FormState;
  result: ApiResponse;
};

const HISTORY_KEY = "mvp_bncc_history_v1";

const initialForm: FormState = {
  studentName: "",
  age: Number.NaN,
  grade: "",
  profiles: "tea",
  supportLevel: "moderado",
  subject: "",
  bnccCode: "EF02MA06",
  objective: "",
  context: "sala_regular",
  durationMin: 20
};

function normalizeBncc(value: string): string {
  return value.trim().toUpperCase();
}

function syncFavicon(href: string) {
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

function localValidation(form: FormState, mode: AreaMode): string[] {
  const errors: string[] = [];
  const bncc = normalizeBncc(form.bnccCode);
  const bnccRegex = /^[A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3}$/;

  if (!form.studentName.trim()) errors.push("Informe o nome do aluno.");
  if (form.age < 4 || form.age > 18) errors.push("Idade deve estar entre 4 e 18.");
  if (!form.grade.trim()) errors.push("Informe a série/ano.");
  if (!form.subject.trim()) errors.push("Informe o componente curricular.");
  if (!form.objective.trim() || form.objective.trim().length < 5) errors.push("Objetivo pedagógico muito curto.");
  if (form.durationMin < 5 || form.durationMin > 90) errors.push("Duração deve estar entre 5 e 90 minutos.");
  if (mode === "inclusiva" && !form.profiles.split(",").map((v) => v.trim()).filter(Boolean).length) errors.push("Informe ao menos um perfil atípico.");
  if (!bnccRegex.test(bncc)) errors.push("Código BNCC inválido. Exemplo: EF02MA06.");

  return errors;
}

function formatContext(value: FormState["context"]): string {
  if (value === "aee") return "AEE";
  if (value === "casa") return "Casa";
  return "Sala regular";
}

function buildObjectiveFromBncc(skill: string, mode: AreaMode): string {
  const base = `${skill.charAt(0).toLowerCase()}${skill.slice(1)}`;
  if (mode === "regular") return `Consolidar a habilidade de ${base} em atividade coletiva orientada.`;
  return `Desenvolver a habilidade de ${base} com mediação inclusiva planejada.`;
}

function getWorksheetBackground(mode: AreaMode, context: FormState["context"]): string {
  if (mode === "inclusiva") {
    if (context === "aee") return "/print-bg-inclusive-aee.svg";
    if (context === "casa") return "/print-bg-inclusive-casa.svg";
    return "/print-bg-inclusive-sala.svg";
  }

  if (context === "aee") return "/print-bg-regular-aee.svg";
  if (context === "casa") return "/print-bg-regular-casa.svg";
  return "/print-bg-regular-sala.svg";
}

function normalizeSubjectLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type WorksheetTemplate = {
  instruction: string;
  cards: Array<{ icon: string; label: string }>;
  bankTitle?: string;
  wordBank?: string[];
};

function buildWorksheetTemplate(subjectRaw: string, objective: string, steps: string[]): WorksheetTemplate | null {
  const subject = normalizeSubjectLabel(subjectRaw);
  const shortObjective = objective.length > 60 ? `${objective.slice(0, 57)}...` : objective;

  if (subject.includes("portugues")) {
    return {
      instruction: "Escreva um adjetivo para cada substantivo usando o banco de palavras.",
      cards: [
        { icon: "🐢", label: "tartaruga" },
        { icon: "🥗", label: "salada" },
        { icon: "☕", label: "chá" },
        { icon: "✋", label: "mãos" },
        { icon: "🍽️", label: "louça" },
        { icon: "👧", label: "menina" },
        { icon: "🍦", label: "sorvete" },
        { icon: "🧒", label: "menino" }
      ],
      bankTitle: "Banco de palavras",
      wordBank: ["quente", "frio", "rápido", "organizada", "lenta", "alegre", "pequena", "saudável"]
    };
  }

  if (subject.includes("matemat")) {
    return {
      instruction: "Resolva as operações e preencha os resultados.",
      cards: [
        { icon: "🧮", label: "12 + 7 =" },
        { icon: "🔢", label: "18 - 9 =" },
        { icon: "📏", label: "4 + 6 =" },
        { icon: "📘", label: "15 - 8 =" },
        { icon: "🧠", label: "3 + 9 =" },
        { icon: "🎯", label: "14 - 5 =" },
        { icon: "🧩", label: "7 + 7 =" },
        { icon: "✅", label: "20 - 6 =" }
      ],
      bankTitle: "Desafio bônus",
      wordBank: ["Crie 1 conta parecida", "Explique como pensou", `Objetivo: ${shortObjective}`]
    };
  }

  if (subject.includes("cien")) {
    return {
      instruction: "Observe cada item e escreva uma característica ou classificação.",
      cards: [
        { icon: "🌱", label: "planta" },
        { icon: "🐦", label: "animal" },
        { icon: "💧", label: "água" },
        { icon: "☀️", label: "sol" },
        { icon: "🪨", label: "pedra" },
        { icon: "🌬️", label: "ar" },
        { icon: "🍎", label: "alimento" },
        { icon: "🌍", label: "ambiente" }
      ],
      bankTitle: "Pergunta de investigação",
      wordBank: [`O que você descobriu sobre ${shortObjective}?`]
    };
  }

  if (subject.includes("hist")) {
    return {
      instruction: "Escreva em cada quadro um fato de antes/depois ou uma pista histórica.",
      cards: [
        { icon: "⏳", label: "antes" },
        { icon: "📅", label: "depois" },
        { icon: "🏠", label: "vida em casa" },
        { icon: "🏫", label: "vida na escola" },
        { icon: "👪", label: "família" },
        { icon: "🧓", label: "comunidade" },
        { icon: "📜", label: "registro" },
        { icon: "🗣️", label: "memória" }
      ],
      bankTitle: "Converse e registre",
      wordBank: ["O que mudou?", "O que permaneceu?", `Tema: ${shortObjective}`]
    };
  }

  if (subject.includes("geo")) {
    return {
      instruction: "Complete cada quadro com um elemento do espaço geográfico.",
      cards: [
        { icon: "🗺️", label: "mapa" },
        { icon: "🏙️", label: "cidade" },
        { icon: "🌳", label: "natureza" },
        { icon: "🚶", label: "trajeto" },
        { icon: "🏫", label: "escola" },
        { icon: "🏡", label: "casa" },
        { icon: "🚦", label: "rua" },
        { icon: "📍", label: "ponto de referência" }
      ],
      bankTitle: "Rota da atividade",
      wordBank: ["Início", "Meio", "Chegada", `Objetivo: ${shortObjective}`]
    };
  }

  if (subject.includes("arte")) {
    return {
      instruction: "Use os quadros para planejar e descrever sua produção artística.",
      cards: [
        { icon: "🎨", label: "cor principal" },
        { icon: "✏️", label: "traço" },
        { icon: "🖌️", label: "textura" },
        { icon: "🧠", label: "ideia" },
        { icon: "🖼️", label: "personagem" },
        { icon: "🌈", label: "combinação de cores" },
        { icon: "📣", label: "título da obra" },
        { icon: "💡", label: "mensagem da obra" }
      ],
      bankTitle: "Apresentação",
      wordBank: ["Mostre para a turma", "Explique sua escolha", `Tema: ${shortObjective}`]
    };
  }

  if (steps.length) {
    return {
      instruction: "Realize as atividades abaixo e registre as respostas.",
      cards: steps.slice(0, 8).map((step, idx) => ({
        icon: "📘",
        label: `tarefa ${idx + 1}: ${step.slice(0, 34)}${step.length > 34 ? "..." : ""}`
      }))
    };
  }

  return null;
}

export default function HomePage() {
  const [mode, setMode] = useState<AreaMode>("inclusiva");
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const isInclusive = mode === "inclusiva";
  const themeClass = isInclusive ? "theme-inclusive" : "theme-regular";
  const logoPath = isInclusive ? "/logo-autismo.svg" : "/logo-regular.svg";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryEntry[];
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 10));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isInclusive) {
      document.title = "Plano Vivo BNCC Inclusiva";
      syncFavicon("/favicon-inclusive.svg");
    } else {
      document.title = "Plano Vivo BNCC Regular";
      syncFavicon("/favicon-regular.svg");
    }
  }, [isInclusive]);

  function persistHistory(items: HistoryEntry[]) {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function switchMode(next: AreaMode) {
    setMode(next);
    setResult(null);
    setError(null);
    setDetails([]);
  }

  const validationErrors = useMemo(() => localValidation(form, mode), [form, mode]);
  const bnccSuggestion = useMemo(() => suggestBnccCode(form.grade, form.subject), [form.grade, form.subject]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    setResult(null);

    if (validationErrors.length) {
      setError("Corrija os campos destacados antes de gerar.");
      setDetails(validationErrors);
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      targetGroup: mode,
      bnccCode: normalizeBncc(form.bnccCode),
      profiles: isInclusive ? form.profiles.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean) : []
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar atividade.");
        const issues = Array.isArray(data.issues)
          ? data.issues.map((issue: { path?: string[]; message?: string }) => {
              const field = issue.path?.length ? issue.path.join(".") : "campo";
              return `${field}: ${issue.message ?? "inválido"}`;
            })
          : [];
        setDetails(issues);
        setLoading(false);
        return;
      }

      setResult(data);
      const nextHistory: HistoryEntry[] = [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          mode,
          form,
          result: data
        },
        ...history
      ].slice(0, 10);
      persistHistory(nextHistory);
      setLoading(false);
    } catch {
      setError("Falha de rede ao gerar atividade.");
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function loadFromHistory(entry: HistoryEntry) {
    setMode(entry.mode);
    setForm(entry.form);
    setResult(entry.result);
    setError(null);
    setDetails([]);
  }

  function clearHistory() {
    persistHistory([]);
  }

  function applySuggestion() {
    if (!bnccSuggestion) return;
    update("bnccCode", bnccSuggestion.code);
  }

  function applyObjectiveSuggestion() {
    if (!bnccSuggestion) return;
    update("objective", buildObjectiveFromBncc(bnccSuggestion.skill, mode));
  }

  const worksheetTemplate = result ? buildWorksheetTemplate(form.subject, result.objective, result.steps) : null;

  return (
    <main className={`container ${themeClass}`}>
      <header className="hero no-print">
        <div className="hero-bg" aria-hidden="true">
          <span className="float-symbol symbol-a">*</span>
          <span className="float-symbol symbol-b">+</span>
          <span className="float-symbol symbol-c">o</span>
          <span className="float-symbol symbol-d">@</span>
          <span className="float-symbol symbol-e">#</span>
        </div>

        <div className="mode-switch">
          <button type="button" className={`mode-btn ${isInclusive ? "active" : ""}`} onClick={() => switchMode("inclusiva")}>
            Área Inclusiva
          </button>
          <button type="button" className={`mode-btn ${!isInclusive ? "active" : ""}`} onClick={() => switchMode("regular")}>
            Área Regular BNCC
          </button>
        </div>

        <div className="brand-row">
          <img src={logoPath} alt="Símbolo da área" className="brand-logo" />
          <p className="badge">{isInclusive ? "Espaço escolar inclusivo e criativo" : "Planejamento pedagógico para turmas regulares"}</p>
        </div>

        <h1>{isInclusive ? "Planejamento colorido para cada jeito único de aprender" : "Atividades BNCC para aprendizagem ativa da turma inteira"}</h1>
        <p className="hero-text">
          {isInclusive
            ? "Crie atividades BNCC com linguagem acolhedora, adaptações para crianças atípicas e formato prontinho para sala regular, AEE e casa."
            : "Crie atividades BNCC para crianças não atípicas com foco em engajamento da turma, rotina didática e consolidação das habilidades essenciais."}
        </p>
      </header>

      <section className="pitch-grid no-print" id="proposta" aria-label="Proposta para escolas">
        <article className="pitch-card">
          <h2>{isInclusive ? "Ambiente acolhedor e alegre" : "Aula dinâmica e bem estruturada"}</h2>
          <p>
            {isInclusive
              ? "Cores vivas e elementos lúdicos mostram desde o primeiro olhar que a escola valoriza pertencimento e segurança emocional."
              : "Modelo pedagógico para rotinas de sala, com início orientado, prática guiada e fechamento avaliativo de aprendizagem."}
          </p>
        </article>
        <article className="pitch-card">
          <h2>{isInclusive ? "Professor com rotina mais leve" : "Planejamento mais rápido da semana"}</h2>
          <p>O sistema entrega atividade pronta, plano B e critério de sucesso no mesmo documento, reduzindo retrabalho e acelerando o planejamento.</p>
        </article>
        <article className="pitch-card">
          <h2>{isInclusive ? "Padrão pedagógico para toda a equipe" : "Regras BNCC para ensino regular"}</h2>
          <p>Com um único formato de saída, a escola mantém consistência curricular, linguagem clara e registro observável de evolução.</p>
        </article>
      </section>

      <section className="card no-print" id="gerador" aria-labelledby="form-title">
        <h2 id="form-title">{isInclusive ? "Gerador de atividade inclusiva" : "Gerador de atividade regular BNCC"}</h2>
        <p>Preencha os dados do estudante e gere o material completo para imprimir.</p>

        <form className="field-grid" onSubmit={onSubmit} noValidate>
          <label htmlFor="studentName" className="label">Nome do aluno</label>
          <label htmlFor="age" className="label">Idade</label>
          <input id="studentName" aria-invalid={!form.studentName.trim()} value={form.studentName} onChange={(e) => update("studentName", e.target.value)} required />
          <input
            id="age"
            aria-invalid={form.age < 4 || form.age > 18}
            value={Number.isNaN(form.age) ? "" : form.age}
            onChange={(e) => update("age", e.target.value === "" ? Number.NaN : Number(e.target.value))}
            type="number"
            min={4}
            max={18}
            required
          />

          <label htmlFor="grade" className="label">Série/ano</label>
          <label htmlFor="subject" className="label">Componente curricular</label>
          <input id="grade" aria-invalid={!form.grade.trim()} value={form.grade} onChange={(e) => update("grade", e.target.value)} required />
          <input id="subject" aria-invalid={!form.subject.trim()} value={form.subject} onChange={(e) => update("subject", e.target.value)} required />

          {isInclusive ? (
            <>
              <label htmlFor="profiles" className="label full">Perfis atípicos (separados por vírgula)</label>
              <input id="profiles" className="full" aria-invalid={!form.profiles.trim()} value={form.profiles} onChange={(e) => update("profiles", e.target.value)} placeholder="tea,tdah,dislexia" required />
            </>
          ) : (
            <div className="full suggest-box">
              <strong>Modo regular ativo:</strong> neste modo as regras focam crianças não atípicas e estratégias gerais de ensino BNCC.
            </div>
          )}

          <label htmlFor="supportLevel" className="label">Nível de suporte</label>
          <label htmlFor="context" className="label">Contexto</label>
          <select id="supportLevel" value={form.supportLevel} onChange={(e) => update("supportLevel", e.target.value)} required>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="alto">Alto</option>
          </select>
          <select id="context" value={form.context} onChange={(e) => update("context", e.target.value as FormState["context"])}>
            <option value="sala_regular">Sala regular</option>
            <option value="aee">AEE</option>
            <option value="casa">Casa</option>
          </select>

          <label htmlFor="bnccCode" className="label">Código BNCC</label>
          <label htmlFor="durationMin" className="label">Duração (min)</label>
          <input id="bnccCode" aria-invalid={!/^[A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3}$/.test(normalizeBncc(form.bnccCode))} value={form.bnccCode} onChange={(e) => update("bnccCode", normalizeBncc(e.target.value))} placeholder="EF02MA06" required />
          <input id="durationMin" aria-invalid={form.durationMin < 5 || form.durationMin > 90} value={form.durationMin} onChange={(e) => update("durationMin", Number(e.target.value))} type="number" min={5} max={90} required />

          <div className="full suggest-box">
            <strong>Sugestão BNCC automática:</strong>{" "}
            {bnccSuggestion
              ? `${bnccSuggestion.code} - ${bnccSuggestion.skill}${bnccSuggestion.sourcePage ? ` (p. ${bnccSuggestion.sourcePage})` : ""}`
              : "sem sugestão para esta combinação"}
            {bnccSuggestion ? <button type="button" className="secondary" onClick={applySuggestion}>Usar sugestão de BNCC</button> : null}
            {bnccSuggestion ? <button type="button" className="secondary" onClick={applyObjectiveSuggestion}>Sugerir objetivo</button> : null}
          </div>

          <label htmlFor="objective" className="label full">Objetivo pedagógico</label>
          <textarea
            id="objective"
            className="full"
            aria-invalid={!form.objective.trim() || form.objective.trim().length < 5}
            value={form.objective}
            onChange={(e) => update("objective", e.target.value)}
            placeholder={isInclusive ? "Ex.: Desenvolver leitura de palavras frequentes com apoio visual." : "Ex.: Consolidar adição e subtração em situações-problema do cotidiano."}
            rows={3}
            required
          />

          <button className="full submit-btn" type="submit" disabled={loading}>{loading ? "Gerando..." : "Gerar atividade"}</button>
        </form>

        <div aria-live="polite">
          {error ? <p className="error-text">{error}</p> : null}
          {details.length ? (
            <ul className="error-list">
              {details.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </div>
      </section>

      {history.length ? (
        <section className="card no-print history-wrap" aria-labelledby="history-title">
          <div className="history-head">
            <h2 id="history-title">Histórico recente</h2>
            <button className="secondary" type="button" onClick={clearHistory}>Limpar histórico</button>
          </div>
          <ul className="history-list">
            {history.map((entry) => (
              <li key={entry.id}>
                <button type="button" className="history-item" onClick={() => loadFromHistory(entry)}>
                  <strong>{entry.mode === "inclusiva" ? "Inclusiva" : "Regular"}</strong> - {entry.form.studentName || "Sem nome"} - {entry.form.subject} - {entry.form.bnccCode} - {new Date(entry.createdAt).toLocaleString("pt-BR")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result ? (
        <section className="preview">
          <div className="actions no-print">
            <button onClick={handlePrint}>Imprimir / Baixar PDF</button>
            <button className="secondary" onClick={() => setResult(null)}>Nova atividade</button>
          </div>

          <article className={`print-sheet ${isInclusive ? "print-inclusive" : "print-regular"}`} aria-label="Folha de atividade imprimível">
            <img
              className="print-illustration"
              src={getWorksheetBackground(mode, form.context)}
              alt=""
              aria-hidden="true"
            />
            <h2>{result.printable.title}</h2>
            <div className="print-row">
              <div><strong>Aluno:</strong> {form.studentName}</div>
              <div><strong>Idade:</strong> {form.age}</div>
              <div><strong>Série:</strong> {form.grade}</div>
              <div><strong>Contexto:</strong> {formatContext(form.context)}</div>
            </div>
            <div className="print-chips">
              <span>{isInclusive ? "Area Inclusiva" : "Area Regular BNCC"}</span>
              <span>{form.subject}</span>
              <span>{formatContext(form.context)}</span>
            </div>

            <section className="print-block">
              <h3>Objetivo pedagógico</h3>
              <div>{result.objective}</div>
            </section>

            <section className="print-block">
              <h3>Código BNCC</h3>
              <div>{result.bnccCode}</div>
            </section>

            <section className="print-block worksheet">
              <h3>Atividades de classe</h3>
              {worksheetTemplate ? (
                <div className="worksheet-visual">
                  <p className="worksheet-instruction">{worksheetTemplate.instruction}</p>
                  <div className="visual-grid">
                    {worksheetTemplate.cards.map((item) => (
                      <article className="visual-card" key={item.label}>
                        <div className="visual-icon">{item.icon}</div>
                        <div className="visual-noun">{item.label}</div>
                        <div className="visual-answer" />
                      </article>
                    ))}
                  </div>
                  {worksheetTemplate.wordBank?.length ? (
                    <div>
                      <div className="word-bank-title">{worksheetTemplate.bankTitle ?? "Banco de apoio"}</div>
                      <div className="word-bank">
                        {worksheetTemplate.wordBank.map((word) => (
                          <span key={word}>{word}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="worksheet-grid">
                  {result.steps.slice(0, 4).map((s, idx) => (
                    <article className="task-card" key={s}>
                      <strong>Tarefa {idx + 1}</strong>
                      <p>{s}</p>
                      <div className="answer-lines" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="print-block">
              <h3>Resumo da atividade</h3>
              <ul>
                {result.printable.blocks.slice(0, 4).map((b) => <li key={b}>{b}</li>)}
              </ul>
            </section>
          </article>
        </section>
      ) : null}
    </main>
  );
}
