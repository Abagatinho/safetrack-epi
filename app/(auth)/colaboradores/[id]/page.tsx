import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table } from "@/components/ui/Table";
import type { Colaborador, EntregaEPI, TipoEPI, StatusEntrega } from "@/lib/types";

async function getDados(id: string) {
  const [colaboradores, entregas, tiposEpi]: [Colaborador[], (EntregaEPI & { status: StatusEntrega })[], TipoEPI[]] =
    await Promise.all([
      fetch("http://localhost:3000/api/colaboradores", { cache: "no-store" }).then((r) => r.json()),
      fetch("http://localhost:3000/api/entregas", { cache: "no-store" }).then((r) => r.json()),
      fetch("http://localhost:3000/api/tipos-epi", { cache: "no-store" }).then((r) => r.json()),
    ]);

  const colaborador = colaboradores.find((c) => c.id === id);
  const entregasDoColaborador = entregas.filter((e) => e.colaboradorId === id);

  return { colaborador, entregasDoColaborador, tiposEpi };
}

export default async function ColaboradorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { colaborador, entregasDoColaborador, tiposEpi } = await getDados(id);

  if (!colaborador) return <p>Colaborador não encontrado.</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">{colaborador.nome}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {colaborador.funcao} — {colaborador.empresaCliente}
      </p>
      <Table headers={["EPI", "Entrega", "Validade", "Status"]}>
        {entregasDoColaborador.map((e) => {
          const tipo = tiposEpi.find((t) => t.id === e.tipoEpiId);
          return (
            <tr key={e.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{tipo?.nome}</td>
              <td className="py-2 pr-4">{e.dataEntrega}</td>
              <td className="py-2 pr-4">{e.dataValidade}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={e.status} />
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
