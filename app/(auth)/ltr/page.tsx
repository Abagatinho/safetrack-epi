import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { RiskStripe } from "@/components/ui/RiskStripe";
import { apiFetch } from "@/lib/api";
import type { LtrStatus } from "@/lib/ltr";
import type { Employee, Ltr } from "@/lib/types";

const STYLE: Record<LtrStatus, { label: string; className: string }> = {
  issued: { label: "Aberta", className: "bg-safety-soft text-safety" },
  expired: { label: "Expirada sem encerrar", className: "bg-danger-soft text-danger" },
  closed: { label: "Encerrada", className: "bg-concrete text-smoke" },
  cancelled: { label: "Cancelada", className: "bg-concrete text-smoke" },
};

const ORDER: Record<LtrStatus, number> = {
  expired: 0,
  issued: 1,
  cancelled: 2,
  closed: 3,
};

function formatTime(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

export default async function LtrPage() {
  const [ltrs, employees] = await Promise.all([
    apiFetch<(Ltr & { status: LtrStatus })[]>("/api/ltrs"),
    apiFetch<Employee[]>("/api/employees"),
  ]);

  // Expirada sem encerramento é o caso que ninguém vê no papel: o trabalho
  // acabou e ninguém assinou que a área ficou segura.
  const expired = ltrs.filter((l) => l.status === "expired").length;

  const sorted = [...ltrs].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status] || b.issuedAt.localeCompare(a.issuedAt)
  );

  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        eyebrow="Liberação de trabalho de risco"
        title="LTR"
        description="A autorização formal para executar trabalho de risco. Vale por uma janela de tempo, é emitida por profissional habilitado e precisa ser encerrada quando o trabalho acaba."
      />

      <RiskStripe
        count={expired}
        text={(n) =>
          n === 1
            ? "1 liberação expirou sem encerramento"
            : `${n} liberações expiraram sem encerramento`
        }
      />

      <Link href="/ltr/new" className="button button-heavy inline-block mb-8">
        Emitir liberação
      </Link>

      {ltrs.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-smoke">Nenhuma liberação emitida até agora.</p>
        </div>
      ) : (
        <Table headers={["Trabalho", "Local", "Emitida", "Válida até", "Executantes", "Status"]}>
          {sorted.map((ltr) => {
            const { label, className } = STYLE[ltr.status];
            return (
              <tr key={ltr.id} className="border-b border-rule last:border-0">
                <td className="py-3 px-4 text-sm font-medium">
                  <Link href={`/ltr/${ltr.id}`} className="hover:text-mandatory">
                    {ltr.workDescription}
                  </Link>
                  <span className="data text-smoke block">{ltr.templateSnapshot.standard}</span>
                </td>
                <td className="py-3 px-4 text-sm text-smoke">{ltr.location}</td>
                <td className="py-3 px-4 data text-smoke">{formatTime(ltr.issuedAt)}</td>
                <td className="py-3 px-4 data text-smoke">{formatTime(ltr.validUntil)}</td>
                <td className="py-3 px-4 data text-smoke">{ltr.workerIds.map(nameOf).join(", ")}</td>
                <td className="py-3 px-4">
                  <span className={`label inline-block px-2 py-1 whitespace-nowrap ${className}`}>
                    {label}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
