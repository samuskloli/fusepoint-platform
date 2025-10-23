const fs = require('fs');
try {
  const s = fs.readFileSync('tmp/login.json', 'utf8');
  const o = JSON.parse(s);
  const token = (o.tokens && o.tokens.accessToken) || o.token || '';
  fs.writeFileSync('tmp/token.txt', token);
  console.log('Token écrit dans tmp/token.txt, longueur:', token.length);
} catch (e) {
  console.error('Erreur extraction token:', e);
  process.exit(1);
}