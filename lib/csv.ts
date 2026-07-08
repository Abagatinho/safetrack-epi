/**
 * Excel em português usa ";" como separador e espera BOM para ler acentos.
 * Sem o BOM, "Metalúrgica" chega como "MetalÃºrgica".
 */
const SEPARADOR = ";";
const BOM = "﻿";

function escapar(valor: string | number): string {
  const texto = String(valor);
  if (texto.includes(SEPARADOR) || texto.includes('"') || texto.includes("\n")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function gerarCsv(cabecalhos: string[], linhas: (string | number)[][]): string {
  const conteudo = [cabecalhos, ...linhas]
    .map((linha) => linha.map(escapar).join(SEPARADOR))
    .join("\r\n");

  return BOM + conteudo;
}

export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();

  URL.revokeObjectURL(url);
}
