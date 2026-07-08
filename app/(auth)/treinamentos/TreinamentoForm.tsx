"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Colaborador, TreinamentoNR } from "@/lib/types";

export function TreinamentoForm({
  colaboradores,
  treinamentos,
}: {
  colaboradores: Colaborador[];
  treinamentos: TreinamentoNR[];
}) {
  const router = useRouter();
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id ?? "");
  const [treinamentoId, setTreinamentoId] = useState(treinamentos[0]?.id ?? "");
  const [instrutor, setInstrutor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const selecionado = treinamentos.find((t) => t.id === treinamentoId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    await fetch("/api/treinamentos-realizados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, treinamentoId, instrutor }),
    });
    setInstrutor("");
    setSalvando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="placa p-5 mb-10 max-w-2xl">
      <p className="etiqueta mb-4">Registrar treinamento realizado</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="etiqueta">Colaborador</span>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="campo mt-1"
          >
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — {c.funcao}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="etiqueta">Norma</span>
          <select
            value={treinamentoId}
            onChange={(e) => setTreinamentoId(e.target.value)}
            className="campo mt-1"
          >
            {treinamentos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.norma} — {t.nome}
              </option>
            ))}
          </select>
          {selecionado && (
            <span className="dado text-fumaca mt-2 block">
              Reciclagem a cada {selecionado.reciclagemMeses} meses
            </span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="etiqueta">Instrutor</span>
          <input
            value={instrutor}
            onChange={(e) => setInstrutor(e.target.value)}
            className="campo mt-1"
            placeholder="Quem ministrou o treinamento"
            required
          />
        </label>
      </div>

      <button type="submit" className="botao botao-campo mt-5" disabled={salvando}>
        {salvando ? "Registrando" : "Registrar treinamento"}
      </button>
    </form>
  );
}
