"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * QR escaneável do equipamento. Na demo, o celular do cliente lê direto da tela.
 *
 * Renderizado como data URI num <img>, não via dangerouslySetInnerHTML: o SVG
 * da lib só contém paths, mas um <img> fecha o vetor de injeção de vez.
 */
export function QrCode({ valor, tamanho = 160 }: { valor: string; tamanho?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    QRCode.toDataURL(valor, {
      margin: 1,
      width: tamanho * 2, // 2x para telas retina
      errorCorrectionLevel: "M",
      color: { dark: "#1b1e23", light: "#fafaf9" },
    })
      .then((dataUrl) => {
        if (!cancelado) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelado) setSrc(null);
      });

    return () => {
      cancelado = true;
    };
  }, [valor, tamanho]);

  if (!src) {
    return (
      <div
        className="bg-concreto border border-traco"
        style={{ width: tamanho, height: tamanho }}
        aria-hidden="true"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URI, sem otimização a fazer
    <img
      src={src}
      alt={`QR code do equipamento ${valor}`}
      width={tamanho}
      height={tamanho}
      className="border border-traco block"
    />
  );
}
