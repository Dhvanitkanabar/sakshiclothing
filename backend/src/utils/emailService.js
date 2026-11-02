import nodemailer from 'nodemailer';
import StoreSettings from '../models/StoreSettings.model.js';

export const getTransporter = async (customConfig = null, forcePort = null) => {
  let cfg = customConfig;

  // 1. If no custom config, try StoreSettings from MongoDB
  if (!cfg || !cfg.user || !cfg.password) {
    try {
      const settings = await StoreSettings.findOne().lean();
      if (settings?.smtp?.user && settings?.smtp?.password) {
        cfg = settings.smtp;
      }
    } catch (err) {
      console.warn('[Email Warning] Could not load SMTP from StoreSettings:', err.message);
    }
  }

  // 2. If still no config, fallback to process.env
  if (!cfg || !cfg.user || !cfg.password) {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 465;
    if (user && pass) {
      cfg = { user, password: pass, host, port, provider: 'gmail' };
    }
  }

  if (!cfg || !cfg.user || !cfg.password) {
    return null;
  }

  const cleanUser = cfg.user.trim();
  const cleanPass = cfg.password.replace(/\s+/g, '');
  const isGmail = cfg.provider === 'gmail' || (cfg.host && cfg.host.includes('gmail')) || cleanUser.endsWith('@gmail.com');
  const effectivePort = forcePort || Number(cfg.port) || 465;
  const isSecure = effectivePort === 465;

  if (isGmail) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: effectivePort,
      secure: isSecure,
      auth: {
        user: cleanUser,
        pass: cleanPass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    host: cfg.host || 'smtp.gmail.com',
    port: effectivePort,
    secure: isSecure,
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  });
};

const DEFAULT_SENDER = process.env.EMAIL_FROM || 'sakshiclothing2025@gmail.com';
const COMPANY_ADDRESS = 'G-903 Sentosa Heights, Utran, Surat, Gujarat, India';
const COMPANY_PHONE = '+91 9316533660';
const COMPANY_EMAIL = 'sakshiclothing2025@gmail.com';

export const getSenderEmail = async () => {
  try {
    const settings = await StoreSettings.findOne().lean();
    if (settings?.smtp?.fromEmail) return settings.smtp.fromEmail;
    if (settings?.smtp?.user) return settings.smtp.user;
  } catch {}
  return process.env.EMAIL_FROM || DEFAULT_SENDER;
};

export const verifyConnectionWithFallback = async (config) => {
  // First attempt on port 465 (SSL)
  const transporter465 = await getTransporter(config, 465);
  if (!transporter465) {
    throw new Error('SMTP credentials missing. Please enter your Gmail address and 16-character App Password.');
  }

  try {
    await transporter465.verify();
    return { transporter: transporter465, activePort: 465 };
  } catch (err465) {
    const isAuthError = err465.message?.includes('535') || err465.message?.toLowerCase().includes('badcredentials') || err465.message?.toLowerCase().includes('username and password not accepted');
    if (isAuthError) {
      throw new Error(
        'Google Authentication Rejected (Error 535). Please ensure: 1) You are using a 16-character Google App Password (not your normal Gmail password); 2) 2-Step Verification is turned ON in Google Security; 3) The email is sakshiclothing2025@gmail.com.'
      );
    }

    console.warn('[SMTP Warning] Port 465 failed, attempting port 587 (TLS/STARTTLS)...', err465.message);

    // Fallback to port 587 (TLS/STARTTLS) in case cloud host or firewall blocks port 465
    try {
      const transporter587 = await getTransporter(config, 587);
      await transporter587.verify();
      return { transporter: transporter587, activePort: 587 };
    } catch (err587) {
      const isAuthError587 = err587.message?.includes('535') || err587.message?.toLowerCase().includes('username and password not accepted');
      if (isAuthError587) {
        throw new Error(
          'Google Authentication Rejected (Error 535). Please ensure: 1) You are using a 16-character Google App Password (not your normal Gmail password); 2) 2-Step Verification is turned ON in Google Security; 3) The email is sakshiclothing2025@gmail.com.'
        );
      }
      throw new Error(`SMTP connection failed on port 465 and 587: ${err587.message || err465.message}`);
    }
  }
};

