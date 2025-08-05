#!/bin/bash

# Script pour corriger le mot de passe SMTP dans le fichier .env
# Ajoute des guillemets autour du mot de passe pour éviter les problèmes avec le caractère #

sed -i '' 's/SMTP_PASS=w3\$a8W!Tf7m_#MF/SMTP_PASS="w3\$a8W!Tf7m_#MF"/' .env

echo "Mot de passe SMTP corrigé avec des guillemets"