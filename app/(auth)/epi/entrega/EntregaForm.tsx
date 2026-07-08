"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Colaborador, TipoEPI, EntregaEPI } from "@/lib/types";
import { QrCode } from "@/components/ui/QrCode";
import { CanvasAssinatura } from "@/components/ui/CanvasAssinatura";

export function EntregaForm({
  colaboradores,
  tiposEpi,
  origem,
}: {
  colaboradores: Colaborador[];
  tiposEpi: TipoEPI[];
  origem: string;
}) {
  const router = useRouter();
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id ?? "");
  const [tipoEpiId, setTipoEpiId] = useState(tiposEpi[0]?.id ?? "");
  const [assinaturaNome, setAssinaturaNome] = useState("");
  const [assinaturaImagem, setAssinaturaImagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState<EntregaEPI | null>(null);

  const tipoSelecionado = tiposEpi.find((t) => t.id === tipoEpiId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assinaturaImagem) {
      setErro("Peça ao colaborador para assinar antes de registrar a entrega.");
      return;
    }

    setErro(null);
    setSalvando(true);

    const res = await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, tipoEpiId, assinaturaNome, assinaturaImagem }),
    });

    setSalvando(false);

    if (!res.ok) {
      const { error } = await res.json();
      setErro(error ?? "Não foi possível registrar a entrega.");
      return;
    }

    setConfirmada(await res.json());
    setAssinaturaNome("");
    setAssinaturaImagem(null);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,28rem)_auto] gap-8 items-start">
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
            <span className="etiqueta">Nome de quem recebe</span>
            <input
              value={assinaturaNome}
              onChange={(e) => setAssinaturaNome(e.target.value)}
              className="campo mt-1"
              required
            />
          </label>

          <CanvasAssinatura onChange={setAssinaturaImagem} />

          {erro && <p className="etiqueta text-perigo">{erro}</p>}

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
            {/* Codifica a URL da ficha: escanear abre o equipamento no celular. */}
            <QrCode valor={`${origem}/equipamento/${confirmada.id}`} tamanho={160} />
          </div>

          <p className="dado mt-3">{confirmada.qrCodeValor}</p>
          <p className="etiqueta mt-1">Cole na etiqueta do equipamento</p>
          <p className="dado text-fumaca mt-4">Vence em {confirmada.dataValidade}</p>

          <Link
            href={`/equipamento/${confirmada.id}`}
            className="etiqueta text-advertencia hover:underline inline-block mt-4"
          >
            Abrir ficha do equipamento →
          </Link>
        </div>
      )}
    </div>
  );
}
