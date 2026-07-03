import { useState, useEffect } from 'react';
import { Bell, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info', link: '' });

  const fetchNotifications = () => {
    setLoading(true);
    fetch(`${API_URL}/notifications/admin`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_URL}/notifications/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    }).then(() => {
      setFormData({ title: '', message: '', type: 'info', link: '' });
      fetchNotifications();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Send className="text-gray-900" /> Push Notification
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-black" rows={3} required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-black">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Link (Optional)</label>
              <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-black" />
            </div>
            <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">Send Broadcast</button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="text-gray-900" /> Recent Broadcasts
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Notification</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan={3} className="p-6 text-center text-gray-500">No broadcasts found</td></tr>
              ) : notifications.map(n => (
                <tr key={n._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{n.message}</p>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{n.type}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
