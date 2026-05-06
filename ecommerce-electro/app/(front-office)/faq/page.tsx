import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const description =
  "Réponses aux questions fréquentes sur la livraison, les retours, la garantie et le service après-vente d'ÉlectroMétropolitain.";

export const metadata: Metadata = {
  title: "Foire aux questions",
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Foire aux questions | ÉlectroMétropolitain",
    description,
    type: "website",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "FAQ - ÉlectroMétropolitain",
      },
    ],
  },
};

const faqItems = [
  {
    question: "TODO — Question 1 (à remplacer)",
    answer:
      "TODO — Réponse 1 placeholder. Remplacer par le contenu définitif (livraison, délais, frais, etc.).",
  },
  {
    question: "TODO — Question 2 (à remplacer)",
    answer:
      "TODO — Réponse 2 placeholder. Remplacer par le contenu définitif (retours, garantie, échanges, etc.).",
  },
  {
    question: "TODO — Question 3 (à remplacer)",
    answer:
      "TODO — Réponse 3 placeholder. Remplacer par le contenu définitif (paiement, sécurité, support, etc.).",
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Foire aux questions</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>

      <Accordion type="single" collapsible className="mt-8">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
