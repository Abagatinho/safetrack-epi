"use client";

import { useState } from "react";

export function BotaoExportar() {
  const [avisado, setAvisado] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="botao" onClick={() => setAvisado(true)}>
        Exportar PDF
      </button>
      <button type="button" className="botao" onClick={() => setAvisado(true)}>
        Exportar Excel
      </button>

      {avisado && (
        <p className="etiqueta text-advertencia">
          A exportação de arquivo entra na versão de produção. Este relatório é a prévia do
          conteúdo.
        </p>
      )}
    </div>
  );
}
