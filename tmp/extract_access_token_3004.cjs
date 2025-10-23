const fs = require('fs');
try {
  const s = fs.readFileSync('tmp/login_admin_3004.json', 'utf8');
  const o = JSON.parse(s);
  const token = (o.tokens && o.tokens.accessToken) || o.accessToken || o.token || '';
  if (!token) {
    console.error('No access token in login_admin_3004.json');
    process.exit(1);
  }
  fs.writeFileSync('tmp/access_token_3004.txt', token);
  console.log('Token written to tmp/access_token_3004.txt, length:', token.length);
} catch (e) {
  console.error('Extraction error:', e);
  process.exit(2);
}