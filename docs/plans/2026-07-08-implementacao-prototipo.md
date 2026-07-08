# SafeTrack EPI — Protótipo Comercial Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir protótipo web funcional (sem back-end persistente real) do SafeTrack EPI — controle de EPI + relatórios/inspeção de segurança — pra usar como demo comercial com empresas terceirizadas de EPI.

**Architecture:** Next.js App Router com API routes simulando REST (contrato igual a uma API real futura), armazenamento em arquivo JSON local (`data/db.json`), sem autenticação funcional. Ver design completo em `docs/plans/2026-07-08-prototipo-comercial-design.md`.

**Tech Stack:** Next.js 14+ (App Router, TypeScript), Tailwind CSS, Vitest (testes de lógica pura), deploy Vercel.

**Escopo de testes (decisão deliberada):** este é um protótipo de validação comercial, não produto de produção. TDD completo com testes de UI é overkill pro objetivo (velocidade + gancho de demo). Testes automatizados ficam restritos à lógica de negócio pura que pode ter bug silencioso (cálculo de status de validade em `lib/status.ts`). Páginas e componentes visuais são verificados manualmente (`npm run dev` + inspeção visual), não por teste automatizado. Se o protótipo evoluir pra MVP real, TDD completo entra em cena (@superpowers:test-driven-development).

---

## Task 1: Scaffold do projeto

**Files:**
- Create: projeto Next.js completo em `/Users/jdsc2/projects/safetrack-epi/`

**Step 1: Criar projeto Next.js**

Rodar (na pasta `/Users/jdsc2/projects/safetrack-epi`, que já tem `.git` e `docs/`):

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
```

Quando perguntar sobre sobrescrever arquivos existentes (`docs/` já existe), confirmar que mantém — o scaffold só mexe em arquivos de app Next, não em `docs/`.

**Step 2: Instalar Vitest**

```bash
npm install -D vitest
```

**Step 3: Adicionar script de teste no `package.json`**

Adicionar em `"scripts"`:

```json
"test": "vitest run"
```

**Step 4: Verificar que o projeto roda**

Run: `npm run dev`
Expected: servidor sobe em `http://localhost:3000`, página default do Next carrega sem erro. Depois `Ctrl+C` pra parar.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js project with TypeScript, Tailwind, Vitest"
```

---

## Task 2: Tipos e função de cálculo de status

**Files:**
- Create: `lib/types.ts`
- Create: `lib/status.ts`
- Test: `lib/status.test.ts`

**Step 1: Escrever os tipos**

`lib/types.ts`:

```typescript
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
```

**Step 2: Escrever teste falho do cálculo de status**

`lib/status.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calcularStatus } from "./status";

describe("calcularStatus", () => {
  it("retorna 'ok' quando validade está a mais de 30 dias", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-12-01";
    expect(calcularStatus(dataValidade, hoje)).toBe("ok");
  });

  it("retorna 'vencendo30d' quando validade está dentro de 30 dias", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-07-20";
    expect(calcularStatus(dataValidade, hoje)).toBe("vencendo30d");
  });

  it("retorna 'vencido' quando validade já passou", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-06-01";
    expect(calcularStatus(dataValidade, hoje)).toBe("vencido");
  });

  it("considera devolvido como 'ok' independente da validade", () => {
    const hoje = new Date("2026-07-08");
    const dataValidade = "2026-01-01";
    const dataDevolucao = "2026-06-01";
    expect(calcularStatus(dataValidade, hoje, dataDevolucao)).toBe("ok");
  });
});
```

**Step 2b: Rodar teste, confirmar que falha**

Run: `npm run test`
Expected: FAIL — `lib/status.ts` não existe ainda (`Cannot find module './status'`).

**Step 3: Implementar `lib/status.ts`**

```typescript
import type { StatusEntrega } from "./types";

const DIAS_ALERTA = 30;

export function calcularStatus(
  dataValidade: string,
  hoje: Date,
  dataDevolucao?: string
): StatusEntrega {
  if (dataDevolucao) return "ok";

  const validade = new Date(dataValidade);
  const diffMs = validade.getTime() - hoje.getTime();
  const diffDias = diffMs / (1000 * 60 * 60 * 24);

  if (diffDias < 0) return "vencido";
  if (diffDias <= DIAS_ALERTA) return "vencendo30d";
  return "ok";
}

