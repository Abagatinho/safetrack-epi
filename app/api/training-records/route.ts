import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calculateStatus, calculateExpiryDate } from "@/lib/status";
import { readBody } from "@/lib/request";
import type { TrainingRecord, ExpiryStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await readDB();
  const statusFilter = req.nextUrl.searchParams.get("status") as ExpiryStatus | null;
  const today = new Date();

  // Mesma regra de validade dos EPIs — a função é a mesma, não uma cópia.
  const recordsWithStatus = db.trainingRecords.map((r) => ({
    ...r,
    status: calculateStatus(r.expiryDate, today),
  }));

  const result = statusFilter
    ? recordsWithStatus.filter((r) => r.status === statusFilter)
    : recordsWithStatus;

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const training = db.trainings.find((t) => t.id === body.trainingId);
  if (!training) {
    return NextResponse.json({ error: "trainingId inválido" }, { status: 400 });
  }

  if (!db.employees.some((e) => e.id === body.employeeId)) {
    return NextResponse.json({ error: "employeeId inválido" }, { status: 400 });
  }

  const completionDate = body.completionDate ?? new Date().toISOString().slice(0, 10);
  const record: TrainingRecord = {
    id: `rec-${Date.now()}`,
    employeeId: body.employeeId,
    trainingId: body.trainingId,
    completionDate,
    expiryDate: calculateExpiryDate(completionDate, training.refresherMonths),
    instructor: body.instructor,
  };

  db.trainingRecords.push(record);
  await writeDB(db);

  return NextResponse.json(record, { status: 201 });
}
