import Link from "next/link";
import { SideNav } from "./SideNav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <aside className="chassis lg:w-60 lg:shrink-0 flex flex-col">
        <div className="p-4 lg:p-5 border-b border-charcoal">
          <Link href="/" className="signage text-base">
            SafeTrack EPI
          </Link>
          <p className="label text-mist mt-1">Painel de controle</p>
        </div>

        <div className="p-2 lg:p-3 flex-1">
          <SideNav />
        </div>

        <div className="hidden lg:block">
          <div className="risk-stripe" />
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
