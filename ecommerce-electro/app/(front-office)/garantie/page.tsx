import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantie",
  description: "Informations de garantie pour les électroménagers ÉlectroMétropolitain.",
};

export default function GarantiePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Garantie</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Les électroménagers vendus par ÉlectroMétropolitain peuvent être couverts par une
          garantie fabricant ou une garantie de service indiquée au moment de l&apos;achat.
        </p>
        <p>
          Conservez votre confirmation de commande pour faciliter toute demande de service.
        </p>
        <p>
          Notre équipe peut vous accompagner pour ouvrir une demande de service après-vente.
        </p>
      </div>
    </div>
  );
}
