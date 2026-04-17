import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrix(montant: number, devise = "CAD"): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: devise,
    minimumFractionDigits: 2,
  }).format(montant);
}

export function calculerEconomie(
  prixOriginal: number,
  prixPromo: number
): { montant: number; pourcentage: number } {
  const montant = prixOriginal - prixPromo;
  const pourcentage = Math.round((montant / prixOriginal) * 100);
  return { montant, pourcentage };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string, withTime = false): string {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function slugify(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
