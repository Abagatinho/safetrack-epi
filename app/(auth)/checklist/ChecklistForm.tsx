"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_ITEMS = [
  "EPIs em uso corretamente",
  "Extintores acessíveis",
  "Área de trabalho isolada quando necessário",
  "Sinalização de segurança visível",
];

type Answer = "yes" | "no" | "na";

const OPTIONS: { value: Answer; label: string; active: string }[] = [
  { value: "yes", label: "Sim", active: "bg-safety text-steel border-safety" },
  { value: "no", label: "Não", active: "bg-danger text-steel border-danger" },
  { value: "na", label: "N/A", active: "bg-graphite text-steel border-graphite" },
];

export function ChecklistForm() {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [responsibleTechnician, setResponsibleTechnician] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const items = DEFAULT_ITEMS.map((description) => ({
      description,
      answer: answers[description] ?? "na",
    }));

    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector, responsibleTechnician, items }),
    });

    setSector("");
    setResponsibleTechnician("");
    setAnswers({});
    setSaving(false);
    setSubmitted(true);
    router.refresh();
  }

  const nonConformities = Object.values(answers).filter((r) => r === "no").length;

  return (
    <form onSubmit={handleSubmit} className="panel p-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="label">Setor</span>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="field mt-1"
            placeholder="Solda, pátio, altura…"
            required
          />
        </label>
        <label className="block">
          <span className="label">Técnico responsável</span>
          <input
            value={responsibleTechnician}
            onChange={(e) => setResponsibleTechnician(e.target.value)}
            className="field mt-1"
            required
          />
        </label>
      </div>

      <p className="label mb-3">Itens de verificação</p>

      <ul className="border-t border-rule">
        {DEFAULT_ITEMS.map((item) => (
          <li
            key={item}
            className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-rule"
          >
            <span className="text-sm flex-1 min-w-[12rem]">{item}</span>

            <fieldset className="flex gap-px" aria-label={item}>
              {OPTIONS.map((option) => {
                const checked = answers[item] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`label cursor-pointer px-4 py-2 border select-none transition-colors ${
                      checked
                        ? option.active
                        : "bg-steel border-rule text-smoke hover:border-graphite"
                    }`}
                  >
                    <input
                      type="radio"
                      name={item}
                      value={option.value}
                      checked={checked}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [item]: option.value }))
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </fieldset>
          </li>
        ))}
      </ul>

      {nonConformities > 0 && (
        <p className="label text-danger mt-4">
          {nonConformities} não conformidade{nonConformities > 1 ? "s" : ""} neste checklist
        </p>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button type="submit" className="button button-heavy" disabled={saving}>
          {saving ? "Registrando" : "Registrar checklist"}
        </button>
        {submitted && !saving && (
          <span className="label text-safety">Checklist registrado</span>
        )}
      </div>
    </form>
  );
}
