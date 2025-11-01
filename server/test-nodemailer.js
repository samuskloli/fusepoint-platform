const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: `${process.env.EMAIL_FROM_NAME || 'Fusepoint Hub'} <${process.env.EMAIL_FROM}>`,
    to: process.env.TEST_EMAIL || process.env.EMAIL_FROM,
    subject: 'Test SMTP local Fusepoint',
    text: 'Ceci est un test SMTP local.',
  });

  console.log({ success: true, messageId: info.messageId });
}

main().catch(err => { console.error('SMTP test failed:', err && err.message ? err.message : err); process.exit(1); });