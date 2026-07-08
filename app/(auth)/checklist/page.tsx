import { ChecklistForm } from "./ChecklistForm";
import { Cabecalho } from "@/components/ui/Cabecalho";
import { apiFetch } from "@/lib/api";
import type { ChecklistDiario } from "@/lib/types";

async function getChecklists(): Promise<ChecklistDiario[]> {
  return apiFetch<ChecklistDiario[]>("/api/checklists");
}

export default async function ChecklistPage() {
  const checklists = await getChecklists();
  const ordenados = [...checklists].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div>
      <Cabecalho
        eyebrow="Inspeção de campo"
        titulo="Checklist diário"
        descricao="Preencha no setor, pelo celular. O indicador no dashboard sobe assim que você registra."
      />

      <ChecklistForm />

      <div className="mt-10">
        <p className="etiqueta mb-3">Checklists registrados</p>

        {ordenados.length === 0 ? (
          <div className="placa p-8 text-center">
            <p className="text-sm text-fumaca">
              Nenhum checklist registrado. Preencha o formulário acima para começar.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ordenados.map((c) => {
              const naoConformidades = c.itens.filter((i) => i.resposta === "nao").length;
              return (
                <li key={c.id} className="placa">
                  <div className={`h-1 ${naoConformidades > 0 ? "bg-perigo" : "bg-seguranca"}`} />
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="letreiro text-sm">{c.setor}</span>
                      <span className="dado text-fumaca">{c.data}</span>
                    </div>

                    <p className="etiqueta mt-1">{c.tecnicoResponsavel}</p>

                    <ul className="mt-3 border-t border-traco">
                      {c.itens.map((item) => (
                        <li
                          key={item.descricao}
                          className="flex items-center justify-between gap-3 py-2 border-b border-traco last:border-0"
                        >
                          <span className="text-sm text-fumaca">{item.descricao}</span>
                          <span
                            className={`etiqueta shrink-0 ${
                              item.resposta === "nao"
                                ? "text-perigo"
                                : item.resposta === "sim"
                                  ? "text-seguranca"
                                  : ""
                            }`}
                          >
                            {item.resposta === "na" ? "N/A" : item.resposta}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {naoConformidades > 0 && (
                      <p className="etiqueta text-perigo mt-3">
                        {naoConformidades} não conformidade
                        {naoConformidades > 1 ? "s" : ""}
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
