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
  doc.text('Haute Couture & Bespoke Artisanal Fashion | Jaipur Atelier', 40, 52);

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
  doc.text('Inventory Valuation & Stock Status Report | Jaipur Atelier', 40, 52);

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
