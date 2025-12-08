# Schémas de Base de Données - Diagrammes UML ER

Ce dossier contient les diagrammes PlantUML représentant les schémas de base de données de l'application e-commerce.

## Structure

Chaque base de données a son propre fichier PlantUML :

1. **customer_db.puml** - Base de données des clients
2. **product_db.puml** - Base de données des produits
3. **order_db.puml** - Base de données des commandes
4. **auth_db.puml** - Base de données d'authentification

## Visualisation

Pour visualiser ces diagrammes, vous pouvez :

1. **Utiliser un éditeur PlantUML** :

   - Extension VSCode : "PlantUML"
   - Extension IntelliJ : "PlantUML integration"
   - En ligne : http://www.plantuml.com/plantuml/uml/

2. **Générer des images** :

   ```bash
   # Installer PlantUML
   npm install -g node-plantuml

   # Générer les images
   puml generate customer_db.puml
   puml generate product_db.puml
   puml generate order_db.puml
   puml generate auth_db.puml
   ```

## Conventions UML ER utilisées

- **Classes** : Représentent les tables/entités
- **Attributs** : Colonnes de la base de données avec types et contraintes
- **Méthodes** : Opérations métier des modèles
- **Relations** :
  - `||--o{` : Un-à-plusieurs (composition)
  - Multiplicités : `1` (un), `*` (plusieurs), `0..1` (zéro ou un)
- **Notes** : Contraintes, index, et informations importantes

## Bases de données

### customer_db

- **Customer** : Informations des clients
- **CustomerAddress** : Adresses des clients (shipping/billing)

### product_db

- **Category** : Catégories de produits
- **Product** : Produits du catalogue
- **ProductImage** : Images des produits

### order_db

- **Order** : Commandes
- **OrderItem** : Articles de commande
- **OrderAddress** : Adresses de commande (snapshot)
- **CreditNote** : Avoirs/notes de crédit
- **CreditNoteItem** : Articles d'avoir

### auth_db

- **User** : Utilisateurs du système
- **PasswordReset** : Tokens de réinitialisation de mot de passe
