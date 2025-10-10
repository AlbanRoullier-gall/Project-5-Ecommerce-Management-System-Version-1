# Système de Checkout - Nature de Pierre

## Vue d'ensemble

Ce dossier contient tous les composants nécessaires pour gérer le processus complet de passage de commande, de la collecte des informations client jusqu'au paiement via Stripe.

## Architecture

Le processus de checkout est divisé en 4 étapes distinctes :

1. **Informations client** - Collecte des données personnelles
2. **Adresses** - Gestion des adresses de livraison et facturation
3. **Entreprise** - Informations professionnelles (optionnel)
4. **Récapitulatif et paiement** - Validation finale et redirection vers Stripe

## Composants

### CheckoutCustomerForm

**Fichier**: `CheckoutCustomerForm.tsx`

**Responsabilité**: Collecte des informations personnelles du client

**Champs obligatoires**:

- Civilité (M., Mme, Autre)
- Prénom
- Nom
- Email
- Catégorie socio-professionnelle

**Champs optionnels**:

- Téléphone
- Date de naissance

**Props**:

```typescript
interface CheckoutCustomerFormProps {
  formData: Partial<CustomerCreateDTO>;
  onChange: (data: Partial<CustomerCreateDTO>) => void;
  onNext: () => void;
  onBack?: () => void;
}
```

### CheckoutAddressForm

**Fichier**: `CheckoutAddressForm.tsx`

**Responsabilité**: Gestion des adresses de livraison et facturation

**Fonctionnalités**:

- Collecte de l'adresse de livraison (obligatoire)
- Option pour utiliser la même adresse pour la facturation
- Formulaire séparé pour l'adresse de facturation si nécessaire

**Champs par adresse**:

- Adresse complète
- Code postal
- Ville
- Pays (sélection parmi les pays disponibles)

**Props**:

```typescript
interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
  billing: Partial<AddressCreateDTO>;
  useSameAddress: boolean;
}

interface CheckoutAddressFormProps {
  formData: AddressFormData;
  onChange: (data: AddressFormData) => void;
  onNext: () => void;
  onBack: () => void;
}
```

### CheckoutCompanyForm

**Fichier**: `CheckoutCompanyForm.tsx`

**Responsabilité**: Collecte des informations entreprise (optionnel)

**Fonctionnalités**:

- Case à cocher pour activer le mode entreprise
- Formulaire masqué par défaut
- Validation conditionnelle

**Champs**:

- Nom de l'entreprise (obligatoire si mode entreprise activé)
- Numéro SIRET (optionnel)
- Numéro TVA (optionnel)

**Props**:

```typescript
interface CheckoutCompanyFormProps {
  formData: Partial<CompanyCreateDTO> | null;
  onChange: (data: Partial<CompanyCreateDTO> | null) => void;
  onNext: () => void;
  onBack: () => void;
}
```

### CheckoutOrderSummary

**Fichier**: `CheckoutOrderSummary.tsx`

**Responsabilité**: Récapitulatif final et orchestration du processus de commande

**Fonctionnalités**:

- Affichage de toutes les informations collectées
- Récapitulatif du panier avec détails des produits
- Création de la commande via l'API
- Création du client
- Création de l'entreprise (si applicable)
- Création des articles de commande
- Création des adresses de commande
- Initialisation du paiement Stripe
- Gestion des erreurs

**Flux de création de commande**:

1. **Créer le client** → `POST /api/customers`
2. **Créer l'entreprise** (si applicable) → `POST /api/customers/:customerId/companies`
3. **Créer la commande** → `POST /api/orders`
4. **Créer les articles** → `POST /api/admin/order-items` (pour chaque article)
5. **Créer les adresses** → `POST /api/admin/order-addresses` (livraison et facturation)
6. **Créer le paiement** → `POST /api/payment/create`
7. **Redirection vers Stripe**

**Props**:

```typescript
interface CheckoutOrderSummaryProps {
  cart: CartPublicDTO | null;
  customerData: Partial<CustomerCreateDTO>;
  shippingAddress: Partial<AddressCreateDTO>;
  billingAddress: Partial<AddressCreateDTO>;
  companyData: Partial<CompanyCreateDTO> | null;
  onBack: () => void;
  onSuccess: (orderId: number) => void;
}
```

## Page principale

### checkout.tsx

**Fichier**: `/pages/checkout.tsx`

**Responsabilité**: Orchestration du processus complet

**Fonctionnalités**:

- Gestion de l'état global du formulaire
- Navigation entre les étapes
- Indicateur de progression visuel
- Protection contre l'accès avec panier vide
- Responsive design

**États**:

```typescript
const [currentStep, setCurrentStep] = useState(1);
const [customerData, setCustomerData] = useState<Partial<CustomerCreateDTO>>({});
const [addressData, setAddressData] = useState({...});
const [companyData, setCompanyData] = useState<Partial<CompanyCreateDTO> | null>(null);
```

## Pages de résultat

