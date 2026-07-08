import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { QuadroDiasSemAcidente } from "@/components/ui/QuadroDiasSemAcidente";

type Resumo = {
  totalColaboradores: number;
  epiVencendo: number;
  epiVencido: number;
  diasSemAcidente: number | null;
};

const CONTRASTE = [
  {
    tarefa: "Validade do EPI",
    papel: "Anotada numa ficha guardada na gaveta",
    safetrack: "Alerta na tela 30 dias antes de vencer",
  },
  {
    tarefa: "Checklist de campo",
    papel: "Prancheta no setor, digitação no dia seguinte",
    safetrack: "Preenchido no celular, indicador sobe na hora",
  },
  {
    tarefa: "Registro de incidente",
    papel: "Relatório manuscrito, análise semanas depois",
    safetrack: "Local e gravidade no momento, contador zera",
  },
  {
    tarefa: "Treinamento de NR",
    papel: "Planilha que ninguém abre até a fiscalização chegar",
    safetrack: "Reciclagem vencida aparece no painel",
  },
  {
    tarefa: "Auditoria",
    papel: "Caixa de papel, uma tarde procurando",
    safetrack: "Histórico por colaborador, exportado em CSV",
  },
];

const NORMA = [
  { cor: "bg-seguranca", nome: "Verde", uso: "Segurança" },
  { cor: "bg-cuidado", nome: "Amarelo", uso: "Cuidado" },
  { cor: "bg-perigo", nome: "Vermelho", uso: "Perigo" },
  { cor: "bg-advertencia", nome: "Azul", uso: "EPI obrigatório" },
];

export default async function LandingPage() {
  const resumo = await apiFetch<Resumo>("/api/dashboard/resumo");
  const dias = resumo.diasSemAcidente ?? 0;

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-traco">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="letreiro text-lg">SafeTrack EPI</span>
          <span className="etiqueta hidden sm:block">Gestão de EPI e segurança do trabalho</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: o objeto que esta plataforma substitui. */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="etiqueta mb-6">Para empresas que fornecem EPI à indústria</p>
            <h1 className="letreiro text-4xl sm:text-6xl mb-6">
              Esse número era
              <br />
              escrito à mão.
            </h1>
            <p className="text-lg text-fumaca max-w-md mb-4 leading-relaxed">
              Agora ele se atualiza sozinho, a cada incidente registrado no chão de fábrica.
            </p>
            <p className="text-base text-fumaca max-w-md mb-10 leading-relaxed">
              O SafeTrack acompanha validade de EPI, treinamentos de NR, checklists de campo e
              incidentes. O que estava no papel vira dado no mesmo instante.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dashboard" className="botao botao-campo inline-block">
                Ver demonstração
              </Link>
              <p className="dado text-fumaca">
                {resumo.totalColaboradores} colaboradores · {resumo.epiVencido} EPIs vencidos
              </p>
            </div>
          </div>

          <div className="lg:rotate-[-1.5deg] lg:justify-self-end w-full max-w-sm mx-auto lg:mx-0">
            <QuadroDiasSemAcidente dias={dias} />
          </div>
        </section>

        {/* A comparação é o conteúdo. Duas colunas porque há duas realidades. */}
        <section className="border-y border-traco bg-aco">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="letreiro text-2xl sm:text-3xl mb-10">O que muda no dia a dia</h2>

            <div className="grid gap-px bg-traco border border-traco">
              <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1.2fr] gap-px bg-traco">
                <div className="bg-concreto px-4 py-3 etiqueta">Tarefa</div>
                <div className="bg-concreto px-4 py-3 etiqueta">No papel</div>
                <div className="bg-concreto px-4 py-3 etiqueta text-seguranca">No SafeTrack</div>
              </div>

              {CONTRASTE.map((linha) => (
                <div
                  key={linha.tarefa}
                  className="grid sm:grid-cols-[1fr_1.2fr_1.2fr] gap-px bg-traco"
                >
                  <div className="bg-aco px-4 py-4">
                    <span className="letreiro text-sm">{linha.tarefa}</span>
                  </div>
                  <div className="bg-aco px-4 py-4 text-sm text-fumaca line-through decoration-perigo decoration-1">
                    {linha.papel}
                  </div>
                  <div className="bg-aco px-4 py-4 text-sm text-grafite border-l-2 border-l-seguranca sm:border-l-2">
                    {linha.safetrack}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rodapé de placa: a legenda que justifica as cores do sistema. */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid sm:grid-cols-[1fr_1.4fr] gap-10">
            <div>
              <h2 className="letreiro text-2xl mb-4">As cores já são norma</h2>
              <p className="text-sm text-fumaca leading-relaxed">
                O sistema não inventa um código visual. Ele usa o que a NBR 7195 já determina
                para a segurança do trabalho — o mesmo código que está pintado no chão e nas
                máquinas da indústria.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-traco border border-traco self-start">
              {NORMA.map((c) => (
                <div key={c.nome} className="bg-aco p-4 flex items-center gap-3">
                  <span className={`w-8 h-8 ${c.cor} border border-grafite/20`} aria-hidden="true" />
                  <div>
                    <dt className="letreiro text-xs">{c.nome}</dt>
                    <dd className="etiqueta">{c.uso}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="chassi">
        <div className="faixa-risco" />
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <span className="letreiro text-sm">SafeTrack EPI</span>
          <span className="etiqueta">Protótipo de demonstração · dados fictícios</span>
        </div>
      </footer>
    </div>
  );
}
