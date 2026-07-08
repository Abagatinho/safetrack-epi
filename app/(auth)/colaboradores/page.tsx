import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { Cabecalho } from "@/components/ui/Cabecalho";
import { NovoColaboradorForm } from "./NovoColaboradorForm";
import type { Colaborador } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getColaboradores(): Promise<Colaborador[]> {
  return apiFetch<Colaborador[]>("/api/colaboradores");
}

export default async function ColaboradoresPage() {
  const colaboradores = await getColaboradores();

  return (
    <div>
      <Cabecalho eyebrow="Cadastro" titulo="Colaboradores" />

      <NovoColaboradorForm />

      <Table headers={["Nome", "Função", "Empresa cliente", "Histórico"]}>
        {colaboradores.map((c) => (
          <tr key={c.id} className="border-b border-traco last:border-0">
            <td className="py-3 px-4 text-sm font-medium">{c.nome}</td>
            <td className="py-3 px-4 text-sm text-fumaca">{c.funcao}</td>
            <td className="py-3 px-4 text-sm text-fumaca">{c.empresaCliente}</td>
            <td className="py-3 px-4">
              <Link
                href={`/colaboradores/${c.id}`}
                className="etiqueta text-advertencia hover:underline"
              >
                Ver ficha →
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
