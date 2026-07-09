import { describe, it, expect } from "vitest";
import {
  classifyRisk,
  aprBlockers,
  workerBlockers,
  checklistBlockers,
  issuanceBlockers,
  ltrStatus,
} from "./ltr";
import type {
  Apr,
  ChecklistAnswer,
  ChecklistTemplate,
  Employee,
  Ltr,
  NrTraining,
  PpeDelivery,
  PpeType,
  TrainingRecord,
} from "./types";

const TODAY = new Date("2026-07-09T08:00:00Z");

const ppeTypes: PpeType[] = [
  { id: "ppe-harness", name: "Cinto de segurança", validityMonths: 12 },
];

const trainings: NrTraining[] = [
  { id: "nr-35", standard: "NR-35", name: "Trabalho em altura", refresherMonths: 24 },
  { id: "nr-33", standard: "NR-33", name: "Espaço confinado", refresherMonths: 12 },
];

const employee: Employee = {
  id: "emp-1",
  name: "Marcos Silva",
  jobTitle: "Soldador",
  clientCompany: "Metalúrgica Recife",
};

const template: ChecklistTemplate = {
  id: "height-mewp",
  name: "Trabalho em altura com PEMT",
  standard: "NR-35",
  requiredTrainingIds: ["nr-35"],
  requiredPpeIds: ["ppe-harness"],
  items: [
    { id: "i1", type: "verification", description: "Área isolada", allowsNA: false },
    { id: "i2", type: "verification", description: "Solo nivelado", allowsNA: true },
    { id: "i3", type: "person", description: "Vigia", role: "Vigia", exclusive: true },
  ],
};

const approvedApr: Apr = {
  id: "apr-1",
  task: "Troca de luminária",
  location: "Galpão 2",
  date: "2026-07-08",
  author: "Ana Paula Souza",
  status: "approved",
  approvedBy: "Ana Paula Souza",
  approvedAt: "2026-07-08",
  steps: [],
};

function validDelivery(ppeTypeId: string): PpeDelivery {
  return {
    id: `del-${ppeTypeId}`,
    employeeId: "emp-1",
    ppeTypeId,
    deliveryDate: "2026-06-01",
    expiryDate: "2027-06-01",
    signatureName: "Marcos Silva",
    signatureDate: "2026-06-01",
    qrCodeValue: "del-x",
  };
}

function validRecord(trainingId: string): TrainingRecord {
  return {
    id: `rec-${trainingId}`,
    employeeId: "emp-1",
    trainingId,
    completionDate: "2026-01-10",
    expiryDate: "2028-01-10",
    instructor: "Ana Paula Souza",
  };
}

describe("classifyRisk", () => {
  it("multiplica probabilidade por severidade para achar a classe", () => {
    expect(classifyRisk({ likelihood: 1, severity: 1 })).toBe("trivial");
    expect(classifyRisk({ likelihood: 5, severity: 5 })).toBe("intolerable");
  });

  it("separa as classes nas fronteiras", () => {
    expect(classifyRisk({ likelihood: 2, severity: 2 })).toBe("tolerable");
    expect(classifyRisk({ likelihood: 3, severity: 3 })).toBe("moderate");
    expect(classifyRisk({ likelihood: 4, severity: 4 })).toBe("substantial");
  });
});

describe("aprBlockers", () => {
  it("acusa APR ausente", () => {
    expect(aprBlockers(undefined)).toHaveLength(1);
  });

  it("acusa APR ainda em rascunho", () => {
    const draft: Apr = { ...approvedApr, status: "draft" };
    const blockers = aprBlockers(draft);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("rascunho");
  });

  it("aceita APR aprovada", () => {
    expect(aprBlockers(approvedApr)).toEqual([]);
  });
});

