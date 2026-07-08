"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GravidadeIncidente } from "@/lib/types";
import { reduzirImagem } from "@/lib/imagem";

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
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function selecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErroFoto(null);
    try {
      setFotoUrl(await reduzirImagem(arquivo));
    } catch {
      setErroFoto("Não foi possível ler essa imagem. Tente outro arquivo.");
      setFotoUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const res = await fetch("/api/incidentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ local, gravidade, descricao, fotoUrl }),
    });

    setSalvando(false);

    if (!res.ok) {
      const { error } = await res.json();
      setErroFoto(error ?? "Não foi possível registrar o incidente.");
      return;
    }

    setLocal("");
    setDescricao("");
    setGravidade("leve");
    setFotoUrl(null);
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

        <div>
          <label className="block">
            <span className="etiqueta">Foto do local</span>
            {/* capture= abre a câmera direto no celular, que é onde o técnico está. */}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              onChange={selecionarFoto}
              className="campo mt-1 file:mr-3 file:border-0 file:bg-grafite file:text-aco file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-wider"
            />
          </label>

          {fotoUrl && (
            <div className="mt-3 flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URI local */}
              <img
                src={fotoUrl}
                alt="Pré-visualização da foto do incidente"
                className="w-28 h-28 object-cover border border-traco"
              />
              <button
                type="button"
                onClick={() => setFotoUrl(null)}
                className="etiqueta text-advertencia hover:underline"
              >
                Remover foto
              </button>
            </div>
          )}

          {erroFoto && <p className="etiqueta text-perigo mt-2">{erroFoto}</p>}
        </div>

        <button type="submit" className="botao botao-campo mt-2" disabled={salvando}>
          {salvando ? "Registrando" : "Registrar incidente"}
        </button>
      </div>
    </form>
  );
}
