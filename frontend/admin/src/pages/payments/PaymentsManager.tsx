import { useState, useEffect } from 'react';
import { Search, RefreshCcw, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PaymentsManager = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (statusFilter) query.append('status', statusFilter);
      if (gatewayFilter) query.append('gateway', gatewayFilter);

      const res = await fetch(`${API_URL}/payments?${query.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments);
      }
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, gatewayFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleRefund = async (paymentId: string) => {
    if (!paymentId || !confirm('Are you sure you want to initiate a refund for this payment?')) return;
    toast.info('Refund initiation is a placeholder in this version.');
    // In a real app, you would call the refund API here.
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Payment Gateway</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all customer transactions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </form>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="cod">COD</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button onClick={fetchPayments} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Payment ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No payments found.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-900">{payment.gatewayOrderId || payment._id}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{payment.customer?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{payment.customer?.email || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-gray-600">{payment.order?.orderNumber || 'N/A'}</td>
                    <td className="p-4 capitalize">{payment.gateway}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {payment.currency === 'USD' ? '$' : '₹'}{payment.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                        payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefund(payment._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Initiate Refund"
                        >
                          <RefreshCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManager;
