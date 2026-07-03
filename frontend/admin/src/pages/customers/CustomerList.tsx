import { useState, useEffect } from 'react';
import { Search, ShieldBan, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_URL}/users/admin/all?search=${search}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomers(data.data.customers);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAction = (id: string, action: 'block' | 'unblock' | 'deactivate') => {
    fetch(`${API_URL}/users/admin/${id}/${action}`, { method: 'PATCH', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchCustomers();
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Joined</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No customers found</td></tr>
            ) : customers.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{c.fullName}</td>
                <td className="px-6 py-4 text-gray-500">{c.email}</td>
                <td className="px-6 py-4">
                  {c.isBlocked ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Blocked</span>
                  ) : !c.isActive ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Inactive</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex gap-2">
                  {c.isBlocked ? (
                    <button onClick={() => handleAction(c._id, 'unblock')} className="text-green-600 hover:bg-green-50 p-2 rounded-lg" title="Unblock">
                      <ShieldAlert size={18} />
                    </button>
                  ) : (
                    <button onClick={() => handleAction(c._id, 'block')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Block">
                      <ShieldBan size={18} />
                    </button>
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
