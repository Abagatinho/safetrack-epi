"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Colaboradores" },
  { href: "/ppe/delivery", label: "Entrega de EPI" },
  { href: "/ppe/catalog", label: "Catálogo de EPI" },
  { href: "/trainings", label: "Treinamentos" },
  { href: "/apr", label: "APR" },
  { href: "/ltr", label: "LTR" },
  { href: "/checklist", label: "Checklist" },
  { href: "/incidents", label: "Incidentes" },
  { href: "/report", label: "Relatório" },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap text-sm px-3 py-2 border-l-2 transition-colors ${
              active
                ? "border-l-caution bg-charcoal text-steel"
                : "border-l-transparent text-rule hover:bg-charcoal hover:text-steel"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
