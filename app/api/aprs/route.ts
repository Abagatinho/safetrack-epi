import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { readBody } from "@/lib/request";
import type { Apr, AprStep, Risk } from "@/lib/types";

function isValidRisk(risk: unknown): risk is Risk {
  if (typeof risk !== "object" || risk === null) return false;
  const { likelihood, severity } = risk as Risk;
  return [likelihood, severity].every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
}

/**
 * Uma etapa sem medida de controle não é uma etapa analisada: o risco residual
 * seria igual ao inicial e a APR não teria feito nada.
 */
function isValidStep(step: unknown): step is AprStep {
  if (typeof step !== "object" || step === null) return false;
  const s = step as AprStep;

  return (
    typeof s.description === "string" &&
    s.description.trim().length > 0 &&
    typeof s.hazard === "string" &&
    s.hazard.trim().length > 0 &&
    Array.isArray(s.controls) &&
    s.controls.some((c) => typeof c === "string" && c.trim().length > 0) &&
    isValidRisk(s.initialRisk) &&
    isValidRisk(s.residualRisk)
  );
}

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.aprs);
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const db = await readDB();

  const fields = ["task", "location", "author"] as const;
  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json({ error: `${field} é obrigatório` }, { status: 400 });
    }
  }

  if (!Array.isArray(body.steps) || body.steps.length === 0) {
    return NextResponse.json({ error: "A APR precisa de ao menos uma etapa" }, { status: 400 });
  }

  if (!body.steps.every(isValidStep)) {
    return NextResponse.json(
      {
        error:
          "Cada etapa precisa de descrição, perigo, ao menos uma medida de controle, " +
          "e riscos inicial e residual com probabilidade e severidade de 1 a 5",
      },
      { status: 400 }
    );
  }

  const apr: Apr = {
    id: `apr-${Date.now()}`,
    task: body.task.trim(),
    location: body.location.trim(),
    date: body.date ?? new Date().toISOString().slice(0, 10),
    author: body.author.trim(),
    // Nasce em rascunho sempre. Aprovar é um ato à parte, de quem tem
    // competência para tanto — não um campo que o formulário manda junto.
    status: "draft",
    steps: body.steps.map((s: AprStep) => ({
      description: s.description.trim(),
      hazard: s.hazard.trim(),
      initialRisk: s.initialRisk,
      controls: s.controls.filter((c) => c.trim()).map((c) => c.trim()),
      residualRisk: s.residualRisk,
    })),
  };

  db.aprs.push(apr);
  await writeDB(db);

  return NextResponse.json(apr, { status: 201 });
}
