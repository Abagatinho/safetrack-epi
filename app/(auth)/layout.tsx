import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/epi/entrega", label: "Entrega de EPI" },
  { href: "/checklist", label: "Checklist" },
  { href: "/incidentes", label: "Incidentes" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 p-4">
        <p className="font-semibold mb-6">SafeTrack EPI</p>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded px-2 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
