import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Colaborador } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.colaboradores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: Colaborador = {
    id: `col-${Date.now()}`,
    nome: body.nome,
    funcao: body.funcao,
    empresaCliente: body.empresaCliente,
    foto: body.foto,
  };

  db.colaboradores.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
