import { promises as fs } from "fs";
import path from "path";
import type {
  DB,
  Employee,
  PpeType,
  PpeDelivery,
  DailyChecklist,
  Incident,
  NrTraining,
  TrainingRecord,
  ChecklistTemplate,
  Apr,
  Ltr,
} from "../lib/types";
import { calculateExpiryDate } from "../lib/status";

const TODAY = "2026-07-08";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const employees: Employee[] = [
  { id: "emp-1", name: "Marcos Silva", jobTitle: "Soldador", clientCompany: "Metalúrgica Recife" },
  { id: "emp-2", name: "Ana Paula Souza", jobTitle: "Técnica de Segurança", clientCompany: "Metalúrgica Recife" },
  { id: "emp-3", name: "João Pedro Lima", jobTitle: "Operador de Empilhadeira", clientCompany: "Logística Nordeste" },
  { id: "emp-4", name: "Carla Mendes", jobTitle: "Eletricista", clientCompany: "Metalúrgica Recife" },
  { id: "emp-5", name: "Rafael Torres", jobTitle: "Pedreiro", clientCompany: "Construtora Atlântico" },
  { id: "emp-6", name: "Beatriz Costa", jobTitle: "Auxiliar de Produção", clientCompany: "Logística Nordeste" },
  { id: "emp-7", name: "Diego Fernandes", jobTitle: "Montador", clientCompany: "Construtora Atlântico" },
  { id: "emp-8", name: "Larissa Alves", jobTitle: "Operadora de Máquina", clientCompany: "Metalúrgica Recife" },
];

const ppeTypes: PpeType[] = [
  { id: "ppe-helmet", name: "Capacete de segurança", validityMonths: 24 },
  { id: "ppe-glove", name: "Luva de proteção", validityMonths: 6 },
  { id: "ppe-goggles", name: "Óculos de proteção", validityMonths: 12 },
  { id: "ppe-boot", name: "Bota de segurança", validityMonths: 12 },
  { id: "ppe-earplug", name: "Protetor auricular", validityMonths: 6 },
  { id: "ppe-harness", name: "Cinto de segurança (trabalho em altura)", validityMonths: 12 },
  { id: "ppe-insulating-glove", name: "Luva isolante para eletricidade", validityMonths: 6 },
  { id: "ppe-welding-mask", name: "Máscara de solda", validityMonths: 24 },
];

function buildDeliveries(): PpeDelivery[] {
  // combinações colaborador x tipo, com data de entrega variando pra
  // produzir mistura de status ok / expiringSoon / expired
  const offsets = [-400, -370, -200, -20, -10, 0, 10, 40, 100, 200, 300, 350];
  const deliveries: PpeDelivery[] = [];
  let i = 0;

  for (const employee of employees) {
    for (const ppe of [ppeTypes[i % ppeTypes.length], ppeTypes[(i + 2) % ppeTypes.length]]) {
      const offset = offsets[i % offsets.length];
      const deliveryDate = addDays(TODAY, offset - ppe.validityMonths * 30 + 30); // aproxima cenários variados

      deliveries.push({
        id: `del-${i + 1}`,
        employeeId: employee.id,
        ppeTypeId: ppe.id,
        deliveryDate,
        expiryDate: calculateExpiryDate(deliveryDate, ppe.validityMonths),
        signatureName: employee.name,
        signatureDate: deliveryDate,
        qrCodeValue: `del-${i + 1}`,
      });
      i++;
    }
  }

  // As entregas acima são geradas para variar o status. Estas são deliberadas:
  // sem elas, nenhum colaborador do seed passaria o gate de EPI da LTR e a
  // demonstração só mostraria bloqueios.
  const GUARANTEED: [string, string][] = [
    ["emp-7", "ppe-harness"], // Diego, apto a trabalho em altura
    ["emp-7", "ppe-helmet"],
    ["emp-4", "ppe-insulating-glove"], // Carla, apta a trabalho elétrico
    ["emp-4", "ppe-helmet"],
    ["emp-1", "ppe-welding-mask"], // Marcos, apto a trabalho a quente
    ["emp-1", "ppe-glove"],
    ["emp-2", "ppe-helmet"], // Ana Paula, apta a espaço confinado
  ];

  for (const [employeeId, ppeTypeId] of GUARANTEED) {
    const ppe = ppeTypes.find((t) => t.id === ppeTypeId)!;
    const name = employees.find((e) => e.id === employeeId)!.name;
    const deliveryDate = addDays(TODAY, -30);

    deliveries.push({
      id: `del-${i + 1}`,
      employeeId,
      ppeTypeId,
      deliveryDate,
      expiryDate: calculateExpiryDate(deliveryDate, ppe.validityMonths),
      signatureName: name,
      signatureDate: deliveryDate,
      qrCodeValue: `del-${i + 1}`,
    });
    i++;
  }

  return deliveries;
}

