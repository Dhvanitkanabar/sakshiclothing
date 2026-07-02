import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, Package, TrendingUp,
  Clock, CheckCircle, XCircle, IndianRupee, ArrowUpRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const StatCard = ({
  label, value, icon: Icon, color, prefix = '', suffix = ''
}: {
  label: string; value: string | number; icon: any; color: string; prefix?: string; suffix?: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</p>
    </div>
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  outForDelivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-600',
  refunded: 'bg-gray-100 text-gray-500',
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  const s = data?.stats || {};
  const recent = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Revenue" value={s.revenueTotal || 0} icon={IndianRupee} color="bg-gray-900" prefix="₹" />
        <StatCard label="Revenue Today" value={s.revenueToday || 0} icon={TrendingUp} color="bg-emerald-500" prefix="₹" />
        <StatCard label="Total Orders" value={s.totalOrders || 0} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard label="Pending Orders" value={s.pendingOrders || 0} icon={Clock} color="bg-amber-500" />
        <StatCard label="Delivered" value={s.deliveredOrders || 0} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Cancelled" value={s.cancelledOrders || 0} icon={XCircle} color="bg-red-400" />
        <StatCard label="Customers" value={s.totalCustomers || 0} icon={Users} color="bg-violet-500" />
        <StatCard label="Active Products" value={s.totalProducts || 0} icon={Package} color="bg-indigo-500" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link to="/orders" className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['Order ID', 'Customer', 'Date', 'Total', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No orders yet</td>
                </tr>
              ) : recent.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{o.customer?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{o.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    ₹{(o.totals?.grandTotal || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[o.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o._id}`} className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
