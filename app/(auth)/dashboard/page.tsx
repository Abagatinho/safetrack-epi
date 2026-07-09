import { Card } from "@/components/ui/Card";
import { RiskStripe } from "@/components/ui/RiskStripe";
import { DaysWithoutAccidentBoard } from "@/components/ui/DaysWithoutAccidentBoard";
import { apiFetch } from "@/lib/api";

type Summary = {
  totalEmployees: number;
  ppeExpiringSoon: number;
  ppeExpired: number;
  checklistsRecorded: number;
  incidentsLast30d: number;
  daysWithoutAccident: number | null;
  expiredTrainings: number;
  pendingTrainings: number;
};

async function getSummary() {
  return apiFetch<Summary>("/api/dashboard/summary");
}

export default async function DashboardPage() {
  const summary = await getSummary();

  return (
    <div>
      <header className="mb-6">
        <p className="label">Visão geral</p>
        <h1 className="signage text-3xl mt-1">Dashboard</h1>
      </header>

      <RiskStripe count={summary.ppeExpired} href="/employees" />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-start">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <Card
            title="EPIs vencidos"
            value={summary.ppeExpired}
            tone={summary.ppeExpired > 0 ? "danger" : "safety"}
            subtitle="Troca imediata"
          />
          <Card
            title="Vencendo em 30 dias"
            value={summary.ppeExpiringSoon}
            tone={summary.ppeExpiringSoon > 0 ? "caution" : "safety"}
            subtitle="Programar reposição"
          />
          <Card
            title="Treinamentos pendentes"
            value={summary.pendingTrainings}
            tone={
              summary.expiredTrainings > 0
                ? "danger"
                : summary.pendingTrainings > 0
                  ? "caution"
                  : "safety"
            }
            subtitle={`${summary.expiredTrainings} vencidos`}
          />
          <Card title="Colaboradores" value={summary.totalEmployees} />
          <Card title="Checklists registrados" value={summary.checklistsRecorded} />
          <Card
            title="Incidentes (30 dias)"
            value={summary.incidentsLast30d}
            tone={summary.incidentsLast30d > 0 ? "caution" : "safety"}
          />
        </div>

        <div className="w-full lg:w-72">
          <DaysWithoutAccidentBoard days={summary.daysWithoutAccident ?? 0} size="compact" />
        </div>
      </div>
    </div>
  );
}
