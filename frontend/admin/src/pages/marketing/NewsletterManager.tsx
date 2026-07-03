import { useState, useEffect } from 'react';
import { Mail, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/newsletter/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubscribers(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.location.href = `${API_URL}/newsletter/export`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="text-gray-900" /> Newsletter Subscribers
        </h1>
        <button onClick={handleExport} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium">
          <ArrowDown size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Email Address</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Subscribed Date</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No subscribers found</td></tr>
            ) : subscribers.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.email}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(s.subscribedAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                  {s.isActive ? (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 uppercase tracking-wider">Subscribed</span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 uppercase tracking-wider">Unsubscribed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
