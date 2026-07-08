const LARGURA_MAXIMA = 800;
const QUALIDADE = 0.7;

/**
 * Reduz a foto no navegador antes de enviá-la. Sem isso, uma foto de celular
 * vira ~4MB de base64 dentro do db.json a cada incidente registrado.
 *
 * Devolve sempre um data URI JPEG — o formato que a API aceita.
 */
export async function reduzirImagem(arquivo: File): Promise<string> {
  const bitmap = await createImageBitmap(arquivo);

  const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Canvas indisponível neste navegador");

  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALIDADE);
}
