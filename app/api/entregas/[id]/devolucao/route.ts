import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await readDB();
  const entrega = db.entregas.find((e) => e.id === id);

  if (!entrega) {
    return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 });
  }

  entrega.dataDevolucao = new Date().toISOString().slice(0, 10);
  await writeDB(db);

  return NextResponse.json(entrega);
}
