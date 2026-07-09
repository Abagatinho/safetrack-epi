import Link from "next/link";

/**
 * Faixa de sinalização hachurada. Não é ornamento: só é renderizada quando
 * existe risco ativo. Ausente, comunica tanto quanto presente.
 *
 * O texto padrão fala de EPI vencido; `text` cobre os outros riscos
 * (treinamento vencido, por exemplo) sem duplicar o markup da faixa.
 */
export function RiskStripe({
  count,
  href,
  text,
}: {
  count: number;
  href?: string;
  text?: (count: number) => string;
}) {
  if (count === 0) return null;

  const defaultText = (n: number) =>
    n === 1 ? "1 EPI vencido aguardando troca" : `${n} EPIs vencidos aguardando troca`;

  const content = (
    <>
      <span className="pictogram bg-danger" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-steel">
          <path d="M8 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          <circle cx="8" cy="11.6" r="1.1" fill="currentColor" />
        </svg>
      </span>
      <span className="signage text-sm tracking-wide">{(text ?? defaultText)(count)}</span>
      {href && <span className="label text-mist ml-auto">Ver lista →</span>}
    </>
  );

  return (
    <div role="alert" className="mb-6">
      <div className="risk-stripe" />
      <div className="chassis flex items-center gap-3 px-4 py-3">
        {href ? (
          <Link href={href} className="flex items-center gap-3 w-full">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
      <div className="risk-stripe" />
    </div>
  );
}
