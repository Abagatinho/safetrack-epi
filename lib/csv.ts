/**
 * Excel em português usa ";" como separador e espera BOM para ler acentos.
 * Sem o BOM, "Metalúrgica" chega como "MetalÃºrgica".
 */
const SEPARATOR = ";";
const BOM = "﻿";

function escape(value: string | number): string {
  const text = String(value);
  if (text.includes(SEPARATOR) || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function generateCsv(headers: string[], rows: (string | number)[][]): string {
  const content = [headers, ...rows]
    .map((row) => row.map(escape).join(SEPARATOR))
    .join("\r\n");

  return BOM + content;
}

export function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
