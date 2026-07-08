import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Incidente, GravidadeIncidente } from "@/lib/types";

const GRAVIDADES: GravidadeIncidente[] = ["leve", "moderado", "grave"];

/** Aceita apenas data URI de imagem. `data:text/html,...` num <img src> é XSS. */
const FOTO_PERMITIDA = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

const TAMANHO_MAXIMO_FOTO = 2_000_000; // ~2MB de base64

function sanitizarFoto(valor: unknown): string | undefined {
  if (typeof valor !== "string" || valor.length === 0) return undefined;
  if (valor.length > TAMANHO_MAXIMO_FOTO) return undefined;
  return FOTO_PERMITIDA.test(valor) ? valor : undefined;
}

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.incidentes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  if (!GRAVIDADES.includes(body.gravidade)) {
    return NextResponse.json({ error: "gravidade inválida" }, { status: 400 });
  }

  if (body.fotoUrl && !sanitizarFoto(body.fotoUrl)) {
    return NextResponse.json(
      { error: "foto deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const novo: Incidente = {
    id: `inc-${Date.now()}`,
    data: body.data ?? new Date().toISOString().slice(0, 10),
    local: body.local,
    colaboradorId: body.colaboradorId,
    gravidade: body.gravidade,
    descricao: body.descricao,
    fotoUrl: sanitizarFoto(body.fotoUrl),
  };

  db.incidentes.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
