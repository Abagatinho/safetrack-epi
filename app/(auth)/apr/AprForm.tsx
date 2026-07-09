"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { AprStep } from "@/lib/types";

const EMPTY_STEP: AprStep = {
  description: "",
  hazard: "",
  initialRisk: { likelihood: 3, severity: 3 },
  controls: [""],
  residualRisk: { likelihood: 1, severity: 3 },
};

const SCALE = [1, 2, 3, 4, 5];

function RiskPicker({
  title,
  value,
  onChange,
}: {
  title: string;
  value: AprStep["initialRisk"];
  onChange: (r: AprStep["initialRisk"]) => void;
}) {
  return (
    <fieldset className="border border-rule p-3">
      <legend className="label px-1">{title}</legend>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="label">Probabilidade</span>
          <select
            value={value.likelihood}
            onChange={(e) => onChange({ ...value, likelihood: Number(e.target.value) })}
            className="field mt-1"
          >
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Severidade</span>
          <select
            value={value.severity}
            onChange={(e) => onChange({ ...value, severity: Number(e.target.value) })}
            className="field mt-1"
          >
            {SCALE.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="pb-2">
          <RiskBadge risk={value} />
        </div>
      </div>
    </fieldset>
  );
}

export function AprForm() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [location, setLocation] = useState("");
  const [author, setAuthor] = useState("");
  const [steps, setSteps] = useState<AprStep[]>([structuredClone(EMPTY_STEP)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStep(index: number, fields: Partial<AprStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...fields } : s)));
  }

  function updateControl(index: number, controlIndex: number, text: string) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, controls: s.controls.map((c, j) => (j === controlIndex ? text : c)) }
          : s
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/aprs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, location, author, steps }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Não foi possível salvar a APR.");
      setSaving(false);
      return;
    }

    setTask("");
    setLocation("");
    setAuthor("");
    setSteps([structuredClone(EMPTY_STEP)]);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5 mb-10">
      <p className="label mb-4">Nova análise preliminar de risco</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <label className="block">
          <span className="label">Tarefa</span>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="field mt-1"
            placeholder="Troca de luminárias"
            required
          />
        </label>
        <label className="block">
          <span className="label">Local</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field mt-1"
            placeholder="Galpão 2"
            required
          />
        </label>
        <label className="block">
          <span className="label">Elaborador</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="field mt-1"
            required
          />
        </label>
      </div>

      {steps.map((step, i) => (
        <div key={i} className="border-t border-rule pt-5 mb-5">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <p className="label">Etapa {i + 1}</p>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
                className="label text-mandatory hover:underline"
              >
                Remover
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="label">Descrição da etapa</span>
              <input
                value={step.description}
                onChange={(e) => updateStep(i, { description: e.target.value })}
                className="field mt-1"
                placeholder="Posicionar a plataforma"
                required
              />
            </label>
            <label className="block">
              <span className="label">Perigo</span>
              <input
                value={step.hazard}
                onChange={(e) => updateStep(i, { hazard: e.target.value })}
                className="field mt-1"
                placeholder="Tombamento em piso irregular"
                required
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <RiskPicker
              title="Risco inicial"
              value={step.initialRisk}
              onChange={(r) => updateStep(i, { initialRisk: r })}
            />
            <RiskPicker
              title="Risco residual (ARR)"
              value={step.residualRisk}
              onChange={(r) => updateStep(i, { residualRisk: r })}
            />
          </div>

          <p className="label mb-2">Medidas de controle</p>
          {step.controls.map((control, j) => (
            <input
              key={j}
              value={control}
              onChange={(e) => updateControl(i, j, e.target.value)}
              className="field mb-2"
              placeholder="O que reduz o risco desta etapa"
              required={j === 0}
            />
          ))}
          <button
            type="button"
            onClick={() => updateStep(i, { controls: [...step.controls, ""] })}
            className="label text-mandatory hover:underline"
          >
            + Medida de controle
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-5">
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, structuredClone(EMPTY_STEP)])}
          className="button"
        >
          + Etapa
        </button>
        <button type="submit" className="button button-heavy" disabled={saving}>
          {saving ? "Salvando" : "Salvar como rascunho"}
        </button>
        {error && <span className="label text-danger">{error}</span>}
      </div>
    </form>
  );
}
