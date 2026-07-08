"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/epi/entrega", label: "Entrega de EPI" },
  { href: "/checklist", label: "Checklist" },
  { href: "/incidentes", label: "Incidentes" },
];

export function NavLateral() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`whitespace-nowrap text-sm px-3 py-2 border-l-2 transition-colors ${
              ativo
                ? "border-l-cuidado bg-carvao text-aco"
                : "border-l-transparent text-traco hover:bg-carvao hover:text-aco"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
