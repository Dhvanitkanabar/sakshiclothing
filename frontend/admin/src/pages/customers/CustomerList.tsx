import { useState, useEffect } from 'react';
import {
  Search, ShieldBan, ShieldCheck, User as UserIcon,
  Mail, Phone, Calendar, ShoppingBag, Heart, Package, MapPin, X, ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type Tab = 'overview' | 'cart' | 'wishlist' | 'orders';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_URL}/users/admin/all?search=${search}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data.customers || [];
          setCustomers(list);
          if (list.length > 0) {
            selectUser(list[0]._id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectUser = (id: string) => {
    setSelectedId(id);
    setActiveTab('overview');
    setDetailLoading(true);
    fetch(`${API_URL}/users/admin/${id}/details`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data.success) setSelectedData(data.data); })
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const handleAction = async (id: string, action: 'block' | 'unblock' | 'deactivate', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/users/admin/${id}/${action}`, { method: 'PATCH', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
        if (selectedId === id) selectUser(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailAction = async (id: string, action: 'block' | 'unblock' | 'deactivate') => {
    try {
      const res = await fetch(`${API_URL}/users/admin/${id}/${action}`, { method: 'PATCH', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
        selectUser(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedUser = selectedData?.user;
  const cartItems = selectedUser?.cart?.items || [];
  const wishlistItems = selectedUser?.wishlist || [];
  const orderHistory = selectedData?.orderHistory || [];

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'cart', label: 'Cart', count: cartItems.length },
    { key: 'wishlist', label: 'Wishlist', count: wishlistItems.length },
    { key: 'orders', label: 'Orders', count: orderHistory.length },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      {/* LEFT: User List */}
      <div className={`flex flex-col border-r border-gray-100 ${selectedId ? 'w-80 min-w-[18rem]' : 'flex-1'} transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Customers</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full text-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No customers found</div>
          ) : customers.map(c => (
            <div
              key={c._id}
              onClick={() => selectUser(c._id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors group ${selectedId === c._id ? 'bg-gray-50 border-l-2 border-l-black' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${c.isBlocked ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                {c.fullName?.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{c.fullName}</p>
                <p className="text-gray-400 text-xs truncate">{c.email}</p>
              </div>
              {/* Status + actions */}
              <div className="flex items-center gap-2 shrink-0">
                {c.isBlocked ? (
                  <button
                    onClick={(e) => handleAction(c._id, 'unblock', e)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Click to unblock user"
                  >
                    <ShieldCheck size={12} /> Unblock
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAction(c._id, 'block', e)}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Click to block user"
                  >
                    <ShieldBan size={12} /> Block
                  </button>
                )}
                <ChevronRight size={14} className="text-slate-300 ml-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer count */}
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      {selectedId && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {detailLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
            </div>
          ) : selectedUser ? (
            <>
              {/* Detail Header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                  {selectedUser.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedUser.fullName}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {selectedUser.isBlocked ? (
                    <button
                      onClick={() => handleDetailAction(selectedUser._id, 'unblock')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ShieldCheck size={14} /> Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDetailAction(selectedUser._id, 'block')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ShieldBan size={14} /> Block User
                    </button>
                  )}
                  <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Stat Pills */}
              <div className="flex gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
                {[
                  { label: 'Orders', value: orderHistory.length, icon: Package },
                  { label: 'Cart', value: cartItems.length, icon: ShoppingBag },
                  { label: 'Wishlist', value: wishlistItems.length, icon: Heart },
                  { label: 'Points', value: selectedUser.loyaltyPoints || 0, icon: null },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    {stat.icon && <stat.icon size={14} className="text-gray-400" />}
                    <span className="text-xs text-gray-500">{stat.label}</span>
                    <span className="font-bold text-gray-900 text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Profile</h3>
                        {[
                          { icon: UserIcon, label: 'Full Name', value: selectedUser.fullName },
                          { icon: Mail, label: 'Email', value: selectedUser.email },
                          { icon: Phone, label: 'Phone', value: selectedUser.phone || 'Not provided' },
                          { icon: Calendar, label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                          { icon: MapPin, label: 'Addresses', value: `${selectedUser.addresses?.length || 0} saved` },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                            <item.icon size={15} className="text-gray-400 shrink-0" />
                            <span className="text-gray-500 w-20 shrink-0">{item.label}</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Account Status</h3>
                        <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                          <span className="text-gray-500 w-36 shrink-0">Role</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedUser.role}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                          <span className="text-gray-500 w-36 shrink-0">Account Active</span>
                          <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            {selectedUser.isActive ? 'Yes ✓' : 'No ✗'}
                          </span>
                          {selectedUser.isActive && (
                            <button
                              onClick={() => handleDetailAction(selectedUser._id, 'deactivate')}
                              className="ml-auto text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                          <span className="text-gray-500 w-36 shrink-0">Blocked</span>
                          <span className={`font-medium ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedUser.isBlocked ? 'Yes ✗' : 'No ✓'}
                          </span>
                          {selectedUser.isBlocked ? (
                            <button
                              onClick={() => handleDetailAction(selectedUser._id, 'unblock')}
                              className="ml-auto text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDetailAction(selectedUser._id, 'block')}
                              className="ml-auto text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Block
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2.5">
                          <span className="text-gray-500 w-36 shrink-0">Loyalty Points</span>
                          <span className="font-medium text-gray-900">{selectedUser.loyaltyPoints || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Saved Addresses */}
                    {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Saved Addresses ({selectedUser.addresses.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedUser.addresses.map((addr: any) => (
                            <div key={addr._id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{addr.fullName}</p>
                                {addr.isDefault && (
                                  <span className="text-xs px-1.5 py-0.5 bg-black text-white rounded">Default</span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">{addr.houseNumber}, {addr.street}</p>
                              <p className="text-gray-500 text-xs">{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-gray-400 text-xs mt-1">📞 {addr.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CART */}
                {activeTab === 'cart' && (
                  cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <ShoppingBag size={36} className="opacity-30 mb-2" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                          {item.product?.thumbnail?.url && (
                            <img src={item.product.thumbnail.url} alt={item.product?.name} className="w-14 h-14 object-cover rounded-lg border" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-gray-400 text-xs mt-0.5">Size: {item.variant?.size || '-'} • Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900 shrink-0">
                            ₹{((item.product?.pricing?.basePrice || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900 text-base">
                          ₹{cartItems.reduce((s: number, i: any) => s + ((i.product?.pricing?.basePrice || 0) * i.quantity), 0).toLocaleString()}
                        </span></p>
                      </div>
                    </div>
                  )
                )}

                {/* WISHLIST */}
                {activeTab === 'wishlist' && (
                  wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Heart size={36} className="opacity-30 mb-2" />
                      <p className="text-sm">Wishlist is empty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {wishlistItems.map((item: any) => (
                        <div key={item._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <img
                            src={item.thumbnail?.url || 'https://via.placeholder.com/200'}
                            alt={item.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-2.5">
                            <p className="font-medium text-gray-900 text-xs truncate">{item.name}</p>
                            <p className="text-gray-400 text-xs mt-0.5">₹{item.pricing?.basePrice?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                  orderHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Package size={36} className="opacity-30 mb-2" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orderHistory.map((order: any) => (
                        <div key={order._id} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-medium text-gray-900">#{order.orderNumber || order._id?.slice(-8)}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                          <p className="font-bold text-gray-900 text-sm shrink-0">
                            ₹{order.pricing?.total?.toLocaleString() || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Empty right panel prompt */}
      {!selectedId && (
        <div className="flex-1 hidden lg:flex items-center justify-center text-gray-300 flex-col gap-3">
          <UserIcon size={48} className="opacity-30" />
          <p className="text-sm">Select a customer to view their details</p>
        </div>
      )}
    </div>
  );
}
