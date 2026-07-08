import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Incidente } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.incidentes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: Incidente = {
    id: `inc-${Date.now()}`,
    data: body.data ?? new Date().toISOString().slice(0, 10),
    local: body.local,
    colaboradorId: body.colaboradorId,
    gravidade: body.gravidade,
    descricao: body.descricao,
    fotoUrl: body.fotoUrl,
  };

  db.incidentes.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
