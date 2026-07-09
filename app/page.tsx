import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { DaysWithoutAccidentBoard } from "@/components/ui/DaysWithoutAccidentBoard";

type Summary = {
  totalEmployees: number;
  ppeExpiringSoon: number;
  ppeExpired: number;
  daysWithoutAccident: number | null;
};

const CONTRAST = [
  {
    task: "Validade do EPI",
    paper: "Anotada numa ficha guardada na gaveta",
    safetrack: "Alerta na tela 30 dias antes de vencer",
  },
  {
    task: "Checklist de campo",
    paper: "Prancheta no setor, digitação no dia seguinte",
    safetrack: "Preenchido no celular, indicador sobe na hora",
  },
  {
    task: "Registro de incidente",
    paper: "Relatório manuscrito, análise semanas depois",
    safetrack: "Local e gravidade no momento, contador zera",
  },
  {
    task: "Treinamento de NR",
    paper: "Planilha que ninguém abre até a fiscalização chegar",
    safetrack: "Reciclagem vencida aparece no painel",
  },
  {
    task: "Auditoria",
    paper: "Caixa de papel, uma tarde procurando",
    safetrack: "Histórico por colaborador, exportado em CSV",
  },
];

const STANDARD = [
  { color: "bg-safety", name: "Verde", use: "Segurança" },
  { color: "bg-caution", name: "Amarelo", use: "Cuidado" },
  { color: "bg-danger", name: "Vermelho", use: "Perigo" },
  { color: "bg-mandatory", name: "Azul", use: "EPI obrigatório" },
];

export default async function LandingPage() {
  const summary = await apiFetch<Summary>("/api/dashboard/summary");
  const days = summary.daysWithoutAccident ?? 0;

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="signage text-lg">SafeTrack EPI</span>
          <span className="label hidden sm:block">Gestão de EPI e segurança do trabalho</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: o objeto que esta plataforma substitui. */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="label mb-6">Para empresas que fornecem EPI à indústria</p>
            <h1 className="signage text-4xl sm:text-6xl mb-6">
              Esse número era
              <br />
              escrito à mão.
            </h1>
            <p className="text-lg text-smoke max-w-md mb-4 leading-relaxed">
              Agora ele se atualiza sozinho, a cada incidente registrado no chão de fábrica.
            </p>
            <p className="text-base text-smoke max-w-md mb-10 leading-relaxed">
              O SafeTrack acompanha validade de EPI, treinamentos de NR, checklists de campo e
              incidentes. O que estava no papel vira dado no mesmo instante.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dashboard" className="button button-heavy inline-block">
                Ver demonstração
              </Link>
              <p className="data text-smoke">
                {summary.totalEmployees} colaboradores · {summary.ppeExpired} EPIs vencidos
              </p>
            </div>
          </div>

          <div className="lg:rotate-[-1.5deg] lg:justify-self-end w-full max-w-sm mx-auto lg:mx-0">
            <DaysWithoutAccidentBoard days={days} />
          </div>
        </section>

        {/* A comparação é o conteúdo. Duas colunas porque há duas realidades. */}
        <section className="border-y border-rule bg-steel">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="signage text-2xl sm:text-3xl mb-10">O que muda no dia a dia</h2>

            <div className="grid gap-px bg-rule border border-rule">
              <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1.2fr] gap-px bg-rule">
                <div className="bg-concrete px-4 py-3 label">Tarefa</div>
                <div className="bg-concrete px-4 py-3 label">No papel</div>
                <div className="bg-concrete px-4 py-3 label text-safety">No SafeTrack</div>
              </div>

              {CONTRAST.map((row) => (
                <div
                  key={row.task}
                  className="grid sm:grid-cols-[1fr_1.2fr_1.2fr] gap-px bg-rule"
                >
                  <div className="bg-steel px-4 py-4">
                    <span className="signage text-sm">{row.task}</span>
                  </div>
                  <div className="bg-steel px-4 py-4 text-sm text-smoke line-through decoration-danger decoration-1">
                    {row.paper}
                  </div>
                  <div className="bg-steel px-4 py-4 text-sm text-graphite border-l-2 border-l-safety sm:border-l-2">
                    {row.safetrack}
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
              <h2 className="signage text-2xl mb-4">As cores já são norma</h2>
              <p className="text-sm text-smoke leading-relaxed">
                O sistema não inventa um código visual. Ele usa o que a NBR 7195 já determina
                para a segurança do trabalho — o mesmo código que está pintado no chão e nas
                máquinas da indústria.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-rule border border-rule self-start">
              {STANDARD.map((c) => (
                <div key={c.name} className="bg-steel p-4 flex items-center gap-3">
                  <span className={`w-8 h-8 ${c.color} border border-graphite/20`} aria-hidden="true" />
                  <div>
                    <dt className="signage text-xs">{c.name}</dt>
                    <dd className="label">{c.use}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="chassis">
        <div className="risk-stripe" />
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <span className="signage text-sm">SafeTrack EPI</span>
          <span className="label">Protótipo de demonstração · dados fictícios</span>
        </div>
      </footer>
    </div>
  );
}
