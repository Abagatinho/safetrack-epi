import { classifyRisk } from "@/lib/ltr";
import type { Risk, RiskClass } from "@/lib/types";

const CONFIG: Record<RiskClass, { label: string; style: string }> = {
  trivial: { label: "Trivial", style: "bg-safety-soft text-safety" },
  tolerable: { label: "Tolerável", style: "bg-safety-soft text-safety" },
  moderate: { label: "Moderado", style: "bg-caution-soft text-graphite" },
  substantial: { label: "Substancial", style: "bg-mandatory-soft text-mandatory" },
  intolerable: { label: "Intolerável", style: "bg-danger-soft text-danger" },
};

/** Mostra o grau junto da classe: "12 · Moderado" diz mais que só a palavra. */
export function RiskBadge({ risk }: { risk: Risk }) {
  const riskClass = classifyRisk(risk);
  const { label, style } = CONFIG[riskClass];
  const grade = risk.likelihood * risk.severity;

  return (
    <span className={`label inline-block px-2 py-1 whitespace-nowrap ${style}`}>
      {grade} · {label}
    </span>
  );
}
