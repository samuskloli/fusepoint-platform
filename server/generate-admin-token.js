const jwt = require('jsonwebtoken');

// Secret JWT du fichier .env
const JWT_SECRET = 'c562c4171abd11ef5a40aa858d7702db810d2adcfdcd64a6e1af8bb4243c28c9';

// Générer un token de test pour l'agent admin
const adminPayload = {
  id: 1,
  userId: 1,
  email: 'info@fusepoint.ch',
  role: 'super_admin',
  company_id: 1,
  first_name: 'Admin',
  last_name: 'Fusepoint'
};

const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '24h' });

console.log('Token admin généré:');
console.log(token);