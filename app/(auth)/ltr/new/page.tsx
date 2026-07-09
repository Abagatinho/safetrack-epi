import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { IssuanceForm } from "./IssuanceForm";
import { apiFetch } from "@/lib/api";
import type {
  Apr,
  ChecklistTemplate,
  Employee,
  NrTraining,
  PpeDelivery,
  PpeType,
  TrainingRecord,
} from "@/lib/types";

export default async function NewLtrPage() {
  const [aprs, templates, employees, trainings, records, deliveries, ppeTypes] = await Promise.all([
    apiFetch<Apr[]>("/api/aprs"),
    apiFetch<ChecklistTemplate[]>("/api/checklist-templates"),
    apiFetch<Employee[]>("/api/employees"),
    apiFetch<NrTraining[]>("/api/trainings"),
    apiFetch<TrainingRecord[]>("/api/training-records"),
    apiFetch<PpeDelivery[]>("/api/deliveries"),
    apiFetch<PpeType[]>("/api/ppe-types"),
  ]);

  const hasApprovedApr = aprs.some((a) => a.status === "approved");

  return (
    <div>
      <Link href="/ltr" className="label text-mandatory hover:underline">
        ← Liberações
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow="Liberação de trabalho de risco"
          title="Emitir LTR"
          description="A liberação só é emitida quando a APR está aprovada, cada executante tem treinamento e EPI válidos, e o checklist está completo e conforme. Não há como emitir com pendência."
        />
      </div>

      {hasApprovedApr ? (
        <IssuanceForm
          aprs={aprs}
          templates={templates}
          employees={employees}
          trainings={trainings}
          records={records}
          deliveries={deliveries}
          ppeTypes={ppeTypes}
        />
      ) : (
        <div className="panel p-8 text-center">
          <p className="signage text-lg mb-2">Nenhuma APR aprovada</p>
          <p className="text-sm text-smoke mb-6 max-w-md mx-auto">
            A análise preliminar de risco mapeia os perigos da tarefa e precisa ser aprovada
            antes de qualquer liberação.
          </p>
          <Link href="/apr" className="button inline-block">
            Ir para APR
          </Link>
        </div>
      )}
    </div>
  );
}
