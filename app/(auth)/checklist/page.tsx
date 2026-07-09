import { ChecklistForm } from "./ChecklistForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import type { DailyChecklist } from "@/lib/types";

async function getChecklists(): Promise<DailyChecklist[]> {
  return apiFetch<DailyChecklist[]>("/api/checklists");
}

export default async function ChecklistPage() {
  const checklists = await getChecklists();
  const sorted = [...checklists].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <PageHeader
        eyebrow="Inspeção de campo"
        title="Checklist diário"
        description="Preencha no setor, pelo celular. O indicador no dashboard sobe assim que você registra."
      />

      <ChecklistForm />

      <div className="mt-10">
        <p className="label mb-3">Checklists registrados</p>

        {sorted.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-sm text-smoke">
              Nenhum checklist registrado. Preencha o formulário acima para começar.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((c) => {
              const nonConformities = c.items.filter((i) => i.answer === "no").length;
              return (
                <li key={c.id} className="panel">
                  <div className={`h-1 ${nonConformities > 0 ? "bg-danger" : "bg-safety"}`} />
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="signage text-sm">{c.sector}</span>
                      <span className="data text-smoke">{c.date}</span>
                    </div>

                    <p className="label mt-1">{c.responsibleTechnician}</p>

                    <ul className="mt-3 border-t border-rule">
                      {c.items.map((item) => (
                        <li
                          key={item.description}
                          className="flex items-center justify-between gap-3 py-2 border-b border-rule last:border-0"
                        >
                          <span className="text-sm text-smoke">{item.description}</span>
                          <span
                            className={`label shrink-0 ${
                              item.answer === "no"
                                ? "text-danger"
                                : item.answer === "yes"
                                  ? "text-safety"
                                  : ""
                            }`}
                          >
                            {item.answer === "na" ? "N/A" : item.answer === "yes" ? "sim" : "nao"}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {nonConformities > 0 && (
                      <p className="label text-danger mt-3">
                        {nonConformities} não conformidade
                        {nonConformities > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
