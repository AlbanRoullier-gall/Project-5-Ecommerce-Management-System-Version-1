#!/bin/bash

# Script pour mettre à jour le token GitLab dans la configuration Git

echo "🔐 Configuration du token GitLab"
echo ""
echo "Pour obtenir un nouveau token GitLab :"
echo "1. Allez sur https://gitlab.com/-/user_settings/personal_access_tokens"
echo "2. Créez un nouveau token avec les permissions 'write_repository'"
echo "3. Copiez le token"
echo ""
read -p "Collez votre nouveau token GitLab ici: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Aucun token fourni. Opération annulée."
    exit 1
fi

# Mise à jour de l'URL du remote avec le nouveau token
git remote set-url origin "https://AlbanRoullier-gall:${TOKEN}@gitlab.com/AlbanRoullier-gall/tfe.git"

echo ""
echo "✅ Token mis à jour avec succès !"
echo ""
echo "Tentative de push..."
git push origin main

