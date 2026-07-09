import { describe, it, expect } from "vitest";
import { isValidImage, sanitizeImage, MAX_SIZE } from "./data-uri";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

describe("isValidImage", () => {
  it("aceita PNG, JPEG e WebP", () => {
    expect(isValidImage(PNG)).toBe(true);
    expect(isValidImage("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
    expect(isValidImage("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("rejeita data:text/html — executa script num <img src>", () => {
    expect(isValidImage("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
  });

  it("rejeita SVG — pode carregar script embutido", () => {
    expect(isValidImage("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
  });

  it("rejeita javascript:", () => {
    expect(isValidImage("javascript:alert(1)")).toBe(false);
  });

  it("rejeita base64 com caracteres fora do alfabeto", () => {
    expect(isValidImage("data:image/png;base64,<script>")).toBe(false);
  });

  it("rejeita imagem acima do tamanho máximo", () => {
    const huge = `data:image/png;base64,${"A".repeat(MAX_SIZE)}`;
    expect(isValidImage(huge)).toBe(false);
  });

  it("rejeita valores que não são string", () => {
    expect(isValidImage(null)).toBe(false);
    expect(isValidImage(42)).toBe(false);
    expect(isValidImage("")).toBe(false);
  });

  it("sanitizeImage devolve undefined no lugar de valor inválido", () => {
    expect(sanitizeImage(PNG)).toBe(PNG);
    expect(sanitizeImage("javascript:alert(1)")).toBeUndefined();
  });
});
