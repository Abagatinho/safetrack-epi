type Tom = "neutro" | "perigo" | "cuidado" | "seguranca";

const BARRA: Record<Tom, string> = {
  neutro: "bg-traco",
  perigo: "bg-perigo",
  cuidado: "bg-cuidado",
  seguranca: "bg-seguranca",
};

const VALOR: Record<Tom, string> = {
  neutro: "text-grafite",
  perigo: "text-perigo",
  cuidado: "text-grafite",
  seguranca: "text-seguranca",
};

/**
 * Placa indicadora. A barra superior carrega a cor normativa do estado —
 * um indicador só fica vermelho quando o dado que ele mostra é uma falha.
 */
export function Card({
  title,
  value,
  subtitle,
  tom = "neutro",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  tom?: Tom;
}) {
  return (
    <div className="placa">
      <div className={`h-1 ${BARRA[tom]}`} />
      <div className="p-4">
        <p className="etiqueta">{title}</p>
        <p
          className={`letreiro text-4xl mt-2 ${VALOR[tom]}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
        {subtitle && <p className="dado text-fumaca mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