const checklists: DailyChecklist[] = [
  {
    id: "chk-1",
    sector: "Solda",
    date: addDays(TODAY, -1),
    responsibleTechnician: "Ana Paula Souza",
    items: [
      { description: "EPIs em uso corretamente", answer: "yes" },
      { description: "Extintores acessíveis", answer: "yes" },
      { description: "Área de solda isolada", answer: "yes" },
      { description: "Iluminação adequada", answer: "na" },
    ],
  },
  {
    id: "chk-2",
    sector: "Logística / Pátio",
    date: addDays(TODAY, -2),
    responsibleTechnician: "Ana Paula Souza",
    items: [
      { description: "Empilhadeiras com checklist do dia", answer: "yes" },
      { description: "Piso livre de obstáculos", answer: "no" },
      { description: "Sinalização de solo visível", answer: "yes" },
    ],
  },
  {
    id: "chk-3",
    sector: "Construção / Altura",
    date: addDays(TODAY, -3),
    responsibleTechnician: "Ana Paula Souza",
    items: [
      { description: "Cinto de segurança inspecionado", answer: "yes" },
      { description: "Andaime travado", answer: "yes" },
      { description: "Guarda-corpo instalado", answer: "yes" },
    ],
  },
];

const incidents: Incident[] = [
  {
    id: "inc-1",
    date: addDays(TODAY, -5),
    location: "Pátio de logística",
    employeeId: "emp-3",
    severity: "minor",
    description: "Quase queda ao descer da empilhadeira, piso molhado.",
  },
  {
    id: "inc-2",
    date: addDays(TODAY, -12),
    location: "Setor de solda",
    employeeId: "emp-1",
    severity: "moderate",
    description: "Faísca atingiu luva, sem ferimento por estar dentro da validade.",
  },
  {
    id: "inc-3",
    date: addDays(TODAY, -20),
    location: "Obra Construtora Atlântico",
    employeeId: "emp-5",
    severity: "severe",
    description: "Queda de material de andaime, área isolada a tempo.",
  },
];

const trainings: NrTraining[] = [
  { id: "nr-35", standard: "NR-35", name: "Trabalho em altura", refresherMonths: 24 },
  { id: "nr-33", standard: "NR-33", name: "Espaço confinado", refresherMonths: 12 },
  { id: "nr-10", standard: "NR-10", name: "Segurança em instalações elétricas", refresherMonths: 24 },
  { id: "nr-11", standard: "NR-11", name: "Operação de empilhadeira", refresherMonths: 12 },
  { id: "nr-12", standard: "NR-12", name: "Segurança em máquinas e equipamentos", refresherMonths: 24 },
  { id: "nr-06", standard: "NR-06", name: "Uso correto de EPI", refresherMonths: 12 },
  { id: "nr-34", standard: "NR-34", name: "Trabalho a quente", refresherMonths: 12 },
];

// Cada colaborador faz os treinamentos coerentes com a função. Os offsets
// produzem de propósito uma mistura de vencido / vencendo / em dia.
const MATRIX: { employeeId: string; trainingId: string; offsetDays: number }[] = [
  { employeeId: "emp-1", trainingId: "nr-06", offsetDays: -400 }, // vencido
  { employeeId: "emp-1", trainingId: "nr-12", offsetDays: -300 },
  { employeeId: "emp-1", trainingId: "nr-34", offsetDays: -90 }, // apto a quente
  { employeeId: "emp-2", trainingId: "nr-06", offsetDays: -100 },
  { employeeId: "emp-2", trainingId: "nr-33", offsetDays: -350 }, // vencendo
  { employeeId: "emp-3", trainingId: "nr-11", offsetDays: -380 }, // vencido
  { employeeId: "emp-3", trainingId: "nr-06", offsetDays: -60 },
  { employeeId: "emp-4", trainingId: "nr-10", offsetDays: -200 },
  { employeeId: "emp-4", trainingId: "nr-06", offsetDays: -30 },
  { employeeId: "emp-5", trainingId: "nr-35", offsetDays: -800 }, // vencido: reciclagem é bienal
  { employeeId: "emp-5", trainingId: "nr-06", offsetDays: -340 }, // vencendo
  { employeeId: "emp-6", trainingId: "nr-06", offsetDays: -20 },
  { employeeId: "emp-7", trainingId: "nr-35", offsetDays: -400 },
  { employeeId: "emp-7", trainingId: "nr-06", offsetDays: -10 },
  { employeeId: "emp-8", trainingId: "nr-12", offsetDays: -500 },
  { employeeId: "emp-8", trainingId: "nr-06", offsetDays: -355 }, // vencendo
];

