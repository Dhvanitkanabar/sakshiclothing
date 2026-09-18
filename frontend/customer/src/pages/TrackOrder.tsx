import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, XCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../lib/api';

const STATUS_STEPS = [
  { key: 'pending_approval', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const isEmail = emailOrPhone.includes('@');
      const paramStr = new URLSearchParams({
        orderId: orderId.trim(),
        ...(emailOrPhone.trim() ? (isEmail ? { email: emailOrPhone.trim() } : { phone: emailOrPhone.trim() }) : {})
      }).toString();

      const res = await fetch(`${API_URL}/orders/track?${paramStr}`);
      const data = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError(data.message || 'No order found with the provided details.');
      }
    } catch (err: any) {
      setError('Failed to connect to order tracking service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    const currentStatus = order.orderStatus;
    if (currentStatus === 'rejected' || currentStatus === 'cancelled') return 'cancelled';

    const orderIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex < 0) return 'upcoming';
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-luxury-white min-h-screen pt-36 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="caption text-rose-600">Track & Trace</span>
          <h1 className="heading-lg">Track Your Order</h1>
          <p className="text-muted max-w-xl mx-auto">
            Enter your Order ID (e.g. <span className="font-mono font-bold text-black">ORDERSC27</span>) to check the live status of your delivery.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Order ID *</label>
                <input
                  type="text"
                  placeholder="e.g. ORDERSC27"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-mono font-bold text-black focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Email or Phone (Verification)</label>
                <input
                  type="text"
                  placeholder="Optional verification email/phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full py-5 bg-black text-white rounded-2xl caption flex items-center justify-center gap-3 hover:bg-muted transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Checking Status...</span>
              ) : (
                <>
                  <Search size={16} /> Track Order Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-4 text-sm font-medium"
          >
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Order Result Timeline */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 space-y-10"
          >
            <div className="flex flex-wrap justify-between items-center gap-6 border-b border-gray-100 pb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted block">Order ID</span>
                <span className="text-xl font-mono font-bold text-black">#{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted block">Order Date</span>
                <span className="text-sm font-bold text-black">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted block">Current Status</span>
                <span className="inline-block px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full mt-1">
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Rejection notice if cancelled */}
            {order.orderStatus === 'rejected' && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <XCircle size={18} /> Order Rejected / Cancelled
                </div>
                <p className="text-xs text-red-600">
                  <span className="font-bold">Reason:</span> {order.rejectionReason || 'Order was cancelled by customer or admin.'}
                </p>
              </div>
            )}

            {/* Visual Timeline */}
            {order.orderStatus !== 'rejected' && order.orderStatus !== 'cancelled' && (
              <div className="space-y-6 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black">Delivery Progress</h3>
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key);
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            statusState === 'completed' ? 'bg-green-500 text-white' :
                            statusState === 'current' ? 'bg-black text-white ring-4 ring-black/10' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {statusState === 'completed' ? '✓' : idx + 1}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-6 ${statusState === 'completed' ? 'bg-green-500' : 'bg-gray-100'}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-bold ${statusState === 'current' ? 'text-black font-black' : statusState === 'completed' ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Carrier Tracking Info */}
            {order.tracking && (order.tracking.trackingNumber || order.tracking.courierName) && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Carrier Information</span>
                <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-black">
                  <div>Courier: {order.tracking.courierName || 'Standard Express'}</div>
                  <div>Tracking #: {order.tracking.trackingNumber || 'N/A'}</div>
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
