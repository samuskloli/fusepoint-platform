const jwt = require('jsonwebtoken');

// Secret JWT du fichier .env
const JWT_SECRET = 'c562c4171abd11ef5a40aa858d7702db810d2adcfdcd64a6e1af8bb4243c28c9';

// Générer un token de test pour samuskl
const samusklPayload = {
  id: 35,
  userId: 35,
  email: 'samuskl@gmail.com',
  role: 'client',
  company_id: 13,
  first_name: 'Samuel',
  last_name: 'Oliveira'
};

const token = jwt.sign(samusklPayload, JWT_SECRET, { expiresIn: '24h' });

console.log('Token samuskl généré:');
console.log(token);