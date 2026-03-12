# Frontend Guidelines — E-Commerce Électroménager

Référence UI/UX pour le développement du site. À consulter avant de créer ou modifier une page.

---

## 1. Principes Généraux

- Le site vend des gros électroménagers (frigos, laveuses, cuisinières) — achat impliquant un investissement majeur
- Le design doit inspirer **confiance, clarté et expertise** — pas un look SaaS ou startup
- Inspiration visuelle : **Best Buy, Costco, Corbeil Électroménagers, Brault & Martineau**
- Palette : navy blue (primaire) + blanc (fond) + gris clair (cards) + orange (accent/boutons/prix)

---

## 2. Navigation Principale

- **Méga-menu** structuré : catégories parentes → sous-catégories précises
  - Ex: Réfrigération → Portes françaises, Congélateur inférieur
- **Barre de recherche prédictive** : suggestions de produits et catégories dès les premières lettres, tolérante aux fautes
- Logo à gauche, recherche au centre, icônes compte + panier à droite

---

## 3. Page Catalogue (/catalogue)

### Filtres (sidebar gauche)
- Catégorie, Fourchette de prix, Marque (multi-sélection)
- Dimensions (largeur, hauteur, profondeur)
- Capacité (pi³), Niveau sonore (dB pour lave-vaisselles)
- Caractéristiques (Wi-Fi, distributeur d'eau, induction)
- Toggle "En stock seulement"
- Mise à jour dynamique sans rechargement de page

### Grille de produits
- Regrouper les variations de couleur (acier inox, noir mat, blanc) dans une seule card
- Pastilles de couleur (swatches) interactives sous l'image
- Badges à contraste élevé : "Économisez 300$", "Vente Finale", "En Stock", "Populaire"
- Barre de résultats + tri (Pertinence, Prix croissant/décroissant) en haut de grille

### Card produit
- Photo produit (fond blanc)
- Marque + nom du produit
- Étoiles + nombre d'avis
- Prix en CAD (avec prix barré si rabais)
- Indicateur de stock
- Bouton "Ajouter au panier"

---

## 4. Page Fiche Produit (/catalogue/[slug])

### Galerie
- Images haute résolution, vues multiples angles
- Photos à l'échelle avec environnement domestique (cuisine aménagée)
- Viser 360° ou AR si possible

### Informations
- Utiliser **accordéon vertical** (pas d'onglets horizontaux) pour les sections
  - Description, Spécifications techniques, Avis clients
- Les utilisateurs doivent pouvoir balayer et développer ce qui les intéresse

### Prix & Rabais
- PDSF barré + prix promotionnel en typographie audacieuse
- Mention claire : "Vous économisez 450$ (30%)"
- Écofrais affichés explicitement près du prix (éviter les surprises au checkout)

### CTA (Call to Action)
- Bouton "Ajouter au panier" **sticky** (reste visible en scrollant)
- Éléments de réassurance : étoiles, certification Energy Star, politique retour, badges sécurité paiement

### Rupture de stock
- Remplacer le bouton d'achat par un champ "Être alerté du retour en stock"
- Message : "Soyez le premier informé dès que cet article populaire sera de nouveau disponible"

### Cross-selling
- Section "Généralement achetés ensemble" avec accessoires complémentaires
- Ajout en 1 clic sans quitter la page
- Modal ou tiroir latéral (slide-out) à la confirmation d'ajout

---

## 5. Comparateur (/comparateur)

- Maximum **2 à 4 produits** (pas de mélange de catégories différentes)
- Tableau : produits en colonnes, attributs en lignes
- **En-têtes fixes (sticky)** : image, nom, prix, bouton CTA toujours visibles en scrollant
- **Surlignage des différences** : fond coloré subtil ou texte gras sur les lignes où les specs diffèrent
- Mobile : scroll horizontal entre les colonnes (swipe)

---

## 6. Packs (/packs)

- Afficher clairement : produits inclus, prix du pack, économie vs achat individuel
- Ex: "Duo Laveuse/Sécheuse — 1 299$ au lieu de 1 699$ séparément → Économisez 400$"
- Soustraction visuelle de la réduction pour confirmer la rentabilité au client

---

## 7. Tunnel d'Achat — Panier & Checkout (/compte/panier)

### Principes
- **Ne jamais forcer** la création de compte avant l'achat → option invité en évidence
  - Note : dans notre projet le panier nécessite un compte (choix de simplification du stage)
- Interface condensée, une page ou accordéon dynamique
- Remplissage automatique des adresses

### Transparence des coûts
- Afficher dès le début : sous-total, écofrais, taxes (selon province), frais de livraison
- Résumé de commande fixé à droite de l'écran

### Calendrier de livraison
- Saisie du code postal pour valider la zone de livraison
- Calendrier interactif avec :
  - Jours grisés (fériés, capacité max atteinte)
  - Créneaux horaires de 3-4h (éviter d'immobiliser le client toute la journée)

### Pourboire (optionnel)
- Introduire à la toute fin, juste avant le paiement
- **Ne jamais présélectionner** un montant par défaut
- Boutons de montants fixes (10$, 20$, 30$) + champ manuel + option "Aucun pourboire"
- Texte explicatif : somme redistribuée à l'équipe de livraison

---

## 8. Back-Office (/admin)

### Dashboard
- Métriques en temps réel : ventes, inventaire critique, taux de conversion
- Alertes stock faible

### Gestion produits
- CRUD complet avec interface admin claire
- Gestion des variations (couleurs, finitions)

### Moteur de rabais
- Interface sans code pour configurer :
  - Réductions % ou forfaitaires
  - Dates début/fin (campagnes saisonnières : Black Friday, Boxing Day)
  - Règles de bundling automatiques

### Logistique
- Vue calendrier ou Gantt pour les livraisons
- Glisser-déposer pour ajuster la charge des camions
- Statuts : En préparation → En transit → Livré

### SAV (Ticketing)
- Tri par urgence
- Historique d'achat du client visible pour valider la garantie
- Assignation de bons de travail aux techniciens

---

## 12. Conformité Loi 96 (Québec)

- Interface complète disponible en **français en priorité**
- Version française jamais "moins bonne" que l'anglaise (fonctionnalités, vitesse, contenu)
- Conditions générales de vente affichées en français par défaut au checkout
- Si texte anglais présent sur bannières/visuels : texte français doit être **2x plus grand** visuellement
- Marques de commerce enregistrées = exception (peuvent rester en anglais)
- Back-Office accessible en français pour les employés

---

## 10. Formulaire SAV côté client (/compte/sav)

Utiliser la **divulgation progressive** (Progressive Disclosure) — ne pas tout afficher d'un coup :
1. Sélectionner le type d'appareil (Réfrigérateur, Laveuse, etc.)
2. Sélectionner la marque
3. Entrer le numéro de modèle
4. Décrire le problème
5. Téléverser des photos (dommages ou codes d'erreur affichés)

L'objectif est de ne pas intimider l'utilisateur avec un long formulaire vide.

---

## 11. Paiement — Stripe

- Supporter **Apple Pay et Google Pay** — augmente le taux de conversion mobile
- Un seul clic sur mobile au lieu de saisir une carte manuellement
- Gestion des erreurs de carte en temps réel avec messages clairs
- Pourboire ajouté dynamiquement via l'API Stripe avant la capture finale (1 seule transaction visible sur le relevé du client)

---

## 12. SEO (à garder en tête pour le développement)

- Utiliser les **métadonnées dynamiques** de Next.js (title + description par page produit)
- Images **Open Graph** dynamiques pour les partages réseaux sociaux
- Balises **canoniques** sur les pages filtrées pour éviter le contenu dupliqué
- Données structurées **JSON-LD** : `Product`, `LocalBusiness`, `Review` (génère les étoiles dorées dans Google)
- URLs en français avec slugs lisibles : `/catalogue/refrigerateur-lg-portes-francaises`
- **Sitemap.xml automatique** et dynamique (nouveaux produits indexés rapidement)
- Balises **hreflang** pour indiquer à Google la relation entre les pages FR et EN
  - Ex: `/fr/catalogue` ↔ `/en/catalogue`
- Routing i18n : sous-répertoires `/fr/` et `/en/` (pas de sous-domaines)
- **Core Web Vitals** à respecter : LCP (vitesse de chargement), CLS (stabilité visuelle)

### SEO Local (Montréal/Québec)
- Optimiser le profil **Google Business** du magasin
- Cibler des quartiers spécifiques : "réfrigérateur Plateau-Mont-Royal", "laveuse Westmount"
- Utiliser le vocabulaire québécois : "rabais" (pas "soldes"), "hottes", "dépanneur"

---

## 13. Composants Prioritaires à Développer

```
1. Navbar          → méga-menu + recherche + icônes
2. ProductCard     → card produit réutilisable
3. ProductGrid     → grille avec filtres
4. ProductFilters  → sidebar filtres
5. CartItem        → item dans le panier
6. CartSummary     → résumé commande (sticky)
7. AdminSidebar    → navigation back-office
8. DataTable       → tableau de données réutilisable admin
9. StatCard        → carte de statistique dashboard
```
