"use client";

import { useActionState } from "react";
import { soumettreDemandeSAV } from "@/lib/actions/sav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatPrix } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type CommandeSimple = {
  id: string;
  created_at: string;
  total_amount: number;
};

export default function SavForm({ commandes }: { commandes: CommandeSimple[] }) {
  const [state, formAction, isPending] = useActionState(soumettreDemandeSAV, null);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {/* Commande concernée (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="order_id">
              Commande concernée{" "}
              <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <select
              id="order_id"
              name="order_id"
              defaultValue=""
              disabled={isPending}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
            >
              <option value="">Aucune commande</option>
              {commandes.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id.slice(0, 8).toUpperCase()} &mdash; {formatDate(c.created_at)} &mdash;{" "}
                  {formatPrix(c.total_amount)}
                </option>
              ))}
            </select>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Ex : Produit défectueux, retour, remboursement…"
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez votre problème en détail…"
              rows={6}
              required
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Minimum 10 caractères.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" disabled={isPending} onClick={() => history.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Soumettre la demande
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