describe("workerBlockers", () => {
  const evaluate = (records: TrainingRecord[], deliveries: PpeDelivery[]) =>
    workerBlockers(employee, template, trainings, records, deliveries, ppeTypes, TODAY);

  it("libera quem tem treinamento e EPI válidos", () => {
    expect(evaluate([validRecord("nr-35")], [validDelivery("ppe-harness")])).toEqual([]);
  });

  it("bloqueia quem nunca fez o treinamento exigido", () => {
    const blockers = evaluate([], [validDelivery("ppe-harness")]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("Marcos Silva");
    expect(blockers[0].message).toContain("NR-35");
  });

  it("bloqueia quem tem o treinamento vencido e diz desde quando", () => {
    const expired: TrainingRecord = {
      ...validRecord("nr-35"),
      completionDate: "2024-03-12",
      expiryDate: "2026-03-12",
    };
    const blockers = evaluate([expired], [validDelivery("ppe-harness")]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("2026-03-12");
  });

  it("aceita treinamento vencendo em menos de 30 dias, porque ainda vale hoje", () => {
    const expiringSoon: TrainingRecord = { ...validRecord("nr-35"), expiryDate: "2026-07-20" };
    expect(evaluate([expiringSoon], [validDelivery("ppe-harness")])).toEqual([]);
  });

  it("nomeia o EPI que falta em vez de mostrar o id", () => {
    const blockers = evaluate([validRecord("nr-35")], []);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("Cinto de segurança");
    expect(blockers[0].message).not.toContain("ppe-harness");
  });

  it("bloqueia quem devolveu o EPI exigido", () => {
    const returned: PpeDelivery = {
      ...validDelivery("ppe-harness"),
      returnDate: "2026-07-01",
    };
    expect(evaluate([validRecord("nr-35")], [returned])).toHaveLength(1);
  });

  it("ignora entregas e treinamentos de outro colaborador", () => {
    const someoneElse: TrainingRecord = { ...validRecord("nr-35"), employeeId: "emp-9" };
    const blockers = evaluate([someoneElse], [validDelivery("ppe-harness")]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("NR-35");
  });
});

describe("checklistBlockers", () => {
  const complete: ChecklistAnswer[] = [
    { itemId: "i1", type: "verification", answer: "yes" },
    { itemId: "i2", type: "verification", answer: "na" },
    { itemId: "i3", type: "person", name: "Ana Paula Souza" },
  ];

  it("aceita um checklist completo e conforme", () => {
    expect(checklistBlockers(template, complete, ["Marcos Silva"])).toEqual([]);
  });

  it("bloqueia item não respondido", () => {
    const blockers = checklistBlockers(template, complete.slice(1), ["Marcos Silva"]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("Área isolada");
  });

  it("bloqueia verificação respondida com não", () => {
    const failed: ChecklistAnswer[] = [
      { itemId: "i1", type: "verification", answer: "no" },
      ...complete.slice(1),
    ];
    const blockers = checklistBlockers(template, failed, ["Marcos Silva"]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("Área isolada");
  });

  it("bloqueia N/A em item que não permite N/A", () => {
    const wrongNA: ChecklistAnswer[] = [
      { itemId: "i1", type: "verification", answer: "na" },
      ...complete.slice(1),
    ];
    expect(checklistBlockers(template, wrongNA, ["Marcos Silva"])).toHaveLength(1);
  });

  it("bloqueia vigia que também é executante, porque a função é exclusiva", () => {
    const watcherIsWorker: ChecklistAnswer[] = [
      ...complete.slice(0, 2),
      { itemId: "i3", type: "person", name: "Marcos Silva" },
    ];
    const blockers = checklistBlockers(template, watcherIsWorker, ["Marcos Silva"]);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("Vigia");
  });

  it("bloqueia papel obrigatório sem ninguém designado", () => {
    const noWatcher: ChecklistAnswer[] = [
      ...complete.slice(0, 2),
      { itemId: "i3", type: "person", name: "   " },
    ];
    expect(checklistBlockers(template, noWatcher, ["Marcos Silva"])).toHaveLength(1);
  });
});

describe("checklistBlockers com medições", () => {
  const atmosphereTemplate: ChecklistTemplate = {
    id: "confined-space",
    name: "Espaço confinado",
    standard: "NR-33",
    requiredTrainingIds: [],
    requiredPpeIds: [],
    items: [
      { id: "o2", type: "measurement", description: "Oxigênio", unit: "%", min: 19.5, max: 23 },
      { id: "lel", type: "measurement", description: "Explosividade", unit: "% LIE", max: 10 },
    ],
  };

  const inRange: ChecklistAnswer[] = [
    { itemId: "o2", type: "measurement", value: 20.9 },
    { itemId: "lel", type: "measurement", value: 0 },
  ];

  it("aceita medições dentro da faixa", () => {
    expect(checklistBlockers(atmosphereTemplate, inRange, [])).toEqual([]);
  });

  it("bloqueia oxigênio abaixo do mínimo", () => {
    const poor: ChecklistAnswer[] = [{ itemId: "o2", type: "measurement", value: 18 }, inRange[1]];
    const blockers = checklistBlockers(atmosphereTemplate, poor, []);
    expect(blockers).toHaveLength(1);
    expect(blockers[0].message).toContain("19.5");
  });

  it("bloqueia oxigênio acima do máximo, porque enriquecimento também mata", () => {
    const rich: ChecklistAnswer[] = [{ itemId: "o2", type: "measurement", value: 24 }, inRange[1]];
    expect(checklistBlockers(atmosphereTemplate, rich, [])).toHaveLength(1);
  });

  it("aceita o valor exato do limite", () => {
    const atLimit: ChecklistAnswer[] = [
      { itemId: "o2", type: "measurement", value: 19.5 },
      { itemId: "lel", type: "measurement", value: 10 },
    ];
    expect(checklistBlockers(atmosphereTemplate, atLimit, [])).toEqual([]);
  });

  it("bloqueia medição ausente", () => {
    expect(checklistBlockers(atmosphereTemplate, [inRange[0]], [])).toHaveLength(1);
  });

  it("bloqueia medição não numérica", () => {
    const naN: ChecklistAnswer[] = [
      { itemId: "o2", type: "measurement", value: Number.NaN },
      inRange[1],
    ];
    expect(checklistBlockers(atmosphereTemplate, naN, [])).toHaveLength(1);
  });
});

describe("issuanceBlockers", () => {
  const input = {
    apr: approvedApr,
    template,
    workers: [employee],
    trainings,
    records: [validRecord("nr-35")],
    deliveries: [validDelivery("ppe-harness")],
    ppeTypes,
    answers: [
      { itemId: "i1", type: "verification", answer: "yes" },
      { itemId: "i2", type: "verification", answer: "na" },
      { itemId: "i3", type: "person", name: "Ana Paula Souza" },
    ] as ChecklistAnswer[],
    today: TODAY,
  };

  it("libera a emissão quando os três gates passam", () => {
    expect(issuanceBlockers(input)).toEqual([]);
  });

  it("exige ao menos um executante", () => {
    const blockers = issuanceBlockers({ ...input, workers: [] });
    expect(blockers).toHaveLength(1);
    expect(blockers[0].code).toBe("no-worker");
  });

  it("acumula bloqueios de gates diferentes em vez de parar no primeiro", () => {
    const blockers = issuanceBlockers({
      ...input,
      apr: { ...approvedApr, status: "draft" },
      records: [],
    });
    expect(blockers.length).toBeGreaterThanOrEqual(2);
    expect(blockers.map((b) => b.code)).toContain("apr-not-approved");
    expect(blockers.map((b) => b.code)).toContain("training");
  });
});

describe("ltrStatus", () => {
  const ltr = {
    issuedAt: "2026-07-09T07:00:00Z",
    validUntil: "2026-07-09T17:00:00Z",
  } as Ltr;

  it("está emitida dentro da janela de validade", () => {
    expect(ltrStatus(ltr, new Date("2026-07-09T12:00:00Z"))).toBe("issued");
  });

  it("expira depois da janela, sem ninguém precisar rodar nada", () => {
    expect(ltrStatus(ltr, new Date("2026-07-09T18:00:00Z"))).toBe("expired");
  });

  it("encerrada vence a expiração", () => {
    const closed: Ltr = { ...ltr, closure: { name: "Ana", date: "2026-07-09T16:00:00Z" } };
    expect(ltrStatus(closed, new Date("2026-07-09T18:00:00Z"))).toBe("closed");
  });

  it("cancelada vence tudo", () => {
    const cancelled: Ltr = {
      ...ltr,
      closure: { name: "Ana", date: "2026-07-09T16:00:00Z" },
      cancellation: { reason: "Chuva", by: "Ana", at: "2026-07-09T10:00:00Z" },
    };
    expect(ltrStatus(cancelled, new Date("2026-07-09T12:00:00Z"))).toBe("cancelled");
  });
});
