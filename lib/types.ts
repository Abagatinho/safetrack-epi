export type ExpiryStatus = "ok" | "expiringSoon" | "expired";

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  clientCompany: string;
  photo?: string;
}

export interface PpeType {
  id: string;
  name: string;
  validityMonths: number;
}

export interface PpeDelivery {
  id: string;
  employeeId: string;
  ppeTypeId: string;
  deliveryDate: string; // ISO date
  expiryDate: string; // ISO date, calculado
  returnDate?: string; // ISO date, se devolvido
  signatureName: string;
  signatureDate: string;
  signatureImage?: string; // data URI PNG do traço desenhado
  qrCodeValue: string;
}

export interface DailyChecklistItem {
  description: string;
  answer: "yes" | "no" | "na";
}

export interface DailyChecklist {
  id: string;
  sector: string;
  date: string;
  responsibleTechnician: string;
  items: DailyChecklistItem[];
}

export type IncidentSeverity = "minor" | "moderate" | "severe";

export interface Incident {
  id: string;
  date: string;
  location: string;
  employeeId?: string;
  severity: IncidentSeverity;
  description: string;
  photoUrl?: string;
}

/**
 * Treinamento obrigatório de Norma Regulamentadora.
 *
 * `refresherMonths` é a periodicidade de reciclagem adotada pela empresa.
 * Algumas NRs fixam o intervalo (NR-35 é bienal, NR-33 é anual); outras não
 * definem, e a periodicidade vem da política interna. Por isso é um dado do
 * cadastro, não uma constante do código.
 */
export interface NrTraining {
  id: string;
  standard: string; // "NR-35"
  name: string; // "Trabalho em altura"
  refresherMonths: number;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingId: string;
  completionDate: string; // ISO date
  expiryDate: string; // ISO date, calculado
  instructor: string;
}

/**
 * Item de um modelo de checklist de LTR.
 *
 * O tipo do item define como o sistema o avalia. `verification` depende do
 * julgamento de quem preenche; `measurement` é aritmética — o sistema reprova
 * uma atmosfera com 18% de oxigênio sem consultar ninguém; `person` designa
 * alguém para um papel que a norma exige que exista (vigia de fogo, vigia de
 * espaço confinado).
 */
export type ChecklistTemplateItem =
  | { id: string; type: "verification"; description: string; allowsNA: boolean }
  | {
      id: string;
      type: "measurement";
      description: string;
      unit: string;
      min?: number;
      max?: number;
    }
  | {
      id: string;
      type: "person";
      description: string;
      role: string;
      /** O designado não pode estar entre os executantes. Vale para o vigia. */
      exclusive: boolean;
    };

/**
 * Modelo de checklist por tipo de trabalho de risco.
 *
 * Vive no banco, não no código: quem responde legalmente pelo conteúdo é o
 * profissional habilitado que emite a LTR, e ele precisa poder revisá-lo.
 */
export interface ChecklistTemplate {
  id: string;
  name: string;
  standard: string; // "NR-35"
  /** Ids de NrTraining que todo executante precisa ter válidos. */
  requiredTrainingIds: string[];
  /** Ids de PpeType que todo executante precisa ter recebido e vigentes. */
  requiredPpeIds: string[];
  items: ChecklistTemplateItem[];
}

export type RiskClass = "trivial" | "tolerable" | "moderate" | "substantial" | "intolerable";

/** Probabilidade e severidade em escala de 1 a 5; o grau é o produto. */
export interface Risk {
  likelihood: number;
  severity: number;
}

export interface AprStep {
  description: string;
  hazard: string;
  initialRisk: Risk;
  controls: string[];
  /** O ARR: o risco que sobra depois das medidas de controle. */
  residualRisk: Risk;
}

export type AprStatus = "draft" | "approved";

export interface Apr {
  id: string;
  task: string;
  location: string;
  date: string; // ISO date
  author: string;
  status: AprStatus;
  approvedBy?: string;
  approvedAt?: string; // ISO date
  steps: AprStep[];
}

export type VerificationAnswer = "yes" | "no" | "na";

export type ChecklistAnswer =
  | { itemId: string; type: "verification"; answer: VerificationAnswer }
  | { itemId: string; type: "measurement"; value: number }
  | { itemId: string; type: "person"; name: string };

export interface Signature {
  name: string;
  date: string; // ISO datetime
  image?: string; // data URI PNG
}

/**
 * Uma LTR emitida é imutável. Ela guarda cópias da APR e do modelo de checklist
 * como estavam no ato da emissão — editar o modelo amanhã não pode alterar o
 * que este documento prova ter sido conferido hoje.
 */
export interface Ltr {
  id: string;
  aprId: string;
  templateId: string;
  location: string;
  workDescription: string;
  issuedAt: string; // ISO datetime
  validUntil: string; // ISO datetime
  requester: string;
  issuer: Signature;
  workerIds: string[];
  answers: ChecklistAnswer[];
  aprSnapshot: Apr;
  templateSnapshot: ChecklistTemplate;
  qrCodeValue: string;
  closure?: Signature;
  cancellation?: { reason: string; by: string; at: string };
}

export interface DB {
  employees: Employee[];
  ppeTypes: PpeType[];
  deliveries: PpeDelivery[];
  checklists: DailyChecklist[];
  incidents: Incident[];
  trainings: NrTraining[];
  trainingRecords: TrainingRecord[];
  checklistTemplates: ChecklistTemplate[];
  aprs: Apr[];
  ltrs: Ltr[];
}
