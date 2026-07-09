import { describe, it, expect } from "vitest";
import { calculateStatus } from "./status";

describe("calculateStatus", () => {
  it("retorna 'ok' quando validade está a mais de 30 dias", () => {
    const today = new Date("2026-07-08");
    expect(calculateStatus("2026-12-01", today)).toBe("ok");
  });

  it("retorna 'expiringSoon' quando validade está dentro de 30 dias", () => {
    const today = new Date("2026-07-08");
    expect(calculateStatus("2026-07-20", today)).toBe("expiringSoon");
  });

  it("retorna 'expired' quando validade já passou", () => {
    const today = new Date("2026-07-08");
    expect(calculateStatus("2026-06-01", today)).toBe("expired");
  });

  it("considera devolvido como 'ok' independente da validade", () => {
    const today = new Date("2026-07-08");
    expect(calculateStatus("2026-01-01", today, "2026-06-01")).toBe("ok");
  });
});