export function calcularDataValidade(
  dataEntrega: string,
  validadeMeses: number
): string {
  const data = new Date(dataEntrega);
  data.setMonth(data.getMonth() + validadeMeses);
  return data.toISOString().slice(0, 10);
}
```

**Step 4: Rodar teste, confirmar que passa**

Run: `npm run test`
Expected: PASS — 4 testes verdes.

**Step 5: Commit**

```bash
git add lib/types.ts lib/status.ts lib/status.test.ts
git commit -m "feat: add domain types and status calculation logic"
```

---

## Task 3: Camada de dados (leitura/escrita do JSON) e seed inicial

**Files:**
- Create: `lib/db.ts`
- Create: `scripts/seed.ts`
- Create (gerado pelo seed): `data/db.json`

**Step 1: Implementar `lib/db.ts`**

```typescript
import { promises as fs } from "fs";
import path from "path";
import type { DB } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function readDB(): Promise<DB> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
}

export async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}
```

**Step 2: Escrever script de seed**

`scripts/seed.ts` — gera dado determinístico (sem `Math.random()`), com entregas propositalmente vencidas/vencendo pra demo:

```typescript
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
```

**Step 3: Adicionar script de seed no `package.json`**

```json
"seed": "tsx scripts/seed.ts"
```

Instalar `tsx` pra rodar TypeScript direto:

```bash
npm install -D tsx
```

**Step 4: Rodar seed e verificar arquivo gerado**

Run: `npm run seed`
Expected: mensagem `Seed gerado: 16 entregas, 3 checklists, 3 incidentes.` e arquivo `data/db.json` criado.

Conferir manualmente: `cat data/db.json | head -30` mostra JSON válido com `colaboradores` populado.

**Step 5: Commit**

```bash
git add lib/db.ts scripts/seed.ts data/db.json package.json package-lock.json
git commit -m "feat: add JSON data layer and deterministic seed script"
```

---

## Task 4: API route — Colaboradores

**Files:**
- Create: `app/api/colaboradores/route.ts`

**Step 1: Implementar GET e POST**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Colaborador } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.colaboradores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: Colaborador = {
    id: `col-${Date.now()}`,
    nome: body.nome,
    funcao: body.funcao,
    empresaCliente: body.empresaCliente,
    foto: body.foto,
  };

  db.colaboradores.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
```

**Step 2: Testar manualmente**

Run: `npm run dev` (em outro terminal, com servidor no ar):

```bash
curl http://localhost:3000/api/colaboradores
```

Expected: array JSON com os 8 colaboradores do seed.

```bash
curl -X POST http://localhost:3000/api/colaboradores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste Silva","funcao":"Ajudante","empresaCliente":"Metalúrgica Recife"}'
```

Expected: JSON do novo colaborador com `id` gerado, status 201.

**Step 3: Commit**

```bash
git add app/api/colaboradores/route.ts
git commit -m "feat: add colaboradores API route"
```

---

## Task 5: API route — Tipos de EPI

**Files:**
- Create: `app/api/tipos-epi/route.ts`

**Step 1: Implementar GET**

```typescript
import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.tiposEpi);
}
```

**Step 2: Testar manualmente**

Run: `curl http://localhost:3000/api/tipos-epi`
Expected: array com os 6 tipos de EPI do seed.

**Step 3: Commit**

```bash
git add app/api/tipos-epi/route.ts
git commit -m "feat: add tipos-epi API route"
```

---

## Task 6: API routes — Entregas (criação, listagem com status, devolução)

**Files:**
- Create: `app/api/entregas/route.ts`
- Create: `app/api/entregas/[id]/devolucao/route.ts`

