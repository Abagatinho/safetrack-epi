"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ITENS_PADRAO = [
  "EPIs em uso corretamente",
  "Extintores acessíveis",
  "Área de trabalho isolada quando necessário",
  "Sinalização de segurança visível",
];

type Resposta = "sim" | "nao" | "na";

const OPCOES: { valor: Resposta; label: string; ativo: string }[] = [
  { valor: "sim", label: "Sim", ativo: "bg-seguranca text-aco border-seguranca" },
  { valor: "nao", label: "Não", ativo: "bg-perigo text-aco border-perigo" },
  { valor: "na", label: "N/A", ativo: "bg-grafite text-aco border-grafite" },
];

export function ChecklistForm() {
  const router = useRouter();
  const [setor, setSetor] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [salvando, setSalvando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const itens = ITENS_PADRAO.map((descricao) => ({
      descricao,
      resposta: respostas[descricao] ?? "na",
    }));

    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setor, tecnicoResponsavel, itens }),
    });

    setSetor("");
    setTecnicoResponsavel("");
    setRespostas({});
    setSalvando(false);
    setEnviado(true);
    router.refresh();
  }

  const naoConformidades = Object.values(respostas).filter((r) => r === "nao").length;

  return (
    <form onSubmit={handleSubmit} className="placa p-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="etiqueta">Setor</span>
          <input
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            className="campo mt-1"
            placeholder="Solda, pátio, altura…"
            required
          />
        </label>
        <label className="block">
          <span className="etiqueta">Técnico responsável</span>
          <input
            value={tecnicoResponsavel}
            onChange={(e) => setTecnicoResponsavel(e.target.value)}
            className="campo mt-1"
            required
          />
        </label>
      </div>

      <p className="etiqueta mb-3">Itens de verificação</p>

      <ul className="border-t border-traco">
        {ITENS_PADRAO.map((item) => (
          <li
            key={item}
            className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-traco"
          >
            <span className="text-sm flex-1 min-w-[12rem]">{item}</span>

            <fieldset className="flex gap-px" aria-label={item}>
              {OPCOES.map((opcao) => {
                const marcado = respostas[item] === opcao.valor;
                return (
                  <label
                    key={opcao.valor}
                    className={`etiqueta cursor-pointer px-4 py-2 border select-none transition-colors ${
                      marcado
                        ? opcao.ativo
                        : "bg-aco border-traco text-fumaca hover:border-grafite"
                    }`}
                  >
                    <input
                      type="radio"
                      name={item}
                      value={opcao.valor}
                      checked={marcado}
                      onChange={() =>
                        setRespostas((prev) => ({ ...prev, [item]: opcao.valor }))
                      }
                      className="sr-only"
                    />
                    {opcao.label}
                  </label>
                );
              })}
            </fieldset>
          </li>
        ))}
      </ul>

      {naoConformidades > 0 && (
        <p className="etiqueta text-perigo mt-4">
          {naoConformidades} não conformidade{naoConformidades > 1 ? "s" : ""} neste checklist
        </p>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button type="submit" className="botao botao-campo" disabled={salvando}>
          {salvando ? "Registrando" : "Registrar checklist"}
        </button>
        {enviado && !salvando && (
          <span className="etiqueta text-seguranca">Checklist registrado</span>
        )}
      </div>
    </form>
  );
}
