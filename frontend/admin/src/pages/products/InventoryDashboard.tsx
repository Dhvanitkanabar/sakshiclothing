import { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function InventoryDashboard() {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products/admin/low-stock`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLowStock(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.location.href = `${API_URL}/dashboard/export/inventory`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-gray-900" /> Inventory Overview
        </h1>
        <button onClick={handleExport} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
          <ArrowDown size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" />
          <h2 className="font-bold text-gray-900">Low Stock Alerts (≤ 10 items)</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Product Name</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Variant (Size/Color)</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Stock Left</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : lowStock.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No low stock items</td></tr>
            ) : lowStock.map(p => (
              <tr key={p.variants._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-gray-500">{p.variants.size} / {p.variants.color}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${p.variants.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.variants.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {p.variants.stock === 0 ? (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700 uppercase tracking-wider">Out of Stock</span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">Low Stock</span>
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
