import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { readBody } from "@/lib/request";
import type { Employee } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.employees);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const employee: Employee = {
    id: `emp-${Date.now()}`,
    name: body.name,
    jobTitle: body.jobTitle,
    clientCompany: body.clientCompany,
    photo: body.photo,
  };

  db.employees.push(employee);
  await writeDB(db);

  return NextResponse.json(employee, { status: 201 });
}
