import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QrCode } from "@/components/ui/QrCode";
import { apiFetch, baseUrl } from "@/lib/api";
import type { Employee, PpeDelivery, PpeType, ExpiryStatus } from "@/lib/types";

async function getData(id: string) {
  const [deliveries, employees, ppeTypes] = await Promise.all([
    apiFetch<(PpeDelivery & { status: ExpiryStatus })[]>("/api/deliveries"),
    apiFetch<Employee[]>("/api/employees"),
    apiFetch<PpeType[]>("/api/ppe-types"),
  ]);

  const delivery = deliveries.find((e) => e.id === id);
  const employee = delivery && employees.find((c) => c.id === delivery.employeeId);
  const ppeType = delivery && ppeTypes.find((t) => t.id === delivery.ppeTypeId);

  return { delivery, employee, ppeType };
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-rule py-3">
      <dt className="label">{label}</dt>
      <dd className="text-sm mt-1">{value}</dd>
    </div>
  );
}

/**
 * Destino do QR Code impresso na etiqueta do equipamento. O técnico aponta o
 * celular para o capacete e vê, na hora, de quem é e se está vencido.
 */
export default async function EquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ delivery, employee, ppeType }, origin] = await Promise.all([getData(id), baseUrl()]);

  if (!delivery) {
    return (
      <div className="panel p-8 text-center max-w-md">
        <p className="signage text-lg mb-2">Equipamento não encontrado</p>
        <p className="text-sm text-smoke mb-6">
          O código <span className="data">{id}</span> não corresponde a nenhuma entrega
          registrada.
        </p>
        <Link href="/dashboard" className="button inline-block">
          Ir para o dashboard
        </Link>
      </div>
    );
  }

  const returned = Boolean(delivery.returnDate);

  return (
    <div className="max-w-md">
      <p className="label">Equipamento</p>
      <h1 className="signage text-3xl mt-1 mb-6">{ppeType?.name}</h1>

      <div className="panel p-5">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="label">Situação</span>
          {returned ? (
            <span className="label">Devolvido</span>
          ) : (
            <StatusBadge status={delivery.status} />
          )}
        </div>

        <dl>
          <Field
            label="Colaborador"
            value={
              employee ? (
                <Link
                  href={`/employees/${employee.id}`}
                  className="text-mandatory hover:underline"
                >
                  {employee.name}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Field label="Função" value={employee?.jobTitle ?? "—"} />
          <Field label="Entregue em" value={<span className="data">{delivery.deliveryDate}</span>} />
          <Field label="Válido até" value={<span className="data">{delivery.expiryDate}</span>} />
          <Field
            label="Devolução"
            value={
              delivery.returnDate ? (
                <span className="data">{delivery.returnDate}</span>
              ) : (
                "Em uso"
              )
            }
          />
          <Field
            label="Assinatura de recebimento"
            value={
              <>
                <span>
                  {delivery.signatureName} · {delivery.signatureDate}
                </span>
                {delivery.signatureImage && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URI validado na API
                  <img
                    src={delivery.signatureImage}
                    alt={`Assinatura de ${delivery.signatureName}`}
                    className="mt-2 border border-rule bg-steel max-w-full w-60"
                  />
                )}
              </>
            }
          />
        </dl>

        <div className="mt-6 flex items-center gap-4">
          <QrCode value={`${origin}/equipment/${delivery.id}`} size={96} />
          <div>
            <p className="data">{delivery.id}</p>
            <p className="label mt-1">Código do equipamento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
