"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { issuanceBlockers } from "@/lib/ltr";
import type {
  Apr,
  ChecklistAnswer,
  ChecklistTemplate,
  Employee,
  NrTraining,
  PpeDelivery,
  PpeType,
  TrainingRecord,
  VerificationAnswer,
} from "@/lib/types";

const OPTIONS: { value: VerificationAnswer; label: string; active: string }[] = [
  { value: "yes", label: "Sim", active: "bg-safety text-steel border-safety" },
  { value: "no", label: "Não", active: "bg-danger text-steel border-danger" },
  { value: "na", label: "N/A", active: "bg-graphite text-steel border-graphite" },
];

export function IssuanceForm({
  aprs,
  templates,
  employees,
  trainings,
  records,
  deliveries,
  ppeTypes,
}: {
  aprs: Apr[];
  templates: ChecklistTemplate[];
  employees: Employee[];
  trainings: NrTraining[];
  records: TrainingRecord[];
  deliveries: PpeDelivery[];
  ppeTypes: PpeType[];
}) {
  const router = useRouter();

  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [aprId, setAprId] = useState("");
  const [location, setLocation] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [requester, setRequester] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [issuerSignature, setIssuerSignature] = useState<string | null>(null);
  const [workerIds, setWorkerIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = templates.find((t) => t.id === templateId);
  const apr = aprs.find((a) => a.id === aprId);

  function switchTemplate(newId: string) {
    // As respostas pertencem aos itens do modelo anterior. Mantê-las faria o
    // formulário parecer preenchido com dados que não são deste checklist.
    setTemplateId(newId);
    setAnswers({});
  }

  /**
   * Os mesmos gates que o servidor aplica. Aqui servem para o emitente ver o
   * que falta enquanto preenche — a decisão continua sendo do POST.
   */
  const blockers = useMemo(() => {
    if (!template) return [];
    return issuanceBlockers({
      apr,
      template,
      workers: employees.filter((e) => workerIds.includes(e.id)),
      trainings,
      records,
      deliveries,
      ppeTypes,
      answers: Object.values(answers),
      today: new Date(),
    });
  }, [apr, template, employees, workerIds, trainings, records, deliveries, ppeTypes, answers]);

  const fieldsFilled =
    location.trim() && workDescription.trim() && requester.trim() && issuerName.trim();
  const canIssue = blockers.length === 0 && Boolean(fieldsFilled) && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;

    setSaving(true);
    setError(null);

    const response = await fetch("/api/ltrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aprId,
        templateId,
        location,
        workDescription,
        requester,
        issuerName,
        issuerSignature,
        workerIds,
        answers: Object.values(answers),
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(
        body.blockers?.map((b: { message: string }) => b.message).join(" ") ??
          body.error ??
          "Não foi possível emitir a liberação."
      );
      setSaving(false);
      return;
    }

    const created = await response.json();
    router.push(`/ltr/${created.id}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel p-5 mb-6">
        <p className="label mb-4">Trabalho</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Tipo de trabalho</span>
            <select
              value={templateId}
              onChange={(e) => switchTemplate(e.target.value)}
              className="field mt-1"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.standard} — {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">APR aprovada</span>
            <select value={aprId} onChange={(e) => setAprId(e.target.value)} className="field mt-1">
              <option value="">Selecione…</option>
              {aprs
                .filter((a) => a.status === "approved")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.task} — {a.location}
                  </option>
                ))}
            </select>
          </label>

          <label className="block">
            <span className="label">Local</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="field mt-1"
              required
            />
          </label>

          <label className="block">
            <span className="label">Requisitante</span>
            <input
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              className="field mt-1"
              required
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="label">Descrição do trabalho</span>
            <input
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="field mt-1"
              placeholder="O que será executado"
              required
            />
          </label>
        </div>
      </div>

      <div className="panel p-5 mb-6">
        <p className="label mb-1">Executantes</p>
        {template && (
          <p className="data text-smoke mb-4">
            Exige{" "}
            {template.requiredTrainingIds.map((id) => standardOf(id, trainings)).join(", ") ||
              "nenhum treinamento"}
            {" e "}
            {template.requiredPpeIds.map((id) => ppeNameOf(id, ppeTypes)).join(", ") ||
              "nenhum EPI"}
          </p>
        )}

        <ul className="border-t border-rule">
          {employees.map((employee) => (
            <li key={employee.id} className="py-2 border-b border-rule last:border-0">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={workerIds.includes(employee.id)}
                  onChange={(e) =>
                    setWorkerIds((prev) =>
                      e.target.checked
                        ? [...prev, employee.id]
                        : prev.filter((id) => id !== employee.id)
                    )
                  }
                />
                <span className="text-sm">{employee.name}</span>
                <span className="data text-smoke">{employee.jobTitle}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {template && (
        <div className="panel p-5 mb-6">
          <p className="label mb-4">Checklist — {template.name}</p>

          <ul className="border-t border-rule">
            {template.items.map((item) => (
              <li key={item.id} className="py-3 border-b border-rule last:border-0">
                {item.type === "verification" && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm flex-1 min-w-[14rem]">
                      {item.description}
                      {!item.allowsNA && <span className="text-danger" aria-hidden="true"> *</span>}
                    </span>
                    <fieldset className="flex gap-px" aria-label={item.description}>
                      {OPTIONS.filter((o) => o.value !== "na" || item.allowsNA).map((option) => {
                        const current = answers[item.id];
                        const checked =
                          current?.type === "verification" && current.answer === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`label cursor-pointer px-4 py-2 border select-none transition-colors ${
                              checked
                                ? option.active
                                : "bg-steel border-rule text-smoke hover:border-graphite"
                            }`}
                          >
                            <input
                              type="radio"
                              name={item.id}
                              checked={checked}
                              onChange={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    itemId: item.id,
                                    type: "verification",
                                    answer: option.value,
                                  },
                                }))
                              }
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </fieldset>
                  </div>
                )}

                {item.type === "measurement" && (
                  <label className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm flex-1 min-w-[14rem]">
                      {item.description}
                      <span className="data text-smoke block">
                        {item.min !== undefined && `mínimo ${item.min}${item.unit}`}
                        {item.min !== undefined && item.max !== undefined && " · "}
                        {item.max !== undefined && `máximo ${item.max}${item.unit}`}
                      </span>
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      className="field w-32"
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [item.id]: {
                            itemId: item.id,
                            type: "measurement",
                            value: e.target.value === "" ? Number.NaN : Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </label>
                )}

                {item.type === "person" && (
                  <label className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm flex-1 min-w-[14rem]">
                      {item.description}
                      {item.exclusive && (
                        <span className="data text-smoke block">
                          Função exclusiva — não pode ser executante
                        </span>
                      )}
                    </span>
                    <input
                      className="field w-64"
                      placeholder={item.role}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [item.id]: { itemId: item.id, type: "person", name: e.target.value },
                        }))
                      }
                    />
                  </label>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel p-5 mb-6">
        <p className="label mb-4">Emitente</p>
        <label className="block max-w-md mb-4">
          <span className="label">Nome de quem emite</span>
          <input
            value={issuerName}
            onChange={(e) => setIssuerName(e.target.value)}
            className="field mt-1"
            placeholder="Bombeiro ou técnico de segurança"
            required
          />
        </label>
        <div className="max-w-md">
          <SignaturePad onChange={setIssuerSignature} />
        </div>
      </div>

      <div className="panel p-5">
        {blockers.length > 0 ? (
          <>
            <p className="label text-danger mb-3">
              {blockers.length} pendência{blockers.length > 1 ? "s" : ""} impedem a emissão
            </p>
            <ul className="mb-4">
              {blockers.map((blocker, i) => (
                <li key={`${blocker.code}-${i}`} className="text-sm text-danger py-1">
                  — {blocker.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="label text-safety mb-3">
            Todos os requisitos atendidos. A liberação pode ser emitida.
          </p>
        )}

        <button type="submit" className="button button-heavy" disabled={!canIssue}>
          {saving ? "Emitindo" : "Emitir liberação"}
        </button>

        {!canIssue && blockers.length === 0 && !saving && (
          <p className="label text-smoke mt-3">Preencha os dados do trabalho e do emitente.</p>
        )}

        {error && <p className="label text-danger mt-3">{error}</p>}
      </div>
    </form>
  );
}

function standardOf(id: string, trainings: NrTraining[]): string {
  return trainings.find((t) => t.id === id)?.standard ?? id;
}

function ppeNameOf(id: string, ppeTypes: PpeType[]): string {
  return ppeTypes.find((t) => t.id === id)?.name ?? id;
}
