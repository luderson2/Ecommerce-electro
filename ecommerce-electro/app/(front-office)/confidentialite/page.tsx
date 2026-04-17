import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de la boutique ÉlectroMétropolitain.",
};

export default function ConfidentialitePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          ÉlectroMétropolitain utilise les informations fournies lors de l&apos;achat pour
          traiter les commandes, organiser la livraison et assurer le service après-vente.
        </p>
        <p>
          Les données de paiement sont traitées par Stripe. Nous ne stockons pas les numéros
          complets de carte bancaire sur nos serveurs.
        </p>
        <p>
          Pour demander une correction ou une suppression de vos informations, contactez
          support@electrometropolitain.ca.
        </p>
      </div>
    </div>
  );
}
