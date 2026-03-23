import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-primary text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div>
            <p className="font-bold text-lg mb-3">ElectroMétropolitain</p>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              Votre source de confiance pour des électroménagers de qualité. Livraison rapide au Québec.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/70">
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

          {/* Boutique */}
          <div>
            <h3 className="font-semibold mb-3">Boutique</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              {[
                { href: "/catalogue?categorie=refrigeration", label: "Réfrigération" },
                { href: "/catalogue?categorie=laveuses-secheuses", label: "Laveuses & Sécheuses" },
                { href: "/catalogue?categorie=lave-vaisselle", label: "Lave-vaisselle" },
                { href: "/catalogue?categorie=cuisinieres-fours", label: "Cuisinières & Fours" },
                { href: "/catalogue?categorie=micro-ondes", label: "Micro-ondes" },
                { href: "/packs", label: "Packs" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service client */}
          <div>
            <h3 className="font-semibold mb-3">Service client</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
              {[
                { href: "/compte/sav", label: "Service après-vente" },
                { href: "/compte/commandes", label: "Suivre une commande" },
                { href: "/comparateur", label: "Comparer des produits" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h3 className="font-semibold mb-3">Mon compte</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/70">
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

        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-white/50">
          <p>© {new Date().getFullYear()} ElectroMétropolitain. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white/80 transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
