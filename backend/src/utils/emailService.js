import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass }
  });
};

const DEFAULT_SENDER = process.env.EMAIL_FROM || 'sakshiclothing2025@gmail.com';
const COMPANY_ADDRESS = 'G-903 Sentosa Heights, Utran, Surat, Gujarat, India';
const COMPANY_PHONE = '+91 9316533660';
const COMPANY_EMAIL = 'sakshiclothing2025@gmail.com';

export const sendOrderConfirmationEmail = async (order, customerUser) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = customerUser?.email || order.shippingAddress?.email;
    if (!transporter || !recipientEmail) {
      console.log(`[Email Notice] SMTP not configured. Skipping confirmation email for ${order.orderNumber}`);
      return false;
    }

    const itemsList = order.products
      .map(item => `• ${item.name} (${item.size ? 'Size: ' + item.size : ''}) x ${item.quantity} - ₹${item.subtotal}`)
      .join('\n');

    const mailOptions = {
      from: `"Sakshi Clothing" <${DEFAULT_SENDER}>`,
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
    const transporter = createTransporter();
    const recipientEmail = customerUser?.email || order.shippingAddress?.email;
    if (!transporter || !recipientEmail) {
      console.log(`[Email Notice] SMTP not configured. Skipping rejection email for ${order.orderNumber}`);
      return false;
    }

    const mailOptions = {
      from: `"Sakshi Clothing" <${DEFAULT_SENDER}>`,
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
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[Email Notice] SMTP not configured. Welcome email logged for subscriber: ${subscriber.email}`);
      return true;
    }

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
              You now have private circle privileges. As a distinguished member, you will receive first notifications regarding new handcrafted bridal trousseau drops, limited heirloom jewellery suites, and seasonal atelier updates.
            </p>
            <div style="background:#141210;border-left:3px solid #e5a93c;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:28px;">
              <p style="margin:0;font-size:12px;color:#d4ccbe;">
                <strong>Maison Craftsmanship & Policy:</strong> Each creation is handwoven by master artisans with Silk Mark certification. All orders are bespoke and subject to our strict No Return Policy.
              </p>
            </div>
            <div style="text-align:center;margin:32px 0 16px 0;">
              <a href="${clientUrl}/shop" style="display:inline-block;background:#e5a93c;color:#12100e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;padding:14px 32px;border-radius:14px;text-decoration:none;">
                Explore Private Archive
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
      from: `"Sakshi Clothing Atelier" <${DEFAULT_SENDER}>`,
      to: subscriber.email,
      subject: `Welcome to The Sakshi Atelier Circle — Private Previews & Drops`,
      text: `Hello ${recipientName},\n\nWelcome to the Sakshi Atelier Circle! You are now subscribed to receive private previews of our newest collections and exclusive atelier announcements.\n\nAtelier Address: ${COMPANY_ADDRESS}\nContact: ${COMPANY_PHONE} | ${COMPANY_EMAIL}\nStrict No Return Policy on all bespoke handcrafted garments.\n\nExplore our collections: ${clientUrl}/shop\n\nWarm regards,\nSakshi Clothing Atelier`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Welcome email sent to subscriber: ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send subscriber welcome email:`, error.message);
    return false;
  }
};

export const sendSubscriberBroadcastEmail = async ({ to, name, heading, description, ctaLink, ctaText }) => {
  try {
    const transporter = createTransporter();
    const recipientName = name && name !== 'Patron' ? name : 'Valued Patron';
    const clientUrl = process.env.CLIENT_URL || 'https://sakshiclothing.store';
    const finalCtaLink = ctaLink ? (ctaLink.startsWith('http') ? ctaLink : `${clientUrl}${ctaLink.startsWith('/') ? '' : '/'}${ctaLink}`) : `${clientUrl}/shop`;
    const finalCtaText = ctaText || 'View Collection Drop';

    if (!transporter) {
      console.log(`[Broadcast Simulated] Email to ${to} (${recipientName}): [${heading}] -> ${description}`);
      return true;
    }

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
                ✦ Handcrafted in Surat &bull; 100% Certified Mulberry Silks &bull; Strict No Return Policy on Bespoke Orders
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
      from: `"Sakshi Clothing Atelier" <${DEFAULT_SENDER}>`,
      to,
      subject: `${heading} — Sakshi Clothing Atelier`,
      text: `Hello ${recipientName},\n\n${heading}\n\n${description}\n\nView details: ${finalCtaLink}\n\nAtelier Address: ${COMPANY_ADDRESS}\nHelpline: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}\nStrict No Return Policy on bespoke couture.\n\nWarm regards,\nSakshi Clothing Atelier`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send broadcast email to ${to}:`, error.message);
    return false;
  }
};
