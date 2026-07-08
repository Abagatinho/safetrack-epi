import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calcularStatus, calcularDataValidade } from "@/lib/status";
import type { EntregaEPI, StatusEntrega } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await readDB();
  const statusFiltro = req.nextUrl.searchParams.get("status") as StatusEntrega | null;
  const hoje = new Date();

  const entregasComStatus = db.entregas.map((e) => ({
    ...e,
    status: calcularStatus(e.dataValidade, hoje, e.dataDevolucao),
  }));

  const resultado = statusFiltro
    ? entregasComStatus.filter((e) => e.status === statusFiltro)
    : entregasComStatus;

  return NextResponse.json(resultado);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const tipoEpi = db.tiposEpi.find((t) => t.id === body.tipoEpiId);
  if (!tipoEpi) {
    return NextResponse.json({ error: "tipoEpiId inválido" }, { status: 400 });
  }

  const dataEntrega = body.dataEntrega ?? new Date().toISOString().slice(0, 10);
  const novaEntrega: EntregaEPI = {
    id: `ent-${Date.now()}`,
    colaboradorId: body.colaboradorId,
    tipoEpiId: body.tipoEpiId,
    dataEntrega,
    dataValidade: calcularDataValidade(dataEntrega, tipoEpi.validadeMeses),
    assinaturaNome: body.assinaturaNome,
    assinaturaData: dataEntrega,
    qrCodeValor: `ent-${Date.now()}`,
  };

  db.entregas.push(novaEntrega);
  await writeDB(db);

  return NextResponse.json(novaEntrega, { status: 201 });
}
