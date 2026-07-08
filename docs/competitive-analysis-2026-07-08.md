# SafeTrack EPI — Análise de Concorrentes

**Data:** 2026-07-08 · **Revisão 2** (substitui a primeira análise)

## O que mudou desde a revisão 1

A primeira análise citava BuscaEPI e EntregaEPI apenas na frase de contexto e na
lista de fontes — nenhum dos dois tinha perfil próprio. Esta revisão investiga os
dois a fundo e **corrige cinco afirmações erradas ou desatualizadas**:

| # | Afirmação da revisão 1 | O que a pesquisa mostra |
|---|---|---|
| 1 | "Fluxo de assinatura via WhatsApp — argumento forte do EntregaEPI/ProSESMT" | **Não confirmado.** No site do EntregaEPI, o WhatsApp é apenas canal de contato comercial: `(47) 3029-2866`. O produto que anuncia WhatsApp no nome é outro — da **Dairiki**, vendido na loja da Senior. Não consegui abrir a página desse produto (HTTP 404) para verificar se o WhatsApp coleta assinatura ou só notifica. |
| 2 | BuscaEPI listado como "especialista de EPI", junto de RS Data | BuscaEPI é uma **plataforma B2B de duas pontas** que conecta empresas compradoras a fornecedoras de EPI, com cotações abertas. É outra categoria: comércio, não só gestão. |
| 3 | "Único no mercado pesquisado a unificar as duas dores" | **Exagerado.** O EntregaEPI já unifica EPI + treinamentos + documentos. O que é incomum na nossa combinação é EPI + treinamento NR + checklist de inspeção + incidente. |
| 4 | Sugestões nº 1 (assinatura digital) e nº 3 (exportação PDF/Excel) | **Já implementadas.** Assinatura em canvas e exportação CSV/PDF estão no produto. |
| 5 | "Assinatura digital real (canvas)" tratada como paridade com os concorrentes | **Não é paridade.** Canvas é assinatura eletrônica simples. Os concorrentes vendem *biometria* — que a NR-6 define como análise de característica física (digital, facial, íris). São coisas juridicamente diferentes. |

## O terreno legal (verificado no texto da norma)

