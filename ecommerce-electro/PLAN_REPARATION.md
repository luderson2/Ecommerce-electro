# Plan — Formulaire de demande de réparation (MVP)

## Statut — TERMINÉ (2026-04-18)

**Code projet:** livré
- `supabase/migrations/20260418_demandes_reparation.sql`
- `lib/validations/reparation.ts`, `lib/sms/twilio.ts`, `lib/actions/reparation.ts`
- `app/(front-office)/reparation/{page.tsx, ReparationForm.tsx}`
- `app/admin/reparations/{page.tsx, [id]/page.tsx, [id]/ReparationStatusForm.tsx}`
- `types/database.ts` (table `demandes_reparation` ajoutée)
- `lib/constants/statuts.ts` (REPARATION_STATUTS / BADGE / LABEL)
- `components/layout/Footer.tsx` (lien `/reparation`)
- `.env.local.example` + `package.json` (twilio ^5.13.1)

**Base Supabase (projet `ElectroMetropolitain` / `qvqzcudgcvzeixtqktzx`):** migration appliquée
- Table `demandes_reparation` créée (11 colonnes)
- RLS activé, `anon` et `authenticated` révoqués — seul `service_role` écrit/lit
- Trigger `trg_demandes_reparation_updated_at` actif
- 3 index (PK + statut/created_at + ip_hash/created_at)

**Reste à faire avant déploiement:**
- Renseigner les vraies valeurs dans `.env.local`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `OWNER_PHONE`
- Test manuel end-to-end (soumission publique → SMS reçu → vue admin)
- `npm run lint` + `npx tsc --noEmit` + `npm run build` verts

## Contexte

ÉlectroMétropolitain veut offrir un canal simple pour que clients et prospects demandent une réparation, sans friction de création de compte, sans upload d'images (photos envoyées ensuite par texto). Besoin: formulaire public minimaliste → persistance Supabase pour historique → notification SMS instantanée au propriétaire via Twilio. La suite (photos, devis, RDV) se fait hors-système par échange texto.

Décisions validées:
- Accès **public** (pas de connexion requise) → anti-spam via honeypot + rate-limit IP
- SMS via **Twilio**
- Page **admin** incluse pour consulter l'historique
- Entrée sur une **page dédiée `/reparation`** + lien Footer

## 1. Base de données

### Nouvelle table: `demandes_reparation`

Migration: `supabase/migrations/20260418_demandes_reparation.sql`

```sql
create table if not exists public.demandes_reparation (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(trim(nom)) between 2 and 100),
  telephone text not null check (telephone ~ '^\+?1?\d{10}$'),
  appareil text not null check (char_length(trim(appareil)) between 2 and 120),
  description text not null check (char_length(trim(description)) between 10 and 2000),
  statut text not null default 'nouveau'
    check (statut in ('nouveau', 'contacte', 'en_cours', 'termine', 'annule')),
  ip_hash text,           -- hash SHA-256 pour rate-limit sans stocker l'IP en clair
  user_agent text,
  notes_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index demandes_reparation_statut_created_idx
  on public.demandes_reparation (statut, created_at desc);
create index demandes_reparation_ip_hash_recent_idx
  on public.demandes_reparation (ip_hash, created_at desc);

alter table public.demandes_reparation enable row level security;

-- Écriture publique bloquée via RLS: les insertions passent UNIQUEMENT
-- par la Server Action qui utilise le client admin (service_role).
-- Lecture/mise à jour: admin uniquement (vérifiée côté action).
revoke all on public.demandes_reparation from anon, authenticated;

-- Trigger updated_at
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_demandes_reparation_updated_at
  before update on public.demandes_reparation
  for each row execute function public.tg_touch_updated_at();
```

### Types

Mettre à jour `types/database.ts` → ajouter `demandes_reparation` dans `Database.public.Tables` (Row, Insert, Update) en suivant le shape exact de `service_requests`.

## 2. Backend — Server Action

### Fichier: `lib/actions/reparation.ts`

Deux fonctions exportées:

**`soumettreDemandeReparation(prevState, formData)`** — signature `useActionState`
1. **Honeypot check**: champ caché `website` — s'il est rempli → retour `{ success: true }` silencieux (trompe les bots sans les informer).
2. **Validation Zod** (voir §3). Sur échec: `{ error: parsed.error.issues[0].message }`.
3. **Rate-limit**: lire l'en-tête `x-forwarded-for` via `headers()` (Next), hash SHA-256 avec `crypto`. Query `demandes_reparation` via client **admin** (service_role) pour compter les insertions de ce hash dans les 10 dernières minutes. Si ≥ 3 → `{ error: "Trop de demandes récentes, réessayez plus tard." }`.
4. **Insert** via client admin (RLS bloque anon/authenticated):
   ```ts
   const { data, error } = await supabaseAdmin
     .from("demandes_reparation")
     .insert({ nom, telephone, appareil, description, ip_hash, user_agent })
     .select("id")
     .single();
   ```
