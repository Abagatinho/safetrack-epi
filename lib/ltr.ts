import { calculateStatus } from "./status";
import type {
  Apr,
  ChecklistAnswer,
  ChecklistTemplate,
  Employee,
  Ltr,
  NrTraining,
  PpeDelivery,
  PpeType,
  Risk,
  RiskClass,
  TrainingRecord,
} from "./types";

/**
 * Um bloqueio é o motivo pelo qual a LTR não pode ser emitida. O `code` serve
 * ao sistema; a `message` vai para o emitente e precisa dizer o que falta e de
 * quem — "Marcos Silva: NR-35 vencida em 12/03/2026", nunca "requisitos não
 * atendidos".
 */
export interface Blocker {
  code: string;
  message: string;
}

export type LtrStatus = "issued" | "closed" | "expired" | "cancelled";

export function classifyRisk({ likelihood, severity }: Risk): RiskClass {
  const grade = likelihood * severity;
  if (grade <= 3) return "trivial";
  if (grade <= 6) return "tolerable";
  if (grade <= 12) return "moderate";
  if (grade <= 19) return "substantial";
  return "intolerable";
}

/** Gate 1: a APR mapeia o perigo, mas só uma aprovada autoriza a próxima etapa. */
export function aprBlockers(apr: Apr | undefined): Blocker[] {
  if (!apr) {
    return [{ code: "apr-missing", message: "Nenhuma APR vinculada a esta liberação." }];
  }
  if (apr.status !== "approved") {
    return [
      {
        code: "apr-not-approved",
        message: `A APR "${apr.task}" ainda está em rascunho. Aprove antes de emitir.`,
      },
    ];
  }
  return [];
}

/**
 * Gate 2: o executante está apto hoje?
 *
 * "Vencendo em 30 dias" não bloqueia: o treinamento ainda vale hoje, e a LTR
 * vale hoje. Só o vencido barra. Por isso a comparação é com `"expired"` e não
 * com `"ok"` — `calculateStatus` é a mesma função que rege EPI e treinamento em
 * todo o resto do sistema.
 */
export function workerBlockers(
  employee: Employee,
  template: ChecklistTemplate,
  trainings: NrTraining[],
  records: TrainingRecord[],
  deliveries: PpeDelivery[],
  ppeTypes: PpeType[],
  today: Date
): Blocker[] {
  const blockers: Blocker[] = [];

  for (const trainingId of template.requiredTrainingIds) {
    const standard = trainings.find((t) => t.id === trainingId)?.standard ?? trainingId;

    const own = records.filter(
      (r) => r.employeeId === employee.id && r.trainingId === trainingId
    );

    const valid = own.find((r) => calculateStatus(r.expiryDate, today) !== "expired");
    if (valid) continue;

    // Entre vários vencidos, o mais recente é a informação útil.
    const mostRecent = own.slice().sort((a, b) => b.expiryDate.localeCompare(a.expiryDate))[0];

    blockers.push({
      code: "training",
      message: mostRecent
        ? `${employee.name}: ${standard} vencida em ${mostRecent.expiryDate}.`
        : `${employee.name}: sem ${standard} registrada.`,
    });
  }

  for (const ppeTypeId of template.requiredPpeIds) {
    const ppeName = ppeTypes.find((t) => t.id === ppeTypeId)?.name ?? ppeTypeId;

    const inUse = deliveries.filter(
      (d) => d.employeeId === employee.id && d.ppeTypeId === ppeTypeId && !d.returnDate
    );

    const valid = inUse.some((d) => calculateStatus(d.expiryDate, today) !== "expired");
    if (valid) continue;

    blockers.push({
      code: "ppe",
      message: inUse.length
        ? `${employee.name}: ${ppeName} com validade expirada.`
        : `${employee.name}: ${ppeName} não entregue ou já devolvido.`,
    });
  }

  return blockers;
}

/**
 * Gate 3: o checklist está completo e conforme?
 *
 * As medições não passam pelo julgamento de ninguém: 18% de oxigênio reprova
 * mesmo que o emitente ache que está tudo bem.
 */