function buildTrainingRecords(): TrainingRecord[] {
  return MATRIX.map((entry, i) => {
    const training = trainings.find((t) => t.id === entry.trainingId)!;
    const completionDate = addDays(TODAY, entry.offsetDays);

    return {
      id: `rec-${i + 1}`,
      employeeId: entry.employeeId,
      trainingId: entry.trainingId,
      completionDate,
      expiryDate: calculateExpiryDate(completionDate, training.refresherMonths),
      instructor: "Ana Paula Souza",
    };
  });
}

/**
 * Conteúdo de REFERÊNCIA, levantado das fontes citadas em
 * docs/plans/2026-07-09-apr-ltr-design.md. Não é procedimento aprovado.
 *
 * Quem responde legalmente pelo conteúdo de uma LTR é o profissional habilitado
 * que a emite. Antes de qualquer uso real, o responsável técnico da empresa
 * precisa revisar e assumir estes itens. Eles vivem no banco exatamente para
 * que ele possa fazê-lo sem tocar no código.
 */
const checklistTemplates: ChecklistTemplate[] = [
  {
    id: "height-mewp",
    name: "Trabalho em altura com plataforma elevatória (PEMT)",
    standard: "NR-35",
    requiredTrainingIds: ["nr-35"],
    requiredPpeIds: ["ppe-harness", "ppe-helmet"],
    items: [
      { id: "hgt-1", type: "verification", description: "Estrutura da PEMT sem trincas, corrosão ou deformação", allowsNA: false },
      { id: "hgt-2", type: "verification", description: "Pneus, rodas e freios inspecionados no início do turno", allowsNA: false },
      { id: "hgt-3", type: "verification", description: "Comandos de subida, descida e movimentação testados", allowsNA: false },
      { id: "hgt-4", type: "verification", description: "Alarmes sonoros e luminosos funcionando", allowsNA: false },
      { id: "hgt-5", type: "verification", description: "Cinto com talabarte conectado ao ponto de ancoragem da cesta", allowsNA: false },
      { id: "hgt-6", type: "verification", description: "Solo nivelado e com capacidade de carga para a PEMT", allowsNA: false },
      { id: "hgt-7", type: "verification", description: "Área abaixo isolada e sinalizada", allowsNA: false },
      { id: "hgt-8", type: "verification", description: "Plano de resgate definido e equipe ciente", allowsNA: false },
      { id: "hgt-9", type: "verification", description: "Linha elétrica energizada nas proximidades foi isolada", allowsNA: true },
      { id: "hgt-10", type: "measurement", description: "Velocidade do vento", unit: " km/h", max: 40 },
      { id: "hgt-11", type: "person", description: "Observador no solo durante a operação", role: "Observador de solo", exclusive: true },
    ],
  },
  {
    id: "hot-work",
    name: "Trabalho a quente (solda, corte, esmerilhamento)",
    standard: "NR-34",
    requiredTrainingIds: ["nr-34"],
    requiredPpeIds: ["ppe-welding-mask", "ppe-glove"],
    items: [
      { id: "hot-1", type: "verification", description: "Materiais inflamáveis e combustíveis removidos da área", allowsNA: false },
      { id: "hot-2", type: "verification", description: "Extintor carregado e posicionado ao alcance do executante", allowsNA: false },
      { id: "hot-3", type: "verification", description: "Biombo ou manta retardante isolando a área", allowsNA: false },
      { id: "hot-4", type: "verification", description: "Aberturas, drenos e frestas vedados contra faísca", allowsNA: true },
      { id: "hot-5", type: "verification", description: "Equipamento de solda e mangueiras inspecionados", allowsNA: false },
      { id: "hot-6", type: "verification", description: "Vigia de fogo permanece 60 minutos após o término", allowsNA: false },
      { id: "hot-7", type: "measurement", description: "Explosividade da atmosfera", unit: "% LIE", max: 0 },
      { id: "hot-8", type: "person", description: "Vigia de fogo, com extintor portátil", role: "Vigia de fogo", exclusive: true },
    ],
  },
  {
    id: "confined-space",
    name: "Entrada em espaço confinado",
    standard: "NR-33",
    requiredTrainingIds: ["nr-33"],
    requiredPpeIds: ["ppe-helmet"],
    items: [
      { id: "cs-1", type: "verification", description: "Espaço isolado, bloqueado e sinalizado", allowsNA: false },
      { id: "cs-2", type: "verification", description: "Energias e fluidos bloqueados e etiquetados", allowsNA: false },
      { id: "cs-3", type: "verification", description: "Ventilação forçada em operação", allowsNA: true },
      { id: "cs-4", type: "verification", description: "Monitoramento contínuo da atmosfera durante a permanência", allowsNA: false },
      { id: "cs-5", type: "verification", description: "Equipamento de resgate montado e testado", allowsNA: false },
      { id: "cs-6", type: "verification", description: "Comunicação entre vigia e trabalhadores testada", allowsNA: false },
      // Faixas do Guia Técnico da NR-33: O₂ entre 19,5% e 23%, alarme de
      // explosividade em 10% do LIE.
      { id: "cs-o2", type: "measurement", description: "Oxigênio", unit: "%", min: 19.5, max: 23 },
      { id: "cs-lel", type: "measurement", description: "Explosividade", unit: "% LIE", max: 10 },
      { id: "cs-h2s", type: "measurement", description: "Sulfeto de hidrogênio", unit: " ppm", max: 8 },
      { id: "cs-co", type: "measurement", description: "Monóxido de carbono", unit: " ppm", max: 25 },
      { id: "cs-watcher", type: "person", description: "Vigia — função exclusiva, não executa a tarefa", role: "Vigia", exclusive: true },
      { id: "cs-supervisor", type: "person", description: "Supervisor de entrada", role: "Supervisor de entrada", exclusive: false },
    ],
  },
  {
    id: "electrical",
    name: "Intervenção em instalação elétrica desenergizada",
    standard: "NR-10",
    requiredTrainingIds: ["nr-10"],
    requiredPpeIds: ["ppe-insulating-glove", "ppe-helmet"],
    items: [
      // As cinco regras de ouro da desenergização, na ordem em que se aplicam.
      { id: "elc-1", type: "verification", description: "Seccionamento: chave aberta de forma visível", allowsNA: false },
      { id: "elc-2", type: "verification", description: "Bloqueio e etiquetagem (LOTO) com cadeado individual", allowsNA: false },
      { id: "elc-3", type: "verification", description: "Ausência de tensão constatada com instrumento adequado", allowsNA: false },
      { id: "elc-4", type: "verification", description: "Aterramento temporário de equipotencialização instalado", allowsNA: true },
      { id: "elc-5", type: "verification", description: "Área sinalizada e isolada", allowsNA: false },
      { id: "elc-6", type: "verification", description: "Instrumento de medição com aferição válida", allowsNA: false },
      { id: "elc-7", type: "measurement", description: "Tensão residual medida no ponto de trabalho", unit: " V", max: 0 },
      { id: "elc-8", type: "person", description: "Profissional habilitado responsável pela desenergização", role: "Responsável pela desenergização", exclusive: false },
    ],
  },
];

