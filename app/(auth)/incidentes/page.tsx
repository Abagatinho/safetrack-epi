import { IncidenteForm } from "./IncidenteForm";
import { Table } from "@/components/ui/Table";
import { Cabecalho } from "@/components/ui/Cabecalho";
import type { Incidente, GravidadeIncidente } from "@/lib/types";
import { apiFetch } from "@/lib/api";

const MARCA: Record<GravidadeIncidente, string> = {
  leve: "bg-cuidado",
  moderado: "bg-maquina",
  grave: "bg-perigo",
};

async function getIncidentes(): Promise<Incidente[]> {
  return apiFetch<Incidente[]>("/api/incidentes");
}

export default async function IncidentesPage() {
  const incidentes = await getIncidentes();
  const ordenados = [...incidentes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div>
      <Cabecalho
        eyebrow="Segurança"
        titulo="Incidentes e quase-acidentes"
        descricao="Registrar um incidente zera o contador de dias sem acidentes no dashboard."
      />

      <IncidenteForm />

      <div className="mt-10">
        <p className="etiqueta mb-3">Ocorrências registradas</p>

        {ordenados.length === 0 ? (
          <div className="placa p-8 text-center">
            <p className="letreiro text-lg text-seguranca mb-2">Nenhuma ocorrência registrada</p>
            <p className="text-sm text-fumaca">
              Registre incidentes e quase-acidentes para acompanhar padrões de risco.
            </p>
          </div>
        ) : (
          <Table headers={["Data", "Local", "Gravidade", "Descrição", "Foto"]}>
            {ordenados.map((i) => (
              <tr key={i.id} className="border-b border-traco last:border-0">
                <td className="py-3 px-4 dado text-fumaca whitespace-nowrap">{i.data}</td>
                <td className="py-3 px-4 text-sm font-medium">{i.local}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-3 h-3 ${MARCA[i.gravidade]}`} aria-hidden="true" />
                    <span className="etiqueta text-grafite">{i.gravidade}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-fumaca">{i.descricao}</td>
                <td className="py-3 px-4">
                  {i.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URI validado na API
                    <img
                      src={i.fotoUrl}
                      alt={`Foto do incidente em ${i.local}`}
                      className="w-16 h-16 object-cover border border-traco"
                    />
                  ) : (
                    <span className="etiqueta">—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
