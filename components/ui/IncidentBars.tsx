import type { Incident, IncidentSeverity } from "@/lib/types";

/**
 * Incidentes por local, empilhados por gravidade.
 *
 * Cores: status palette da NBR 7195, não categórica. CVD verificado —
 * pior par adjacente ΔE 26.4 (deutan), acima do piso 12.
 *
 * O amarelo de cuidado tem só 1.49:1 contra a superfície de aço. A cor é
 * normativa e não pode ser trocada, então o contraste é compensado com
 * relief: legenda rotulada, total direto na ponta e a tabela de dados
 * logo abaixo, onde todo valor é legível como texto.
 */

const SEVERITIES: { key: IncidentSeverity; label: string; color: string }[] = [
  { key: "minor", label: "Leve", color: "bg-caution" },
  { key: "moderate", label: "Moderado", color: "bg-machine" },
  { key: "severe", label: "Grave", color: "bg-danger" },
];

type Row = {
  location: string;
  total: number;
  counts: Record<IncidentSeverity, number>;
};

function group(incidents: Incident[]): Row[] {
  const map = new Map<string, Row>();

  for (const i of incidents) {
    const row = map.get(i.location) ?? {
      location: i.location,
      total: 0,
      counts: { minor: 0, moderate: 0, severe: 0 },
    };
    row.counts[i.severity] += 1;
    row.total += 1;
    map.set(i.location, row);
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function IncidentBars({ incidents }: { incidents: Incident[] }) {
  const rows = group(incidents);

  if (rows.length === 0) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-smoke">
          Nenhum incidente registrado no período. O gráfico aparece com a primeira ocorrência.
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...rows.map((l) => l.total));

  return (
    <figure className="panel p-5 m-0">
      <figcaption className="mb-1">
        <span className="signage text-sm">Incidentes por local</span>
      </figcaption>
      <p className="label mb-5">Empilhado por gravidade</p>

      {/* Legenda: identidade nunca depende só da cor. */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {SEVERITIES.map((g) => (
          <li key={g.key} className="flex items-center gap-2">
            <span className={`w-3 h-3 ${g.color}`} aria-hidden="true" />
            <span className="label">{g.label}</span>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-5">
        {rows.map((row) => (
          <li key={row.location}>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="text-sm">{row.location}</span>
              {/* Rótulo direto: só o total, na ponta. Nunca um número por segmento. */}
              <span className="data shrink-0">{row.total}</span>
            </div>

            {/* gap-[2px] deixa a superfície aparecer entre segmentos.
                Nunca uma borda em volta da marca. */}
            <div className="flex gap-[2px] h-4">
              {SEVERITIES.map((g) => {
                const value = row.counts[g.key];
                if (value === 0) return null;
                return (
                  <div
                    key={g.key}
                    className={g.color}
                    style={{ width: `${(value / maxTotal) * 100}%` }}
                    title={`${row.location} · ${g.label}: ${value}`}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {/* Table view: exigida pelo contraste baixo do amarelo normativo.
          Todo valor do gráfico é legível aqui como texto. */}
      <details className="mt-6 border-t border-rule pt-4">
        <summary className="label cursor-pointer hover:text-graphite">
          Ver dados em tabela
        </summary>
        <table className="w-full text-left mt-4 border-collapse">
          <thead>
            <tr className="border-b border-rule">
              <th className="label py-2 pr-4">Local</th>
              {SEVERITIES.map((g) => (
                <th key={g.key} className="label py-2 pr-4">
                  {g.label}
                </th>
              ))}
              <th className="label py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.location} className="border-b border-rule last:border-0">
                <td className="py-2 pr-4 text-sm">{row.location}</td>
                {SEVERITIES.map((g) => (
                  <td key={g.key} className="py-2 pr-4 data text-smoke">
                    {row.counts[g.key]}
                  </td>
                ))}
                <td className="py-2 data">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
