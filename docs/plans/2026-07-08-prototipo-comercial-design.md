# SafeTrack EPI — Protótipo Comercial (Design)

Data: 2026-07-08

## Contexto e objetivo

Empresas terceirizadas fornecem EPI (equipamento de proteção individual) para
indústrias e cuidam de relatórios de segurança do trabalho. Hoje esse processo
é manual: entrega de EPI em papel (validade não renovada por falta de
automação) e relatórios/inspeções em papel com análise humana lenta.

Ainda não há empresa piloto confirmada. Objetivo deste protótipo é servir de
**gancho de conversa comercial** — demo funcional, sem back-end persistente
real, pra validar a dor com empresas terceirizadas de EPI antes de investir
num MVP de verdade.

Desenvolvimento será feito usando o modelo Fable 5.

## Escopo funcional

### Controle de EPI
1. Dashboard — visão geral (colaboradores, EPIs vencendo/vencidos, entregas recentes)
2. Colaboradores — lista + cadastro, histórico por colaborador
3. Catálogo de EPI — tipos de equipamento com validade padrão
4. Entrega de EPI — formulário, calcula validade automática, assinatura
   digital simulada, QR code visual (não funcional de verdade)
5. Alertas de validade — verde/amarelo/vermelho por urgência
6. Histórico de entregas/devoluções por colaborador

### Relatórios / Inspeção de segurança
7. Checklist diário de segurança — formulário mobile-friendly, itens sim/não/N-A
8. Registro de incidente/quase-acidente — foto mockada, local, gravidade
9. Indicadores no dashboard — dias sem acidente, checklists pendentes,
   incidentes últimos 30 dias, gráfico simples por tipo/local
10. Relatório consolidado — tela de resumo com botão de exportar mockado
    (exportação real de PDF/Excel fica fora do protótipo)

Dashboard unifica EPI + Segurança numa visão só (mensagem comercial: "uma
plataforma resolve as duas dores").

### Fluxo de demo (momentos-chave)
- Cadastra colaborador → entrega EPI → alerta de validade aparece automático
  no dashboard, card fica vermelho quando vence.
- Preenche checklist no celular → indicador atualiza em tempo real no
  dashboard — mostra o salto do papel pro digital.

### Fora de escopo (proposital)
- Login/autenticação real e multi-empresa
- Back-end persistente de verdade (banco de dados)
- Exportação real de arquivo (PDF/Excel)
- Câmeras/IA, integrações externas

## API mockada

Next.js API routes simulando REST — front-end consome via `fetch`, igual
consumiria uma API real futura. Facilita migração posterior.

```
GET/POST   /api/colaboradores
GET/POST   /api/tipos-epi
GET/POST   /api/entregas
GET        /api/entregas?status=vencendo|vencido
POST       /api/entregas/:id/devolucao
GET/POST   /api/checklists
GET/POST   /api/incidentes
GET        /api/dashboard/resumo
```

Armazenamento: arquivo `data/db.json`, lido/escrito no server a cada
request. Seed inicial populado (colaboradores, EPIs, entregas com validade
vencendo de propósito, checklists, incidentes). Cálculo de status
(vencendo/vencido) roda no server, na resposta do GET.

Sem autenticação no contrato de API (fica pra versão real).

## Modelo de dado

```
Colaborador
- id, nome, funcao, empresaCliente, foto?

TipoEPI
- id, nome (capacete, luva...), validadeMeses

EntregaEPI
- id, colaboradorId, tipoEpiId, dataEntrega
- dataValidade (calculado: dataEntrega + validadeMeses)
- status (calculado: ok | vencendo30d | vencido)
- assinaturaNome, assinaturaData (simulada)
- qrCodeValor (string gerada, ex: id da entrega)

ChecklistDiario
- id, setor, data, tecnicoResponsavel
- itens: [{ descricao, resposta: sim|nao|na }]

Incidente
- id, data, local, colaboradorId?, gravidade (leve|moderado|grave)
- descricao, fotoUrl (mockada/placeholder)
```

Seed: ~15 colaboradores, 6 tipos de EPI, ~25 entregas, 10 checklists,
5 incidentes.

## Arquitetura técnica

Next.js (App Router) + React + TypeScript, Tailwind CSS, componentes tipo
shadcn/ui (cards, badges coloridos por status).

```
safetrack-epi-proto/
  app/
    page.tsx              (landing pública — pitch comercial)
    layout.tsx             (root layout)
    (auth)/
      layout.tsx            (nav/sidebar comum das páginas internas)
      dashboard/page.tsx
      colaboradores/page.tsx
      colaboradores/[id]/page.tsx
      epi/entrega/page.tsx
      checklist/page.tsx
      incidentes/page.tsx
    api/
      colaboradores/route.ts
      tipos-epi/route.ts
      entregas/route.ts
      entregas/[id]/devolucao/route.ts
      checklists/route.ts
      incidentes/route.ts
      dashboard/resumo/route.ts
  lib/
    db.ts          (lê/escreve data/db.json)
    types.ts
    status.ts       (cálculo vencendo/vencido)
  data/
    db.json          (seed inicial)
  components/
    ui/
```

`(auth)` é route group do Next (parênteses não entram na URL) — só organiza
e compartilha layout entre páginas internas, sem lógica de sessão/redirect
real. Landing (`app/page.tsx`) fica fora do grupo, pública, com CTA "ver
demo" levando pro `/dashboard`.

Sem autenticação funcional, sem multi-tenant nesta fase.

## Deploy

Vercel (free tier) — Next.js nativo. Aviso: `data/db.json` escrito em
runtime NÃO persiste em produção na Vercel (filesystem read-only/efêmero em
serverless) — cada deploy/restart volta pro seed, o que é aceitável (e até
desejável) pra demo comercial: sempre limpo pra próxima conversa. Pra
persistência entre sessões de demo, rodar local (`npm run dev`).

## Próximos passos após validação

Se conversas confirmarem a dor e disposição de pagar, evoluir pra MVP real:
back-end persistente (Postgres), autenticação de verdade, multi-empresa,
exportação real de relatórios.
