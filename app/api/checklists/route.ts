import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { readBody } from "@/lib/request";
import type { DailyChecklist } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.checklists);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const checklist: DailyChecklist = {
    id: `chk-${Date.now()}`,
    sector: body.sector,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    responsibleTechnician: body.responsibleTechnician,
    items: body.items,
  };

  db.checklists.push(checklist);
  await writeDB(db);

  return NextResponse.json(checklist, { status: 201 });
}
