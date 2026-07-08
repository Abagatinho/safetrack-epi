"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ITENS_PADRAO = [
  "EPIs em uso corretamente",
  "Extintores acessíveis",
  "Área de trabalho isolada quando necessário",
  "Sinalização de segurança visível",
];

export function ChecklistForm() {
  const router = useRouter();
  const [setor, setSetor] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [respostas, setRespostas] = useState<Record<string, "sim" | "nao" | "na">>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        placeholder="Setor"
        value={setor}
        onChange={(e) => setSetor(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <input
        placeholder="Técnico responsável"
        value={tecnicoResponsavel}
        onChange={(e) => setTecnicoResponsavel(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      {ITENS_PADRAO.map((item) => (
        <div key={item} className="flex items-center justify-between text-sm border-b pb-2">
          <span>{item}</span>
          <select
            value={respostas[item] ?? "na"}
            onChange={(e) =>
              setRespostas((prev) => ({ ...prev, [item]: e.target.value as "sim" | "nao" | "na" }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
            <option value="na">N/A</option>
          </select>
        </div>
      ))}
      <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm mt-2">
        Registrar checklist
      </button>
    </form>
  );
}
