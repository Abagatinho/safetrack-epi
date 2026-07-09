import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { sanitizeImage } from "@/lib/data-uri";
import { readBody } from "@/lib/request";
import type { Incident, IncidentSeverity } from "@/lib/types";

const SEVERITIES: IncidentSeverity[] = ["minor", "moderate", "severe"];

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.incidents);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  if (!SEVERITIES.includes(body.severity)) {
    return NextResponse.json({ error: "severity inválida" }, { status: 400 });
  }

  if (body.photoUrl && !sanitizeImage(body.photoUrl)) {
    return NextResponse.json(
      { error: "foto deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const incident: Incident = {
    id: `inc-${Date.now()}`,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    location: body.location,
    employeeId: body.employeeId,
    severity: body.severity,
    description: body.description,
    photoUrl: sanitizeImage(body.photoUrl),
  };

  db.incidents.push(incident);
  await writeDB(db);

  return NextResponse.json(incident, { status: 201 });
}
