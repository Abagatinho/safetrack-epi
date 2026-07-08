import { headers } from "next/headers";

// Server components não aceitam fetch relativo; monta a base URL a partir
// do host da request pra funcionar tanto local quanto na Vercel.
export async function apiFetch<T>(path: string): Promise<T> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${proto}://${host}${path}`, { cache: "no-store" });
  return res.json();
}
