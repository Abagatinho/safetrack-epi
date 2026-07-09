"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewEmployeeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, jobTitle, clientCompany }),
    });
    setName("");
    setJobTitle("");
    setClientCompany("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 mb-8">
      <p className="label mb-4">Novo colaborador</p>
      <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="label">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-1"
            required
          />
        </label>
        <label className="block">
          <span className="label">Função</span>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="field mt-1"
            required
          />
        </label>
        <label className="block">
          <span className="label">Empresa cliente</span>
          <input
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
            className="field mt-1"
            required
          />
        </label>
        <button type="submit" className="button" disabled={saving}>
          {saving ? "Salvando" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
