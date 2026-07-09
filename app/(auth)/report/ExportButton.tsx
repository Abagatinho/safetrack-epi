"use client";

import { useEffect } from "react";
import { generateCsv, downloadCsv } from "@/lib/csv";

export type ExportRow = (string | number)[];

export function ExportButton({
  headers,
  rows,
  fileName,
}: {
  headers: string[];
  rows: ExportRow[];
  fileName: string;
}) {
  // CSS não abre um <details> fechado. Sem isto, a tabela do gráfico ficaria
  // fora do PDF. Vale para Ctrl+P também, não só para o botão.
  useEffect(() => {
    let openedByUs: HTMLDetailsElement[] = [];

    function onBeforePrint() {
      openedByUs = [...document.querySelectorAll("details")].filter((d) => !d.open);
      openedByUs.forEach((d) => (d.open = true));
    }

    function onAfterPrint() {
      openedByUs.forEach((d) => (d.open = false));
      openedByUs = [];
    }

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  function exportCsv() {
    downloadCsv(fileName, generateCsv(headers, rows));
  }

  return (
    // Some na impressão: um botão não pertence ao PDF que ele gera.
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button type="button" className="button" onClick={() => window.print()}>
        Salvar PDF
      </button>
      <button type="button" className="button" onClick={exportCsv} disabled={rows.length === 0}>
        Baixar CSV
      </button>
      <p className="label">
        {rows.length === 0
          ? "Sem pendências para exportar"
          : `${rows.length} pendências · CSV abre no Excel`}
      </p>
    </div>
  );
}
