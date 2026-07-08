"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GravidadeIncidente } from "@/lib/types";

const GRAVIDADES: { valor: GravidadeIncidente; label: string; ativo: string }[] = [
  { valor: "leve", label: "Leve", ativo: "bg-cuidado border-cuidado text-grafite" },
  { valor: "moderado", label: "Moderado", ativo: "bg-maquina border-maquina text-aco" },
  { valor: "grave", label: "Grave", ativo: "bg-perigo border-perigo text-aco" },
];

export function IncidenteForm() {
  const router = useRouter();
  const [local, setLocal] = useState("");
  const [gravidade, setGravidade] = useState<GravidadeIncidente>("leve");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    await fetch("/api/incidentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ local, gravidade, descricao }),
    });
    setLocal("");
    setDescricao("");
    setGravidade("leve");
    setSalvando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="placa p-5 max-w-xl">
      <p className="etiqueta mb-4">Registrar ocorrência</p>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="etiqueta">Local</span>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="campo mt-1"
            placeholder="Setor de solda, pátio de logística…"
            required
          />
        </label>

        <fieldset>
          <legend className="etiqueta mb-2">Gravidade</legend>
          <div className="flex gap-px">
            {GRAVIDADES.map((g) => {
              const marcado = gravidade === g.valor;
              return (
                <label
                  key={g.valor}
                  className={`etiqueta cursor-pointer px-5 py-3 border select-none transition-colors ${
                    marcado ? g.ativo : "bg-aco border-traco text-fumaca hover:border-grafite"
                  }`}
                >
                  <input
                    type="radio"
                    name="gravidade"
                    value={g.valor}
                    checked={marcado}
                    onChange={() => setGravidade(g.valor)}
                    className="sr-only"
                  />
                  {g.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="etiqueta">O que aconteceu</span>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="campo mt-1 min-h-24 resize-y"
            placeholder="Descreva o incidente ou quase-acidente"
            required
          />
        </label>

        <p className="etiqueta">Foto: disponível na versão de produção</p>

        <button type="submit" className="botao botao-campo mt-2" disabled={salvando}>
          {salvando ? "Registrando" : "Registrar incidente"}
        </button>
      </div>
    </form>
  );
}
