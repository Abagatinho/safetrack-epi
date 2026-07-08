import { headers } from "next/headers";

/**
 * Base URL a partir do host da request: funciona local e na Vercel, sem
 * variável de ambiente. Server components não aceitam fetch relativo.
 */
export async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${await baseUrl()}${path}`, { cache: "no-store" });
  return res.json();
}
