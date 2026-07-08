"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovoColaboradorForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [empresaCliente, setEmpresaCliente] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/colaboradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, funcao, empresaCliente }),
    });
    setNome("");
    setFuncao("");
    setEmpresaCliente("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <input
        placeholder="Função"
        value={funcao}
        onChange={(e) => setFuncao(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <input
        placeholder="Empresa cliente"
        value={empresaCliente}
        onChange={(e) => setEmpresaCliente(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <button type="submit" className="bg-black text-white rounded px-3 py-1 text-sm">
        Cadastrar
      </button>
    </form>
  );
}
