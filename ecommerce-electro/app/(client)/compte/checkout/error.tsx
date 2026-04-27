"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[checkout error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="mt-3 text-muted-foreground">
        Votre paiement n&apos;a pas pu être finalisé. Aucun montant n&apos;a été prélevé.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/compte/panier">Retour au panier</Link>
        </Button>
      </div>
    </div>
  );
}
