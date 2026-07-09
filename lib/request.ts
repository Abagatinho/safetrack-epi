/**
 * `req.json()` lança quando o corpo não é JSON — inclusive quando é vazio. Sem
 * isto, um POST malformado vira 500: o cliente lê "erro do servidor" quando o
 * erro foi dele, e o log enche de exceção para uma requisição que nunca teve
 * chance.
 *
 * O tipo é `any` porque é o que `req.json()` devolve: dado de fora, sem forma
 * conhecida. Quem chama valida campo a campo antes de usar.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readBody(req: Request): Promise<Record<string, any> | null> {
  try {
    const body = await req.json();
    return typeof body === "object" && body !== null ? body : null;
  } catch {
    return null;
  }
}
