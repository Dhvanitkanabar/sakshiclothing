import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Navigation,
  RefreshCw,
  Bell,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { API_URL } from '../lib/api';
import { toast } from 'sonner';

/**
 * Design Read: Customer Live Order Tracking for Sakshi Clothing couture patrons,
 * with an airy luxury atelier layout, high information density, horizontal progress tracking,
 * and compact smart search.
 * Dials: VARIANCE 7 / MOTION 6 / DENSITY 6.
 */

const STATUS_STEPS = [
  { key: 'pending_approval', label: 'Order Placed', shortLabel: 'Placed' },
  { key: 'confirmed', label: 'Order Accepted & In Prep', shortLabel: 'In Prep' },
  { key: 'packed', label: 'Artisanal Packaging', shortLabel: 'Packed' },
  { key: 'dispatched', label: 'Dispatched to Courier', shortLabel: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit', shortLabel: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery', shortLabel: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered', shortLabel: 'Delivered' }
];

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchTracking = useCallback(async (targetId: string, isSilent = false) => {
    const cleanTargetId = targetId.trim().replace(/^#+/, '').trim();
    if (!cleanTargetId) return;

    if (!isSilent) {
      setLoading(true);
      setError(null);
    } else {
      setRefreshing(true);
    }

    try {
      const isEmail = emailOrPhone.includes('@');
      const paramStr = new URLSearchParams({
        orderId: cleanTargetId,
        ...(emailOrPhone.trim() ? (isEmail ? { email: emailOrPhone.trim() } : { phone: emailOrPhone.trim() }) : {})
      }).toString();

      const res = await fetch(`${API_URL}/orders/track?${paramStr}`);
      const data = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
        setLastRefreshed(new Date());
        setError(null);
      } else {
        if (!isSilent) {
          setError(data.message || 'No order found with the provided details.');
          setOrder(null);
        }
      }
    } catch {
      if (!isSilent) {
        setError('Failed to connect to order tracking service. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [emailOrPhone]);

  // Read URL query params on mount (e.g. ?orderId=ORDERSC1)
  useEffect(() => {
    const paramId = searchParams.get('orderId') || searchParams.get('id');
    if (paramId) {
      const clean = paramId.trim().replace(/^#+/, '');
      setOrderId(clean);
      fetchTracking(clean);
    }
  }, [searchParams, fetchTracking]);

  // Auto-poll live updates every 4 seconds for instant two-way synchronization
  useEffect(() => {
    const activeTarget = (orderId || order?.orderNumber || order?._id || '').trim().replace(/^#+/, '');
    if (!activeTarget) return;

    const interval = setInterval(() => {
      fetchTracking(activeTarget, true);
    }, 4000);

    const onFocus = () => fetchTracking(activeTarget, true);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sakshi_order_sync');
      channel.onmessage = () => {
        fetchTracking(activeTarget, true);
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
      try { channel?.close(); } catch {}
    };
  }, [order, orderId, fetchTracking]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderId.trim().replace(/^#+/, '').toUpperCase();
    if (!clean) return;
    setOrderId(clean);
    setSearchParams({ orderId: clean });
    fetchTracking(clean);
    setShowSearchModal(false);
  };

  const handleCopyAwb = (awbText: string) => {
    navigator.clipboard.writeText(awbText);
    setCopiedAwb(true);
    toast.success('AWB copied to clipboard');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    const currentStatus = order.orderStatus;
    if (currentStatus === 'rejected' || currentStatus === 'cancelled') return 'cancelled';

    // Map legacy / alternative statuses
    const normalizedStatus =
      currentStatus === 'processing' ? 'packed' :
      currentStatus === 'shipped' ? 'dispatched' :
      currentStatus;

    const orderIndex = STATUS_STEPS.findIndex(s => s.key === normalizedStatus);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex < 0) return 'upcoming';
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  // Coordinates & Map logic
  const coords = order?.shippingAddress?.coordinates;
  const hasExactCoords = Boolean(
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    (coords.lat !== 0 || coords.lng !== 0)
  );

  const destinationCity = order?.shippingAddress?.city || 'India';
  const destinationState = order?.shippingAddress?.state || '';
  const destinationPincode = order?.shippingAddress?.pincode || '';
  const fullAddress = [
    order?.shippingAddress?.houseNumber,
    order?.shippingAddress?.street,
    order?.shippingAddress?.area,
    destinationCity,
    destinationState,
    destinationPincode
  ].filter(Boolean).join(', ');

  const mapQuery = encodeURIComponent(fullAddress || `${destinationCity}, Gujarat, India`);
  const mapEmbedUrl = hasExactCoords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=17&output=embed`
    : `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const mapExternalUrl = hasExactCoords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const currentAwb = order?.tracking?.trackingNumber || `AWB-SC-${order?.orderNumber || '001'}`;

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-8 sm:pt-12 pb-24 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ─── 1. TOP HEADER & COMPACT SEARCH BAR ───────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold uppercase tracking-widest mb-1.5 border border-stone-200/70">
              <Sparkles size={11} className="text-amber-700" />
              <span>Surat Atelier Live Fulfillment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-stone-900 tracking-tight">
              {order ? `Order #${order.orderNumber}` : 'Track Your Order'}
            </h1>
          </div>

          {/* Compact Smart Search Form */}
          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Enter Order # (e.g. ORDERSC1)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.replace(/^#+/, '').toUpperCase())}
                className="w-full bg-white border border-stone-200 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all uppercase placeholder:normal-case font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 shrink-0"
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* ─── 2. ERROR STATE (IF ANY) ─────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3.5 text-xs font-semibold"
          >
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="font-bold">{error}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">Please verify your Order Reference ID or contact our atelier support.</p>
            </div>
          </motion.div>
        )}

        {/* ─── 3. EMPTY STATE (BEFORE SEARCHING) ───────────────────────── */}
        {!order && !loading && !error && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-sm text-center max-w-xl mx-auto space-y-5 my-8">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-700">
              <Package size={26} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-medium text-stone-900">Enter Your Order Reference</h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Enter your order number (found in your confirmation email or SMS) above to monitor atelier craftsmanship, courier dispatch, and live location.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-amber-800 border-b border-stone-900 pb-0.5 transition-colors"
              >
                <span>View Recent Orders in Account</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* ─── 4. ACTIVE ORDER TRACKING INTERFACE ──────────────────────── */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            
            {/* ── Status Spotlight Ribbon ── */}
            <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                        Verified Atelier Order
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-sans font-bold text-white mt-0.5">
                      {order.orderStatus === 'rejected'
                        ? 'Order Cancelled'
                        : order.approvalStatus === 'approved'
                        ? 'Approved & Dispatched to Atelier'
                        : 'Order Placed — Awaiting Atelier Review'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-full bg-stone-800 text-stone-200 text-xs font-bold tracking-wider uppercase border border-stone-700">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => fetchTracking(orderId, true)}
                    disabled={refreshing}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    title="Refresh live updates"
                  >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                
                {/* 1. ETA */}
                <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5 mb-1">
                    <Clock size={12} /> Estimated Delivery
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {order.tracking?.estimatedDeliveryTime || '2 to 3 Business Days'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Free Express Delivery</p>
                </div>

                {/* 2. Current Location */}
                <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1.5 mb-1">
                    <Navigation size={12} /> Current Station
                  </span>
                  <p className="text-sm font-bold text-stone-200 truncate">
                    {order.tracking?.currentLocation || 'Sakshi Surat Atelier'}
                  </p>
                  <p className="text-[11px] text-amber-200/90 italic truncate mt-0.5">
                    {order.tracking?.liveStatusNote || 'Tailoring & quality inspection'}
                  </p>
                </div>

                {/* 3. AWB / Courier */}
                <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1.5 mb-1">
                    <Truck size={12} /> Tracking AWB
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-white tracking-wider">
                      {currentAwb}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(currentAwb)}
                      className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
                      title="Copy AWB"
                    >
                      {copiedAwb ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {order.tracking?.courierName || 'Priority Express Carrier'}
                  </p>
                </div>

              </div>
            </div>

            {/* ── Horizontal Modern Progress Stepper ── */}
            {order.orderStatus !== 'rejected' && order.orderStatus !== 'cancelled' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <Truck size={14} className="text-stone-700" />
                    <span>Fulfillment Journey</span>
                  </h3>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:flex items-center justify-between relative px-2">
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-100 -z-0" />
                  
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    const isDone = statusState === 'completed';
                    const isCurrent = statusState === 'current';

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 space-y-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-stone-900 text-white ring-4 ring-amber-500/20 scale-110 shadow-sm'
                              : 'bg-stone-100 text-stone-400 border border-stone-200/70'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="text-center max-w-[90px]">
                          <span className={`text-[11px] font-bold block leading-tight ${
                            isCurrent ? 'text-stone-900 font-extrabold' : isDone ? 'text-stone-700' : 'text-stone-400'
                          }`}>
                            {step.shortLabel}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper */}
                <div className="md:hidden space-y-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    const isDone = statusState === 'completed';
                    const isCurrent = statusState === 'current';

                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isDone ? 'bg-emerald-600 text-white' :
                          isCurrent ? 'bg-stone-900 text-white ring-2 ring-amber-400' :
                          'bg-stone-100 text-stone-400'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs ${isCurrent ? 'font-bold text-stone-900' : isDone ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded ml-auto">
                            In Progress
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 2-Column Responsive Body ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column (7 cols): Order Items & Live Checkpoints */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Ordered Pieces Manifest */}
                {order.products && order.products.length > 0 && (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                        <ShoppingBag size={14} className="text-stone-700" />
                        <span>Pieces in this Shipment ({order.products.length})</span>
                      </h3>
                      <span className="text-xs font-bold text-stone-900">
                        Total: ₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {order.products.map((item: any, idx: number) => {
                        const imgUrl = item.product?.thumbnail?.url || item.product?.images?.[0]?.url || item.image;
                        return (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={item.name}
                                  className="w-12 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-14 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                                  <Package size={18} />
                                </div>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-stone-900 leading-snug">{item.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                                  {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                  <span>&bull;</span>
                                  <span>Qty: <strong>{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-stone-900 shrink-0">
                              ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Checkpoints History */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 pb-3 border-b border-stone-100">
                      <Clock size={14} className="text-stone-700" />
                      <span>Atelier Checkpoint Logs</span>
                    </h3>

                    <div className="space-y-3.5">
                      {order.timeline.map((event: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-stone-900">{event.note || event.status}</span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (5 cols): Destination Map & Concierge Support */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Destination Card & Map */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <MapPin size={13} className="text-amber-700" /> Destination
                    </span>
                    <a
                      href={mapExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={11} /> Open Map
                    </a>
                  </div>

                  <div>
                    <strong className="text-xs text-stone-900 block font-bold">
                      {order.shippingAddress?.fullName || order.customer?.fullName || 'Consignee'}
                    </strong>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {fullAddress || `${destinationCity}, India`}
                    </p>
                  </div>

                  {/* Compact Map Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 h-44 bg-stone-100">
                    <iframe
                      title="Destination Pinpoint"
                      className="w-full h-full border-0"
                      src={mapEmbedUrl}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* 2. Concierge Atelier WhatsApp Support */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Need Immediate Assistance?
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Have a question regarding custom measurements, delivery adjustments, or packaging? Our Surat concierge is available.
                  </p>
                  <a
                    href={`https://wa.me/919825440058?text=${encodeURIComponent(`Hi Sakshi Clothing! I am tracking Order #${order.orderNumber} and would like an update.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>WhatsApp Atelier Concierge</span>
                  </a>
                </div>

              </div>

            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
