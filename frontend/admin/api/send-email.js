import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Relay-Secret'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const secret = req.headers['x-relay-secret'] || req.body?.secret;
  if (secret !== 'sakshi_luxury_secure_relay_2025') {
    return res.status(401).json({ success: false, error: 'Unauthorized relay access' });
  }

  const { action, mailOptions, smtpConfig } = req.body;
  const user = (smtpConfig?.user || 'sakshiclothing2025@gmail.com').trim();
  const pass = (smtpConfig?.password || '').trim().replace(/\s+/g, '');
  const port = Number(smtpConfig?.port) || 465;

  if (!pass) {
    return res.status(400).json({ success: false, error: 'Missing SMTP password' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    if (action === 'verify') {
      await transporter.verify();
      return res.status(200).json({
        success: true,
        message: `SMTP verified successfully via Atelier Relay on port ${port}`,
        activePort: port
      });
    }

    if (action === 'send') {
      if (!mailOptions || !mailOptions.to) {
        return res.status(400).json({ success: false, error: 'Missing mailOptions or recipient' });
      }

      const info = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        response: info.response
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action specified' });
  } catch (err) {
    console.error('[Relay Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Relay transmission failed'
    });
  }
}
