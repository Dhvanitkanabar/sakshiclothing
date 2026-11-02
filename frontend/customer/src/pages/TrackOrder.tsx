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
  ExternalLink
} from 'lucide-react';
import { API_URL } from '../lib/api';

const STATUS_STEPS = [
  { key: 'pending_approval', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Accepted & Verified' },
  { key: 'packed', label: 'Artisanal Packing' },
  { key: 'dispatched', label: 'Dispatched to Courier' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

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

  // Read URL query params on mount (e.g. ?orderId=ORDERSC4)
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
    const clean = orderId.trim().replace(/^#+/, '');
    setOrderId(clean);
    fetchTracking(clean);
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

  // High-precision formatted destination address & GPS coordinates
  const coords = order?.shippingAddress?.coordinates;
  const hasExactCoords = Boolean(
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    (coords.lat !== 0 || coords.lng !== 0)
  );

  const cleanDestTokens: string[] = [];
  const addDestToken = (str?: string) => {
    if (!str) return;
    const trimmed = str.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (!cleanDestTokens.some(t => t.toLowerCase() === lower || lower.includes(t.toLowerCase()))) {
      cleanDestTokens.push(trimmed);
    }
  };

  addDestToken(order?.shippingAddress?.houseNumber);
  addDestToken(order?.shippingAddress?.street);
  addDestToken(order?.shippingAddress?.area);
  addDestToken(order?.shippingAddress?.landmark);
  addDestToken(order?.shippingAddress?.city);
  addDestToken(order?.shippingAddress?.state);
  addDestToken(order?.shippingAddress?.pincode);
  addDestToken(order?.shippingAddress?.country || 'India');

  const destinationCity = order?.shippingAddress?.city || 'India';
  const destinationPincode = order?.shippingAddress?.pincode || '';
  const fullDest = cleanDestTokens.join(', ');
  const mapQuery = encodeURIComponent(fullDest || `${destinationCity}, Gujarat, India`);

  const mapEmbedUrl = hasExactCoords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=18&output=embed`
    : `https://maps.google.com/maps?q=${mapQuery}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  const mapExternalUrl = hasExactCoords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="bg-stone-50/60 min-h-screen pt-36 pb-28 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Editorial Title */}
        <div className="text-center space-y-4">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-amber-800 flex items-center justify-center gap-2">
            <Sparkles size={12} /> Live Fulfillment & Order Dispatch
          </span>
          <h1 className="text-4xl md:text-6xl font-sans font-medium text-stone-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-stone-500 text-xs md:text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Enter your order reference code below to view real-time atelier updates, genuine order verification, and your estimated arrival time.
          </p>
        </div>

        {/* Search / Lookup Card */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80 space-y-6">
          <form onSubmit={handleTrackSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Order ID <span className="text-amber-800">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORDERSC3 or #ORDERSC3"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.replace(/^#+/, '').toUpperCase())}
                  className="w-full bg-stone-50 border border-stone-200 px-5 py-3.5 rounded-2xl text-sm font-sans font-bold text-stone-900 focus:outline-none focus:border-stone-900 transition-colors uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Email or Phone (Optional Verification)
                </label>
                <input
                  type="text"
                  placeholder="Optional email / phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-5 py-3.5 rounded-2xl text-sm font-semibold text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Atelier Live Sync…</span>
                </div>
              ) : (
                <>
                  <Search size={15} /> Track Live Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-4 text-xs font-semibold"
          >
            <AlertCircle size={20} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tracked Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Live Sync Status Bar */}
            <div className="flex items-center justify-between text-xs text-stone-500 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-sans text-[11px] font-bold text-stone-700">Maison Live Sync Active</span>
                {lastRefreshed && (
                  <span className="text-[10px] text-stone-400">
                    • Refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
              <button
                onClick={() => fetchTracking(orderId, true)}
                disabled={refreshing}
                className="text-[11px] font-sans uppercase tracking-widest text-amber-800 hover:text-stone-950 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh Status
              </button>
            </div>

            {/* ORDER ACCEPTANCE & ESTIMATED DELIVERY TIME HERO BANNER */}
            {order.approvalStatus === 'approved' ? (
              <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 relative overflow-hidden border border-amber-900/30">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-emerald-400 font-bold block">
                        Verified & Approved by Admin
                      </span>
                      <h3 className="text-xl md:text-2xl font-sans font-bold text-white mt-0.5">
                        Order #{order.orderNumber} Accepted
                      </h3>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-stone-200 text-xs font-sans font-bold tracking-wider uppercase border border-white/15">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Estimated Delivery Time Spotlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-amber-300 font-bold flex items-center gap-1.5">
                      <Clock size={13} /> Estimated Time of Arrival
                    </span>
                    <p className="text-2xl md:text-3xl font-sans font-bold text-white">
                      {order.tracking?.estimatedDeliveryTime || '2 to 3 Business Days'}
                    </p>
                    <p className="text-xs text-stone-400">
                      Provided directly by the Maison dispatch manager upon order acceptance.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-stone-400 font-bold flex items-center gap-1.5">
                      <Navigation size={13} /> Current Checkpoint & Location
                    </span>
                    <p className="text-lg font-sans font-bold text-stone-200">
                      {order.tracking?.currentLocation || 'Sakshi Maison Atelier — Packaging Desk'}
                    </p>
                    {order.tracking?.liveStatusNote && (
                      <p className="text-xs text-amber-200/90 font-medium italic">
                        "{order.tracking.liveStatusNote}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : order.orderStatus === 'rejected' ? (
              <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
                <div className="flex items-center gap-3 text-rose-800 font-bold text-base">
                  <XCircle size={24} className="text-rose-600" /> Order Cancelled / Rejected
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  <span className="font-bold">Reason:</span> {order.rejectionReason || 'Order could not be approved by the atelier.'}
                </p>
              </div>
            ) : (
              <div className="p-6 md:p-8 bg-amber-50/80 border border-amber-200/80 rounded-3xl flex items-center gap-4 text-xs font-semibold text-amber-900">
                <Clock size={24} className="text-amber-700 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Order Placed — Awaiting Admin Verification</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    The admin is reviewing order authenticity and shipping details. Once accepted, your estimated delivery time will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Timeline Stepper */}
            {order.orderStatus !== 'rejected' && order.orderStatus !== 'cancelled' && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80 space-y-8">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-stone-900 flex items-center gap-2">
                    <Truck size={14} className="text-amber-800" /> Fulfillment Stages
                  </h3>
                  <span className="text-[11px] font-sans text-stone-500">
                    Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    const isCurrent = statusState === 'current';
                    const isDone = statusState === 'completed';

                    return (
                      <div key={step.key} className="flex items-start gap-5 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isDone ? 'bg-emerald-600 text-white' :
                            isCurrent ? 'bg-stone-900 text-white ring-4 ring-amber-500/20 scale-105' :
                            'bg-stone-100 text-stone-400'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-10 ${isDone ? 'bg-emerald-600' : 'bg-stone-100'}`} />
                          )}
                        </div>

                        <div className="pt-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <p className={`text-sm font-bold tracking-tight ${
                              isCurrent ? 'text-stone-900 font-black' : isDone ? 'text-stone-800' : 'text-stone-400'
                            }`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-sans font-bold uppercase tracking-wider rounded-md">
                                In Progress
                              </span>
                            )}
                          </div>

                          {/* Show admin timeline notes matching this step */}
                          {order.timeline?.filter((e: any) => e.status === step.key).map((event: any, i: number) => (
                            <p key={i} className="text-xs text-stone-500 mt-1 leading-relaxed">
                              {event.note}
                              <span className="text-[10px] text-stone-400 ml-2">
                                ({new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Destination Location & Interactive Map */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-800 flex items-center gap-1.5">
                    <MapPin size={13} /> Destination Pinpoint
                  </span>
                  <h3 className="text-lg font-sans font-bold text-stone-900 mt-0.5">
                    Delivery Destination: {destinationCity} {destinationPincode ? `(${destinationPincode})` : ''}
                  </h3>
                </div>
                <a
                  href={mapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-sans font-bold uppercase tracking-wider rounded-xl border border-stone-200 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink size={12} /> View Map in Fullscreen
                </a>
              </div>

              {/* Embedded Live Route Map */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 h-64 bg-stone-100">
                <iframe
                  title="Destination Pinpoint"
                  className="w-full h-full border-0"
                  src={mapEmbedUrl}
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-200/60 text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasExactCoords ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-stone-900">
                      {hasExactCoords ? '📍 Exact Receiver Pin:' : 'Destination:'}
                    </span>
                    <span>
                      {order.shippingAddress?.houseNumber || order.shippingAddress?.street || destinationCity}
                    </span>
                    {hasExactCoords && (
                      <span className="font-sans text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                        GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Notifications Feed for this Order */}
            {order.notifications && order.notifications.length > 0 && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80 space-y-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-stone-900 flex items-center gap-2">
                  <Bell size={14} className="text-amber-800" /> Live Atelier Notification Feed
                </h3>
                <div className="space-y-3">
                  {order.notifications.map((notif: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-3.5 text-xs">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-stone-900">{notif.title}</p>
                          <span className="text-[10px] font-sans text-stone-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
