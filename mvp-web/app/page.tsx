"use client";

import { useState } from "react";

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
  supportLevel: "leve" | "moderado" | "alto" | "muito_alto";
  subject: string;
  bnccCode: string;
  objective: string;
  context: "sala_regular" | "aee" | "casa";
  durationMin: number;
};

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

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      ...form,
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
        setLoading(false);
        return;
      }

      setResult(data);
      setLoading(false);
    } catch {
      setError("Falha de rede ao gerar atividade.");
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <main className="container">
      <section className="card no-print">
        <h1>MVP BNCC Inclusivo</h1>
        <p>Preencha os dados e gere atividade pronta para imprimir.</p>

        <form className="field-grid" onSubmit={onSubmit}>
          <input value={form.studentName} onChange={(e) => update("studentName", e.target.value)} placeholder="Nome do aluno" required />
          <input value={form.age} onChange={(e) => update("age", Number(e.target.value))} type="number" placeholder="Idade" min={4} max={18} required />
          <input value={form.grade} onChange={(e) => update("grade", e.target.value)} placeholder="Serie/ano" required />
          <input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Componente curricular" required />
          <input className="full" value={form.profiles} onChange={(e) => update("profiles", e.target.value)} placeholder="Perfis (ex: tea,tdah,dislexia)" required />
          <select value={form.supportLevel} onChange={(e) => update("supportLevel", e.target.value as FormState["supportLevel"])}>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="alto">Alto</option>
            <option value="muito_alto">Muito alto</option>
          </select>
          <select value={form.context} onChange={(e) => update("context", e.target.value as FormState["context"])}>
            <option value="sala_regular">Sala regular</option>
            <option value="aee">AEE</option>
            <option value="casa">Casa</option>
          </select>
          <input value={form.bnccCode} onChange={(e) => update("bnccCode", e.target.value.toUpperCase())} placeholder="Codigo BNCC" required />
          <input value={form.durationMin} onChange={(e) => update("durationMin", Number(e.target.value))} type="number" min={5} max={90} placeholder="Duracao (min)" required />
          <textarea className="full" value={form.objective} onChange={(e) => update("objective", e.target.value)} placeholder="Objetivo pedagogico" rows={3} required />
          <button className="full" type="submit" disabled={loading}>{loading ? "Gerando..." : "Gerar atividade"}</button>
        </form>

        {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
      </section>

      {result ? (
        <section className="preview">
          <div className="actions no-print">
            <button onClick={handlePrint}>Imprimir / Baixar PDF</button>
            <button className="secondary" onClick={() => setResult(null)}>Nova atividade</button>
          </div>

          <article className="print-sheet">
            <h2>{result.printable.title}</h2>
            <div className="print-row">
              <div><strong>Aluno:</strong> {form.studentName}</div>
              <div><strong>Idade:</strong> {form.age}</div>
              <div><strong>Serie:</strong> {form.grade}</div>
              <div><strong>Contexto:</strong> {form.context}</div>
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
