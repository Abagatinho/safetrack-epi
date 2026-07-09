import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskStripe } from "@/components/ui/RiskStripe";
import { IncidentBars } from "@/components/ui/IncidentBars";
import { ExportButton, type ExportRow } from "./ExportButton";
import { apiFetch } from "@/lib/api";
import type {
  Employee,
  PpeDelivery,
  PpeType,
  ExpiryStatus,
  Incident,
  DailyChecklist,
  NrTraining,
  TrainingRecord,
} from "@/lib/types";

async function getData() {
  const [employees, deliveries, ppeTypes, incidents, checklists, trainings, records] =
    await Promise.all([
      apiFetch<Employee[]>("/api/employees"),
      apiFetch<(PpeDelivery & { status: ExpiryStatus })[]>("/api/deliveries"),
      apiFetch<PpeType[]>("/api/ppe-types"),
      apiFetch<Incident[]>("/api/incidents"),
      apiFetch<DailyChecklist[]>("/api/checklists"),
      apiFetch<NrTraining[]>("/api/trainings"),
      apiFetch<(TrainingRecord & { status: ExpiryStatus })[]>(
        "/api/training-records"
      ),
    ]);
  return { employees, deliveries, ppeTypes, incidents, checklists, trainings, records };
}

const LABEL: Record<ExpiryStatus, string> = {
  expired: "Vencido",
  expiringSoon: "Vencendo",
  ok: "Em dia",
};

export default async function ReportPage() {
  const { employees, deliveries, ppeTypes, incidents, checklists, trainings, records } =
    await getData();

  const expired = deliveries.filter((e) => e.status === "expired");
  const expiringSoon = deliveries.filter((e) => e.status === "expiringSoon");
  const nonConformities = checklists.reduce(
    (sum, c) => sum + c.items.filter((i) => i.answer === "no").length,
    0
  );

  const pendingTrainings = records.filter((t) => t.status !== "ok");
  const expiredTrainings = records.filter((t) => t.status === "expired").length;

  const nameOf = (id: string) => employees.find((c) => c.id === id)?.name ?? "—";
  const ppeOf = (id: string) => ppeTypes.find((t) => t.id === id)?.name ?? "—";
  const nrOf = (id: string) => trainings.find((t) => t.id === id);

  const ppeBlockers = [...expired, ...expiringSoon].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  // Uma pendência é uma pendência, venha de EPI ou de treinamento.
  // A auditoria pede as duas na mesma planilha.
  const csvRows: ExportRow[] = [
    ...ppeBlockers.map((e) => [
      nameOf(e.employeeId),
      "EPI",
      ppeOf(e.ppeTypeId),
      e.deliveryDate,
      e.expiryDate,
      LABEL[e.status],
    ]),
    ...pendingTrainings.map((t) => [
      nameOf(t.employeeId),
      "Treinamento",
      `${nrOf(t.trainingId)?.standard} — ${nrOf(t.trainingId)?.name}`,
      t.completionDate,
      t.expiryDate,
      LABEL[t.status],
    ]),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Auditoria"
        title="Relatório consolidado"
        description="O que a auditoria pede, numa tela. Antes eram caixas de papel e uma tarde de procura."
      />

      <div className="mb-8">
        <ExportButton
          headers={["Colaborador", "Tipo", "Item", "Realizado em", "Válido até", "Status"]}
          rows={csvRows}
          fileName="safetrack-pendencias.csv"
        />
      </div>

      <RiskStripe count={expired.length} />

      <section className="mb-10">
        <p className="label mb-3">Panorama</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="EPIs vencidos"
            value={expired.length}
            tone={expired.length > 0 ? "danger" : "safety"}
          />
          <Card
            title="Vencendo em 30 dias"
            value={expiringSoon.length}
            tone={expiringSoon.length > 0 ? "caution" : "safety"}
          />
          <Card
            title="Treinamentos pendentes"
            value={pendingTrainings.length}
            tone={
              expiredTrainings > 0
                ? "danger"
                : pendingTrainings.length > 0
                  ? "caution"
                  : "safety"
            }
            subtitle={`${expiredTrainings} vencidos`}
          />
          <Card
            title="Não conformidades"
            value={nonConformities}
            tone={nonConformities > 0 ? "caution" : "safety"}
            subtitle={`Em ${checklists.length} checklists`}
          />
        </div>
      </section>

      <section className="mb-10">
        <IncidentBars incidents={incidents} />
      </section>

      <section className="mb-10">
        <p className="label mb-3">Pendências de EPI — vencidos e a vencer</p>

        {ppeBlockers.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="signage text-lg text-safety mb-2">Nenhuma pendência</p>
            <p className="text-sm text-smoke">
              Todos os EPIs em circulação estão dentro da validade.
            </p>
          </div>
        ) : (
          <Table headers={["Colaborador", "Equipamento", "Entrega", "Validade", "Status"]}>
            {ppeBlockers.map((e) => (
              <tr key={e.id} className="border-b border-rule last:border-0">
                <td className="py-3 px-4 text-sm font-medium">{nameOf(e.employeeId)}</td>
                <td className="py-3 px-4 text-sm text-smoke">{ppeOf(e.ppeTypeId)}</td>
                <td className="py-3 px-4 data text-smoke">{e.deliveryDate}</td>
                <td className="py-3 px-4 data text-smoke">{e.expiryDate}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section>
        <p className="label mb-3">Pendências de treinamento — NRs a reciclar</p>

        {pendingTrainings.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="signage text-lg text-safety mb-2">Nenhuma pendência</p>
            <p className="text-sm text-smoke">Todos os treinamentos estão dentro da validade.</p>
          </div>
        ) : (
          <Table headers={["Colaborador", "Norma", "Treinamento", "Válido até", "Status"]}>
            {pendingTrainings.map((t) => {
              const nr = nrOf(t.trainingId);
              return (
                <tr key={t.id} className="border-b border-rule last:border-0">
                  <td className="py-3 px-4 text-sm font-medium">{nameOf(t.employeeId)}</td>
                  <td className="py-3 px-4 data whitespace-nowrap">{nr?.standard}</td>
                  <td className="py-3 px-4 text-sm text-smoke">{nr?.name}</td>
                  <td className="py-3 px-4 data text-smoke">{t.expiryDate}</td>
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
