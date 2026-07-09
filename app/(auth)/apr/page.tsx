import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { AprForm } from "./AprForm";
import { ApproveButton } from "./ApproveButton";
import { apiFetch } from "@/lib/api";
import type { Apr } from "@/lib/types";

export default async function AprPage() {
  const aprs = await apiFetch<Apr[]>("/api/aprs");

  // Rascunho primeiro: é o que espera uma decisão.
  const sorted = [...aprs].sort((a, b) => {
    if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Análise de risco"
        title="APR"
        description="A APR quebra a tarefa em etapas e, para cada uma, aponta o perigo, as medidas de controle e o risco que sobra depois delas — o risco residual. Ela não autoriza o trabalho: é pré-requisito da liberação."
      />

      <AprForm />

      <p className="label mb-3">Análises registradas</p>

      <div className="space-y-4">
        {sorted.map((apr) => (
          <article key={apr.id} className="panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
              <div>
                <h2 className="signage text-lg">{apr.task}</h2>
                <p className="data text-smoke mt-1">
                  {apr.location} · {apr.date} · {apr.author}
                </p>
              </div>

              {apr.status === "approved" ? (
                <div className="text-right">
                  <span className="label text-safety">Aprovada</span>
                  <p className="data text-smoke mt-1">
                    {apr.approvedBy} · {apr.approvedAt}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="label text-caution">Rascunho</span>
                  <ApproveButton aprId={apr.id} />
                </div>
              )}
            </div>

            <ol className="border-t border-rule">
              {apr.steps.map((step, i) => (
                <li key={i} className="py-3 border-b border-rule last:border-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">
                      {i + 1}. {step.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={step.initialRisk} />
                      <span className="label text-smoke" aria-label="reduzido para">
                        para
                      </span>
                      <RiskBadge risk={step.residualRisk} />
                    </div>
                  </div>

                  <p className="text-sm text-smoke mt-1">Perigo: {step.hazard}</p>

                  <ul className="mt-2">
                    {step.controls.map((control) => (
                      <li key={control} className="data text-smoke">
                        — {control}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            {apr.status === "approved" && (
              <Link href="/ltr/new" className="label text-mandatory hover:underline mt-4 inline-block">
                Emitir liberação com esta APR →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