Isto define o que o mercado vende, então vale citar exato. Da
[Portaria MTP nº 2.175/2022](https://www.normaslegais.com.br/legislacao/portariamtp2175_2022.htm),
que aprovou a atual NR-6 (vigente desde 05/02/2023):

- **Item 6.5.1(d)** — o empregador deve *"registrar o seu fornecimento ao empregado,
  podendo ser adotados livros, fichas ou sistema eletrônico, inclusive, por sistema
  biométrico"*.
- **Item 6.5.1.1** — *"O sistema eletrônico, para fins de registro de fornecimento de
  EPI, caso seja adotado, deve permitir a extração de relatórios."*
- **Glossário** — sistema biométrico é *"o sistema que analisa características físicas
  para identificar de forma inequívoca um indivíduo, como por exemplo impressão
  digital, reconhecimento facial e íris"*.

Duas leituras para nós:

1. Nossa assinatura em canvas **é conforme** — a norma aceita "sistema eletrônico",
   e a biometria entra como um *inclusive*, não como exigência.
2. Nossa exportação CSV/PDF atende o item 6.5.1.1 **ao pé da letra**. É um argumento
   de venda que não estávamos usando.

Mas biometria é o que o mercado usa para vender "identificação inequívoca". Nesse
eixo específico, estamos atrás.

## Nossos diferenciais

Cada um verificado contra o produto e contra a pesquisa:

- **QR que abre a ficha do equipamento no celular.** Escaneia o capacete, vê de quem
  é, se venceu, quem assinou o recebimento. Nenhum dos concorrentes pesquisados
  anuncia isso — eles usam código para identificar item em estoque, não como destino
  navegável.
- **Demo pública, sem login.** BuscaEPI ("Agende uma demonstração"), EntregaEPI e
  RS Data escondem o produto atrás de formulário de contato. Nenhum publica preço.
- **Exportação que atende o item 6.5.1.1 literalmente**, em CSV (Excel pt-BR) e PDF.
- **EPI + treinamento NR + checklist + incidente num escopo enxuto.** O EntregaEPI
  cobre EPI + treinamento + documentos, mas não inspeção de campo; o Checklist Fácil
  cobre inspeção, mas não EPI.

**Ressalva honesta:** somos um protótipo de validação. Em produção os dados vivem em
memória e reiniciam a cada instância nova. Não somos, hoje, concorrente de nenhum
produto abaixo — somos uma peça de conversa comercial.

## Concorrentes

### BuscaEPI (SafetyTec) — marketplace + gestão

Duas coisas num produto só:

- **Marketplace B2B de duas pontas:** empresas compradoras criam cotações de EPI e
  recebem propostas de fornecedores. Existe uma página de "Cotações Abertas".
  Autenticação compartilhada com o ConsultaCA.
- **BuscaEPI Control:** gestão de cotações, estoque e entrega de EPI, uniformes, EPC,
  ferramentas e MRO. Elimina a ficha de papel, alerta entregas pendentes e EPIs a
  vencer, e emite relatórios de custo por setor, unidade e área.

**Por que importa:** o nosso cliente-alvo (a terceirizada que fornece EPI) é
justamente o *lado fornecedor* desse marketplace. O BuscaEPI não é só um concorrente
— é um canal onde nosso cliente talvez já esteja.

Sem preço público. O site é uma SPA que não renderiza sem JavaScript, o que limitou a
leitura direta; o detalhamento de funcionalidades veio de fontes secundárias.

### EntregaEPI — o concorrente mais direto

Posicionamento: *"Automatize a gestão de EPIs e diga adeus ao papel"* — quase a nossa
frase.

- **Assinatura com biometria digital e facial**, além de senha, para conformidade com
  a NR-6.
- **Modo offline**, via app e web.
- **Controle de estoque**, inclusive material em trânsito.
- **Devolução obrigatória na troca** — o sistema exige a devolução do EPI antigo e
  registra pendências.
- **Gestão de treinamentos** (turmas, presença, feedback) e **de documentos**.
- Azure, backups diários, aderência à LGPD. Cancelamento com 30 dias de aviso.
- Clientes citados no site: TRG Pinturas, Tetra Tech, LAMB Engenharia.

Sem preço público. Não encontrei avaliações independentes de usuários (as reclamações
que aparecem em busca são de *lojas* de EPI, não da plataforma) — então não sei o que
os usuários dele realmente elogiam ou criticam.

### Checklist Fácil — líder da categoria vizinha

4.8/5 em 105 avaliações no Capterra, 98% de sentimento positivo. Não faz EPI; é a
referência do lado da inspeção.

- **Elogiado por:** facilidade de uso e, sobretudo, evidência em foto e vídeo pelo
  celular durante a inspeção.
- **Criticado por:** atualizações lentas, lógica condicional limitada nos checklists,
  gestão de usuários entre regiões, e relatórios/gráficos básicos comparados ao
  Power BI.

Preço não público; tem teste grátis.

### RS Data, SOC, Senior

Mantidos da revisão anterior como contexto de mercado, **sem reverificação nesta
rodada**: RS Data vende biometria, offline e ISO 27001 no cluster de EPI; SOC e Senior
são suítes enterprise que fazem EPI + SST + exames + eSocial. Trate essas afirmações
como menos confiáveis que as acima.

## Sugestões priorizadas

Ordenadas por impacto sobre esforço. Esforço estimado contra o que o código já tem
(Next.js, API mockada em `data/db.json`, canvas de assinatura, captura de foto).

| # | Sugestão | Impacto | Esforço | Por quê |
|---|---|---|---|---|
| 1 | **Foto do recebedor no ato da entrega** | Alto | Muito baixo | Já temos câmera (incidentes) e canvas (assinatura). Aproxima do "registro inequívoco" que a biometria vende — sem ser biometria, e dizendo isso com honestidade. |
| 2 | **Publicar preço na landing** | Médio-alto | Trivial | Nenhum concorrente pesquisado publica preço. Posicionamento, não engenharia. |
| 3 | **Vincular EPI a função/GHE e relatar por setor** | Médio-alto | Baixo | É o que o BuscaEPI Control vende (custo por setor, unidade, área). Um campo no modelo e um agrupamento no relatório. |
| 4 | **Controle de estoque** | Alto | Médio | BuscaEPI e EntregaEPI têm. Nosso cliente *distribui* EPI — hoje não sabe o que tem em mãos. Maior buraco funcional. |
| 5 | **Bloquear troca sem devolução** | Médio | Baixo | Regra do EntregaEPI. A API de devolução já existe; falta a regra. |
| 6 | **Plano de ação (5W2H) na não conformidade** | Médio-alto | Médio | Fecha o ciclo detectar → corrigir. O checklist hoje registra o "não" e para aí. |
| 7 | **Alerta ativo (e-mail/WhatsApp)** | Alto | Alto | Hoje o alerta só existe se alguém abrir o painel. Exige backend real e agendador. |
| 8 | **Modo offline (PWA)** | Alto | Alto | EntregaEPI e RS Data vendem isso; obra e mina não têm sinal. |
| 9 | **Biometria facial na entrega** | Alto | Muito alto | Argumento jurídico central do cluster de EPI. Prevista na NR-6 desde 2023. |

Os itens 7 e 8 pressupõem trocar `data/db.json` por um banco real — e, quando isso
acontecer, deixa de ser protótipo.

## Fontes

- [BuscaEPI](https://buscaepi.com/) · [Cotações Abertas](https://buscaepi.com/cotacoes-abertas) · [Contato — "Agende uma demonstração"](https://buscaepi.com/contato/)
- [EntregaEPI](https://entregaepi.com.br/)
- [Portaria MTP nº 2.175, de 28/07/2022 — texto da NR-6](https://www.normaslegais.com.br/legislacao/portariamtp2175_2022.htm)
- [Checklist Fácil — Capterra (4.8/5, 105 avaliações)](https://www.capterra.com/p/201781/Checklistfacil/)
- [Checklist Fácil — SST e Meio Ambiente](https://checklistfacil.com/aplicacao/saude-seguranca-do-trabalho-e-meio-ambiente/)
- [RS Data — Software de Gestão de EPI](https://www.rsdata.com.br/software-gestao-de-epi/)
- [SOC — Checklist e Inspeções](https://www.soc.com.br/blog-de-sst/checklist-e-inspecoes-simplifique-sua-gestao-de-seguranca/)
- [FichaEPI — biometria e app offline](https://fichaepi.com.br/) (HTTP 403 na leitura direta; citado a partir de resultados de busca)
