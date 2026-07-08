"use client";

import { useEffect, useState } from "react";

const DURACAO_MS = 900;

/**
 * Elemento-assinatura: o quadro que toda fábrica tem na parede, com os dígitos
 * trocados à mão. Aqui ele se atualiza sozinho. Conta na carga da página,
 * respeitando prefers-reduced-motion.
 *
 * `animado` é null fora da animação, e então o valor exibido é a prop. Assim o
 * SSR já sai com o número certo, e um `dias` novo (após router.refresh) nunca
 * fica preso num estado inicial obsoleto.
 */
export function QuadroDiasSemAcidente({
  dias,
  tamanho = "grande",
}: {
  dias: number;
  tamanho?: "grande" | "compacto";
}) {
  const [animado, setAnimado] = useState<number | null>(null);
  const exibido = animado ?? dias;

  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido || dias === 0) return;

    let frame = 0;
    let inicio = 0;

    function passo(agora: number) {
      if (!inicio) inicio = agora;

      const t = Math.min((agora - inicio) / DURACAO_MS, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      setAnimado(Math.round(suave * dias));

      if (t < 1) frame = requestAnimationFrame(passo);
      else setAnimado(null); // devolve o controle à prop
    }

    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [dias]);

  // Sempre ao menos duas células, como o quadro físico.
  const digitos = String(exibido).padStart(Math.max(String(dias).length, 2), "0").split("");

  const celula =
    tamanho === "grande"
      ? "w-[4.5rem] h-[6rem] text-[4rem] sm:w-24 sm:h-32 sm:text-[6rem]"
      : "w-12 h-16 text-[2.5rem]";

  return (
    <div className={`quadro parafusos ${tamanho === "grande" ? "p-6 sm:p-8" : "p-4"}`}>
      <p
        className="letreiro text-center text-cuidado mb-4"
        style={{ letterSpacing: "0.18em", fontSize: tamanho === "grande" ? "0.875rem" : "0.6875rem" }}
      >
        Dias sem acidentes
      </p>

      <div className="flex justify-center gap-2" aria-hidden="true">
        {digitos.map((d, i) => (
          <div key={i} className={`digito ${celula}`}>
            {d}
          </div>
        ))}
      </div>

      <p className="sr-only">{dias} dias sem acidentes.</p>

      {tamanho === "grande" && (
        <p className="etiqueta text-neblina text-center mt-4">
          Atualizado a cada registro de incidente
        </p>
      )}
    </div>
  );
}
