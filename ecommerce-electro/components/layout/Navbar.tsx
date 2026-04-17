"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu, X, ShoppingCart, Heart, User,
  LogOut, Package, Loader2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/packs", label: "Packs" },
    { href: "/comparateur", label: "Comparer" },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setMobileMenuOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(q)}`);
  };

  const displayName = user?.profile 
    ? `${user.profile.first_name} ${user.profile.last_name}` 
    : user?.email?.split("@")[0] || "Utilisateur";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
       
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary font-bold text-sm">
            EA
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            ÉlectroMétropolitain
          </span>
        </Link>

       
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
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

        
        <form onSubmit={handleSearch} className="hidden lg:flex w-64 items-center gap-2" role="search">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un appareil"
              aria-label="Rechercher un électroménager"
              className="h-9 border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/60 focus-visible:ring-white/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          
          {/* Favoris Button with Counter */}
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative" asChild>
            <Link href="/compte/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white border-2 border-primary shadow-sm">
                  {wishlistCount}
                </span>
              )}
              <span className="sr-only">Voir les favoris</span>
            </Link>
          </Button>

          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative" asChild>
            <Link href="/compte/panier">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-primary shadow-sm">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Voir le panier</span>
            </Link>
          </Button>

          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative" aria-label="Ouvrir le menu du compte">
                <User className="h-5 w-5" />
                {user && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-400 border border-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/compte/profil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/compte/commandes" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" /> Mes commandes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/connexion" className="cursor-pointer font-semibold">Connexion</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/inscription" className="cursor-pointer">Inscription</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Burger mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav id="mobile-navigation" className="md:hidden border-t border-white/10 bg-primary shadow-xl" aria-label="Navigation mobile">
          <div className="flex flex-col px-4 py-4 gap-2">
            <form onSubmit={handleSearch} className="mb-3" role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher"
                  aria-label="Rechercher un électroménager"
                  className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-base font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                <Button variant="outline" className="text-primary border-white bg-white hover:bg-white/90" asChild>
                  <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                </Button>
                <Button className="bg-white/20 text-white hover:bg-white/30 border-0" asChild>
                  <Link href="/inscription" onClick={() => setMobileMenuOpen(false)}>S&apos;inscrire</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
