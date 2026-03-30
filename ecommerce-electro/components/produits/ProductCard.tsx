import Image from "next/image";
import Link from "next/link";
import { formatPrix } from "@/lib/utils";

export interface ProduitCarte {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  stock: number;
  product_images: { url: string; sort_order: number }[];
}

export default function ProductCard({ produit }: { produit: ProduitCarte }) {
  const imageUrl = produit.product_images
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

  const epuise = produit.stock === 0;
  const stockFaible = produit.stock > 0 && produit.stock <= 5;

  return (
    <article className="group bg-white rounded-lg border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">

      {/* Image */}
      <Link
        href={`/catalogue/${produit.slug}`}
        className="relative block aspect-square bg-surface overflow-hidden"
        tabIndex={-1}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={produit.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-4xl mb-1">📦</span>
            <span className="text-xs">Pas d&apos;image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {epuise && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
              Épuisé
            </span>
          )}
          {stockFaible && (
            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
              Stock limité
            </span>
          )}
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          {produit.brand}
        </p>

        <Link href={`/catalogue/${produit.slug}`} className="hover:text-primary transition-colors">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {produit.name}
          </p>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-xl font-bold text-accent tabular-nums leading-none">
            {formatPrix(produit.price)}
          </p>
          {!epuise && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1 pb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />
              En stock
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-3">
          {epuise ? (
            <div className="w-full py-2 rounded-md text-sm font-semibold text-center bg-surface text-muted-foreground cursor-not-allowed border border-border">
              Indisponible
            </div>
          ) : (
            <Link
              href={`/catalogue/${produit.slug}`}
              className="block w-full py-2 rounded-md text-sm font-semibold text-center bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Voir le produit
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
