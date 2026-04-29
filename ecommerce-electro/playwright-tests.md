# Tests E2E Playwright — ÉlectroMétropolitain

**Date :** 28 avril 2026  
**Outil :** Playwright MCP + Claude Code  
**Environnement :** `http://localhost:3000` (branche `dev`)  
**Compte test :** `marie.lavoie.test@yopmail.com` / `MarieTest1!`

---

## Résumé des résultats

| Flow | Bugs trouvés | Réglés | Statut |
|---|---|---|---|
| Page d'accueil | 0 | — | ✅ PASS |
| Checkout Stripe | 2 | 2/2 | ✅ PASS |
| Auth (inscription / connexion / déconnexion) | 1 | 1/1 | ✅ PASS |
| SAV + panel admin | 1 | 1/1 | ✅ PASS |
| Catalogue + recherche + favoris | 0 | — | ✅ PASS |
| Réparation + panel admin | 1 | 1/1 | ✅ PASS |
| **Total** | **5** | **5/5** | ✅ |

---

## Page d'accueil

**Résultat : PASS**

- Navbar avec liens Accueil, Catalogue, Packs, Comparer + icônes favoris/panier/compte visible ✓
- Hero "Des appareils de qualité pour votre maison" avec CTA "Magasiner" et "Voir les packs" ✓
- Bande de réassurance (Livraison gratuite, Garantie 2 ans, Support 7j/7, Paiement sécurisé) ✓
- Section "Magasiner par catégorie" visible ✓
- 1 erreur console investiguée et réglée (favicon.ico 404 — inoffensif)

---

## Checkout Stripe

**Résultat : PASS** (après 2 fixes)

### Étapes testées
1. Ajout d'un produit au panier ✓
2. Navigation vers `/compte/checkout` ✓
3. Remplissage des informations de livraison ✓
4. Paiement avec carte test Stripe `4242 4242 4242 4242`, exp `12/29`, CVV `123` ✓
5. Confirmation de commande reçue ✓

### Bugs trouvés et corrigés

**Bug #1 — CRITIQUE**
- **Fichier :** `lib/payments/checkout.ts:185`
- **Problème :** URL d'image produit contenant des caractères non-ASCII (ex. `Cuisinière`) passée telle quelle à Stripe → erreur `Invalid URL: Non-ASCII characters must be percent-encoded` → HTTP 400 sur `/api/checkout/session`
- **Fix :** `encodeURI(imageMap[item.product_id])` appliqué ✅
- **Impact :** Tout produit avec un accent dans l'URL d'image bloquait complètement le checkout

**Bug #2 — Mineur**
- **Fichier :** `compte/panier/page.tsx`, `compte/checkout/page.tsx`
- **Problème :** Images produit cassées dans le panier et le checkout — `placehold.co` échouait sur `/_next/image` à cause des caractères accentués
- **Fix :** Attribut `unoptimized` ajouté sur les `<Image>` avec URL `placehold.co` (même pattern que `ProductCard.tsx`) ✅

**Bug #3 — Données**
- **Localisation :** Produit TCL QM6K, table `product_images` en base
- **Problème :** Image affichée était une photo de voiture (Mercedes/DEVENZO) au lieu d'un téléviseur
- **Fix :** SQL exécuté sur Supabase pour remplacer l'URL par un placeholder ASCII propre ✅

---

## Auth — Inscription / Connexion / Déconnexion

**Résultat : PASS** (après 1 fix)

### Étapes testées
1. Inscription d'un nouveau compte ✓
2. Validation mot de passe progressive — les 3 règles passent de rouge (×) à vert (✓) au fur et à mesure ✓
3. Correspondance des mots de passe affichée en vert ✓
4. Bouton désactivé jusqu'à validation complète ✓
5. Déconnexion — badge supprimé, menu "Connexion/Inscription" ✓
6. Reconnexion avec `marie.lavoie.test@yopmail.com` ✓
7. Navbar affiche "Marie Lavoie" (pas "null null") ✓

### Bug trouvé et corrigé

**Bug #1 — Comportement inattendu**
- **Problème :** Quand un utilisateur déjà connecté accédait à `/inscription` et soumettait le formulaire, la session ne basculait pas vers le nouveau compte — l'ancienne session persistait
- **Cause :** `signUp()` Supabase retourne `needsConfirmation: true` quand un utilisateur est déjà connecté
- **Fix :** Redirection ajoutée vers `/compte/profil` avec message "Vous êtes déjà connecté" si une session active est détectée à l'accès à `/inscription` ✅

---

## SAV + Panel Admin

**Résultat : PASS** (après 1 fix)

