import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { NovoColaboradorForm } from "./NovoColaboradorForm";
import type { Colaborador } from "@/lib/types";

async function getColaboradores(): Promise<Colaborador[]> {
  const res = await fetch("http://localhost:3000/api/colaboradores", {
    cache: "no-store",
  });
  return res.json();
}

export default async function ColaboradoresPage() {
  const colaboradores = await getColaboradores();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Colaboradores</h1>
      <NovoColaboradorForm />
      <Table headers={["Nome", "Função", "Empresa cliente", ""]}>
        {colaboradores.map((c) => (
          <tr key={c.id} className="border-b border-gray-100">
            <td className="py-2 pr-4">{c.nome}</td>
            <td className="py-2 pr-4">{c.funcao}</td>
            <td className="py-2 pr-4">{c.empresaCliente}</td>
            <td className="py-2 pr-4">
              <Link href={`/colaboradores/${c.id}`} className="text-blue-600 text-sm">
                Ver histórico
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
