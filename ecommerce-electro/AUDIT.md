# AUDIT.md — Code review ÉlectroMétropolitain

> Review automatisé contre les skills installés (Supabase, Stripe, Next.js App Router, nextjs-supabase-auth, TypeScript, security-review). Faux positifs filtrés après vérification des sources.

**Légende**
- `HIGH` (risque sécurité/prod) · `MED` (qualité/robustesse) · `LOW` (amélioration)
- Chaque finding est auto-suffisant : fichier, ligne, description, fix prêt à appliquer.

---

## Résumé

| ID | Skill | Sev | Fichier | Titre |
|----|-------|-----|---------|-------|
| F1 | supabase | HIGH | *(nouveau)* `supabase/migrations/20260419_get_user_email.sql` | RPC `get_user_email` non définie en migration |
| F2 | stripe | MED | `lib/stripe.ts:3` | Non-null assertion sur `STRIPE_SECRET_KEY` |
| F3 | stripe | MED | `app/api/stripe/webhook/route.ts:22-29` | Pas de déduplication sur `event.id` |
| F4 | supabase | MED | `lib/actions/reparation.ts:109-115` | `changerStatutReparation` bypasse RLS avec admin client |
| F5 | security | MED | `lib/actions/reparation.ts:58-92` | Rate limit IP seul sur endpoint public |
| F6 | typescript | MED | `app/(front-office)/page.tsx:189` | Type `any` dans map produits pack |
| F7 | typescript | MED | `app/(front-office)/packs/page.tsx:50` | Type `any` dans map produits pack |
| F8 | typescript | MED | `app/(front-office)/packs/[slug]/page.tsx:67` | Type `any` dans map produits pack |
| F9 | next-app-router | MED | `lib/actions/auth.ts:17-23` | `seConnecter` sans validation Zod |
| F10 | next-app-router | MED | `lib/actions/auth.ts:49-57` | `sInscrire` sans validation Zod |
| F11 | next-app-router | LOW | *(nouveau)* `app/(client)/compte/checkout/error.tsx` | Route critique sans error boundary |

---

## F1 — supabase — HIGH — RPC `get_user_email` non définie en migration

- **File**: `supabase/migrations/` (aucune migration ne définit cette RPC)
- **Appelée depuis**: `lib/payments/orders.ts:86`, `lib/actions/sav.ts` (~L49)
- **Issue**: RPC déclarée dans `types/database.ts` et utilisée pour récupérer l'email client lors de l'envoi du courriel de confirmation. Si elle existe déjà sur Supabase sans check de rôle, **tout utilisateur authentifié peut énumérer les emails**.
- **Fix** — créer `supabase/migrations/20260419_get_user_email.sql` :
  ```sql
  create or replace function public.get_user_email(user_id uuid)
  returns text
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_caller uuid := auth.uid();
    v_is_admin boolean;
    v_email text;
  begin
    if v_caller is null and current_setting('request.jwt.role', true) <> 'service_role' then
      raise exception 'Non autorise';
    end if;

    select exists (
      select 1 from profiles
      where id = v_caller and role in ('admin', 'employee')
    ) into v_is_admin;

    if v_caller is not null and v_caller <> user_id and not v_is_admin then
      raise exception 'Acces refuse';
    end if;

    select email into v_email from auth.users where id = user_id;
    return v_email;
  end;
  $$;

  revoke all on function public.get_user_email(uuid) from public, anon;
  grant execute on function public.get_user_email(uuid) to authenticated, service_role;
  ```
- **Verification**:
  1. `supabase db dump --schema-only | grep get_user_email` — s'assurer qu'une version non-sécurisée n'existe pas.
  2. Avec un user non-admin : `select get_user_email('<autre-user-id>')` → erreur "Acces refuse".
  3. Avec service role (webhook Stripe) : retourne l'email.

---

## F2 — stripe — MED — Non-null assertion sur `STRIPE_SECRET_KEY`

- **File**: `lib/stripe.ts:3`
- **Issue**: `process.env.STRIPE_SECRET_KEY!` masque l'erreur si la variable est absente. Crash différé difficile à diagnostiquer.
- **Fix**:
  ```diff
  import Stripe from "stripe";

  -export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  +const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  +if (!stripeSecretKey) {
  +  throw new Error("STRIPE_SECRET_KEY n'est pas defini dans les variables d'environnement.");
  +}
  +
  +export const stripe = new Stripe(stripeSecretKey, {
     apiVersion: "2026-02-25.clover",
     typescript: true,
   });
  ```
- **Verification**: `npx tsc --noEmit`. Runtime : lancer avec var vide → erreur claire au démarrage.

---

## F3 — stripe — MED — Pas de déduplication sur `event.id`

