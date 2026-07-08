import { EntregaForm } from "./EntregaForm";
import type { Colaborador, TipoEPI } from "@/lib/types";

async function getListas() {
  const [colaboradores, tiposEpi]: [Colaborador[], TipoEPI[]] = await Promise.all([
    fetch("http://localhost:3000/api/colaboradores", { cache: "no-store" }).then((r) => r.json()),
    fetch("http://localhost:3000/api/tipos-epi", { cache: "no-store" }).then((r) => r.json()),
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
