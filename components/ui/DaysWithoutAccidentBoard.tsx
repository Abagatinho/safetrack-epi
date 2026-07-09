"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 900;

/**
 * Elemento-assinatura: o quadro que toda fábrica tem na parede, com os dígitos
 * trocados à mão. Aqui ele se atualiza sozinho. Conta na carga da página,
 * respeitando prefers-reduced-motion.
 *
 * `animated` é null fora da animação, e então o valor exibido é a prop. Assim o
 * SSR já sai com o número certo, e um `days` novo (após router.refresh) nunca
 * fica preso num estado inicial obsoleto.
 */
export function DaysWithoutAccidentBoard({
  days,
  size = "large",
}: {
  days: number;
  size?: "large" | "compact";
}) {
  const [animated, setAnimated] = useState<number | null>(null);
  const shown = animated ?? days;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || days === 0) return;

    let frame = 0;
    let start = 0;

    function step(now: number) {
      if (!start) start = now;

      const t = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(eased * days));

      if (t < 1) frame = requestAnimationFrame(step);
      else setAnimated(null); // devolve o controle à prop
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [days]);

  // Sempre ao menos duas células, como o quadro físico.
  const digits = String(shown).padStart(Math.max(String(days).length, 2), "0").split("");

  const cell =
    size === "large"
      ? "w-[4.5rem] h-[6rem] text-[4rem] sm:w-24 sm:h-32 sm:text-[6rem]"
      : "w-12 h-16 text-[2.5rem]";

  return (
    <div className={`board screws ${size === "large" ? "p-6 sm:p-8" : "p-4"}`}>
      <p
        className="signage text-center text-caution mb-4"
        style={{ letterSpacing: "0.18em", fontSize: size === "large" ? "0.875rem" : "0.6875rem" }}
      >
        Dias sem acidentes
      </p>

      <div className="flex justify-center gap-2" aria-hidden="true">
        {digits.map((d, i) => (
          <div key={i} className={`digit ${cell}`}>
            {d}
          </div>
        ))}
      </div>

      <p className="sr-only">{days} dias sem acidentes.</p>

      {size === "large" && (
        <p className="label text-mist text-center mt-4">
          Atualizado a cada registro de incidente
        </p>
      )}
    </div>
  );
}
