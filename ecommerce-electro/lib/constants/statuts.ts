import type { OrderStatus, DeliveryStatus, SavStatus } from "@/types";

// â”€â”€â”€ Commandes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const ORDER_STATUTS: { value: OrderStatus | "tous"; label: string }[] = [
  { value: "tous",          label: "Toutes" },
  { value: "en_attente",    label: "En attente" },
  { value: "payee",         label: "Payée" },
  { value: "en_preparation",label: "En préparation" },
  { value: "livraison",     label: "En livraison" },
  { value: "livree",        label: "Livrée" },
  { value: "annulee",       label: "Annulée" },
];

export const ORDER_BADGE: Record<OrderStatus, string> = {
  en_attente:    "bg-neutral-100 text-neutral-800",
  payee:         "bg-burgundy-100 text-burgundy-800",
  en_preparation:"bg-burgundy-50 text-burgundy-800",
  livraison:     "bg-burgundy-100 text-burgundy-800",
  livree:        "bg-green-100 text-green-800",
  annulee:       "bg-red-100 text-red-800",
};

export const ORDER_LABEL: Record<OrderStatus, string> = {
  en_attente:    "En attente",
  payee:         "Payée",
  en_preparation:"En préparation",
  livraison:     "En livraison",
  livree:        "Livrée",
  annulee:       "Annulée",
};

// â”€â”€â”€ Livraisons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const DELIVERY_STATUTS: { value: DeliveryStatus | "tous"; label: string }[] = [
  { value: "tous",       label: "Toutes" },
  { value: "planifiee",  label: "Planifiées" },
  { value: "en_transit", label: "En transit" },
  { value: "livree",     label: "Livrées" },
  { value: "echec",      label: "Échec" },
];

export const DELIVERY_BADGE: Record<DeliveryStatus, string> = {
  planifiee:  "bg-burgundy-100 text-burgundy-800",
  en_transit: "bg-burgundy-50 text-burgundy-800",
  livree:     "bg-green-100 text-green-800",
  echec:      "bg-red-100 text-red-800",
};

export const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  planifiee:  "Planifiée",
  en_transit: "En transit",
  livree:     "Livrée",
  echec:      "Échec",
};

// â”€â”€â”€ SAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const SAV_STATUTS: { value: SavStatus | "tous"; label: string }[] = [
  { value: "tous",     label: "Toutes" },
  { value: "ouvert",   label: "Ouvertes" },
  { value: "en_cours", label: "En cours" },
  { value: "resolu",   label: "Résolues" },
  { value: "ferme",    label: "Fermées" },
];

export const SAV_BADGE: Record<SavStatus, string> = {
  ouvert:   "bg-neutral-100 text-neutral-800",
  en_cours: "bg-burgundy-100 text-burgundy-800",
  resolu:   "bg-green-100 text-green-800",
  ferme:    "bg-gray-100 text-gray-600",
};

export const SAV_LABEL: Record<SavStatus, string> = {
  ouvert:   "Ouvert",
  en_cours: "En cours",
  resolu:   "Résolu",
  ferme:    "Fermé",
};

type ReparationStatus = "nouveau" | "contacte" | "en_cours" | "termine" | "annule";

export const REPARATION_STATUTS: { value: ReparationStatus | "tous"; label: string }[] = [
  { value: "tous",     label: "Toutes" },
  { value: "nouveau",  label: "Nouvelles" },
  { value: "contacte", label: "Contactées" },
  { value: "en_cours", label: "En cours" },
  { value: "termine",  label: "Terminées" },
  { value: "annule",   label: "Annulées" },
];

export const REPARATION_BADGE: Record<ReparationStatus, string> = {
  nouveau:  "bg-neutral-100 text-neutral-800",
  contacte: "bg-burgundy-100 text-burgundy-800",
  en_cours: "bg-burgundy-50 text-burgundy-800",
  termine:  "bg-green-100 text-green-800",
  annule:   "bg-gray-100 text-gray-600",
};

export const REPARATION_LABEL: Record<ReparationStatus, string> = {
  nouveau:  "Nouveau",
  contacte: "Contacté",
  en_cours: "En cours",
  termine:  "Terminé",
  annule:   "Annulé",
};
