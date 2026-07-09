import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewEmployeeForm } from "./NewEmployeeForm";
import type { Employee } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>("/api/employees");
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Colaboradores" />

      <NewEmployeeForm />

      <Table headers={["Nome", "Função", "Empresa cliente", "Histórico"]}>
        {employees.map((c) => (
          <tr key={c.id} className="border-b border-rule last:border-0">
            <td className="py-3 px-4 text-sm font-medium">{c.name}</td>
            <td className="py-3 px-4 text-sm text-smoke">{c.jobTitle}</td>
            <td className="py-3 px-4 text-sm text-smoke">{c.clientCompany}</td>
            <td className="py-3 px-4">
              <Link
                href={`/employees/${c.id}`}
                className="label text-mandatory hover:underline"
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
