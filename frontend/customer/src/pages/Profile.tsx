import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Package, User as UserIcon, LogOut, ChevronRight, ShoppingBag, MapPin, CreditCard, Settings } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        // Fetch from localStorage
        const allOrders = JSON.parse(localStorage.getItem('sakshi_orders') || '[]');
        const userOrders = allOrders.filter((o: any) => o.userId === user.uid);
        
        // Sort by date desc
        userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
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
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {loading ? (
                  <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2rem]" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-8">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-700"
                      >
                        <div className="bg-gray-50/50 p-8 flex flex-wrap justify-between items-center gap-8 border-b border-gray-100">
                          <div className="space-y-2">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Reference</p>
                            <p className="text-xs font-mono font-bold text-luxury-black">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Date</p>
                            <p className="text-xs font-bold text-luxury-black">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Amount</p>
                            <p className="text-xs font-bold text-rose-600">₹{order.total.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Status</p>
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              order.status === 'completed' ? 'bg-green-50 text-green-600' :
                              order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="flex flex-wrap gap-6">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="w-20 h-28 bg-gray-50 rounded-xl overflow-hidden group/item relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-[2px]">
                                  <span className="text-[10px] text-white font-bold tracking-widest">{item.selectedSize}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-end">
                            <div className="space-y-2">
                              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Delivery Address</p>
                              <p className="text-xs text-gray-500 font-light max-w-md leading-relaxed">{order.address}</p>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-black hover:text-rose-600 transition-colors flex items-center gap-2">
                              Track Package <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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

            {activeTab !== 'orders' && (
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
