import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, Tag, ImageIcon, Search, Filter, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products?limit=50`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await fetch(`${API_URL}/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#090D16] p-8 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest font-bold mb-1">
            <Sparkles size={14} /> Catalog Management
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white">Maison Products</h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">Manage luxury items, inventory levels, variants, and pricing.</p>
        </div>
        <Link
          to="/products/add"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs uppercase tracking-wider self-start md:self-auto"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow-xl shadow-slate-100/80 border border-slate-100 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => (
                  <tr key={product._id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-4">
                      {product.thumbnail?.url ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-xs">
                          <img src={product.thumbnail.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300">
                          <ImageIcon size={22} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                        <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                          <Tag size={12} /> {product.category?.name || 'Jewellery & Apparel'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(product._id, product.status)}
                        title={`Click to switch to ${product.status === 'published' ? 'draft' : 'published'}`}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          product.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100' :
                          product.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100' :
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {product.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-slate-900 text-sm">
                      ₹{product.pricing?.basePrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg text-xs ${
                        (product.inventory?.totalStock || 0) < 10 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-800'
                      }`}>
                        <Package size={13} /> {product.inventory?.totalStock || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
}
