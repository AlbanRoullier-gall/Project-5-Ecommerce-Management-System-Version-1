# Plan de Test et Méthodologie pour une Application E-commerce Microservices

## 1. Introduction

Ce document présente le plan de test et la méthodologie adoptés pour valider la qualité, la fiabilité et la sécurité d'une application e-commerce basée sur une architecture microservices. L'objectif principal est d'assurer la cohérence fonctionnelle, l'intégrité des données et la robustesse de l'ensemble du système à travers une stratégie de test exhaustive et structurée.

L'application testée est composée de plusieurs microservices indépendants (Auth, Customer, Product, Order, Cart, Payment, Email, PDF Export, Website Content) communiquant via une API Gateway, chacun possédant sa propre base de données PostgreSQL. Cette architecture distribuée nécessite une approche de test adaptée qui couvre à la fois les composants isolés et leurs interactions.

## 2. Contexte et Architecture

### 2.1 Architecture de l'Application

L'application suit une architecture microservices modulaire où chaque service est responsable d'un domaine métier spécifique :

- **Auth Service** : Gestion de l'authentification, autorisation et gestion des utilisateurs
- **Customer Service** : Gestion des clients et de leurs adresses
- **Product Service** : Catalogue de produits, catégories et images
- **Order Service** : Gestion des commandes, factures et avoirs
- **Cart Service** : Gestion des paniers d'achat
- **Payment Service** : Intégration avec Stripe pour le traitement des paiements
- **Email Service** : Envoi d'emails transactionnels
- **PDF Export Service** : Génération de documents PDF
- **Website Content Service** : Gestion du contenu du site web

Chaque service possède sa propre base de données PostgreSQL, garantissant l'indépendance et la scalabilité. La communication entre services s'effectue via une API Gateway centralisée qui gère le routage, l'authentification et l'orchestration des requêtes.

### 2.2 Objectifs du Plan de Test

Les objectifs principaux de cette stratégie de test sont :

1. **Validation fonctionnelle** : Vérifier que chaque service répond correctement aux exigences métier
2. **Intégrité des données** : S'assurer de la cohérence et de la persistance des données à travers les services
3. **Sécurité** : Protéger contre les vulnérabilités courantes (injections, XSS, accès non autorisés)
4. **Fiabilité** : Garantir la robustesse du système face aux erreurs et cas limites
5. **Maintenabilité** : Faciliter l'évolution et la maintenance du code grâce à des tests automatisés

## 3. Stratégie de Test

### 3.1 Pyramide de Tests

La stratégie de test suit le modèle de la pyramide de tests (Myers et al., 2011), privilégiant les tests unitaires à la base, suivis des tests d'intégration, puis des tests fonctionnels et de sécurité.

```
                    ┌─────────────┐
                    │  Sécurité   │  (35 tests)
                    ├─────────────┤
                    │ Fonctionnel │  (9 tests)
                    ├─────────────┤
                    │ Intégration │  (12 tests)
                    ├─────────────┤
                    │   Unitaire  │  (52 tests)
                    └─────────────┘
```

Cette approche permet d'optimiser le rapport coût/bénéfice : les tests unitaires, rapides et nombreux, détectent la majorité des défauts, tandis que les tests d'intégration et fonctionnels valident les interactions complexes.

### 3.2 Catégories de Tests

#### 3.2.1 Tests Unitaires

Les tests unitaires vérifient le comportement isolé des composants individuels (services, repositories, modèles) sans dépendances externes. Ils utilisent des mocks pour isoler les unités testées et garantir leur indépendance.

**Couverture actuelle :**

- Auth Service : 4 fichiers de test (AuthService, User, UserRepository, PasswordReset)
- Order Service : 2 fichiers de test (OrderService, OrderMapper)
- Payment Service : 1 fichier de test (PaymentService)

**Total : 52 tests unitaires répartis en 7 suites**

#### 3.2.2 Tests d'Intégration

Les tests d'intégration valident l'interaction entre les différentes couches d'un même service (Repository ↔ Service ↔ API) en utilisant de vraies bases de données de test. Ils vérifient la persistance des données et le bon fonctionnement des requêtes SQL.

**Couverture actuelle :**

