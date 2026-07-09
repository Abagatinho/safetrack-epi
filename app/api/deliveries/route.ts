import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calculateStatus, calculateExpiryDate } from "@/lib/status";
import { sanitizeImage } from "@/lib/data-uri";
import { readBody } from "@/lib/request";
import type { PpeDelivery, ExpiryStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await readDB();
  const statusFilter = req.nextUrl.searchParams.get("status") as ExpiryStatus | null;
  const today = new Date();

  const deliveriesWithStatus = db.deliveries.map((d) => ({
    ...d,
    status: calculateStatus(d.expiryDate, today, d.returnDate),
  }));

  const result = statusFilter
    ? deliveriesWithStatus.filter((d) => d.status === statusFilter)
    : deliveriesWithStatus;

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const ppeType = db.ppeTypes.find((t) => t.id === body.ppeTypeId);
  if (!ppeType) {
    return NextResponse.json({ error: "ppeTypeId inválido" }, { status: 400 });
  }

  if (!db.employees.some((e) => e.id === body.employeeId)) {
    return NextResponse.json({ error: "employeeId inválido" }, { status: 400 });
  }

  if (body.signatureImage && !sanitizeImage(body.signatureImage)) {
    return NextResponse.json(
      { error: "assinatura deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const deliveryDate = body.deliveryDate ?? new Date().toISOString().slice(0, 10);
  // Um único id para a entrega e para o QR: dois Date.now() podiam divergir.
  const id = `del-${Date.now()}`;

  const delivery: PpeDelivery = {
    id,
    employeeId: body.employeeId,
    ppeTypeId: body.ppeTypeId,
    deliveryDate,
    expiryDate: calculateExpiryDate(deliveryDate, ppeType.validityMonths),
    signatureName: body.signatureName,
    signatureDate: deliveryDate,
    signatureImage: sanitizeImage(body.signatureImage),
    qrCodeValue: id,
  };

  db.deliveries.push(delivery);
  await writeDB(db);

  return NextResponse.json(delivery, { status: 201 });
}
