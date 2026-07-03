import { FileText, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Reports() {
  const handleExport = (type: 'orders' | 'inventory') => {
    window.location.href = `${API_URL}/dashboard/export/${type}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-gray-900" /> Reports & Exports
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-48 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Orders Export</h2>
          <p className="text-sm text-gray-500 mb-6">Download a complete CSV of all orders including customer details, totals, and statuses.</p>
          <button onClick={() => handleExport('orders')} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
            <ArrowDown size={18} /> Export Orders CSV
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-48 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Inventory Export</h2>
          <p className="text-sm text-gray-500 mb-6">Download a complete CSV of current inventory levels, variants, and stock status.</p>
          <button onClick={() => handleExport('inventory')} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
            <ArrowDown size={18} /> Export Inventory CSV
          </button>
        </div>
      </div>
    </div>
  );
}
