"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * QR escaneável do equipamento. Na demo, o celular do cliente lê direto da tela.
 *
 * Renderizado como data URI num <img>, não via dangerouslySetInnerHTML: o SVG
 * da lib só contém paths, mas um <img> fecha o vetor de injeção de vez.
 */
export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, {
      margin: 1,
      width: size * 2, // 2x para telas retina
      errorCorrectionLevel: "M",
      color: { dark: "#1b1e23", light: "#fafaf9" },
    })
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className="bg-concrete border border-rule"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URI, sem otimização a fazer
    <img
      src={src}
      alt={`QR code do equipamento ${value}`}
      width={size}
      height={size}
      className="border border-rule block"
    />
  );
}
