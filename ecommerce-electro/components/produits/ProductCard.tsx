'use client'

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, GitCompareArrows, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrix } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

export interface ProduitCarte {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  stock: number;
  product_images: { url: string; sort_order: number }[];
}

interface ProductCardProps {
  produit: ProduitCarte;
  onCompareToggle?: (productId: string) => void;
  isInCompare?: boolean;
}

export default function ProductCard({ 
  produit, 
  onCompareToggle, 
  isInCompare = false 
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInCart, isInWishlist } = useCart();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const imageUrl = produit.product_images
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

  const epuise = produit.stock === 0;
  const stockFaible = produit.stock > 0 && produit.stock <= 5;
  const inWishlist = isInWishlist(produit.id);
  const inCart = isInCart(produit.id);

  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/connexion');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        id: produit.id,
        name: produit.name,
        price: produit.price,
        image: imageUrl || '',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Gérer l'ajout/retrait des favoris
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/connexion');
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(produit.id);
      } else {
        await addToWishlist({
          id: produit.id,
          name: produit.name,
          price: produit.price,
          image: imageUrl || '',
          slug: produit.slug,
        });
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <article className="group bg-white rounded-lg border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      
     
      <div className="relative aspect-square bg-surface overflow-hidden">
        <Link href={`/catalogue/${produit.slug}`} className="block h-full w-full" tabIndex={-1}>
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
        </Link>

        
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {epuise && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Épuisé
            </span>
          )}
          {stockFaible && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Stock limité
            </span>
          )}
        </div>

        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="icon"
            variant={inWishlist ? "default" : "secondary"}
            className={`h-8 w-8 rounded-full shadow-md ${inWishlist ? 'bg-primary text-white' : 'bg-white text-foreground'}`}
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            )}
          </Button>
          
          <Button
            size="icon"
            variant={isInCompare ? "default" : "secondary"}
            className={`h-8 w-8 rounded-full shadow-md ${isInCompare ? 'bg-primary text-white' : 'bg-white text-foreground'}`}
            onClick={(e) => {
              e.preventDefault();
              onCompareToggle?.(produit.id);
            }}
          >
            <GitCompareArrows className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {produit.brand}
        </p>

        <Link href={`/catalogue/${produit.slug}`} className="hover:text-primary transition-colors flex-1">
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">
            {produit.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-accent tabular-nums">
            {formatPrix(produit.price)}
          </p>
          {!epuise && (
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              En stock
            </span>
          )}
        </div>

       
        <div className="mt-4">
          <Button
            className="w-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={epuise || isAddingToCart}
            variant={inCart ? "secondary" : "default"}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {inCart ? 'Dans le panier' : 'Ajouter au panier'}
          </Button>
        </div>
      </div>
    </article>
  );
}