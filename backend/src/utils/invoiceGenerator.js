/**
 * Generates a printable HTML invoice for an order.
 * No external dependencies — pure HTML/CSS.
 */
export const generateInvoiceHTML = (order) => {
  const invoiceNumber = order.invoice?.invoiceNumber || `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const itemsTotal    = order.totals?.itemsTotal    || 0;
  const taxes         = order.totals?.taxes         || 0;
  const shippingCharges = order.totals?.shippingCharges || 0;
  const discount      = order.totals?.discount      || 0;
  const grandTotal    = order.totals?.grandTotal    || 0;

  const gstRate       = 0.18; // 18% GST
  const baseAmount    = itemsTotal / (1 + gstRate);
  const cgst          = (itemsTotal - baseAmount) / 2;
  const sgst          = cgst;

  const fmt = (n) => `₹${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const itemsHTML = order.products?.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.size || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.color || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${fmt(item.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${fmt(item.subtotal)}</td>
    </tr>
  `).join('') || '';

  const addr = order.shippingAddress;
  const addrHTML = addr
    ? `${addr.fullName}<br>${addr.houseNumber}, ${addr.street}, ${addr.area || ''}<br>${addr.city}, ${addr.state} — ${addr.pincode}<br>${addr.country}<br>📞 ${addr.phone}`
    : 'N/A';

  const customer = order.customer || {};
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber} — Sakshi Clothing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;color:#111;background:#f8f8f8;padding:30px;}
    .page{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 4px 40px rgba(0,0,0,.08);border-radius:16px;overflow:hidden;}
    .header{background:#111;color:#fff;padding:40px;display:flex;justify-content:space-between;align-items:center;}
    .brand{font-size:24px;font-weight:700;letter-spacing:.05em;}
    .brand-sub{font-size:11px;letter-spacing:.15em;opacity:.6;margin-top:4px;}
    .invoice-meta{text-align:right;}
    .invoice-title{font-size:28px;font-weight:300;letter-spacing:.1em;opacity:.9;}
    .invoice-number{font-size:13px;opacity:.7;margin-top:4px;}
    .invoice-date{font-size:12px;opacity:.6;margin-top:2px;}
    .body{padding:40px;}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;}
    .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#888;margin-bottom:8px;}
    .value{font-size:13px;line-height:1.7;color:#333;}
    .value strong{color:#111;}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;}
    thead tr{background:#f8f8f8;}
    th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#888;}
    th:nth-child(n+4){text-align:center;}
    th:nth-child(5),th:nth-child(6){text-align:right;}
    .totals{max-width:320px;margin-left:auto;}
    .totals-row{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid #f0f0f0;color:#555;}
    .totals-row.grand{padding:12px 0;font-size:16px;font-weight:700;color:#111;border-top:2px solid #111;border-bottom:none;}
    .badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;}
    .badge.paid{background:#e8fdf2;color:#18794e;}
    .badge.pending{background:#fff8e6;color:#b45309;}
    .footer{padding:24px 40px;background:#f8f8f8;border-top:1px solid #ebebeb;display:flex;justify-content:space-between;align-items:center;}
    .footer-left{font-size:11px;color:#888;line-height:1.6;}
    .gst-section{background:#f8f8f8;border-radius:10px;padding:16px 20px;margin-bottom:24px;}
    .gst-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#888;margin-bottom:10px;}
    .gst-row{display:flex;justify-content:space-between;font-size:12px;color:#555;padding:3px 0;}
    @media print{
      body{background:#fff;padding:0;}
      .page{box-shadow:none;border-radius:0;}
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">SAKSHI</div>
        <div class="brand-sub">Clothing & Fashion</div>
        <div style="margin-top:16px;font-size:12px;opacity:.6;line-height:1.7;">
          Mumbai, Maharashtra, India<br>
          GST: 27AABCS1429B1Z1<br>
          support@sakshiclothing.in
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">#${invoiceNumber}</div>
        <div class="invoice-date">${invoiceDate}</div>
        <div style="margin-top:16px;">
          <span class="badge ${order.paymentStatus === 'completed' ? 'paid' : 'pending'}">
            ${order.paymentStatus === 'completed' ? '✓ Paid' : 'Payment Pending'}
          </span>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="grid2">
        <div>
          <div class="label">Bill To</div>
          <div class="value">
            <strong>${customer.fullName || addr?.fullName || 'Customer'}</strong><br>
            ${customer.email || '—'}<br>
            ${customer.phone || addr?.phone || '—'}
          </div>
        </div>
        <div>
          <div class="label">Ship To</div>
          <div class="value">${addrHTML}</div>
        </div>
        <div>
          <div class="label">Order Reference</div>
          <div class="value"><strong>${order.orderNumber}</strong></div>
        </div>
        <div>
          <div class="label">Order Status</div>
          <div class="value"><strong style="text-transform:capitalize;">${order.orderStatus}</strong></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Color</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="gst-section">
        <div class="gst-title">GST Breakdown (18%)</div>
        <div class="gst-row"><span>Taxable Amount</span><span>${fmt(baseAmount)}</span></div>
        <div class="gst-row"><span>CGST (9%)</span><span>${fmt(cgst)}</span></div>
        <div class="gst-row"><span>SGST (9%)</span><span>${fmt(sgst)}</span></div>
        <div class="gst-row"><span>Total Tax</span><span>${fmt(taxes || (cgst + sgst))}</span></div>
      </div>

      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(itemsTotal)}</span></div>
        <div class="totals-row"><span>Shipping</span><span>${shippingCharges > 0 ? fmt(shippingCharges) : 'Free'}</span></div>
        ${discount > 0 ? `<div class="totals-row" style="color:#16a34a;"><span>Discount</span><span>−${fmt(discount)}</span></div>` : ''}
        <div class="totals-row"><span>GST (18%)</span><span>${fmt(taxes || (cgst + sgst))}</span></div>
        <div class="totals-row grand"><span>Grand Total</span><span>${fmt(grandTotal)}</span></div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">
        Thank you for shopping with Sakshi Clothing.<br>
        For queries, contact us at support@sakshiclothing.in
      </div>
      <div style="font-size:11px;color:#ccc;text-align:right;">
        Generated on ${new Date().toLocaleDateString('en-IN')}<br>
        This is a computer-generated invoice.
      </div>
    </div>
  </div>
</body>
</html>`;
};
