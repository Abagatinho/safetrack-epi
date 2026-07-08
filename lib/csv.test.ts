import { describe, it, expect } from "vitest";
import { gerarCsv } from "./csv";

const BOM = "﻿";

describe("gerarCsv", () => {
  it("separa colunas com ponto e vírgula e linhas com CRLF", () => {
    const csv = gerarCsv(["Nome", "Função"], [["Marcos Silva", "Soldador"]]);
    expect(csv).toBe(`${BOM}Nome;Função\r\nMarcos Silva;Soldador`);
  });

  it("começa com BOM para o Excel ler acentos", () => {
    const csv = gerarCsv(["Empresa"], [["Metalúrgica Recife"]]);
    expect(csv.startsWith(BOM)).toBe(true);
  });

  it("envolve em aspas o valor que contém o separador", () => {
    const csv = gerarCsv(["Descrição"], [["Queda; sem ferimento"]]);
    expect(csv).toContain('"Queda; sem ferimento"');
  });

  it("duplica aspas internas, sem quebrar a coluna", () => {
    const csv = gerarCsv(["Descrição"], [['Disse "atenção" ao operador']]);
    expect(csv).toContain('"Disse ""atenção"" ao operador"');
  });

  it("preserva quebra de linha dentro de um campo, entre aspas", () => {
    const csv = gerarCsv(["Descrição"], [["Linha 1\nLinha 2"]]);
    expect(csv).toContain('"Linha 1\nLinha 2"');
  });

  it("aceita números sem aspas", () => {
    const csv = gerarCsv(["Total"], [[42]]);
    expect(csv).toBe(`${BOM}Total\r\n42`);
  });
});