### success.tsx

**Fichier**: `/pages/checkout/success.tsx`

**Responsabilité**: Confirmation de commande réussie

**Fonctionnalités**:

- Affichage du numéro de commande
- Message de confirmation
- Vidage automatique du panier
- Actions post-achat (retour accueil, continuer achats)

### cancel.tsx

**Fichier**: `/pages/checkout/cancel.tsx`

**Responsabilité**: Gestion de l'annulation du paiement

**Fonctionnalités**:

- Message d'information
- Options de reprise (retour panier, réessayer paiement)
- Lien vers le support

## Routes API utilisées

### Service Client

- `POST /api/customers` - Créer un client
- `POST /api/customers/:customerId/companies` - Créer une entreprise

### Service Commande

- `POST /api/orders` - Créer une commande
- `POST /api/admin/order-items` - Créer un article de commande
- `POST /api/admin/order-addresses` - Créer une adresse de commande

### Service Paiement

- `POST /api/payment/create` - Créer une session de paiement Stripe

### Service Produit

- `GET /api/products/:id` - Récupérer les détails d'un produit

## DTOs utilisés

Tous les DTOs sont importés depuis `../../dto`:

- `CustomerCreateDTO` - Création client
- `AddressCreateDTO` - Création adresse
- `CompanyCreateDTO` - Création entreprise
- `OrderCreateDTO` - Création commande
- `OrderItemCreateDTO` - Création article de commande
- `OrderAddressCreateDTO` - Création adresse de commande
- `PaymentCreateDTO` - Création paiement
- `CartPublicDTO` - Données du panier

## Intégration Stripe

Le paiement est géré via Stripe Checkout avec redirection:

1. **Création de la session**: L'API backend crée une session Stripe
2. **Redirection**: L'utilisateur est redirigé vers Stripe
3. **Paiement**: L'utilisateur effectue le paiement sur Stripe
4. **Retour**: Redirection vers `/checkout/success` ou `/checkout/cancel`

**URLs de retour**:

- Succès: `{origin}/checkout/success?orderId={orderId}`
- Annulation: `{origin}/checkout/cancel?orderId={orderId}`

## Style et Design

### Palette de couleurs

- **Primaire**: `#13686a` (vert foncé)
- **Secondaire**: `#0dd3d1` (turquoise)
- **Succès**: `#10b981` (vert)
- **Alerte**: `#f59e0b` (orange)
- **Erreur**: `#c33` (rouge)

### Composants UI

- Formulaires avec validation
- Indicateur de progression
- Messages d'erreur/succès
- Loading states
- Responsive design (mobile-first)

### Icons

Utilisation de Font Awesome 6.0.0 pour toutes les icônes.

## Gestion des erreurs

Chaque composant gère ses propres erreurs:

- **Validation des formulaires**: Messages d'erreur inline
- **Erreurs API**: Affichage de messages utilisateur friendly
- **États de chargement**: Désactivation des boutons et spinners
- **Récupération**: Possibilité de corriger et réessayer

## Responsive Design

Le système est entièrement responsive avec des breakpoints:

- **Desktop**: > 1024px - Layout 2 colonnes
- **Tablet**: 768px - 1024px - Layout adapté
- **Mobile**: < 768px - Layout 1 colonne, formulaires empilés

## Sécurité

- Validation côté client ET serveur
- Aucune donnée sensible stockée localement
- Communication HTTPS uniquement
- Intégration Stripe PCI-compliant
- Pas de manipulation directe des données de carte

## Utilisation

### Installation

Les composants sont déjà intégrés. Aucune installation supplémentaire requise.

### Navigation

Pour accéder au checkout:

```tsx
import Link from "next/link";

<Link href="/checkout">Passer la commande</Link>;
```

### Prérequis

- Panier non vide (vérification automatique)
- Variable d'environnement `NEXT_PUBLIC_API_URL` configurée
- Services backend opérationnels (customer, order, payment)
- Configuration Stripe valide côté backend

## Tests

Pour tester le flux complet:

1. Ajouter des produits au panier
2. Aller sur `/cart`
3. Cliquer sur "Passer la commande"
4. Remplir les 4 étapes
5. Vérifier la redirection vers Stripe
6. Tester le paiement en mode test
7. Vérifier la redirection vers success/cancel

## Améliorations futures possibles

- [ ] Sauvegarde automatique des données (localStorage)
- [ ] Mode "invité" sans création de compte
- [ ] Validation en temps réel des champs
- [ ] Autocomplétion d'adresse (Google Places API)
- [ ] Support multi-devises
- [ ] Codes promo / coupons de réduction
- [ ] Calcul des frais de livraison
- [ ] Choix du mode de livraison
- [ ] Historique des commandes client
- [ ] Notifications par email (confirmation, suivi)

## Support

Pour toute question ou problème:

- Vérifier les logs côté navigateur (console)
- Vérifier les logs côté serveur (API Gateway, services)
- Contacter l'équipe de développement
