import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = () => {
    setLoading(true);
    fetch(`${API_URL}/coupons/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCoupons(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Delete this coupon?')) {
      fetch(`${API_URL}/coupons/admin/${id}`, { method: 'DELETE', credentials: 'include' })
        .then(() => fetchCoupons());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="text-gray-900" /> Coupons
        </h1>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium">
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Code</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Discount</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Usage</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Expiry Date</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No coupons found</td></tr>
            ) : coupons.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider">{c.code}</td>
                <td className="px-6 py-4 text-gray-500">
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {c.usedCount} / {c.usageLimit || '∞'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(c.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {c.isActive && new Date(c.expiryDate) > new Date() ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
