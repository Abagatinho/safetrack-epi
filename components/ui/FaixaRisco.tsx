import Link from "next/link";

/**
 * Faixa de sinalização hachurada. Não é ornamento: só é renderizada quando
 * existe risco ativo. Ausente, comunica tanto quanto presente.
 */
export function FaixaRisco({
  quantidade,
  href,
}: {
  quantidade: number;
  href?: string;
}) {
  if (quantidade === 0) return null;

  const texto =
    quantidade === 1
      ? "1 EPI vencido aguardando troca"
      : `${quantidade} EPIs vencidos aguardando troca`;

  const conteudo = (
    <>
      <span className="pictograma bg-perigo" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-aco">
          <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
        </svg>
      </span>
      <span className="letreiro text-sm tracking-wide">{texto}</span>
      {href && <span className="etiqueta text-neblina ml-auto">Ver lista →</span>}
    </>
  );

  return (
    <div role="alert" className="mb-6">
      <div className="faixa-risco" />
      <div className="chassi flex items-center gap-3 px-4 py-3">
        {href ? (
          <Link href={href} className="flex items-center gap-3 w-full">
            {conteudo}
          </Link>
        ) : (
          conteudo
        )}
      </div>
      <div className="faixa-risco" />
    </div>
  );
}
