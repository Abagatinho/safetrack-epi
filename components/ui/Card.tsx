type Tone = "neutral" | "danger" | "caution" | "safety";

const BAR: Record<Tone, string> = {
  neutral: "bg-rule",
  danger: "bg-danger",
  caution: "bg-caution",
  safety: "bg-safety",
};

const VALUE: Record<Tone, string> = {
  neutral: "text-graphite",
  danger: "text-danger",
  caution: "text-graphite",
  safety: "text-safety",
};

/**
 * Placa indicadora. A barra superior carrega a cor normativa do estado —
 * um indicador só fica vermelho quando o dado que ele mostra é uma falha.
 */
export function Card({
  title,
  value,
  subtitle,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  tone?: Tone;
}) {
  return (
    <div className="panel">
      <div className={`h-1 ${BAR[tone]}`} />
      <div className="p-4">
        <p className="label">{title}</p>
        {/* Figura proporcional em sans de corpo: display face e tabular-nums
            deixam um número solto com espaçamento frouxo em tamanho grande. */}
        <p className={`text-4xl font-semibold mt-2 ${VALUE[tone]}`}>{value}</p>
        {subtitle && <p className="data text-smoke mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
