import { Cabecalho } from "@/components/ui/Cabecalho";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FaixaRisco } from "@/components/ui/FaixaRisco";
import { TreinamentoForm } from "./TreinamentoForm";
import { apiFetch } from "@/lib/api";
import type {
  Colaborador,
  TreinamentoNR,
  TreinamentoRealizado,
  StatusEntrega,
} from "@/lib/types";

async function getDados() {
  const [colaboradores, treinamentos, realizados] = await Promise.all([
    apiFetch<Colaborador[]>("/api/colaboradores"),
    apiFetch<TreinamentoNR[]>("/api/treinamentos"),
    apiFetch<(TreinamentoRealizado & { status: StatusEntrega })[]>(
      "/api/treinamentos-realizados"
    ),
  ]);
  return { colaboradores, treinamentos, realizados };
}

const ORDEM: Record<StatusEntrega, number> = { vencido: 0, vencendo30d: 1, ok: 2 };

export default async function TreinamentosPage() {
  const { colaboradores, treinamentos, realizados } = await getDados();

  const vencidos = realizados.filter((t) => t.status === "vencido").length;

  // O que precisa de ação primeiro aparece primeiro.
  const ordenados = [...realizados].sort(
    (a, b) =>
      ORDEM[a.status] - ORDEM[b.status] ||
      new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
  );

  const nomeDe = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? "—";
  const normaDe = (id: string) => treinamentos.find((t) => t.id === id);

  return (
    <div>
      <Cabecalho
        eyebrow="Conformidade"
        titulo="Treinamentos obrigatórios"
        descricao="Cada NR tem sua periodicidade de reciclagem. Vencido significa colaborador exposto e empresa em não conformidade."
      />

      <FaixaRisco
        quantidade={vencidos}
        texto={(n) =>
          n === 1
            ? "1 treinamento vencido — reciclagem obrigatória"
            : `${n} treinamentos vencidos — reciclagem obrigatória`
        }
      />

      <TreinamentoForm colaboradores={colaboradores} treinamentos={treinamentos} />

      <p className="etiqueta mb-3">Situação por colaborador</p>

      <Table headers={["Colaborador", "Norma", "Treinamento", "Realizado", "Válido até", "Status"]}>
        {ordenados.map((t) => {
          const nr = normaDe(t.treinamentoId);
          return (
            <tr key={t.id} className="border-b border-traco last:border-0">
              <td className="py-3 px-4 text-sm font-medium">{nomeDe(t.colaboradorId)}</td>
              <td className="py-3 px-4 dado whitespace-nowrap">{nr?.norma}</td>
              <td className="py-3 px-4 text-sm text-fumaca">{nr?.nome}</td>
              <td className="py-3 px-4 dado text-fumaca">{t.dataRealizacao}</td>
              <td className="py-3 px-4 dado text-fumaca">{t.dataValidade}</td>
              <td className="py-3 px-4">
                <StatusBadge status={t.status} />
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
