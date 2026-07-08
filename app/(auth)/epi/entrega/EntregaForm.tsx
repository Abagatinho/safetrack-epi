"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Colaborador, TipoEPI, EntregaEPI } from "@/lib/types";
import { QrCode } from "@/components/ui/QrCode";

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
  const [salvando, setSalvando] = useState(false);
  const [confirmada, setConfirmada] = useState<EntregaEPI | null>(null);

  const tipoSelecionado = tiposEpi.find((t) => t.id === tipoEpiId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, tipoEpiId, assinaturaNome }),
    });
    const entrega = await res.json();
    setConfirmada(entrega);
    setAssinaturaNome("");
    setSalvando(false);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,26rem)_auto] gap-8 items-start">
      <form onSubmit={handleSubmit} className="placa p-5">
        <div className="flex flex-col gap-4">
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
            <span className="etiqueta">Equipamento</span>
            <select
              value={tipoEpiId}
              onChange={(e) => setTipoEpiId(e.target.value)}
              className="campo mt-1"
            >
              {tiposEpi.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
            {tipoSelecionado && (
              <span className="dado text-fumaca mt-2 block">
                Validade de {tipoSelecionado.validadeMeses} meses
              </span>
            )}
          </label>

          <label className="block">
            <span className="etiqueta">Assinatura de recebimento</span>
            <input
              value={assinaturaNome}
              onChange={(e) => setAssinaturaNome(e.target.value)}
              className="campo mt-1"
              placeholder="Nome de quem recebe"
              required
            />
          </label>

          <button type="submit" className="botao botao-campo mt-2" disabled={salvando}>
            {salvando ? "Registrando" : "Registrar entrega"}
          </button>
        </div>
      </form>

      {confirmada && (
        <div className="placa p-5 text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="pictograma bg-seguranca" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-aco">
                <path
                  d="M4 8.5l2.8 2.8L12 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="square"
                />
              </svg>
            </span>
            <span className="etiqueta text-seguranca">Entrega registrada</span>
          </div>

          <div className="flex justify-center">
            <QrCode valor={confirmada.qrCodeValor} tamanho={160} />
          </div>

          <p className="dado mt-3">{confirmada.qrCodeValor}</p>
          <p className="etiqueta mt-1">QR do equipamento</p>
          <p className="dado text-fumaca mt-4">Vence em {confirmada.dataValidade}</p>
        </div>
      )}
    </div>
  );
}
