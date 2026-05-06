"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { soumettreDemandeReparation } from "@/lib/actions/reparation";
import { TYPES_APPAREILS_LABELS } from "@/lib/validations/reparation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ReparationForm() {
  const [state, formAction, isPending] = useActionState(
    soumettreDemandeReparation,
    null
  );

  if (state?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demande reçue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            On vous texte sous 24 h pour les prochaines étapes (photos, devis,
            rendez-vous).
          </p>
          {state.id && (
            <div className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Numéro de référence
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-foreground">
                {state.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-2 text-xs">
                Conservez ce numéro pour tout suivi avec notre équipe.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre demande</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* Honeypot anti-bot */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px]"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                name="prenom"
                required
                minLength={2}
                maxLength={60}
                disabled={isPending}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                required
                minLength={2}
                maxLength={60}
                disabled={isPending}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="+1 (514) 123-4567"
                required
                disabled={isPending}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Courriel *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                required
                maxLength={160}
                disabled={isPending}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type_appareil">Type d&apos;appareil *</Label>
            <select
              id="type_appareil"
              name="type_appareil"
              required
              disabled={isPending}
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                — Sélectionnez —
              </option>
              {Object.entries(TYPES_APPAREILS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marque">Marque *</Label>
              <Input
                id="marque"
                name="marque"
                required
                minLength={1}
                maxLength={60}
                placeholder="Samsung, LG, Whirlpool…"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modele">Modèle *</Label>
              <Input
                id="modele"
                name="modele"
                required
                minLength={1}
                maxLength={60}
                placeholder="RF28R7351SR"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du problème *</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Expliquez le symptôme, depuis quand il se produit et tout détail utile."
              required
              minLength={10}
              maxLength={2000}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilites">Disponibilités</Label>
            <Textarea
              id="disponibilites"
              name="disponibilites"
              rows={2}
              placeholder="Ex. : en semaine après 17 h, samedi en avant-midi…"
              maxLength={500}
              disabled={isPending}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer la demande
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
