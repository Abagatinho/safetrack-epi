import type { Incidente, GravidadeIncidente } from "@/lib/types";

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

const GRAVIDADES: { chave: GravidadeIncidente; label: string; cor: string }[] = [
  { chave: "leve", label: "Leve", cor: "bg-cuidado" },
  { chave: "moderado", label: "Moderado", cor: "bg-maquina" },
  { chave: "grave", label: "Grave", cor: "bg-perigo" },
];

type Linha = {
  local: string;
  total: number;
  contagem: Record<GravidadeIncidente, number>;
};

function agrupar(incidentes: Incidente[]): Linha[] {
  const mapa = new Map<string, Linha>();

  for (const i of incidentes) {
    const linha = mapa.get(i.local) ?? {
      local: i.local,
      total: 0,
      contagem: { leve: 0, moderado: 0, grave: 0 },
    };
    linha.contagem[i.gravidade] += 1;
    linha.total += 1;
    mapa.set(i.local, linha);
  }

  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

export function BarrasIncidentes({ incidentes }: { incidentes: Incidente[] }) {
  const linhas = agrupar(incidentes);

  if (linhas.length === 0) {
    return (
      <div className="placa p-8 text-center">
        <p className="text-sm text-fumaca">
          Nenhum incidente registrado no período. O gráfico aparece com a primeira ocorrência.
        </p>
      </div>
    );
  }

  const maiorTotal = Math.max(...linhas.map((l) => l.total));

  return (
    <figure className="placa p-5 m-0">
      <figcaption className="mb-1">
        <span className="letreiro text-sm">Incidentes por local</span>
      </figcaption>
      <p className="etiqueta mb-5">Empilhado por gravidade</p>

      {/* Legenda: identidade nunca depende só da cor. */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        {GRAVIDADES.map((g) => (
          <li key={g.chave} className="flex items-center gap-2">
            <span className={`w-3 h-3 ${g.cor}`} aria-hidden="true" />
            <span className="etiqueta">{g.label}</span>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-5">
        {linhas.map((linha) => (
          <li key={linha.local}>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="text-sm">{linha.local}</span>
              {/* Rótulo direto: só o total, na ponta. Nunca um número por segmento. */}
              <span className="dado shrink-0">{linha.total}</span>
            </div>

            {/* gap-[2px] deixa a superfície aparecer entre segmentos.
                Nunca uma borda em volta da marca. */}
            <div className="flex gap-[2px] h-4">
              {GRAVIDADES.map((g) => {
                const valor = linha.contagem[g.chave];
                if (valor === 0) return null;
                return (
                  <div
                    key={g.chave}
                    className={g.cor}
                    style={{ width: `${(valor / maiorTotal) * 100}%` }}
                    title={`${linha.local} · ${g.label}: ${valor}`}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {/* Table view: exigida pelo contraste baixo do amarelo normativo.
          Todo valor do gráfico é legível aqui como texto. */}
      <details className="mt-6 border-t border-traco pt-4">
        <summary className="etiqueta cursor-pointer hover:text-grafite">
          Ver dados em tabela
        </summary>
        <table className="w-full text-left mt-4 border-collapse">
          <thead>
            <tr className="border-b border-traco">
              <th className="etiqueta py-2 pr-4">Local</th>
              {GRAVIDADES.map((g) => (
                <th key={g.chave} className="etiqueta py-2 pr-4">
                  {g.label}
                </th>
              ))}
              <th className="etiqueta py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.local} className="border-b border-traco last:border-0">
                <td className="py-2 pr-4 text-sm">{linha.local}</td>
                {GRAVIDADES.map((g) => (
                  <td key={g.chave} className="py-2 pr-4 dado text-fumaca">
                    {linha.contagem[g.chave]}
                  </td>
                ))}
                <td className="py-2 dado">{linha.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
