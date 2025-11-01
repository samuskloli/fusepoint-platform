// Local SMTP configuration test
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const EmailService = require('./services/emailService.js');
(async () => {
  const svc = new EmailService();
  const res = await svc.testEmailConfiguration();
  console.log(JSON.stringify(res));
})().catch(e => {
  console.error('SMTP test failed:', e && e.message ? e.message : e);
  process.exit(1);
});