import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PpeType, PpeDelivery, ExpiryStatus } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getData() {
  const [ppeTypes, deliveries] = await Promise.all([
    apiFetch<PpeType[]>("/api/ppe-types"),
    apiFetch<(PpeDelivery & { status: ExpiryStatus })[]>("/api/deliveries"),
  ]);
  return { ppeTypes, deliveries };
}

export default async function CatalogPage() {
  const { ppeTypes, deliveries } = await getData();

  const rows = ppeTypes.map((type) => {
    const ofType = deliveries.filter((e) => e.ppeTypeId === type.id);
    const expired = ofType.filter((e) => e.status === "expired").length;
    const expiringSoon = ofType.filter((e) => e.status === "expiringSoon").length;

    // O pior estado em circulação define a sinalização da linha.
    const worst: ExpiryStatus = expired > 0 ? "expired" : expiringSoon > 0 ? "expiringSoon" : "ok";

    return { type, inCirculation: ofType.length, expired, worst };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Controle de EPI"
        title="Catálogo de equipamentos"
        description="Cada tipo de EPI tem uma validade padrão. Ela define quando o alerta de troca dispara após a entrega."
      />

      <Table headers={["Equipamento", "Validade padrão", "Em circulação", "Vencidos", "Situação"]}>
        {rows.map(({ type, inCirculation, expired, worst }) => (
          <tr key={type.id} className="border-b border-rule last:border-0">
            <td className="py-3 px-4 text-sm font-medium">{type.name}</td>
            <td className="py-3 px-4 data text-smoke whitespace-nowrap">
              {type.validityMonths} meses
            </td>
            <td className="py-3 px-4 data">{inCirculation}</td>
            <td className={`py-3 px-4 data ${expired > 0 ? "text-danger" : "text-smoke"}`}>
              {expired}
            </td>
            <td className="py-3 px-4">
              {inCirculation === 0 ? (
                <span className="label">Sem entregas</span>
              ) : (
                <StatusBadge status={worst} />
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