5. **SMS Twilio** dans un `try/catch` **non-bloquant** (l'utilisateur ne doit pas voir un échec si la demande est bien sauvegardée):
   ```ts
   try {
     await envoyerSmsProprio({ nom, telephone, appareil, description });
   } catch (e) {
     console.error("[reparation] échec SMS Twilio:", e);
     // Optionnel: await supabase.from('demandes_reparation').update({ notes_admin: 'SMS non envoyé' })
   }
   ```
6. Retour `{ success: true, id: data.id }`.

**`changerStatutReparation(id, statut)`** — action admin
- Utilise `verifierAdmin()` de `lib/actions/_guard.ts`.
- Update statut + `notes_admin` optionnel. `revalidatePath("/admin/reparations")`.

### Fichier: `lib/sms/twilio.ts`

Utilitaire léger, **serveur uniquement** (`import "server-only"`):

```ts
import "server-only";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function envoyerSmsProprio(params: {
  nom: string; telephone: string; appareil: string; description: string;
}) {
  const { nom, telephone, appareil, description } = params;
  const body =
    `Nouvelle demande de réparation\n` +
    `De: ${nom} (${telephone})\n` +
    `Appareil: ${appareil}\n` +
    `Description: ${description.slice(0, 400)}`;
  return client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to: process.env.OWNER_PHONE!,
    body,
  });
}
```

### Variables d'environnement (`.env.local` + `.env.local.example`)

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
OWNER_PHONE=+1XXXXXXXXXX
```

Installer: `npm install twilio`.

## 3. Validation — `lib/validations/reparation.ts`

Zod v4 (syntaxe `error:` selon CLAUDE.md):

```ts
import { z } from "zod";

const telephoneCA = z
  .string()
  .transform((v) => v.replace(/[\s().+-]/g, ""))
  .pipe(z.string().regex(/^1?\d{10}$/, { error: "Numéro de téléphone canadien invalide (10 chiffres)" }));

export const demandeReparationSchema = z.object({
  nom: z.string({ error: "Nom requis" }).trim().min(2).max(100),
  telephone: telephoneCA,
  appareil: z.string({ error: "Appareil requis" }).trim().min(2).max(120),
  description: z.string({ error: "Description requise" }).trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot: doit rester vide
});

export type DemandeReparationInput = z.infer<typeof demandeReparationSchema>;
```

## 4. Frontend

### Page publique: `app/(front-office)/reparation/page.tsx`

- Server Component, wrapper `<Navbar />` + `<main>` + `<Footer />`.
- `metadata`: title "Demande de réparation | ÉlectroMétropolitain", description orientée SEO.
- Contient `<ReparationForm />` (client) dans un `<Card>` centré.
- Ajout d'une courte section FAQ statique ("Pourquoi pas de photo ici?" → "Nous vous contacterons par texto pour les photos") → crédibilité + contenu SEO.

### Formulaire client: `app/(front-office)/reparation/ReparationForm.tsx`

```tsx
"use client";
const [state, action, isPending] = useActionState(soumettreDemandeReparation, null);
```

Champs:
- `nom` — `<Input>`, required, minLength=2
- `telephone` — `<Input type="tel">`, placeholder `+1 (514) 123-4567`, `pattern` basique
- `appareil` — `<Input>`, exemple "Réfrigérateur Samsung RF28"
- `description` — `<Textarea rows={6}>`
- `website` — **honeypot** `<input type="text" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]">` (caché aux humains, rempli par bots)
- Submit `<Button disabled={isPending}>` avec `<Loader2>` si pending

États rendus:
- Erreur: box rouge `state?.error`
- Succès: remplacer le formulaire par un `<Card>` de confirmation "Demande reçue — on vous texte sous 24 h."

