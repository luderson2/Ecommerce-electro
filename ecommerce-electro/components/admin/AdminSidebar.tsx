"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Percent,
  ShoppingCart,
  Truck,
  Headphones,
  Users,
  ExternalLink,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Général",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/produits", label: "Produits", icon: Package },
      { href: "/admin/categories", label: "Catégories", icon: FolderTree },
      { href: "/admin/packs", label: "Packs", icon: Layers },
      { href: "/admin/rabais", label: "Rabais", icon: Percent },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
      { href: "/admin/livraisons", label: "Livraisons", icon: Truck },
      { href: "/admin/sav", label: "SAV", icon: Headphones },
    ],
  },
  {
    label: "Utilisateurs",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Users },
    ],
  },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground"
      )}
    >
      <item.icon
        size={16}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{item.label}</span>
      {isActive && (
        <ChevronRight size={14} className="ml-auto shrink-0 text-primary/60" />
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-white flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">E</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">ÉlectroMétropolitain</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Administration</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-all group"
        >
          <ExternalLink size={16} className="shrink-0" />
          <span>Voir la boutique</span>
        </Link>
      </div>
    </aside>
  );
}