export const sendTestEmail = async ({ toEmail, config = null }) => {
  const { transporter, activePort } = await verifyConnectionWithFallback(config);

  const senderEmail = config?.fromEmail || config?.user || await getSenderEmail();
  const mailOptions = {
    from: `"Sakshi Clothing Atelier" <${senderEmail}>`,
    to: toEmail,
    subject: `Sakshi Clothing Atelier — Live Email Test`,
    text: `Hello,\n\nThis is a real live test email from the Sakshi Clothing Atelier admin system.\n\nYour SMTP gateway is successfully connected and verified on port ${activePort}.\n\nAtelier Address: ${COMPANY_ADDRESS}\nContact: ${COMPANY_PHONE} | ${COMPANY_EMAIL}`,
    html: `
      <div style="background-color:#12100e;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f5f2eb;">
        <div style="max-width:560px;margin:0 auto;background:#1a1714;border:1px solid #3d342a;border-radius:20px;padding:36px;text-align:center;">
          <div style="font-size:26px;letter-spacing:0.3em;color:#ffffff;font-weight:300;">SAKSHI</div>
          <div style="font-size:9px;letter-spacing:0.35em;color:#e5a93c;text-transform:uppercase;margin:6px 0 24px 0;">ATELIER LIVE EMAIL VERIFICATION</div>
          <div style="background:#142318;border:1px solid #234c2e;color:#52c41a;padding:12px;border-radius:12px;font-size:13px;font-weight:600;margin-bottom:20px;">
            ✓ Real Email Dispatch Successful! (Port ${activePort} Active)
          </div>
          <p style="color:#b8b0a5;font-size:13px;line-height:1.7;margin-bottom:16px;">
            Your SMTP email delivery system is 100% active and connected to <strong>${senderEmail}</strong>. All subscriber updates and customer order notifications will now be delivered directly to inboxes.
          </p>
          <div style="border-top:1px solid #29241e;padding-top:16px;font-size:11px;color:#78716c;">
            ${COMPANY_ADDRESS} &bull; ${COMPANY_PHONE} &bull; ${COMPANY_EMAIL}
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return { info, activePort };
};

export const sendOrderConfirmationEmail = async (order, customerUser) => {
  try {
    const transporter = await getTransporter();
    const recipientEmail = customerUser?.email || order.shippingAddress?.email;
    if (!transporter || !recipientEmail) {
      console.log(`[Email Notice] SMTP not configured. Skipping confirmation email for ${order.orderNumber}`);
      return false;
    }

    const senderEmail = await getSenderEmail();
    const itemsList = order.products
      .map(item => `• ${item.name} (${item.size ? 'Size: ' + item.size : ''}) x ${item.quantity} - ₹${item.subtotal}`)
      .join('\n');

    const mailOptions = {
      from: `"Sakshi Clothing" <${senderEmail}>`,
      to: recipientEmail,
      subject: `Order ${order.orderNumber} Confirmed — Sakshi Clothing`,
      text: `Hello ${customerUser?.fullName || order.shippingAddress?.fullName || 'Customer'},\n\nGreat news! Your order ${order.orderNumber} has been ACCEPTED & CONFIRMED by Sakshi Clothing.\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ₹${order.totals?.grandTotal || 0}\nShipping Address: ${order.shippingAddress?.houseNumber || ''} ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}\n\nNote: All bespoke handcrafted couture orders follow our strict No Return Policy.\n\nTrack your order anytime at: ${process.env.CLIENT_URL || 'https://sakshiclothing.store'}/track-order\n\nAtelier Address: ${COMPANY_ADDRESS}\nContact: ${COMPANY_PHONE} | ${COMPANY_EMAIL}\n\nThank you for shopping with us!\nSakshi Clothing Atelier`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Order confirmation sent for ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send order confirmation email:`, error.message);
    return false;
  }
};

