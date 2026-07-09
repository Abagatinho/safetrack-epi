import { DeliveryForm } from "./DeliveryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Employee, PpeType } from "@/lib/types";
import { apiFetch, baseUrl } from "@/lib/api";

async function getLists() {
  const [employees, ppeTypes] = await Promise.all([
    apiFetch<Employee[]>("/api/employees"),
    apiFetch<PpeType[]>("/api/ppe-types"),
  ]);
  return { employees, ppeTypes };
}

export default async function PpeDeliveryPage() {
  const [{ employees, ppeTypes }, origin] = await Promise.all([getLists(), baseUrl()]);

  return (
    <div>
      <PageHeader
        eyebrow="Controle de EPI"
        title="Entrega de EPI"
        description="A validade é calculada a partir da data de entrega. O alerta aparece no dashboard 30 dias antes de vencer."
      />
      <DeliveryForm employees={employees} ppeTypes={ppeTypes} origin={origin} />
    </div>
  );
}
