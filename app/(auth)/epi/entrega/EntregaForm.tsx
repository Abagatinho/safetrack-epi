"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Colaborador, TipoEPI } from "@/lib/types";

export function EntregaForm({
  colaboradores,
  tiposEpi,
}: {
  colaboradores: Colaborador[];
  tiposEpi: TipoEPI[];
}) {
  const router = useRouter();
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id ?? "");
  const [tipoEpiId, setTipoEpiId] = useState(tiposEpi[0]?.id ?? "");
  const [assinaturaNome, setAssinaturaNome] = useState("");
  const [confirmada, setConfirmada] = useState<{ qrCodeValor: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, tipoEpiId, assinaturaNome }),
    });
    const entrega = await res.json();
    setConfirmada(entrega);
    setAssinaturaNome("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <label className="text-sm">
          Colaborador
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
          >
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          EPI
          <select
            value={tipoEpiId}
            onChange={(e) => setTipoEpiId(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
          >
            {tiposEpi.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Assinatura (nome de confirmação)
          <input
            value={assinaturaNome}
            onChange={(e) => setAssinaturaNome(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
            required
          />
        </label>
        <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm">
          Registrar entrega
        </button>
      </form>

      {confirmada && (
        <div className="mt-6 border rounded p-4 inline-block text-center">
          <p className="text-sm text-gray-500 mb-2">QR Code do equipamento (ilustrativo)</p>
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500 mx-auto">
            {confirmada.qrCodeValor}
          </div>
        </div>
      )}
    </div>
  );
}
