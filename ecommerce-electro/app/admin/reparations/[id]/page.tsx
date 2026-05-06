export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  ChevronRight,
  Mail,
  MessageSquare,
  Package,
  Phone,
  StickyNote,
  Wrench,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLong } from "@/lib/utils";
import { REPARATION_BADGE, REPARATION_LABEL } from "@/lib/constants/statuts";
import type { ReparationStatus } from "@/types";
import ReparationStatusForm from "./ReparationStatusForm";

type DemandeReparationDetail = {
  id: string;
  prenom: string | null;
  nom: string;
  telephone: string;
  email: string | null;
  type_appareil: string | null;
  marque: string | null;
  modele: string | null;
  appareil: string;
  description: string;
  disponibilites: string | null;
  statut: ReparationStatus;
  user_agent: string | null;
  notes_admin: string | null;
  created_at: string;
  updated_at: string;
};

const TYPES_LABELS: Record<string, string> = {
  refrigerateur: "Réfrigérateur",
  congelateur: "Congélateur",
  laveuse: "Laveuse",
  secheuse: "Sécheuse",
  "lave-vaisselle": "Lave-vaisselle",
  cuisiniere: "Cuisinière",
  four: "Four",
  "micro-ondes": "Micro-ondes",
  autre: "Autre",
};

export default async function AdminReparationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: demande } = await supabase
    .from("demandes_reparation")
    .select(
      "id, prenom, nom, telephone, email, type_appareil, marque, modele, appareil, description, disponibilites, statut, user_agent, notes_admin, created_at, updated_at"
    )
    .eq("id", id)
    .single<DemandeReparationDetail>();

  if (!demande) notFound();

  const nomComplet = [demande.prenom, demande.nom].filter(Boolean).join(" ") || demande.nom;
  const typeLabel = demande.type_appareil ? TYPES_LABELS[demande.type_appareil] ?? demande.type_appareil : null;

  return (
    <div className="w-full">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin/reparations" className="transition-colors hover:text-foreground">
          Réparations
        </Link>
        <ChevronRight size={14} />
        <span className="max-w-[300px] truncate font-medium text-foreground">
          {demande.appareil}
        </span>
      </nav>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{demande.appareil}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${REPARATION_BADGE[demande.statut]}`}
            >
              {REPARATION_LABEL[demande.statut]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Soumise le {formatDateLong(demande.created_at, true)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {(typeLabel || demande.marque || demande.modele) && (
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Package size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Appareil</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 px-5 py-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{typeLabel ?? "-"}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">Marque</p>
                  <p className="font-medium text-foreground">{demande.marque ?? "-"}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">Modèle</p>
                  <p className="font-medium text-foreground">{demande.modele ?? "-"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <MessageSquare size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Description du problème</h2>
            </div>
            <div className="px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {demande.description}
              </p>
            </div>
          </div>

          {demande.disponibilites && (
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <CalendarClock size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Disponibilités</h2>
              </div>
              <div className="px-5 py-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {demande.disponibilites}
                </p>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <StickyNote size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Notes admin</h2>
            </div>
            <div className="px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {demande.notes_admin || "Aucune note."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Statut de la demande</h2>
            </div>
            <div className="px-5 py-4">
              <ReparationStatusForm
                demandeId={demande.id}
                statutActuel={demande.statut}
                notesActuelles={demande.notes_admin}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Phone size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Contact</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">Nom complet</p>
                <p className="font-medium text-foreground">{nomComplet}</p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">Téléphone</p>
                <a
                  href={`tel:${demande.telephone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {demande.telephone}
                </a>
              </div>
              {demande.email && (
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">Courriel</p>
                  <a
                    href={`mailto:${demande.email}`}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <Mail size={12} />
                    {demande.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Wrench size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Technique</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">Dernière mise à jour</p>
                <p className="font-medium text-foreground">
                  {formatDateLong(demande.updated_at, true)}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">Navigateur</p>
                <p className="break-words text-xs text-muted-foreground">
                  {demande.user_agent || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