**Step 1: Implementar `app/api/entregas/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { calcularStatus, calcularDataValidade } from "@/lib/status";
import type { EntregaEPI, StatusEntrega } from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = await readDB();
  const statusFiltro = req.nextUrl.searchParams.get("status") as StatusEntrega | null;
  const hoje = new Date();

  const entregasComStatus = db.entregas.map((e) => ({
    ...e,
    status: calcularStatus(e.dataValidade, hoje, e.dataDevolucao),
  }));

  const resultado = statusFiltro
    ? entregasComStatus.filter((e) => e.status === statusFiltro)
    : entregasComStatus;

  return NextResponse.json(resultado);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const tipoEpi = db.tiposEpi.find((t) => t.id === body.tipoEpiId);
  if (!tipoEpi) {
    return NextResponse.json({ error: "tipoEpiId inválido" }, { status: 400 });
  }

  const dataEntrega = body.dataEntrega ?? new Date().toISOString().slice(0, 10);
  const novaEntrega: EntregaEPI = {
    id: `ent-${Date.now()}`,
    colaboradorId: body.colaboradorId,
    tipoEpiId: body.tipoEpiId,
    dataEntrega,
    dataValidade: calcularDataValidade(dataEntrega, tipoEpi.validadeMeses),
    assinaturaNome: body.assinaturaNome,
    assinaturaData: dataEntrega,
    qrCodeValor: `ent-${Date.now()}`,
  };

  db.entregas.push(novaEntrega);
  await writeDB(db);

  return NextResponse.json(novaEntrega, { status: 201 });
}
```

**Step 2: Implementar devolução**

`app/api/entregas/[id]/devolucao/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await readDB();
  const entrega = db.entregas.find((e) => e.id === params.id);

  if (!entrega) {
    return NextResponse.json({ error: "Entrega não encontrada" }, { status: 404 });
  }

  entrega.dataDevolucao = new Date().toISOString().slice(0, 10);
  await writeDB(db);

  return NextResponse.json(entrega);
}
```

**Step 3: Testar manualmente**

```bash
curl "http://localhost:3000/api/entregas?status=vencido"
```

Expected: só entregas com status vencido (do seed, alguns `offsets` negativos grandes garantem isso).

```bash
curl -X POST http://localhost:3000/api/entregas/ent-1/devolucao
```

Expected: JSON da entrega `ent-1` com `dataDevolucao` preenchida.

**Step 4: Commit**

```bash
git add app/api/entregas
git commit -m "feat: add entregas API routes with status calculation and devolucao"
```

---

## Task 7: API route — Checklists

**Files:**
- Create: `app/api/checklists/route.ts`

**Step 1: Implementar GET e POST**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { ChecklistDiario } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.checklists);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: ChecklistDiario = {
    id: `chk-${Date.now()}`,
    setor: body.setor,
    data: body.data ?? new Date().toISOString().slice(0, 10),
    tecnicoResponsavel: body.tecnicoResponsavel,
    itens: body.itens,
  };

  db.checklists.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
```

**Step 2: Testar manualmente**

Run: `curl http://localhost:3000/api/checklists`
Expected: array com os 3 checklists do seed.

**Step 3: Commit**

```bash
git add app/api/checklists/route.ts
git commit -m "feat: add checklists API route"
```

---

## Task 8: API route — Incidentes

**Files:**
- Create: `app/api/incidentes/route.ts`

**Step 1: Implementar GET e POST**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Incidente } from "@/lib/types";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.incidentes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await readDB();

  const novo: Incidente = {
    id: `inc-${Date.now()}`,
    data: body.data ?? new Date().toISOString().slice(0, 10),
    local: body.local,
    colaboradorId: body.colaboradorId,
    gravidade: body.gravidade,
    descricao: body.descricao,
    fotoUrl: body.fotoUrl,
  };

  db.incidentes.push(novo);
  await writeDB(db);

  return NextResponse.json(novo, { status: 201 });
}
```

**Step 2: Testar manualmente**

Run: `curl http://localhost:3000/api/incidentes`
Expected: array com os 3 incidentes do seed.

**Step 3: Commit**

```bash
git add app/api/incidentes/route.ts
git commit -m "feat: add incidentes API route"
```

---

## Task 9: API route — Dashboard resumo

**Files:**
- Create: `app/api/dashboard/resumo/route.ts`

**Step 1: Implementar GET agregando indicadores**

```typescript
import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { calcularStatus } from "@/lib/status";

export async function GET() {
  const db = await readDB();
  const hoje = new Date();

  const entregasComStatus = db.entregas.map((e) => ({
    ...e,
    status: calcularStatus(e.dataValidade, hoje, e.dataDevolucao),
  }));

  const vencendo = entregasComStatus.filter((e) => e.status === "vencendo30d").length;
  const vencidos = entregasComStatus.filter((e) => e.status === "vencido").length;

  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  const incidentesUltimos30d = db.incidentes.filter(
    (i) => new Date(i.data) >= trintaDiasAtras
  );

  const ultimoIncidente = [...db.incidentes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )[0];
  const diasSemAcidente = ultimoIncidente
    ? Math.floor((hoje.getTime() - new Date(ultimoIncidente.data).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return NextResponse.json({
    totalColaboradores: db.colaboradores.length,
    epiVencendo: vencendo,
    epiVencido: vencidos,
    checklistsRegistrados: db.checklists.length,
    incidentesUltimos30d: incidentesUltimos30d.length,
    diasSemAcidente,
  });
}
```

