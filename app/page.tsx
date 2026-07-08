import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4">SafeTrack EPI</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Gestão inteligente de EPI e segurança do trabalho. Controle de validade,
        checklists de segurança e registro de incidentes num só lugar — sem papel.
      </p>
      <Link href="/dashboard" className="bg-black text-white rounded px-5 py-3 text-sm">
        Ver demonstração
      </Link>
    </div>
  );
}
