import type { StatusEntrega } from "@/lib/types";

const CONFIG: Record<StatusEntrega, { label: string; className: string }> = {
  ok: { label: "Em dia", className: "bg-green-100 text-green-800" },
  vencendo30d: { label: "Vencendo", className: "bg-yellow-100 text-yellow-800" },
  vencido: { label: "Vencido", className: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: StatusEntrega }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
