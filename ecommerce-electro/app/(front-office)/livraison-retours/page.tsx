import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description: "Informations sur la livraison et les retours chez ÉlectroMétropolitain.",
};

export default function LivraisonRetoursPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Livraison et retours</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          La livraison standard est offerte sur les commandes admissibles de 500 $ et plus.
          Des options express ou planifiées peuvent être proposées à la caisse.
        </p>
        <p>
          Les retours et échanges sont évalués selon l&apos;état du produit, le délai depuis la
          livraison et la garantie applicable.
        </p>
        <p>
          Pour une demande liée à une commande, utilisez la section service après-vente de
          votre compte.
        </p>
      </div>
    </div>
  );
}
