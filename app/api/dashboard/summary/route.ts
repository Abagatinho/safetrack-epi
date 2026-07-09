import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { calculateStatus } from "@/lib/status";

export async function GET() {
  const db = await readDB();
  const today = new Date();

  const deliveriesWithStatus = db.deliveries.map((d) => ({
    ...d,
    status: calculateStatus(d.expiryDate, today, d.returnDate),
  }));

  const expiringSoon = deliveriesWithStatus.filter((d) => d.status === "expiringSoon").length;
  const expired = deliveriesWithStatus.filter((d) => d.status === "expired").length;

  const recordsWithStatus = db.trainingRecords.map((r) => ({
    ...r,
    status: calculateStatus(r.expiryDate, today),
  }));
  const expiredTrainings = recordsWithStatus.filter((r) => r.status === "expired").length;
  const expiringTrainings = recordsWithStatus.filter((r) => r.status === "expiringSoon").length;

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const recentIncidents = db.incidents.filter((i) => new Date(i.date) >= thirtyDaysAgo);

  const lastIncident = [...db.incidents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  const daysWithoutAccident = lastIncident
    ? Math.floor((today.getTime() - new Date(lastIncident.date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return NextResponse.json({
    totalEmployees: db.employees.length,
    ppeExpiringSoon: expiringSoon,
    ppeExpired: expired,
    checklistsRecorded: db.checklists.length,
    incidentsLast30d: recentIncidents.length,
    daysWithoutAccident,
    expiredTrainings,
    pendingTrainings: expiredTrainings + expiringTrainings,
  });
}
