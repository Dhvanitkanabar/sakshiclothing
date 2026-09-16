import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, ShieldCheck, ShieldX, ShoppingBag, Heart, Package, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cart' | 'wishlist' | 'orders' | 'addresses'>('overview');

  useEffect(() => {
    fetch(`${API_URL}/users/admin/${id}/details`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Customer not found.</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-blue-600 hover:underline">Back to Customers</button>
      </div>
    );
  }

  const { user, orderHistory = [] } = data;
  const cartItems = user?.cart?.items || [];
  const wishlistItems = user?.wishlist || [];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'addresses', label: `Addresses (${user.addresses?.length || 0})`, icon: MapPin },
    { key: 'cart', label: `Cart (${cartItems.length})`, icon: ShoppingBag },
    { key: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
    { key: 'orders', label: `Orders (${orderHistory.length})`, icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {user.isBlocked ? (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
              <ShieldX size={14} /> Blocked
            </span>
          ) : (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <ShieldCheck size={14} /> Active
            </span>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{orderHistory.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cart Items</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{cartItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Wishlist Items</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{wishlistItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Loyalty Points</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{user.loyaltyPoints || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Profile Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-500">Full Name:</span>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-500">Member since:</span>
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-500">Addresses:</span>
                    <span className="font-medium">{user.addresses?.length || 0} saved</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Account Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Role', value: user.role },
                    { label: 'Email Verified', value: user.isEmailVerified ? 'Yes' : 'No' },
                    { label: 'Account Active', value: user.isActive ? 'Yes' : 'No' },
                    { label: 'Blocked', value: user.isBlocked ? 'Yes' : 'No' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">{item.label}:</span>
                      <span className="font-medium capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="text-center py-12 text-gray-400">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No saved addresses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr: any) => (
                    <div key={addr._id || addr.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {addr.fullAddress || `${addr.houseNumber || ''} ${addr.street || ''}, ${addr.area || addr.city || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`}
                      </p>
                      {addr.phone && <p className="text-xs text-gray-500 pt-1">Phone: {addr.phone}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div>
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="pb-3 font-semibold text-gray-700">Product</th>
                      <th className="pb-3 font-semibold text-gray-700">Size</th>
                      <th className="pb-3 font-semibold text-gray-700">Qty</th>
                      <th className="pb-3 font-semibold text-gray-700">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cartItems.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-3 flex items-center gap-3">
                          {item.product?.thumbnail?.url && (
                            <img
                              src={item.product.thumbnail.url}
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          )}
                          <span className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</span>
                        </td>
                        <td className="py-3 text-gray-500">{item.variant?.size || '-'}</td>
                        <td className="py-3 text-gray-700 font-medium">{item.quantity}</td>
                        <td className="py-3 font-semibold text-gray-900">
                          ₹{((item.product?.pricing?.basePrice || 0) * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Heart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Wishlist is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistItems.map((item: any) => (
                    <div key={item._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={item.thumbnail?.url || 'https://via.placeholder.com/200'}
                        alt={item.name}
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-3">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs mt-1">₹{item.pricing?.basePrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {orderHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No orders placed yet</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="pb-3 font-semibold text-gray-700">Order #</th>
                      <th className="pb-3 font-semibold text-gray-700">Date</th>
                      <th className="pb-3 font-semibold text-gray-700">Status</th>
                      <th className="pb-3 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orderHistory.map((order: any) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="py-3 font-mono text-gray-700">{order.orderNumber || order._id?.slice(-8)}</td>
                        <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-gray-900">₹{order.pricing?.total?.toLocaleString() || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