- Auth Service : 3 fichiers de test (Repository, Service API, Password Reset)
- Order Service : 2 fichiers de test (Repository, Service API)

**Total : 12 tests d'intégration répartis en 5 suites**

#### 3.2.3 Tests Fonctionnels

Les tests fonctionnels simulent des parcours utilisateur complets en interagissant avec les services réels via leurs API HTTP. Ils valident les workflows métier end-to-end et l'intégration entre plusieurs services.

**Couverture actuelle :**

- Parcours utilisateur : 5 tests (gestion panier, navigation produits, création client, shopping complet, réinitialisation mot de passe)
- Scénarios métier : 2 tests (création commande, checkout complet)
- Workflows API : 2 tests (workflow commande, session panier)

**Total : 9 tests fonctionnels répartis en 9 suites**

#### 3.2.4 Tests de Sécurité

Les tests de sécurité vérifient la protection contre les vulnérabilités courantes et la conformité aux bonnes pratiques de sécurité.

**Couverture actuelle :**

- Authentification JWT : 5 tests (validation, expiration, signature, payload)
- Sécurité des mots de passe : 8 tests (force, complexité, validation)
- Validation des entrées : 6 tests (XSS, SQL injection, validation)
- Protection des routes : 4 tests (accès non autorisé, tokens)
- Sensibilité des données : 5 tests (non-exposition des hashs, JWT)
- Validation des emails : 7 tests (format, injection, unicité)

**Total : 35 tests de sécurité répartis en 6 suites**

## 4. Méthodologie de Test

### 4.1 Approche Test-Driven Development (TDD)

Bien que l'application n'ait pas été développée entièrement en TDD, les tests suivent les principes de cette méthodologie :

1. **Red-Green-Refactor** : Les tests sont écrits pour valider le comportement attendu avant l'implémentation
2. **Isolation** : Chaque test est indépendant et peut être exécuté isolément
3. **Déterminisme** : Les tests produisent des résultats reproductibles

### 4.2 Gestion des Prérequis et Skip Conditionnel

Étant donné la nature distribuée de l'architecture microservices, les tests intègrent une logique de skip conditionnel pour gérer l'absence de prérequis :

- **Tests fonctionnels** : Skip automatique si les services ne sont pas disponibles (détection via health checks)
- **Tests d'intégration** : Skip automatique si les bases de données de test ne sont pas configurées
- **Tests de sécurité** : Exécution indépendante sans prérequis externes

Cette approche permet d'exécuter les tests dans différents contextes (développement local, CI/CD) sans échec systématique.

### 4.3 Fixtures et Données de Test

Les données de test sont centralisées dans le dossier `fixtures/` pour garantir la cohérence et la réutilisabilité :

- **users.ts** : Utilisateurs de test avec différents statuts (approuvé, en attente, rejeté)
- **products.ts** : Produits de test alignés avec le modèle réel de l'application
- **orders.ts** : Commandes de test pour valider les workflows

Ces fixtures sont alignées avec la structure réelle des modèles de données pour garantir la pertinence des tests.

### 4.4 Mocks et Stubs

Les tests utilisent des mocks pour isoler les dépendances externes :

- **Stripe** : Mock des appels API Stripe dans les tests de paiement
- **Bases de données** : Mocks des pools de connexion PostgreSQL pour les tests unitaires
- **Services externes** : Stubs pour simuler les réponses des autres microservices

Cette stratégie permet d'exécuter les tests rapidement sans dépendre de services externes.

## 5. Organisation et Structure

### 5.1 Arborescence des Tests

La structure des tests suit une organisation hiérarchique par type et par service :

```
tests/
├── unit/                    # Tests unitaires
│   ├── auth-service/
│   ├── order-service/
│   └── payment-service/
├── integration/             # Tests d'intégration
│   ├── auth-service/
│   └── order-service/
├── functional/              # Tests fonctionnels
│   ├── user-journeys/
│   ├── business-scenarios/
│   └── api-workflows/
├── security/                # Tests de sécurité
│   ├── authentication/
│   ├── authorization/
│   ├── validation/
│   └── data-exposure/
├── fixtures/                # Données de test
├── helpers/                # Utilitaires de test
├── config/                  # Configuration Jest
└── scripts/                # Scripts d'initialisation
```

