export type StatusEntrega = "ok" | "vencendo30d" | "vencido";

export interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  empresaCliente: string;
  foto?: string;
}

export interface TipoEPI {
  id: string;
  nome: string;
  validadeMeses: number;
}

export interface EntregaEPI {
  id: string;
  colaboradorId: string;
  tipoEpiId: string;
  dataEntrega: string; // ISO date
  dataValidade: string; // ISO date, calculado
  dataDevolucao?: string; // ISO date, se devolvido
  assinaturaNome: string;
  assinaturaData: string;
  qrCodeValor: string;
}

export interface ChecklistItem {
  descricao: string;
  resposta: "sim" | "nao" | "na";
}

export interface ChecklistDiario {
  id: string;
  setor: string;
  data: string;
  tecnicoResponsavel: string;
  itens: ChecklistItem[];
}

export type GravidadeIncidente = "leve" | "moderado" | "grave";

export interface Incidente {
  id: string;
  data: string;
  local: string;
  colaboradorId?: string;
  gravidade: GravidadeIncidente;
  descricao: string;
  fotoUrl?: string;
}

export interface DB {
  colaboradores: Colaborador[];
  tiposEpi: TipoEPI[];
  entregas: EntregaEPI[];
  checklists: ChecklistDiario[];
  incidentes: Incidente[];
}
