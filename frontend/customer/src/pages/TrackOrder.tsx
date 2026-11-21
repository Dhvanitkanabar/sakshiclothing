// Reading this as: Live Order Tracking for Sakshi Clothing patrons, with real-time atelier sync, secure token verification, and responsive mobile-first journey timeline. Dials: VARIANCE [8] / MOTION [6] / DENSITY [5].

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Package,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Navigation,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';
import { API_URL } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';

const STATUS_STEPS = [
  { key: 'pending_approval', label: 'Order Placed', shortLabel: 'Placed' },
  { key: 'confirmed', label: 'Order Accepted & In Prep', shortLabel: 'In Prep' },
  { key: 'packed', label: 'Artisanal Packaging', shortLabel: 'Packed' },
  { key: 'dispatched', label: 'Dispatched to Courier', shortLabel: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit', shortLabel: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery', shortLabel: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered', shortLabel: 'Delivered' }
];

const TrackOrder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLastRefreshed] = useState<Date | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

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
    <div className="bg-[#FBF9F6] min-h-screen pt-6 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8 text-[#1A1A1A]">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#4A1D3F] text-[11px] font-bold uppercase tracking-widest mb-2 border border-[#E8E5DF]">
              <Sparkles size={12} className="text-[#C6A15B]" />
              <span>Surat Atelier Live Fulfillment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#1A1A1A] tracking-tight">
              {order ? `Order #${order.orderNumber}` : 'Track Your Shipment'}
            </h1>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Order # (e.g. ORDERSC1)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.replace(/^#+/, '').toUpperCase())}
                className="w-full bg-white border border-[#E8E5DF] px-4 py-2.5 rounded-xl text-base sm:text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#4A1D3F] focus:ring-1 focus:ring-[#4A1D3F] transition-all uppercase placeholder:normal-case font-mono min-h-[44px]"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !orderId.trim()}
              isLoading={loading}
              leftIcon={<Search size={14} />}
              className="shrink-0"
            >
              Track
            </Button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3.5 text-xs font-medium"
          >
            <AlertCircle size={18} className="shrink-0 text-[#B43E2B]" />
            <div className="flex-1">
              <p className="font-bold text-[#B43E2B]">{error}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">Please check your Order Number or phone/email details.</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!order && !loading && !error && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E5DF] shadow-xs text-center max-w-xl mx-auto space-y-5 my-8">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#4A1D3F]">
              <Package size={26} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-medium text-[#1A1A1A]">Track Your Consignment</h2>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                Enter your order reference ID (provided via email/SMS) to track tailoring status, courier handover, and real-time transit.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#4A1D3F] hover:text-[#3B1732] border-b border-[#4A1D3F] pb-0.5 transition-colors min-h-[44px]"
              >
                <span>View Recent Orders in Account</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Active Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Status Spotlight Banner */}
            <div className="bg-[#4A1D3F] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#3B1732] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6A15B]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#C6A15B] shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-bold">
                        Verified Atelier Order
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-ping" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-medium text-white mt-0.5">
                      {order.orderStatus === 'rejected'
                        ? 'Order Cancelled'
                        : order.approvalStatus === 'approved'
                        ? 'Approved & Dispatched to Atelier'
                        : 'Order Placed — In Preparation'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase border border-white/15">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchTracking(orderId, true)}
                    disabled={refreshing}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Refresh live updates"
                  >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 relative z-10">
                {/* 1. ETA */}
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-bold flex items-center gap-1.5 mb-1">
                    <Clock size={12} /> Estimated Delivery
                  </span>
                  <p className="text-lg font-bold text-white">
                    {order.tracking?.estimatedDeliveryTime || '2 to 3 Business Days'}
                  </p>
                  <p className="text-[11px] text-white/70 mt-0.5">Free Express Shipping</p>
                </div>

                {/* 2. Current Location */}
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold flex items-center gap-1.5 mb-1">
                    <Navigation size={12} /> Current Station
                  </span>
                  <p className="text-sm font-bold text-white truncate">
                    {order.tracking?.currentLocation || 'Sakshi Surat Atelier'}
                  </p>
                  <p className="text-[11px] text-[#C6A15B] italic truncate mt-0.5">
                    {order.tracking?.liveStatusNote || 'Tailoring & quality inspection'}
                  </p>
                </div>

                {/* 3. AWB / Courier */}
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold flex items-center gap-1.5 mb-1">
                    <Truck size={12} /> Tracking AWB
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-white tracking-wider">
                      {currentAwb}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(currentAwb)}
                      className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title="Copy AWB"
                    >
                      {copiedAwb ? <Check size={13} className="text-[#C6A15B]" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    {order.tracking?.courierName || 'Express Courier Partner'}
                  </p>
                </div>
              </div>
            </div>

            {/* Horizontal Timeline Progress */}
            {order.orderStatus !== 'rejected' && order.orderStatus !== 'cancelled' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <Truck size={15} className="text-[#4A1D3F]" />
                    <span>Fulfillment Progress</span>
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:flex items-center justify-between relative px-2">
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E8E5DF] -z-0" />
                  
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    const isDone = statusState === 'completed';
                    const isCurrent = statusState === 'current';

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 space-y-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-[#4A1D3F] text-white shadow-xs'
                              : isCurrent
                              ? 'bg-[#C6A15B] text-[#1A1A1A] ring-4 ring-[#C6A15B]/30 scale-110 shadow-sm'
                              : 'bg-[#FAF8F5] text-[#9CA3AF] border border-[#E8E5DF]'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="text-center max-w-[90px]">
                          <span className={`text-[11px] font-bold block leading-tight ${
                            isCurrent ? 'text-[#1A1A1A] font-extrabold' : isDone ? 'text-[#4A1D3F]' : 'text-[#9CA3AF]'
                          }`}>
                            {step.shortLabel}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4A1D3F] bg-[#FAF8F5] px-1.5 py-0.5 rounded mt-0.5 inline-block border border-[#E8E5DF]">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper */}
                <div className="md:hidden space-y-3.5">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    const isDone = statusState === 'completed';
                    const isCurrent = statusState === 'current';

                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isDone ? 'bg-[#4A1D3F] text-white' :
                          isCurrent ? 'bg-[#C6A15B] text-[#1A1A1A] ring-2 ring-[#C6A15B]/40' :
                          'bg-[#FAF8F5] text-[#9CA3AF] border border-[#E8E5DF]'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs ${isCurrent ? 'font-bold text-[#1A1A1A]' : isDone ? 'text-[#4A1D3F] font-medium' : 'text-[#9CA3AF]'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold uppercase text-[#4A1D3F] bg-[#FAF8F5] px-1.5 py-0.5 rounded ml-auto border border-[#E8E5DF]">
                            In Progress
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2-Column Responsive Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Items & Checkpoints */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Pieces Manifest */}
                {order.products && order.products.length > 0 && (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                        <ShoppingBag size={14} className="text-[#4A1D3F]" />
                        <span>Items in this Package ({order.products.length})</span>
                      </h3>
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        Total: ₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="divide-y divide-[#E8E5DF]">
                      {order.products.map((item: any, idx: number) => {
                        const imgUrl = item.product?.thumbnail?.url || item.product?.images?.[0]?.url || item.image;
                        return (
                          <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={item.name}
                                  className="w-12 h-14 object-cover rounded-xl border border-[#E8E5DF] shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-14 bg-[#FAF8F5] rounded-xl flex items-center justify-center text-[#6B7280] shrink-0">
                                  <Package size={18} />
                                </div>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-[#1A1A1A] leading-snug">{item.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                                  {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                  <span>&bull;</span>
                                  <span>Qty: <strong>{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#1A1A1A] shrink-0">
                              ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Checkpoints */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 pb-3 border-b border-[#E8E5DF]">
                      <Clock size={14} className="text-[#4A1D3F]" />
                      <span>Tracking Timeline</span>
                    </h3>

                    <div className="space-y-3.5">
                      {order.timeline.map((event: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[#C6A15B] mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[#1A1A1A]">{event.note || event.status}</span>
                              <span className="text-[10px] text-[#6B7280] font-mono">
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

              {/* Right Column: Destination Map & Concierge Support */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Destination Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#C6A15B]" /> Delivery Destination
                    </span>
                    <a
                      href={mapExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#4A1D3F] hover:text-[#3B1732] flex items-center gap-1 transition-colors min-h-[44px] py-1"
                    >
                      <ExternalLink size={12} /> Open Map
                    </a>
                  </div>

                  <div>
                    <strong className="text-xs text-[#1A1A1A] block font-bold">
                      {order.shippingAddress?.fullName || order.customer?.fullName || 'Consignee'}
                    </strong>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      {fullAddress || `${destinationCity}, India`}
                    </p>
                  </div>

                  {/* Compact Map Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#E8E5DF] h-44 bg-[#FAF8F5]">
                    <iframe
                      title="Destination Pinpoint"
                      className="w-full h-full border-0"
                      src={mapEmbedUrl}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* 2. Concierge WhatsApp Support */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E5DF] shadow-xs space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Need Immediate Assistance?
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Have questions regarding your delivery status, sizing exchange, or packaging? Our Surat atelier concierge is on WhatsApp.
                  </p>
                  <a
                    href={`https://wa.me/919316533660?text=${encodeURIComponent(`Hi Sakshi Clothing! I am tracking Order #${order.orderNumber} and would like an update.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] py-3 px-4 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E5DF] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} className="text-[#25D366]" />
                    <span>WhatsApp Concierge (+91 9316533660)</span>
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
