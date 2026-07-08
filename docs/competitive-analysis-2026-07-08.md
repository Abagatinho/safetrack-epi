# SafeTrack EPI — Análise de Concorrentes

Data: 2026-07-08

## Contexto do produto

SafeTrack EPI é protótipo comercial (sem back-end persistente) pra empresas
terceirizadas que fornecem EPI e cuidam de segurança do trabalho pra
indústrias. Unifica duas dores hoje resolvidas em papel ou sistemas
separados: controle de entrega/validade de EPI e checklist/inspeção de
segurança. Diferencial já assumido no design: "uma plataforma resolve as
duas dores".

## Concorrentes pesquisados

Mercado brasileiro de software de EPI e SST tem dois clusters:

- **Especialistas em EPI**: BuscaEPI, EntregaEPI, RS Data, ProSESMT, Nortel,
  Prolaborar — todos focam só em ficha de entrega/validade de EPI.
- **Especialistas em checklist/inspeção SST**: Checklist Fácil, SULTS, ESST
  Gestão — focam só em auditoria/checklist, não em EPI.
- **Suítes SST completas (incumbentes grandes)**: SOC (23 anos de mercado,
  ISO 27001, 300+ funcionalidades), Senior — fazem tudo (EPI + SST + exames
  ocupacionais + eSocial), mas como parte de ERP grande e caro.

Nenhum concorrente pesquisado combina EPI + inspeção numa plataforma leve
focada especificamente em terceirizadas — ou é especialista de nicho, ou é
suíte enterprise completa.

Escolhidos pra aprofundar (maior presença de mercado / evidência concreta):

1. **RS Data** (representando o cluster especialista em EPI — feature set
   detalhado disponível, biometria + NR-06)
2. **Checklist Fácil** (líder declarado de mercado na América Latina em
   checklist/inspeção, 105 avaliações públicas no Capterra, nota 4.8/5)

SOC e BuscaEPI/EntregaEPI citados como contexto de mercado mas sem
aprofundamento (dados de reviews/preço não públicos ou página não
renderizou).

## 1. Nossos diferenciais

- **Unificação EPI + inspeção numa dashboard só.** Nenhum concorrente
  pesquisado faz isso de forma leve — é ou EPI-only (RS Data, BuscaEPI,
  EntregaEPI) ou checklist-only (Checklist Fácil, SULTS), ou suíte pesada
  tipo SOC/Senior.
- **Foco de nicho em terceirizadas de EPI**, não em indústria direta ou
  SESMT grande — incumbentes miram empresas maiores.
- **Fricção comercial baixa**: demo funcional sem login, pronta pra mostrar
  na conversa comercial. Concorrentes analisados (RS Data, SOC) escondem
  tudo atrás de "solicitar orçamento" — sem demo aberta.
- **Escopo enxuto**: onboarding rápido de mostrar, contra a complexidade de
  SOC (300+ funcionalidades, ISO 27001/LGPD, integra exames ocupacionais e
  eSocial) — sobra pra terceirizada pequena que só quer resolver EPI +
  checklist.

## 2. Diferenciais dos concorrentes

### RS Data (cluster EPI)
- Assinatura **biométrica real** (digital) na entrega, não simulada —
  elimina disputa jurídica sobre recebimento do EPI.
- Vínculo EPI ↔ função/risco do cargo — sugere automaticamente qual EPI
  cada função exige (compliance NR-06).
- Modo offline pra entrega em campo sem internet.
- Certificação ISO 27001/27701, criptografia — vende "segurança jurídica"
  como argumento central.

  Por que importa: reviews e marketing do setor (RS Data, EntregaEPI,
  ProSESMT) tratam biometria/assinatura real como o principal argumento de
  venda — é o que resolve a dor jurídica de "prova de entrega", não só a
  dor operacional de controle de validade.

### Checklist Fácil (cluster inspeção)
- Nota 4.8/5 em 105 avaliações no Capterra; "Inspection Management" avaliado
  em 4.9/5.
- **Plano de ação / correção de não-conformidade** vinculado ao item do
  checklist (metodologia 5W2H, via parceiro SULTS) — fecha o ciclo
  detectar→corrigir, não só registra.
- Exportação real de relatório em PDF, dashboards em tempo real,
  integração com Power BI.
- Check-in geolocalizado em inspeções de campo.
- Reclamações recorrentes: sincronização lenta em baixa conectividade,
  pouca lógica condicional no checklist, suporte inconsistente.

  Por que importa: usuários claramente valorizam mais o *fechamento* do
  problema (plano de ação) do que só a detecção — é o que Checklist Fácil
  usa pra justificar preço em empresas maiores (40% enterprise, 38%
  pequenas empresas segundo Capterra).

## 3. Sugestões priorizadas (impacto × esforço)

Ordenado por impacto/esforço, do mais óbvio pro mais custoso — considerando
que o protótipo é Next.js sem back-end real (tudo mockável no client ou
`db.json`).

| # | Sugestão | Impacto | Esforço | Por quê |
|---|----------|---------|---------|---------|
| 1 | Assinatura digital real (canvas/touch) na entrega, em vez de simulada | Alto | Baixo | Argumento nº1 de venda no cluster EPI (RS Data, EntregaEPI, ProSESMT); só precisa lib de canvas client-side, sem back-end |
| 2 | Vínculo EPI ↔ função/risco (sugestão automática do EPI certo por cargo) | Médio-Alto | Baixo | Diferencial de compliance NR-06 do RS Data; só adiciona campo no modelo de dado + seed |
| 3 | Exportação real de PDF/Excel do relatório consolidado | Alto | Médio | Hoje é mockado no escopo; toda concorrência trata exportação como entregável de compliance esperado (jsPDF/exceljs client-side cabe no protótipo) |
| 4 | Check-in geolocalizado no checklist de campo | Médio | Baixo-Médio | Feature destacada por SULTS/SOC; Geolocation API do navegador, fácil de mockar |
| 5 | Plano de ação vinculado a não-conformidade do checklist (estilo 5W2H) | Alto | Médio | Diferencial mais citado do Checklist Fácil — fecha o ciclo detectar→corrigir, hoje ausente do escopo |
| 6 | Fluxo de assinatura/notificação via WhatsApp (mockado pra demo) | Médio | Médio | Argumento de venda forte do EntregaEPI/ProSESMT pra reduzir fricção de campo; pode ser só mockup de UI no protótipo |

## Fontes

- [BuscaEPI](https://buscaepi.com/)
- [EntregaEPI](https://entregaepi.com.br/)
- [RS Data — Software de Gestão de EPI](https://www.rsdata.com.br/software-gestao-de-epi/)
- [ProSESMT — Gestão de EPI](https://prosesmt.com.br/site/gestao-de-epi/)
- [SOC — Checklist e Inspeções](https://www.soc.com.br/blog-de-sst/checklist-e-inspecoes-simplifique-sua-gestao-de-seguranca/)
- [SULTS — Checklist de Segurança do Trabalho](https://www.sults.com.br/produtos/checklist/checklist-seguranca-trabalho)
- [Checklist Fácil — Saúde, Segurança do Trabalho e Meio Ambiente](https://checklistfacil.com/aplicacao/saude-seguranca-do-trabalho-e-meio-ambiente/)
- [Checklist Fácil — Capterra (preço/avaliações)](https://www.capterra.com/p/201781/Checklistfacil/)
