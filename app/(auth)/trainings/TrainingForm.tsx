"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee, NrTraining } from "@/lib/types";

export function TrainingForm({
  employees,
  trainings,
}: {
  employees: Employee[];
  trainings: NrTraining[];
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [trainingId, setTrainingId] = useState(trainings[0]?.id ?? "");
  const [instructor, setInstructor] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = trainings.find((t) => t.id === trainingId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/training-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, trainingId, instructor }),
    });
    setInstructor("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5 mb-10 max-w-2xl">
      <p className="label mb-4">Registrar treinamento realizado</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="label">Colaborador</span>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="field mt-1"
          >
            {employees.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.jobTitle}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Norma</span>
          <select
            value={trainingId}
            onChange={(e) => setTrainingId(e.target.value)}
            className="field mt-1"
          >
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.standard} — {t.name}
              </option>
            ))}
          </select>
          {selected && (
            <span className="data text-smoke mt-2 block">
              Reciclagem a cada {selected.refresherMonths} meses
            </span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="label">Instrutor</span>
          <input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="field mt-1"
            placeholder="Quem ministrou o treinamento"
            required
          />
        </label>
      </div>

      <button type="submit" className="button button-heavy mt-5" disabled={saving}>
        {saving ? "Registrando" : "Registrar treinamento"}
      </button>
    </form>
  );
}
