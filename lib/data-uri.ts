/**
 * Valida data URI de imagem vinda do cliente.
 *
 * Um `data:text/html;base64,...` num `<img src>` executa script, e um
 * `data:image/svg+xml` pode carregar script embutido. Por isso a lista é
 * fechada em formatos raster.
 */
const FORMATOS_PERMITIDOS = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export const TAMANHO_MAXIMO = 2_000_000; // ~2MB de base64

export function ehImagemValida(valor: unknown): valor is string {
  if (typeof valor !== "string" || valor.length === 0) return false;
  if (valor.length > TAMANHO_MAXIMO) return false;
  return FORMATOS_PERMITIDOS.test(valor);
}

/** Devolve o data URI se for imagem válida; senão, undefined. */
export function sanitizarImagem(valor: unknown): string | undefined {
  return ehImagemValida(valor) ? valor : undefined;
}
