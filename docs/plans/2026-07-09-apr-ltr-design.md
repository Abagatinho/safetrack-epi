# APR e LTR — automatização da liberação de trabalho de risco

Data: 2026-07-09

## O problema

Hoje a APR e a LTR são preenchidas à mão, em papel ou Word. As duas dores
levantadas com o usuário:

1. **Emitir e assinar a LTR.** O papel circula entre requisitante, bombeiro
   (emitente) e executantes.
2. **Checar pré-requisitos do executante.** Antes de liberar, alguém confere de
   cabeça se o trabalhador tem a NR válida e o EPI entregue.

A segunda dor é a que o sistema resolve melhor, porque o SafeTrack já guarda
treinamentos (`treinamentosRealizados`) e entregas de EPI (`entregas`) com
validade. O cruzamento é imediato.

## Vocabulário

Levantado com o usuário e confirmado nas fontes normativas:

- **APR** — Análise Preliminar de Risco. Quebra a tarefa em etapas e, para cada
  etapa, aponta perigo, risco, medidas de controle. Feita antes do trabalho.
  Exigida por NR-12, NR-18, NR-20, NR-33 e NR-35.
- **ARR** — Análise de Risco Residual. Não é documento separado: é o risco que
  **sobra** depois de aplicadas as medidas de controle. Modelado como campo da
  etapa da APR.
- **LTR** — Liberação de Trabalho de Risco, também chamada PT (Permissão de
  Trabalho) ou, em espaço confinado, PET. Autorização formal, com validade
  limitada, emitida por profissional habilitado — na operação do usuário, o
  bombeiro.

Duas consequências normativas que moldam o desenho:

- **APR não autoriza.** Ela mapeia perigos. A LTR autoriza. A APR aprovada é
  pré-requisito da LTR.
- **A LTR é documento com validade jurídica.** A via original fica afixada no
  local, visível para o trabalhador e para a fiscalização; a cópia é arquivada
  pelo SST.

## Modelo de domínio

### `ModeloChecklist` — dado, não código

Um por tipo de trabalho: `altura-pemt`, `trabalho-quente`, `espaco-confinado`,
`eletrica`. Cada modelo declara os treinamentos e EPIs exigidos, e uma lista de
itens. Cada item tem um tipo:

- `verificacao` — sim / não / N-A. "Extintor posicionado ao alcance."
- `medicao` — número com faixa aceitável. O₂ entre 19,5% e 23%; LIE abaixo de
  10%. O sistema reprova fora da faixa; não depende do olho do emitente.
- `pessoa` — designa alguém para um papel. Vigia de fogo, vigia de espaço
  confinado, supervisor de entrada.

Os itens vivem no banco, não no código. **Isto é requisito, não conveniência.**
Quem responde legalmente pelo conteúdo do checklist é o profissional habilitado
que emite a LTR. O sistema não pode fixar itens que ele não possa revisar. O
seed traz um conteúdo inicial de referência, levantado das fontes citadas
abaixo, que precisa ser revisado pelo responsável técnico antes de uso real.

### `APR`

Cabeçalho (tarefa, local, data, elaborador) e uma lista de etapas. Cada etapa:
`descricao`, `perigo`, `riscoInicial`, `medidasControle[]`, `riscoResidual`.
Risco é `probabilidade × severidade`, cada um em escala de 1 a 5, o que dá um
grau de 1 a 25 e uma classe (`trivial`, `tolerável`, `moderado`, `substancial`,
`intolerável`).

Status: `rascunho` → `aprovada`.

### `LTR`

Aponta para uma APR aprovada e um modelo de checklist. Guarda local, janela de
validade, requisitante, emitente, executantes, respostas do checklist,
assinaturas e encerramento.

Status derivado, não armazenado: `emitida` enquanto dentro da janela,
`expirada` depois, e `encerrada` / `cancelada` quando registrado.

**A LTR copia o snapshot da APR e do checklist no momento da emissão.** Não
referencia por ponteiro. Se alguém editar o modelo amanhã, a LTR de ontem
continua provando o que foi conferido ontem. É o requisito de imutabilidade de
um documento com valor jurídico.

## Os gates de emissão

O momento crítico é o botão "Emitir". Antes dele, três gates. Se qualquer um
falha, não emite.

**Gate 1 — APR aprovada.** Sem APR com status `aprovada` vinculada, não emite.

**Gate 2 — executantes aptos.** Para cada pessoa: o treinamento da NR exigida
pelo modelo está válido na data? O EPI exigido foi entregue, não venceu e não
foi devolvido? Reaproveita `calcularStatus` de `lib/status.ts` — a mesma regra
que já vale para EPI e treinamento, não uma cópia.

**Gate 3 — checklist completo.** Toda verificação respondida e nenhuma
respondida "não". Toda medição dentro da faixa. Todo papel obrigatório
preenchido. Em espaço confinado, o vigia não pode ser também executante: a
função dele é exclusiva.

