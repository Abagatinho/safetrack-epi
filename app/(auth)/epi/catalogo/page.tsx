import { Table } from "@/components/ui/Table";
import { Cabecalho } from "@/components/ui/Cabecalho";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TipoEPI, EntregaEPI, StatusEntrega } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getDados() {
  const [tiposEpi, entregas] = await Promise.all([
    apiFetch<TipoEPI[]>("/api/tipos-epi"),
    apiFetch<(EntregaEPI & { status: StatusEntrega })[]>("/api/entregas"),
  ]);
  return { tiposEpi, entregas };
}

export default async function CatalogoPage() {
  const { tiposEpi, entregas } = await getDados();

  const linhas = tiposEpi.map((tipo) => {
    const doTipo = entregas.filter((e) => e.tipoEpiId === tipo.id);
    const vencidos = doTipo.filter((e) => e.status === "vencido").length;
    const vencendo = doTipo.filter((e) => e.status === "vencendo30d").length;

    // O pior estado em circulação define a sinalização da linha.
    const pior: StatusEntrega = vencidos > 0 ? "vencido" : vencendo > 0 ? "vencendo30d" : "ok";

    return { tipo, emCirculacao: doTipo.length, vencidos, pior };
  });

  return (
    <div>
      <Cabecalho
        eyebrow="Controle de EPI"
        titulo="Catálogo de equipamentos"
        descricao="Cada tipo de EPI tem uma validade padrão. Ela define quando o alerta de troca dispara após a entrega."
      />

      <Table headers={["Equipamento", "Validade padrão", "Em circulação", "Vencidos", "Situação"]}>
        {linhas.map(({ tipo, emCirculacao, vencidos, pior }) => (
          <tr key={tipo.id} className="border-b border-traco last:border-0">
            <td className="py-3 px-4 text-sm font-medium">{tipo.nome}</td>
            <td className="py-3 px-4 dado text-fumaca whitespace-nowrap">
              {tipo.validadeMeses} meses
            </td>
            <td className="py-3 px-4 dado">{emCirculacao}</td>
            <td className={`py-3 px-4 dado ${vencidos > 0 ? "text-perigo" : "text-fumaca"}`}>
              {vencidos}
            </td>
            <td className="py-3 px-4">
              {emCirculacao === 0 ? (
                <span className="etiqueta">Sem entregas</span>
              ) : (
                <StatusBadge status={pior} />
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
