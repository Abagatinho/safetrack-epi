import { Card } from "@/components/ui/Card";
import { FaixaRisco } from "@/components/ui/FaixaRisco";
import { QuadroDiasSemAcidente } from "@/components/ui/QuadroDiasSemAcidente";
import { apiFetch } from "@/lib/api";

type Resumo = {
  totalColaboradores: number;
  epiVencendo: number;
  epiVencido: number;
  checklistsRegistrados: number;
  incidentesUltimos30d: number;
  diasSemAcidente: number | null;
  treinamentosVencidos: number;
  treinamentosPendentes: number;
};

async function getResumo() {
  return apiFetch<Resumo>("/api/dashboard/resumo");
}

export default async function DashboardPage() {
  const resumo = await getResumo();

  return (
    <div>
      <header className="mb-6">
        <p className="etiqueta">Visão geral</p>
        <h1 className="letreiro text-3xl mt-1">Dashboard</h1>
      </header>

      <FaixaRisco quantidade={resumo.epiVencido} href="/colaboradores" />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-start">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <Card
            title="EPIs vencidos"
            value={resumo.epiVencido}
            tom={resumo.epiVencido > 0 ? "perigo" : "seguranca"}
            subtitle="Troca imediata"
          />
          <Card
            title="Vencendo em 30 dias"
            value={resumo.epiVencendo}
            tom={resumo.epiVencendo > 0 ? "cuidado" : "seguranca"}
            subtitle="Programar reposição"
          />
          <Card
            title="Treinamentos pendentes"
            value={resumo.treinamentosPendentes}
            tom={
              resumo.treinamentosVencidos > 0
                ? "perigo"
                : resumo.treinamentosPendentes > 0
                  ? "cuidado"
                  : "seguranca"
            }
            subtitle={`${resumo.treinamentosVencidos} vencidos`}
          />
          <Card title="Colaboradores" value={resumo.totalColaboradores} />
          <Card title="Checklists registrados" value={resumo.checklistsRegistrados} />
          <Card
            title="Incidentes (30 dias)"
            value={resumo.incidentesUltimos30d}
            tom={resumo.incidentesUltimos30d > 0 ? "cuidado" : "seguranca"}
          />
        </div>

        <div className="w-full lg:w-72">
          <QuadroDiasSemAcidente dias={resumo.diasSemAcidente ?? 0} tamanho="compacto" />
        </div>
      </div>
    </div>
  );
}
