import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { ChecklistDiario } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.checklists);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: ChecklistDiario = {
    id: `chk-${Date.now()}`,
    setor: body.setor,
    data: body.data ?? new Date().toISOString().slice(0, 10),
    tecnicoResponsavel: body.tecnicoResponsavel,
    itens: body.itens,
  };

  db.checklists.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
