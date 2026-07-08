import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table } from "@/components/ui/Table";
import { FaixaRisco } from "@/components/ui/FaixaRisco";
import type { Colaborador, EntregaEPI, TipoEPI, StatusEntrega } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getDados(id: string) {
  const [colaboradores, entregas, tiposEpi] = await Promise.all([
    apiFetch<Colaborador[]>("/api/colaboradores"),
    apiFetch<(EntregaEPI & { status: StatusEntrega })[]>("/api/entregas"),
    apiFetch<TipoEPI[]>("/api/tipos-epi"),
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

  if (!colaborador) {
    return (
      <div className="placa p-8 text-center">
        <p className="letreiro text-lg mb-2">Colaborador não encontrado</p>
        <p className="text-sm text-fumaca mb-6">
          A ficha pode ter sido removida ou o endereço está incorreto.
        </p>
        <Link href="/colaboradores" className="botao inline-block">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const vencidos = entregasDoColaborador.filter((e) => e.status === "vencido").length;

  return (
    <div>
      <header className="mb-6">
        <Link href="/colaboradores" className="etiqueta text-advertencia hover:underline">
          ← Colaboradores
        </Link>
        <h1 className="letreiro text-3xl mt-3">{colaborador.nome}</h1>
        <p className="dado text-fumaca mt-2">
          {colaborador.funcao} · {colaborador.empresaCliente}
        </p>
      </header>

      <FaixaRisco quantidade={vencidos} />

      <p className="etiqueta mb-3">Ficha de entrega de EPI</p>

      {entregasDoColaborador.length === 0 ? (
        <div className="placa p-8 text-center">
          <p className="text-sm text-fumaca mb-6">
            Nenhum EPI entregue a {colaborador.nome.split(" ")[0]} até agora.
          </p>
          <Link href="/epi/entrega" className="botao inline-block">
            Registrar entrega
          </Link>
        </div>
      ) : (
        <Table headers={["Equipamento", "Entrega", "Validade", "Status"]}>
          {entregasDoColaborador.map((e) => {
            const tipo = tiposEpi.find((t) => t.id === e.tipoEpiId);
            return (
              <tr key={e.id} className="border-b border-traco last:border-0">
                <td className="py-3 px-4 text-sm font-medium">{tipo?.nome}</td>
                <td className="py-3 px-4 dado text-fumaca">{e.dataEntrega}</td>
                <td className="py-3 px-4 dado text-fumaca">{e.dataValidade}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
