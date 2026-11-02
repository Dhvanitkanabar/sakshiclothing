// Reading this as: High-precision luxury atelier admin reporting and tax compliance system for Maison executives. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Calendar, Layers, ShieldCheck,
  Package, IndianRupee, Sparkles, Filter, CheckCircle2,
  Clock, AlertCircle, RefreshCw, ChevronRight, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '../lib/api';
import {
  generateOrderHistoryPdf,
  generateInventoryPdf,
  processOrderTax
} from '../utils/pdfGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type DateRangePreset = '1week' | '1month' | '1year' | 'all' | 'custom';

export default function Reports() {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('1month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isExportingOrders, setIsExportingOrders] = useState(false);
  const [isExportingInventory, setIsExportingInventory] = useState(false);

  // Set initial custom dates to default to 1 month back to today
  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);

    setCustomEndDate(today.toISOString().slice(0, 10));
    setCustomStartDate(oneMonthAgo.toISOString().slice(0, 10));
  }, []);

  // Fetch all orders from backend
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/all?limit=10000`);
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data)
          ? data.data
          : (data.data?.orders || data.data?.data || []);
        setAllOrders(list);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch all products for inventory report
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await adminFetch(`${API_URL}/products?limit=1000`);
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data?.products)
          ? data.data.products
          : (Array.isArray(data.data) ? data.data : []);
        setProducts(list);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Calculate Date Thresholds based on selected range
  const dateThreshold = useMemo(() => {
    const now = new Date();
    if (selectedPreset === '1week') {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return { start: d, end: now, label: 'Last 1 Week (7 Days)' };
    }
    if (selectedPreset === '1month') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      d.setHours(0, 0, 0, 0);
      return { start: d, end: now, label: 'Last 1 Month (30 Days)' };
    }
    if (selectedPreset === '1year') {
      const d = new Date();
      d.setFullYear(now.getFullYear() - 1);
      d.setHours(0, 0, 0, 0);
      return { start: d, end: now, label: 'Last 1 Year (365 Days)' };
    }
    if (selectedPreset === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      start.setHours(0, 0, 0, 0);
      const end = customEndDate ? new Date(customEndDate) : now;
      end.setHours(23, 59, 59, 999);
      const startStr = customStartDate || 'Beginning';
      const endStr = customEndDate || 'Today';
      return { start, end, label: `Custom (${startStr} to ${endStr})` };
    }
    // 'all'
    return { start: new Date(0), end: now, label: 'All Time (Complete History)' };
  }, [selectedPreset, customStartDate, customEndDate]);

  // Filter valid placed orders strictly within the date range
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      // Must be genuinely placed (paid online or COD)
      if (o.orderStatus === 'payment_pending') return false;
      const isPaid = o.paymentStatus === 'completed';
      const isCod = o.payment?.method === 'cod';
      if (!isPaid && !isCod) return false;

      // Filter by creation date
      const createdAt = new Date(o.createdAt);
      return createdAt >= dateThreshold.start && createdAt <= dateThreshold.end;
    });
  }, [allOrders, dateThreshold]);

  // Live tax aggregation for the selected date range
  const taxSummary = useMemo(() => {
    const processed = filteredOrders.map(processOrderTax);
    const count = processed.length;
    const basePrice = processed.reduce((sum, o) => sum + o.totalBasePrice, 0);
    const clothingGst = processed.reduce((sum, o) => sum + o.clothingGst, 0);
    const jewelleryGst = processed.reduce((sum, o) => sum + o.jewelleryGst, 0);
    const totalGst = clothingGst + jewelleryGst;
    const finalPrice = processed.reduce((sum, o) => sum + o.finalPrice, 0);

    return {
      count,
      basePrice,
      clothingGst,
      jewelleryGst,
      totalGst,
      finalPrice
    };
  }, [filteredOrders]);

  // Live inventory valuation
  const inventorySummary = useMemo(() => {
    let totalStock = 0;
    let valuation = 0;
    products.forEach(p => {
      const variants = p.variants || [];
      const stock = variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
      const price = Number(p.pricing?.basePrice || p.basePrice || variants[0]?.price || 0);
      totalStock += stock;
      valuation += stock * price;
    });
    return {
      skuCount: products.length,
      totalStock,
      valuation
    };
  }, [products]);

  // Handle Order History PDF Download
  const handleExportOrdersPdf = () => {
    if (filteredOrders.length === 0) {
      toast.error('No verified placed orders found for the selected date range.');
      return;
    }

    setIsExportingOrders(true);
    const toastId = toast.loading('Generating official Order History & GST PDF report...');

    setTimeout(() => {
      try {
        const filename = generateOrderHistoryPdf(
          filteredOrders,
          dateThreshold.label,
          selectedPreset === 'custom' ? { startDate: customStartDate, endDate: customEndDate } : undefined
        );
        toast.dismiss(toastId);
        toast.success(`Downloaded ${filename} successfully!`);
      } catch (err: any) {
        toast.dismiss(toastId);
        console.error('PDF Generation Error:', err);
        toast.error('Failed to generate PDF. Please try again.');
      } finally {
        setIsExportingOrders(false);
      }
    }, 400);
  };

  // Handle Inventory PDF Download
  const handleExportInventoryPdf = () => {
    if (products.length === 0) {
      toast.error('No products found in the catalog to export.');
      return;
    }

    setIsExportingInventory(true);
    const toastId = toast.loading('Generating official Inventory Valuation PDF report...');

    setTimeout(() => {
      try {
        const filename = generateInventoryPdf(products);
        toast.dismiss(toastId);
        toast.success(`Downloaded ${filename} successfully!`);
      } catch (err: any) {
        toast.dismiss(toastId);
        console.error('Inventory PDF Generation Error:', err);
        toast.error('Failed to generate inventory PDF.');
      } finally {
        setIsExportingInventory(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── Top Header ── */}
      <div className="border-b border-stone-200 pb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 font-sans">
              Maison Compliance & Accounting
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
            <FileText className="text-stone-900 stroke-[1.8]" size={28} /> Reports & Tax Exports
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl font-sans">
            Download verified, audit-ready PDF documents featuring itemized GST calculations (3% on Jewellery, 5% on Clothing) and real-time inventory valuations.
          </p>
        </div>

        <button
          onClick={() => {
            fetchOrders();
            fetchProducts();
            toast.info('Synchronized with live MongoDB database.');
          }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-700 hover:text-stone-900 hover:border-stone-400 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loadingOrders || loadingProducts ? 'animate-spin' : ''} />
          <span>Sync Live Records</span>
        </button>
      </div>

      {/* ── Grid Container ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Card 1: Order History & GST Report (Span 7) ── */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-sans">Order History & GST Audit (PDF)</h2>
                  <p className="text-xs text-stone-500 font-sans">Itemized with 3% Jewellery GST & 5% Clothing GST</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/70 rounded-full">
                PDF Document
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Range Presets Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                Select Report Date Range:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: '1week', label: '1 Week' },
                  { id: '1month', label: '1 Month' },
                  { id: '1year', label: '1 Year' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom Range' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPreset(tab.id as DateRangePreset)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all text-center ${
                      selectedPreset === tab.id
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Date Pickers */}
            {selectedPreset === 'custom' && (
              <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">From Date:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">To Date:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            )}

            {/* Live Tax & Price Breakdown Preview Box */}
            <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Range Summary ({dateThreshold.label}):
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {taxSummary.count} Placed Order{taxSummary.count === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Base Price</p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    ₹{taxSummary.basePrice.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Clothing GST (5%)</p>
                  <p className="text-sm font-bold text-amber-900 mt-0.5">
                    ₹{taxSummary.clothingGst.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Jewellery GST (3%)</p>
                  <p className="text-sm font-bold text-amber-900 mt-0.5">
                    ₹{taxSummary.jewelleryGst.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Final Price (Total)</p>
                  <p className="text-sm font-extrabold text-stone-900 mt-0.5">
                    ₹{taxSummary.finalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Includes Order ID, Customer Name, Base Price, 3% Jewellery GST, 5% Clothing GST & Final Price.</span>
              </div>
            </div>

            {/* Action Download Button */}
            <div>
              <button
                type="button"
                disabled={isExportingOrders || taxSummary.count === 0}
                onClick={handleExportOrdersPdf}
                className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-sans text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5"
              >
                {isExportingOrders ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>Compiling PDF Document…</span>
                  </>
                ) : (
                  <>
                    <Download size={17} />
                    <span>Download Order History PDF ({dateThreshold.label})</span>
                  </>
                )}
              </button>
              {taxSummary.count === 0 && (
                <p className="text-center text-xs text-stone-400 mt-2 font-sans">
                  No confirmed paid orders in this date range. Select a broader range to export.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Card 2: Inventory Valuation & Stock Report (Span 5) ── */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-6 sm:p-7 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 font-sans">Inventory & Stock Report (PDF)</h2>
                    <p className="text-xs text-stone-500 font-sans">Real-time SKU quantities & asset valuation</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/70 rounded-full">
                  PDF Document
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              <p className="text-xs text-stone-500 font-sans leading-relaxed">
                Download a clean, structured warehouse audit PDF of all products currently in the catalog. Includes SKUs, size variations, unit base prices, live stock statuses, and total asset valuation.
              </p>

              {/* Inventory Valuation Card */}
              <div className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Catalog Valuation</span>
                  <span className="text-xs font-bold text-stone-900">{inventorySummary.skuCount} Products</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Units in Stock</p>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {inventorySummary.totalStock.toLocaleString('en-IN')} units
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Inventory Valuation</p>
                    <p className="text-base font-extrabold text-amber-900 mt-0.5">
                      ₹{inventorySummary.valuation.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Calculated from live variant stocks and atelier base prices.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7 pt-0">
            <button
              type="button"
              disabled={isExportingInventory || inventorySummary.skuCount === 0}
              onClick={handleExportInventoryPdf}
              className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-sans text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5"
            >
              {isExportingInventory ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  <span>Generating Inventory PDF…</span>
                </>
              ) : (
                <>
                  <Download size={17} />
                  <span>Download Inventory PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
