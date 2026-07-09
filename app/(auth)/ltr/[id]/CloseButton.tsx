"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/ui/SignaturePad";

/**
 * Encerrar é atestar que o trabalho acabou e a área ficou em condição segura.
 * Uma LTR expirada ainda pode ser encerrada — a assinatura é o que falta, e o
 * relógio não a produz sozinho.
 */
export function CloseButton({ ltrId }: { ltrId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function close(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/ltrs/${ltrId}/closure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Não foi possível encerrar.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="button button-heavy">
        Encerrar liberação
      </button>
    );
  }

  return (
    <form onSubmit={close} className="panel p-5 max-w-md">
      <label className="block mb-4">
        <span className="label">Quem encerra</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field mt-1"
          required
          autoFocus
        />
      </label>

      <SignaturePad onChange={setImage} />

      <div className="flex items-center gap-4 mt-4">
        <button type="submit" className="button button-heavy" disabled={saving}>
          {saving ? "Encerrando" : "Confirmar encerramento"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="label text-smoke hover:underline"
        >
          Cancelar
        </button>
      </div>

      {error && <p className="label text-danger mt-3">{error}</p>}
    </form>
  );
}
