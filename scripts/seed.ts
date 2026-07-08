import { promises as fs } from "fs";
import path from "path";
import type { DB, Colaborador, TipoEPI, EntregaEPI, ChecklistDiario, Incidente } from "../lib/types";
import { calcularDataValidade } from "../lib/status";

const HOJE = "2026-07-08";

function addDias(iso: string, dias: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const colaboradores: Colaborador[] = [
  { id: "col-1", nome: "Marcos Silva", funcao: "Soldador", empresaCliente: "Metalúrgica Recife" },
  { id: "col-2", nome: "Ana Paula Souza", funcao: "Técnica de Segurança", empresaCliente: "Metalúrgica Recife" },
  { id: "col-3", nome: "João Pedro Lima", funcao: "Operador de Empilhadeira", empresaCliente: "Logística Nordeste" },
  { id: "col-4", nome: "Carla Mendes", funcao: "Eletricista", empresaCliente: "Metalúrgica Recife" },
  { id: "col-5", nome: "Rafael Torres", funcao: "Pedreiro", empresaCliente: "Construtora Atlântico" },
  { id: "col-6", nome: "Beatriz Costa", funcao: "Auxiliar de Produção", empresaCliente: "Logística Nordeste" },
  { id: "col-7", nome: "Diego Fernandes", funcao: "Montador", empresaCliente: "Construtora Atlântico" },
  { id: "col-8", nome: "Larissa Alves", funcao: "Operadora de Máquina", empresaCliente: "Metalúrgica Recife" },
];

const tiposEpi: TipoEPI[] = [
  { id: "epi-capacete", nome: "Capacete de segurança", validadeMeses: 24 },
  { id: "epi-luva", nome: "Luva de proteção", validadeMeses: 6 },
  { id: "epi-oculos", nome: "Óculos de proteção", validadeMeses: 12 },
  { id: "epi-bota", nome: "Bota de segurança", validadeMeses: 12 },
  { id: "epi-protetor-auricular", nome: "Protetor auricular", validadeMeses: 6 },
  { id: "epi-cinto", nome: "Cinto de segurança (trabalho em altura)", validadeMeses: 12 },
];

function gerarEntregas(): EntregaEPI[] {
  // combinações colaborador x tipo, com data de entrega variando pra
  // produzir mistura de status ok / vencendo30d / vencido
  const offsets = [-400, -370, -200, -20, -10, 0, 10, 40, 100, 200, 300, 350];
  const entregas: EntregaEPI[] = [];
  let i = 0;

  for (const col of colaboradores) {
    for (const epi of [tiposEpi[i % tiposEpi.length], tiposEpi[(i + 2) % tiposEpi.length]]) {
      const offset = offsets[i % offsets.length];
      const dataEntrega = addDias(HOJE, offset - epi.validadeMeses * 30 + 30); // aproxima cenários variados
      const dataValidade = calcularDataValidade(dataEntrega, epi.validadeMeses);

      entregas.push({
        id: `ent-${i + 1}`,
        colaboradorId: col.id,
        tipoEpiId: epi.id,
        dataEntrega,
        dataValidade,
        assinaturaNome: col.nome,
        assinaturaData: dataEntrega,
        qrCodeValor: `ent-${i + 1}`,
      });
      i++;
    }
  }
  return entregas;
}

const checklists: ChecklistDiario[] = [
  {
    id: "chk-1",
    setor: "Solda",
    data: addDias(HOJE, -1),
    tecnicoResponsavel: "Ana Paula Souza",
    itens: [
      { descricao: "EPIs em uso corretamente", resposta: "sim" },
      { descricao: "Extintores acessíveis", resposta: "sim" },
      { descricao: "Área de solda isolada", resposta: "sim" },
      { descricao: "Iluminação adequada", resposta: "na" },
    ],
  },
  {
    id: "chk-2",
    setor: "Logística / Pátio",
    data: addDias(HOJE, -2),
    tecnicoResponsavel: "Ana Paula Souza",
    itens: [
      { descricao: "Empilhadeiras com checklist do dia", resposta: "sim" },
      { descricao: "Piso livre de obstáculos", resposta: "nao" },
      { descricao: "Sinalização de solo visível", resposta: "sim" },
    ],
  },
  {
    id: "chk-3",
    setor: "Construção / Altura",
    data: addDias(HOJE, -3),
    tecnicoResponsavel: "Ana Paula Souza",
    itens: [
      { descricao: "Cinto de segurança inspecionado", resposta: "sim" },
      { descricao: "Andaime travado", resposta: "sim" },
      { descricao: "Guarda-corpo instalado", resposta: "sim" },
    ],
  },
];

const incidentes: Incidente[] = [
  {
    id: "inc-1",
    data: addDias(HOJE, -5),
    local: "Pátio de logística",
    colaboradorId: "col-3",
    gravidade: "leve",
    descricao: "Quase queda ao descer da empilhadeira, piso molhado.",
  },
  {
    id: "inc-2",
    data: addDias(HOJE, -12),
    local: "Setor de solda",
    colaboradorId: "col-1",
    gravidade: "moderado",
    descricao: "Faísca atingiu luva, sem ferimento por estar dentro da validade.",
  },
  {
    id: "inc-3",
    data: addDias(HOJE, -20),
    local: "Obra Construtora Atlântico",
    colaboradorId: "col-5",
    gravidade: "grave",
    descricao: "Queda de material de andaime, área isolada a tempo.",
  },
];

async function main() {
  const db: DB = {
    colaboradores,
    tiposEpi,
    entregas: gerarEntregas(),
    checklists,
    incidentes,
  };

  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "db.json"),
    JSON.stringify(db, null, 2),
    "utf-8"
  );
  console.log(`Seed gerado: ${db.entregas.length} entregas, ${db.checklists.length} checklists, ${db.incidentes.length} incidentes.`);
}

main();
