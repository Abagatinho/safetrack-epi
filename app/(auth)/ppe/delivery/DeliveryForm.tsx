"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Employee, PpeType, PpeDelivery } from "@/lib/types";
import { QrCode } from "@/components/ui/QrCode";
import { SignaturePad } from "@/components/ui/SignaturePad";

export function DeliveryForm({
  employees,
  ppeTypes,
  origin,
}: {
  employees: Employee[];
  ppeTypes: PpeType[];
  origin: string;
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [ppeTypeId, setPpeTypeId] = useState(ppeTypes[0]?.id ?? "");
  const [signatureName, setSignatureName] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<PpeDelivery | null>(null);

  const selectedType = ppeTypes.find((t) => t.id === ppeTypeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!signatureImage) {
      setError("Peça ao colaborador para assinar antes de registrar a entrega.");
      return;
    }

    setError(null);
    setSaving(true);

    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, ppeTypeId, signatureName, signatureImage }),
    });

    setSaving(false);

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Não foi possível registrar a entrega.");
      return;
    }

    setConfirmed(await res.json());
    setSignatureName("");
    setSignatureImage(null);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,28rem)_auto] gap-8 items-start">
      <form onSubmit={handleSubmit} className="panel p-5">
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="label">Colaborador</span>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="field mt-1"
            >
              {employees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.jobTitle}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">Equipamento</span>
            <select
              value={ppeTypeId}
              onChange={(e) => setPpeTypeId(e.target.value)}
              className="field mt-1"
            >
              {ppeTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {selectedType && (
              <span className="data text-smoke mt-2 block">
                Validade de {selectedType.validityMonths} meses
              </span>
            )}
          </label>

          <label className="block">
            <span className="label">Nome de quem recebe</span>
            <input
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="field mt-1"
              required
            />
          </label>

          <SignaturePad onChange={setSignatureImage} />

          {error && <p className="label text-danger">{error}</p>}

          <button type="submit" className="button button-heavy mt-2" disabled={saving}>
            {saving ? "Registrando" : "Registrar entrega"}
          </button>
        </div>
      </form>

      {confirmed && (
        <div className="panel p-5 text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="pictogram bg-safety" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-steel">
                <path
                  d="M4 8.5l2.8 2.8L12 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="square"
                />
              </svg>
            </span>
            <span className="label text-safety">Entrega registrada</span>
          </div>

          <div className="flex justify-center">
            {/* Codifica a URL da ficha: escanear abre o equipamento no celular. */}
            <QrCode value={`${origin}/equipment/${confirmed.id}`} size={160} />
          </div>

          <p className="data mt-3">{confirmed.qrCodeValue}</p>
          <p className="label mt-1">Cole na etiqueta do equipamento</p>
          <p className="data text-smoke mt-4">Vence em {confirmed.expiryDate}</p>

          <Link
            href={`/equipment/${confirmed.id}`}
            className="label text-mandatory hover:underline inline-block mt-4"
          >
            Abrir ficha do equipamento →
          </Link>
        </div>
      )}
    </div>
  );
}