const aprs: Apr[] = [
  {
    id: "apr-1",
    task: "Troca de luminárias do galpão de expedição",
    location: "Galpão 2 — Logística Nordeste",
    date: addDays(TODAY, -1),
    author: "Ana Paula Souza",
    status: "approved",
    approvedBy: "Ana Paula Souza",
    approvedAt: addDays(TODAY, -1),
    steps: [
      {
        description: "Posicionar a plataforma elevatória sob a luminária",
        hazard: "Tombamento da plataforma em piso irregular",
        initialRisk: { likelihood: 3, severity: 5 },
        controls: [
          "Verificar nivelamento e capacidade de carga do piso",
          "Isolar a área de circulação de empilhadeiras",
        ],
        residualRisk: { likelihood: 1, severity: 5 },
      },
      {
        description: "Elevar a cesta e substituir a luminária",
        hazard: "Queda de altura",
        initialRisk: { likelihood: 3, severity: 5 },
        controls: [
          "Cinto com talabarte conectado ao ponto de ancoragem da cesta",
          "Observador no solo durante toda a operação",
        ],
        residualRisk: { likelihood: 1, severity: 4 },
      },
      {
        description: "Descartar a luminária antiga",
        hazard: "Corte por vidro quebrado",
        initialRisk: { likelihood: 3, severity: 2 },
        controls: ["Luva de proteção", "Caixa rígida para o descarte"],
        residualRisk: { likelihood: 1, severity: 2 },
      },
    ],
  },
  {
    id: "apr-2",
    task: "Solda de reparo em estrutura do mezanino",
    location: "Setor de solda — Metalúrgica Recife",
    date: TODAY,
    author: "Ana Paula Souza",
    status: "draft",
    steps: [
      {
        description: "Preparar a área e remover materiais combustíveis",
        hazard: "Ignição de material combustível por faísca",
        initialRisk: { likelihood: 4, severity: 4 },
        controls: [
          "Remover combustíveis num raio de 11 metros",
          "Biombo retardante em volta do posto de solda",
          "Vigia de fogo com extintor durante e 60 minutos após",
        ],
        residualRisk: { likelihood: 1, severity: 4 },
      },
      {
        description: "Executar a solda",
        hazard: "Radiação do arco e projeção de partículas",
        initialRisk: { likelihood: 5, severity: 3 },
        controls: ["Máscara de solda com filtro adequado", "Luva e mangote"],
        residualRisk: { likelihood: 2, severity: 2 },
      },
    ],
  },
];

