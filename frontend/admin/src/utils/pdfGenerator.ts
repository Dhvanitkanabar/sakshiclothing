import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface OrderItemTaxDetail {
  name: string;
  categoryType: 'Clothing' | 'Jewellery';
  quantity: number;
  rate: number; // 0.05 or 0.03
  basePrice: number;
  gstAmount: number;
  finalPrice: number;
}

export interface ProcessedOrderTax {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerContact: string;
  status: string;
  paymentMethod: string;
  itemsSummary: string;
  clothingBase: number;
  clothingGst: number;
  jewelleryBase: number;
  jewelleryGst: number;
  totalBasePrice: number;
  totalGst: number;
  finalPrice: number;
  items: OrderItemTaxDetail[];
}

/**
 * Determine whether an item belongs to Jewellery (3% GST) or Clothing (5% GST).
 */
export const classifyItemTax = (item: any): { categoryType: 'Clothing' | 'Jewellery'; rate: number } => {
  const catName = (item.product?.category?.name || '').toLowerCase();
  const catSlug = (item.product?.category?.slug || '').toLowerCase();
  const itemName = (item.name || item.product?.name || '').toLowerCase();

  const isJewellery =
    catName.includes('jewel') ||
    catSlug.includes('jewel') ||
    catName.includes('necklace') ||
    catSlug.includes('necklace') ||
    catName.includes('earring') ||
    catSlug.includes('earring') ||
    catName.includes('bangle') ||
    catSlug.includes('bangle') ||
    catName.includes('ring') ||
    catName.includes('pendant') ||
    catName.includes('choker') ||
    itemName.includes('jewel') ||
    itemName.includes('necklace') ||
    itemName.includes('earring') ||
    itemName.includes('bangle') ||
    itemName.includes('ring') ||
    itemName.includes('pendant') ||
    itemName.includes('choker') ||
    itemName.includes('polki') ||
    itemName.includes('kundan');

  if (isJewellery) {
    return { categoryType: 'Jewellery', rate: 0.03 }; // 3% GST on Jewellery
  }
  return { categoryType: 'Clothing', rate: 0.05 }; // 5% GST on Clothing
};

/**
 * Compute the itemized tax breakdown for an order.
 */
export const processOrderTax = (order: any): ProcessedOrderTax => {
  const items = (order.products && order.products.length > 0)
    ? order.products
    : (order.items && order.items.length > 0 ? order.items : []);

  let clothingBase = 0;
  let clothingGst = 0;
  let jewelleryBase = 0;
  let jewelleryGst = 0;
  const processedItems: OrderItemTaxDetail[] = [];

  const rawGrandTotal = Number(order.totals?.grandTotal || 0);

  if (items.length > 0) {
    items.forEach((item: any) => {
      const { categoryType, rate } = classifyItemTax(item);
      const qty = Number(item.quantity) || 1;
      const itemSubtotal = Number(item.subtotal || (Number(item.price || 0) * qty));

      // Calculate Base and GST
      // If catalog price is base: base = subtotal, gst = subtotal * rate, final = base + gst
      // To strictly reconcile with stored grandTotal:
      const basePrice = Math.round(itemSubtotal / (1 + rate));
      const gstAmount = itemSubtotal - basePrice;
      const finalPrice = itemSubtotal;

      if (categoryType === 'Jewellery') {
        jewelleryBase += basePrice;
        jewelleryGst += gstAmount;
      } else {
        clothingBase += basePrice;
        clothingGst += gstAmount;
      }

      processedItems.push({
        name: item.name || item.product?.name || 'Item',
        categoryType,
        quantity: qty,
        rate,
        basePrice,
        gstAmount,
        finalPrice
      });
    });
  } else {
    // Fallback if no items array exists, classify as Clothing 5%
    const rate = 0.05;
    clothingBase = Math.round(rawGrandTotal / (1 + rate));
    clothingGst = rawGrandTotal - clothingBase;
  }

  const totalBasePrice = clothingBase + jewelleryBase;
  const totalGst = clothingGst + jewelleryGst;
  const finalPrice = rawGrandTotal || (totalBasePrice + totalGst);

  const itemsSummary = processedItems.map(p => `${p.name} [${p.categoryType} ${p.rate * 100}%] (x${p.quantity})`).join(', ') || 'N/A';

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : 'N/A';

  return {
    orderId: order._id,
    orderNumber: order.orderNumber || String(order._id).slice(-8).toUpperCase(),
    date: orderDate,
    customerName: order.customer?.fullName || order.shippingAddress?.fullName || 'Guest Customer',
    customerContact: order.customer?.email || order.shippingAddress?.phone || '',
    status: order.orderStatus || 'pending',
    paymentMethod: order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)',
    itemsSummary,
    clothingBase,
    clothingGst,
    jewelleryBase,
    jewelleryGst,
    totalBasePrice,
    totalGst,
    finalPrice,
    items: processedItems
  };
};

