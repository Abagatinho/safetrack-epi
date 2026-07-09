/**
 * Valida data URI de imagem vinda do cliente.
 *
 * Um `data:text/html;base64,...` num `<img src>` executa script, e um
 * `data:image/svg+xml` pode carregar script embutido. Por isso a lista é
 * fechada em formatos raster.
 */
const ALLOWED_FORMATS = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export const MAX_SIZE = 2_000_000; // ~2MB de base64

export function isValidImage(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.length > MAX_SIZE) return false;
  return ALLOWED_FORMATS.test(value);
}

/** Devolve o data URI se for imagem válida; senão, undefined. */
export function sanitizeImage(value: unknown): string | undefined {
  return isValidImage(value) ? value : undefined;
}
