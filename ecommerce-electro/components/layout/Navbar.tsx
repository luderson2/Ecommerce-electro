"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/packs", label: "Packs" },
  { href: "/comparateur", label: "Comparer" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight shrink-0">
          ElectroMétropolitain
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
            <Link href="/compte/wishlist">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favoris</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative" asChild>
            <Link href="/compte/panier">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Panier</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <User className="h-5 w-5" />
                <span className="sr-only">Mon compte</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/connexion">Connexion</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/inscription">Inscription</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/compte/profil">Mon profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compte/commandes">Mes commandes</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Burger mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="md:hidden border-t border-white/20 bg-primary">
          <div className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
