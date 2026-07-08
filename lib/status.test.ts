import { describe, it, expect } from "vitest";
import { calcularStatus } from "./status";

describe("calcularStatus", () => {
  it("retorna 'ok' quando validade está a mais de 30 dias", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-12-01";
    expect(calcularStatus(dataValidade, hoje)).toBe("ok");
  });

  it("retorna 'vencendo30d' quando validade está dentro de 30 dias", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-07-20";
    expect(calcularStatus(dataValidade, hoje)).toBe("vencendo30d");
  });

  it("retorna 'vencido' quando validade já passou", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-06-01";
    expect(calcularStatus(dataValidade, hoje)).toBe("vencido");
  });

  it("considera devolvido como 'ok' independente da validade", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-01-01";
    const dataDevolucao = "2026-06-01";
    expect(calcularStatus(dataValidade, hoje, dataDevolucao)).toBe("ok");
  });
});
