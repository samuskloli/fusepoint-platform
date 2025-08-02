#!/bin/bash

# Script de vérification de l'environnement
echo "Vérification de l'environnement..."

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant, copie depuis .env.example"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé depuis .env.example"
    else
        echo "❌ Fichier .env.example introuvable"
        exit 1
    fi
else
    echo "✅ Fichier .env trouvé"
fi

echo "✅ Vérification terminée"