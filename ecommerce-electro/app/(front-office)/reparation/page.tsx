import type { Metadata } from "next";
import ReparationForm from "./ReparationForm";

export const metadata: Metadata = {
  title: "Demande de réparation | ÉlectroMétropolitain",
  description:
    "Demandez une réparation d'électroménager à Montréal et au Québec. Un technicien vous contacte par texto pour les photos et les prochaines étapes.",
};

export default function ReparationPage() {
  return (
    <div className="bg-surface">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Réparation d&apos;électroménager
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            Demande de réparation
          </h1>
          <p className="mt-4 text-muted-foreground">
            Décrivez le problème. Nous vous textons sous 24 h pour confirmer les
            détails, recevoir les photos et planifier la suite.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <ReparationForm />
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Pourquoi pas de photo ici?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Nous vous contacterons par texto pour recevoir les photos utiles selon
              l&apos;appareil et le symptôme.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Quels appareils?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Réfrigérateurs, laveuses, sécheuses, lave-vaisselle, cuisinières,
              fours et micro-ondes.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Après l&apos;envoi</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Un membre de l&apos;équipe vérifie la demande et poursuit avec vous
              par texto pour le diagnostic, le devis ou le rendez-vous.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