### Étapes testées
1. Soumission d'une demande SAV (`/compte/sav/nouveau`) — sujet, description, sans commande liée ✓
2. Redirection vers `/compte/sav` — "1 demande" affichée ✓
3. Page détail de la demande rendue correctement ✓
4. Déduplication email côté client (`disabled={isPending}` sur `SavForm.tsx`) ✓
5. Déduplication email côté serveur (`ancienStatut !== statut` avant envoi dans `sav.ts:48`) ✓
6. Panel admin `/admin/sav` — liste les 8 demandes, entrée de Marie au sommet ✓
7. Page détail admin — description complète, infos client, contrôle de statut ✓
8. Garde admin confirmée — compte Marie redirigé vers l'accueil sur `/admin/sav` ✓

### Bug trouvé et corrigé

**Bug #1 — Double email potentiel**
- **Fichier :** `app/(admin)/admin/sav/[id]/page.tsx:125`
- **Problème :** `StatutSavForm` utilisait `defaultValue={statutActuel}` (élément `<select>` non contrôlé). Après un changement de statut réussi, le select revenait visuellement à l'ancien statut — un admin cliquant "Mettre à jour" à nouveau aurait réverti le statut ET envoyé un second email
- **Fix :** `key={demande.status}` ajouté sur `<StatutSavForm>` pour forcer un remontage quand le statut server-rendered change — second clic avec même statut laisse la DB inchangée et le select reste sur "En cours" ✅

---

## Catalogue + Recherche + Favoris

**Résultat : PASS — Aucun bug trouvé**

### Étapes testées

**Filtre prix**
- Catalogue chargé avec 13 produits ✓
- Filtre `prix_min=400` / `prix_max=800` appliqué → 7 produits, tous entre 400$ et 800$ ✓
- Maytag à 799$ correctement inclus, LG à 899$ et Bosch à 1 349$ correctement exclus ✓
- URL reflète `?prix_min=400&prix_max=800` ✓

**Recherche par nom**
- `/recherche?q=Bosch` → 1 résultat : Lave-vaisselle Bosch 800 Series ✓
- `meta[name="robots"] = noindex, follow` confirmé sur la page de recherche ✓

**JSON-LD structured data**
- Page produit contient deux blocs JSON-LD valides :
  - `@type: "Product"` — name, brand, description, image, SKU, offers (prix CAD, InStock) ✓
  - `@type: "BreadcrumbList"` — 4 niveaux : Accueil → Catalogue → Lave-vaisselle → produit ✓
- Les deux blocs parsent sans erreur ✓

**Favoris**
- Clic sur "Ajouter aux favoris" → bouton bascule vers "Retirer des favoris" immédiatement ✓
- Après reload complet : bouton reste "Retirer des favoris" ✓
- Badge favoris dans la navbar mis à jour (1 → 2) ✓

---

## Réparation + Panel Admin

**Résultat : PASS** (après 1 fix)

### Étapes testées
1. Soumission d'une demande de réparation — nom=Marie Lavoie, téléphone=`514-555-9876`, appareil=Réfrigérateur Samsung RF28 ✓
2. Normalisation téléphone E.164 par Zod : `514-555-9876` → `+15145559876` ✓
3. Validation Zod complète :
   - `"123"` → "Numéro de téléphone canadien invalide (10 chiffres)" ✓
   - `"abc"` → invalide ✓
   - `"514-555-1234"` → `+15145551234` ✓
   - `"+1 (514) 555-1234"` → `+15145551234` ✓
4. Serveur confirme avec référence `A1C3AC55` ✓
5. Panel admin `/admin/reparations` — 6 demandes listées, entrée Marie au sommet avec statut "Nouveau" et `+15145559876` ✓
6. Changement de statut admin → "Contacté", notes persistées, liste reflète le changement ✓

### Note sécurité
- **Honeypot anti-bot** (`name="website"`) documenté — court-circuite silencieusement vers `{ success: true }` si rempli. Comportement intentionnel. ✓

### Bug trouvé et corrigé

**Bug #1 — CRITIQUE (échec silencieux)**
- **Fichier :** `lib/actions/reparation.ts`
- **Problème :** `changerStatutReparation` utilisait le client Supabase authentifié standard (`authClient`), mais la migration RLS révoque tous les droits d'écriture sur `authenticated` — seul `service_role` peut écrire sur cette table. Le changement de statut échouait silencieusement avec "Mise à jour impossible. Vérifiez vos permissions."
- **Fix :** Passage de `authClient` à `createAdminClient()` pour le write DB — la vérification `verifierAdmin()` reste appliquée en amont pour éviter tout bypass de sécurité ✅
- **Impact :** Les admins ne pouvaient pas changer le statut des réparations

---

## Flows non testés (à couvrir)

- [ ] Packs — ajout au panier, prix distribué proportionnellement
- [ ] Comparateur — ajout de produits, tableau de comparaison
- [ ] Emails transactionnels end-to-end (Resend en mode test)
- [ ] SMS Twilio (notifications réparation)
- [ ] Flow rate limiting sur `/api/checkout/session` et `/api/checkout/confirm`