### Bloqueio duro, sem override

Não existe "emitir mesmo assim". Um override transforma o sistema em teatro de
conformidade: a assinatura do emitente passaria a atestar algo que o sistema
sabia ser falso. Se o bombeiro precisa liberar apesar de uma pendência, o
caminho é resolver a pendência — reciclar o treinamento, entregar o EPI — não
furar o gate.

O custo é real e assumido: se o cadastro de treinamentos e EPI estiver
desatualizado, o sistema trava trabalho legítimo. A resposta a isso é manter o
cadastro em dia, que é a razão de o SafeTrack existir.

Quando um gate falha, a tela mostra **o que falta e de quem** — "Marcos Silva:
NR-35 vencida em 12/03/2026" — nunca um erro genérico.

## Fluxo

```
APR (rascunho) --aprovar--> APR (aprovada)
                                 |
                                 v
        Nova LTR: escolhe APR + modelo + executantes
                                 |
                    gates 1, 2 e 3 avaliados ao vivo
                                 |
                    todos passam? botão habilita
                                 |
              emitente assina (canvas) --> LTR emitida
                                 |
              snapshot de APR + checklist congelado
                                 |
        /ltr/[id]: documento imprimível, com QR de conferência
                                 |
                encerramento com assinatura --> encerrada
```

## Arquivos

| Arquivo | Papel |
|---|---|
| `lib/types.ts` | `ModeloChecklist`, `ItemModelo`, `APR`, `EtapaAPR`, `LTR` |
| `lib/ltr.ts` | Gates e status. Funções puras, sem I/O. |
| `lib/ltr.test.ts` | Testes dos gates |
| `data/db.json` | Modelos de referência, APRs e LTRs de exemplo |
| `app/api/modelos-checklist/route.ts` | GET |
| `app/api/aprs/route.ts` | GET, POST |
| `app/api/aprs/[id]/aprovacao/route.ts` | POST |
| `app/api/ltrs/route.ts` | GET, POST (gates no servidor) |
| `app/api/ltrs/[id]/encerramento/route.ts` | POST |
| `app/(auth)/apr/` | Lista e criação de APR |
| `app/(auth)/ltr/` | Lista de LTRs e emissão |
| `app/(auth)/ltr/[id]/` | Documento imprimível |

Os gates rodam no servidor, dentro do `POST /api/ltrs`. A tela avalia os mesmos
gates para dar retorno imediato, mas quem decide é o servidor — o cliente pode
mentir.

## Fora de escopo

- Biblioteca de riscos para gerar APR a partir de modelo. É a terceira dor, não
  foi priorizada.
- Edição dos modelos de checklist pela interface. O seed é editável; a tela de
  edição vem depois.
- Fluxo de aprovação com múltiplos aprovadores.
- PET com formulário próprio do Anexo II da NR-33. O modelo `espaco-confinado`
  aqui cobre os campos, mas não reproduz o formulário oficial em três vias.

## Fontes

- [Manual do GRO/PGR da NR-1 — gov.br](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/manuais-e-publicacoes/manual_gro_pgr_da_nr_1.pdf/)
- [NR-33 Anexo II — PET](http://legistrab.com.br/files/Normas/NR%2033%20Anexo%20II.pdf)
- [Guia Técnico da NR-33 — gov.br](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-33_guia_tecnico_da_nr_33.pdf)
- [Guia de Boas Práticas — PT e AR, Petrobras](https://webserver-petrobrasecossistemaint-prod1.lfr.cloud/documents/10591749/12053753/04.%20Guia%20de%20Boas%20Praticas%20-%20PT%20e%20AR%20-%20PUB%20Rev%207.pdf?download=true)
- [Critérios para emissão de PT e PET — Portos do Paraná](https://www.portosdoparana.pr.gov.br/sites/portos/arquivos_restritos/files/documento/2024-05/po-appa-sgi-300_criterios_para_emissao_de_pt_e_pet.pdf)
- [Checklist PEMT](https://www.dicasgestao.com/post/checklist-de-seguran%C3%A7a-para-plataforma-elevat%C3%B3ria-m%C3%B3vel-de-trabalho-pemt)
- [Trabalho a quente — Mosaic](https://contractorsweb.mosaicco.com/saehsprograms/PGS_MOS_EHS_311___00___Trabalho_a_quente.pdf)
- [NR-10 — gov.br](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-10.pdf)

## Aviso

O conteúdo dos checklists e das APRs semeados neste repositório é **material de
referência para demonstração**. A responsabilidade legal pelo conteúdo de uma
LTR é do profissional habilitado que a emite. Antes de qualquer uso real, o
responsável técnico da empresa precisa revisar, ajustar e assumir os itens.
