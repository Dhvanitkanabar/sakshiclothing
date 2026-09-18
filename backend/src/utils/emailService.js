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

export const sendOrderConfirmationEmail = async (order, customerUser) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = customerUser?.email || order.shippingAddress?.email;
    if (!transporter || !recipientEmail) {
      console.log(`[Email Notice] SMTP not configured. Skipping confirmation email for ${order.orderNumber}`);
      return false;
    }

    const fromAddress = process.env.EMAIL_FROM || 'no-reply@sakshiclothing.store';
    const itemsList = order.products
      .map(item => `• ${item.name} (${item.size ? 'Size: ' + item.size : ''}) x ${item.quantity} - ₹${item.subtotal}`)
      .join('\n');

    const mailOptions = {
      from: `"Sakshi Clothing" <${fromAddress}>`,
      to: recipientEmail,
      subject: `Order ${order.orderNumber} Confirmed — Sakshi Clothing`,
      text: `Hello ${customerUser?.fullName || order.shippingAddress?.fullName || 'Customer'},\n\nGreat news! Your order ${order.orderNumber} has been ACCEPTED & CONFIRMED by Sakshi Clothing.\n\nOrder Details:\n${itemsList}\n\nTotal Amount: ₹${order.totals?.grandTotal || 0}\nShipping Address: ${order.shippingAddress?.houseNumber || ''} ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}\n\nTrack your order anytime at: ${process.env.CLIENT_URL || 'https://sakshiclothing.store'}/track-order\n\nThank you for shopping with us!\nSakshi Clothing Team`
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

    const fromAddress = process.env.EMAIL_FROM || 'no-reply@sakshiclothing.store';

    const mailOptions = {
      from: `"Sakshi Clothing" <${fromAddress}>`,
      to: recipientEmail,
      subject: `Order ${order.orderNumber} Cancelled — Sakshi Clothing`,
      text: `Hello ${customerUser?.fullName || order.shippingAddress?.fullName || 'Customer'},\n\nWe regret to inform you that your order ${order.orderNumber} has been CANCELLED.\n\nReason for Cancellation:\n${reason}\n\nIf any payment was debited, a full refund will be processed back to your original payment method.\n\nIf you have any questions, please contact support.\n\nSakshi Clothing Team`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Order cancellation email sent for ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send order cancellation email:`, error.message);
    return false;
  }
};
