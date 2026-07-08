import { IncidenteForm } from "./IncidenteForm";
import { Table } from "@/components/ui/Table";
import type { Incidente } from "@/lib/types";

async function getIncidentes(): Promise<Incidente[]> {
  const res = await fetch("http://localhost:3000/api/incidentes", { cache: "no-store" });
  return res.json();
}

export default async function IncidentesPage() {
  const incidentes = await getIncidentes();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Incidentes / quase-acidentes</h1>
      <IncidenteForm />
      <div className="mt-6">
        <Table headers={["Data", "Local", "Gravidade", "Descrição"]}>
          {incidentes.map((i) => (
            <tr key={i.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{i.data}</td>
              <td className="py-2 pr-4">{i.local}</td>
              <td className="py-2 pr-4 capitalize">{i.gravidade}</td>
              <td className="py-2 pr-4">{i.descricao}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