- **File**: `app/api/stripe/webhook/route.ts:22-29`
- **Issue**: Stripe redelivery possible (timeout réseau). Protection implicite via `order.status === "payee"` mais incomplète si on ajoute d'autres events, et l'email peut partir 2× si le premier échoue après le update.
- **Fix**:
  1. Migration `supabase/migrations/20260420_stripe_webhook_events.sql` :
     ```sql
     create table if not exists public.stripe_webhook_events (
       event_id text primary key,
       type text not null,
       processed_at timestamptz not null default now()
     );
     alter table public.stripe_webhook_events enable row level security;
     revoke all on public.stripe_webhook_events from anon, authenticated;
     ```
  2. `app/api/stripe/webhook/route.ts` :
     ```diff
     import { NextResponse } from "next/server";
     import { stripe } from "@/lib/stripe";
     import { confirmerCommandePayeeDepuisSession } from "@/lib/payments/orders";
    +import { createAdminClient } from "@/lib/supabase/admin";

     // ... constructEvent inchange

       if (event.type === "checkout.session.completed") {
    +    const supabase = createAdminClient();
    +    const { error: insertError } = await supabase
    +      .from("stripe_webhook_events")
    +      .insert({ event_id: event.id, type: event.type });
    +    if (insertError?.code === "23505") {
    +      return NextResponse.json({ received: true, duplicate: true });
    +    }
    +    if (insertError) {
    +      console.error("[stripe webhook] insert event log failed:", insertError);
    +      return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
    +    }
    +
         try {
           await confirmerCommandePayeeDepuisSession(event.data.object);
         } catch (error) {
           console.error("[stripe webhook] confirmation failed:", error);
    +      await supabase.from("stripe_webhook_events").delete().eq("event_id", event.id);
           return NextResponse.json({ error: "Confirmation impossible." }, { status: 500 });
         }
       }
     ```
- **Verification**: `stripe events resend <event_id>` → second appel `duplicate: true`, pas de double email/stock.

---

## F4 — supabase — MED — `changerStatutReparation` bypasse RLS

- **File**: `lib/actions/reparation.ts:109-115`
- **Issue**: Utilise `createAdminClient()` après `verifierAdmin()`. Defense-in-depth cassée.
- **Fix**:
  ```diff
  export async function changerStatutReparation(id: string, statut: Statut) {
  -  await verifierAdmin();
  -  const supabase = createAdminClient();
  +  const { supabase } = await verifierAdmin();
     const { error } = await supabase
       .from("demandes_reparation")
       .update({ statut })
       .eq("id", id);
  ```
- **Note**: Adapter selon la signature réelle de `verifierAdmin()` (si elle ne retourne pas le client, importer `createClient` de `lib/supabase/server.ts` après le guard).
- **Verification**: `npx tsc --noEmit` + test UI admin.

---

## F5 — security — MED — Rate limit IP seul sur endpoint public

- **File**: `lib/actions/reparation.ts:58-92`
- **Issue**: Endpoint public `soumettreDemandeReparation` avec rate limit IP hash (3/10min) contournable par proxy rotatif.
- **Fix**: Cloudflare Turnstile (gratuit) :
  1. Widget dans `components/reparations/DemandeReparationForm.tsx` — token via hidden input.
  2. `lib/security/captcha.ts` :
     ```ts
     export async function verifierCaptcha(token: string, remoteIp?: string) {
       const secret = process.env.TURNSTILE_SECRET_KEY;
       if (!secret) return false;
       const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
         method: "POST",
         headers: { "Content-Type": "application/x-www-form-urlencoded" },
         body: new URLSearchParams({ secret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
       });
       const data = (await res.json()) as { success?: boolean };
       return data.success === true;
     }
     ```
  3. Dans `soumettreDemandeReparation`, en tête :
     ```ts
     const captchaToken = formData.get("captcha_token");
     if (typeof captchaToken !== "string" || !(await verifierCaptcha(captchaToken))) {
       return { error: "Verification anti-robot echouee." };
     }
     ```
  4. Env : `TURNSTILE_SECRET_KEY` (serveur), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client).
- **Verification**: Soumission sans token → rejet. Token invalide → rejet. Token valide → insert OK.
- **Dépendance externe**: Compte Cloudflare Turnstile requis.

---

## F6 / F7 / F8 — typescript — MED — Types `any` dans pages packs

- **Files**:
  - `app/(front-office)/page.tsx:189`
  - `app/(front-office)/packs/page.tsx:50`
  - `app/(front-office)/packs/[slug]/page.tsx:67`
- **Issue**: `(pp: any)` dans le map des produits de pack. Viole strict mode (CLAUDE.md).
- **Fix** (uniforme pour les 3 fichiers) :
  1. Lire le select Supabase qui alimente le map — typer explicitement.
  2. Remplacer `(pp: any) => ...` par :
     ```ts
     (pp: { products: import("@/types").ProduitCarte | null }) => ...
     ```
     Ou typer la query : `.returns<Array<{ products: ProduitCarte | null }>>()`.
  3. Retirer les `// eslint-disable-next-line @typescript-eslint/no-explicit-any` adjacents.
- **Verification**: `npx tsc --noEmit` + `npm run lint`.

---

## F9 — next-app-router — MED — `seConnecter` sans Zod

