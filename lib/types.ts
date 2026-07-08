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
  assinaturaImagem?: string; // data URI PNG do traço desenhado
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

/**
 * Treinamento obrigatório de Norma Regulamentadora.
 *
 * `reciclagemMeses` é a periodicidade de reciclagem adotada pela empresa.
 * Algumas NRs fixam o intervalo (NR-35 é bienal, NR-33 é anual); outras não
 * definem, e a periodicidade vem da política interna. Por isso é um dado do
 * cadastro, não uma constante do código.
 */
export interface TreinamentoNR {
  id: string;
  norma: string; // "NR-35"
  nome: string; // "Trabalho em altura"
  reciclagemMeses: number;
}

export interface TreinamentoRealizado {
  id: string;
  colaboradorId: string;
  treinamentoId: string;
  dataRealizacao: string; // ISO date
  dataValidade: string; // ISO date, calculado
  instrutor: string;
}

export interface DB {
  colaboradores: Colaborador[];
  tiposEpi: TipoEPI[];
  entregas: EntregaEPI[];
  checklists: ChecklistDiario[];
  incidentes: Incidente[];
  treinamentos: TreinamentoNR[];
  treinamentosRealizados: TreinamentoRealizado[];
}
