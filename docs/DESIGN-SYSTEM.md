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
