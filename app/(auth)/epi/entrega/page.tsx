import { EntregaForm } from "./EntregaForm";
import { Cabecalho } from "@/components/ui/Cabecalho";
import type { Colaborador, TipoEPI } from "@/lib/types";
import { apiFetch } from "@/lib/api";

async function getListas() {
  const [colaboradores, tiposEpi] = await Promise.all([
    apiFetch<Colaborador[]>("/api/colaboradores"),
    apiFetch<TipoEPI[]>("/api/tipos-epi"),
  ]);
  return { colaboradores, tiposEpi };
}

export default async function EntregaEpiPage() {
  const { colaboradores, tiposEpi } = await getListas();

  return (
    <div>
      <Cabecalho
        eyebrow="Controle de EPI"
        titulo="Entrega de EPI"
        descricao="A validade é calculada a partir da data de entrega. O alerta aparece no dashboard 30 dias antes de vencer."
      />
      <EntregaForm colaboradores={colaboradores} tiposEpi={tiposEpi} />
    </div>
  );
}
