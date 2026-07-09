const MAX_WIDTH = 800;
const QUALITY = 0.7;

/**
 * Reduz a foto no navegador antes de enviá-la. Sem isso, uma foto de celular
 * vira ~4MB de base64 dentro do db.json a cada incidente registrado.
 *
 * Devolve sempre um data URI JPEG — o formato que a API aceita.
 */
export async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível neste navegador");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}
