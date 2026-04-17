"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

type PackProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
};

export default function PackActions({ products }: { products: PackProduct[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const availableProducts = products.filter((product) => product.stock > 0);
  const disabled = availableProducts.length === 0 || isAdding;

  const handleAddPack = async () => {
    if (!user) {
      router.push("/connexion?next=/compte/panier");
      return;
    }

    setIsAdding(true);
    setMessage(null);
    try {
      for (const product of availableProducts) {
        await addToCart(product);
      }
      setMessage("Les produits disponibles du pack ont été ajoutés au panier.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ajout du pack impossible.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full bg-accent hover:bg-accent/90 text-white"
        size="lg"
        disabled={disabled}
        onClick={handleAddPack}
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        Ajouter le pack au panier
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