- **File**: `lib/actions/auth.ts:17-23`
- **Issue**: Validation minimaliste (non-vide). Pas de format email, pas de longueur max, pas de normalisation.
- **Fix**:
  1. Créer `lib/validations/auth.ts` (si absent) :
     ```ts
     import { z } from "zod";

     export const connexionSchema = z.object({
       email: z.string().trim().toLowerCase().email({ error: "Courriel invalide." }).max(254),
       password: z.string().min(1, { error: "Mot de passe requis." }).max(128),
       next: z.string().optional(),
     });

     export const inscriptionSchema = z.object({
       email: z.string().trim().toLowerCase().email({ error: "Courriel invalide." }).max(254),
       password: z.string().min(8, { error: "Minimum 8 caracteres." }).max(128),
       firstName: z.string().trim().min(1).max(80),
       lastName: z.string().trim().min(1).max(80),
       phone: z.string().trim().regex(/^\+?1?\d{10}$/, { error: "Telephone invalide." }).optional().or(z.literal("")),
     });
     ```
  2. `lib/actions/auth.ts` :
     ```diff
    +import { connexionSchema } from "@/lib/validations/auth";

     export async function seConnecter(...) {
    -  const email = formData.get("email") as string;
    -  const password = formData.get("password") as string;
    -  const next = (formData.get("next") as string) || "";
    -
    -  if (!email || !password) {
    -    return { error: "Veuillez remplir tous les champs." };
    -  }
    +  const parsed = connexionSchema.safeParse({
    +    email: formData.get("email"),
    +    password: formData.get("password"),
    +    next: formData.get("next") ?? "",
    +  });
    +  if (!parsed.success) {
    +    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
    +  }
    +  const { email, password, next } = parsed.data;
     ```
- **Verification**: email `foo` → rejet. `npx tsc --noEmit` passe.

---

## F10 — next-app-router — MED — `sInscrire` sans Zod

- **File**: `lib/actions/auth.ts:49-57`
- **Issue**: Idem F9 + pas de politique mot de passe.
- **Fix**: Réutiliser `inscriptionSchema` défini en F9 :
  ```diff
  +import { inscriptionSchema } from "@/lib/validations/auth";

   export async function sInscrire(...) {
  -  const email = formData.get("email") as string;
  -  const password = formData.get("password") as string;
  -  const firstName = formData.get("firstName") as string;
  -  const lastName = formData.get("lastName") as string;
  -  const phone = formData.get("phone") as string;
  -
  -  if (!email || !password || !firstName || !lastName) {
  -    return { error: "Veuillez remplir tous les champs obligatoires." };
  -  }
  +  const parsed = inscriptionSchema.safeParse({
  +    email: formData.get("email"),
  +    password: formData.get("password"),
  +    firstName: formData.get("firstName"),
  +    lastName: formData.get("lastName"),
  +    phone: formData.get("phone") ?? "",
  +  });
  +  if (!parsed.success) {
  +    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  +  }
  +  const { email, password, firstName, lastName, phone } = parsed.data;
  ```
- **Verification**: password `abc` → "Minimum 8 caracteres.".

---

## F11 — next-app-router — LOW — error.tsx checkout

- **File**: `app/(client)/compte/checkout/error.tsx` *(nouveau)*
- **Issue**: Erreur runtime → page d'erreur globale. UX dégradée sur route critique.
- **Fix**:
  ```tsx
  "use client";

  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { useEffect } from "react";

  export default function CheckoutError({
    error,
    reset,
  }: {
    error: Error & { digest?: string };
    reset: () => void;
  }) {
    useEffect(() => {
      console.error("[checkout error]", error);
    }, [error]);

    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-3 text-muted-foreground">
          Votre paiement n&apos;a pas pu etre finalise. Aucun montant n&apos;a ete preleve.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Reessayer</Button>
          <Button asChild variant="outline">
            <Link href="/compte/panier">Retour au panier</Link>
          </Button>
        </div>
      </div>
    );
  }
  ```

---

## Ordre d'exécution suggéré

1. **F1** (HIGH) — migration `get_user_email`
2. **F2** — `lib/stripe.ts`
3. **F4** — `reparation.ts` admin client
4. **F9 + F10** — schémas Zod (1 nouveau fichier)
5. **F6 + F7 + F8** — typages
6. **F11** — error.tsx checkout
7. **F3** — dédup webhook (nouvelle table + tests Stripe CLI)
8. **F5** — CAPTCHA (compte Turnstile externe)

## Faux positifs écartés (pour référence)

- Currency `"cad"` (lib/payments/orders.ts:215) — Stripe renvoie toujours lowercase ISO 4217.
- `demandes_reparation` sans policies — `REVOKE ALL ... FROM anon, authenticated` = lockdown intentionnel.
- Home sans JSON-LD Store — `LocalBusiness` est présent (page.tsx:39-60).
- STRIPE_WEBHOOK_SECRET non validé — déjà ligne 9-11 du webhook.
- CSRF Server Actions — Next.js 16 vérifie same-origin automatiquement.
- Redirect `safeNext` — `startsWith("/") && !startsWith("//")` suffit pour `redirect()`.

## Validation finale

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```
