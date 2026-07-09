import { describe, it, expect } from "vitest";
import { generateCsv } from "./csv";

const BOM = "﻿";

describe("generateCsv", () => {
  it("separa colunas com ponto e vírgula e linhas com CRLF", () => {
    const csv = generateCsv(["Nome", "Função"], [["Marcos Silva", "Soldador"]]);
    expect(csv).toBe(`${BOM}Nome;Função\r\nMarcos Silva;Soldador`);
  });

  it("começa com BOM para o Excel ler acentos", () => {
    const csv = generateCsv(["Empresa"], [["Metalúrgica Recife"]]);
    expect(csv.startsWith(BOM)).toBe(true);
  });

  it("envolve em aspas o valor que contém o separador", () => {
    const csv = generateCsv(["Descrição"], [["Queda; sem ferimento"]]);
    expect(csv).toContain('"Queda; sem ferimento"');
  });

  it("duplica aspas internas, sem quebrar a coluna", () => {
    const csv = generateCsv(["Descrição"], [['Disse "atenção" ao operador']]);
    expect(csv).toContain('"Disse ""atenção"" ao operador"');
  });

  it("preserva quebra de linha dentro de um campo, entre aspas", () => {
    const csv = generateCsv(["Descrição"], [["Linha 1\nLinha 2"]]);
    expect(csv).toContain('"Linha 1\nLinha 2"');
  });

  it("aceita números sem aspas", () => {
    const csv = generateCsv(["Total"], [[42]]);
    expect(csv).toBe(`${BOM}Total\r\n42`);
  });
});
