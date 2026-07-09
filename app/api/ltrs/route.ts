import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { issuanceBlockers, ltrStatus } from "@/lib/ltr";
import { sanitizeImage } from "@/lib/data-uri";
import { readBody } from "@/lib/request";
import type { Ltr, ChecklistAnswer } from "@/lib/types";

/** Janela padrão de uma liberação, quando o emitente não informa outra. */
const DEFAULT_VALIDITY_HOURS = 8;
const MAX_VALIDITY_HOURS = 24;

export async function GET(req: NextRequest) {
  const db = await readDB();
  const now = new Date();
  const filter = req.nextUrl.searchParams.get("status");

  const withStatus = db.ltrs.map((l) => ({ ...l, status: ltrStatus(l, now) }));
  const result = filter ? withStatus.filter((l) => l.status === filter) : withStatus;

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();
  const now = new Date();

  const template = db.checklistTemplates.find((t) => t.id === body.templateId);
  if (!template) {
    return NextResponse.json({ error: "templateId inválido" }, { status: 400 });
  }

  const apr = db.aprs.find((a) => a.id === body.aprId);

  const workerIds: string[] = Array.isArray(body.workerIds) ? body.workerIds : [];
  const workers = db.employees.filter((e) => workerIds.includes(e.id));
  if (workers.length !== workerIds.length) {
    return NextResponse.json({ error: "workerIds contém id inválido" }, { status: 400 });
  }

  for (const field of ["location", "workDescription", "requester"] as const) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json({ error: `${field} é obrigatório` }, { status: 400 });
    }
  }

  if (typeof body.issuerName !== "string" || !body.issuerName.trim()) {
    return NextResponse.json({ error: "Informe quem emite a liberação" }, { status: 400 });
  }

  if (body.issuerSignature && !sanitizeImage(body.issuerSignature)) {
    return NextResponse.json(
      { error: "assinatura deve ser uma imagem PNG, JPEG ou WebP de até 2MB" },
      { status: 400 }
    );
  }

  const answers: ChecklistAnswer[] = Array.isArray(body.answers) ? body.answers : [];

  /**
   * Os mesmos gates que a tela avalia ao vivo. A tela existe para dar retorno
   * imediato; quem decide é aqui, porque o cliente pode mentir.
   */
  const blockers = issuanceBlockers({
    apr,
    template,
    workers,
    trainings: db.trainings,
    records: db.trainingRecords,
    deliveries: db.deliveries,
    ppeTypes: db.ppeTypes,
    answers,
    today: now,
  });

  if (blockers.length > 0) {
    // 422: o pedido está bem formado, mas a realidade não permite emitir.
    return NextResponse.json({ error: "Emissão bloqueada", blockers }, { status: 422 });
  }

  // `issuanceBlockers` já barra APR ausente; sem esta guarda o compilador não
  // sabe disso, e um `apr!` esconderia a dependência entre as duas coisas.
  if (!apr) {
    return NextResponse.json({ error: "aprId inválido" }, { status: 400 });
  }

  const validUntil = resolveValidUntil(body.validUntil, now);
  if (!validUntil) {
    return NextResponse.json(
      { error: `A validade deve estar no futuro e em até ${MAX_VALIDITY_HOURS}h` },
      { status: 400 }
    );
  }

  const id = `ltr-${Date.now()}`;
  const issuedAt = now.toISOString();

  const ltr: Ltr = {
    id,
    aprId: apr.id,
    templateId: template.id,
    location: body.location.trim(),
    workDescription: body.workDescription.trim(),
    issuedAt,
    validUntil,
    requester: body.requester.trim(),
    issuer: {
      name: body.issuerName.trim(),
      date: issuedAt,
      image: sanitizeImage(body.issuerSignature),
    },
    workerIds,
    answers,
    // Congela o que foi conferido. Editar o modelo amanhã não pode mudar o que
    // este documento prova ter sido verificado hoje.
    aprSnapshot: structuredClone(apr),
    templateSnapshot: structuredClone(template),
    qrCodeValue: id,
  };

  db.ltrs.push(ltr);
  await writeDB(db);

  return NextResponse.json(ltr, { status: 201 });
}

function resolveValidUntil(informed: unknown, now: Date): string | null {
  if (typeof informed !== "string" || !informed) {
    const fallback = new Date(now.getTime() + DEFAULT_VALIDITY_HOURS * 3600_000);
    return fallback.toISOString();
  }

  const date = new Date(informed);
  if (Number.isNaN(date.getTime())) return null;

  const hours = (date.getTime() - now.getTime()) / 3600_000;
  if (hours <= 0 || hours > MAX_VALIDITY_HOURS) return null;

  return date.toISOString();
}
