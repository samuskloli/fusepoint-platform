const jwt = require('jsonwebtoken');

// Secret JWT du fichier .env
const JWT_SECRET = 'c562c4171abd11ef5a40aa858d7702db810d2adcfdcd64a6e1af8bb4243c28c9';

// Générer un token de test pour un agent
const testPayload = {
  userId: 1,
  email: 'info@fusepoint.ch',
  role: 'admin',
  company_id: 1
};

const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });

console.log('Token de test généré:');
console.log(token);