# Configuration de la réinitialisation de mot de passe

## 🔄 Flux de réinitialisation

### 1. Demande de réinitialisation

```
Back-office → API Gateway → Auth Service → Email Service
```

**Processus :**

1. Utilisateur saisit son email
2. API Gateway appelle Auth Service pour générer un token
3. API Gateway appelle Email Service pour envoyer l'email
4. Retour du succès au back-office

### 2. Confirmation de réinitialisation

```
Back-office → API Gateway → Auth Service
```

**Processus :**

1. Utilisateur saisit le token et nouveau mot de passe
2. API Gateway appelle Auth Service pour valider et appliquer
3. Retour du succès au back-office

## 🏗️ Routes API Gateway

### Routes spécialisées :

- `POST /api/auth/reset-password` → Handler personnalisé
- `POST /api/auth/reset-password/confirm` → Handler personnalisé

### Routes email :

- `POST /api/email/send-reset-email` → Email Service
- `POST /api/email/send-welcome-email` → Email Service
- `POST /api/email/send-confirmation-email` → Email Service

## 🔧 Configuration requise

### Variables d'environnement :

```bash
# URLs des services
AUTH_SERVICE_URL=http://localhost:3008
EMAIL_SERVICE_URL=http://localhost:3006

# URLs frontend
FRONTEND_URL=http://localhost:3000
BACKOFFICE_URL=http://localhost:3009
```

### Services requis :

1. **Auth Service** (port 3008) - Gestion des tokens
2. **Email Service** (port 3006) - Envoi d'emails
3. **API Gateway** (port 3020) - Orchestration

## 📧 Format de l'email

### Template de réinitialisation :

- **Sujet** : "Réinitialisation de votre mot de passe - Nature de Pierre"
- **Lien** : `${FRONTEND_URL}/reset-password?token=${token}`
- **Expiration** : 15 minutes
- **Design** : Responsive avec branding

## 🔒 Sécurité

### Token :

- **Génération** : UUID v4 + timestamp
- **Expiration** : 15 minutes
- **Usage unique** : Supprimé après utilisation
- **Stockage** : Hashé en base

### Validation :

- **Email existant** : Vérification avant envoi
- **Rate limiting** : Max 3 demandes par heure
- **Token validation** : Vérification d'expiration
- **Password strength** : Validation côté serveur

## 🚀 Test du flux

### 1. Test de la demande :

```bash
curl -X POST http://localhost:3020/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Test de la confirmation :

```bash
curl -X POST http://localhost:3020/api/auth/reset-password/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token","password":"newPassword123"}'
```

## 📝 Logs et monitoring

### Logs API Gateway :

- `🔄 Demande de réinitialisation pour: email`
- `📞 Appel au Auth Service...`
- `✅ Token généré: Oui/Non`
- `📧 Appel au Email Service...`
- `✅ Email envoyé avec succès: messageId`

### Gestion d'erreurs :

- **Auth Service down** → Erreur 500 avec message générique
- **Email Service down** → Log + nettoyage du token
- **Token invalide** → Message d'erreur clair
- **Rate limiting** → Protection contre les abus