/**
 * Generate a luxury editorial PDF report of Order History with GST calculations.
 */
export const generateOrderHistoryPdf = (
  orders: any[],
  rangeLabel: string,
  dateInfo?: { startDate?: string; endDate?: string }
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Process all orders with GST calculations
  const processed = orders.map(processOrderTax);

  // Compute Grand Totals
  const totalOrdersCount = processed.length;
  const grandBasePrice = processed.reduce((sum, o) => sum + o.totalBasePrice, 0);
  const grandClothingGst = processed.reduce((sum, o) => sum + o.clothingGst, 0);
  const grandJewelleryGst = processed.reduce((sum, o) => sum + o.jewelleryGst, 0);
  const grandTotalGst = grandClothingGst + grandJewelleryGst;
  const grandFinalRevenue = processed.reduce((sum, o) => sum + o.finalPrice, 0);

  // ── Header Styling ──
  // Obsidian dark header band
  doc.setFillColor(28, 25, 23); // #1c1917
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Gold accent accent bar
  doc.setFillColor(217, 119, 6); // #d97706
  doc.rect(0, 75, pageWidth, 4, 'F');

  // Brand Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SAKSHI CLOTHING', 40, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(214, 211, 209);
  doc.text('Haute Couture & Bespoke Artisanal Fashion | Surat Atelier', 40, 52);

  // Right-aligned report metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('OFFICIAL ORDER HISTORY & GST AUDIT REPORT', pageWidth - 40, 32, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(214, 211, 209);
  const generatedDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${generatedDateStr} | Period: ${rangeLabel}`, pageWidth - 40, 48, { align: 'right' });
  if (dateInfo?.startDate && dateInfo?.endDate) {
    doc.text(`Filter Range: ${dateInfo.startDate} to ${dateInfo.endDate}`, pageWidth - 40, 62, { align: 'right' });
  }

  // ── Executive Summary KPI Cards ──
  const kpiY = 95;
  const kpiHeight = 52;
  const cardWidth = (pageWidth - 80 - 40) / 5; // 5 KPI cards

  const kpis = [
    { label: 'TOTAL ORDERS', value: `${totalOrdersCount}`, sub: 'Placed & Confirmed' },
    { label: 'BASE TAXABLE PRICE', value: `Rs. ${grandBasePrice.toLocaleString('en-IN')}`, sub: 'Excluding Taxes' },
    { label: 'CLOTHING GST (5%)', value: `Rs. ${grandClothingGst.toLocaleString('en-IN')}`, sub: 'Apparel 5% GST' },
    { label: 'JEWELLERY GST (3%)', value: `Rs. ${grandJewelleryGst.toLocaleString('en-IN')}`, sub: 'Jewellery 3% GST' },
    { label: 'FINAL GRAND REVENUE', value: `Rs. ${grandFinalRevenue.toLocaleString('en-IN')}`, sub: `Incl. Rs. ${grandTotalGst.toLocaleString('en-IN')} Total GST` }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = 40 + idx * (cardWidth + 10);
    doc.setFillColor(250, 248, 245); // Warm stone background
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(cardX, kpiY, cardWidth, kpiHeight, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text(kpi.label, cardX + 8, kpiY + 14);

    doc.setFontSize(11);
    doc.setTextColor(28, 25, 23);
    doc.text(kpi.value, cardX + 8, kpiY + 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(168, 162, 158);
    doc.text(kpi.sub, cardX + 8, kpiY + 44);
  });

  // ── Table Data Construction ──
  const tableHeaders = [
    ['#', 'Order ID', 'Date', 'Customer Details', 'Items & Tax Category', 'Price (Base)', 'GST Applied (3% / 5%)', 'Final Price']
  ];

  const tableRows = processed.map((o, idx) => {
    // Build GST Breakdown string
    const gstParts: string[] = [];
    if (o.clothingGst > 0) {
      gstParts.push(`Clothing (5%): Rs. ${o.clothingGst.toLocaleString('en-IN')}`);
    }
    if (o.jewelleryGst > 0) {
      gstParts.push(`Jewellery (3%): Rs. ${o.jewelleryGst.toLocaleString('en-IN')}`);
    }
    const gstString = gstParts.length > 0
      ? `${gstParts.join('\n')}\nTotal GST: Rs. ${o.totalGst.toLocaleString('en-IN')}`
      : `Rs. ${o.totalGst.toLocaleString('en-IN')}`;

    return [
      String(idx + 1),
      o.orderNumber,
      o.date,
      `${o.customerName}\n${o.customerContact}`,
      o.itemsSummary,
      `Rs. ${o.totalBasePrice.toLocaleString('en-IN')}`,
      gstString,
      `Rs. ${o.finalPrice.toLocaleString('en-IN')}`
    ];
  });

  // Add Grand Summary Footer Row in the Table
  tableRows.push([
    '',
    'GRAND TOTALS',
    `${totalOrdersCount} Orders`,
    'Consolidated Period Summary',
    `Clothing + Jewellery Total`,
    `Rs. ${grandBasePrice.toLocaleString('en-IN')}`,
    `Total GST: Rs. ${grandTotalGst.toLocaleString('en-IN')}\n(Clothing 5%: Rs. ${grandClothingGst.toLocaleString('en-IN')} | Jewellery 3%: Rs. ${grandJewelleryGst.toLocaleString('en-IN')})`,
    `Rs. ${grandFinalRevenue.toLocaleString('en-IN')}`
  ]);

  // Render Table via autoTable
  autoTable(doc, {
    startY: kpiY + kpiHeight + 16,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      overflow: 'linebreak',
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [250, 248, 245]
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 65 },
      3: { cellWidth: 110 },
      4: { cellWidth: 200 },
      5: { cellWidth: 80, halign: 'right' },
      6: { cellWidth: 130, halign: 'right' },
      7: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Highlight the grand summary row at the bottom
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 244];
        data.cell.styles.textColor = [28, 25, 23];
      }
    },
    didDrawPage: (data) => {
      // Page number and compliance notice footer
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(140, 130, 122);
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.text(str, pageWidth - 40, pageHeight - 16, { align: 'right' });
      doc.text(
        'Sakshi Clothing | Confidential Internal Tax & Sales Compliance Report | GST Rates: Jewellery 3%, Apparel/Clothing 5%',
        40,
        pageHeight - 16
      );
    }
  });

  const cleanFilename = `Sakshi_Order_History_Report_${rangeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(cleanFilename);
  return cleanFilename;
};

/**
 * Generate a luxury editorial PDF report of Inventory levels and valuations.
 */
export const generateInventoryPdf = (products: any[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let totalSkus = 0;
  let totalStockCount = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let totalValuation = 0;

  const rows: string[][] = [];

  products.forEach((p, idx) => {
    const variants = p.variants && p.variants.length > 0 ? p.variants : [];
    const stock = variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    const price = Number(p.pricing?.basePrice || p.basePrice || variants[0]?.price || 0);
    const valuation = stock * price;

    totalSkus += 1;
    totalStockCount += stock;
    totalValuation += valuation;

    let status = 'In Stock';
    if (stock === 0) {
      status = 'Out of Stock';
      outOfStockCount += 1;
    } else if (stock <= 5) {
      status = 'Low Stock';
      lowStockCount += 1;
    }

    const catName = p.category?.name || 'Apparel';
    const variantSizes = variants.map((v: any) => `${v.size || 'STD'}: ${v.stock ?? 0}`).join(', ') || 'N/A';

    rows.push([
      String(idx + 1),
      p.sku || String(p._id).slice(-8).toUpperCase(),
      p.name,
      catName,
      variantSizes,
      `Rs. ${price.toLocaleString('en-IN')}`,
      `${stock} units`,
      status,
      `Rs. ${valuation.toLocaleString('en-IN')}`
    ]);
  });

  // Header band
  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, pageWidth, 75, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 75, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SAKSHI CLOTHING', 40, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(214, 211, 209);
  doc.text('Inventory Valuation & Stock Status Report | Surat Atelier', 40, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('OFFICIAL INVENTORY & ASSET REPORT', pageWidth - 40, 32, { align: 'right' });

  const generatedDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(214, 211, 209);
  doc.text(`Generated: ${generatedDateStr} | Status: Live Sync`, pageWidth - 40, 48, { align: 'right' });

  // Summary KPI Cards
  const kpiY = 95;
  const kpiHeight = 52;
  const cardWidth = (pageWidth - 80 - 40) / 5;

  const kpis = [
    { label: 'TOTAL CATALOG PRODUCTS', value: `${totalSkus}`, sub: 'Active SKUs' },
    { label: 'TOTAL UNITS IN STOCK', value: `${totalStockCount}`, sub: 'Available Pieces' },
    { label: 'LOW STOCK ALERTS', value: `${lowStockCount}`, sub: 'Stock <= 5 units' },
    { label: 'OUT OF STOCK ITEMS', value: `${outOfStockCount}`, sub: 'Requires replenishment' },
    { label: 'TOTAL INVENTORY VALUATION', value: `Rs. ${totalValuation.toLocaleString('en-IN')}`, sub: 'At Atelier Base Price' }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = 40 + idx * (cardWidth + 10);
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(cardX, kpiY, cardWidth, kpiHeight, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text(kpi.label, cardX + 8, kpiY + 14);

    doc.setFontSize(11);
    doc.setTextColor(28, 25, 23);
    doc.text(kpi.value, cardX + 8, kpiY + 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(168, 162, 158);
    doc.text(kpi.sub, cardX + 8, kpiY + 44);
  });

  // Table
  const tableHeaders = [
    ['#', 'SKU / ID', 'Product Name', 'Category', 'Size Breakdown', 'Base Price', 'Stock Level', 'Status', 'Total Valuation']
  ];

  rows.push([
    '',
    'TOTALS',
    `${totalSkus} Products`,
    'All Categories',
    '',
    '',
    `${totalStockCount} units`,
    `${outOfStockCount} Out of Stock`,
    `Rs. ${totalValuation.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: kpiY + kpiHeight + 16,
    head: tableHeaders,
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      overflow: 'linebreak',
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [250, 248, 245]
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 160 },
      3: { cellWidth: 75 },
      4: { cellWidth: 130 },
      5: { cellWidth: 75, halign: 'right' },
      6: { cellWidth: 65, halign: 'center' },
      7: { cellWidth: 75, halign: 'center' },
      8: { cellWidth: 85, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 244];
        data.cell.styles.textColor = [28, 25, 23];
      }
    },
    didDrawPage: (data) => {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(140, 130, 122);
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.text(str, pageWidth - 40, pageHeight - 16, { align: 'right' });
      doc.text(
        'Sakshi Clothing Atelier | Internal Inventory & Warehouse Asset Valuation Document',
        40,
        pageHeight - 16
      );
    }
  });

  const cleanFilename = `Sakshi_Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(cleanFilename);
  return cleanFilename;
};

/**
 * Converts a numeric amount to Indian Rupee Words (e.g. 30000 -> Rupees Thirty Thousand Only)
 */
export const numberToWords = (num: number): string => {
  if (!num || num === 0) return 'Rupees Zero Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n] + ' ';
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + a[n % 10] : '') + ' ';
      }
    }
    return str.trim();
  };

  const rounded = Math.round(num);
  return `Rupees ${inWords(rounded)} Only`;
};

/**
 * Draws an authentic vertical barcode strip pattern in jsPDF
 */
export const drawBarcodeStrip = (doc: jsPDF, x: number, y: number, width: number, height: number, code: string) => {
  doc.setFillColor(20, 20, 20);
  const pattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 2, 1, 4, 1, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2];
  let curX = x;
  let i = 0;
  while (curX < x + width) {
    const barWidth = pattern[i % pattern.length] * 0.85;
    const gapWidth = (((pattern[(i + 3) % pattern.length]) % 3) + 1) * 0.85;
    if (curX + barWidth <= x + width) {
      doc.rect(curX, y, barWidth, height, 'F');
    }
    curX += barWidth + gapWidth;
    i++;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text(`* ${code} *`, x + width / 2, y + height + 9, { align: 'center' });
};

/**
 * Generates an official Meesho/Amazon-style Tax Invoice & Shipping Label PDF.
 * Top section is the parcel shipping label with barcode, addresses, COD/Prepaid badge.
 * Bottom section is the official GST Tax Invoice with 3% Jewellery and 5% Clothing GST breakdown.
 */
export const generateShippingInvoicePdf = (order: any, autoDownload = true) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const orderNum = order.orderNumber || String(order._id || '').slice(-8).toUpperCase();
  const rawGrandTotal = Number(order.totals?.grandTotal || 0);
  const isCod = order.payment?.method === 'cod';

  // Dates
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN');
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Customer Shipping Details
  const shipAddr = order.shippingAddress || {};
  const custName = shipAddr.fullName || order.customer?.fullName || 'Valued Customer';
  const custPhone = shipAddr.phone || order.customer?.phone || 'N/A';
  const custEmail = order.customer?.email || 'N/A';
  const house = shipAddr.houseNumber || '';
  const street = shipAddr.street || '';
  const area = shipAddr.area || '';
  const city = shipAddr.city || 'Jaipur';
  const state = shipAddr.state || 'Rajasthan';
  const country = shipAddr.country || 'India';
  const pincode = shipAddr.pincode || '302001';
  const landmark = shipAddr.landmark ? `Landmark: ${shipAddr.landmark}` : '';

  // Products Tax Processing
  const items = (order.products && order.products.length > 0)
    ? order.products
    : (order.items && order.items.length > 0 ? order.items : []);

  let totalQty = 0;
  let totalBase = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGstAmount = 0;

  const invoiceRows: any[] = [];

  items.forEach((item: any, idx: number) => {
    const { categoryType, rate } = classifyItemTax(item);
    const qty = Number(item.quantity) || 1;
    totalQty += qty;

    const itemSubtotal = Number(item.subtotal || (Number(item.price || 0) * qty));
    const base = Math.round(itemSubtotal / (1 + rate));
    const gst = itemSubtotal - base;
    const cgst = Math.round(gst / 2);
    const sgst = gst - cgst;

    totalBase += base;
    totalCgst += cgst;
    totalSgst += sgst;
    totalGstAmount += gst;

    const hsn = categoryType === 'Jewellery' ? '7113' : '6204';
    const ratePercent = categoryType === 'Jewellery' ? '3%' : '5%';

    invoiceRows.push([
      String(idx + 1),
      `${item.name || 'Product Item'}\nSKU: ${item.sku || 'N/A'} | Size: ${item.size || 'STD'} | Color: ${item.color || 'Standard'}`,
      hsn,
      String(qty),
      `Rs. ${Math.round(base / qty).toLocaleString('en-IN')}`,
      `Rs. ${base.toLocaleString('en-IN')}`,
      `${categoryType}\n(${ratePercent})`,
      `Rs. ${cgst.toLocaleString('en-IN')}\n(${categoryType === 'Jewellery' ? '1.5%' : '2.5%'})`,
      `Rs. ${sgst.toLocaleString('en-IN')}\n(${categoryType === 'Jewellery' ? '1.5%' : '2.5%'})`,
      `Rs. ${itemSubtotal.toLocaleString('en-IN')}`
    ]);
  });

  if (items.length === 0) {
    const rate = 0.05;
    const base = Math.round(rawGrandTotal / (1 + rate));
    const gst = rawGrandTotal - base;
    const cgst = Math.round(gst / 2);
    const sgst = gst - cgst;
    totalQty = 1;
    totalBase = base;
    totalCgst = cgst;
    totalSgst = sgst;
    totalGstAmount += gst;

    invoiceRows.push([
      '1',
      'Artisanal Bespoke Order',
      '6204',
      '1',
      `Rs. ${base.toLocaleString('en-IN')}`,
      `Rs. ${base.toLocaleString('en-IN')}`,
      'Clothing (5%)',
      `Rs. ${cgst.toLocaleString('en-IN')}`,
      `Rs. ${sgst.toLocaleString('en-IN')}`,
      `Rs. ${rawGrandTotal.toLocaleString('en-IN')}`
    ]);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: TOP SHIPPING LABEL / PACKAGE ROUTING SLIP (Y: 20 to 345)
  // ═══════════════════════════════════════════════════════════════════
  const labelX = 22;
  const labelY = 20;
  const labelW = pageWidth - 44; // 551.28 pt
  const labelH = 325;

  // Outer border of shipping label
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(1.2);
  doc.rect(labelX, labelY, labelW, labelH);

  // Top Title Bar
  doc.setFillColor(28, 25, 23);
  doc.rect(labelX, labelY, labelW, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('SAKSHI CLOTHING ATELIER', labelX + 12, labelY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(214, 211, 209);
  doc.text('EXPRESS SURFACE LOGISTICS | SURAT ATELIER', labelX + 12, labelY + 32);

  // Top-Right Payment Mode Badge (Very Prominent like Meesho/Delhivery)
  const payBadgeW = 210;
  const payBadgeH = 28;
  const payBadgeX = labelX + labelW - payBadgeW - 6;
  const payBadgeY = labelY + 4;

  if (isCod) {
    doc.setFillColor(185, 28, 28); // Red
    doc.roundedRect(payBadgeX, payBadgeY, payBadgeW, payBadgeH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('CASH ON DELIVERY (COD)', payBadgeX + payBadgeW / 2, payBadgeY + 12, { align: 'center' });
    doc.setFontSize(10.5);
    doc.text(`COLLECT CASH: Rs. ${rawGrandTotal.toLocaleString('en-IN')}`, payBadgeX + payBadgeW / 2, payBadgeY + 24, { align: 'center' });
  } else {
    doc.setFillColor(16, 185, 129); // Emerald
    doc.roundedRect(payBadgeX, payBadgeY, payBadgeW, payBadgeH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('PREPAID PARCEL (ONLINE VERIFIED)', payBadgeX + payBadgeW / 2, payBadgeY + 12, { align: 'center' });
    doc.setFontSize(10.5);
    doc.text(`PAID IN FULL: Rs. ${rawGrandTotal.toLocaleString('en-IN')}`, payBadgeX + payBadgeW / 2, payBadgeY + 24, { align: 'center' });
  }

  // Barcode & Tracking Row
  const barY = labelY + 42;
  const barcodeW = 180;
  const barcodeH = 24;
  drawBarcodeStrip(doc, labelX + 14, barY + 4, barcodeW, barcodeH, orderNum);

  // AWB & Routing Box next to Barcode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  const awbStr = order.tracking?.trackingNumber || `AWB-SC-${orderNum}`;
  const courierStr = order.tracking?.courierName || 'BlueDart Express / Delhivery Surface';
  doc.text(`TRACKING AWB: ${awbStr}`, labelX + 215, barY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Courier Partner: ${courierStr}`, labelX + 215, barY + 26);
  doc.text(`Order Ref: #${orderNum} | Date: ${orderDate}`, labelX + 215, barY + 38);

  // Large Pincode Routing Hub Box (Like Delhivery)
  const pinBoxX = labelX + labelW - 110;
  const pinBoxY = barY + 4;
  doc.setFillColor(245, 245, 244);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1);
  doc.rect(pinBoxX, pinBoxY, 100, 36, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('DESTINATION PIN', pinBoxX + 50, pinBoxY + 11, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(pincode, pinBoxX + 50, pinBoxY + 28, { align: 'center' });

  // Dividing Line inside label
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.8);
  doc.line(labelX, labelY + 92, labelX + labelW, labelY + 92);

  // Two Address Columns
  const addrY = labelY + 104;

  // Left Column: DELIVER TO (Customer)
  const col1X = labelX + 12;
  const col1W = 265;
  doc.setFillColor(244, 244, 245);
  doc.rect(col1X - 4, addrY - 4, col1W, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('DELIVER TO / SHIP TO (CONSIGNEE):', col1X, addrY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(custName, col1X, addrY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);

  let curAddrY = addrY + 41;
  const addrLines = [
    [house, street].filter(Boolean).join(', '),
    area,
    [city, state].filter(Boolean).join(', '),
    landmark,
    `PIN CODE: ${pincode} (${country})`,
    `Phone: ${custPhone}`,
    `Email: ${custEmail}`
  ].filter(Boolean);

  addrLines.forEach(line => {
    doc.text(line, col1X, curAddrY);
    curAddrY += 12;
  });

  // Vertical Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(labelX + 285, labelY + 92, labelX + 285, labelY + 290);

  // Right Column: RETURN / SOLD BY (Sakshi Atelier)
  const col2X = labelX + 295;
  const col2W = labelW - 305;
  doc.setFillColor(244, 244, 245);
  doc.rect(col2X - 4, addrY - 4, col2W, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('DISPATCHED & SOLD BY (SELLER):', col2X, addrY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Sakshi Clothing Atelier', col2X, addrY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);

  const sellerLines = [
    'Haute Couture & Artisanal Garments',
    'G-903 Sentosa Heights, Utran',
    'Surat, Gujarat - 394105, India',
    'GSTIN: 24AAACS1234F1Z8',
    'Support Email: sakshiclothing2025@gmail.com',
    'Client Helpline: +91 9316533660',
    'Policy: STRICT NO-RETURN POLICY'
  ];

  let curSellerY = addrY + 41;
  sellerLines.forEach(line => {
    doc.text(line, col2X, curSellerY);
    curSellerY += 12;
  });

  // Bottom Info Strip of Label
  doc.setDrawColor(200, 200, 200);
  doc.line(labelX, labelY + 290, labelX + labelW, labelY + 290);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`TOTAL PIECES: ${totalQty} Item(s)`, labelX + 12, labelY + 308);
  doc.setFont('helvetica', 'normal');
  doc.text(`Origin: Surat Atelier`, labelX + labelW - 12, labelY + 308, { align: 'right' });

  // Return Notice
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text(
    'If undelivered, return to: Sakshi Clothing, G-903 Sentosa Heights, Utran, Surat, Gujarat - 394105, Mobile: 9316533660',
    labelX + 12,
    labelY + 320
  );

  // ═══════════════════════════════════════════════════════════════════
  // CUT / FOLD DOTTED LINE (Y = 358)
  // ═══════════════════════════════════════════════════════════════════
  const cutY = labelY + labelH + 15;
  doc.setDrawColor(120, 120, 120);
  doc.setLineDashPattern([4, 3], 0);
  doc.line(20, cutY, pageWidth - 20, cutY);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    '✂  FOLD OR CUT ALONG THIS LINE TO AFFIX TOP PORTION AS PACKAGE SHIPPING LABEL  ✂',
    pageWidth / 2,
    cutY - 3,
    { align: 'center' }
  );

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: OFFICIAL TAX INVOICE & GST BREAKDOWN (Y: 375 to 825)
  // ═══════════════════════════════════════════════════════════════════
  const invY = cutY + 12;

  // Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(28, 25, 23);
  doc.text('ORIGINAL TAX INVOICE', pageWidth / 2, invY + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text(
    '(Issued under Section 31 of CGST Act, 2017 read with Rule 46 of CGST Rules, 2017)',
    pageWidth / 2,
    invY + 22,
    { align: 'center' }
  );

  // Invoice Metadata Table Box
  const metaBoxY = invY + 28;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.8);
  doc.rect(labelX, metaBoxY, labelW, 46);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text(`Invoice No: INV/2026-27/${orderNum}`, labelX + 10, metaBoxY + 14);
  doc.text(`Invoice Date: ${invoiceDate}`, labelX + 10, metaBoxY + 27);
  doc.text(`State of Supply: ${state}`, labelX + 10, metaBoxY + 40);

  doc.text(`Order Number: #${orderNum}`, labelX + 195, metaBoxY + 14);
  doc.text(`Order Date: ${orderDate}`, labelX + 195, metaBoxY + 27);
  doc.text(`Reverse Charge Applicable: No`, labelX + 195, metaBoxY + 40);

  const payModeStr = isCod ? 'Cash on Delivery (Pending)' : 'Online Prepaid (Razorpay)';
  doc.text(`Payment Mode: ${payModeStr}`, labelX + 375, metaBoxY + 14);
  doc.text(`Txn ID: ${order.payment?.transactionId || 'TXN-' + orderNum}`, labelX + 375, metaBoxY + 27);
  doc.text(`Payment Status: ${order.paymentStatus || 'completed'}`, labelX + 375, metaBoxY + 40);

  // Itemized Tax Table via autoTable
  const taxTableY = metaBoxY + 54;
  const taxHeaders = [
    ['#', 'Item Description', 'HSN', 'Qty', 'Unit Price', 'Taxable Val', 'Category', 'CGST', 'SGST', 'Total']
  ];

  invoiceRows.push([
    '',
    'TOTALS & TAX RECONCILIATION',
    '',
    String(totalQty),
    '',
    `Rs. ${totalBase.toLocaleString('en-IN')}`,
    'GST Total',
    `Rs. ${totalCgst.toLocaleString('en-IN')}`,
    `Rs. ${totalSgst.toLocaleString('en-IN')}`,
    `Rs. ${rawGrandTotal.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: taxTableY,
    head: taxHeaders,
    body: invoiceRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4.5,
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [252, 251, 249]
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 150 },
      2: { cellWidth: 38, halign: 'center' },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 52, halign: 'right' },
      5: { cellWidth: 58, halign: 'right' },
      6: { cellWidth: 54, halign: 'center' },
      7: { cellWidth: 46, halign: 'right' },
      8: { cellWidth: 46, halign: 'right' },
      9: { cellWidth: 63, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.row.index === invoiceRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 244];
        data.cell.styles.textColor = [28, 25, 23];
      }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || (taxTableY + 120);

  // Amount in Words & Terms (Left)
  const wordsX = labelX;
  const wordsY = finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(28, 25, 23);
  doc.text('Invoice Amount in Words:', wordsX, wordsY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6);
  doc.text(numberToWords(rawGrandTotal), wordsX, wordsY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Terms & Conditions:', wordsX, wordsY + 28);
  doc.text('1. Handcrafted bespoke couture. All taxes collected under Indian GST Act 2017.', wordsX, wordsY + 38);
  doc.text('2. Rate Breakdown: Jewellery items charged at 3% GST; Apparel/Clothing charged at 5% GST.', wordsX, wordsY + 48);
  doc.text('3. Any legal disputes are subject to the exclusive jurisdiction of courts in Surat, Gujarat.', wordsX, wordsY + 58);
  doc.text('4. This is an electronically generated and digitally authenticated tax invoice.', wordsX, wordsY + 68);
  doc.text('5. Strict No-Return Policy: Bespoke made-to-measure couture & fine jewellery are strictly non-returnable.', wordsX, wordsY + 78);

  // Summary & Totals Block (Right)
  const sumW = 200;
  const sumX = labelX + labelW - sumW;
  const sumY = finalY + 10;

  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(220, 220, 220);
  doc.rect(sumX, sumY, sumW, 70, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Total Taxable Value:', sumX + 8, sumY + 14);
  doc.text(`Rs. ${totalBase.toLocaleString('en-IN')}`, sumX + sumW - 8, sumY + 14, { align: 'right' });

  doc.text('Total CGST Amount:', sumX + 8, sumY + 26);
  doc.text(`Rs. ${totalCgst.toLocaleString('en-IN')}`, sumX + sumW - 8, sumY + 26, { align: 'right' });

  doc.text('Total SGST Amount:', sumX + 8, sumY + 38);
  doc.text(`Rs. ${totalSgst.toLocaleString('en-IN')}`, sumX + sumW - 8, sumY + 38, { align: 'right' });

  doc.text('Shipping & Handling:', sumX + 8, sumY + 50);
  doc.text('Rs. 0.00 (FREE)', sumX + sumW - 8, sumY + 50, { align: 'right' });

  doc.setFillColor(28, 25, 23);
  doc.rect(sumX, sumY + 54, sumW, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', sumX + 8, sumY + 67);
  doc.text(`Rs. ${rawGrandTotal.toLocaleString('en-IN')}`, sumX + sumW - 8, sumY + 67, { align: 'right' });

  // Authorized Signature Seal (Far Right)
  const sigY = sumY + 82;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);
  doc.text('For SAKSHI CLOTHING ATELIER', sumX + sumW - 8, sigY, { align: 'right' });

  // Stamp Box
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.roundedRect(sumX + sumW - 130, sigY + 5, 122, 28, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text('DIGITALLY VERIFIED', sumX + sumW - 69, sigY + 16, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(120, 113, 108);
  doc.text('AUTHORIZED SIGNATORY', sumX + sumW - 69, sigY + 26, { align: 'center' });

  const filename = `Invoice_ShippingSlip_${orderNum}.pdf`;
  if (autoDownload) {
    doc.save(filename);
  }
  return { doc, filename };
};