### 5.1.1 Utilisation des Dossiers de Support

**`fixtures/`** : Contient les données de test réutilisables et standardisées. Les fichiers (`users.ts`, `products.ts`, `orders.ts`) exportent des objets TypeScript alignés avec les modèles réels de l'application. Ces fixtures sont importées dans les tests pour garantir la cohérence des données et éviter la duplication.

**`helpers/`** : Regroupe les fonctions utilitaires partagées entre les tests :

- `auth.ts` : Génération et vérification de tokens JWT
- `database.ts` : Création de pools de connexion, setup/cleanup des bases de test
- `mocks.ts` : Mocks réutilisables (Stripe, bases de données)
- `test-skip.ts` : Logique de skip conditionnel pour gérer les prérequis manquants
- `service-checker.ts` : Vérification de disponibilité des services
- `request-wrapper.ts` : Wrapper Supertest avec gestion automatique des skips

**`config/`** : Configuration centralisée de Jest (`jest.config.js`) et setup global (`jest.setup.ts`) qui définit les variables d'environnement de test, les timeouts et les configurations TypeScript.

**`scripts/`** : Scripts shell et Node.js pour automatiser la préparation de l'environnement de test :

- `setup-test-databases.sh` : Création des bases de données PostgreSQL de test
- `init-test-databases.sh` : Exécution des migrations sur les bases de test
- `check-prerequisites.sh/js` : Vérification des prérequis avant exécution des tests

Ces dossiers permettent une séparation claire des responsabilités et facilitent la maintenance de la suite de tests.

### 5.2 Conventions de Nommage

- **Fichiers de test** : `*.test.ts` (ex: `AuthService.test.ts`)
- **Fixtures** : Nom du modèle au pluriel (ex: `users.ts`, `products.ts`)
- **Helpers** : Nom descriptif de la fonctionnalité (ex: `test-skip.ts`, `auth.ts`)

### 5.3 Structure d'un Test

Chaque fichier de test suit une structure standardisée :

```typescript
describe("Composant à tester", () => {
  // Setup initial (beforeAll, beforeEach)

  describe("Fonctionnalité spécifique", () => {
    it("devrait [comportement attendu]", () => {
      // Arrange : Préparation des données
      // Act : Exécution de l'action
      // Assert : Vérification du résultat
    });
  });

  // Cleanup (afterAll, afterEach)
});
```

## 6. Outils et Technologies

### 6.1 Framework de Test

**Jest** est utilisé comme framework de test principal pour les raisons suivantes :

- Support natif de TypeScript
- Exécution parallèle des tests pour améliorer les performances
- Rich API d'assertions et de mocks
- Intégration facile avec les outils CI/CD
- Coverage reports intégrés

### 6.2 Bibliothèques Complémentaires

- **Supertest** : Pour tester les API HTTP dans les tests fonctionnels et d'intégration
- **pg (node-postgres)** : Pour les connexions aux bases de données PostgreSQL
- **jsonwebtoken** : Pour la manipulation des tokens JWT dans les tests de sécurité
- **bcryptjs** : Pour le hashage des mots de passe dans les tests

### 6.3 Configuration

La configuration Jest est centralisée dans `tests/config/jest.config.js` avec :

- Patterns de fichiers à tester
- Configuration TypeScript
- Setup global (`jest.setup.ts`)
- Timeouts adaptés selon le type de test
- Coverage thresholds

## 7. Résultats et Métriques

### 7.1 Couverture Globale

**Total : 108 tests répartis en 27 suites**

| Type de Test        | Nombre  | Taux de Réussite   | Pertinence |
| ------------------- | ------- | ------------------ | ---------- |
| Tests Unitaires     | 52      | 100% (52/52)       | ⭐⭐⭐⭐⭐ |
| Tests d'Intégration | 12      | 100% (12/12)       | ⭐⭐⭐⭐⭐ |
| Tests Fonctionnels  | 9       | 100% (9/9)         | ⭐⭐⭐⭐   |
| Tests de Sécurité   | 35      | 100% (35/35)       | ⭐⭐⭐⭐⭐ |
| **TOTAL**           | **108** | **100% (108/108)** | -          |