**Step 2: Testar manualmente**

Run: `curl http://localhost:3000/api/dashboard/resumo`
Expected: JSON com os 6 campos preenchidos com números plausíveis.

**Step 3: Commit**

```bash
git add app/api/dashboard/resumo/route.ts
git commit -m "feat: add dashboard summary API route"
```

---

## Task 10: Componentes UI base

**Files:**
- Create: `components/ui/StatusBadge.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Table.tsx`

**Step 1: `StatusBadge`**

```tsx
import type { StatusEntrega } from "@/lib/types";

const CONFIG: Record<StatusEntrega, { label: string; className: string }> = {
  ok: { label: "Em dia", className: "bg-green-100 text-green-800" },
  vencendo30d: { label: "Vencendo", className: "bg-yellow-100 text-yellow-800" },
  vencido: { label: "Vencido", className: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: StatusEntrega }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
```

**Step 2: `Card`**

```tsx
export function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
```

**Step 3: `Table`**

```tsx
export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500">
          {headers.map((h) => (
            <th key={h} className="py-2 pr-4 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
```

**Step 4: Verificar visualmente**

Sem teste automatizado (decisão de escopo do topo do plano) — validação acontece quando as páginas que os consomem (Tasks 12+) forem renderizadas no navegador.

**Step 5: Commit**

```bash
git add components/ui
git commit -m "feat: add base UI components (StatusBadge, Card, Table)"
```

---

## Task 11: Layout `(auth)` com navegação lateral

**Files:**
- Create: `app/(auth)/layout.tsx`

**Step 1: Implementar layout com nav**

```tsx
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/epi/entrega", label: "Entrega de EPI" },
  { href: "/checklist", label: "Checklist" },
  { href: "/incidentes", label: "Incidentes" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 p-4">
        <p className="font-semibold mb-6">SafeTrack EPI</p>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded px-2 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add "app/(auth)/layout.tsx"
git commit -m "feat: add auth route group layout with sidebar nav"
```

---

## Task 12: Página Dashboard

**Files:**
- Create: `app/(auth)/dashboard/page.tsx`

**Step 1: Implementar página (Server Component, fetch direto na API)**

```tsx
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
```

> Nota: em produção (Vercel) o `fetch` pra URL absoluta `localhost` não funciona. Isso é aceitável nesta fase (protótipo local pra demo ao vivo). Se for rodar em produção antes do MVP real, trocar por `process.env.NEXT_PUBLIC_BASE_URL` ou usar fetch relativo com `headers()`/`cookies()` do Next — fora de escopo deste plano.

**Step 2: Verificar visualmente**

Run: `npm run dev`, abrir `http://localhost:3000/dashboard`.
Expected: 6 cards com números do seed, sem erro no console.

**Step 3: Commit**

```bash
git add "app/(auth)/dashboard/page.tsx"
git commit -m "feat: add dashboard page"
```

---

## Task 13: Página Colaboradores (lista + cadastro)

**Files:**
- Create: `app/(auth)/colaboradores/page.tsx`
- Create: `app/(auth)/colaboradores/NovoColaboradorForm.tsx` (Client Component)

