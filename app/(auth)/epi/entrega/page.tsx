import { EntregaForm } from "./EntregaForm";
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
      <h1 className="text-xl font-semibold mb-4">Entrega de EPI</h1>
      <EntregaForm colaboradores={colaboradores} tiposEpi={tiposEpi} />
    </div>
  );
}
