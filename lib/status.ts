import type { StatusEntrega } from "./types";

const DIAS_ALERTA = 30;

export function calcularStatus(
  dataValidade: string,
  hoje: Date,
  dataDevolucao?: string
): StatusEntrega {
  if (dataDevolucao) return "ok";

  const validade = new Date(dataValidade);
  const diffMs = validade.getTime() - hoje.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);

  if (diffDias < 0) return "vencido";
  if (diffDias <= DIAS_ALERTA) return "vencendo30d";
  return "ok";
}

export function calcularDataValidade(
  dataEntrega: string,
  validadeMeses: number
): string {
  const data = new Date(dataEntrega);
  data.setMonth(data.getMonth() + validadeMeses);
  return data.toISOString().slice(0, 10);
}