Respect de la règle anti-boucle infinie (CLAUDE.md): si on instancie un client Supabase ici (pas nécessaire puisque tout passe par l'action serveur), utiliser `useMemo`.

### Lien Footer

Éditer `components/layout/Footer.tsx` — ajouter dans la section "Service client":
```tsx
<Link href="/reparation">Demande de réparation</Link>
```

## 5. Page admin

### `app/admin/reparations/page.tsx`

Mirror direct de `app/admin/sav/page.tsx`:
- `export const dynamic = "force-dynamic"` (règle CLAUDE.md)
- Liste avec colonnes: date, nom, téléphone, appareil, statut (badge), actions
- Filtre par statut via query param `?statut=`
- Lien détail `/admin/reparations/[id]`

### `app/admin/reparations/[id]/page.tsx` + `ReparationStatusForm.tsx`

- Affiche tous les champs + `notes_admin`
- `<select>` statut relié à `changerStatutReparation()`
- Protection héritée de `app/admin/layout.tsx`

### Constantes: `lib/constants/statuts.ts`

Ajouter `REPARATION_LABEL`, `REPARATION_BADGE`, `REPARATION_STATUTS` sur le modèle des constantes SAV existantes.

## 6. Sécurité — best practices appliquées

| Risque | Mitigation |
|---|---|
| Spam formulaire public | Honeypot `website` + rate-limit 3 / 10 min par hash IP |
| Injection SQL | Client Supabase paramétré, Zod côté serveur |
| XSS dans SMS ou admin | Pas de HTML dans SMS; en admin, rendre les champs comme texte (React échappe par défaut) |
| Exposition service_role | `lib/supabase/admin.ts` déjà isolé serveur; `lib/sms/twilio.ts` avec `import "server-only"` |
| Fuite clé Twilio | Jamais dans code client; uniquement serveur; `.env.local` gitignored; `.env.local.example` avec valeurs vides |
| Abus coût SMS | Rate-limit IP + contraintes CHECK sur longueurs; le SMS n'est envoyé qu'après insert réussi |
| IP en clair | Stocker un hash SHA-256 (`ip_hash`) plutôt que l'IP brute |
| RLS | Insertion anon/authenticated révoquée → force le passage par Server Action (contrôlée) |

## Fichiers critiques

**Créés:**
- `supabase/migrations/20260418_demandes_reparation.sql`
- `lib/validations/reparation.ts`
- `lib/sms/twilio.ts`
- `lib/actions/reparation.ts`
- `app/(front-office)/reparation/page.tsx`
- `app/(front-office)/reparation/ReparationForm.tsx`
- `app/admin/reparations/page.tsx`
- `app/admin/reparations/[id]/page.tsx`
- `app/admin/reparations/[id]/ReparationStatusForm.tsx`

**Modifiés:**
- `types/database.ts` (ajout table `demandes_reparation`)
- `lib/constants/statuts.ts` (ajout constantes REPARATION_*)
- `components/layout/Footer.tsx` (lien /reparation)
- `.env.local.example` (vars Twilio)
- `package.json` (dépendance `twilio`)

**Patterns réutilisés (lecture seule):**
- `lib/actions/_guard.ts` → `verifierAdmin()`
- `lib/actions/sav.ts` → structure action, flux Resend → miroir pour Twilio
- `app/(client)/compte/sav/nouveau/SavForm.tsx` → pattern `useActionState`
- `app/admin/sav/page.tsx` → liste admin à cloner
- `lib/supabase/admin.ts` → client service_role
- `lib/validations/profile.ts` / `auth.ts` → convention Zod

## Vérification end-to-end

1. **Migration**: appliquer via Supabase MCP (`mcp__supabase__apply_migration`) ou CLI `supabase db push`. Vérifier présence table + RLS activé + policies vides pour anon/authenticated.
2. **Types**: `npx tsc --noEmit` doit rester vert après édition de `types/database.ts`.
3. **Lint/build**: `npm run lint` + `npm run build` verts.
4. **Audit**: `npm audit --omit=dev` — vérifier que `twilio` n'apporte pas de vulnérabilités critiques.
5. **Test fonctionnel manuel**:
   - Aller sur `/reparation`, soumettre un formulaire valide → message de succès, SMS reçu sur `OWNER_PHONE`, ligne insérée dans Supabase (vérif dashboard).
   - Soumettre avec honeypot rempli (DevTools) → succès silencieux mais **aucune** ligne insérée.
   - Soumettre 4 fois de suite → la 4ᵉ doit retourner l'erreur rate-limit.
   - Téléphone invalide (`123`) → erreur Zod affichée.
   - Admin: `/admin/reparations` liste bien la demande; changer le statut persiste et revalide.
6. **SMS failure safety**: simuler une clé Twilio invalide → la demande est quand même enregistrée en DB, utilisateur voit le succès, erreur loggée côté serveur.
