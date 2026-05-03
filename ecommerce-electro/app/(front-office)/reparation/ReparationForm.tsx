"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { soumettreDemandeReparation } from "@/lib/actions/reparation";
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
          <p>On vous texte sous 24 h pour les prochaines étapes.</p>
          {state.id && (
            <p className="font-mono text-xs text-muted-foreground">
              Référence: {state.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre appareil</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px]"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input id="nom" name="nom" required minLength={2} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              placeholder="+1 (514) 123-4567"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appareil">Appareil *</Label>
            <Input
              id="appareil"
              name="appareil"
              placeholder="Réfrigérateur Samsung RF28"
              required
              minLength={2}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du problème *</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Expliquez le symptôme, depuis quand il se produit et tout détail utile."
              required
              minLength={10}
              maxLength={2000}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
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
