import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calcularStatus, calcularDataValidade } from "@/lib/status";
import { sanitizarImagem } from "@/lib/data-uri";
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

  if (!db.colaboradores.some((c) => c.id === body.colaboradorId)) {
    return NextResponse.json({ error: "colaboradorId inválido" }, { status: 400 });
  }

  if (body.assinaturaImagem && !sanitizarImagem(body.assinaturaImagem)) {
    return NextResponse.json(
      { error: "assinatura deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const dataEntrega = body.dataEntrega ?? new Date().toISOString().slice(0, 10);
  // Um único id para a entrega e para o QR: dois Date.now() podiam divergir.
  const id = `ent-${Date.now()}`;

  const novaEntrega: EntregaEPI = {
    id,
    colaboradorId: body.colaboradorId,
    tipoEpiId: body.tipoEpiId,
    dataEntrega,
    dataValidade: calcularDataValidade(dataEntrega, tipoEpi.validadeMeses),
    assinaturaNome: body.assinaturaNome,
    assinaturaData: dataEntrega,
    assinaturaImagem: sanitizarImagem(body.assinaturaImagem),
    qrCodeValor: id,
  };

  db.entregas.push(novaEntrega);
  await writeDB(db);

  return NextResponse.json(novaEntrega, { status: 201 });
}
