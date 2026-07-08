# SafeTrack EPI — Design System

Data: 2026-07-08

## Princípio

O sistema não inventa um código visual. Ele herda o que a **NBR 7195 (Cores na
segurança do trabalho)** já determina, e que já está pintado no chão e nas
máquinas da indústria onde o cliente trabalha.

Consequência prática: **cor é semântica, não decoração.** Verde não significa
"sucesso" — significa segurança. Vermelho não significa "erro" — significa
perigo. Um indicador só fica vermelho quando o dado que ele mostra é uma falha
real de conformidade.

## Cor

| Token | Hex | Significado (NBR 7195) | Uso no produto |
|---|---|---|---|
| `--perigo` | `#c8102e` | Perigo, equipamento de incêndio | EPI vencido, incidente grave |
| `--cuidado` | `#ffc72c` | Cuidado, atenção | EPI vencendo em 30 dias, incidente leve |
| `--seguranca` | `#00843d` | Segurança | EPI em dia, conformidade |
| `--advertencia` | `#005eb8` | Advertência, EPI obrigatório | Links, foco de teclado |
| `--maquina` | `#e8590c` | Partes móveis de máquina | Incidente moderado |

Neutros industriais — aço, concreto, grafite:

| Token | Hex | Uso |
|---|---|---|
| `--grafite` | `#1b1e23` | Chassi, texto principal |
| `--carvao` | `#2a2e35` | Elevação dentro do chassi |
| `--fumaca` | `#6b7078` | Texto secundário sobre superfície clara |
| `--neblina` | `#9aa0a8` | Texto secundário sobre o chassi (6.5:1) |
| `--traco` | `#c9cbc6` | Bordas |
| `--concreto` | `#e3e4e0` | Superfície da aplicação |
| `--aco` | `#fafaf9` | Placas, cards |

`--fumaca` sobre `--grafite` daria apenas 3:1. Por isso existe `--neblina`:
todo texto secundário dentro do chassi escuro usa ele.

## Tipografia

| Papel | Família | Aplicação |
|---|---|---|
| Display | **Archivo** 800 | `.letreiro` — caixa alta, tracking −0.02em. Títulos e botões. Letreiro de placa. |
| Corpo | **IBM Plex Sans** | Texto corrido. Cheiro de documento de engenharia. |
| Utilitária | **IBM Plex Mono** | `.etiqueta` (labels em caixa alta) e `.dado` (datas, IDs, nº de CA, com `tabular-nums`). |

## Forma

Canto reto em tudo. A única exceção é `.pictograma`, que é um círculo —
porque a sinalização normativa usa o círculo para EPI obrigatório e proibição.
A forma carrega significado tanto quanto a cor.

## Componentes

| Classe | Papel |
|---|---|
| `.placa` | Chapa de aço, borda reta. Unidade de conteúdo do sistema. |
| `.chassi` | Painel de controle escuro. Sidebar e rodapé. |
| `.faixa-risco` | Hachura 45° amarelo/preto de sinalização. |
| `.pictograma` | Disco de sinalização circular. |
| `.campo` / `.botao` | Controles. `.botao-campo` amplia o alvo — quem usa está de luva. |
| `.quadro` / `.digito` | O elemento-assinatura (abaixo). |

Componentes vivem em `@layer components`. Isso é deliberado: garante que as
utilities do Tailwind (`text-perigo`, `bg-aco`) sobrescrevam o componente no
uso. Fora de layer, `.etiqueta { color }` venceria `.text-seguranca` — as duas
têm a mesma especificidade e o componente vinha depois na folha.

## Estrutura codifica verdade

`FaixaRisco` **não é ornamento**. Ela retorna `null` quando não há EPI vencido.
A hachura de sinalização só aparece quando existe risco ativo — sua ausência
comunica tanto quanto sua presença.

Verificável:

- `/colaboradores/col-1` (2 EPIs vencidos) → faixa presente
- `/colaboradores/col-4` (0 EPIs vencidos) → faixa ausente

Pela mesma razão, não há numeração `01 / 02 / 03` em lugar nenhum: o conteúdo
deste produto não é uma sequência.

## Elemento-assinatura: o quadro DIAS SEM ACIDENTES

Toda fábrica tem esse quadro na parede, com os dígitos trocados à mão. Ele é o
KPI emocional do setor e o artefato exato que esta plataforma substitui — por
isso é o herói da landing, e não uma estatística genérica num card.

A execução é skeumórfica de propósito: chapa esmaltada, quatro parafusos,
dígitos em células split-flap com dobradiça. O contador anima na carga da
página e respeita `prefers-reduced-motion`.

Toda a ousadia do sistema está gasta aqui. O resto é disciplinado: sem
gradientes, sem sombras difusas, sem cantos arredondados, sem animação
decorativa.

## Gráficos

Um só, em `/relatorio`: incidentes por local, barras horizontais empilhadas por
gravidade. As cores são a **status palette** (NBR), não categórica — por isso
nunca aparecem como "série 4" em outro lugar.

A separação sob daltonismo foi **computada, não estimada**: pior par adjacente
(`#E8590C` ↔ `#FFC72C`) dá ΔE **26.4** em deuteranopia, bem acima do piso de 12.

O amarelo de cuidado, porém, tem contraste de apenas **1.49:1** contra a
superfície de aço. A cor é normativa e não pode ser trocada, então o contraste
é compensado com relief obrigatório:

- legenda rotulada (identidade nunca depende só da cor);
- rótulo direto do total na ponta da barra — nunca um número por segmento;
- **table view** (`<details>`), onde todo valor é legível como texto.

Regras seguidas: gap de 2px na cor da superfície entre segmentos, **nunca uma
borda em volta da marca**; marcas finas (16px); sem eixo duplo; sem gradiente.
Cantos ficam retos, por coerência com o resto do sistema.

Stat tiles usam a sans de corpo com figuras proporcionais no valor — display
face e `tabular-nums` deixam um número grande e solto com espaçamento frouxo.
O quadro DIAS SEM ACIDENTES é a exceção deliberada: lá os dígitos vivem em
células alinhadas, onde `tabular-nums` é o certo.

## Impressão

"Salvar PDF" chama `window.print()`. O papel não leva navegação, chassi escuro
nem sombra — `@media print` remove tudo isso. Um `<details>` fechado não é
aberto por CSS, então um listener de `beforeprint` abre a table view do gráfico
antes de imprimir e a fecha depois (funciona também com Ctrl+P).

## Acessibilidade

- Foco visível em todo controle (`outline` azul de advertência; amarelo dentro
  do chassi, onde o azul não contrasta).
- `prefers-reduced-motion` respeitado — o contador aparece direto no valor final.
- Faixa de risco é `role="alert"`.
- O valor do quadro é exposto a leitores de tela em texto (`sr-only`); os
  dígitos visuais são `aria-hidden`.
- Radio groups reais por trás dos botões segmentados (`sr-only` + `fieldset`),
  navegáveis por teclado.
- Tabelas rolam horizontalmente no mobile em vez de estourar a página.
