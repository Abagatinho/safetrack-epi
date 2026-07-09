import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { readBody } from "@/lib/request";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const apr = db.aprs.find((a) => a.id === id);
  if (!apr) {
    return NextResponse.json({ error: "APR não encontrada" }, { status: 404 });
  }

  if (typeof body.approvedBy !== "string" || !body.approvedBy.trim()) {
    return NextResponse.json({ error: "Informe quem aprova a APR" }, { status: 400 });
  }

  // Reaprovar não é erro, mas também não reescreve a autoria da primeira vez:
  // a APR já aprovada é o registro de quem assumiu a análise.
  if (apr.status === "approved") {
    return NextResponse.json(apr);
  }

  apr.status = "approved";
  apr.approvedBy = body.approvedBy.trim();
  apr.approvedAt = new Date().toISOString().slice(0, 10);

  await writeDB(db);
  return NextResponse.json(apr);
}
