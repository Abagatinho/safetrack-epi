import { describe, it, expect } from "vitest";
import { ehImagemValida, sanitizarImagem, TAMANHO_MAXIMO } from "./data-uri";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

describe("ehImagemValida", () => {
  it("aceita PNG, JPEG e WebP", () => {
    expect(ehImagemValida(PNG)).toBe(true);
    expect(ehImagemValida("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
    expect(ehImagemValida("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("rejeita data:text/html — executa script num <img src>", () => {
    expect(ehImagemValida("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
  });

  it("rejeita SVG — pode carregar script embutido", () => {
    expect(ehImagemValida("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
  });

  it("rejeita javascript:", () => {
    expect(ehImagemValida("javascript:alert(1)")).toBe(false);
  });

  it("rejeita base64 com caracteres fora do alfabeto", () => {
    expect(ehImagemValida("data:image/png;base64,<script>")).toBe(false);
  });

  it("rejeita imagem acima do tamanho máximo", () => {
    const gigante = `data:image/png;base64,${"A".repeat(TAMANHO_MAXIMO)}`;
    expect(ehImagemValida(gigante)).toBe(false);
  });

  it("rejeita valores que não são string", () => {
    expect(ehImagemValida(null)).toBe(false);
    expect(ehImagemValida(42)).toBe(false);
    expect(ehImagemValida("")).toBe(false);
  });

  it("sanitizarImagem devolve undefined no lugar de valor inválido", () => {
    expect(sanitizarImagem(PNG)).toBe(PNG);
    expect(sanitizarImagem("javascript:alert(1)")).toBeUndefined();
  });
});
