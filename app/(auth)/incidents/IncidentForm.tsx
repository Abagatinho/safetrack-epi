"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IncidentSeverity } from "@/lib/types";
import { shrinkImage } from "@/lib/image";

const SEVERITIES: { value: IncidentSeverity; label: string; active: string }[] = [
  { value: "minor", label: "Leve", active: "bg-caution border-caution text-graphite" },
  { value: "moderate", label: "Moderado", active: "bg-machine border-machine text-steel" },
  { value: "severe", label: "Grave", active: "bg-danger border-danger text-steel" },
];

export function IncidentForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("minor");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function selectPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    try {
      setPhotoUrl(await shrinkImage(file));
    } catch {
      setPhotoError("Não foi possível ler essa imagem. Tente outro arquivo.");
      setPhotoUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, severity, description, photoUrl }),
    });

    setSaving(false);

    if (!res.ok) {
      const { error } = await res.json();
      setPhotoError(error ?? "Não foi possível registrar o incidente.");
      return;
    }

    setLocation("");
    setDescription("");
    setSeverity("minor");
    setPhotoUrl(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5 max-w-xl">
      <p className="label mb-4">Registrar ocorrência</p>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="label">Local</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field mt-1"
            placeholder="Setor de solda, pátio de logística…"
            required
          />
        </label>

        <fieldset>
          <legend className="label mb-2">Gravidade</legend>
          <div className="flex gap-px">
            {SEVERITIES.map((g) => {
              const checked = severity === g.value;
              return (
                <label
                  key={g.value}
                  className={`label cursor-pointer px-5 py-3 border select-none transition-colors ${
                    checked ? g.active : "bg-steel border-rule text-smoke hover:border-graphite"
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={g.value}
                    checked={checked}
                    onChange={() => setSeverity(g.value)}
                    className="sr-only"
                  />
                  {g.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="label">O que aconteceu</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field mt-1 min-h-24 resize-y"
            placeholder="Descreva o incidente ou quase-acidente"
            required
          />
        </label>

        <div>
          <label className="block">
            <span className="label">Foto do local</span>
            {/* capture= abre a câmera direto no celular, que é onde o técnico está. */}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              onChange={selectPhoto}
              className="field mt-1 file:mr-3 file:border-0 file:bg-graphite file:text-steel file:px-3 file:py-1 file:text-xs file:uppercase file:tracking-wider"
            />
          </label>

          {photoUrl && (
            <div className="mt-3 flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URI local */}
              <img
                src={photoUrl}
                alt="Pré-visualização da foto do incidente"
                className="w-28 h-28 object-cover border border-rule"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="label text-mandatory hover:underline"
              >
                Remover foto
              </button>
            </div>
          )}

          {photoError && <p className="label text-danger mt-2">{photoError}</p>}
        </div>

        <button type="submit" className="button button-heavy mt-2" disabled={saving}>
          {saving ? "Registrando" : "Registrar incidente"}
        </button>
      </div>
    </form>
  );
}