export function checklistBlockers(
  template: ChecklistTemplate,
  answers: ChecklistAnswer[],
  workerNames: string[]
): Blocker[] {
  const blockers: Blocker[] = [];

  for (const item of template.items) {
    const answer = answers.find((a) => a.itemId === item.id);

    if (!answer || answer.type !== item.type) {
      blockers.push({
        code: "item-unanswered",
        message: `Item não respondido: ${item.description}.`,
      });
      continue;
    }

    if (item.type === "verification" && answer.type === "verification") {
      if (answer.answer === "no") {
        blockers.push({
          code: "item-failed",
          message: `Não conformidade: ${item.description}.`,
        });
      } else if (answer.answer === "na" && !item.allowsNA) {
        blockers.push({
          code: "item-na-not-allowed",
          message: `${item.description} não admite N/A.`,
        });
      }
    }

    if (item.type === "measurement" && answer.type === "measurement") {
      const { value } = answer;
      if (!Number.isFinite(value)) {
        blockers.push({
          code: "measurement-invalid",
          message: `${item.description}: informe a medição.`,
        });
      } else if (item.min !== undefined && value < item.min) {
        blockers.push({
          code: "measurement-out-of-range",
          message: `${item.description}: ${value}${item.unit} abaixo do mínimo de ${item.min}${item.unit}.`,
        });
      } else if (item.max !== undefined && value > item.max) {
        blockers.push({
          code: "measurement-out-of-range",
          message: `${item.description}: ${value}${item.unit} acima do máximo de ${item.max}${item.unit}.`,
        });
      }
    }

    if (item.type === "person" && answer.type === "person") {
      const name = answer.name.trim();
      if (!name) {
        blockers.push({
          code: "role-unassigned",
          message: `${item.role}: designe um responsável.`,
        });
      } else if (item.exclusive && workerNames.includes(name)) {
        // O vigia que também executa desvia a atenção da atmosfera e do
        // trabalhador — a NR-33 faz da vigia uma função exclusiva.
        blockers.push({
          code: "role-not-exclusive",
          message: `${item.role} não pode ser também executante: ${name} está nas duas listas.`,
        });
      }
    }
  }

  return blockers;
}

export interface IssuanceInput {
  apr: Apr | undefined;
  template: ChecklistTemplate;
  workers: Employee[];
  trainings: NrTraining[];
  records: TrainingRecord[];
  deliveries: PpeDelivery[];
  ppeTypes: PpeType[];
  answers: ChecklistAnswer[];
  today: Date;
}

/**
 * Os três gates de uma vez. Devolve todos os bloqueios, não o primeiro: quem
 * emite precisa ver a lista inteira do que resolver, não descobrir um por vez.
 *
 * Lista vazia é a única condição que autoriza emitir. Não há override — um
 * botão "emitir mesmo assim" faria a assinatura do emitente atestar algo que o
 * sistema sabia ser falso.
 */
export function issuanceBlockers(input: IssuanceInput): Blocker[] {
  const { apr, template, workers, trainings, records, deliveries, ppeTypes, answers, today } =
    input;

  const blockers = [...aprBlockers(apr)];

  if (workers.length === 0) {
    blockers.push({ code: "no-worker", message: "Indique ao menos um executante." });
  }

  for (const worker of workers) {
    blockers.push(
      ...workerBlockers(worker, template, trainings, records, deliveries, ppeTypes, today)
    );
  }

  blockers.push(
    ...checklistBlockers(
      template,
      answers,
      workers.map((w) => w.name)
    )
  );

  return blockers;
}

/** Status derivado do relógio e dos registros — nunca armazenado, nunca stale. */
export function ltrStatus(ltr: Ltr, now: Date): LtrStatus {
  if (ltr.cancellation) return "cancelled";
  if (ltr.closure) return "closed";
  return new Date(ltr.validUntil) < now ? "expired" : "issued";
}