### 7.2 Analyse par Service

#### Auth Service

- **Tests unitaires** : 4 fichiers, ~20 tests
- **Tests d'intégration** : 3 fichiers, 6 tests
- **Tests de sécurité** : 20 tests (JWT, mots de passe, emails)
- **Couverture** : Excellente pour un service critique

#### Order Service

- **Tests unitaires** : 2 fichiers, ~8 tests
- **Tests d'intégration** : 2 fichiers, 4 tests
- **Couverture** : Bonne pour le cœur métier e-commerce

#### Payment Service

- **Tests unitaires** : 1 fichier, ~8 tests
- **Couverture** : Bonne pour l'intégration Stripe

### 7.3 Points Forts

1. **Couverture complète des fonctionnalités critiques** : Authentification, commandes, paiements
2. **Tests de sécurité exhaustifs** : 35 tests couvrant les vulnérabilités courantes
3. **Tests fonctionnels pertinents** : Parcours utilisateur réalistes
4. **Gestion robuste des prérequis** : Skip conditionnel pour éviter les faux négatifs
5. **Structure organisée** : Facilité de maintenance et d'extension

### 7.4 Améliorations Possibles

1. **Tests unitaires pour Product et Cart Services** : Actuellement non couverts
2. **Tests de performance** : Ajout de tests de charge et de performance
3. **Tests de régression** : Automatisation des tests de non-régression
4. **Couverture de code** : Mesure et suivi de la couverture de code
5. **Tests E2E** : Tests end-to-end complets avec interface utilisateur

## 8. Processus d'Exécution

### 8.1 Exécution Locale

Les tests peuvent être exécutés selon différents modes :

```bash
# Tous les tests
npm test

# Par catégorie
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:security

# Un fichier spécifique
npm test -- path/to/test.test.ts
```

### 8.2 Prérequis

- **Tests unitaires** : Aucun prérequis
- **Tests d'intégration** : Bases de données de test configurées
- **Tests fonctionnels** : Services lancés via `start-dev.sh`
- **Tests de sécurité** : Aucun prérequis

### 8.3 Intégration Continue

Les tests sont conçus pour être intégrés dans un pipeline CI/CD :

1. **Tests unitaires** : Exécution rapide (< 5 secondes)
2. **Tests d'intégration** : Exécution avec bases de données Docker
3. **Tests fonctionnels** : Exécution avec services Docker Compose
4. **Tests de sécurité** : Exécution indépendante

## 9. Conclusion

Cette stratégie de test offre une couverture complète et structurée de l'application e-commerce microservices. L'approche pyramidale garantit un bon équilibre entre rapidité d'exécution et profondeur de validation, tandis que la gestion conditionnelle des prérequis permet une exécution flexible dans différents contextes.

Les 108 tests, tous en état de réussite, valident les aspects critiques de l'application : fonctionnalités métier, intégrité des données, sécurité et expérience utilisateur. Cette base solide facilite la maintenance et l'évolution future de l'application tout en garantissant la qualité du code.

### 9.1 Perspectives

Pour améliorer encore la qualité et la fiabilité du système, les pistes d'amélioration suivantes sont recommandées :

1. **Extension de la couverture** : Ajout de tests pour les services Product et Cart
2. **Tests de performance** : Validation des temps de réponse et de la scalabilité
3. **Tests de charge** : Vérification du comportement sous charge
4. **Monitoring** : Intégration de métriques de qualité dans le monitoring
5. **Documentation** : Enrichissement de la documentation des tests pour faciliter la maintenance

---

## Références

- Myers, G. J., Sandler, C., & Badgett, T. (2011). _The Art of Software Testing_. John Wiley & Sons.
- Beck, K. (2003). _Test-Driven Development: By Example_. Addison-Wesley Professional.
- Martin, R. C. (2009). _Clean Code: A Handbook of Agile Software Craftsmanship_. Prentice Hall.
- OWASP Foundation. (2021). _OWASP Top 10 - 2021_. https://owasp.org/www-project-top-ten/

---

_Document généré le : Décembre 2024_  
_Version : 1.0_











