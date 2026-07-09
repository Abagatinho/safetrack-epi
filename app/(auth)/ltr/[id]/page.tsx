import Link from "next/link";
import { QrCode } from "@/components/ui/QrCode";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CloseButton } from "./CloseButton";
import { apiFetch } from "@/lib/api";
import type { LtrStatus } from "@/lib/ltr";
import type { ChecklistAnswer, Employee, Ltr, Signature } from "@/lib/types";

const STYLE: Record<LtrStatus, { label: string; className: string }> = {
  issued: { label: "Aberta", className: "bg-safety-soft text-safety" },
  expired: { label: "Expirada sem encerrar", className: "bg-danger-soft text-danger" },
  closed: { label: "Encerrada", className: "bg-concrete text-smoke" },
  cancelled: { label: "Cancelada", className: "bg-concrete text-smoke" },
};

function formatTime(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function answerText(answer: ChecklistAnswer | undefined, unit?: string): string {
  if (!answer) return "—";
  if (answer.type === "verification") {
    return { yes: "Sim", no: "Não", na: "N/A" }[answer.answer];
  }
  if (answer.type === "measurement") return `${answer.value}${unit ?? ""}`;
  return answer.name;
}

function SignatureBlock({ title, signature }: { title: string; signature: Signature }) {
  return (
    <div className="border border-rule p-4">
      <p className="label mb-2">{title}</p>
      {signature.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URI, sem otimização a fazer
        <img
          src={signature.image}
          alt={`Assinatura de ${signature.name}`}
          className="border border-rule bg-steel w-full max-w-[16rem]"
        />
      ) : (
        <div className="border border-rule bg-concrete h-20 max-w-[16rem]" aria-hidden="true" />
      )}
      <p className="text-sm font-medium mt-2">{signature.name}</p>
      <p className="data text-smoke">{formatTime(signature.date)}</p>
    </div>
  );
}

export default async function LtrDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ltrs, employees] = await Promise.all([
    apiFetch<(Ltr & { status: LtrStatus })[]>("/api/ltrs"),
    apiFetch<Employee[]>("/api/employees"),
  ]);

  const ltr = ltrs.find((l) => l.id === id);

  if (!ltr) {
    return (
      <div className="panel p-8 text-center">
        <p className="signage text-lg mb-2">Liberação não encontrada</p>
        <Link href="/ltr" className="button inline-block mt-4">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const { label, className } = STYLE[ltr.status];
  const workers = ltr.workerIds.map(
    (workerId) => employees.find((e) => e.id === workerId)?.name ?? workerId
  );
  const answerFor = (itemId: string) => ltr.answers.find((a) => a.itemId === itemId);

  return (
    <div>
      <div className="print:hidden">
        <Link href="/ltr" className="label text-mandatory hover:underline">
          ← Liberações
        </Link>
      </div>

      <header className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">
            {ltr.templateSnapshot.standard} · {ltr.templateSnapshot.name}
          </p>
          <h1 className="signage text-3xl mt-1">{ltr.workDescription}</h1>
          <p className="data text-smoke mt-2">
            {ltr.location} · emitida {formatTime(ltr.issuedAt)} · válida até{" "}
            {formatTime(ltr.validUntil)}
          </p>
          <span className={`label inline-block px-2 py-1 mt-3 ${className}`}>{label}</span>
        </div>

        <div className="text-center">
          <QrCode value={ltr.qrCodeValue} size={120} />
          <p className="data text-smoke mt-1">{ltr.id}</p>
        </div>
      </header>

      <div className="panel p-5 mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="label">Requisitante</p>
            <p className="text-sm mt-1">{ltr.requester}</p>
          </div>
          <div>
            <p className="label">Emitente</p>
            <p className="text-sm mt-1">{ltr.issuer.name}</p>
          </div>
          <div>
            <p className="label">Executantes</p>
            <p className="text-sm mt-1">{workers.join(", ")}</p>
          </div>
        </div>
      </div>

      <p className="label mb-3">Checklist conferido na emissão</p>
      <div className="panel p-5 mb-6">
        <ul className="border-t border-rule">
          {ltr.templateSnapshot.items.map((item) => {
            const answer = answerFor(item.id);
            const unit = item.type === "measurement" ? item.unit : undefined;
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-2 border-b border-rule last:border-0"
              >
                <span className="text-sm flex-1 min-w-[14rem]">{item.description}</span>
                <span className="data">{answerText(answer, unit)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="label mb-3">
        APR vinculada — {ltr.aprSnapshot.task}
        <span className="text-smoke">
          {" "}
          · aprovada por {ltr.aprSnapshot.approvedBy} em {ltr.aprSnapshot.approvedAt}
        </span>
      </p>
      <div className="panel p-5 mb-6">
        <ol className="border-t border-rule">
          {ltr.aprSnapshot.steps.map((step, i) => (
            <li key={i} className="py-3 border-b border-rule last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  {i + 1}. {step.description}
                </p>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={step.initialRisk} />
                  <span className="label text-smoke">para</span>
                  <RiskBadge risk={step.residualRisk} />
                </div>
              </div>
              <p className="text-sm text-smoke mt-1">Perigo: {step.hazard}</p>
              <ul className="mt-1">
                {step.controls.map((control) => (
                  <li key={control} className="data text-smoke">
                    — {control}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <p className="label mb-3">Assinaturas</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <SignatureBlock title="Emitente" signature={ltr.issuer} />
        {ltr.closure ? (
          <SignatureBlock title="Encerramento" signature={ltr.closure} />
        ) : (
          <div className="border border-rule border-dashed p-4 flex items-center justify-center">
            <p className="label text-smoke">Aguardando encerramento</p>
          </div>
        )}
      </div>

      <div className="print:hidden">
        {ltr.status === "closed" || ltr.status === "cancelled" ? (
          <p className="label text-smoke">
            Documento fechado. A via original deve permanecer arquivada pelo SST.
          </p>
        ) : (
          <CloseButton ltrId={ltr.id} />
        )}
      </div>
    </div>
  );
}
