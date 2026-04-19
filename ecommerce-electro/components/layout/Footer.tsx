import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-primary text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-bold text-lg mb-3">ÉlectroMétropolitain</p>
            <p className="text-sm text-white/75 mb-4 leading-relaxed">
              Votre source de confiance pour des électroménagers de qualité.
              Livraison rapide au Québec.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+1 (514) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@electrometropolitain.ca</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Montréal, Québec</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Boutique</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/75">
              {[
                { href: "/categories/refrigeration", label: "Réfrigération" },
                { href: "/categories/laveuses-secheuses", label: "Laveuses et sécheuses" },
                { href: "/categories/lave-vaisselle", label: "Lave-vaisselle" },
                { href: "/categories/cuisinieres-fours", label: "Cuisinières et fours" },
                { href: "/categories/micro-ondes", label: "Micro-ondes" },
                { href: "/packs", label: "Packs" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Service client</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/75">
              {[
                { href: "/compte/sav", label: "Service après-vente" },
                { href: "/reparation", label: "Demande de réparation" },
                { href: "/compte/commandes", label: "Suivre une commande" },
                { href: "/comparateur", label: "Comparer des produits" },
                { href: "/livraison-retours", label: "Livraison et retours" },
                { href: "/garantie", label: "Garantie" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Mon compte</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/75">
              {[
                { href: "/connexion", label: "Connexion" },
                { href: "/inscription", label: "Inscription" },
                { href: "/compte/profil", label: "Mon profil" },
                { href: "/compte/wishlist", label: "Mes favoris" },
                { href: "/compte/panier", label: "Mon panier" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-white/60">
          <p>© {new Date().getFullYear()} ÉlectroMétropolitain. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/confidentialite" className="hover:text-white/90 transition-colors">Confidentialité</Link>
            <Link href="/conditions" className="hover:text-white/90 transition-colors">Conditions</Link>
            <Link href="/livraison-retours" className="hover:text-white/90 transition-colors">Livraison et retours</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
