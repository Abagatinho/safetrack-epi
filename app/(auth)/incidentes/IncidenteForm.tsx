"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GravidadeIncidente } from "@/lib/types";

export function IncidenteForm() {
  const router = useRouter();
  const [local, setLocal] = useState("");
  const [gravidade, setGravidade] = useState<GravidadeIncidente>("leve");
  const [descricao, setDescricao] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/incidentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ local, gravidade, descricao }),
    });
    setLocal("");
    setDescricao("");
    setGravidade("leve");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        placeholder="Local"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <select
        value={gravidade}
        onChange={(e) => setGravidade(e.target.value as GravidadeIncidente)}
        className="border rounded px-2 py-1"
      >
        <option value="leve">Leve</option>
        <option value="moderado">Moderado</option>
        <option value="grave">Grave</option>
      </select>
      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <p className="text-xs text-gray-400">Upload de foto: fora de escopo do protótipo (mockado).</p>
      <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm">
        Registrar incidente
      </button>
    </form>
  );
}
