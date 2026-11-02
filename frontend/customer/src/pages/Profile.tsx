import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, User as UserIcon, LogOut, ChevronRight, ShoppingBag,
  MapPin, CreditCard, Settings, FileText, XCircle, RefreshCcw,
  Clock, CheckCircle, Truck, Award, Sparkles
} from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchOrders, cancelOrder, getInvoiceUrl,
  fetchAddresses, addAddress, deleteAddress, setDefaultAddress
} from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
  | 'pending' | 'processing' | 'confirmed' | 'packed' | 'shipped'
  | 'outForDelivery' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded'
  | 'rejected' | string;

interface OrderItem {
  id: string; name: string; selectedSize: string;
  quantity: number; price: number; image: string;
}

interface Order {
  _id: string; id: string; orderNumber: string;
  items: OrderItem[]; total: number; address: string;
  status: OrderStatus; createdAt: string; timeline: any[];
  paymentStatus: string; paymentMethod: string;
  tracking?: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  pending_approval: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  packed: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  dispatched: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  in_transit: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  out_for_delivery: 'bg-orange-50 text-orange-700 border border-orange-200/60',
  outForDelivery: 'bg-orange-50 text-orange-700 border border-orange-200/60',
  delivered: 'bg-green-50 text-green-700 border border-green-200/60',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  returned: 'bg-gray-100 text-gray-700 border border-gray-200/60',
  refunded: 'bg-gray-100 text-gray-500 border border-gray-200/60',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  pending_approval: <Clock size={12} />,
  confirmed: <CheckCircle size={12} />,
  rejected: <XCircle size={12} />,
  cancelled: <XCircle size={12} />,
  delivered: <CheckCircle size={12} />,
  shipped: <Truck size={12} />,
  dispatched: <Truck size={12} />,
};

