import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QrCode } from "@/components/ui/QrCode";
import { apiFetch, baseUrl } from "@/lib/api";
import type { Colaborador, EntregaEPI, TipoEPI, StatusEntrega } from "@/lib/types";

async function getDados(id: string) {
  const [entregas, colaboradores, tiposEpi] = await Promise.all([
    apiFetch<(EntregaEPI & { status: StatusEntrega })[]>("/api/entregas"),
    apiFetch<Colaborador[]>("/api/colaboradores"),
    apiFetch<TipoEPI[]>("/api/tipos-epi"),
  ]);

  const entrega = entregas.find((e) => e.id === id);
  const colaborador = entrega && colaboradores.find((c) => c.id === entrega.colaboradorId);
  const tipoEpi = entrega && tiposEpi.find((t) => t.id === entrega.tipoEpiId);

  return { entrega, colaborador, tipoEpi };
}

function Campo({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="border-b border-traco py-3">
      <dt className="etiqueta">{rotulo}</dt>
      <dd className="text-sm mt-1">{valor}</dd>
    </div>
  );
}

/**
 * Destino do QR Code impresso na etiqueta do equipamento. O técnico aponta o
 * celular para o capacete e vê, na hora, de quem é e se está vencido.
 */
export default async function EquipamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ entrega, colaborador, tipoEpi }, origem] = await Promise.all([getDados(id), baseUrl()]);

  if (!entrega) {
    return (
      <div className="placa p-8 text-center max-w-md">
        <p className="letreiro text-lg mb-2">Equipamento não encontrado</p>
        <p className="text-sm text-fumaca mb-6">
          O código <span className="dado">{id}</span> não corresponde a nenhuma entrega
          registrada.
        </p>
        <Link href="/dashboard" className="botao inline-block">
          Ir para o dashboard
        </Link>
      </div>
    );
  }

  const devolvido = Boolean(entrega.dataDevolucao);

  return (
    <div className="max-w-md">
      <p className="etiqueta">Equipamento</p>
      <h1 className="letreiro text-3xl mt-1 mb-6">{tipoEpi?.nome}</h1>

      <div className="placa p-5">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="etiqueta">Situação</span>
          {devolvido ? (
            <span className="etiqueta">Devolvido</span>
          ) : (
            <StatusBadge status={entrega.status} />
          )}
        </div>

        <dl>
          <Campo
            rotulo="Colaborador"
            valor={
              colaborador ? (
                <Link
                  href={`/colaboradores/${colaborador.id}`}
                  className="text-advertencia hover:underline"
                >
                  {colaborador.nome}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Campo rotulo="Função" valor={colaborador?.funcao ?? "—"} />
          <Campo rotulo="Entregue em" valor={<span className="dado">{entrega.dataEntrega}</span>} />
          <Campo rotulo="Válido até" valor={<span className="dado">{entrega.dataValidade}</span>} />
          <Campo
            rotulo="Devolução"
            valor={
              entrega.dataDevolucao ? (
                <span className="dado">{entrega.dataDevolucao}</span>
              ) : (
                "Em uso"
              )
            }
          />
          <Campo
            rotulo="Assinatura de recebimento"
            valor={
              <>
                <span>
                  {entrega.assinaturaNome} · {entrega.assinaturaData}
                </span>
                {entrega.assinaturaImagem && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URI validado na API
                  <img
                    src={entrega.assinaturaImagem}
                    alt={`Assinatura de ${entrega.assinaturaNome}`}
                    className="mt-2 border border-traco bg-aco max-w-full w-60"
                  />
                )}
              </>
            }
          />
        </dl>

        <div className="mt-6 flex items-center gap-4">
          <QrCode valor={`${origem}/equipamento/${entrega.id}`} tamanho={96} />
          <div>
            <p className="dado">{entrega.id}</p>
            <p className="etiqueta mt-1">Código do equipamento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
