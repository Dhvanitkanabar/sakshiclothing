import { useState, useEffect } from 'react';
import { Award, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function LoyaltyDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ userId: '', points: 0, description: '' });

  const fetchTransactions = () => {
    setLoading(true);
    fetch(`${API_URL}/loyalty/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTransactions(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_URL}/loyalty/admin/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adjustData),
      credentials: 'include'
    }).then(() => {
      setShowAdjustModal(false);
      setAdjustData({ userId: '', points: 0, description: '' });
      fetchTransactions();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="text-gray-900" /> Loyalty Program
        </h1>
        <button onClick={() => setShowAdjustModal(true)} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium">
          <Plus size={18} /> Adjust Points
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Points</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Description</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No transactions found</td></tr>
            ) : transactions.map(t => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{t.user?.fullName || 'Unknown User'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    t.type === 'earned' ? 'bg-green-100 text-green-700' : 
                    t.type === 'redeemed' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {t.points > 0 ? `+${t.points}` : t.points}
                </td>
                <td className="px-6 py-4 text-gray-500">{t.description || '-'}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Adjust Loyalty Points</h2>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input type="text" value={adjustData.userId} onChange={e => setAdjustData({...adjustData, userId: e.target.value})} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points (use negative to deduct)</label>
                <input type="number" value={adjustData.points} onChange={e => setAdjustData({...adjustData, points: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={adjustData.description} onChange={e => setAdjustData({...adjustData, description: e.target.value})} className="w-full p-2 border rounded-lg" required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Submit Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
