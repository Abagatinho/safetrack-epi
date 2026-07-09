import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const delivery = db.deliveries.find((d) => d.id === id);

  if (!delivery) {
    return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 });
  }

  delivery.returnDate = new Date().toISOString().slice(0, 10);
  await writeDB(db);

  return NextResponse.json(delivery);
}
