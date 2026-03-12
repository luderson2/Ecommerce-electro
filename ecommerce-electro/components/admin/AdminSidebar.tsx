"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/livraisons", label: "Livraisons" },
  { href: "/admin/packs", label: "Packs" },
  { href: "/admin/rabais", label: "Rabais" },
  { href: "/admin/sav", label: "SAV" },
  { href: "/admin/clients", label: "Clients" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="p-4">
        <p className="mb-4 text-xs font-semibold uppercase text-muted tracking-wider">
          Administration
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-surface"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
