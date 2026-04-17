import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation de la boutique ÉlectroMétropolitain.",
};

export default function ConditionsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Conditions d&apos;utilisation</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Ces conditions présentent les règles générales d&apos;utilisation de la boutique
          ÉlectroMétropolitain.
        </p>
        <p>
          Les prix, disponibilités et délais de livraison peuvent varier selon les stocks et
          la zone de livraison. Une commande est confirmée après validation du paiement.
        </p>
        <p>
          Pour toute question, contactez le service client à support@electrometropolitain.ca.
        </p>
      </div>
    </div>
  );
}
