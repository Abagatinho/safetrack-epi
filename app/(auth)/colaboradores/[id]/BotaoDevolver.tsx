"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotaoDevolver({ entregaId }: { entregaId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function devolver() {
    setEnviando(true);
    await fetch(`/api/entregas/${entregaId}/devolucao`, { method: "POST" });
    setEnviando(false);
    router.refresh();
  }

  return (
    <button
      onClick={devolver}
      disabled={enviando}
      className="etiqueta text-advertencia hover:underline disabled:opacity-50 disabled:no-underline"
    >
      {enviando ? "Registrando" : "Registrar devolução"}
    </button>
  );
}
