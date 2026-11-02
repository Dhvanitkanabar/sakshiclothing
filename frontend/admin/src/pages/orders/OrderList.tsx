import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, Search, Filter, Download, Clock, History, PackageCheck } from 'lucide-react';
import { adminFetch } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  packed: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  dispatched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_transit: 'bg-blue-50 text-blue-700 border-blue-200',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  outForDelivery: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
  refunded: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  pending_approval: 'Pending Approval',
  confirmed: 'Confirmed & Approved',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  outForDelivery: 'Out for Delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

interface OrderListProps {
  defaultSection?: 'pending' | 'history';
}

const OrderList = ({ defaultSection }: OrderListProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHistoryRoute = location.pathname.includes('history') || defaultSection === 'history';
  const [activeSection, setActiveSection] = useState<'pending' | 'history'>(isHistoryRoute ? 'history' : 'pending');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (location.pathname.includes('history') || defaultSection === 'history') {
      setActiveSection('history');
    } else {
      setActiveSection('pending');
    }
    setStatusFilter('all');
  }, [location.pathname, defaultSection]);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const res = await adminFetch(`${API_URL}/orders/admin/all`);
      const data = await res.json();
      if (data.success) {
        const orderList = Array.isArray(data.data)
          ? data.data
          : (data.data?.orders || data.data?.data || []);
        setOrders(orderList);
      } else if (!isSilent) {
        setError(data.message || 'Failed to load orders');
      }
    } catch {
      if (!isSilent) setError('Network error fetching orders');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Auto-poll every 4 seconds for instant two-way synchronization
    const timer = setInterval(() => {
      fetchOrders(true);
    }, 4000);

    const onFocus = () => fetchOrders(true);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sakshi_order_sync');
      channel.onmessage = () => {
        fetchOrders(true);
      };
    } catch {}

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
      try { channel?.close(); } catch {}
    };
  }, [fetchOrders]);

  const getEffectiveStatus = useCallback((order: any) => {
    if (order.orderStatus === 'rejected' || order.approvalStatus === 'rejected') return 'rejected';
    if (order.orderStatus === 'confirmed' || order.approvalStatus === 'approved') {
      if (order.orderStatus === 'pending_approval' || order.orderStatus === 'pending') return 'confirmed';
    }
    return order.orderStatus || 'pending';
  }, []);

  const getOrderTotalItems = useCallback((order: any) => {
    const list = (order.products && order.products.length > 0)
      ? order.products
      : (order.items && order.items.length > 0 ? order.items : []);
    if (!list.length) return 0;
    return list.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
  }, []);

  // Helper to determine if an order is genuinely placed and valid to display
  const isOrderPlaced = useCallback((order: any) => {
    // Online orders must have completed payment. COD orders can be pending until cash is collected on delivery.
    if (order.orderStatus === 'payment_pending') return false;
    const isPaid = order.paymentStatus === 'completed';
    const isCod = order.payment?.method === 'cod';
    return isPaid || isCod;
  }, []);

  // Delivered & completed orders belong strictly to Order History
  const pendingOrders = useMemo(() => {
    return orders.filter(o => {
      if (!isOrderPlaced(o)) return false;
      const eff = getEffectiveStatus(o);
      return !['delivered', 'rejected', 'cancelled', 'returned', 'refunded'].includes(eff);
    });
  }, [orders, getEffectiveStatus, isOrderPlaced]);

  const historyOrders = useMemo(() => {
    return orders.filter(o => {
      if (!isOrderPlaced(o)) return false;
      const eff = getEffectiveStatus(o);
      return ['delivered', 'rejected', 'cancelled', 'returned', 'refunded'].includes(eff);
    });
  }, [orders, getEffectiveStatus, isOrderPlaced]);

  const baseOrders = useMemo(() => {
    return activeSection === 'pending' ? pendingOrders : historyOrders;
  }, [activeSection, pendingOrders, historyOrders]);

  const filtered = useMemo(() => {
    let result = baseOrders;
    if (statusFilter !== 'all') {
      result = result.filter(o => {
        const eff = getEffectiveStatus(o);
        return eff === statusFilter || o.orderStatus === statusFilter;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [baseOrders, statusFilter, search, getEffectiveStatus]);

  const handleExportCSV = () => {
    const rows = [
      ['Order Number', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status'],
      ...filtered.map(o => {
        const eff = getEffectiveStatus(o);
        return [
          o.orderNumber,
          o.customer?.fullName || '',
          o.customer?.email || '',
          new Date(o.createdAt).toLocaleDateString(),
          getOrderTotalItems(o),
          o.totals?.grandTotal,
          eff
        ];
      })
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSection === 'pending' ? 'pending-orders' : 'order-history'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeSection === 'pending' ? 'Pending & Active Orders' : 'Order History'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {activeSection === 'pending'
              ? 'Active orders undergoing authenticity audit, packing, and courier dispatch. When delivered, orders automatically move to Order History.'
              : 'Archive of all delivered shipments and completed customer orders.'}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-xs"
        >
          <Download size={16} /> Export {activeSection === 'pending' ? 'Pending' : 'History'} CSV
        </button>
      </div>

      {/* ── Two-Section Tab Switcher ── */}
      <div className="flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveSection('pending');
            setStatusFilter('all');
            navigate('/orders');
          }}
          className={`flex items-center gap-2.5 pb-3.5 px-3 text-sm font-bold border-b-2 transition-all ${
            activeSection === 'pending'
              ? 'border-amber-600 text-amber-950 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Clock size={16} className={activeSection === 'pending' ? 'text-amber-600' : 'text-gray-400'} />
          <span>Pending & Active Orders</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-bold ${
              activeSection === 'pending'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {pendingOrders.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSection('history');
            setStatusFilter('all');
            navigate('/order-history');
          }}
          className={`flex items-center gap-2.5 pb-3.5 px-3 text-sm font-bold border-b-2 transition-all ${
            activeSection === 'history'
              ? 'border-emerald-600 text-emerald-950 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <History size={16} className={activeSection === 'history' ? 'text-emerald-600' : 'text-gray-400'} />
          <span>Order History (Delivered & Completed)</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-bold ${
              activeSection === 'history'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {historyOrders.length}
          </span>
        </button>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeSection === 'pending' ? 'pending orders' : 'order history'} by ID, customer name, email...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white font-medium"
          >
            {activeSection === 'pending' ? (
              <>
                <option value="all">All Pending / Active ({pendingOrders.length})</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed & Approved</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="dispatched">Dispatched</option>
                <option value="shipped">Shipped</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
              </>
            ) : (
              <>
                <option value="all">All Order History ({historyOrders.length})</option>
                <option value="delivered">Delivered</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
                <option value="refunded">Refunded</option>
              </>
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Loading {activeSection === 'pending' ? 'pending orders' : 'order history'}…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                      {activeSection === 'pending' ? (
                        <>
                          <PackageCheck size={36} className="text-emerald-500 stroke-1" />
                          <p className="font-semibold text-gray-800 text-base">No pending orders in the queue</p>
                          <p className="text-xs text-gray-400 max-w-sm">All customer orders have been delivered or archived and moved to Order History.</p>
                        </>
                      ) : (
                        <>
                          <History size={36} className="text-gray-300 stroke-1" />
                          <p className="font-semibold text-gray-800 text-base">No completed order records</p>
                          <p className="text-xs text-gray-400 max-w-sm">Delivered and completed orders will appear here automatically.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-sm font-sans font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.customer?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{order.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{getOrderTotalItems(order)}</span> item(s)
                    {(order.products?.length > 1 || (order.products?.length === 1 && getOrderTotalItems(order) > 1)) && (
                      <span className="text-[11px] text-gray-400 block font-normal">
                        ({order.products?.length || 1} product{order.products?.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-bold text-gray-900 block">
                      ₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}
                    </span>
                    {order.paymentStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                        ✓ Paid ({order.payment?.method || 'Online'})
                      </span>
                    ) : order.payment?.method === 'cod' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                        Cash on Delivery
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const effectiveStatus = getEffectiveStatus(order);
                      const colorCls = STATUS_COLORS[effectiveStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
                      const label = STATUS_LABELS[effectiveStatus] || effectiveStatus.replace(/_/g, ' ');

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs ${colorCls}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      to={`/orders/${order._id}`}
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg hover:text-black transition-all shadow-xs"
                      title="Inspect address, live coordinates & update status"
                    >
                      <Eye size={13} className="text-gray-500" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap justify-between items-center gap-2">
            <span>
              Showing {filtered.length} of {baseOrders.length} {activeSection === 'pending' ? 'pending' : 'completed'} orders
            </span>
            <span className="text-[11px] text-gray-400">
              {activeSection === 'pending'
                ? 'Delivered orders automatically move to Order History'
                : 'Archived order history records'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
