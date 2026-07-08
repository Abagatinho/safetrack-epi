"use client";

import { useEffect } from "react";
import { gerarCsv, baixarCsv } from "@/lib/csv";

export type LinhaExportacao = (string | number)[];

export function BotaoExportar({
  cabecalhos,
  linhas,
  nomeArquivo,
}: {
  cabecalhos: string[];
  linhas: LinhaExportacao[];
  nomeArquivo: string;
}) {
  // CSS não abre um <details> fechado. Sem isto, a tabela do gráfico ficaria
  // fora do PDF. Vale para Ctrl+P também, não só para o botão.
  useEffect(() => {
    let abertosPorNos: HTMLDetailsElement[] = [];

    function aoImprimir() {
      abertosPorNos = [...document.querySelectorAll("details")].filter((d) => !d.open);
      abertosPorNos.forEach((d) => (d.open = true));
    }

    function aposImprimir() {
      abertosPorNos.forEach((d) => (d.open = false));
      abertosPorNos = [];
    }

    window.addEventListener("beforeprint", aoImprimir);
    window.addEventListener("afterprint", aposImprimir);
    return () => {
      window.removeEventListener("beforeprint", aoImprimir);
      window.removeEventListener("afterprint", aposImprimir);
    };
  }, []);

  function exportarCsv() {
    baixarCsv(nomeArquivo, gerarCsv(cabecalhos, linhas));
  }

  return (
    // Some na impressão: um botão não pertence ao PDF que ele gera.
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button type="button" className="botao" onClick={() => window.print()}>
        Salvar PDF
      </button>
      <button type="button" className="botao" onClick={exportarCsv} disabled={linhas.length === 0}>
        Baixar CSV
      </button>
      <p className="etiqueta">
        {linhas.length === 0
          ? "Sem pendências para exportar"
          : `${linhas.length} pendências · CSV abre no Excel`}
      </p>
    </div>
  );
}