const resolveProductImage = (p: any): string => {
  let url =
    p.product?.thumbnail?.url ||
    p.product?.images?.[0]?.url ||
    (typeof p.product?.images?.[0] === 'string' ? p.product?.images?.[0] : null) ||
    p.product?.image ||
    p.image ||
    '';

  if (!url || url.includes('placeholder.com')) {
    return 'https://images.unsplash.com/photo-1611591475852-25bb3e76f536?q=80&w=400&auto=format&fit=crop';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:5000${cleanPath}`;
};

// ─── Profile Component ─────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, logout, loading: authLoading } = useAuth();
  const { user: clerkUser } = useUser();

  // Use MongoDB user data if available, fall back to Clerk
  const displayName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'User';
  const displayEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayRole = user?.role || 'user';

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [loyaltyData, setLoyaltyData] = useState<{ points: number, transactions: any[] }>({ points: 0, transactions: [] });

  // Load loyalty
  const loadLoyalty = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/loyalty`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLoyaltyData(data.data);
      }
    } catch (err) { }
  }, [user]);

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoading(true);
    try {
      const data = await fetchOrders();
      const mapped = data.map((o: any): Order => {
        const effectiveStatus = (o.orderStatus === 'rejected' || o.approvalStatus === 'rejected')
          ? 'rejected'
          : (o.orderStatus === 'confirmed' || o.approvalStatus === 'approved') && (o.orderStatus === 'pending_approval' || o.orderStatus === 'pending')
          ? 'confirmed'
          : (o.orderStatus || 'pending');

        return {
          _id: o._id,
          id: o.orderNumber,
          orderNumber: o.orderNumber,
          items: (o.products || []).map((p: any) => ({
            id: p.product?._id || p.product || '',
            name: p.name,
            selectedSize: p.size,
            quantity: p.quantity,
            price: p.price,
            image: resolveProductImage(p)
          })),
          total: o.totals?.grandTotal || 0,
          address: o.shippingAddress
            ? `${o.shippingAddress.houseNumber || ''}, ${o.shippingAddress.street || ''}, ${o.shippingAddress.city || ''}`
            : '',
          status: effectiveStatus,
          createdAt: o.createdAt,
          timeline: o.timeline || [],
          tracking: o.tracking,
          paymentStatus: o.paymentStatus || 'pending',
          paymentMethod: o.payment?.method || 'razorpay'
        };
      });
      setOrders(mapped);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user]);

  // Load addresses
  const loadAddresses = useCallback(async () => {
    if (!user) return;
    const data = await fetchAddresses();
    setAddresses(data);
  }, [user]);

  useEffect(() => {
    loadOrders();

    // Auto-poll orders every 4 seconds for two-way simultaneous updates
    const timer = setInterval(() => {
      loadOrders(true);
    }, 4000);

    const onFocus = () => loadOrders(true);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sakshi_order_sync');
      channel.onmessage = () => {
        loadOrders(true);
      };
    } catch {}

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
      try { channel?.close(); } catch {}
    };
  }, [loadOrders]);
  useEffect(() => { if (activeTab === 'addresses') loadAddresses(); }, [activeTab, loadAddresses]);
  useEffect(() => { if (activeTab === 'loyalty') loadLoyalty(); }, [activeTab, loadLoyalty]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const res = await cancelOrder(orderId);
    if (res.success) {
      toast.success('Order cancelled successfully');
      loadOrders();
    } else {
      toast.error(res.message || 'Failed to cancel order');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const res = await deleteAddress(id);
    if (res.success) {
      toast.success('Address removed');
      loadAddresses();
    } else {
      toast.error(res.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAddress(id);
    if (res.success) {
      toast.success('Default address updated');
      loadAddresses();
    } else {
      toast.error(res.message || 'Failed to update default');
    }
  };

  if (authLoading) return null;
  if (!isSignedIn) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'loyalty', label: 'Loyalty Points', icon: Award },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 selection:bg-amber-400 selection:text-black pt-10 sm:pt-16 pb-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile/Tablet User Profile Header Card */}
        <div className="lg:hidden bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200 overflow-hidden shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-stone-400 font-sans">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-sans font-bold text-stone-900 truncate">{displayName}</h1>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 text-[9px] font-sans font-bold uppercase tracking-wider rounded-md border border-amber-200 shrink-0">
                  {displayRole}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans truncate">{displayEmail}</p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-100 text-center">
            <div className="bg-stone-50 rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-sans font-bold text-stone-900 block">{orders.length}</span>
              <span className="text-[9px] font-sans text-stone-400 uppercase tracking-wider">Orders</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-sans font-bold text-amber-700 block">{loyaltyData.points}</span>
              <span className="text-[9px] font-sans text-stone-400 uppercase tracking-wider">Points</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-sans font-bold text-stone-900 block">{addresses.length}</span>
              <span className="text-[9px] font-sans text-stone-400 uppercase tracking-wider">Addresses</span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Navigation Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                activeTab === item.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
          ))}
          {(displayRole === 'admin' || displayRole === 'superadmin') && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200 shrink-0"
            >
              <Settings size={14} />
              <span>Admin</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider whitespace-nowrap bg-white text-red-600 border border-red-200 shrink-0 hover:bg-red-50"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>

        {/* Desktop Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
              <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200 overflow-hidden mx-auto">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-stone-400 font-sans">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-sans font-bold text-stone-900">{displayName}</h2>
                <p className="text-xs text-stone-500 font-sans truncate">{displayEmail}</p>
                <span className="inline-block px-3 py-0.5 bg-amber-50 text-amber-900 text-[9px] font-sans font-bold uppercase tracking-wider rounded-full border border-amber-200 mt-1">
                  {displayRole}
                </span>
              </div>

              {/* Sidebar Quick Stats */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-100 text-center">
                <div className="bg-stone-50 rounded-xl p-2.5">
                  <span className="text-lg font-sans font-bold text-stone-900 block">{orders.length}</span>
                  <span className="text-[9px] font-sans text-stone-400 uppercase tracking-wider">Orders</span>
                </div>
                <div className="bg-stone-50 rounded-xl p-2.5">
                  <span className="text-lg font-sans font-bold text-amber-700 block">{loyaltyData.points}</span>
                  <span className="text-[9px] font-sans text-stone-400 uppercase tracking-wider">Points</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-sm space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                    activeTab === item.id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}

              {(displayRole === 'admin' || displayRole === 'superadmin') && (
                <Link
                  to="/admin"
                  className="w-full flex items-center gap-3 p-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider transition-all"
                >
                  <Settings size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider transition-all"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            <header className="hidden lg:block space-y-1 pb-4 border-b border-stone-200/80">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-800">
                Member Sanctuary
              </span>
              <h1 className="text-3xl xl:text-4xl font-sans font-bold text-stone-900">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h1>
            </header>

            <AnimatePresence mode="wait">
              {/* ── Orders Tab ── */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 bg-stone-200/60 animate-pulse rounded-3xl" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.div
                        key={order._id}
                        className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        {/* Order Header */}
                        <div className="bg-stone-50/80 p-4 sm:p-6 border-b border-stone-100">
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center lg:justify-between gap-3 sm:gap-4">
                            <div>
                              <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider font-bold">Reference</p>
                              <p className="text-xs sm:text-sm font-sans font-bold text-stone-900">#{order.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider font-bold">Placed Date</p>
                              <p className="text-xs sm:text-sm font-sans text-stone-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider font-bold">Total Amount</p>
                              <p className="text-xs sm:text-sm font-sans font-bold text-amber-900">₹{order.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-stone-400 font-sans uppercase tracking-wider font-bold">Status</p>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${STATUS_BADGE[order.status] || 'bg-stone-100 text-stone-700'}`}>
                                {STATUS_ICON[order.status]}
                                {(order.status || 'pending').replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {order.tracking?.estimatedDeliveryTime && order.status !== 'rejected' && order.status !== 'cancelled' && (
                            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2">
                              <Sparkles size={12} className="text-emerald-600" />
                              <span className="text-xs font-sans text-stone-600">Estimated Delivery:</span>
                              <span className="text-xs font-sans font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                {order.tracking.estimatedDeliveryTime}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-6 space-y-4">
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="w-16 sm:w-20 aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden relative shrink-0 border border-stone-200">
                                {item.quantity > 1 && (
                                  <span className="absolute top-1 right-1 bg-stone-900/90 text-white text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-md z-10">
                                    ×{item.quantity}
                                  </span>
                                )}
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop';
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-stone-900/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[8px] text-white font-sans font-bold">{item.selectedSize || 'Std'}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tracking Timeline (collapsible) */}
                          {order.timeline?.length > 0 && (
                            <div className="pt-2">
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                className="text-xs font-sans font-bold uppercase tracking-wider text-stone-500 hover:text-stone-950 transition-colors flex items-center gap-1.5"
                              >
                                <ChevronRight
                                  size={13}
                                  className={`transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`}
                                />
                                <span>Timeline ({order.timeline.length} updates)</span>
                              </button>
                              <AnimatePresence>
                                {expandedOrder === order._id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-3"
                                  >
                                    <div className="pl-3 sm:pl-4 border-l-2 border-stone-200 space-y-2.5 py-1">
                                      {[...order.timeline].reverse().map((event, i) => (
                                        <div key={i} className="text-xs">
                                          <p className="font-sans font-bold text-stone-900 capitalize">{event.status}</p>
                                          {event.note && <p className="text-stone-500 text-[11px]">{event.note}</p>}
                                          <p className="text-stone-400 text-[10px] mt-0.5">
                                            {new Date(event.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-stone-500 font-sans truncate max-w-sm">
                              {order.address || 'Address provided at checkout'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/track-order?orderId=${order.orderNumber}`}
                                className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-white bg-stone-900 hover:bg-amber-800 transition-colors px-3.5 py-2 rounded-xl shadow-xs"
                              >
                                <Truck size={12} />
                                <span>Track Live</span>
                              </Link>
                              <a
                                href={getInvoiceUrl(order._id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-stone-700 hover:text-stone-950 transition-colors border border-stone-200 px-3.5 py-2 rounded-xl bg-white"
                              >
                                <FileText size={12} />
                                <span>Invoice</span>
                              </a>
                              <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-stone-700 hover:text-stone-950 transition-colors border border-stone-200 px-3.5 py-2 rounded-xl bg-white"
                              >
                                <RefreshCcw size={12} />
                                <span>Reorder</span>
                              </Link>
                              {order.paymentStatus === 'failed' && (
                                <button
                                  onClick={() => navigate('/payment-retry', { state: { orderId: order._id, amount: order.total, gateway: order.paymentMethod } })}
                                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 transition-colors px-3.5 py-2 rounded-xl shadow-xs"
                                >
                                  <CreditCard size={12} />
                                  <span>Retry</span>
                                </button>
                              )}
                              {(order.status === 'pending' || order.status === 'processing') && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="inline-flex items-center gap-1 text-xs font-sans font-medium text-red-600 hover:text-red-700 transition-colors border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50"
                                >
                                  <XCircle size={12} />
                                  <span>Cancel</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-dashed border-stone-200 p-6 space-y-5">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-100 rounded-full text-stone-400">
                        <ShoppingBag size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-sans font-bold text-stone-800">Your Wardrobe Awaits</h3>
                        <p className="text-xs sm:text-sm text-stone-500 font-sans">You haven't placed any orders yet.</p>
                      </div>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-2xl hover:bg-amber-800 transition-all shadow-md"
                      >
                        <span>Discover Collection</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Addresses Tab ── */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`bg-white rounded-3xl p-5 sm:p-7 border-2 transition-all ${
                          addr.isDefault ? 'border-amber-400 shadow-md' : 'border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                            {addr.addressType || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <h4 className="font-sans font-bold text-stone-900 text-base">{addr.fullName}</h4>
                        <p className="text-xs text-stone-600 font-sans mt-2 leading-relaxed">
                          {addr.houseNumber}, {addr.street}<br />
                          {addr.area && `${addr.area}, `}{addr.city}, {addr.state} — {addr.pincode}<br />
                          {addr.country}
                        </p>
                        <p className="text-xs text-stone-400 font-sans mt-2">📞 {addr.phone}</p>
                        <div className="flex items-center gap-3 mt-5 pt-3 border-t border-stone-100">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr._id)}
                              className="text-xs font-sans font-bold uppercase tracking-wider text-amber-900 hover:text-stone-900 transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-xs font-sans font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200 p-6">
                        <MapPin size={36} className="mx-auto text-stone-300 mb-2" />
                        <p className="text-stone-500 font-sans text-sm">No saved addresses found.</p>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/checkout"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider hover:bg-amber-800 transition-all shadow-md"
                  >
                    <span>+ Add Address via Checkout</span>
                  </Link>
                </motion.div>
              )}

              {/* ── Loyalty Tab ── */}
              {activeTab === 'loyalty' && (
                <motion.div
                  key="loyalty"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-amber-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-sans uppercase tracking-wider font-bold">
                        <Award size={13} />
                        <span>Atelier Privilege Tier</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-sans font-bold">Sakshi Patron Rewards</h2>
                      <p className="text-stone-300 text-xs sm:text-sm font-light max-w-md">
                        Earn 1 point for every ₹100 spent. Redeem directly as privilege credit at checkout.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[160px]">
                      <span className="text-[10px] font-sans uppercase tracking-wider text-amber-300 block mb-1">
                        Available Balance
                      </span>
                      <span className="text-4xl sm:text-5xl font-sans font-extrabold text-amber-400">
                        {loyaltyData.points}
                      </span>
                      <span className="text-[10px] font-sans text-stone-300 block mt-1">Privilege Points</span>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between">
                      <h3 className="font-sans font-bold text-stone-900 text-base">Points Activity</h3>
                      <span className="text-xs text-stone-500 font-sans">{loyaltyData.transactions.length} entries</span>
                    </div>

                    {loyaltyData.transactions.length === 0 ? (
                      <p className="text-stone-400 font-sans text-sm text-center py-12">No points history available yet.</p>
                    ) : (
                      <div className="divide-y divide-stone-100">
                        {loyaltyData.transactions.map((tx: any) => (
                          <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-stone-50/60 transition-colors">
                            <div className="space-y-1">
                              <span className={`inline-block px-2.5 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded-md ${
                                tx.type === 'earned'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : tx.type === 'redeemed'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                {tx.type}
                              </span>
                              <p className="text-xs sm:text-sm font-sans font-bold text-stone-900">{tx.description || 'Points Adjustment'}</p>
                              <p className="text-[10px] text-stone-400 font-sans">{new Date(tx.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`text-base sm:text-xl font-sans font-bold ${tx.points > 0 ? 'text-emerald-700' : 'text-stone-800'}`}>
                              {tx.points > 0 ? `+${tx.points}` : tx.points}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
