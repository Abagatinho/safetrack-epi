"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovoColaboradorForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [empresaCliente, setEmpresaCliente] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    await fetch("/api/colaboradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, funcao, empresaCliente }),
    });
    setNome("");
    setFuncao("");
    setEmpresaCliente("");
    setSalvando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="placa p-4 mb-8">
      <p className="etiqueta mb-4">Novo colaborador</p>
      <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="etiqueta">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="campo mt-1"
            required
          />
        </label>
        <label className="block">
          <span className="etiqueta">Função</span>
          <input
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            className="campo mt-1"
            required
          />
        </label>
        <label className="block">
          <span className="etiqueta">Empresa cliente</span>
          <input
            value={empresaCliente}
            onChange={(e) => setEmpresaCliente(e.target.value)}
            className="campo mt-1"
            required
          />
        </label>
        <button type="submit" className="botao" disabled={salvando}>
          {salvando ? "Salvando" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
