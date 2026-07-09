"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Aprovar uma APR é assumir a análise. Por isso pede o nome de quem aprova em
 * vez de um clique anônimo — é esse nome que a LTR vai carregar no snapshot.
 */
export function ApproveButton({ aprId }: { aprId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function approve(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/aprs/${aprId}/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: name }),
    });

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="button">
        Aprovar
      </button>
    );
  }

  return (
    <form onSubmit={approve} className="flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="field"
        placeholder="Quem aprova"
        aria-label="Nome de quem aprova a APR"
        required
        autoFocus
      />
      <button type="submit" className="button button-heavy" disabled={saving}>
        {saving ? "Aprovando" : "Confirmar"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="label text-smoke hover:underline">
        Cancelar
      </button>
    </form>
  );
}
