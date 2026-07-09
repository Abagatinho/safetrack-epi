import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sanitizeImage } from "@/lib/data-uri";
import { ltrStatus } from "@/lib/ltr";
import { readBody } from "@/lib/request";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const ltr = db.ltrs.find((l) => l.id === id);
  if (!ltr) {
    return NextResponse.json({ error: "LTR não encontrada" }, { status: 404 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Informe quem encerra a liberação" }, { status: 400 });
  }

  if (body.image && !sanitizeImage(body.image)) {
    return NextResponse.json(
      { error: "assinatura deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const status = ltrStatus(ltr, new Date());

  // Uma LTR expirada ainda pode — e deve — ser encerrada: o trabalho acabou,
  // alguém precisa assinar que a área ficou em condição segura. O que não se
  // faz é encerrar duas vezes, nem encerrar o que foi cancelado.
  if (status === "closed" || status === "cancelled") {
    const label = status === "closed" ? "encerrada" : "cancelada";
    return NextResponse.json({ error: `Esta liberação já está ${label}.` }, { status: 409 });
  }

  ltr.closure = {
    name: body.name.trim(),
    date: new Date().toISOString(),
    image: sanitizeImage(body.image),
  };

  await writeDB(db);
  return NextResponse.json(ltr);
}
