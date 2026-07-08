import Link from "next/link";
import { NavLateral } from "./NavLateral";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <aside className="chassi lg:w-60 lg:shrink-0 flex flex-col">
        <div className="p-4 lg:p-5 border-b border-carvao">
          <Link href="/" className="letreiro text-base">
            SafeTrack EPI
          </Link>
          <p className="etiqueta text-neblina mt-1">Painel de controle</p>
        </div>

        <div className="p-2 lg:p-3 flex-1">
          <NavLateral />
        </div>

        <div className="hidden lg:block">
          <div className="faixa-risco" />
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
