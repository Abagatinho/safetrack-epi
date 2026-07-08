import { Cabecalho } from "@/components/ui/Cabecalho";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FaixaRisco } from "@/components/ui/FaixaRisco";
import { BarrasIncidentes } from "@/components/ui/BarrasIncidentes";
import { BotaoExportar, type LinhaExportacao } from "./BotaoExportar";
import { apiFetch } from "@/lib/api";
import type {
  Colaborador,
  EntregaEPI,
  TipoEPI,
  StatusEntrega,
  Incidente,
  ChecklistDiario,
  TreinamentoNR,
  TreinamentoRealizado,
} from "@/lib/types";

async function getDados() {
  const [colaboradores, entregas, tiposEpi, incidentes, checklists, treinamentos, realizados] =
    await Promise.all([
      apiFetch<Colaborador[]>("/api/colaboradores"),
      apiFetch<(EntregaEPI & { status: StatusEntrega })[]>("/api/entregas"),
      apiFetch<TipoEPI[]>("/api/tipos-epi"),
      apiFetch<Incidente[]>("/api/incidentes"),
      apiFetch<ChecklistDiario[]>("/api/checklists"),
      apiFetch<TreinamentoNR[]>("/api/treinamentos"),
      apiFetch<(TreinamentoRealizado & { status: StatusEntrega })[]>(
        "/api/treinamentos-realizados"
      ),
    ]);
  return { colaboradores, entregas, tiposEpi, incidentes, checklists, treinamentos, realizados };
}

const ROTULO: Record<StatusEntrega, string> = {
  vencido: "Vencido",
  vencendo30d: "Vencendo",
  ok: "Em dia",
};

export default async function RelatorioPage() {
  const { colaboradores, entregas, tiposEpi, incidentes, checklists, treinamentos, realizados } =
    await getDados();

  const vencidos = entregas.filter((e) => e.status === "vencido");
  const vencendo = entregas.filter((e) => e.status === "vencendo30d");
  const naoConformidades = checklists.reduce(
    (soma, c) => soma + c.itens.filter((i) => i.resposta === "nao").length,
    0
  );

  const treinamentosPendentes = realizados.filter((t) => t.status !== "ok");
  const treinamentosVencidos = realizados.filter((t) => t.status === "vencido").length;

  const nomeDe = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? "—";
  const epiDe = (id: string) => tiposEpi.find((t) => t.id === id)?.nome ?? "—";
  const nrDe = (id: string) => treinamentos.find((t) => t.id === id);

  const pendenciasEpi = [...vencidos, ...vencendo].sort(
    (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
  );

  // Uma pendência é uma pendência, venha de EPI ou de treinamento.
  // A auditoria pede as duas na mesma planilha.
  const linhasCsv: LinhaExportacao[] = [
    ...pendenciasEpi.map((e) => [
      nomeDe(e.colaboradorId),
      "EPI",
      epiDe(e.tipoEpiId),
      e.dataEntrega,
      e.dataValidade,
      ROTULO[e.status],
    ]),
    ...treinamentosPendentes.map((t) => [
      nomeDe(t.colaboradorId),
      "Treinamento",
      `${nrDe(t.treinamentoId)?.norma} — ${nrDe(t.treinamentoId)?.nome}`,
      t.dataRealizacao,
      t.dataValidade,
      ROTULO[t.status],
    ]),
  ];

  return (
    <div>
      <Cabecalho
        eyebrow="Auditoria"
        titulo="Relatório consolidado"
        descricao="O que a auditoria pede, numa tela. Antes eram caixas de papel e uma tarde de procura."
      />

      <div className="mb-8">
        <BotaoExportar
          cabecalhos={["Colaborador", "Tipo", "Item", "Realizado em", "Válido até", "Status"]}
          linhas={linhasCsv}
          nomeArquivo="safetrack-pendencias.csv"
        />
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
          <Card
            title="Treinamentos pendentes"
            value={treinamentosPendentes.length}
            tom={
              treinamentosVencidos > 0
                ? "perigo"
                : treinamentosPendentes.length > 0
                  ? "cuidado"
                  : "seguranca"
            }
            subtitle={`${treinamentosVencidos} vencidos`}
          />
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

      <section className="mb-10">
        <p className="etiqueta mb-3">Pendências de EPI — vencidos e a vencer</p>

        {pendenciasEpi.length === 0 ? (
          <div className="placa p-8 text-center">
            <p className="letreiro text-lg text-seguranca mb-2">Nenhuma pendência</p>
            <p className="text-sm text-fumaca">
              Todos os EPIs em circulação estão dentro da validade.
            </p>
          </div>
        ) : (
          <Table headers={["Colaborador", "Equipamento", "Entrega", "Validade", "Status"]}>
            {pendenciasEpi.map((e) => (
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

      <section>
        <p className="etiqueta mb-3">Pendências de treinamento — NRs a reciclar</p>

        {treinamentosPendentes.length === 0 ? (
          <div className="placa p-8 text-center">
            <p className="letreiro text-lg text-seguranca mb-2">Nenhuma pendência</p>
            <p className="text-sm text-fumaca">Todos os treinamentos estão dentro da validade.</p>
          </div>
        ) : (
          <Table headers={["Colaborador", "Norma", "Treinamento", "Válido até", "Status"]}>
            {treinamentosPendentes.map((t) => {
              const nr = nrDe(t.treinamentoId);
              return (
                <tr key={t.id} className="border-b border-traco last:border-0">
                  <td className="py-3 px-4 text-sm font-medium">{nomeDe(t.colaboradorId)}</td>
                  <td className="py-3 px-4 dado whitespace-nowrap">{nr?.norma}</td>
                  <td className="py-3 px-4 text-sm text-fumaca">{nr?.nome}</td>
                  <td className="py-3 px-4 dado text-fumaca">{t.dataValidade}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>
    </div>
  );
}
