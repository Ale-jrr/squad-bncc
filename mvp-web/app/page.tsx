"use client";

import { useEffect, useMemo, useState } from "react";

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
  form: FormState;
  result: ApiResponse;
};

const HISTORY_KEY = "mvp_bncc_history_v1";

const initialForm: FormState = {
  studentName: "",
  age: 7,
  grade: "2o ano",
  profiles: "tea",
  supportLevel: "moderado",
  subject: "Matematica",
  bnccCode: "EF02MA00",
  objective: "Desenvolver coordenacao motora fina com atividade estruturada.",
  context: "sala_regular",
  durationMin: 20
};

function normalizeBncc(value: string): string {
  return value.trim().toUpperCase();
}

function localValidation(form: FormState): string[] {
  const errors: string[] = [];
  const bncc = normalizeBncc(form.bnccCode);
  const bnccRegex = /^[A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3}$/;

  if (!form.studentName.trim()) errors.push("Informe o nome do aluno.");
  if (form.age < 4 || form.age > 18) errors.push("Idade deve estar entre 4 e 18.");
  if (!form.grade.trim()) errors.push("Informe a serie/ano.");
  if (!form.subject.trim()) errors.push("Informe o componente curricular.");
  if (!form.objective.trim() || form.objective.trim().length < 5) errors.push("Objetivo pedagogico muito curto.");
  if (form.durationMin < 5 || form.durationMin > 90) errors.push("Duracao deve estar entre 5 e 90 minutos.");
  if (!form.profiles.split(",").map((v) => v.trim()).filter(Boolean).length) errors.push("Informe ao menos um perfil.");
  if (!bnccRegex.test(bncc)) errors.push("Codigo BNCC invalido. Exemplo: EF02MA06.");

  return errors;
}

function formatContext(value: FormState["context"]): string {
  if (value === "aee") return "AEE";
  if (value === "casa") return "Casa";
  return "Sala regular";
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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

  function persistHistory(items: HistoryEntry[]) {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const validationErrors = useMemo(() => localValidation(form), [form]);

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
      bnccCode: normalizeBncc(form.bnccCode),
      profiles: form.profiles.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean)
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
              return `${field}: ${issue.message ?? "invalido"}`;
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
    setForm(entry.form);
    setResult(entry.result);
    setError(null);
    setDetails([]);
  }

  function clearHistory() {
    persistHistory([]);
  }

  return (
    <main className="container">
      <section className="card no-print" aria-labelledby="form-title">
        <h1 id="form-title">MVP BNCC Inclusivo</h1>
        <p>Preencha os dados e gere atividade pronta para imprimir.</p>

        <form className="field-grid" onSubmit={onSubmit} noValidate>
          <label htmlFor="studentName" className="label">Nome do aluno</label>
          <label htmlFor="age" className="label">Idade</label>
          <input id="studentName" aria-invalid={!form.studentName.trim()} value={form.studentName} onChange={(e) => update("studentName", e.target.value)} required />
          <input id="age" aria-invalid={form.age < 4 || form.age > 18} value={form.age} onChange={(e) => update("age", Number(e.target.value))} type="number" min={4} max={18} required />

          <label htmlFor="grade" className="label">Serie/ano</label>
          <label htmlFor="subject" className="label">Componente curricular</label>
          <input id="grade" aria-invalid={!form.grade.trim()} value={form.grade} onChange={(e) => update("grade", e.target.value)} required />
          <input id="subject" aria-invalid={!form.subject.trim()} value={form.subject} onChange={(e) => update("subject", e.target.value)} required />

          <label htmlFor="profiles" className="label full">Perfis atipicos (separados por virgula)</label>
          <input id="profiles" className="full" aria-invalid={!form.profiles.trim()} value={form.profiles} onChange={(e) => update("profiles", e.target.value)} placeholder="tea,tdah,dislexia" required />

          <label htmlFor="supportLevel" className="label">Nivel de suporte</label>
          <label htmlFor="context" className="label">Contexto</label>
          <input id="supportLevel" value={form.supportLevel} onChange={(e) => update("supportLevel", e.target.value)} placeholder="leve, moderado, alto, muito_alto ou personalizado" required />
          <select id="context" value={form.context} onChange={(e) => update("context", e.target.value as FormState["context"])}>
            <option value="sala_regular">Sala regular</option>
            <option value="aee">AEE</option>
            <option value="casa">Casa</option>
          </select>

          <label htmlFor="bnccCode" className="label">Codigo BNCC</label>
          <label htmlFor="durationMin" className="label">Duracao (min)</label>
          <input id="bnccCode" aria-invalid={!/^[A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3}$/.test(normalizeBncc(form.bnccCode))} value={form.bnccCode} onChange={(e) => update("bnccCode", normalizeBncc(e.target.value))} placeholder="EF02MA06" required />
          <input id="durationMin" aria-invalid={form.durationMin < 5 || form.durationMin > 90} value={form.durationMin} onChange={(e) => update("durationMin", Number(e.target.value))} type="number" min={5} max={90} required />

          <label htmlFor="objective" className="label full">Objetivo pedagogico</label>
          <textarea id="objective" className="full" aria-invalid={!form.objective.trim() || form.objective.trim().length < 5} value={form.objective} onChange={(e) => update("objective", e.target.value)} rows={3} required />

          <button className="full" type="submit" disabled={loading}>{loading ? "Gerando..." : "Gerar atividade"}</button>
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
        <section className="card no-print" aria-labelledby="history-title" style={{ marginTop: 12 }}>
          <div className="history-head">
            <h2 id="history-title">Historico recente</h2>
            <button className="secondary" type="button" onClick={clearHistory}>Limpar historico</button>
          </div>
          <ul className="history-list">
            {history.map((entry) => (
              <li key={entry.id}>
                <button type="button" className="history-item" onClick={() => loadFromHistory(entry)}>
                  <strong>{entry.form.studentName || "Sem nome"}</strong> - {entry.form.subject} - {entry.form.bnccCode} - {new Date(entry.createdAt).toLocaleString("pt-BR")}
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

          <article className="print-sheet" aria-label="Folha de atividade imprimivel">
            <h2>{result.printable.title}</h2>
            <div className="print-row">
              <div><strong>Aluno:</strong> {form.studentName}</div>
              <div><strong>Idade:</strong> {form.age}</div>
              <div><strong>Serie:</strong> {form.grade}</div>
              <div><strong>Contexto:</strong> {formatContext(form.context)}</div>
            </div>

            <section className="print-block">
              <h3>Objetivo pedagogico</h3>
              <div>{result.objective}</div>
            </section>

            <section className="print-block">
              <h3>Codigo BNCC</h3>
              <div>{result.bnccCode}</div>
            </section>

            <section className="print-block">
              <h3>Passo a passo</h3>
              <ol>
                {result.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </section>

            <section className="print-block">
              <h3>Adaptacoes inclusivas</h3>
              <ul>
                {result.adaptations.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </section>

            <section className="print-block">
              <h3>Plano B</h3>
              <div>{result.planB}</div>
            </section>

            <section className="print-block">
              <h3>Criterio de sucesso</h3>
              <div>{result.successCriteria}</div>
            </section>

            <section className="print-block">
              <h3>Resumo de impressao</h3>
              <ul>
                {result.printable.blocks.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </section>
          </article>
        </section>
      ) : null}
    </main>
  );
}
