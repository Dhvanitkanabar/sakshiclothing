// Reading this as: Customer Account Dashboard & Orders Sanctuary for Sakshi Clothing patrons, with real-time order sync, invoice access, addresses, and loyalty points. Dials: VARIANCE [8] / MOTION [6] / DENSITY [5].

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, LogOut, ChevronRight, ShoppingBag,
  MapPin, CreditCard, Settings, FileText, XCircle, RefreshCcw,
  Clock, CheckCircle, Truck, Award, Sparkles
} from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchOrders, cancelOrder, getInvoiceUrl,
  fetchAddresses, deleteAddress, setDefaultAddress,
  authedFetch, API_URL
} from '../lib/api';
import { Button } from '../components/ui/Button';

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
  pending: 'bg-[#FAF8F5] text-[#7B1E2B] border border-[#E8E5DF]',
  pending_approval: 'bg-[#FAF8F5] text-[#7B1E2B] border border-[#E8E5DF]',
  confirmed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  processing: 'bg-blue-50 text-blue-800 border border-blue-200',
  packed: 'bg-[#7B1E2B]/10 text-[#7B1E2B] border border-[#7B1E2B]/20',
  shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  dispatched: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  in_transit: 'bg-blue-50 text-blue-800 border border-blue-200',
  out_for_delivery: 'bg-amber-50 text-amber-900 border border-amber-200',
  outForDelivery: 'bg-amber-50 text-amber-900 border border-amber-200',
  delivered: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  rejected: 'bg-rose-50 text-[#B43E2B] border border-rose-200',
  cancelled: 'bg-rose-50 text-[#B43E2B] border border-rose-200',
  returned: 'bg-stone-100 text-[#1A1A1A] border border-stone-200',
  refunded: 'bg-stone-100 text-[#6B7280] border border-stone-200',
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
    return '/placeholder-product.svg';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const baseUrl = (API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${cleanPath}`;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, logout, loading: authLoading } = useAuth();
  const { user: clerkUser } = useUser();

  const displayName = user?.fullName || clerkUser?.fullName || clerkUser?.firstName || 'Patron';
  const displayEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const displayAvatar = user?.avatar?.url || clerkUser?.imageUrl;
  const displayRole = user?.role || 'user';

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loyaltyData, setLoyaltyData] = useState<{ points: number, transactions: any[] }>({ points: 0, transactions: [] });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const loadLoyalty = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authedFetch(`${API_URL}/loyalty`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        setLoyaltyData(data.data);
      }
    } catch { }
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

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    const data = await fetchAddresses();
    setAddresses(data);
  }, [user]);

  useEffect(() => {
    loadOrders();

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await authedFetch(`${API_URL}/users/me/account`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete account');
      }

      toast.success('Your account and personal data have been permanently anonymized.');
      setShowDeleteModal(false);
      await logout();
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while deleting your account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) return null;
  if (!isSignedIn) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'loyalty', label: 'Privilege Points', icon: Award },
    { id: 'privacy', label: 'Privacy & Data', icon: Settings },
  ];

  return (
    <div className="bg-[#FBF9F6] min-h-screen text-[#1A1A1A] pt-6 sm:pt-10 pb-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile/Tablet User Profile Header Card */}
        <div className="lg:hidden bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E5DF] shadow-xs mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF8F5] rounded-2xl flex items-center justify-center border border-[#E8E5DF] overflow-hidden shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-serif font-bold text-[#7B1E2B]">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1A1A1A] truncate">{displayName}</h1>
                <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#7B1E2B] text-[9px] font-bold uppercase tracking-wider rounded-md border border-[#E8E5DF] shrink-0">
                  {displayRole}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] truncate">{displayEmail}</p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#E8E5DF] text-center">
            <div className="bg-[#FAF8F5] rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-bold text-[#1A1A1A] block">{orders.length}</span>
              <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Orders</span>
            </div>
            <div className="bg-[#FAF8F5] rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-bold text-[#C6A15B] block">{loyaltyData.points}</span>
              <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Points</span>
            </div>
            <div className="bg-[#FAF8F5] rounded-xl p-2.5">
              <span className="text-base sm:text-lg font-bold text-[#1A1A1A] block">{addresses.length}</span>
              <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Addresses</span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Navigation Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 min-h-[44px] ${
                activeTab === item.id
                  ? 'bg-[#7B1E2B] text-white shadow-xs'
                  : 'bg-white text-[#6B7280] border border-[#E8E5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
          ))}
          {(displayRole === 'admin' || displayRole === 'superadmin') && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-rose-50 text-[#B43E2B] border border-rose-200 shrink-0 min-h-[44px]"
            >
              <Settings size={14} />
              <span>Admin</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-white text-[#B43E2B] border border-rose-200 shrink-0 hover:bg-rose-50 min-h-[44px]"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>

        {/* Desktop Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E8E5DF] shadow-xs space-y-4">
              <div className="w-20 h-20 bg-[#FAF8F5] rounded-2xl flex items-center justify-center border border-[#E8E5DF] overflow-hidden mx-auto">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-serif font-bold text-[#7B1E2B]">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-serif font-medium text-[#1A1A1A]">{displayName}</h2>
                <p className="text-xs text-[#6B7280] truncate">{displayEmail}</p>
                <span className="inline-block px-3 py-0.5 bg-[#FAF8F5] text-[#7B1E2B] text-[9px] font-bold uppercase tracking-wider rounded-full border border-[#E8E5DF] mt-1">
                  {displayRole}
                </span>
              </div>

              {/* Sidebar Quick Stats */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E8E5DF] text-center">
                <div className="bg-[#FAF8F5] rounded-xl p-2.5">
                  <span className="text-lg font-bold text-[#1A1A1A] block">{orders.length}</span>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Orders</span>
                </div>
                <div className="bg-[#FAF8F5] rounded-xl p-2.5">
                  <span className="text-lg font-bold text-[#C6A15B] block">{loyaltyData.points}</span>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider">Points</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="bg-white rounded-3xl p-3 border border-[#E8E5DF] shadow-xs space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] ${
                    activeTab === item.id
                      ? 'bg-[#7B1E2B] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAF8F5]'
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
                  className="w-full flex items-center gap-3 p-3.5 text-[#B43E2B] hover:bg-rose-50 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all min-h-[44px]"
                >
                  <Settings size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3.5 text-[#6B7280] hover:text-[#B43E2B] hover:bg-rose-50 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            <header className="hidden lg:block space-y-1 pb-4 border-b border-[#E8E5DF]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                Patron Sanctuary
              </span>
              <h1 className="text-3xl xl:text-4xl font-serif font-medium text-[#1A1A1A]">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h1>
            </header>

            <AnimatePresence mode="wait">
              {/* Orders Tab */}
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
                        <div key={i} className="h-44 bg-white/70 animate-pulse rounded-3xl border border-[#E8E5DF]" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.div
                        key={order._id}
                        className="bg-white border border-[#E8E5DF] rounded-3xl overflow-hidden hover:border-[#7B1E2B]/30 shadow-xs transition-all duration-300"
                      >
                        {/* Order Header */}
                        <div className="bg-[#FAF8F5] p-4 sm:p-6 border-b border-[#E8E5DF]">
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center lg:justify-between gap-3 sm:gap-4">
                            <div>
                              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Reference</p>
                              <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">#{order.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Placed Date</p>
                              <p className="text-xs sm:text-sm text-[#1A1A1A]">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Total Amount</p>
                              <p className="text-xs sm:text-sm font-bold text-[#7B1E2B]">₹{order.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Status</p>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[order.status] || 'bg-[#FAF8F5] text-[#1A1A1A]'}`}>
                                {STATUS_ICON[order.status]}
                                {(order.status || 'pending').replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {order.tracking?.estimatedDeliveryTime && order.status !== 'rejected' && order.status !== 'cancelled' && (
                            <div className="mt-3 pt-3 border-t border-[#E8E5DF] flex items-center gap-2">
                              <Sparkles size={12} className="text-[#C6A15B]" />
                              <span className="text-xs text-[#6B7280]">Estimated Delivery:</span>
                              <span className="text-xs font-bold text-[#7B1E2B] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E5DF]">
                                {order.tracking.estimatedDeliveryTime}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-6 space-y-4">
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="w-16 sm:w-20 aspect-[3/4] bg-[#FAF8F5] rounded-2xl overflow-hidden relative shrink-0 border border-[#E8E5DF]">
                                {item.quantity > 1 && (
                                  <span className="absolute top-1 right-1 bg-[#1A1A1A]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md z-10">
                                    ×{item.quantity}
                                  </span>
                                )}
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/placeholder-product.svg';
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-[#1A1A1A]/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[8px] text-white font-bold">{item.selectedSize || 'Std'}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tracking Timeline (collapsible) */}
                          {order.timeline?.length > 0 && (
                            <div className="pt-2">
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                className="text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5 min-h-[44px] py-1"
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
                                    <div className="pl-3 sm:pl-4 border-l-2 border-[#E8E5DF] space-y-2.5 py-1">
                                      {[...order.timeline].reverse().map((event, i) => (
                                        <div key={i} className="text-xs">
                                          <p className="font-bold text-[#1A1A1A] capitalize">{event.status}</p>
                                          {event.note && <p className="text-[#6B7280] text-[11px]">{event.note}</p>}
                                          <p className="text-[#9CA3AF] text-[10px] mt-0.5">
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

                          {/* Actions Suite */}
                          <div className="pt-4 border-t border-[#E8E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-[#6B7280] truncate max-w-sm">
                              {order.address || 'Delivery Address'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/track-order?orderId=${order.orderNumber}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#7B1E2B] hover:bg-[#621721] transition-colors px-3.5 py-2.5 rounded-xl shadow-xs min-h-[44px]"
                              >
                                <Truck size={13} />
                                <span>Track Live</span>
                              </Link>
                              <a
                                href={getInvoiceUrl(order._id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors border border-[#E8E5DF] px-3.5 py-2.5 rounded-xl bg-white min-h-[44px]"
                              >
                                <FileText size={13} />
                                <span>Invoice</span>
                              </a>
                              <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors border border-[#E8E5DF] px-3.5 py-2.5 rounded-xl bg-white min-h-[44px]"
                              >
                                <RefreshCcw size={13} />
                                <span>Reorder</span>
                              </Link>
                              {order.paymentStatus === 'failed' && (
                                <button
                                  onClick={() => navigate('/payment-retry', { state: { orderId: order._id, amount: order.total, gateway: order.paymentMethod } })}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#B43E2B] hover:bg-[#962F1F] transition-colors px-3.5 py-2.5 rounded-xl shadow-xs min-h-[44px]"
                                >
                                  <CreditCard size={13} />
                                  <span>Retry Pay</span>
                                </button>
                              )}
                              {(order.status === 'pending' || order.status === 'processing') && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#B43E2B] hover:bg-rose-50 transition-colors border border-rose-200 px-3 py-2.5 rounded-xl min-h-[44px]"
                                >
                                  <XCircle size={13} />
                                  <span>Cancel</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-dashed border-[#E8E5DF] p-6 space-y-5">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FAF8F5] rounded-full text-[#7B1E2B]">
                        <ShoppingBag size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#1A1A1A]">Your Wardrobe Awaits</h3>
                        <p className="text-xs text-[#6B7280]">You haven't placed any orders with Sakshi Clothing yet.</p>
                      </div>
                      <Link to="/shop">
                        <Button variant="primary" size="lg" rightIcon={<ChevronRight size={15} />}>
                          Discover Collections
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Addresses Tab */}
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
                          addr.isDefault ? 'border-[#C6A15B] shadow-xs' : 'border-[#E8E5DF] hover:border-[#7B1E2B]/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1 rounded-full">
                            {addr.addressType || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#7B1E2B] bg-[#FAF8F5] border border-[#7B1E2B]/30 px-3 py-1 rounded-full">
                              Default Address
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-medium text-[#1A1A1A] text-base">{addr.fullName}</h4>
                        <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                          {addr.houseNumber}, {addr.street}<br />
                          {addr.area && `${addr.area}, `}{addr.city}, {addr.state} — {addr.pincode}<br />
                          {addr.country}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-2">📞 {addr.phone}</p>
                        <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#E8E5DF]">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr._id)}
                              className="text-xs font-bold uppercase tracking-wider text-[#7B1E2B] hover:text-[#621721] transition-colors min-h-[44px] py-1"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-xs font-bold uppercase tracking-wider text-[#B43E2B] hover:text-[#962F1F] transition-colors ml-auto min-h-[44px] py-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-[#E8E5DF] p-6">
                        <MapPin size={36} className="mx-auto text-[#6B7280] mb-2" />
                        <p className="text-[#6B7280] text-sm">No saved addresses found.</p>
                      </div>
                    )}
                  </div>

                  <Link to="/checkout">
                    <Button variant="primary" size="md">
                      + Add Address via Checkout
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Loyalty Tab */}
              {activeTab === 'loyalty' && (
                <motion.div
                  key="loyalty"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-[#7B1E2B] text-white p-6 sm:p-10 rounded-3xl shadow-md border border-[#621721] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6A15B]/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-2 text-center sm:text-left relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-[#C6A15B] rounded-full text-xs uppercase tracking-wider font-bold border border-white/15">
                        <Award size={13} />
                        <span>Privilege Circle Tier</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">Sakshi Patron Rewards</h2>
                      <p className="text-white/80 text-xs sm:text-sm font-light max-w-md">
                        Earn 1 privilege point for every ₹100 spent. Redeem directly as credit on your next bespoke or jewellery order.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[160px] relative z-10">
                      <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] block mb-1">
                        Available Balance
                      </span>
                      <span className="text-4xl sm:text-5xl font-serif font-bold text-white">
                        {loyaltyData.points}
                      </span>
                      <span className="text-[10px] text-white/70 block mt-1">Privilege Points</span>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-white border border-[#E8E5DF] rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-5 sm:p-6 border-b border-[#E8E5DF] bg-[#FAF8F5] flex items-center justify-between">
                      <h3 className="font-serif font-medium text-[#1A1A1A] text-base">Points Activity</h3>
                      <span className="text-xs text-[#6B7280]">{loyaltyData.transactions.length} entries</span>
                    </div>

                    {loyaltyData.transactions.length === 0 ? (
                      <p className="text-[#6B7280] text-sm text-center py-12">No points history available yet.</p>
                    ) : (
                      <div className="divide-y divide-[#E8E5DF]">
                        {loyaltyData.transactions.map((tx: any) => (
                          <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                            <div className="space-y-1">
                              <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                                tx.type === 'earned'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : tx.type === 'redeemed'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-[#FAF8F5] text-[#1A1A1A]'
                              }`}>
                                {tx.type}
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">{tx.description || 'Points Adjustment'}</p>
                              <p className="text-[10px] text-[#9CA3AF]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`text-base sm:text-xl font-bold ${tx.points > 0 ? 'text-emerald-700' : 'text-[#1A1A1A]'}`}>
                              {tx.points > 0 ? `+${tx.points}` : tx.points}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Privacy & Account Deletion Tab (Mandatory for App Store & Google Play) */}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Data Protection Overview Card */}
                  <div className="bg-white border border-[#E8E5DF] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7B1E2B]/10 text-[#7B1E2B] flex items-center justify-center">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">Data Protection & Privacy</h3>
                        <p className="text-xs text-[#6B7280]">In compliance with India's Digital Personal Data Protection (DPDP) Act 2023</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                      Sakshi Clothing processes your personal information strictly to fulfill orders, deliver artisanal garments, and provide personalized concierge support. You retain full control over your digital identity and stored information.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <Link
                        to="/privacy"
                        className="text-xs text-[#7B1E2B] hover:underline font-semibold flex items-center gap-1"
                      >
                        Read Privacy Policy <ChevronRight size={12} />
                      </Link>
                      <Link
                        to="/terms"
                        className="text-xs text-[#7B1E2B] hover:underline font-semibold flex items-center gap-1"
                      >
                        Terms of Service <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Danger Zone: Account Deletion */}
                  <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B43E2B] flex items-center justify-center">
                        <XCircle size={20} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-medium text-[#B43E2B]">Self-Serve Account Deletion</h3>
                        <p className="text-xs text-[#6B7280]">Irreversible removal of account credentials and personal records</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                      Permanently expunges your profile credentials, saved addresses, cart items, wishlist, and device push notification tokens. As required by Section 128 of the Indian Companies Act 2013 and GST statutory compliance, completed purchase tax invoices are anonymized and retained for the mandated 8-year accounting period.
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setDeleteConfirmText('');
                          setShowDeleteModal(true);
                        }}
                        className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-[#B43E2B] border border-rose-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]"
                      >
                        Delete My Account & Personal Data
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#E8E5DF] rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-[#B43E2B] flex items-center justify-center border border-rose-200">
              <XCircle size={28} />
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Confirm Account Deletion</h3>

            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed text-left">
              This action is permanent and cannot be undone. To verify your intent, please type <strong className="text-[#1A1A1A]">DELETE</strong> in the box below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-3 border border-[#E8E5DF] rounded-xl text-sm focus:outline-none focus:border-[#B43E2B] transition-colors"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 py-3 px-4 bg-[#FAF8F5] hover:bg-[#F2EFEA] text-[#1A1A1A] font-semibold text-xs uppercase tracking-wider rounded-xl border border-[#E8E5DF] transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                className="flex-1 py-3 px-4 bg-[#B43E2B] hover:bg-[#962F1F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm min-h-[44px]"
              >
                {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