**Step 1: Form de cadastro (Client Component)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovoColaboradorForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [empresaCliente, setEmpresaCliente] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/colaboradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, funcao, empresaCliente }),
    });
    setNome("");
    setFuncao("");
    setEmpresaCliente("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <input
        placeholder="Função"
        value={funcao}
        onChange={(e) => setFuncao(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <input
        placeholder="Empresa cliente"
        value={empresaCliente}
        onChange={(e) => setEmpresaCliente(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        required
      />
      <button type="submit" className="bg-black text-white rounded px-3 py-1 text-sm">
        Cadastrar
      </button>
    </form>
  );
}
```

**Step 2: Página de listagem (Server Component)**

```tsx
import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { NovoColaboradorForm } from "./NovoColaboradorForm";
import type { Colaborador } from "@/lib/types";

async function getColaboradores(): Promise<Colaborador[]> {
  const res = await fetch("http://localhost:3000/api/colaboradores", {
    cache: "no-store",
  });
  return res.json();
}

export default async function ColaboradoresPage() {
  const colaboradores = await getColaboradores();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Colaboradores</h1>
      <NovoColaboradorForm />
      <Table headers={["Nome", "Função", "Empresa cliente", ""]}>
        {colaboradores.map((c) => (
          <tr key={c.id} className="border-b border-gray-100">
            <td className="py-2 pr-4">{c.nome}</td>
            <td className="py-2 pr-4">{c.funcao}</td>
            <td className="py-2 pr-4">{c.empresaCliente}</td>
            <td className="py-2 pr-4">
              <Link href={`/colaboradores/${c.id}`} className="text-blue-600 text-sm">
                Ver histórico
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
```

**Step 3: Verificar visualmente**

Abrir `http://localhost:3000/colaboradores`, cadastrar um colaborador novo, confirmar que aparece na lista sem reload manual (via `router.refresh()`).

**Step 4: Commit**

```bash
git add "app/(auth)/colaboradores"
git commit -m "feat: add colaboradores list and cadastro page"
```

---

## Task 14: Página Colaborador — detalhe/histórico

**Files:**
- Create: `app/(auth)/colaboradores/[id]/page.tsx`

**Step 1: Implementar página**

```tsx
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table } from "@/components/ui/Table";
import type { Colaborador, EntregaEPI, TipoEPI, StatusEntrega } from "@/lib/types";

async function getDados(id: string) {
  const [colaboradores, entregas, tiposEpi]: [Colaborador[], (EntregaEPI & { status: StatusEntrega })[], TipoEPI[]] =
    await Promise.all([
      fetch("http://localhost:3000/api/colaboradores", { cache: "no-store" }).then((r) => r.json()),
      fetch("http://localhost:3000/api/entregas", { cache: "no-store" }).then((r) => r.json()),
      fetch("http://localhost:3000/api/tipos-epi", { cache: "no-store" }).then((r) => r.json()),
    ]);

  const colaborador = colaboradores.find((c) => c.id === id);
  const entregasDoColaborador = entregas.filter((e) => e.colaboradorId === id);

  return { colaborador, entregasDoColaborador, tiposEpi };
}

export default async function ColaboradorDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const { colaborador, entregasDoColaborador, tiposEpi } = await getDados(params.id);

  if (!colaborador) return <p>Colaborador não encontrado.</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">{colaborador.nome}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {colaborador.funcao} — {colaborador.empresaCliente}
      </p>
      <Table headers={["EPI", "Entrega", "Validade", "Status"]}>
        {entregasDoColaborador.map((e) => {
          const tipo = tiposEpi.find((t) => t.id === e.tipoEpiId);
          return (
            <tr key={e.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{tipo?.nome}</td>
              <td className="py-2 pr-4">{e.dataEntrega}</td>
              <td className="py-2 pr-4">{e.dataValidade}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={e.status} />
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
```

**Step 2: Verificar visualmente**

Abrir `http://localhost:3000/colaboradores/col-1`, confirmar histórico de entregas com badges coloridos corretos.

**Step 3: Commit**

```bash
git add "app/(auth)/colaboradores/[id]"
git commit -m "feat: add colaborador detail page with EPI history"
```

---

## Task 15: Página Entrega de EPI (form)

**Files:**
- Create: `app/(auth)/epi/entrega/page.tsx`
- Create: `app/(auth)/epi/entrega/EntregaForm.tsx` (Client Component)

**Step 1: Form (Client Component)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Colaborador, TipoEPI } from "@/lib/types";

export function EntregaForm({
  colaboradores,
  tiposEpi,
}: {
  colaboradores: Colaborador[];
  tiposEpi: TipoEPI[];
}) {
  const router = useRouter();
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id ?? "");
  const [tipoEpiId, setTipoEpiId] = useState(tiposEpi[0]?.id ?? "");
  const [assinaturaNome, setAssinaturaNome] = useState("");
  const [confirmada, setConfirmada] = useState<{ qrCodeValor: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId, tipoEpiId, assinaturaNome }),
    });
    const entrega = await res.json();
    setConfirmada(entrega);
    setAssinaturaNome("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <label className="text-sm">
          Colaborador
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
          >
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          EPI
          <select
            value={tipoEpiId}
            onChange={(e) => setTipoEpiId(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
          >
            {tiposEpi.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Assinatura (nome de confirmação)
          <input
            value={assinaturaNome}
            onChange={(e) => setAssinaturaNome(e.target.value)}
            className="border rounded px-2 py-1 w-full mt-1"
            required
          />
        </label>
        <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm">
          Registrar entrega
        </button>
      </form>

      {confirmada && (
        <div className="mt-6 border rounded p-4 inline-block text-center">
          <p className="text-sm text-gray-500 mb-2">QR Code do equipamento (ilustrativo)</p>
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500 mx-auto">
            {confirmada.qrCodeValor}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Página (Server Component busca listas)**

```tsx
import { EntregaForm } from "./EntregaForm";
import type { Colaborador, TipoEPI } from "@/lib/types";

async function getListas() {
  const [colaboradores, tiposEpi]: [Colaborador[], TipoEPI[]] = await Promise.all([
    fetch("http://localhost:3000/api/colaboradores", { cache: "no-store" }).then((r) => r.json()),
    fetch("http://localhost:3000/api/tipos-epi", { cache: "no-store" }).then((r) => r.json()),
  ]);
  return { colaboradores, tiposEpi };
}

export default async function EntregaEpiPage() {
  const { colaboradores, tiposEpi } = await getListas();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Entrega de EPI</h1>
      <EntregaForm colaboradores={colaboradores} tiposEpi={tiposEpi} />
    </div>
  );
}
```

**Step 3: Verificar visualmente**

Abrir `http://localhost:3000/epi/entrega`, registrar entrega, confirmar que aparece o "QR code" ilustrativo e que a entrega some aparece depois no histórico do colaborador (Task 14) e nos indicadores do dashboard (Task 12).

**Step 4: Commit**

```bash
git add "app/(auth)/epi/entrega"
git commit -m "feat: add EPI delivery form page"
```

---

## Task 16: Página Checklist diário

**Files:**
- Create: `app/(auth)/checklist/page.tsx`
- Create: `app/(auth)/checklist/ChecklistForm.tsx` (Client Component)

**Step 1: Form (Client Component)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ITENS_PADRAO = [
  "EPIs em uso corretamente",
  "Extintores acessíveis",
  "Área de trabalho isolada quando necessário",
  "Sinalização de segurança visível",
];

export function ChecklistForm() {
  const router = useRouter();
  const [setor, setSetor] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [respostas, setRespostas] = useState<Record<string, "sim" | "nao" | "na">>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const itens = ITENS_PADRAO.map((descricao) => ({
      descricao,
      resposta: respostas[descricao] ?? "na",
    }));

    await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setor, tecnicoResponsavel, itens }),
    });

    setSetor("");
    setTecnicoResponsavel("");
    setRespostas({});
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        placeholder="Setor"
        value={setor}
        onChange={(e) => setSetor(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <input
        placeholder="Técnico responsável"
        value={tecnicoResponsavel}
        onChange={(e) => setTecnicoResponsavel(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      {ITENS_PADRAO.map((item) => (
        <div key={item} className="flex items-center justify-between text-sm border-b pb-2">
          <span>{item}</span>
          <select
            value={respostas[item] ?? "na"}
            onChange={(e) =>
              setRespostas((prev) => ({ ...prev, [item]: e.target.value as "sim" | "nao" | "na" }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
            <option value="na">N/A</option>
          </select>
        </div>
      ))}
      <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm mt-2">
        Registrar checklist
      </button>
    </form>
  );
}
```

**Step 2: Página**

```tsx
import { ChecklistForm } from "./ChecklistForm";

export default function ChecklistPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Checklist diário de segurança</h1>
      <ChecklistForm />
    </div>
  );
}
```

**Step 3: Verificar visualmente**

Abrir `http://localhost:3000/checklist`, preencher e enviar, depois conferir que `checklistsRegistrados` no dashboard (Task 12) incrementou.

**Step 4: Commit**

```bash
git add "app/(auth)/checklist"
git commit -m "feat: add daily safety checklist page"
```

---

## Task 17: Página Incidentes

**Files:**
- Create: `app/(auth)/incidentes/page.tsx`
- Create: `app/(auth)/incidentes/IncidenteForm.tsx` (Client Component)

**Step 1: Form (Client Component)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GravidadeIncidente } from "@/lib/types";

export function IncidenteForm() {
  const router = useRouter();
  const [local, setLocal] = useState("");
  const [gravidade, setGravidade] = useState<GravidadeIncidente>("leve");
  const [descricao, setDescricao] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/incidentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ local, gravidade, descricao }),
    });
    setLocal("");
    setDescricao("");
    setGravidade("leve");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        placeholder="Local"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <select
        value={gravidade}
        onChange={(e) => setGravidade(e.target.value as GravidadeIncidente)}
        className="border rounded px-2 py-1"
      >
        <option value="leve">Leve</option>
        <option value="moderado">Moderado</option>
        <option value="grave">Grave</option>
      </select>
      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <p className="text-xs text-gray-400">Upload de foto: fora de escopo do protótipo (mockado).</p>
      <button type="submit" className="bg-black text-white rounded px-3 py-2 text-sm">
        Registrar incidente
      </button>
    </form>
  );
}
```

**Step 2: Página com listagem**

```tsx
import { IncidenteForm } from "./IncidenteForm";
import { Table } from "@/components/ui/Table";
import type { Incidente } from "@/lib/types";

async function getIncidentes(): Promise<Incidente[]> {
  const res = await fetch("http://localhost:3000/api/incidentes", { cache: "no-store" });
  return res.json();
}

export default async function IncidentesPage() {
  const incidentes = await getIncidentes();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Incidentes / quase-acidentes</h1>
      <IncidenteForm />
      <div className="mt-6">
        <Table headers={["Data", "Local", "Gravidade", "Descrição"]}>
          {incidentes.map((i) => (
            <tr key={i.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{i.data}</td>
              <td className="py-2 pr-4">{i.local}</td>
              <td className="py-2 pr-4 capitalize">{i.gravidade}</td>
              <td className="py-2 pr-4">{i.descricao}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
```

**Step 3: Verificar visualmente**

Abrir `http://localhost:3000/incidentes`, registrar incidente, confirmar que aparece na lista e no dashboard (`incidentesUltimos30d`).

**Step 4: Commit**

```bash
git add "app/(auth)/incidentes"
git commit -m "feat: add incidentes page with form and list"
```

---

## Task 18: Landing pública

**Files:**
- Modify: `app/page.tsx`

**Step 1: Implementar landing simples com CTA**

```tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4">SafeTrack EPI</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Gestão inteligente de EPI e segurança do trabalho. Controle de validade,
        checklists de segurança e registro de incidentes num só lugar — sem papel.
      </p>
      <Link href="/dashboard" className="bg-black text-white rounded px-5 py-3 text-sm">
        Ver demonstração
      </Link>
    </div>
  );
}
```

**Step 2: Verificar visualmente**

Abrir `http://localhost:3000/`, confirmar CTA leva pro dashboard.

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add public landing page"
```

---

## Task 19: Deploy no Vercel e checklist final de demo

**Files:** nenhum novo — passo operacional.

**Step 1: Rodar suite de testes completa**

Run: `npm run test`
Expected: todos os testes de `lib/status.test.ts` passando.

**Step 2: Build local**

Run: `npm run build`
Expected: build sem erro.

**Step 3: Deploy**

```bash
npx vercel
```

Seguir prompts (login, nome do projeto). Confirmar que a URL de produção abre a landing.

> Lembrete do design: `data/db.json` não persiste entre requests na Vercel (filesystem efêmero) — cada carregamento parte do seed commitado. Isso é esperado e desejável pra demo (sempre limpo).

**Step 4: Checklist manual do fluxo de demo**

Antes de usar em conversa comercial, percorrer ao vivo:

- [ ] Dashboard mostra indicadores plausíveis
- [ ] Cadastra colaborador novo → aparece na lista
- [ ] Registra entrega de EPI → QR code ilustrativo aparece, entrega some no histórico do colaborador
- [ ] Preenche checklist → contador no dashboard incrementa
- [ ] Registra incidente → aparece na lista e no dashboard
- [ ] Landing pública comunica a proposta de valor em 5 segundos de leitura

**Step 5: Commit final (se algum ajuste for feito)**

```bash
git add -A
git commit -m "chore: final adjustments after demo walkthrough"
```
