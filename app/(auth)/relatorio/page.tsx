import { Cabecalho } from "@/components/ui/Cabecalho";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FaixaRisco } from "@/components/ui/FaixaRisco";
import { BarrasIncidentes } from "@/components/ui/BarrasIncidentes";
import { BotaoExportar } from "./BotaoExportar";
import { apiFetch } from "@/lib/api";
import type {
  Colaborador,
  EntregaEPI,
  TipoEPI,
  StatusEntrega,
  Incidente,
  ChecklistDiario,
} from "@/lib/types";

async function getDados() {
  const [colaboradores, entregas, tiposEpi, incidentes, checklists] = await Promise.all([
    apiFetch<Colaborador[]>("/api/colaboradores"),
    apiFetch<(EntregaEPI & { status: StatusEntrega })[]>("/api/entregas"),
    apiFetch<TipoEPI[]>("/api/tipos-epi"),
    apiFetch<Incidente[]>("/api/incidentes"),
    apiFetch<ChecklistDiario[]>("/api/checklists"),
  ]);
  return { colaboradores, entregas, tiposEpi, incidentes, checklists };
}

export default async function RelatorioPage() {
  const { colaboradores, entregas, tiposEpi, incidentes, checklists } = await getDados();

  const vencidos = entregas.filter((e) => e.status === "vencido");
  const vencendo = entregas.filter((e) => e.status === "vencendo30d");
  const naoConformidades = checklists.reduce(
    (soma, c) => soma + c.itens.filter((i) => i.resposta === "nao").length,
    0
  );

  const nomeDe = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? "—";
  const epiDe = (id: string) => tiposEpi.find((t) => t.id === id)?.nome ?? "—";

  const pendencias = [...vencidos, ...vencendo].sort(
    (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
  );

  return (
    <div>
      <Cabecalho
        eyebrow="Auditoria"
        titulo="Relatório consolidado"
        descricao="O que a auditoria pede, numa tela. Antes eram caixas de papel e uma tarde de procura."
      />

      <div className="mb-8">
        <BotaoExportar />
      </div>

      <FaixaRisco quantidade={vencidos.length} />

      <section className="mb-10">
        <p className="etiqueta mb-3">Panorama</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="EPIs vencidos"
            value={vencidos.length}
            tom={vencidos.length > 0 ? "perigo" : "seguranca"}
          />
          <Card
            title="Vencendo em 30 dias"
            value={vencendo.length}
            tom={vencendo.length > 0 ? "cuidado" : "seguranca"}
          />
          <Card title="Incidentes registrados" value={incidentes.length} />
          <Card
            title="Não conformidades"
            value={naoConformidades}
            tom={naoConformidades > 0 ? "cuidado" : "seguranca"}
            subtitle={`Em ${checklists.length} checklists`}
          />
        </div>
      </section>

      <section className="mb-10">
        <BarrasIncidentes incidentes={incidentes} />
      </section>

      <section>
        <p className="etiqueta mb-3">Pendências de EPI — vencidos e a vencer</p>

        {pendencias.length === 0 ? (
          <div className="placa p-8 text-center">
            <p className="letreiro text-lg text-seguranca mb-2">Nenhuma pendência</p>
            <p className="text-sm text-fumaca">
              Todos os EPIs em circulação estão dentro da validade.
            </p>
          </div>
        ) : (
          <Table headers={["Colaborador", "Equipamento", "Entrega", "Validade", "Status"]}>
            {pendencias.map((e) => (
              <tr key={e.id} className="border-b border-traco last:border-0">
                <td className="py-3 px-4 text-sm font-medium">{nomeDe(e.colaboradorId)}</td>
                <td className="py-3 px-4 text-sm text-fumaca">{epiDe(e.tipoEpiId)}</td>
                <td className="py-3 px-4 dado text-fumaca">{e.dataEntrega}</td>
                <td className="py-3 px-4 dado text-fumaca">{e.dataValidade}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}
