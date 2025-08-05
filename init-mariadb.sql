-- Script d'initialisation MariaDB pour Fusepoint Platform
-- À exécuter en tant qu'administrateur MariaDB

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS fusepoint_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur et lui donner les permissions
CREATE USER IF NOT EXISTS 'oliveirasamuel'@'localhost' IDENTIFIED BY 'FusepointDB2025!';
GRANT ALL PRIVILEGES ON fusepoint_db.* TO 'oliveirasamuel'@'localhost';
FLUSH PRIVILEGES;

-- Utiliser la base de données
USE fusepoint_db;

-- Afficher les tables existantes
SHOW TABLES;