/**
 * A LTR de exemplo carrega o snapshot da APR e do modelo como estavam na
 * emissão. Aqui isso é uma cópia do array acima; em produção, a cópia é feita
 * no POST e nunca mais tocada.
 */
function buildLtrs(): Ltr[] {
  const apr = aprs[0];
  const template = checklistTemplates[0];
  const issuedAt = `${TODAY}T07:12:00.000Z`;

  return [
    {
      id: "ltr-1",
      aprId: apr.id,
      templateId: template.id,
      location: apr.location,
      workDescription: "Substituição de 6 luminárias no vão central",
      issuedAt,
      validUntil: `${addDays(TODAY, 2)}T17:00:00.000Z`,
      requester: "Beatriz Costa",
      issuer: { name: "Sgt. Ricardo Nunes", date: issuedAt },
      workerIds: ["emp-7"],
      answers: [
        { itemId: "hgt-1", type: "verification", answer: "yes" },
        { itemId: "hgt-2", type: "verification", answer: "yes" },
        { itemId: "hgt-3", type: "verification", answer: "yes" },
        { itemId: "hgt-4", type: "verification", answer: "yes" },
        { itemId: "hgt-5", type: "verification", answer: "yes" },
        { itemId: "hgt-6", type: "verification", answer: "yes" },
        { itemId: "hgt-7", type: "verification", answer: "yes" },
        { itemId: "hgt-8", type: "verification", answer: "yes" },
        { itemId: "hgt-9", type: "verification", answer: "na" },
        { itemId: "hgt-10", type: "measurement", value: 8 },
        { itemId: "hgt-11", type: "person", name: "Beatriz Costa" },
      ],
      aprSnapshot: structuredClone(apr),
      templateSnapshot: structuredClone(template),
      qrCodeValue: "ltr-1",
    },
  ];
}

async function main() {
  const db: DB = {
    employees,
    ppeTypes,
    deliveries: buildDeliveries(),
    checklists,
    incidents,
    trainings,
    trainingRecords: buildTrainingRecords(),
    checklistTemplates,
    aprs,
    ltrs: buildLtrs(),
  };

  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, "db.json"), JSON.stringify(db, null, 2), "utf-8");

  console.log(
    `Seed gerado: ${db.deliveries.length} entregas, ${db.checklists.length} checklists, ` +
      `${db.incidents.length} incidentes, ${db.trainingRecords.length} treinamentos realizados, ` +
      `${db.checklistTemplates.length} modelos de checklist, ${db.aprs.length} APRs, ${db.ltrs.length} LTRs.`
  );
}

main();
