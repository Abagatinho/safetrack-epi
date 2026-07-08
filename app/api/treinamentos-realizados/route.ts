import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calcularStatus, calcularDataValidade } from "@/lib/status";
import type { TreinamentoRealizado, StatusEntrega } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await readDB();
  const statusFiltro = req.nextUrl.searchParams.get("status") as StatusEntrega | null;
  const hoje = new Date();

  // Mesma regra de validade dos EPIs — a função é a mesma, não uma cópia.
  const comStatus = db.treinamentosRealizados.map((t) => ({
    ...t,
    status: calcularStatus(t.dataValidade, hoje),
  }));

  const resultado = statusFiltro
    ? comStatus.filter((t) => t.status === statusFiltro)
    : comStatus;

  return NextResponse.json(resultado);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const treinamento = db.treinamentos.find((t) => t.id === body.treinamentoId);
  if (!treinamento) {
    return NextResponse.json({ error: "treinamentoId inválido" }, { status: 400 });
  }

  const colaborador = db.colaboradores.find((c) => c.id === body.colaboradorId);
  if (!colaborador) {
    return NextResponse.json({ error: "colaboradorId inválido" }, { status: 400 });
  }

  const dataRealizacao = body.dataRealizacao ?? new Date().toISOString().slice(0, 10);
  const novo: TreinamentoRealizado = {
    id: `trn-${Date.now()}`,
    colaboradorId: body.colaboradorId,
    treinamentoId: body.treinamentoId,
    dataRealizacao,
    dataValidade: calcularDataValidade(dataRealizacao, treinamento.reciclagemMeses),
    instrutor: body.instrutor,
  };

  db.treinamentosRealizados.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
