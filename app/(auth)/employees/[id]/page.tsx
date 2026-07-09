import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table } from "@/components/ui/Table";
import { RiskStripe } from "@/components/ui/RiskStripe";
import { ReturnButton } from "./ReturnButton";
import type {
  Employee,
  PpeDelivery,
  PpeType,
  ExpiryStatus,
  NrTraining,
  TrainingRecord,
} from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getData(id: string) {
  const [employees, deliveries, ppeTypes, trainings, records] = await Promise.all([
    apiFetch<Employee[]>("/api/employees"),
    apiFetch<(PpeDelivery & { status: ExpiryStatus })[]>("/api/deliveries"),
    apiFetch<PpeType[]>("/api/ppe-types"),
    apiFetch<NrTraining[]>("/api/trainings"),
    apiFetch<(TrainingRecord & { status: ExpiryStatus })[]>(
      "/api/training-records"
    ),
  ]);

  const employee = employees.find((c) => c.id === id);
  const employeeDeliveries = deliveries.filter((e) => e.employeeId === id);
  const employeeTrainings = records.filter((t) => t.employeeId === id);

  return { employee, employeeDeliveries, ppeTypes, trainings, employeeTrainings };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { employee, employeeDeliveries, ppeTypes, trainings, employeeTrainings } =
    await getData(id);

  if (!employee) {
    return (
      <div className="panel p-8 text-center">
        <p className="signage text-lg mb-2">Colaborador não encontrado</p>
        <p className="text-sm text-smoke mb-6">
          A ficha pode ter sido removida ou o endereço está incorreto.
        </p>
        <Link href="/employees" className="button inline-block">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const expired = employeeDeliveries.filter((e) => e.status === "expired").length;

  return (
    <div>
      <header className="mb-6">
        <Link href="/employees" className="label text-mandatory hover:underline">
          ← Colaboradores
        </Link>
        <h1 className="signage text-3xl mt-3">{employee.name}</h1>
        <p className="data text-smoke mt-2">
          {employee.jobTitle} · {employee.clientCompany}
        </p>
      </header>

      <RiskStripe count={expired} />

      <p className="label mb-3">Ficha de entrega de EPI</p>


      {employeeDeliveries.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-smoke mb-6">
            Nenhum EPI entregue a {employee.name.split(" ")[0]} até agora.
          </p>
          <Link href="/ppe/delivery" className="button inline-block">
            Registrar entrega
          </Link>
        </div>
      ) : (
        <Table headers={["Equipamento", "Entrega", "Validade", "Devolução", "Status", ""]}>
          {employeeDeliveries.map((e) => {
            const type = ppeTypes.find((t) => t.id === e.ppeTypeId);
            const returned = Boolean(e.returnDate);
            return (
              <tr key={e.id} className="border-b border-rule last:border-0">
                <td className="py-3 px-4 text-sm font-medium">
                  <Link href={`/equipment/${e.id}`} className="hover:text-mandatory">
                    {type?.name}
                  </Link>
                </td>
                <td className="py-3 px-4 data text-smoke">{e.deliveryDate}</td>
                <td className="py-3 px-4 data text-smoke">{e.expiryDate}</td>
                <td className="py-3 px-4 data text-smoke">
                  {e.returnDate ?? <span className="label">Em uso</span>}
                </td>
                <td className="py-3 px-4">
                  {returned ? (
                    <span className="label">Devolvido</span>
                  ) : (
                    <StatusBadge status={e.status} />
                  )}
                </td>
                <td className="py-3 px-4">
                  {!returned && <ReturnButton deliveryId={e.id} />}
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      <p className="label mt-10 mb-3">Treinamentos obrigatórios</p>

      {employeeTrainings.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-smoke mb-6">
            Nenhum treinamento registrado para {employee.name.split(" ")[0]}.
          </p>
          <Link href="/trainings" className="button inline-block">
            Registrar treinamento
          </Link>
        </div>
      ) : (
        <Table headers={["Norma", "Treinamento", "Realizado", "Válido até", "Status"]}>
          {employeeTrainings.map((t) => {
            const nr = trainings.find((n) => n.id === t.trainingId);
            return (
              <tr key={t.id} className="border-b border-rule last:border-0">
                <td className="py-3 px-4 data whitespace-nowrap">{nr?.standard}</td>
                <td className="py-3 px-4 text-sm font-medium">{nr?.name}</td>
                <td className="py-3 px-4 data text-smoke">{t.completionDate}</td>
                <td className="py-3 px-4 data text-smoke">{t.expiryDate}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
