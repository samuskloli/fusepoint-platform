#!/bin/bash

# Script de redémarrage propre des serveurs Fusepoint
# Auteur: Assistant IA
# Description: Arrête et redémarre proprement le backend et frontend

echo "🔄 Redémarrage des serveurs Fusepoint..."
echo "==========================================="

# Fonction pour tuer les processus Node.js du projet
kill_project_processes() {
    echo "🛑 Arrêt des processus en cours..."
    
    # Tuer les processus npm start et npm run dev du projet
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Tuer les processus node server.js spécifiques au projet
    ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null || true
    
    # Tuer les processus vite du projet
    ps aux | grep "vite" | grep "fusepoint-platform" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null || true
    
    echo "⏳ Attente de l'arrêt complet des processus..."
    sleep 3
}

# Fonction pour démarrer le backend
start_backend() {
    echo "🚀 Démarrage du serveur backend..."
    
    # Obtenir le répertoire principal du script
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    SERVER_DIR="$SCRIPT_DIR/server"
    
    if [ ! -d "$SERVER_DIR" ]; then
        echo "❌ Erreur: Répertoire server non trouvé: $SERVER_DIR"
        exit 1
    fi
    
    cd "$SERVER_DIR"
    echo "📍 Démarrage depuis: $(pwd)"
    
    # Créer le répertoire logs s'il n'existe pas
    mkdir -p "$SCRIPT_DIR/logs"
    
    # Démarrer le backend en arrière-plan
    nohup npm start > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    echo "⏳ Attente du démarrage du backend (PID: $BACKEND_PID)..."
    sleep 8
    
    # Vérifier que le backend est démarré
    if ps -p $BACKEND_PID > /dev/null; then
        echo "✅ Backend démarré avec succès (PID: $BACKEND_PID)"
    else
        echo "❌ Erreur lors du démarrage du backend"
        echo "📋 Logs du backend:"
        if [ -f "$SCRIPT_DIR/logs/backend.log" ]; then
            tail -20 "$SCRIPT_DIR/logs/backend.log"
        else
            echo "Aucun fichier de log trouvé"
        fi
        exit 1
    fi
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🎨 Démarrage du serveur frontend..."
    
    # Obtenir le répertoire principal du script
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    cd "$SCRIPT_DIR"
    echo "📍 Démarrage depuis: $(pwd)"
    
    # Créer le répertoire logs s'il n'existe pas
    mkdir -p logs
    
    # Démarrer le frontend en arrière-plan
    nohup npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    echo "⏳ Attente du démarrage du frontend (PID: $FRONTEND_PID)..."
    sleep 8
    
    # Vérifier que le frontend est démarré
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "✅ Frontend démarré avec succès (PID: $FRONTEND_PID)"
    else
        echo "❌ Erreur lors du démarrage du frontend"
        echo "📋 Logs du frontend:"
        if [ -f "logs/frontend.log" ]; then
            tail -20 logs/frontend.log
        else
            echo "Aucun fichier de log trouvé"
        fi
        exit 1
    fi
}

# Fonction pour vérifier les services
check_services() {
    echo "🔍 Vérification des services..."
    
    # Attendre un peu plus pour que les services démarrent
    sleep 3
    
    # Vérifier le backend
    echo "🔍 Test du backend..."
    if curl -s --connect-timeout 5 http://localhost:3002 > /dev/null 2>&1; then
        echo "✅ Backend accessible sur http://localhost:3002"
    else
        echo "⚠️ Backend non accessible sur le port 3002"
    fi
    
    # Vérifier le frontend
    echo "🔍 Test du frontend..."
    if curl -s --connect-timeout 5 http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Frontend accessible sur http://localhost:5173"
    else
        echo "⚠️ Frontend non accessible sur le port 5173"
    fi
    
    # Afficher les processus actifs
    echo "📊 Processus Node.js actifs:"
    ps aux | grep -E "(node|npm)" | grep -v grep | grep -E "(server\.js|vite|fusepoint)" || echo "Aucun processus trouvé"
}

# Créer le répertoire logs s'il n'existe pas
mkdir -p logs

# Exécution du script
echo "📍 Répertoire de travail: $(pwd)"

# Étape 1: Arrêter les processus existants
kill_project_processes

# Étape 2: Démarrer le backend
start_backend

# Étape 3: Démarrer le frontend
start_frontend

# Étape 4: Vérifier les services
check_services

echo "==========================================="
echo "🎉 Redémarrage terminé!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3002"
echo "📋 Logs backend: logs/backend.log"
echo "📋 Logs frontend: logs/frontend.log"
echo "==========================================="

# Garder le script ouvert pour voir les messages
echo "Appuyez sur Entrée pour fermer..."
read