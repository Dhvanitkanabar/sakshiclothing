import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, User as UserIcon, LogOut, ChevronRight, ShoppingBag,
  MapPin, CreditCard, Settings, FileText, XCircle, RefreshCcw,
  Clock, CheckCircle, Truck, Award
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchOrders, cancelOrder, getInvoiceUrl,
  fetchAddresses, addAddress, deleteAddress, setDefaultAddress
} from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
  | 'pending' | 'processing' | 'packed' | 'shipped'
  | 'outForDelivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

interface OrderItem {
  id: string; name: string; selectedSize: string;
  quantity: number; price: number; image: string;
}

interface Order {
  _id: string; id: string; orderNumber: string;
  items: OrderItem[]; total: number; address: string;
  status: OrderStatus; createdAt: string; timeline: any[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  processing: 'bg-blue-50 text-blue-600',
  packed: 'bg-purple-50 text-purple-600',
  shipped: 'bg-indigo-50 text-indigo-600',
  outForDelivery: 'bg-orange-50 text-orange-700',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  returned: 'bg-gray-100 text-gray-600',
  refunded: 'bg-gray-100 text-gray-500',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  delivered: <CheckCircle size={12} />,
  shipped: <Truck size={12} />,
};

// ─── Profile Component ────────────────────────────────────────────────────────
const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const [loyaltyData, setLoyaltyData] = useState<{points: number, transactions: any[]}>({points: 0, transactions: []});

