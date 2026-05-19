"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  disabled?: boolean;
};

export default function ProductActions({ product, disabled = false }: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inCart = isInCart(product.id);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/connexion?next=/compte/panier");
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      await addToCart(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ajout au panier impossible.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
        disabled={disabled || isAdding}
        onClick={handleAddToCart}
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {inCart ? "Dans le panier" : "Ajouter au panier"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