export const sendOrderRejectionEmail = async (order, customerUser, reason) => {
  try {
    const transporter = await getTransporter();
    const recipientEmail = customerUser?.email || order.shippingAddress?.email;
    if (!transporter || !recipientEmail) {
      console.log(`[Email Notice] SMTP not configured. Skipping rejection email for ${order.orderNumber}`);
      return false;
    }

    const senderEmail = await getSenderEmail();
    const mailOptions = {
      from: `"Sakshi Clothing" <${senderEmail}>`,
      to: recipientEmail,
      subject: `Order ${order.orderNumber} Cancelled — Sakshi Clothing`,
      text: `Hello ${customerUser?.fullName || order.shippingAddress?.fullName || 'Customer'},\n\nWe regret to inform you that your order ${order.orderNumber} has been CANCELLED.\n\nReason for Cancellation:\n${reason}\n\nIf any payment was debited, a full refund will be processed back to your original payment method.\n\nSupport Contact: ${COMPANY_PHONE} | ${COMPANY_EMAIL}\nSakshi Clothing Atelier, ${COMPANY_ADDRESS}\n\nSakshi Clothing Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Order cancellation email sent for ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send order cancellation email:`, error.message);
    return false;
  }
};

export const sendSubscriberWelcomeEmail = async (subscriber) => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[Email Notice] SMTP not configured. Skipping welcome email for subscriber: ${subscriber.email}`);
      return false;
    }

    const senderEmail = await getSenderEmail();
    const clientUrl = process.env.CLIENT_URL || 'https://sakshiclothing.store';
    const recipientName = subscriber.name && subscriber.name !== 'Patron' ? subscriber.name : 'Valued Patron';

    const htmlContent = `
      <div style="background-color:#12100e;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f5f2eb;line-height:1.6;">
        <div style="max-width:600px;margin:0 auto;background:#1a1714;border:1px solid #3d342a;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <div style="background:linear-gradient(135deg,#2b2319,#1a1714);padding:36px 30px;text-align:center;border-bottom:1px solid #3d342a;">
            <div style="font-size:26px;letter-spacing:0.3em;color:#ffffff;font-weight:300;">SAKSHI</div>
            <div style="font-size:9px;letter-spacing:0.4em;color:#e5a93c;text-transform:uppercase;margin-top:6px;">THE ATELIER CIRCLE · SURAT</div>
          </div>
          <div style="padding:40px 30px;">
            <div style="display:inline-block;padding:5px 14px;background:rgba(229,169,60,0.15);border:1px solid rgba(229,169,60,0.3);color:#f7c86a;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;border-radius:100px;margin-bottom:20px;">
              INVITATION CONFIRMED
            </div>
            <h2 style="font-size:22px;color:#ffffff;font-weight:400;margin:0 0 16px 0;line-height:1.3;">
              Welcome to the Sakshi Atelier Circle, ${recipientName}
            </h2>
            <p style="color:#b8b0a5;font-size:14px;margin-bottom:24px;">
              You now have private circle privileges. As a distinguished member, you will receive first notifications regarding new collection drops, limited jewellery suites, and seasonal atelier updates.
            </p>
            <div style="background:#141210;border-left:3px solid #e5a93c;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:28px;">
              <p style="margin:0;font-size:12px;color:#d4ccbe;">
                <strong>Maison Craftsmanship & Policy:</strong> Each creation is handcrafted by master artisans with pure fabrics. All orders are bespoke and subject to our strict No Return Policy.
              </p>
            </div>
            <div style="text-align:center;margin:32px 0 16px 0;">
              <a href="${clientUrl}/shop" style="display:inline-block;background:#e5a93c;color:#12100e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;padding:14px 32px;border-radius:14px;text-decoration:none;">
                Explore Collections
              </a>
            </div>
          </div>
          <div style="background:#12100e;padding:24px 30px;border-top:1px solid #29241e;font-size:11px;color:#78716c;text-align:center;line-height:1.7;">
            <strong>Sakshi Clothing Atelier</strong><br>
            ${COMPANY_ADDRESS}<br>
            Helpline: ${COMPANY_PHONE} &bull; Email: ${COMPANY_EMAIL}<br>
            &copy; 2026 Sakshi Clothing Private Limited. All Rights Reserved.
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Sakshi Clothing Atelier" <${senderEmail}>`,
      to: subscriber.email,
      subject: `Welcome to The Sakshi Atelier Circle — Private Previews & Drops`,
      text: `Hello ${recipientName},\n\nWelcome to the Sakshi Atelier Circle! You are now subscribed to receive private previews of our newest collections and exclusive atelier announcements.\n\nAtelier Address: ${COMPANY_ADDRESS}\nContact: ${COMPANY_PHONE} | ${COMPANY_EMAIL}\nStrict No Return Policy on all bespoke handcrafted garments.\n\nExplore our collections: ${clientUrl}/shop\n\nWarm regards,\nSakshi Clothing Atelier`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Real welcome email sent to subscriber: ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send subscriber welcome email:`, error.message);
    return false;
  }
};

export const sendSubscriberBroadcastEmail = async ({ to, name, heading, description, ctaLink, ctaText }) => {
  const transporter = await getTransporter();
  if (!transporter) {
    throw new Error('SMTP Email Service is not configured. Please enter your Gmail address and App Password in SMTP Settings.');
  }

  const recipientName = name && name !== 'Patron' ? name : 'Valued Patron';
  const clientUrl = process.env.CLIENT_URL || 'https://sakshiclothing.store';
  const finalCtaLink = ctaLink ? (ctaLink.startsWith('http') ? ctaLink : `${clientUrl}${ctaLink.startsWith('/') ? '' : '/'}${ctaLink}`) : `${clientUrl}/shop`;
  const finalCtaText = ctaText || 'View Collection Drop';
  const senderEmail = await getSenderEmail();

  const htmlContent = `
    <div style="background-color:#12100e;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f5f2eb;line-height:1.6;">
      <div style="max-width:600px;margin:0 auto;background:#1a1714;border:1px solid #3d342a;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#2b2319,#1a1714);padding:36px 30px;text-align:center;border-bottom:1px solid #3d342a;">
          <div style="font-size:26px;letter-spacing:0.3em;color:#ffffff;font-weight:300;">SAKSHI</div>
          <div style="font-size:9px;letter-spacing:0.4em;color:#e5a93c;text-transform:uppercase;margin-top:6px;">ATELIER PRIVATE CIRCLE ANNOUNCEMENT</div>
        </div>
        <div style="padding:40px 30px;">
          <div style="display:inline-block;padding:5px 14px;background:rgba(229,169,60,0.15);border:1px solid rgba(229,169,60,0.3);color:#f7c86a;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;border-radius:100px;margin-bottom:20px;">
            PATRON CIRCLE UPDATE
          </div>
          <h2 style="font-size:24px;color:#ffffff;font-weight:400;margin:0 0 16px 0;line-height:1.3;">
            ${heading}
          </h2>
          <p style="color:#b8b0a5;font-size:14px;margin-bottom:16px;">
            Dear ${recipientName},
          </p>
          <div style="color:#e2ded7;font-size:14px;line-height:1.8;white-space:pre-line;margin-bottom:30px;">
            ${description}
          </div>
          <div style="text-align:center;margin:32px 0 20px 0;">
            <a href="${finalCtaLink}" style="display:inline-block;background:#e5a93c;color:#12100e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;padding:15px 36px;border-radius:14px;text-decoration:none;box-shadow:0 8px 24px rgba(229,169,60,0.35);">
              ${finalCtaText} &rarr;
            </a>
          </div>
          <div style="background:#141210;border:1px solid #29241e;padding:14px 18px;border-radius:12px;margin-top:28px;">
            <p style="margin:0;font-size:11px;color:#a8a29e;text-align:center;">
              ✦ Handcrafted in Surat &bull; Quality Certified Apparel &bull; Strict No Return Policy on Bespoke Orders
            </p>
          </div>
        </div>
        <div style="background:#12100e;padding:24px 30px;border-top:1px solid #29241e;font-size:11px;color:#78716c;text-align:center;line-height:1.7;">
          <strong>Sakshi Clothing Atelier</strong><br>
          ${COMPANY_ADDRESS}<br>
          Helpline: ${COMPANY_PHONE} &bull; Email: ${COMPANY_EMAIL}<br>
          &copy; 2026 Sakshi Clothing Private Limited. All Rights Reserved.
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Sakshi Clothing Atelier" <${senderEmail}>`,
    to,
    subject: `${heading} — Sakshi Clothing Atelier`,
    text: `Hello ${recipientName},\n\n${heading}\n\n${description}\n\nView details: ${finalCtaLink}\n\nAtelier Address: ${COMPANY_ADDRESS}\nHelpline: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}\nStrict No Return Policy on bespoke couture.\n\nWarm regards,\nSakshi Clothing Atelier`,
    html: htmlContent
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`[Email Success] Real broadcast email dispatched to ${to} (MessageId: ${result.messageId})`);
  return true;
};
