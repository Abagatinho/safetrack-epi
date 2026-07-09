"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReturnButton({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function returnItem() {
    setSending(true);
    await fetch(`/api/deliveries/${deliveryId}/return`, { method: "POST" });
    setSending(false);
    router.refresh();
  }

  return (
    <button
      onClick={returnItem}
      disabled={sending}
      className="label text-mandatory hover:underline disabled:opacity-50 disabled:no-underline"
    >
      {sending ? "Registrando" : "Registrar devolução"}
    </button>
  );
}
