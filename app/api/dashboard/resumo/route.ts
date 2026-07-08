import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { calcularStatus } from "@/lib/status";

export async function GET() {
  const db = await readDB();
  const hoje = new Date();

  const entregasComStatus = db.entregas.map((e) => ({
    ...e,
    status: calcularStatus(e.dataValidade, hoje, e.dataDevolucao),
  }));

  const vencendo = entregasComStatus.filter((e) => e.status === "vencendo30d").length;
  const vencidos = entregasComStatus.filter((e) => e.status === "vencido").length;

  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  const incidentesUltimos30d = db.incidentes.filter(
    (i) => new Date(i.data) >= trintaDiasAtras
  );

  const ultimoIncidente = [...db.incidentes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )[0];
  const diasSemAcidente = ultimoIncidente
    ? Math.floor((hoje.getTime() - new Date(ultimoIncidente.data).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return NextResponse.json({
    totalColaboradores: db.colaboradores.length,
    epiVencendo: vencendo,
    epiVencido: vencidos,
    checklistsRegistrados: db.checklists.length,
    incidentesUltimos30d: incidentesUltimos30d.length,
    diasSemAcidente,
  });
}
