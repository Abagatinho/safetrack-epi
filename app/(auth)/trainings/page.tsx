import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskStripe } from "@/components/ui/RiskStripe";
import { TrainingForm } from "./TrainingForm";
import { apiFetch } from "@/lib/api";
import type {
  Employee,
  NrTraining,
  TrainingRecord,
  ExpiryStatus,
} from "@/lib/types";

async function getData() {
  const [employees, trainings, records] = await Promise.all([
    apiFetch<Employee[]>("/api/employees"),
    apiFetch<NrTraining[]>("/api/trainings"),
    apiFetch<(TrainingRecord & { status: ExpiryStatus })[]>(
      "/api/training-records"
    ),
  ]);
  return { employees, trainings, records };
}

const ORDER: Record<ExpiryStatus, number> = { expired: 0, expiringSoon: 1, ok: 2 };

export default async function TrainingsPage() {
  const { employees, trainings, records } = await getData();

  const expired = records.filter((t) => t.status === "expired").length;

  // O que precisa de ação primeiro aparece primeiro.
  const sorted = [...records].sort(
    (a, b) =>
      ORDER[a.status] - ORDER[b.status] ||
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const nameOf = (id: string) => employees.find((c) => c.id === id)?.name ?? "—";
  const standardOf = (id: string) => trainings.find((t) => t.id === id);

  return (
    <div>
      <PageHeader
        eyebrow="Conformidade"
        title="Treinamentos obrigatórios"
        description="Cada NR tem sua periodicidade de reciclagem. Vencido significa colaborador exposto e empresa em não conformidade."
      />

      <RiskStripe
        count={expired}
        text={(n) =>
          n === 1
            ? "1 treinamento vencido — reciclagem obrigatória"
            : `${n} treinamentos vencidos — reciclagem obrigatória`
        }
      />

      <TrainingForm employees={employees} trainings={trainings} />

      <p className="label mb-3">Situação por colaborador</p>

      <Table headers={["Colaborador", "Norma", "Treinamento", "Realizado", "Válido até", "Status"]}>
        {sorted.map((t) => {
          const nr = standardOf(t.trainingId);
          return (
            <tr key={t.id} className="border-b border-rule last:border-0">
              <td className="py-3 px-4 text-sm font-medium">{nameOf(t.employeeId)}</td>
              <td className="py-3 px-4 data whitespace-nowrap">{nr?.standard}</td>
              <td className="py-3 px-4 text-sm text-smoke">{nr?.name}</td>
              <td className="py-3 px-4 data text-smoke">{t.completionDate}</td>
              <td className="py-3 px-4 data text-smoke">{t.expiryDate}</td>
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