  // Load loyalty
  const loadLoyalty = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/loyalty`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLoyaltyData(data.data);
      }
    } catch (err) {}
  }, [user]);
  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchOrders();
      const mapped = data.map((o: any): Order => ({
        _id: o._id,
        id: o.orderNumber,
        orderNumber: o.orderNumber,
        items: (o.products || []).map((p: any) => ({
          id: p.product?._id || p.product || '',
          name: p.name,
          selectedSize: p.size,
          quantity: p.quantity,
          price: p.price,
          image: p.product?.thumbnail?.url || 'https://via.placeholder.com/500'
        })),
        total: o.totals?.grandTotal || 0,
        address: o.shippingAddress
          ? `${o.shippingAddress.houseNumber}, ${o.shippingAddress.street}, ${o.shippingAddress.city}`
          : '',
        status: o.orderStatus,
        createdAt: o.createdAt,
        timeline: o.timeline || []
      }));
      setOrders(mapped);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load addresses
  const loadAddresses = useCallback(async () => {
    if (!user) return;
    const data = await fetchAddresses();
    setAddresses(data);
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
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
  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'loyalty', label: 'Loyalty Points', icon: Award },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-32">
      <div className="flex flex-col lg:flex-row gap-24">
        {/* Sidebar */}
        <aside className="lg:w-80 space-y-12">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={32} className="text-gray-300" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-medium tracking-tight text-luxury-black">{user.name}</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{user.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                  activeTab === item.id
                    ? 'bg-luxury-black text-white shadow-2xl shadow-black/10'
                    : 'text-gray-400 hover:text-luxury-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={16} />
                  {item.label}
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full flex items-center gap-4 p-4 text-rose-600 hover:bg-rose-50 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
              >
                <Settings size={16} />
                Admin Panel
              </Link>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center gap-4 p-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow space-y-16">
          <header className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-600">Account</span>
            <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-luxury-black">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </header>

          <AnimatePresence mode="wait">
            {/* ── Orders Tab ── */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {loading ? (
                  <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2rem]" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <motion.div
                      key={order._id}
                      className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-700"
                    >
                      {/* Order Header */}
                      <div className="bg-gray-50/50 p-8 flex flex-wrap justify-between items-center gap-8 border-b border-gray-100">
                        <div className="space-y-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Reference</p>
                          <p className="text-xs font-mono font-bold text-luxury-black">#{order.orderNumber}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Date</p>
                          <p className="text-xs font-bold text-luxury-black">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Amount</p>
                          <p className="text-xs font-bold text-rose-600">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Status</p>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${STATUS_BADGE[order.status] || 'bg-gray-50 text-gray-600'}`}>
                            {STATUS_ICON[order.status]}
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-8">
                        <div className="flex flex-wrap gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="w-16 h-24 bg-gray-50 rounded-xl overflow-hidden group/item relative flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-[2px]">
                                <span className="text-[9px] text-white font-bold">{item.selectedSize}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Timeline (collapsible) */}
                        {order.timeline?.length > 0 && (
                          <div className="mt-6">
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                              className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-luxury-black transition-colors flex items-center gap-2"
                            >
                              <ChevronRight
                                size={12}
                                className={`transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`}
                              />
                              Tracking Timeline
                            </button>
                            <AnimatePresence>
                              {expandedOrder === order._id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-4"
                                >
                                  <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                                    {[...order.timeline].reverse().map((event, i) => (
                                      <div key={i} className="text-xs">
                                        <p className="font-bold text-luxury-black capitalize">{event.status}</p>
                                        {event.note && <p className="text-gray-400">{event.note}</p>}
                                        <p className="text-gray-300 text-[10px] mt-0.5">
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
                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">{order.address}</p>
                          <div className="flex flex-wrap gap-3">
                            {/* Invoice Download */}
                            <a
                              href={getInvoiceUrl(order._id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black hover:text-rose-600 transition-colors border border-gray-200 px-4 py-2 rounded-full"
                            >
                              <FileText size={12} /> Invoice
                            </a>
                            {/* Reorder */}
                            <Link
                              to="/shop"
                              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black hover:text-rose-600 transition-colors border border-gray-200 px-4 py-2 rounded-full"
                            >
                              <RefreshCcw size={12} /> Reorder
                            </Link>
                            {/* Cancel (only for pending/processing) */}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition-colors border border-red-100 px-4 py-2 rounded-full"
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 space-y-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full text-gray-100 shadow-sm">
                      <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl text-gray-400 font-serif italic">Your wardrobe is waiting.</p>
                      <p className="text-sm text-gray-400 font-light">You haven't placed any orders yet.</p>
                    </div>
                    <Link to="/shop" className="inline-block px-12 py-4 bg-luxury-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-rose-600 transition-all duration-500 rounded-full">
                      Discover Collection
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Addresses Tab ── */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map(addr => (
                    <div key={addr._id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all ${addr.isDefault ? 'border-luxury-black' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{addr.addressType || 'Home'}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="font-bold text-luxury-black">{addr.fullName}</p>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        {addr.houseNumber}, {addr.street}<br />
                        {addr.area && `${addr.area}, `}{addr.city}, {addr.state} — {addr.pincode}<br />
                        {addr.country}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">📞 {addr.phone}</p>
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            className="text-[10px] font-bold uppercase tracking-widest text-luxury-black hover:text-rose-600 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && (
                    <p className="text-gray-400 font-serif italic col-span-2 text-center py-16">No saved addresses.</p>
                  )}
                </div>
                <Link
                  to="/checkout"
                  className="inline-block px-8 py-4 border border-luxury-black text-luxury-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-luxury-black hover:text-white transition-all duration-500 rounded-full"
                >
                  + Add Address via Checkout
                </Link>
              </motion.div>
            )}

            {/* ── Loyalty Tab ── */}
            {activeTab === 'loyalty' && (
              <motion.div
                key="loyalty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-luxury-black text-white p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-xl">
                  <Award size={48} className="mb-4 text-amber-500" />
                  <p className="text-sm uppercase tracking-[0.2em] font-bold text-gray-400 mb-2">Available Points</p>
                  <h2 className="text-6xl font-serif">{loyaltyData.points}</h2>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-luxury-black">Transaction History</h3>
                  </div>
                  {loyaltyData.transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 font-serif italic">
                      No points history available yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {loyaltyData.transactions.map((tx: any) => (
                        <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <span className={`inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full mb-2 ${
                              tx.type === 'earned' ? 'bg-green-100 text-green-700' :
                              tx.type === 'redeemed' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {tx.type}
                            </span>
                            <p className="text-sm font-bold text-luxury-black">{tx.description || 'Points Adjustment'}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className={`text-xl font-serif font-bold ${tx.points > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.points > 0 ? `+${tx.points}` : tx.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Other Tabs (placeholders) ── */}
            {activeTab !== 'orders' && activeTab !== 'addresses' && activeTab !== 'loyalty' && (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"
              >
                <p className="text-2xl text-gray-400 font-serif italic">Coming Soon</p>
                <p className="text-sm text-gray-400 font-light mt-2">This section is currently under curation.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;
