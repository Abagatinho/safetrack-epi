import type { StatusEntrega } from "@/lib/types";

/**
 * Sinalização de status. Cores e formas seguem a NBR 7195: verde é segurança,
 * amarelo é cuidado, vermelho é perigo. O círculo é a forma normativa.
 */
const CONFIG: Record<
  StatusEntrega,
  { label: string; corTexto: string; corFundo: string; marca: string; glifo: React.ReactNode }
> = {
  ok: {
    label: "Em dia",
    corTexto: "text-seguranca",
    corFundo: "bg-seguranca-fraco",
    marca: "bg-seguranca",
    glifo: (
      <path d="M4 8.5l2.8 2.8L12 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
    ),
  },
  vencendo30d: {
    label: "Vencendo",
    corTexto: "text-grafite",
    corFundo: "bg-cuidado-fraco",
    marca: "bg-cuidado",
    glifo: (
      <>
        <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
      </>
    ),
  },
  vencido: {
    label: "Vencido",
    corTexto: "text-perigo",
    corFundo: "bg-perigo-fraco",
    marca: "bg-perigo",
    glifo: (
      <>
        <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
      </>
    ),
  },
};

export function StatusBadge({ status }: { status: StatusEntrega }) {
  const { label, corTexto, corFundo, marca, glifo } = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-2 pr-3 pl-1 py-1 ${corFundo}`}>
      <span className={`pictograma ${marca}`} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-aco">
          {glifo}
        </svg>
      </span>
      <span className={`etiqueta ${corTexto}`} style={{ letterSpacing: "0.08em" }}>
        {label}
      </span>
    </span>
  );
}
