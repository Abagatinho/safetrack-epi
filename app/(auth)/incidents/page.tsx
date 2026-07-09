import { IncidentForm } from "./IncidentForm";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Incident, IncidentSeverity } from "@/lib/types";
import { apiFetch } from "@/lib/api";

const MARK: Record<IncidentSeverity, string> = {
  minor: "bg-caution",
  moderate: "bg-machine",
  severe: "bg-danger",
};

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  minor: "leve",
  moderate: "moderado",
  severe: "grave",
};

async function getIncidents(): Promise<Incident[]> {
  return apiFetch<Incident[]>("/api/incidents");
}

export default async function IncidentsPage() {
  const incidents = await getIncidents();
  const sorted = [...incidents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <PageHeader
        eyebrow="Segurança"
        title="Incidentes e quase-acidentes"
        description="Registrar um incidente zera o contador de dias sem acidentes no dashboard."
      />

      <IncidentForm />

      <div className="mt-10">
        <p className="label mb-3">Ocorrências registradas</p>

        {sorted.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="signage text-lg text-safety mb-2">Nenhuma ocorrência registrada</p>
            <p className="text-sm text-smoke">
              Registre incidentes e quase-acidentes para acompanhar padrões de risco.
            </p>
          </div>
        ) : (
          <Table headers={["Data", "Local", "Gravidade", "Descrição", "Foto"]}>
            {sorted.map((i) => (
              <tr key={i.id} className="border-b border-rule last:border-0">
                <td className="py-3 px-4 data text-smoke whitespace-nowrap">{i.date}</td>
                <td className="py-3 px-4 text-sm font-medium">{i.location}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-3 h-3 ${MARK[i.severity]}`} aria-hidden="true" />
                    <span className="label text-graphite">{SEVERITY_LABEL[i.severity]}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-smoke">{i.description}</td>
                <td className="py-3 px-4">
                  {i.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URI validado na API
                    <img
                      src={i.photoUrl}
                      alt={`Foto do incidente em ${i.location}`}
                      className="w-16 h-16 object-cover border border-rule"
                    />
                  ) : (
                    <span className="label">—</span>
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
