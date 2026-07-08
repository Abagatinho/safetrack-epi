import { Card } from "@/components/ui/Card";

async function getResumo() {
  const res = await fetch("http://localhost:3000/api/dashboard/resumo", {
    cache: "no-store",
  });
  return res.json();
}

export default async function DashboardPage() {
  const resumo = await getResumo();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Colaboradores" value={resumo.totalColaboradores} />
        <Card title="EPIs vencendo (30d)" value={resumo.epiVencendo} />
        <Card title="EPIs vencidos" value={resumo.epiVencido} />
        <Card title="Dias sem acidente" value={resumo.diasSemAcidente ?? "-"} />
        <Card title="Checklists registrados" value={resumo.checklistsRegistrados} />
        <Card title="Incidentes (30d)" value={resumo.incidentesUltimos30d} />
      </div>
    </div>
  );
}
