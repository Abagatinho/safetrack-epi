import type { ExpiryStatus } from "@/lib/types";

/**
 * Sinalização de status. Cores e formas seguem a NBR 7195: verde é segurança,
 * amarelo é cuidado, vermelho é perigo. O círculo é a forma normativa.
 */
const CONFIG: Record<
  ExpiryStatus,
  { label: string; textColor: string; bgColor: string; mark: string; glyph: React.ReactNode }
> = {
  ok: {
    label: "Em dia",
    textColor: "text-safety",
    bgColor: "bg-safety-soft",
    mark: "bg-safety",
    glyph: (
      <path d="M4 8.5l2.8 2.8L12 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
    ),
  },
  expiringSoon: {
    label: "Vencendo",
    textColor: "text-graphite",
    bgColor: "bg-caution-soft",
    mark: "bg-caution",
    glyph: (
      <>
        <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
      </>
    ),
  },
  expired: {
    label: "Vencido",
    textColor: "text-danger",
    bgColor: "bg-danger-soft",
    mark: "bg-danger",
    glyph: (
      <>
        <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
      </>
    ),
  },
};

export function StatusBadge({ status }: { status: ExpiryStatus }) {
  const { label, textColor, bgColor, mark, glyph } = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-2 pr-3 pl-1 py-1 ${bgColor}`}>
      <span className={`pictogram ${mark}`} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-steel">
          {glyph}
        </svg>
      </span>
      <span className={`label ${textColor}`} style={{ letterSpacing: "0.08em" }}>
        {label}
      </span>
    </span>
  );
}
