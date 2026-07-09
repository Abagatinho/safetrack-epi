"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 480;
const HEIGHT = 160;

/**
 * Assinatura de recebimento, desenhada com o dedo no celular ou com o mouse.
 * Pointer events cobrem dedo, caneta e mouse com o mesmo código.
 *
 * Exporta PNG como data URI — o mesmo formato que a API valida.
 */
export function SignaturePad({
  onChange,
}: {
  onChange: (dataUri: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Densidade de tela: sem isto o traço sai serrilhado no celular.
    const scale = window.devicePixelRatio || 1;
    canvas.width = WIDTH * scale;
    canvas.height = HEIGHT * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "#1b1e23";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function position(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;

    const { x, y } = position(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = position(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasStroke) setHasStroke(true);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;

    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    setHasStroke(false);
    onChange(null);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="label">Assinatura de recebimento</span>
        {hasStroke && (
          <button
            type="button"
            onClick={clear}
            className="label text-mandatory hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        // touch-none impede o navegador de rolar a página enquanto se assina.
        className="border border-rule bg-steel w-full touch-none cursor-crosshair"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        aria-label="Área de assinatura. Desenhe com o dedo ou o mouse."
      />

      {!hasStroke && <p className="label mt-1">Assine acima com o dedo ou o mouse</p>}
    </div>
  );
}
