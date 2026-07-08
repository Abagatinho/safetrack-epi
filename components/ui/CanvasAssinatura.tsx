"use client";

import { useEffect, useRef, useState } from "react";

const LARGURA = 480;
const ALTURA = 160;

/**
 * Assinatura de recebimento, desenhada com o dedo no celular ou com o mouse.
 * Pointer events cobrem dedo, caneta e mouse com o mesmo código.
 *
 * Exporta PNG como data URI — o mesmo formato que a API valida.
 */
export function CanvasAssinatura({
  onChange,
}: {
  onChange: (dataUri: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [temTraco, setTemTraco] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Densidade de tela: sem isto o traço sai serrilhado no celular.
    const escala = window.devicePixelRatio || 1;
    canvas.width = LARGURA * escala;
    canvas.height = ALTURA * escala;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(escala, escala);
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    ctx.strokeStyle = "#1b1e23";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function posicao(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * LARGURA,
      y: ((e.clientY - rect.top) / rect.height) * ALTURA,
    };
  }

  function comecar(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    desenhando.current = true;

    const { x, y } = posicao(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = posicao(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!temTraco) setTemTraco(true);
  }

  function terminar() {
    if (!desenhando.current) return;
    desenhando.current = false;

    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function limpar() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    setTemTraco(false);
    onChange(null);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="etiqueta">Assinatura de recebimento</span>
        {temTraco && (
          <button
            type="button"
            onClick={limpar}
            className="etiqueta text-advertencia hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={comecar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerLeave={terminar}
        // touch-none impede o navegador de rolar a página enquanto se assina.
        className="border border-traco bg-aco w-full touch-none cursor-crosshair"
        style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}
        aria-label="Área de assinatura. Desenhe com o dedo ou o mouse."
      />

      {!temTraco && <p className="etiqueta mt-1">Assine acima com o dedo ou o mouse</p>}
    </div>
  );
}
